/**
 * ASAAS Geospatial Emergency Service
 * High-precision Haversine distance calculation, bearing, ETA estimation,
 * and spatial discovery of nearest Trauma Centers and Police Stations.
 */

// Curated regional database of Trauma Hospitals and Police Stations
export const emergencyFacilitiesDatabase = [
  // --- HOSPITALS & TRAUMA CENTERS ---
  {
    id: 'hosp-aiims-trauma',
    name: 'AIIMS Apex Trauma Center',
    type: 'Hospital',
    category: 'Level 1 Critical Emergency & Trauma',
    phone: '+91 11 2658 8500',
    emergencyHotline: '102 / +91 11 2658 8500',
    icuBeds: 14,
    ventilators: 9,
    bloodBank: 'Available (24/7 Universal O- & all groups)',
    traumaLevel: 'Level 1 Multi-Specialty Trauma',
    address: 'Ring Road, Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    coordinates: { lat: 28.5672, lng: 77.2100 },
    status: 'Ready',
    erDocOnDuty: 'Dr. Vikram Malhotra (Chief Trauma Surgeon)',
    rating: '4.9 ★',
    responseTimeMin: 3
  },
  {
    id: 'hosp-max-saket',
    name: 'Max Super Speciality Hospital Trauma Unit',
    type: 'Hospital',
    category: 'Level 1 Trauma & Critical Care',
    phone: '+91 11 4055 4055',
    emergencyHotline: '+91 11 4055 4055 (Ext 1)',
    icuBeds: 8,
    ventilators: 6,
    bloodBank: 'Available (Full Stock)',
    traumaLevel: 'Level 1 Critical Emergency',
    address: '1, 2 Press Enclave Marg, Saket, New Delhi',
    coordinates: { lat: 28.5284, lng: 77.2117 },
    status: 'Ready',
    erDocOnDuty: 'Dr. Ananya Roy (ER Specialist)',
    rating: '4.8 ★',
    responseTimeMin: 5
  },
  {
    id: 'hosp-medanta-medicity',
    name: 'Medanta The Medicity Trauma Command Center',
    type: 'Hospital',
    category: 'Level 1 Multi-Specialty Trauma Hub',
    phone: '+91 124 414 1414',
    emergencyHotline: '+91 124 414 1414',
    icuBeds: 18,
    ventilators: 12,
    bloodBank: 'Available (Full Capacity)',
    traumaLevel: 'Level 1 Multi-Specialty Trauma',
    address: 'CH Baktawar Singh Road, Sector 38, Gurugram',
    coordinates: { lat: 28.4390, lng: 77.0425 },
    status: 'Ready',
    erDocOnDuty: 'Dr. Naresh Trehan Trauma Wing',
    rating: '4.9 ★',
    responseTimeMin: 4
  },
  {
    id: 'hosp-fortis-memorial',
    name: 'Fortis Memorial Research Institute (FMRI) ER',
    type: 'Hospital',
    category: 'Super-Specialty Emergency & Stroke Unit',
    phone: '+91 124 496 2200',
    emergencyHotline: '105010 / +91 124 496 2200',
    icuBeds: 11,
    ventilators: 7,
    bloodBank: 'Available (All Positive/Negative)',
    traumaLevel: 'Level 1 Emergency & Stroke Care',
    address: 'Sector 44, Opposite HUDA City Centre, Gurugram',
    coordinates: { lat: 28.4590, lng: 77.0725 },
    status: 'Ready',
    erDocOnDuty: 'Dr. K. S. Verma (Chief ER Physician)',
    rating: '4.8 ★',
    responseTimeMin: 5
  },
  {
    id: 'hosp-artemis-gurugram',
    name: 'Artemis Hospital Emergency Care',
    type: 'Hospital',
    category: 'Level 1 Advanced Trauma Center',
    phone: '+91 124 451 1111',
    emergencyHotline: '+91 124 458 8888',
    icuBeds: 9,
    ventilators: 5,
    bloodBank: 'Available',
    traumaLevel: 'Level 1 Advanced Trauma',
    address: 'Sector 51, Gurugram, Haryana',
    coordinates: { lat: 28.4342, lng: 77.0858 },
    status: 'Ready',
    erDocOnDuty: 'Dr. Ritu Saxena (Emergency Care)',
    rating: '4.7 ★',
    responseTimeMin: 6
  },
  {
    id: 'hosp-safdarjung-trauma',
    name: 'Safdarjung Hospital Emergency Trauma Block',
    type: 'Hospital',
    category: 'Government Super-Specialty Trauma Unit',
    phone: '+91 11 2616 5060',
    emergencyHotline: '102 / +91 11 2616 8336',
    icuBeds: 22,
    ventilators: 14,
    bloodBank: 'Available (Govt Blood Bank)',
    traumaLevel: 'Level 1 Multi-Specialty Trauma',
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    coordinates: { lat: 28.5714, lng: 77.2065 },
    status: 'Ready',
    erDocOnDuty: 'Dr. S. K. Gupta (Trauma Director)',
    rating: '4.6 ★',
    responseTimeMin: 4
  },
  {
    id: 'hosp-manipal-dwarka',
    name: 'Manipal Hospital Critical Care & ER',
    type: 'Hospital',
    category: 'Multi-Specialty Trauma & ER',
    phone: '+91 11 4967 4967',
    emergencyHotline: '+91 11 4967 4967',
    icuBeds: 10,
    ventilators: 6,
    bloodBank: 'Available',
    traumaLevel: 'Level 2 Emergency Trauma',
    address: 'Sector 6, Dwarka, New Delhi',
    coordinates: { lat: 28.5885, lng: 77.0655 },
    status: 'Ready',
    erDocOnDuty: 'Dr. Manish Jain (Chief ER)',
    rating: '4.7 ★',
    responseTimeMin: 6
  },

  // --- POLICE STATIONS & PATROL SQUADS ---
  {
    id: 'pol-nh48-highway-patrol',
    name: 'NH-48 Expressway Highway Patrol & Traffic Thana',
    type: 'Police Station',
    category: 'Highway Emergency Response & Escort',
    phone: '112',
    emergencyHotline: '112 / PCR Van Interceptor #04',
    jurisdiction: 'NH-48 Expressway Corridor (KM 25 to KM 45)',
    patrolUnitsActive: 4,
    address: 'Expressway Toll Plaza Command Post, Kherki Daula',
    coordinates: { lat: 28.4550, lng: 77.0290 },
    status: 'On Patrol (Active Interceptor)',
    officerInCharge: 'Inspector Rajeev Ranjan',
    rating: '24/7 Rapid Response',
    responseTimeMin: 3
  },
  {
    id: 'pol-sec29-gurugram',
    name: 'Sector 29 Police Station & Traffic HQ',
    type: 'Police Station',
    category: 'District Central Police Station',
    phone: '+91 124 238 2100',
    emergencyHotline: '112 / +91 124 238 2100',
    jurisdiction: 'Sector 29, HUDA City Centre, IFFCO Chowk',
    patrolUnitsActive: 6,
    address: 'Near Leisure Valley Park, Sector 29, Gurugram',
    coordinates: { lat: 28.4688, lng: 77.0620 },
    status: 'Ready & Standby',
    officerInCharge: 'SHO Virender Yadav',
    rating: '24/7 Police Dispatch',
    responseTimeMin: 4
  },
  {
    id: 'pol-dlf-cybercity',
    name: 'DLF Phase 2 / Cyber City Police Station',
    type: 'Police Station',
    category: 'Urban Quick Reaction Police Post',
    phone: '+91 124 256 0100',
    emergencyHotline: '112 / +91 124 256 0100',
    jurisdiction: 'DLF Cyber City, Cyber Hub, MG Road',
    patrolUnitsActive: 5,
    address: 'DLF Phase 2, Near Sikanderpur Metro, Gurugram',
    coordinates: { lat: 28.4890, lng: 77.0910 },
    status: 'Ready & Standby',
    officerInCharge: 'Inspector Deep Chand',
    rating: '24/7 Police Dispatch',
    responseTimeMin: 5
  },
  {
    id: 'pol-sadar-thana',
    name: 'Sadar Police Station (Old Subhash Chowk)',
    type: 'Police Station',
    category: 'Metropolitan Police Station',
    phone: '+91 124 232 2200',
    emergencyHotline: '112 / +91 124 232 2200',
    jurisdiction: 'Sadar, Subhash Chowk, Sohna Road Flyover',
    patrolUnitsActive: 4,
    address: 'Old Jail Complex, Civil Lines, Gurugram',
    coordinates: { lat: 28.4612, lng: 77.0340 },
    status: 'Ready & Standby',
    officerInCharge: 'SHO Satish Kumar',
    rating: '24/7 Police Dispatch',
    responseTimeMin: 4
  },
  {
    id: 'pol-igi-airport',
    name: 'IGI Airport Police Command & PCR Hub',
    type: 'Police Station',
    category: 'Airport Security & Expressway Patrol',
    phone: '+91 11 2565 2121',
    emergencyHotline: '112 / +91 11 2565 2121',
    jurisdiction: 'Airport Expressway, Aerocity, Terminal 3 Access',
    patrolUnitsActive: 8,
    address: 'Terminal 3 Access Road, IGI Airport, New Delhi',
    coordinates: { lat: 28.5562, lng: 77.0850 },
    status: 'Active Quick Response Team',
    officerInCharge: 'ACP Hemant Sharma',
    rating: 'High Security Rapid Unit',
    responseTimeMin: 4
  }
];

