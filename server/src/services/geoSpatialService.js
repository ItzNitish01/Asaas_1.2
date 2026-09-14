// Mathematical Haversine Formula for exact spherical great-circle distance
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Query OSRM Contraction Hierarchies Engine for real road driving geometry & ETA
export async function getDrivingRouteAndEta(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = parseFloat((route.distance / 1000).toFixed(2));
      const durationMins = Math.max(1, Math.round(route.duration / 60));
      return {
        success: true,
        drivingDistanceKm: distanceKm,
        etaMinutes: durationMins,
        geometry: route.geometry,
        source: 'OSRM_ROUTING_ENGINE'
      };
    }
  } catch (err) {
    // Fallback if OSRM public server has a network glitch
    const directKm = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
    const estDrivingKm = parseFloat((directKm * 1.35).toFixed(2)); // standard 1.35 road tortuosity factor
    const estEtaMins = Math.max(2, Math.round((estDrivingKm / 35) * 60)); // assuming 35 km/h emergency ambulance speed
    return {
      success: false,
      drivingDistanceKm: estDrivingKm,
      etaMinutes: estEtaMins,
      geometry: null,
      source: 'HAVERSINE_ROAD_APPROXIMATION'
    };
  }
}
