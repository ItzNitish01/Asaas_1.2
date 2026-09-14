import express from 'express';
import { getDb } from '../config/db.js';
import { calculateHaversineDistanceKm, getDrivingRouteAndEta } from '../services/geoSpatialService.js';
import { dispatchEmergencySms } from '../services/smsService.js';
import { socketService } from '../services/socketService.js';

const router = express.Router();

/**
 * Core Emergency Pipeline execution function (Called via REST or Telemetry Edge Crash)
 */
export async function triggerEmergencyPipeline({ deviceId, severity, reason, peakGForce, speedAtImpact, coordinates }) {
  const db = getDb();
  const incidentId = `INC-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  // 1. Fetch matching vehicle and medical profile
  const vehicle = await db.get('SELECT * FROM vehicles WHERE device_id = ? OR id = ?', [deviceId, 'v1']) || {
    id: 'v1',
    name: 'Hyundai Creta SX (O) Turbo',
    registration_number: 'DL-01-AB-4321',
    driver_name: 'Aaradhya Sharma',
    blood_group: 'O+ (Positive)'
  };

  const medicalProfile = await db.get('SELECT * FROM medical_profiles LIMIT 1') || {
    full_name: vehicle.driver_name,
    blood_group: vehicle.blood_group,
    allergies: 'Penicillin',
    medical_conditions: 'Mild Asthmatic',
    primary_physician_phone: '+91 98112 34567'
  };

  // 2. Geospatial Query: Find Nearest Hospital
  const hospitals = await db.all('SELECT * FROM hospitals');
  let nearestHosp = null;
  let minHospDist = Infinity;

  for (const h of hospitals) {
    const dist = calculateHaversineDistanceKm(coordinates.lat, coordinates.lng, h.lat, h.lng);
    if (dist < minHospDist) {
      minHospDist = dist;
      nearestHosp = { ...h, distanceKm: dist };
    }
  }

  // 3. Geospatial Query: Find Nearest Police Station
  const policeStations = await db.all('SELECT * FROM police_stations');
  let nearestPolice = null;
  let minPoliceDist = Infinity;

  for (const p of policeStations) {
    const dist = calculateHaversineDistanceKm(coordinates.lat, coordinates.lng, p.lat, p.lng);
    if (dist < minPoliceDist) {
      minPoliceDist = dist;
      nearestPolice = { ...p, distanceKm: dist };
    }
  }

  // 4. Calculate Road Driving ETA via OSRM
  const hospRouting = nearestHosp
    ? await getDrivingRouteAndEta(coordinates.lat, coordinates.lng, nearestHosp.lat, nearestHosp.lng)
    : { drivingDistanceKm: 4.2, etaMinutes: 8 };

  const policeRouting = nearestPolice
    ? await getDrivingRouteAndEta(coordinates.lat, coordinates.lng, nearestPolice.lat, nearestPolice.lng)
    : { drivingDistanceKm: 2.1, etaMinutes: 4 };

  // 5. Store Incident in Database
  const patientSnapshot = JSON.stringify({
    name: medicalProfile.full_name,
    bloodGroup: medicalProfile.blood_group,
    allergies: medicalProfile.allergies,
    conditions: medicalProfile.medical_conditions,
    physicianPhone: medicalProfile.primary_physician_phone
  });

  const locationName = `NH-48 Expressway, KM 34.2 (Near Hero Honda Chowk)`;
  const aiSummary = `${severity || 'CRITICAL'} Impact Collision: Sensor recorded ${peakGForce || '5.84g'}. Nearest facility: ${nearestHosp?.name || 'AIIMS Trauma'}.`;

  await db.run(`
    INSERT INTO incidents (id, vehicle_id, device_id, severity, reason, peak_g_force, speed_at_impact, location_name, lat, lng, patient_snapshot, ai_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    incidentId,
    vehicle.id,
    deviceId,
    severity || 'CRITICAL',
    reason || 'Accident Crash Detected',
    peakGForce || '5.84g',
    speedAtImpact || '74 km/h',
    locationName,
    coordinates.lat,
    coordinates.lng,
    patientSnapshot,
    aiSummary
  ]);

  // 6. Create Initial Automated Dispatches
  const dispatchId = `DISP-${incidentId}`;
  const initialLogs = JSON.stringify([
    `[${new Date().toLocaleTimeString()}] High-G Impact event received from in-vehicle IoT node (${deviceId}).`,
    `[${new Date().toLocaleTimeString()}] Nearest Hospital Identified: ${nearestHosp?.name} (${hospRouting.drivingDistanceKm} km, ETA: ${hospRouting.etaMinutes} mins).`,
    `[${new Date().toLocaleTimeString()}] Nearest Police Station Identified: ${nearestPolice?.name} (${policeRouting.drivingDistanceKm} km, ETA: ${policeRouting.etaMinutes} mins).`
  ]);

  await db.run(`
    INSERT INTO dispatches (
      id, incident_id, hospital_name, ambulance_status, ambulance_unit, ambulance_eta_minutes,
      icu_bed_number, icu_bed_reserved, blood_units_reserved, blood_type,
      police_station_name, pcr_status, pcr_unit, pcr_eta_minutes, green_corridor_active,
      hazard_perimeter_set, fir_generated, fir_number, logs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    dispatchId,
    incidentId,
    nearestHosp?.name || 'AIIMS Apex Trauma Centre, New Delhi',
    'dispatched',
    'ALS 108 - Trauma Mobile ICU #12',
    hospRouting.etaMinutes,
    'Trauma Bay #04',
    1,
    2,
    medicalProfile.blood_group,
    nearestPolice?.name || 'Sushant Lok Police Station & PCR Hub',
    'dispatched',
    'Highway Patrol Interceptor #07',
    policeRouting.etaMinutes,
    1,
    1,
    1,
    `FIR-2026-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
    initialLogs
  ]);

  // 7. Dispatch Multi-Channel Emergency SMS
  const emergencyContacts = await db.all('SELECT * FROM emergency_contacts WHERE notify_sms = 1');
  dispatchEmergencySms({
    recipients: emergencyContacts,
    vehiclePlate: vehicle.registration_number,
    coordinates,
    severity,
    bloodGroup: medicalProfile.blood_group,
    nearestHospital: nearestHosp?.name
  }).catch(err => console.error('[SMS] Async error:', err));

  const incidentData = {
    id: incidentId,
    date: timestamp.replace('T', ' ').substring(0, 19),
    vehicleName: vehicle.name,
    registrationNumber: vehicle.registration_number,
    deviceId,
    severity: severity || 'CRITICAL',
    reason,
    peakGForce: peakGForce || '5.84g',
    speedAtImpact: speedAtImpact || '74 km/h',
    location: locationName,
    coordinates,
    status: 'Emergency Active (Dispatches In Progress)',
    ambulanceEta: `${hospRouting.etaMinutes} mins (ALS #12 En Route)`,
    aiSummary,
    patientSnapshot: JSON.parse(patientSnapshot),
    nearestHospital: nearestHosp,
    nearestPolice: nearestPolice,
    routes: {
      hospital: hospRouting,
      police: policeRouting
    }
  };

  // 8. WebSocket Broadcast to Hospital ER, Police CAD, and Guardian Circle
  socketService.broadcast('INCIDENT_TRIGGERED', {
    incident: incidentData,
    dispatches: {
      hospital: {
        ambulanceStatus: 'dispatched',
        ambulanceUnit: 'ALS 108 - Trauma Mobile ICU #12',
        ambulanceEtaMinutes: hospRouting.etaMinutes,
        icuBedReserved: true,
        icuBedNumber: 'Trauma Bay #04',
        bloodUnitsReserved: 2,
        bloodType: medicalProfile.blood_group,
        hospitalName: nearestHosp?.name
      },
      police: {
        pcrStatus: 'dispatched',
        pcrUnit: 'Highway Patrol Interceptor #07',
        pcrEtaMinutes: policeRouting.etaMinutes,
        greenCorridorActive: true,
        hazardPerimeterSet: true,
        firGenerated: true
      }
    }
  });

  return incidentData;
}

