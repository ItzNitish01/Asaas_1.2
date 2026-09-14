"""Incident management endpoints."""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_

from app.core.database import get_db_session
from app.models.incident import Incident, Dispatch
from app.models.vehicle import Vehicle
from app.models.medical import MedicalProfile, EmergencyContact
from app.models.spatial import Hospital, PoliceStation
from app.schemas.incident import TriggerIncidentRequest, AbortIncidentRequest, IncidentOut
from app.services.ai_severity import compute_severity
from app.services.geo_service import (
    get_nearest_hospitals, get_nearest_police_stations, get_driving_route_and_eta
)
from app.services.sms_service import dispatch_emergency_sms
from app.services.websocket_manager import websocket_manager

log = logging.getLogger(__name__)
router = APIRouter(prefix="/incidents")


async def run_emergency_pipeline(
    db: AsyncSession,
    device_id: str,
    vehicle_id: int | None,
    severity_level: str,
    reason: str,
    peak_g_force: str,
    speed_at_impact: str,
    lat: float,
    lng: float,
    ai_score: int = 0,
    ai_summary: str = "",
) -> str:
    """Core emergency response pipeline. Returns incident_ref."""
    import time
    incident_ref = f"INC-{int(time.time() * 1000) % 1_000_000:06d}"

    # Fetch vehicle + medical profile
    vehicle = None
    if vehicle_id:
        result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        vehicle = result.scalar_one_or_none()

    medical = None
    if vehicle_id:
        result = await db.execute(
            select(MedicalProfile).where(MedicalProfile.user_id == vehicle.owner_id)
        )
        medical = result.scalar_one_or_none()

    # Patient snapshot for ER teams
    patient_snapshot = {}
    if vehicle:
        patient_snapshot = {
            "name": vehicle.driver_name or "Unknown",
            "bloodGroup": vehicle.blood_group or "Unknown",
            "vehiclePlate": vehicle.registration_number,
        }
    if medical:
        patient_snapshot.update({
            "name": medical.full_name or patient_snapshot.get("name"),
            "bloodGroup": medical.blood_group or patient_snapshot.get("bloodGroup"),
            "allergies": medical.allergies or "None",
            "conditions": medical.medical_conditions or "None",
            "physicianPhone": medical.primary_physician_phone,
            "abhaId": medical.abha_id,
        })

    # Nearest hospital + police
    hospital_list = await get_nearest_hospitals(db, lat, lng, limit=4)
    police_list = await get_nearest_police_stations(db, lat, lng, limit=4)

    nearest_hosp = hospital_list[0] if hospital_list else None
    nearest_pol = police_list[0] if police_list else None

    # Road ETA via OSRM
    hosp_route = {"driving_distance_km": 4.2, "eta_minutes": 8, "polyline": None}
    pol_route = {"driving_distance_km": 2.1, "eta_minutes": 4, "polyline": None}
    if nearest_hosp:
        _, h = nearest_hosp
        hosp_route = await get_driving_route_and_eta(lat, lng, h.lat, h.lng)
    if nearest_pol:
        _, p = nearest_pol
        pol_route = await get_driving_route_and_eta(lat, lng, p.lat, p.lng)

    # AI severity if not provided
    if not ai_score:
        sev = compute_severity(total_g=4.0)
        ai_score = sev.score
        ai_summary = sev.triage_summary

    # Create incident record
    location_name = f"GPS: {lat:.4f}\u00b0N, {lng:.4f}\u00b0E"
    if nearest_hosp:
        _, h = nearest_hosp
        location_name = f"{round(nearest_hosp[0], 1)} km from {h.name}"

    incident = Incident(
        incident_ref=incident_ref,
        vehicle_id=vehicle_id,
        device_id=device_id,
        severity=severity_level,
        reason=reason,
        peak_g_force=peak_g_force,
        speed_at_impact=speed_at_impact,
        location_name=location_name,
        lat=lat,
        lng=lng,
        status="Emergency Active",
        ai_severity_score=ai_score,
        ai_summary=ai_summary,
        patient_snapshot=json.dumps(patient_snapshot),
    )
    db.add(incident)
    await db.flush()

    # Create dispatch record
    hosp_name = None
    hosp_lat = None
    hosp_lng = None
    if nearest_hosp:
        _, h = nearest_hosp
        hosp_name = h.name
        hosp_lat = h.lat
        hosp_lng = h.lng

    pol_name = None
    pol_lat = None
    pol_lng = None
    if nearest_pol:
        _, p = nearest_pol
        pol_name = p.name
        pol_lat = p.lat
        pol_lng = p.lng

    fir_number = f"FIR-{datetime.now(timezone.utc).year}-ASAAS-{int(incident.id):04d}"
    dispatch_logs = [
        f"[{datetime.now(timezone.utc).isoformat()}] High-G Impact event from {device_id}.",
        f"[{datetime.now(timezone.utc).isoformat()}] Nearest Hospital: {hosp_name} "
        f"({hosp_route['driving_distance_km']} km, ETA {hosp_route['eta_minutes']} mins).",
        f"[{datetime.now(timezone.utc).isoformat()}] Nearest Police: {pol_name} "
        f"({pol_route['driving_distance_km']} km, ETA {pol_route['eta_minutes']} mins).",
    ]

    dispatch = Dispatch(
        incident_id=incident.id,
        hospital_name=hosp_name,
        hospital_lat=hosp_lat,
        hospital_lng=hosp_lng,
        ambulance_status="dispatched",
        ambulance_unit="ALS 108 - Trauma Mobile ICU",
        ambulance_eta_minutes=hosp_route["eta_minutes"],
        icu_bed_number="Trauma Bay #04",
        icu_bed_reserved=True,
        blood_units_reserved=2,
        blood_type=patient_snapshot.get("bloodGroup", "Unknown"),
        police_station_name=pol_name,
        police_lat=pol_lat,
        police_lng=pol_lng,
        pcr_status="dispatched",
        pcr_unit="Highway Patrol PCR",
        pcr_eta_minutes=pol_route["eta_minutes"],
        green_corridor_active=True,
        hazard_perimeter_set=True,
        fir_generated=True,
        fir_number=fir_number,
        dispatch_logs=json.dumps(dispatch_logs),
    )
    db.add(dispatch)
    await db.flush()

    # WebSocket broadcast
    broadcast_payload = {
        "incident": {
            "id": incident.id,
            "incidentRef": incident_ref,
            "severity": severity_level,
            "reason": reason,
            "peakGForce": peak_g_force,
            "speedAtImpact": speed_at_impact,
            "location": location_name,
            "coordinates": {"lat": lat, "lng": lng},
            "status": "Emergency Active",
            "aiSeverityScore": ai_score,
            "aiSummary": ai_summary,
            "patientSnapshot": patient_snapshot,
        },
        "dispatches": {
            "hospital": {
                "hospitalName": hosp_name,
                "ambulanceStatus": "dispatched",
                "ambulanceUnit": "ALS 108 - Trauma Mobile ICU",
                "ambulanceEtaMinutes": hosp_route["eta_minutes"],
                "icuBedReserved": True,
                "icuBedNumber": "Trauma Bay #04",
                "bloodUnitsReserved": 2,
                "bloodType": patient_snapshot.get("bloodGroup"),
            },
            "police": {
                "policeStationName": pol_name,
                "pcrStatus": "dispatched",
                "pcrUnit": "Highway Patrol PCR",
                "pcrEtaMinutes": pol_route["eta_minutes"],
                "greenCorridorActive": True,
                "firGenerated": True,
                "firNumber": fir_number,
            },
        },
    }
    await websocket_manager.broadcast("INCIDENT_TRIGGERED", broadcast_payload)

    # SMS (async, non-blocking)
    import asyncio
    if medical:
        result = await db.execute(
            select(EmergencyContact).where(
                EmergencyContact.profile_id == medical.id,
                EmergencyContact.notify_sms == True,
            )
        )
        contacts = result.scalars().all()
        asyncio.create_task(
            dispatch_emergency_sms(
                recipients=[{"phone": c.phone} for c in contacts],
                vehicle_plate=patient_snapshot.get("vehiclePlate", "Unknown"),
                coordinates={"lat": lat, "lng": lng},
                severity=severity_level,
                blood_group=patient_snapshot.get("bloodGroup", "Unknown"),
                nearest_hospital=hosp_name,
            )
        )

    return incident_ref


