"""User model with RBAC roles."""

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

ROLE_CHOICES = ("SUPER_ADMIN", "HOSPITAL_ER", "POLICE_CONTROL", "VEHICLE_OWNER", "GUARDIAN_PUBLIC")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="VEHICLE_OWNER")
    full_name: Mapped[str] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # relationships
    vehicles: Mapped[list["Vehicle"]] = relationship(back_populates="owner", lazy="select")  # noqa
    medical_profiles: Mapped[list["MedicalProfile"]] = relationship(back_populates="user", lazy="select")  # noqa
