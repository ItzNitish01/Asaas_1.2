"""Pydantic schema for ESP32 telemetry packet."""

from pydantic import BaseModel, Field
from typing import Optional


class GpsPayload(BaseModel):
    lat: float = 28.4595
    lng: float = 77.0266
    sats: int = 8


class TelemetryPacket(BaseModel):
    device_id: str = Field(default="ESP32-DEV-01")
    api_key: Optional[str] = None

    # IMU / Accelerometer
    accel_x_g: float = Field(default=0.0, alias="accel_x")
    accel_y_g: float = Field(default=0.0, alias="accel_y")
    accel_z_g: float = Field(default=0.98, alias="accel_z")
    total_g: Optional[float] = None
    pitch_deg: float = 0.0
    roll_deg: float = 0.0

    # GPS
    gps: Optional[GpsPayload] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

    # Vehicle state
    speed_kmh: float = 0.0
    battery_percent: int = 100
    gsm_dbm: int = -70
    sos_button: str = "RELEASED"

    class Config:
        populate_by_name = True

    def resolved_lat(self) -> float:
        if self.gps:
            return self.gps.lat
        return self.lat or 28.4595

    def resolved_lng(self) -> float:
        if self.gps:
            return self.gps.lng
        return self.lng or 77.0266

    def resolved_total_g(self) -> float:
        if self.total_g is not None:
            return self.total_g
        import math
        return round(math.sqrt(self.accel_x_g**2 + self.accel_y_g**2 + self.accel_z_g**2), 3)


class TelemetryResponse(BaseModel):
    status: str
    message: str
    emergency_triggered: bool = False
    incident_id: Optional[str] = None
