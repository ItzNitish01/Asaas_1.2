import express from 'express';
import { getDb } from '../config/db.js';
import { socketService } from '../services/socketService.js';
import { triggerEmergencyPipeline } from './incidents.js';

const router = express.Router();

/**
 * @route POST /api/v1/telemetry
 * @desc Ingestion endpoint for ESP32 DevKit & SIM800L Cellular Modem
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const db = getDb();

    const deviceId = payload.device_id || payload.deviceId || 'ESP32-DEV-01';
    const speed = parseFloat(payload.speed_kmh || payload.speed || 0);
    const accelX = parseFloat(payload.accel_x_g || payload.accelX || 0);
    const accelY = parseFloat(payload.accel_y_g || payload.accelY || 0);
    const accelZ = parseFloat(payload.accel_z_g || payload.accelZ || 0.98);
    const totalG = parseFloat(payload.total_g || payload.totalGForce || Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ).toFixed(2));
    const pitch = parseFloat(payload.pitch_deg || payload.pitchDeg || 0);
    const roll = parseFloat(payload.roll_deg || payload.rollDeg || 0);
    const lat = parseFloat(payload.gps?.lat || payload.lat || 28.4595);
    const lng = parseFloat(payload.gps?.lng || payload.lng || 77.0266);
    const sats = parseInt(payload.gps?.sats || payload.gpsSatellites || 8, 10);
    const battery = parseInt(payload.battery_percent || payload.batteryPercent || 90, 10);
    const gsmDbm = parseInt(payload.gsm_dbm || payload.gsmSignalDbm || -70, 10);
    const sosButton = payload.sos_button || payload.sosPhysicalButton || 'RELEASED';

    // Insert telemetry into database
    await db.run(`
      INSERT INTO telemetry_logs (device_id, speed_kmh, accel_x, accel_y, accel_z, total_g, pitch_deg, roll_deg, lat, lng, gps_sats, battery_percent, gsm_dbm, sos_button)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [deviceId, speed, accelX, accelY, accelZ, totalG, pitch, roll, lat, lng, sats, battery, gsmDbm, sosButton]);

    const telemetryState = {
      deviceId,
      speedKmh: speed,
      accelX,
      accelY,
      accelZ,
      totalGForce: totalG,
      pitchDeg: pitch,
      rollDeg: roll,
      lat,
      lng,
      gpsSatellites: sats,
      batteryPercent: battery,
      gsmSignalDbm: gsmDbm,
      sosPhysicalButton: sosButton,
      lastUpdateTimestamp: new Date().toLocaleTimeString()
    };

    // Broadcast live telemetry via WebSocket to open dashboards
    socketService.broadcast('TELEMETRY_STREAM', telemetryState);

    // Edge Crash Trigger Detection Check
    const isImpactCrash = totalG >= 4.0;
    const isRollover = Math.abs(roll) >= 60 || Math.abs(pitch) >= 60;
    const isSosPressed = sosButton === 'PRESSED';

    let triggeredIncident = null;

    if (isImpactCrash || isRollover || isSosPressed) {
      console.warn(`[TELEMETRY] EMERGENCY EVENT TRIGGERED from ${deviceId}! Total G: ${totalG}, Roll: ${roll}`);
      
      const reason = isSosPressed 
        ? 'Physical SOS Button Activated by Driver' 
        : (isImpactCrash ? `Severe Impact Collision Detected (${totalG}g)` : `Vehicle Rollover Detected (${roll}° roll)`);

      triggeredIncident = await triggerEmergencyPipeline({
        deviceId,
        severity: isImpactCrash && totalG >= 5.5 ? 'CRITICAL' : 'HIGH',
        reason,
        peakGForce: `${totalG}g`,
        speedAtImpact: `${speed} km/h`,
        coordinates: { lat, lng }
      });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Telemetry logged and processed successfully',
      emergencyTriggered: Boolean(triggeredIncident),
      incident: triggeredIncident
    });
  } catch (err) {
    console.error('[TELEMETRY] Ingestion error:', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * @route GET /api/v1/telemetry/recent
 * @desc Get latest 50 telemetry points for graph visualization
 */
router.get('/recent', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM telemetry_logs ORDER BY id DESC LIMIT 50');
    return res.json({ status: 'SUCCESS', count: rows.length, data: rows.reverse() });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

export default router;
