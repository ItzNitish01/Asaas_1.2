"""
ASAAS Backend Configuration
Reads from .env file automatically via pydantic-settings.
Leave DATABASE_URL empty to use SQLite fallback.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------ #
    # Application
    # ------------------------------------------------------------------ #
    app_name: str = "ASAAS Emergency Response Backend"
    version: str = "2.0.0"
    debug: bool = False

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, str):
            return v.strip().lower() in ("1", "true", "yes", "on", "dev", "development")
        return bool(v)

    # ------------------------------------------------------------------ #
    # Server
    # ------------------------------------------------------------------ #
    port: int = 5000
    frontend_origin: str = "http://localhost:3000"

    # ------------------------------------------------------------------ #
    # Database  (leave blank → SQLite fallback)
    # TODO: Set DATABASE_URL to your PostgreSQL connection string:
    #       postgresql+asyncpg://USER:PASSWORD@HOST:5432/asaas
    # ------------------------------------------------------------------ #
    database_url: Optional[str] = None
    sqlite_path: str = "./asaas.db"

    # ------------------------------------------------------------------ #
    # Redis  (leave blank → in-process asyncio.Queue fallback)
    # TODO: Set REDIS_URL to your Redis connection string:
    #       redis://HOST:6379/0
    # ------------------------------------------------------------------ #
    redis_url: Optional[str] = None

    # ------------------------------------------------------------------ #
    # JWT
    # TODO: Set JWT_SECRET_KEY to a strong random string (min 32 chars)
    # ------------------------------------------------------------------ #
    jwt_secret_key: str = "CHANGE_ME_set_a_strong_secret_in_dot_env_file"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7

    # ------------------------------------------------------------------ #
    # OSRM Routing
    # Default: public demo server (OK for dev/SIH demo, replace for prod)
    # TODO: Replace with your own OSRM instance for production
    # ------------------------------------------------------------------ #
    osrm_base_url: str = "http://router.project-osrm.org"

    # ------------------------------------------------------------------ #
    # SMS (Twilio) — Optional
    # TODO: Fill in your Twilio credentials for live SMS alerts
    # ------------------------------------------------------------------ #
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_from_number: Optional[str] = None

    # ------------------------------------------------------------------ #
    # MQTT Bridge (ESP32 hardware)
    # TODO: Replace with your MQTT broker if needed
    # ------------------------------------------------------------------ #
    mqtt_broker_url: str = "mqtt://broker.emqx.io:1883"
    mqtt_topic_telemetry: str = "asaas/telemetry"
    mqtt_topic_alerts: str = "asaas/alerts"


settings = Settings()
