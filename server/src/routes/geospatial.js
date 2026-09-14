import express from 'express';
import { getDb } from '../config/db.js';
import { calculateHaversineDistanceKm, getDrivingRouteAndEta } from '../services/geoSpatialService.js';

const router = express.Router();

/**
 * @route GET /api/v1/geospatial/nearest
 * @desc Get nearest hospital and police station dynamically with real driving ETA
 */
router.get('/nearest', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || 28.4595);
    const lng = parseFloat(req.query.lng || 77.0266);
    const db = getDb();

    const hospitals = await db.all('SELECT * FROM hospitals');
    const policeStations = await db.all('SELECT * FROM police_stations');

    // Rank hospitals by distance
    const rankedHospitals = hospitals.map(h => ({
      ...h,
      distanceKm: calculateHaversineDistanceKm(lat, lng, h.lat, h.lng)
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    // Rank police stations
    const rankedPolice = policeStations.map(p => ({
      ...p,
      distanceKm: calculateHaversineDistanceKm(lat, lng, p.lat, p.lng)
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    const nearestHosp = rankedHospitals[0] || null;
    const nearestPol = rankedPolice[0] || null;

    let hospRoute = null;
    let polRoute = null;

    if (nearestHosp) {
      hospRoute = await getDrivingRouteAndEta(lat, lng, nearestHosp.lat, nearestHosp.lng);
    }
    if (nearestPol) {
      polRoute = await getDrivingRouteAndEta(lat, lng, nearestPol.lat, nearestPol.lng);
    }

    return res.json({
      status: 'SUCCESS',
      crashCoordinates: { lat, lng },
      nearestHospital: nearestHosp ? { ...nearestHosp, route: hospRoute } : null,
      nearestPolice: nearestPol ? { ...nearestPol, route: polRoute } : null,
      candidateHospitals: rankedHospitals.slice(0, 4),
      candidatePoliceStations: rankedPolice.slice(0, 4)
    });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * @route GET /api/v1/geospatial/facilities
 * @desc Get all registered hospitals and police stations
 */
router.get('/facilities', async (req, res) => {
  try {
    const db = getDb();
    const hospitals = await db.all('SELECT * FROM hospitals');
    const police = await db.all('SELECT * FROM police_stations');
    return res.json({ status: 'SUCCESS', hospitals, policeStations: police });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

export default router;
