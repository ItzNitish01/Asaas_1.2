"""
ASAAS FastAPI Application Entrypoint

Exposes:
  GET  /api/health
  GET  /ws  (WebSocket)
  POST /api/v1/auth/*
  POST /api/v1/telemetry/*
  *    /api/v1/incidents/*
  GET  /api/v1/hospitals/*
  GET  /api/v1/police/*
  *    /api/v1/medical/*
  *    /api/v1/vehicles/*
  *    /api/v1/registry/*
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.redis_bus import redis_bus
from app.services.websocket_manager import websocket_manager

# Import all models so SQLAlchemy metadata picks them up
import app.models.user  # noqa
import app.models.vehicle  # noqa
import app.models.medical  # noqa
import app.models.spatial  # noqa
import app.models.incident  # noqa

# Import routers
from app.api.v1 import auth, telemetry, incidents, hospitals, police, medical, vehicles, registry

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    log.info("========================================================")
    log.info("  ASAAS REAL-TIME EMERGENCY TELEMETRY & DISPATCH ENGINE  ")
    log.info("========================================================")
    await init_db()
    await redis_bus.connect()
    await websocket_manager.start()
    log.info(f"[HTTP] API ready on port {settings.port}")
    log.info(f"[WS]   WebSocket endpoint: ws://localhost:{settings.port}/ws")
    log.info("--------------------------------------------------------")
    yield
    # --- Shutdown ---
    await websocket_manager.stop()
    await redis_bus.disconnect()
    await close_db()
    log.info("[SYS] ASAAS backend shut down cleanly.")


app = FastAPI(
    title="ASAAS Emergency Response Backend",
    version=settings.version,
    description="Automated System for Accident Alert & Safety - IoT Emergency Response",
    lifespan=lifespan,
)

# CORS - Permits localhost, Vercel, Netlify, and custom production domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------- #
# Health endpoint (used by UI badge, Docker healthcheck, load balancer)  #
# ---------------------------------------------------------------------- #

@app.get("/api/health", tags=["System"])
async def health_check():
    return JSONResponse(content={
        "status": "ONLINE",
        "service": "ASAAS IoT Emergency Response Gateway",
        "version": settings.version,
        "websocket_connections": websocket_manager.total_connections,
        "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    })


# ---------------------------------------------------------------------- #
# WebSocket endpoint                                                       #
# ---------------------------------------------------------------------- #

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    role: str = Query(default="anonymous"),
    token: str = Query(default=None),
):
    """WebSocket endpoint. Clients connect with ?role=HOSPITAL_ER&token=<jwt>"""
    # Optionally validate token and override role
    actual_role = role
    if token:
        try:
            from app.core.security import decode_token
            payload = decode_token(token)
            actual_role = payload.get("role", role)
        except Exception:
            actual_role = "anonymous"

    await websocket_manager.connect(websocket, actual_role)
    try:
        while True:
            # Keep connection alive; ignore incoming messages (broadcast-only)
            data = await websocket.receive_text()
            # Optionally handle ping/pong
            if data.strip().lower() == "ping":
                await websocket.send_text("{\"type\":\"pong\"}")
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket, actual_role)


# ---------------------------------------------------------------------- #
# API Routers                                                              #
# ---------------------------------------------------------------------- #

app.include_router(auth.router,      prefix="/api/v1", tags=["Auth"])
app.include_router(telemetry.router, prefix="/api/v1", tags=["Telemetry"])
app.include_router(incidents.router, prefix="/api/v1", tags=["Incidents"])
app.include_router(hospitals.router, prefix="/api/v1", tags=["Hospitals"])
app.include_router(police.router,    prefix="/api/v1", tags=["Police"])
app.include_router(medical.router,   prefix="/api/v1", tags=["Medical"])
app.include_router(vehicles.router,  prefix="/api/v1", tags=["Vehicles"])
app.include_router(registry.router,  prefix="/api/v1", tags=["Registry"])

