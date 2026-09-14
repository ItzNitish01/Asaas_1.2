"""
AI Crash Severity Engine

Deterministic scoring function (0-100) based on:
  - Peak G-force (kinetic impact energy)
  - Roll angle (rollover risk)
  - Pitch angle (cliff/ramp impact)
  - Speed at impact

This is intentionally a physics-based stub that is easy to replace with
a trained ML model (TensorFlow Lite / ONNX) later.
"""

import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class SeverityResult:
    score: int            # 0-100
    level: str            # LOW / MODERATE / HIGH / CRITICAL
    triage_summary: str
    impulse_description: str


def compute_severity(
    total_g: float,
    roll_deg: float = 0.0,
    pitch_deg: float = 0.0,
    speed_kmh: float = 0.0,
    sos_pressed: bool = False,
) -> SeverityResult:
    """
    Compute crash severity score.

    Args:
        total_g:    Vector magnitude of acceleration in g (e.g. 5.84)
        roll_deg:   Roll angle in degrees
        pitch_deg:  Pitch angle in degrees
        speed_kmh:  Vehicle speed at time of impact
        sos_pressed: Physical SOS button was pressed

    Returns:
        SeverityResult with score 0-100 and triage information.
    """
    score = 0

    # --- Impact G-force contribution (max 50 pts) ---
    # Threshold: 4.0g = crash, 8.0g = severe, 12g+ = critical
    g_score = min(50, int((total_g - 2.0) / 10.0 * 50)) if total_g > 2.0 else 0
    score += max(0, g_score)

    # --- Rollover risk (max 25 pts) ---
    # 60deg = high risk, 90deg = definite rollover
    roll_abs = abs(roll_deg)
    if roll_abs >= 90:
        score += 25
    elif roll_abs >= 60:
        score += 20
    elif roll_abs >= 45:
        score += 10
    elif roll_abs >= 30:
        score += 5

    # --- Pitch risk (max 10 pts) ---
    pitch_abs = abs(pitch_deg)
    if pitch_abs >= 60:
        score += 10
    elif pitch_abs >= 45:
        score += 7
    elif pitch_abs >= 30:
        score += 3

    # --- Speed contribution (max 10 pts) ---
    if speed_kmh >= 120:
        score += 10
    elif speed_kmh >= 80:
        score += 7
    elif speed_kmh >= 60:
        score += 5
    elif speed_kmh >= 40:
        score += 2

    # --- SOS override (minimum 60) ---
    if sos_pressed:
        score = max(score, 60)

    score = min(100, score)

    # --- Level classification ---
    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 40:
        level = "MODERATE"
    else:
        level = "LOW"

    # --- Human-readable triage summary ---
    impact_energy_kj = round(0.5 * 1500 * ((speed_kmh / 3.6) ** 2) / 1000, 1) if speed_kmh > 0 else 0

    triage_summary = (
        f"{level} severity collision: {total_g:.2f}g peak deceleration detected. "
        f"Roll={roll_deg:.1f}\u00b0, Pitch={pitch_deg:.1f}\u00b0. "
        f"Estimated kinetic energy at impact: {impact_energy_kj} kJ. "
        f"AI Severity Score: {score}/100."
    )

    # --- Impulse description for medical teams ---
    if total_g >= 8.0:
        impulse_desc = "Extreme deceleration — high probability of thoracic/abdominal trauma and TBI."
    elif total_g >= 5.5:
        impulse_desc = "Severe impact force — potential internal injuries, spine, and airbag deployment."
    elif total_g >= 4.0:
        impulse_desc = "Moderate-severe impact — whiplash, seatbelt injuries likely."
    else:
        impulse_desc = "Low-moderate impact — precautionary medical evaluation recommended."

    return SeverityResult(
        score=score,
        level=level,
        triage_summary=triage_summary,
        impulse_description=impulse_desc,
    )
