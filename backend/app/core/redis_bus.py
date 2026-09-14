"""
Redis Pub/Sub bus with an in-process asyncio.Queue fallback.

If REDIS_URL is set → use aioredis.
Otherwise          → use an in-memory queue (suitable for single-process dev).
"""

import asyncio
import json
import logging
from typing import Callable, Optional

log = logging.getLogger(__name__)


class _InMemoryBus:
    """Thread-safe in-process pub/sub using asyncio.Queue."""

    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    async def publish(self, channel: str, message: dict) -> None:
        async with self._lock:
            queues = self._subscribers.get(channel, [])
        data = json.dumps(message)
        for q in queues:
            await q.put(data)

    async def subscribe(self, channel: str) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            self._subscribers.setdefault(channel, []).append(q)
        return q

    async def unsubscribe(self, channel: str, queue: asyncio.Queue) -> None:
        async with self._lock:
            subs = self._subscribers.get(channel, [])
            if queue in subs:
                subs.remove(queue)


class RedisBus:
    """Unified pub/sub interface — Redis or in-memory fallback."""

    def __init__(self):
        self._redis = None
        self._fallback = _InMemoryBus()
        self._using_redis = False

    async def connect(self) -> None:
        from app.core.config import settings

        raw_url = (settings.redis_url or "").strip().strip('"').strip("'")
        if raw_url:
            try:
                try:
                    import redis.asyncio as aioredis
                except ImportError:
                    import aioredis  # type: ignore

                self._redis = aioredis.from_url(
                    raw_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                )
                # Quick ping to verify
                await self._redis.ping()
                self._using_redis = True
                log.info(f"[REDIS] Connected to Redis broker ({raw_url.split('@')[-1]})")
            except Exception as exc:
                log.warning(f"[REDIS] Connection failed ({exc}); using in-memory fallback")
                self._redis = None
                self._using_redis = False
        else:
            log.info("[REDIS] REDIS_URL not set → using in-memory asyncio.Queue fallback")

    async def disconnect(self) -> None:
        if self._redis:
            try:
                if hasattr(self._redis, "aclose"):
                    await self._redis.aclose()
                else:
                    await self._redis.close()
            except Exception:
                pass
            log.info("[REDIS] Connection closed")

    async def publish(self, channel: str, message: dict) -> None:
        if self._using_redis and self._redis:
            try:
                await self._redis.publish(channel, json.dumps(message))
                return
            except Exception as exc:
                log.warning(f"[REDIS] publish failed ({exc}), falling back")
        await self._fallback.publish(channel, message)

    async def subscribe(self, channel: str):
        """Returns an async generator yielding decoded messages."""
        if self._using_redis and self._redis:
            pubsub = self._redis.pubsub()
            await pubsub.subscribe(channel)
            try:
                async for msg in pubsub.listen():
                    if msg.get("type") == "message":
                        try:
                            yield json.loads(msg["data"])
                        except Exception:
                            pass
            finally:
                try:
                    await pubsub.unsubscribe(channel)
                    if hasattr(pubsub, "aclose"):
                        await pubsub.aclose()
                    else:
                        await pubsub.close()
                except Exception:
                    pass
        else:
            q = await self._fallback.subscribe(channel)
            try:
                while True:
                    data = await q.get()
                    try:
                        yield json.loads(data)
                    except Exception:
                        pass
            finally:
                await self._fallback.unsubscribe(channel, q)


redis_bus = RedisBus()
