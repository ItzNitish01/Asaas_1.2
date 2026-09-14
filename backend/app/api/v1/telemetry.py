"""Telemetry ingestion endpoints for ESP32 / SIM800L hardware."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db_session
from app.models.vehicle import Vehicle
from app.models.incident import TelemetryLog
from app.schemas.telemetry import TelemetryPacket, TelemetryResponse
from app.services.ai_severity import compute_severity
from app.services.websocket_manager import websocket_manager

log = logging.getLogger(__name__)

router = APIRouter(prefix="/telemetry")


@router.post("/", response_model=TelemetryResponse)
@router.post("", response_model=TelemetryResponse)  # also match without trailing slash
async def ingest_telemetry(
    packet: TelemetryPacket,
    db: AsyncSession = Depends(get_db_session),
):
    """Ingest telemetry packet from ESP32, detect crash, broadcast via WebSocket."""
    total_g = packet.resolved_total_g()
    lat = packet.resolved_lat()
    lng = packet.resolved_lng()

    # Look up vehicle by device_id
    vehicle_id: int | None = None
    result = await db.execute(select(Vehicle).where(Vehicle.device_id == packet.device_id))
    vehicle = result.scalar_one_or_none()
    if vehicle:
        vehicle_id = vehicle.id
        # Optional API key check
        if packet.api_key and vehicle.api_key and packet.api_key != vehicle.api_key:
            raise HTTPException(status_code=403, detail="Invalid device API key")

    # Persist telemetry log
    log_entry = TelemetryLog(
        vehicle_id=vehicle_id,
        device_id=packet.device_id,
        speed_kmh=packet.speed_kmh,
        accel_x=packet.accel_x_g,
        accel_y=packet.accel_y_g,
        accel_z=packet.accel_z_g,
        total_g=total_g,
        pitch_deg=packet.pitch_deg,
        roll_deg=packet.roll_deg,
        lat=lat,
        lng=lng,
        gps_sats=packet.gps.sats if packet.gps else 0,
        battery_percent=packet.battery_percent,
        gsm_dbm=packet.gsm_dbm,
        sos_button=packet.sos_button,
    )
    db.add(log_entry)
    await db.flush()

    # Broadcast telemetry via WebSocket
    telemetry_payload = {
        "deviceId": packet.device_id,
        "speedKmh": packet.speed_kmh,
        "accelX": packet.accel_x_g,
        "accelY": packet.accel_y_g,
        "accelZ": packet.accel_z_g,
        "totalGForce": total_g,
        "pitchDeg": packet.pitch_deg,
        "rollDeg": packet.roll_deg,
        "lat": lat,
        "lng": lng,
        "batteryPercent": packet.battery_percent,
        "gsmSignalDbm": packet.gsm_dbm,
        "sosPhysicalButton": packet.sos_button,
        "lastUpdateTimestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }
    await websocket_manager.broadcast("TELEMETRY_STREAM", telemetry_payload)

    # Crash detection
    sos_pressed = packet.sos_button == "PRESSED"
    is_crash = total_g >= 4.0 or abs(packet.roll_deg) >= 60 or abs(packet.pitch_deg) >= 60 or sos_pressed

    incident_ref = None
    if is_crash:
        severity = compute_severity(
            total_g=total_g,
            roll_deg=packet.roll_deg,
            pitch_deg=packet.pitch_deg,
            speed_kmh=packet.speed_kmh,
            sos_pressed=sos_pressed,
        )
        reason = (
            "Physical SOS Button Activated" if sos_pressed
            else (f"Severe Impact Collision Detected ({total_g:.2f}g)" if total_g >= 4.0
                  else f"Vehicle Rollover Detected ({packet.roll_deg:.1f}\u00b0 roll)")
        )
        log.warning(f"[TELEMETRY] CRASH DETECTED from {packet.device_id}: {reason}")

        from app.api.v1.incidents import run_emergency_pipeline
        incident_ref = await run_emergency_pipeline(
            db=db,
            device_id=packet.device_id,
            vehicle_id=vehicle_id,
            severity_level=severity.level,
            reason=reason,
            peak_g_force=f"{total_g:.2f}g",
            speed_at_impact=f"{packet.speed_kmh} km/h",
            lat=lat,
            lng=lng,
            ai_score=severity.score,
            ai_summary=severity.triage_summary,
        )

    return TelemetryResponse(
        status="SUCCESS",
        message="Telemetry logged and processed",
        emergency_triggered=is_crash,
        incident_id=incident_ref,
    )


@router.get("/recent")
async def get_recent_telemetry(db: AsyncSession = Depends(get_db_session)):
    """Last 50 telemetry records (for dashboard graphs)."""
    result = await db.execute(
        select(TelemetryLog).order_by(desc(TelemetryLog.id)).limit(50)
    )
    rows = result.scalars().all()
    data = [{
        "id": r.id,
        "deviceId": r.device_id,
        "speedKmh": r.speed_kmh,
        "totalGForce": r.total_g,
        "pitchDeg": r.pitch_deg,
        "rollDeg": r.roll_deg,
        "lat": r.lat,
        "lng": r.lng,
        "batteryPercent": r.battery_percent,
        "ts": r.ts.isoformat() if r.ts else None,
    } for r in reversed(rows)]
    return {"status": "SUCCESS", "count": len(data), "data": data}

