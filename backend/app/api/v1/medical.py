"""Medical profile and emergency contact endpoints (RBAC protected)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.core.security import get_current_user, require_hospital
from app.models.medical import MedicalProfile, EmergencyContact
from app.models.user import User
from app.schemas.medical import MedicalProfileIn, MedicalProfileOut, EmergencyContactIn, EmergencyContactOut

router = APIRouter(prefix="/medical")


@router.get("/profile", response_model=MedicalProfileOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    result = await db.execute(
        select(MedicalProfile).where(MedicalProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Medical profile not found")
    return profile


@router.put("/profile", response_model=MedicalProfileOut)
async def update_my_profile(
    body: MedicalProfileIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    result = await db.execute(
        select(MedicalProfile).where(MedicalProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = MedicalProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.flush()
    await db.refresh(profile)
    return profile


@router.post("/contacts", response_model=EmergencyContactOut, status_code=201)
async def add_emergency_contact(
    body: EmergencyContactIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    result = await db.execute(
        select(MedicalProfile).where(MedicalProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Create a medical profile first")

    contact = EmergencyContact(
        profile_id=profile.id,
        name=body.name,
        relation=body.relation,
        phone=body.phone,
        is_primary=body.is_primary,
        notify_sms=body.notify_sms,
    )
    db.add(contact)
    await db.flush()
    await db.refresh(contact)
    return contact


@router.get("/contacts")
async def get_emergency_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    result = await db.execute(
        select(MedicalProfile).where(MedicalProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return {"status": "SUCCESS", "data": []}
    result = await db.execute(
        select(EmergencyContact).where(EmergencyContact.profile_id == profile.id)
    )
    contacts = result.scalars().all()
    return {"status": "SUCCESS", "data": [
        {"id": c.id, "name": c.name, "relation": c.relation, "phone": c.phone,
         "isPrimary": c.is_primary, "notifySms": c.notify_sms}
        for c in contacts
    ]}

