"""Pydantic schemas for incidents and dispatches."""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class CoordinatesIn(BaseModel):
    lat: float = 28.4595
    lng: float = 77.0266


class TriggerIncidentRequest(BaseModel):
    device_id: str = "ASAAS-001"
    severity: str = "CRITICAL"
    reason: str = "Manual SOS Alert"
    peak_g_force: str = "5.84g"
    speed_at_impact: str = "68 km/h"
    coordinates: CoordinatesIn = CoordinatesIn()


class AbortIncidentRequest(BaseModel):
    incident_ref: Optional[str] = None
    reason: str = "Driver confirmed safe"


class DispatchOut(BaseModel):
    hospital_name: Optional[str]
    ambulance_status: Optional[str]
    ambulance_unit: Optional[str]
    ambulance_eta_minutes: Optional[int]
    icu_bed_number: Optional[str]
    icu_bed_reserved: Optional[bool]
    blood_units_reserved: Optional[int]
    blood_type: Optional[str]
    police_station_name: Optional[str]
    pcr_status: Optional[str]
    pcr_unit: Optional[str]
    pcr_eta_minutes: Optional[int]
    green_corridor_active: Optional[bool]
    fir_generated: Optional[bool]
    fir_number: Optional[str]

    class Config:
        from_attributes = True


class IncidentOut(BaseModel):
    id: int
    incident_ref: str
    severity: str
    reason: Optional[str]
    peak_g_force: Optional[str]
    speed_at_impact: Optional[str]
    location_name: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    status: str
    ai_severity_score: int
    ai_summary: Optional[str]
    patient_snapshot: Optional[Any]
    dispatch: Optional[DispatchOut]
    created_at: datetime

    class Config:
        from_attributes = True
