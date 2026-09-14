"""
Geospatial service:
  - Haversine distance calculation
  - OSRM real road routing (with fallback to straight-line ETA)
  - Nearest facility lookup (works with both SQLite and PostGIS)
"""

import math
import logging
from typing import Optional

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.core.config import settings
from app.core.database import _is_sqlite
from app.models.spatial import Hospital, PoliceStation

log = logging.getLogger(__name__)

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine great-circle distance in km."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def get_driving_route_and_eta(
    from_lat: float, from_lng: float, to_lat: float, to_lng: float
) -> dict:
    """
    Call OSRM driving route API. Falls back to straight-line estimate on error.
    Returns: {driving_distance_km, eta_minutes, polyline}
    """
    straight_km = haversine_km(from_lat, from_lng, to_lat, to_lng)
    fallback = {
        "driving_distance_km": round(straight_km * 1.3, 2),  # road factor
        "eta_minutes": max(1, int(straight_km * 1.3 / 0.5)),  # ~30 km/h avg urban
        "polyline": None,
    }

    url = (
        f"{settings.osrm_base_url}/route/v1/driving/"
        f"{from_lng},{from_lat};{to_lng},{to_lat}"
        f"?overview=simplified&geometries=geojson"
    )
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                dist_km = round(route["distance"] / 1000, 2)
                eta_min = max(1, round(route["duration"] / 60))
                polyline = route["geometry"].get("coordinates") if route.get("geometry") else None
                return {"driving_distance_km": dist_km, "eta_minutes": eta_min, "polyline": polyline}
    except Exception as exc:
        log.warning(f"[GEO] OSRM request failed ({exc}); using fallback ETA")

    return fallback


async def get_nearest_hospitals(db: AsyncSession, lat: float, lng: float, limit: int = 5) -> list:
    """
    Return the nearest hospitals ordered by haversine distance.
    Works with both SQLite and PostgreSQL.
    """
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()

    # Annotate with distance and sort
    annotated = []
    for h in hospitals:
        d = haversine_km(lat, lng, h.lat, h.lng)
        annotated.append((d, h))
    annotated.sort(key=lambda x: x[0])

    return [(dist, hosp) for dist, hosp in annotated[:limit]]


async def get_nearest_police_stations(db: AsyncSession, lat: float, lng: float, limit: int = 5) -> list:
    """Return the nearest police stations ordered by haversine distance."""
    result = await db.execute(select(PoliceStation))
    stations = result.scalars().all()

    annotated = []
    for p in stations:
        d = haversine_km(lat, lng, p.lat, p.lng)
        annotated.append((d, p))
    annotated.sort(key=lambda x: x[0])

    return [(dist, stn) for dist, stn in annotated[:limit]]
