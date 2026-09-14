"""
Spatial models for hospitals and police stations.
Uses PostGIS GEOGRAPHY columns when available; plain lat/lng otherwise.
The ORM works with both PostgreSQL and SQLite.
"""

from sqlalchemy import String, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, _is_sqlite
from app.models.base import TimestampMixin

# PostGIS column type - only imported when not SQLite
if not _is_sqlite:
    try:
        from geoalchemy2 import Geography  # type: ignore
        _HAS_GEOALCHEMY = True
    except ImportError:
        _HAS_GEOALCHEMY = False
else:
    _HAS_GEOALCHEMY = False


class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    hospital_type: Mapped[str] = mapped_column(String(200), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    total_icu_beds: Mapped[int] = mapped_column(Integer, default=0)
    available_icu_beds: Mapped[int] = mapped_column(Integer, default=0)
    blood_bank_status: Mapped[str] = mapped_column(String(200), nullable=True)
    trauma_level: Mapped[str] = mapped_column(String(50), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)


class PoliceStation(Base, TimestampMixin):
    __tablename__ = "police_stations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    division: Mapped[str] = mapped_column(String(200), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    active_interceptors: Mapped[int] = mapped_column(Integer, default=0)
    pcr_code: Mapped[str] = mapped_column(String(50), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
