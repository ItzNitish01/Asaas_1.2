"""Legacy registry endpoints for frontend backward-compatibility."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.vehicle import Vehicle
from app.models.medical import MedicalProfile, EmergencyContact

router = APIRouter(prefix="/registry")


@router.get("/vehicles")
async def get_vehicles(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    return {"status": "SUCCESS", "data": [
        {
            "id": v.id, "name": v.name,
            "registrationNumber": v.registration_number,
            "deviceId": v.device_id,
            "driverName": v.driver_name,
            "bloodGroup": v.blood_group,
        }
        for v in vehicles
    ]}


@router.get("/medical")
async def get_medical(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(MedicalProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        return {"status": "SUCCESS", "data": None}
    return {"status": "SUCCESS", "data": {
        "fullName": profile.full_name,
        "age": profile.age,
        "gender": profile.gender,
        "bloodGroup": profile.blood_group,
        "abhaId": profile.abha_id,
        "allergies": profile.allergies,
        "medicalConditions": profile.medical_conditions,
        "primaryPhysicianName": profile.primary_physician_name,
        "primaryPhysicianPhone": profile.primary_physician_phone,
        "organDonor": profile.organ_donor,
    }}


@router.get("/contacts")
async def get_contacts(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(EmergencyContact))
    contacts = result.scalars().all()
    return {"status": "SUCCESS", "data": [
        {
            "id": c.id, "name": c.name, "relation": c.relation,
            "phone": c.phone, "isPrimary": c.is_primary, "notifySms": c.notify_sms,
        }
        for c in contacts
    ]}

