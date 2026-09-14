"""
SMS alert service using Twilio.
Falls back gracefully if credentials are not set (logs the message instead).
"""

import logging
from typing import Optional

from app.core.config import settings

log = logging.getLogger(__name__)


async def dispatch_emergency_sms(
    recipients: list[dict],
    vehicle_plate: str,
    coordinates: dict,
    severity: str,
    blood_group: str,
    nearest_hospital: Optional[str],
) -> None:
    """Send emergency SMS to all recipients."""
    if not (settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_from_number):
        log.info(
            "[SMS] Twilio credentials not configured — SMS simulated:\n"
            f"  TO: {[r.get('phone') for r in recipients]}\n"
            f"  Vehicle: {vehicle_plate} | Severity: {severity} | "
            f"Location: {coordinates} | Blood: {blood_group}"
        )
        return

    try:
        from twilio.rest import Client  # type: ignore

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        lat = coordinates.get("lat", "?")
        lng = coordinates.get("lng", "?")
        body = (
            f"⚠️ ASAAS EMERGENCY ALERT\n"
            f"Vehicle: {vehicle_plate}\n"
            f"Severity: {severity}\n"
            f"Location: https://maps.google.com/?q={lat},{lng}\n"
            f"Blood Group: {blood_group}\n"
            f"Hospital: {nearest_hospital or 'Locating...'}"
        )
        for contact in recipients:
            phone = contact.get("phone")
            if phone:
                message = client.messages.create(
                    body=body,
                    from_=settings.twilio_from_number,
                    to=phone,
                )
                log.info(f"[SMS] Sent to {phone}: SID={message.sid}")
    except Exception as exc:
        log.error(f"[SMS] Error sending SMS: {exc}")
