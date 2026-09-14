"""Vehicle CRUD endpoints."""

import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.core.security import get_current_user
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter(prefix="/vehicles")


@router.get("/")
async def list_vehicles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    if current_user.role == "SUPER_ADMIN":
        result = await db.execute(select(Vehicle))
    else:
        result = await db.execute(select(Vehicle).where(Vehicle.owner_id == current_user.id))
    vehicles = result.scalars().all()
    return {"status": "SUCCESS", "data": [
        {
            "id": v.id, "name": v.name, "registrationNumber": v.registration_number,
            "deviceId": v.device_id, "vehicleType": v.vehicle_type, "fuelType": v.fuel_type,
            "driverName": v.driver_name, "bloodGroup": v.blood_group,
        }
        for v in vehicles
    ]}


@router.post("/", status_code=201)
async def register_vehicle(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    api_key = secrets.token_urlsafe(32)
    vehicle = Vehicle(
        owner_id=current_user.id,
        name=body.get("name"),
        registration_number=body.get("registration_number"),
        device_id=body.get("device_id"),
        vehicle_type=body.get("vehicle_type"),
        fuel_type=body.get("fuel_type"),
        driver_name=body.get("driver_name"),
        blood_group=body.get("blood_group"),
        insurance_policy=body.get("insurance_policy"),
        api_key=api_key,
    )
    db.add(vehicle)
    await db.flush()
    return {"status": "SUCCESS", "message": "Vehicle registered", "vehicle_id": vehicle.id, "api_key": api_key}

