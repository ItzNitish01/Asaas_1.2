"""
WebSocket connection manager.

Maintains a set of active WebSocket connections grouped by role.
Broadcasts events to all connected clients or role-specific channels.
"""

import json
import asyncio
import logging
from typing import Dict, Set

from fastapi import WebSocket
from app.core.redis_bus import redis_bus

log = logging.getLogger(__name__)

CHANNELS = {
    "TELEMETRY_STREAM",
    "INCIDENT_TRIGGERED",
    "INCIDENT_ABORTED",
    "DISPATCH_UPDATE",
}


class WebSocketManager:
    def __init__(self):
        # role -> set of active websocket connections
        self._connections: Dict[str, Set[WebSocket]] = {
            "hospital": set(),
            "police": set(),
            "owner": set(),
            "admin": set(),
            "anonymous": set(),
        }
        self._relay_task: asyncio.Task | None = None

    async def start(self):
        """Start the Redis relay background task."""
        self._relay_task = asyncio.create_task(self._relay_redis_events())
        log.info("[WS] WebSocket manager started")

    async def stop(self):
        if self._relay_task and not self._relay_task.done():
            self._relay_task.cancel()
            try:
                await self._relay_task
            except asyncio.CancelledError:
                pass
        log.info("[WS] WebSocket manager stopped")

    async def _relay_redis_events(self):
        """Subscribe to all ASAAS channels and relay messages to WS clients."""
        try:
            # Subscribe to the broadcast channel
            async for message in redis_bus.subscribe("asaas:broadcast"):
                await self._broadcast_raw(json.dumps(message))
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            log.error(f"[WS] Relay error: {exc}")

    async def connect(self, websocket: WebSocket, role: str = "anonymous"):
        await websocket.accept()
        bucket = self._role_bucket(role)
        self._connections[bucket].add(websocket)
        log.info(f"[WS] Client connected (role={role}, bucket={bucket})")

    async def disconnect(self, websocket: WebSocket, role: str = "anonymous"):
        bucket = self._role_bucket(role)
        self._connections[bucket].discard(websocket)
        log.info(f"[WS] Client disconnected (role={role})")

    def _role_bucket(self, role: str) -> str:
        mapping = {
            "HOSPITAL_ER": "hospital",
            "POLICE_CONTROL": "police",
            "VEHICLE_OWNER": "owner",
            "SUPER_ADMIN": "admin",
        }
        return mapping.get(role, "anonymous")

    async def broadcast(self, event_type: str, payload: dict) -> None:
        """
        Broadcast an event to all connected WebSocket clients and
        also publish it to Redis so other server instances get it.
        """
        message = json.dumps({"type": event_type, "payload": payload})
        await self._broadcast_raw(message)
        # Also publish to Redis for multi-instance setups
        await redis_bus.publish("asaas:broadcast", {"type": event_type, "payload": payload})

    async def _broadcast_raw(self, message: str) -> None:
        dead: list[tuple[str, WebSocket]] = []
        for bucket, connections in self._connections.items():
            for ws in list(connections):
                try:
                    await ws.send_text(message)
                except Exception:
                    dead.append((bucket, ws))
        # Clean up dead connections
        for bucket, ws in dead:
            self._connections[bucket].discard(ws)

    async def broadcast_to_role(self, role: str, event_type: str, payload: dict) -> None:
        bucket = self._role_bucket(role)
        message = json.dumps({"type": event_type, "payload": payload})
        dead = []
        for ws in list(self._connections.get(bucket, [])):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[bucket].discard(ws)

    @property
    def total_connections(self) -> int:
        return sum(len(c) for c in self._connections.values())


websocket_manager = WebSocketManager()
