"""Incident, TelemetryLog, and Dispatch models."""

import json
from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    device_id: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    speed_kmh: Mapped[float] = mapped_column(Float, default=0.0)
    accel_x: Mapped[float] = mapped_column(Float, default=0.0)
    accel_y: Mapped[float] = mapped_column(Float, default=0.0)
    accel_z: Mapped[float] = mapped_column(Float, default=0.0)
    total_g: Mapped[float] = mapped_column(Float, default=0.0)
    pitch_deg: Mapped[float] = mapped_column(Float, default=0.0)
    roll_deg: Mapped[float] = mapped_column(Float, default=0.0)
    lat: Mapped[float] = mapped_column(Float, default=0.0)
    lng: Mapped[float] = mapped_column(Float, default=0.0)
    gps_sats: Mapped[int] = mapped_column(Integer, default=0)
    battery_percent: Mapped[int] = mapped_column(Integer, default=100)
    gsm_dbm: Mapped[int] = mapped_column(Integer, default=-70)
    sos_button: Mapped[str] = mapped_column(String(20), default="RELEASED")
    ts: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    vehicle: Mapped["Vehicle"] = relationship(back_populates="telemetry_logs")  # noqa


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    incident_ref: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    device_id: Mapped[str] = mapped_column(String(100), nullable=True)
    severity: Mapped[str] = mapped_column(String(30), default="HIGH")
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    peak_g_force: Mapped[str] = mapped_column(String(20), nullable=True)
    speed_at_impact: Mapped[str] = mapped_column(String(30), nullable=True)
    location_name: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(Float, nullable=True)
    lng: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Emergency Active")
    ai_severity_score: Mapped[int] = mapped_column(Integer, default=0)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=True)
    patient_snapshot: Mapped[str] = mapped_column(Text, nullable=True)  # JSON blob
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="incidents")  # noqa
    dispatch: Mapped["Dispatch"] = relationship(back_populates="incident", uselist=False, lazy="select")  # noqa

    @property
    def patient_data(self) -> dict:
        if self.patient_snapshot:
            try:
                return json.loads(self.patient_snapshot)
            except Exception:
                return {}
        return {}


class Dispatch(Base, TimestampMixin):
    __tablename__ = "dispatches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Hospital dispatch
    hospital_name: Mapped[str] = mapped_column(String(300), nullable=True)
    hospital_lat: Mapped[float] = mapped_column(Float, nullable=True)
    hospital_lng: Mapped[float] = mapped_column(Float, nullable=True)
    ambulance_status: Mapped[str] = mapped_column(String(50), default="dispatched")
    ambulance_unit: Mapped[str] = mapped_column(String(100), nullable=True)
    ambulance_eta_minutes: Mapped[int] = mapped_column(Integer, default=10)
    icu_bed_number: Mapped[str] = mapped_column(String(50), nullable=True)
    icu_bed_reserved: Mapped[bool] = mapped_column(Boolean, default=True)
    blood_units_reserved: Mapped[int] = mapped_column(Integer, default=2)
    blood_type: Mapped[str] = mapped_column(String(20), nullable=True)

    # Police dispatch
    police_station_name: Mapped[str] = mapped_column(String(300), nullable=True)
    police_lat: Mapped[float] = mapped_column(Float, nullable=True)
    police_lng: Mapped[float] = mapped_column(Float, nullable=True)
    pcr_status: Mapped[str] = mapped_column(String(50), default="dispatched")
    pcr_unit: Mapped[str] = mapped_column(String(100), nullable=True)
    pcr_eta_minutes: Mapped[int] = mapped_column(Integer, default=5)
    green_corridor_active: Mapped[bool] = mapped_column(Boolean, default=True)
    hazard_perimeter_set: Mapped[bool] = mapped_column(Boolean, default=True)
    fir_generated: Mapped[bool] = mapped_column(Boolean, default=True)
    fir_number: Mapped[str] = mapped_column(String(50), nullable=True)
    dispatch_logs: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array

    incident: Mapped["Incident"] = relationship(back_populates="dispatch")  # noqa