/**
 * Calculates Great-Circle distance between two coordinates using the Haversine formula
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal precision
}

/**
 * Calculates initial compass bearing from point 1 to point 2
 * @returns {{ degrees: number, cardinal: string }}
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const toDeg = (v) => (v * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  let degrees = Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return { degrees, cardinal: cardinals[index] };
}

/**
 * Estimates emergency response driving ETA based on realistic urban transit model
 * Emergency vehicles with sirens and traffic precedence average ~42 km/h with 1.32x road detour factor
 * @param {number} distanceKm Straight-line distance in km
 * @returns {{ etaMinutes: number, etaText: string }}
 */
export function estimateEmergencyEta(distanceKm) {
  const roadFactor = 1.32; // Road routing vs straight line
  const effectiveRoadDistanceKm = distanceKm * roadFactor;
  const avgEmergencySpeedKmh = 42; // realistic urban emergency speed
  const baseMinutes = (effectiveRoadDistanceKm / avgEmergencySpeedKmh) * 60;
  const dispatchTurnoutMin = 1.5; // siren turnout & crew mount time
  const totalMinutes = Math.max(2, Math.round(baseMinutes + dispatchTurnoutMin));

  return {
    etaMinutes: totalMinutes,
    etaText: `${totalMinutes} min${totalMinutes > 1 ? 's' : ''}`
  };
}

