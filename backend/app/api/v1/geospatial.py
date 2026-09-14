"""Geospatial legacy endpoint (/api/v1/geospatial/nearest) for frontend compatibility."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.services.geo_service import (
    get_nearest_hospitals, get_nearest_police_stations, get_driving_route_and_eta
)

router = APIRouter(prefix="/geospatial")


@router.get("/nearest")
async def nearest_facilities(
    lat: float = Query(default=28.4595),
    lng: float = Query(default=77.0266),
    db: AsyncSession = Depends(get_db_session),
):
    """Combined nearest hospital + police lookup (preserves original Node API contract)."""
    hospital_list = await get_nearest_hospitals(db, lat, lng, limit=4)
    police_list = await get_nearest_police_stations(db, lat, lng, limit=4)

    hosp_results = []
    for dist_km, h in hospital_list:
        route = await get_driving_route_and_eta(lat, lng, h.lat, h.lng)
        hosp_results.append({
            "id": h.id, "name": h.name, "lat": h.lat, "lng": h.lng,
            "phone": h.phone, "distanceKm": round(dist_km, 2),
            "drivingDistanceKm": route["driving_distance_km"],
            "etaMinutes": route["eta_minutes"],
            "totalIcuBeds": h.total_icu_beds,
            "availableIcuBeds": h.available_icu_beds,
            "bloodBankStatus": h.blood_bank_status,
        })

    pol_results = []
    for dist_km, p in police_list:
        route = await get_driving_route_and_eta(lat, lng, p.lat, p.lng)
        pol_results.append({
            "id": p.id, "name": p.name, "lat": p.lat, "lng": p.lng,
            "phone": p.phone, "distanceKm": round(dist_km, 2),
            "drivingDistanceKm": route["driving_distance_km"],
            "etaMinutes": route["eta_minutes"],
            "activeInterceptors": p.active_interceptors,
        })

    return {
        "status": "SUCCESS",
        "crashCoordinates": {"lat": lat, "lng": lng},
        "nearestHospital": hosp_results[0] if hosp_results else None,
        "nearestPolice": pol_results[0] if pol_results else None,
        "candidateHospitals": hosp_results,
        "candidatePoliceStations": pol_results,
    }


@router.get("/facilities")
async def all_facilities(db: AsyncSession = Depends(get_db_session)):
    hospital_list = await get_nearest_hospitals(db, 0, 0, limit=1000)
    police_list = await get_nearest_police_stations(db, 0, 0, limit=1000)
    return {
        "status": "SUCCESS",
        "hospitals": [{"id": h.id, "name": h.name, "lat": h.lat, "lng": h.lng} for _, h in hospital_list],
        "policeStations": [{"id": p.id, "name": p.name, "lat": p.lat, "lng": p.lng} for _, p in police_list],
    }