/**
 * @route POST /api/v1/incidents/trigger
 * @desc Trigger an emergency manually or from simulated API
 */
router.post('/trigger', async (req, res) => {
  try {
    const { deviceId = 'ASAAS-001', severity = 'CRITICAL', reason = 'Manual SOS Alert', peakGForce = '5.84g', speedAtImpact = '68 km/h', coordinates = { lat: 28.4595, lng: 77.0266 } } = req.body;

    const incident = await triggerEmergencyPipeline({
      deviceId,
      severity,
      reason,
      peakGForce,
      speedAtImpact,
      coordinates
    });

    return res.status(201).json({ status: 'SUCCESS', incident });
  } catch (err) {
    console.error('[INCIDENT] Trigger error:', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * @route GET /api/v1/incidents/active
 * @desc Get current active emergency incident
 */
router.get('/active', async (req, res) => {
  try {
    const db = getDb();
    const incident = await db.get("SELECT * FROM incidents WHERE status LIKE '%Emergency Active%' ORDER BY created_at DESC LIMIT 1");
    if (!incident) {
      return res.json({ status: 'SUCCESS', incident: null });
    }

    const dispatch = await db.get('SELECT * FROM dispatches WHERE incident_id = ?', [incident.id]);

    return res.json({
      status: 'SUCCESS',
      incident: {
        ...incident,
        patientSnapshot: incident.patient_snapshot ? JSON.parse(incident.patient_snapshot) : null,
        coordinates: { lat: incident.lat, lng: incident.lng },
        dispatch: dispatch ? {
          ...dispatch,
          logs: dispatch.logs ? JSON.parse(dispatch.logs) : []
        } : null
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * @route GET /api/v1/incidents/history
 * @desc Get all past incident records
 */
router.get('/history', async (req, res) => {
  try {
    const db = getDb();
    const incidents = await db.all('SELECT * FROM incidents ORDER BY created_at DESC LIMIT 20');
    return res.json({
      status: 'SUCCESS',
      count: incidents.length,
      data: incidents.map(i => ({
        ...i,
        coordinates: { lat: i.lat, lng: i.lng },
        patientSnapshot: i.patient_snapshot ? JSON.parse(i.patient_snapshot) : null
      }))
    });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * @route POST /api/v1/incidents/abort
 * @desc Abort/Cancel false alarm within countdown
 */
router.post('/abort', async (req, res) => {
  try {
    const { incidentId, reason = 'Driver verified safe via 15s PIN/Button cancellation' } = req.body;
    const db = getDb();

    if (incidentId) {
      await db.run("UPDATE incidents SET status = 'ABORTED_FALSE_ALARM', resolved_at = CURRENT_TIMESTAMP WHERE id = ?", [incidentId]);
    } else {
      await db.run("UPDATE incidents SET status = 'ABORTED_FALSE_ALARM', resolved_at = CURRENT_TIMESTAMP WHERE status LIKE '%Emergency Active%'");
    }

    socketService.broadcast('INCIDENT_ABORTED', { reason, timestamp: new Date().toISOString() });

    return res.json({ status: 'SUCCESS', message: 'Emergency alert canceled successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

export default router;