/**
 * Enriches a facility with real-time distance, ETA, and bearing from a target point
 */
export function enrichFacilityWithDistance(facility, userLat, userLng) {
  const distanceKm = calculateHaversineDistanceKm(
    userLat,
    userLng,
    facility.coordinates.lat,
    facility.coordinates.lng
  );
  const eta = estimateEmergencyEta(distanceKm);
  const bearing = calculateBearing(
    userLat,
    userLng,
    facility.coordinates.lat,
    facility.coordinates.lng
  );

  return {
    ...facility,
    distanceKm,
    distance: `${distanceKm.toFixed(distanceKm < 10 ? 2 : 1)} km`,
    eta: eta.etaText,
    etaMinutes: eta.etaMinutes,
    bearing: `${bearing.cardinal} (${bearing.degrees}°)`,
    googleMapsDirUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${facility.coordinates.lat},${facility.coordinates.lng}`
  };
}

/**
 * Core Emergency Discovery: Finds the exact #1 Nearest Hospital and #1 Nearest Police Station
 * from the SOS device's live coordinates
 * @param {number} userLat Device Latitude
 * @param {number} userLng Device Longitude
 * @param {Array} customFacilities Optional list of facilities to query (defaults to regional database)
 * @returns {{
 *   nearestHospital: object,
 *   nearestPolice: object,
 *   allSorted: Array,
 *   hospitals: Array,
 *   policeStations: Array
 * }}
 */
export function findNearestEmergencyServices(userLat, userLng, customFacilities = null) {
  const source = customFacilities || emergencyFacilitiesDatabase;

  const enriched = source.map((fac) => enrichFacilityWithDistance(fac, userLat, userLng));

  // Sort strictly by distance ascending
  enriched.sort((a, b) => a.distanceKm - b.distanceKm);

  const hospitals = enriched.filter((f) => f.type === 'Hospital');
  const policeStations = enriched.filter((f) => f.type === 'Police Station');

  return {
    nearestHospital: hospitals[0] || null,
    nearestPolice: policeStations[0] || null,
    allSorted: enriched,
    hospitals,
    policeStations
  };
}

/**
 * Coordinate Presets for testing dynamic nearest hospital and police calculation
 */
export const locationPresets = [
  {
    id: 'p-nh48',
    label: 'NH-48 Toll Expressway (Near Hero Honda Chowk)',
    lat: 28.4595,
    lng: 77.0266,
    description: 'Highway high-speed corridor'
  },
  {
    id: 'p-cybercity',
    label: 'DLF Cyber City / MG Road (Gurugram)',
    lat: 28.4892,
    lng: 77.0914,
    description: 'High-density urban corporate corridor'
  },
  {
    id: 'p-airport',
    label: 'IGI Airport Aerocity Expressway (Terminal 3)',
    lat: 28.5530,
    lng: 77.0870,
    description: 'Airport rapid transit corridor'
  },
  {
    id: 'p-saket',
    label: 'Saket Press Enclave (South Delhi Medical Hub)',
    lat: 28.5284,
    lng: 77.2117,
    description: 'Close proximity to Max Hospital Saket'
  },
  {
    id: 'p-aiims',
    label: 'Ring Road / Ansari Nagar (Trauma Cluster)',
    lat: 28.5670,
    lng: 77.2105,
    description: 'Adjacent to AIIMS & Safdarjung Trauma Centers'
  }
];

/**
 * Fetches the true shortest road driving route between origin and destination
 * using the Open Source Routing Machine (OSRM).
 * Converts GeoJSON [lng, lat] to Leaflet [lat, lng] coordinates along real streets and highways.
 * Includes graceful fallback to direct emergency vector if offline.
 * 
 * @param {number} originLat Origin Latitude
 * @param {number} originLng Origin Longitude
 * @param {number} destLat Destination Latitude
 * @param {number} destLng Destination Longitude
 * @returns {Promise<{
 *   coordinates: Array<[number, number]>,
 *   distanceKm: number,
 *   distanceText: string,
 *   durationMin: number,
 *   durationText: string,
 *   summary: string,
 *   isRoadRoute: boolean
 * }>}
 */
export async function fetchShortestRoute(originLat, originLng, destLat, destLng) {
  if (
    originLat === undefined || originLng === undefined ||
    destLat === undefined || destLng === undefined
  ) {
    return null;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert [lng, lat] from GeoJSON into Leaflet's [lat, lng] format
      const leafletCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMin = Math.max(1, Math.round(route.duration / 60));

      return {
        coordinates: leafletCoords,
        distanceKm,
        distanceText: `${distanceKm} km`,
        durationMin,
        durationText: `${durationMin} min${durationMin > 1 ? 's' : ''}`,
        summary: route.legs?.[0]?.summary ? `via ${route.legs[0].summary}` : 'Shortest Road Corridor',
        isRoadRoute: true
      };
    }
  } catch (err) {
    console.info('Live road routing service unavailable or offline, using emergency trajectory:', err.message);
  }

  // Graceful fallback to direct vector line
  const directDistance = calculateHaversineDistanceKm(originLat, originLng, destLat, destLng);
  const eta = estimateEmergencyEta(directDistance);
  return {
    coordinates: [
      [originLat, originLng],
      [destLat, destLng]
    ],
    distanceKm: directDistance,
    distanceText: `${directDistance.toFixed(1)} km`,
    durationMin: eta.etaMinutes,
    durationText: eta.etaText,
    summary: 'Direct Emergency Flight Corridor',
    isRoadRoute: false
  };
}

