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
from sqlalchemy import text, select

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
    connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0} if not _is_sqlite else {},
    **({} if _is_sqlite else {
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_recycle": 180,
        "pool_timeout": 15
    }),
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """Create all tables (runs at startup) and ensure default data exists."""
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

    # Auto-seed standard tables if empty
    try:
        from app.models.user import User
        from app.models.spatial import Hospital, PoliceStation
        from app.models.vehicle import Vehicle
        from app.models.medical import MedicalProfile, EmergencyContact
        from app.core.security import hash_password

        async with AsyncSessionLocal() as session:
            # 1. Seed Users
            user_check = await session.execute(select(User).limit(1))
            owner_user = user_check.scalar_one_or_none()
            if not owner_user:
                default_users = [
                    User(username="admin", email="admin@asaas.gov.in", hashed_password=hash_password("Admin@1234"), role="SUPER_ADMIN", full_name="ASAAS System Administrator"),
                    User(username="hospital_er", email="er@aiims.ac.in", hashed_password=hash_password("Hospital@1234"), role="HOSPITAL_ER", full_name="Dr. Priya Mehta (ER Chief)"),
                    User(username="police_ctrl", email="pcr@delhipolice.gov.in", hashed_password=hash_password("Police@1234"), role="POLICE_CONTROL", full_name="SI Vikram Nair (PCR Controller)"),
                    User(username="vehicle_owner", email="owner@example.com", hashed_password=hash_password("Owner@1234"), role="VEHICLE_OWNER", full_name="Aaradhya Sharma"),
                    User(username="guardian_user", email="guardian@example.com", hashed_password=hash_password("Guardian@1234"), role="GUARDIAN_PUBLIC", full_name="Sarah Mercer (Family Guardian)"),
                ]
                session.add_all(default_users)
                await session.flush()
                owner_user = default_users[3]
                log.info("[DB] Default system users auto-seeded.")

            # 2. Seed Hospitals
            hosp_check = await session.execute(select(Hospital).limit(1))
            if not hosp_check.scalar_one_or_none():
                hospitals = [
                    Hospital(name="AIIMS Apex Trauma Centre", hospital_type="Apex Level-1 Trauma", address="Ring Road, Safdarjung Enclave, New Delhi", lat=28.5672, lng=77.2100, phone="+91-11-26593333", total_icu_beds=32, available_icu_beds=6, blood_bank_status="Available (All Units)", trauma_level="Level-1", city="New Delhi"),
                    Hospital(name="Safdarjung Hospital Trauma Block", hospital_type="Govt Multispecialty Hospital", address="Ansari Nagar West, New Delhi", lat=28.5701, lng=77.2078, phone="+91-11-26165060", total_icu_beds=24, available_icu_beds=4, blood_bank_status="Available (Critical Stock O-, B+)", trauma_level="Level-1", city="New Delhi"),
                    Hospital(name="Max Smart Super Speciality Hospital", hospital_type="Super Speciality Trauma Center", address="Mandir Marg, Saket, New Delhi", lat=28.5282, lng=77.2120, phone="+91-11-71212121", total_icu_beds=20, available_icu_beds=3, blood_bank_status="Available", trauma_level="Level-2", city="New Delhi"),
                    Hospital(name="Fortis Flt. Lt. Rajan Dhall Hospital", hospital_type="Private Super Speciality", address="Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj", lat=28.5355, lng=77.1510, phone="+91-11-42776222", total_icu_beds=18, available_icu_beds=5, blood_bank_status="Available", trauma_level="Level-2", city="New Delhi"),
                ]
                session.add_all(hospitals)
                log.info("[DB] Default trauma hospitals auto-seeded.")

            # 3. Seed Police Stations
            pol_check = await session.execute(select(PoliceStation).limit(1))
            if not pol_check.scalar_one_or_none():
                stations = [
                    PoliceStation(name="Delhi Police PCR Patrol Unit 14 (Highway Interceptor)", division="South District Traffic", address="NH-48 Corridor Post 4, New Delhi", lat=28.5300, lng=77.1700, phone="112", active_interceptors=8, pcr_code="PCR-H4", city="New Delhi"),
                    PoliceStation(name="Hauz Khas Police Station", division="South District", address="Hauz Khas, New Delhi", lat=28.5494, lng=77.2001, phone="+91-11-26510075", active_interceptors=5, pcr_code="PCR-HK1", city="New Delhi"),
                    PoliceStation(name="Vasant Kunj North Police Station", division="South West District", address="Sector D, Pocket 3, Vasant Kunj, New Delhi", lat=28.5280, lng=77.1580, phone="+91-11-26892530", active_interceptors=6, pcr_code="PCR-VKN2", city="New Delhi"),
                ]
                session.add_all(stations)
                log.info("[DB] Default police stations auto-seeded.")

            # 4. Seed Vehicles & Medical profile for owner
            veh_check = await session.execute(select(Vehicle).limit(1))
            if not veh_check.scalar_one_or_none() and owner_user:
                v = Vehicle(
                    owner_id=owner_user.id,
                    name="Hyundai Creta SX(O) Turbo",
                    registration_number="DL-01-AB-4321",
                    device_id="ASAAS-001",
                    vehicle_type="SUV",
                    fuel_type="Petrol",
                    driver_name="Aaradhya Sharma",
                    blood_group="O+ (Positive)",
                    insurance_policy="HDFC-ERGO-2026-9921",
                    api_key="asaas_key_live_001"
                )
                session.add(v)

                med = MedicalProfile(
                    user_id=owner_user.id,
                    full_name="Aaradhya Sharma",
                    age=28,
                    gender="Female",
                    blood_group="O+ (Positive)",
                    abha_id="91-4829-1029-4821",
                    emergency_notes="Asthma patient. Inhaler stored in driver-side compartment.",
                    allergies="Penicillin, Sulfa drugs",
                    medical_conditions="Mild Asthma",
                    primary_physician_name="Dr. Sunita Kapoor",
                    primary_physician_phone="+91 98111 22334",
                    organ_donor=True
                )
                session.add(med)
                await session.flush()

                c1 = EmergencyContact(profile_id=med.id, name="Rohit Sharma", relation="Spouse", phone="+91 98765 43210", is_primary=True, notify_sms=True)
                c2 = EmergencyContact(profile_id=med.id, name="Dr. Sunita Kapoor", relation="Physician", phone="+91 98111 22334", is_primary=False, notify_sms=True)
                session.add_all([c1, c2])
                log.info("[DB] Default vehicle, medical profile, and emergency contacts auto-seeded.")

            await session.commit()
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
