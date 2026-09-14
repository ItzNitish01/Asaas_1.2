"""Shared timestamp mixin and base re-export."""

from datetime import datetime, timezone
from sqlalchemy import DateTime, func
from sqlalchemy.orm import mapped_column, MappedColumn
from app.core.database import Base  # noqa: re-export


class TimestampMixin:
    """Adds created_at / updated_at to any model."""
    created_at: MappedColumn[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: MappedColumn[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