@router.post("/trigger")
async def trigger_incident(
    body: TriggerIncidentRequest,
    db: AsyncSession = Depends(get_db_session),
):
    sev = compute_severity(total_g=4.0, sos_pressed=(body.severity == "CRITICAL"))
    incident_ref = await run_emergency_pipeline(
        db=db,
        device_id=body.device_id,
        vehicle_id=None,
        severity_level=body.severity,
        reason=body.reason,
        peak_g_force=body.peak_g_force,
        speed_at_impact=body.speed_at_impact,
        lat=body.coordinates.lat,
        lng=body.coordinates.lng,
        ai_score=sev.score,
        ai_summary=sev.triage_summary,
    )
    return {"status": "SUCCESS", "incident_ref": incident_ref}


@router.post("/abort")
async def abort_incident(
    body: AbortIncidentRequest,
    db: AsyncSession = Depends(get_db_session),
):
    if body.incident_ref:
        result = await db.execute(
            select(Incident).where(Incident.incident_ref == body.incident_ref)
        )
        incident = result.scalar_one_or_none()
        if incident:
            incident.status = "ABORTED_FALSE_ALARM"
            incident.resolved_at = datetime.now(timezone.utc)
    else:
        result = await db.execute(
            select(Incident).where(Incident.status == "Emergency Active").order_by(desc(Incident.id))
        )
        incidents = result.scalars().all()
        for i in incidents:
            i.status = "ABORTED_FALSE_ALARM"
            i.resolved_at = datetime.now(timezone.utc)

    await websocket_manager.broadcast(
        "INCIDENT_ABORTED",
        {"reason": body.reason, "timestamp": datetime.now(timezone.utc).isoformat()},
    )
    return {"status": "SUCCESS", "message": "Emergency alert cancelled"}


