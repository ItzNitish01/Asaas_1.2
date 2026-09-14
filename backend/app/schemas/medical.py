"""Pydantic schemas for medical profiles and emergency contacts."""

from pydantic import BaseModel
from typing import Optional, List


class EmergencyContactIn(BaseModel):
    name: str
    relation: Optional[str] = None
    phone: str
    is_primary: bool = False
    notify_sms: bool = True


class EmergencyContactOut(EmergencyContactIn):
    id: int

    class Config:
        from_attributes = True


class MedicalProfileIn(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    abha_id: Optional[str] = None
    emergency_notes: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    primary_physician_name: Optional[str] = None
    primary_physician_phone: Optional[str] = None
    organ_donor: bool = False


class MedicalProfileOut(MedicalProfileIn):
    id: int
    user_id: int
    emergency_contacts: List[EmergencyContactOut] = []

    class Config:
        from_attributes = True
