"""ABHA medical profile and emergency contacts."""

from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class MedicalProfile(Base, TimestampMixin):
    __tablename__ = "medical_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[str] = mapped_column(String(20), nullable=True)
    abha_id: Mapped[str] = mapped_column(String(100), nullable=True)
    emergency_notes: Mapped[str] = mapped_column(Text, nullable=True)
    allergies: Mapped[str] = mapped_column(Text, nullable=True)
    medical_conditions: Mapped[str] = mapped_column(Text, nullable=True)
    primary_physician_name: Mapped[str] = mapped_column(String(200), nullable=True)
    primary_physician_phone: Mapped[str] = mapped_column(String(30), nullable=True)
    organ_donor: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="medical_profiles")  # noqa
    emergency_contacts: Mapped[list["EmergencyContact"]] = relationship(back_populates="profile", lazy="select")  # noqa


class EmergencyContact(Base, TimestampMixin):
    __tablename__ = "emergency_contacts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("medical_profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    relation: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    notify_sms: Mapped[bool] = mapped_column(Boolean, default=True)

    profile: Mapped["MedicalProfile"] = relationship(back_populates="emergency_contacts")  # noqa