@router.get("/active")
async def get_active_incident(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        select(Incident)
        .where(Incident.status == "Emergency Active")
        .order_by(desc(Incident.id))
        .limit(1)
    )
    incident = result.scalar_one_or_none()
    if not incident:
        return {"status": "SUCCESS", "incident": None}

    dispatch_result = await db.execute(
        select(Dispatch).where(Dispatch.incident_id == incident.id)
    )
    dispatch = dispatch_result.scalar_one_or_none()

    return {
        "status": "SUCCESS",
        "incident": _format_incident(incident, dispatch),
    }


@router.get("/history")
async def get_incident_history(db: AsyncSession = Depends(get_db_session), limit: int = 20):
    result = await db.execute(
        select(Incident).order_by(desc(Incident.id)).limit(limit)
    )
    incidents = result.scalars().all()
    return {"status": "SUCCESS", "count": len(incidents), "data": [_format_incident(i) for i in incidents]}


@router.get("/{incident_ref}/cap")
async def get_cap_alert(incident_ref: str, db: AsyncSession = Depends(get_db_session)):
    """Export incident as CAP v1.2 (Common Alerting Protocol) JSON."""
    result = await db.execute(
        select(Incident).where(Incident.incident_ref == incident_ref)
    )
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    patient = incident.patient_data
    cap = {
        "identifier": f"IN-ASAAS-{incident.incident_ref}",
        "sender": "emergency-cad@asaas.gov.in",
        "sent": incident.created_at.isoformat(),
        "status": "Actual",
        "msgType": "Alert",
        "scope": "Public",
        "code": ["IPAWS-1.0", "ERSS-112-CAD"],
        "info": [{
            "category": "Safety",
            "event": "Severe Motor Vehicle Collision (MVC)",
            "urgency": "Immediate",
            "severity": "Extreme" if incident.severity == "CRITICAL" else "Severe",
            "certainty": "Observed",
            "headline": f"Automated Impact Detected: {patient.get('vehiclePlate', 'Unknown')} ({incident.peak_g_force})",
            "description": incident.ai_summary or "Sensor collision detected above 4.0G threshold.",
            "instruction": (
                f"Trauma resuscitation required. "
                f"Blood Type: {patient.get('bloodGroup', 'Unknown')}. "
                f"Allergies: {patient.get('allergies', 'None')}." 
            ),
            "area": [{"areaDesc": incident.location_name or "Unknown", "circle": [f"{incident.lat},{incident.lng},0.05"]}],
            "parameter": [
                {"valueName": "VehiclePlate", "value": patient.get("vehiclePlate", "Unknown")},
                {"valueName": "SpeedAtImpact", "value": incident.speed_at_impact or "Unknown"},
                {"valueName": "DecelerationPeak", "value": incident.peak_g_force or "Unknown"},
                {"valueName": "AISeverityScore", "value": str(incident.ai_severity_score)},
            ],
        }],
    }
    return cap


def _format_incident(incident: Incident, dispatch: Dispatch = None) -> dict:
    d = {
        "id": incident.id,
        "incidentRef": incident.incident_ref,
        "vehicleId": incident.vehicle_id,
        "deviceId": incident.device_id,
        "severity": incident.severity,
        "reason": incident.reason,
        "peakGForce": incident.peak_g_force,
        "speedAtImpact": incident.speed_at_impact,
        "locationName": incident.location_name,
        "coordinates": {"lat": incident.lat, "lng": incident.lng},
        "status": incident.status,
        "aiSeverityScore": incident.ai_severity_score,
        "aiSummary": incident.ai_summary,
        "patientSnapshot": incident.patient_data,
        "createdAt": incident.created_at.isoformat() if incident.created_at else None,
        "resolvedAt": incident.resolved_at.isoformat() if incident.resolved_at else None,
        "dispatch": None,
    }
    if dispatch:
        logs = []
        if dispatch.dispatch_logs:
            try:
                logs = json.loads(dispatch.dispatch_logs)
            except Exception:
                logs = []
        d["dispatch"] = {
            "hospitalName": dispatch.hospital_name,
            "ambulanceStatus": dispatch.ambulance_status,
            "ambulanceUnit": dispatch.ambulance_unit,
            "ambulanceEtaMinutes": dispatch.ambulance_eta_minutes,
            "icuBedNumber": dispatch.icu_bed_number,
            "icuBedReserved": dispatch.icu_bed_reserved,
            "bloodUnitsReserved": dispatch.blood_units_reserved,
            "bloodType": dispatch.blood_type,
            "policeStationName": dispatch.police_station_name,
            "pcrStatus": dispatch.pcr_status,
            "pcrUnit": dispatch.pcr_unit,
            "pcrEtaMinutes": dispatch.pcr_eta_minutes,
            "greenCorridorActive": dispatch.green_corridor_active,
            "firGenerated": dispatch.fir_generated,
            "firNumber": dispatch.fir_number,
            "logs": logs,
        }
    return d

