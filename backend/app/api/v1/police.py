"""Police station lookup endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.spatial import PoliceStation
from app.services.geo_service import get_nearest_police_stations, get_driving_route_and_eta

router = APIRouter(prefix="/police")


@router.get("/nearest")
async def nearest_police(
    lat: float = Query(..., description="Crash latitude"),
    lng: float = Query(..., description="Crash longitude"),
    limit: int = Query(default=4),
    db: AsyncSession = Depends(get_db_session),
):
    ranked = await get_nearest_police_stations(db, lat, lng, limit=limit)
    results = []
    for dist_km, p in ranked:
        route = await get_driving_route_and_eta(lat, lng, p.lat, p.lng)
        results.append({
            "id": p.id,
            "name": p.name,
            "division": p.division,
            "address": p.address,
            "lat": p.lat,
            "lng": p.lng,
            "phone": p.phone,
            "activeInterceptors": p.active_interceptors,
            "pcrCode": p.pcr_code,
            "city": p.city,
            "distanceKm": round(dist_km, 2),
            "drivingDistanceKm": route["driving_distance_km"],
            "etaMinutes": route["eta_minutes"],
        })
    nearest = results[0] if results else None
    return {
        "status": "SUCCESS",
        "crashCoordinates": {"lat": lat, "lng": lng},
        "nearestPolice": nearest,
        "candidatePoliceStations": results,
    }


@router.get("/all")
async def get_all_police(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(select(PoliceStation))
    stations = result.scalars().all()
    return {
        "status": "SUCCESS",
        "count": len(stations),
        "data": [
            {"id": p.id, "name": p.name, "lat": p.lat, "lng": p.lng, "phone": p.phone, "city": p.city}
            for p in stations
        ],
    }

