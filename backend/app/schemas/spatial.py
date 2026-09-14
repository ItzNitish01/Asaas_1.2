"""Pydantic schemas for geospatial lookups."""

from pydantic import BaseModel
from typing import Optional


class HospitalOut(BaseModel):
    id: int
    name: str
    hospital_type: Optional[str]
    address: Optional[str]
    lat: float
    lng: float
    phone: Optional[str]
    total_icu_beds: int
    available_icu_beds: int
    blood_bank_status: Optional[str]
    trauma_level: Optional[str]
    city: Optional[str]
    distance_km: Optional[float] = None
    driving_distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None

    class Config:
        from_attributes = True


class PoliceStationOut(BaseModel):
    id: int
    name: str
    division: Optional[str]
    address: Optional[str]
    lat: float
    lng: float
    phone: Optional[str]
    active_interceptors: int
    pcr_code: Optional[str]
    city: Optional[str]
    distance_km: Optional[float] = None
    driving_distance_km: Optional[float] = None
    eta_minutes: Optional[int] = None

    class Config:
        from_attributes = True


class NearestFacilitiesResponse(BaseModel):
    crash_coordinates: dict
    nearest_hospital: Optional[HospitalOut]
    nearest_police: Optional[PoliceStationOut]
    candidate_hospitals: list[HospitalOut] = []
    candidate_police_stations: list[PoliceStationOut] = []
