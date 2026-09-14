"""
Dual-engine database layer.
  - If DATABASE_URL is set → PostgreSQL + PostGIS via asyncpg
  - Otherwise            → SQLite via aiosqlite (no Docker required)

Usage:
    from app.core.database import get_session, engine
    async with get_session() as session:
        ...
"""

import os
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.core.config import settings

log = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


def _build_engine_url() -> str:
    """Determine the DB URL: PostgreSQL if DATABASE_URL is set, else SQLite."""
    if settings.database_url and settings.database_url.strip():
        url = settings.database_url.strip()
        # Ensure asyncpg driver is used for postgres
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            
        # Parse and sanitize query parameters for asyncpg
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        new_params = {}

        # Handle SSL: asyncpg expects 'ssl' parameter instead of 'sslmode'
        sslmode = query_params.get("sslmode", [None])[0]
        ssl = query_params.get("ssl", [None])[0]
        if ssl:
            new_params["ssl"] = ssl
        elif sslmode:
            new_params["ssl"] = "require"

        # Pass only parameters supported by asyncpg.connect
        allowed_keys = {"ssl", "timeout", "command_timeout", "statement_cache_size", "target_session_attrs"}
        for k, v in query_params.items():
            if k in allowed_keys and k not in new_params and v:
                new_params[k] = v[0]

        # Reconstruct sanitized URL (strips unsupported libpq params like channel_binding)
        sanitized_query = urlencode(new_params)
        url = urlunparse(parsed._replace(query=sanitized_query))
        
        log.info("[DB] Using PostgreSQL + PostGIS engine")
        return url
    else:
        sqlite_path = os.path.abspath(settings.sqlite_path)
        log.info(f"[DB] DATABASE_URL not set → falling back to SQLite: {sqlite_path}")
        return f"sqlite+aiosqlite:///{sqlite_path}"


_engine_url = _build_engine_url()
_is_sqlite = "sqlite" in _engine_url

engine = create_async_engine(
    _engine_url,
    echo=settings.debug,
    # PostgreSQL-specific: keep connections alive
    **({} if _is_sqlite else {"pool_pre_ping": True, "pool_size": 10, "max_overflow": 20}),
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """Create all tables (runs at startup) and ensure default users exist."""
    async with engine.begin() as conn:
        if not _is_sqlite:
            # Enable PostGIS extension (idempotent; safe fallback if permission restricted)
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            except Exception as e:
                log.info(f"[DB] PostGIS extension notice: {e}")
        from app.models import base  # noqa: ensure all models are imported
        await conn.run_sync(Base.metadata.create_all)
    log.info("[DB] Tables verified / created.")

    # Auto-seed standard users if users table is empty
    try:
        from app.models.user import User
        from app.core.security import hash_password
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User).limit(1))
            if not result.scalar_one_or_none():
                default_users = [
                    User(username="admin", email="admin@asaas.gov.in", hashed_password=hash_password("Admin@1234"), role="SUPER_ADMIN", full_name="ASAAS System Administrator"),
                    User(username="hospital_er", email="er@aiims.ac.in", hashed_password=hash_password("Hospital@1234"), role="HOSPITAL_ER", full_name="Dr. Priya Mehta (ER Chief)"),
                    User(username="police_ctrl", email="pcr@delhipolice.gov.in", hashed_password=hash_password("Police@1234"), role="POLICE_CONTROL", full_name="SI Vikram Nair (PCR Controller)"),
                    User(username="vehicle_owner", email="owner@example.com", hashed_password=hash_password("Owner@1234"), role="VEHICLE_OWNER", full_name="Aaradhya Sharma"),
                    User(username="guardian_user", email="guardian@example.com", hashed_password=hash_password("Guardian@1234"), role="GUARDIAN_PUBLIC", full_name="Sarah Mercer (Family Guardian)"),
                ]
                session.add_all(default_users)
                await session.commit()
                log.info("[DB] Default system users auto-seeded successfully.")
    except Exception as e:
        log.warning(f"[DB] Auto-seed check notice: {e}")


async def close_db() -> None:
    """Close the engine connection pool (runs at shutdown)."""
    await engine.dispose()
    log.info("[DB] Engine disposed.")


@asynccontextmanager
async def get_session():
    """Async context-manager providing a scoped session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_db_session():
    """FastAPI dependency: yields an AsyncSession per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
