"""Hospital lookup endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.spatial import Hospital
from app.services.geo_service import get_nearest_hospitals, get_driving_route_and_eta

router = APIRouter(prefix="/hospitals")


@router.get("/nearest")
async def nearest_hospitals(
    lat: float = Query(..., description="Crash latitude"),
    lng: float = Query(..., description="Crash longitude"),
    limit: int = Query(default=4),
    db: AsyncSession = Depends(get_db_session),
):
    ranked = await get_nearest_hospitals(db, lat, lng, limit=limit)
    results = []
    for dist_km, h in ranked:
        route = await get_driving_route_and_eta(lat, lng, h.lat, h.lng)
        results.append({
            "id": h.id,
            "name": h.name,
            "hospitalType": h.hospital_type,
            "address": h.address,
            "lat": h.lat,
            "lng": h.lng,
            "phone": h.phone,
            "totalIcuBeds": h.total_icu_beds,
            "availableIcuBeds": h.available_icu_beds,
            "bloodBankStatus": h.blood_bank_status,
            "traumaLevel": h.trauma_level,
            "city": h.city,
            "distanceKm": round(dist_km, 2),
            "drivingDistanceKm": route["driving_distance_km"],
            "etaMinutes": route["eta_minutes"],
        })
    nearest = results[0] if results else None
    return {
        "status": "SUCCESS",
        "crashCoordinates": {"lat": lat, "lng": lng},
        "nearestHospital": nearest,
        "candidateHospitals": results,
    }


@router.get("/all")
async def get_all_hospitals(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()
    return {
        "status": "SUCCESS",
        "count": len(hospitals),
        "data": [
            {"id": h.id, "name": h.name, "lat": h.lat, "lng": h.lng, "phone": h.phone, "city": h.city}
            for h in hospitals
        ],
    }

