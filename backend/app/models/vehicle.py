"""Vehicle + ESP32 device pairing model."""

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    registration_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    device_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=True, index=True)
    vehicle_type: Mapped[str] = mapped_column(String(100), nullable=True)
    fuel_type: Mapped[str] = mapped_column(String(50), nullable=True)
    driver_name: Mapped[str] = mapped_column(String(200), nullable=True)
    blood_group: Mapped[str] = mapped_column(String(20), nullable=True)
    insurance_policy: Mapped[str] = mapped_column(String(200), nullable=True)
    api_key: Mapped[str] = mapped_column(String(255), nullable=True, index=True)

    owner: Mapped["User"] = relationship(back_populates="vehicles")  # noqa
    incidents: Mapped[list["Incident"]] = relationship(back_populates="vehicle", lazy="select")  # noqa
    telemetry_logs: Mapped[list["TelemetryLog"]] = relationship(back_populates="vehicle", lazy="select")  # noqa
