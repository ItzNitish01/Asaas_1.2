import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Navigation, 
  PhoneCall, 
  Layers, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  LocateFixed,
  Compass,
  Sliders,
  Sparkles,
  Route,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { findNearestEmergencyServices, locationPresets, fetchShortestRoute } from '../../services/geoService';

// Fix Leaflet default icon URLs safely for Vite
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (err) {
    console.warn('Leaflet icon override warning:', err);
  }
}

// Custom Leaflet Pins
const createVehiclePin = () => {
  if (!L || typeof L.divIcon !== 'function') return null;
  return L.divIcon({
    className: 'custom-pin-beacon',
    html: `
      <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <div class="ring"></div>
        <div class="core">🚗</div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
};

const createHospitalPin = (isNearest, isSelected) => {
  if (!L || typeof L.divIcon !== 'function') return null;
  return L.divIcon({
    className: 'custom-hosp-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${isSelected || isNearest ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: pulse-emergency 1.5s infinite;"></div>' : ''}
        <div class="custom-pin-hospital" style="${isSelected ? 'border: 3px solid #ffffff; transform: scale(1.2); box-shadow: 0 0 20px rgba(16, 185, 129, 1);' : isNearest ? 'border: 2.5px solid #fff; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8);' : ''}">
          🏥
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createPolicePin = (isNearest, isSelected) => {
  if (!L || typeof L.divIcon !== 'function') return null;
  return L.divIcon({
    className: 'custom-pol-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${isSelected || isNearest ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: pulse-emergency 1.5s infinite;"></div>' : ''}
        <div class="custom-pin-police" style="${isSelected ? 'border: 3px solid #ffffff; transform: scale(1.2); box-shadow: 0 0 20px rgba(59, 130, 246, 1);' : isNearest ? 'border: 2.5px solid #fff; box-shadow: 0 0 16px rgba(59, 130, 246, 0.8);' : ''}">
          👮
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

export default function AccidentMapTab({ selectedVehicle, telemetry, updateTelemetry }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'hospital' | 'police'
  const [locating, setLocating] = useState(false);

  // Position of vehicle
  const position = [telemetry.lat, telemetry.lng];

  // Dynamically compute nearest hospital and police station from current telemetry coordinates
  const { nearestHospital, nearestPolice, allSorted, hospitals, policeStations } = 
    findNearestEmergencyServices(telemetry.lat, telemetry.lng);

  // Currently targeted facility for displaying the shortest route
  // Defaults to nearestHospital, but user can click nearestPolice or any other facility
  const [routeTarget, setRouteTarget] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Active facility to navigate to
  const activeFacility = routeTarget || nearestHospital || allSorted[0];

  // Recalculate shortest route when device coordinates or route target changes
  useEffect(() => {
    if (!activeFacility || !activeFacility.coordinates) return;

    let isMounted = true;
    setIsLoadingRoute(true);

    fetchShortestRoute(
      telemetry.lat,
      telemetry.lng,
      activeFacility.coordinates.lat,
      activeFacility.coordinates.lng
    ).then(res => {
      if (isMounted) {
        setRouteData(res);
        setIsLoadingRoute(false);
      }
    });

    return () => { isMounted = false; };
  }, [telemetry.lat, telemetry.lng, activeFacility?.id]);

  // Filter responders according to active tab
  const displayedResponders = filterType === 'hospital' 
    ? hospitals 
    : filterType === 'police' 
      ? policeStations 
      : allSorted;

  // Browser Live Geolocation handler
  const handleUseBrowserGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        if (updateTelemetry) {
          updateTelemetry({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitudeMeters: Math.round(pos.coords.altitude || 210),
            gpsSatellites: 14
          });
        }
      },
      (err) => {
        setLocating(false);
        alert(`Could not fetch live GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePresetSelect = (preset) => {
    if (updateTelemetry) {
      updateTelemetry({
        lat: preset.lat,
        lng: preset.lng,
        gpsSatellites: 12
      });
    }
  };

  const isHospitalTarget = activeFacility?.type === 'Hospital';
  const routeThemeColor = isHospitalTarget ? '#10b981' : '#3b82f6';

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <MapPin size={22} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: 0, fontWeight: 800 }}>
                Live GPS & Nearest Emergency Responder Detection
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Real-time Haversine proximity & shortest road navigation route for {selectedVehicle.name} ({selectedVehicle.registrationNumber})
              </p>
            </div>
          </div>
        </div>

        {/* GPS Coordinates & Live GPS Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleUseBrowserGps}
            disabled={locating}
            className="btn btn-ghost"
            style={{ fontSize: '0.76rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <LocateFixed size={14} /> {locating ? 'Acquiring GPS...' : 'Use My Live Device GPS'}
          </button>

          <div className="glass-card" style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>GPS FIX</span>
              <div style={{ color: '#fbbf24', fontWeight: 700 }} className="mono">
                {telemetry.lat.toFixed(5)}°, {telemetry.lng.toFixed(5)}°
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>SATELLITES</span>
              <div style={{ color: '#34d399', fontWeight: 700 }}>
                {telemetry.gpsSatellites || 12} Sats (3D Fix)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Location Presets Switcher Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: '8px 12px',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Compass size={13} color="#f59e0b" /> Test Location:
        </span>
        {locationPresets.map(preset => {
          const isSelected = Math.abs(telemetry.lat - preset.lat) < 0.005 && Math.abs(telemetry.lng - preset.lng) < 0.005;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              style={{
                background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.07)',
                color: isSelected ? '#fbbf24' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* DEDICATED IMMEDIATE NEAREST RESPONDERS DUAL CARD (HOSPITAL + POLICE) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {/* Nearest Hospital Card */}
        <div 
          onClick={() => setRouteTarget(nearestHospital)}
          className="glass-card" 
          style={{
            padding: '18px',
            border: activeFacility?.id === nearestHospital?.id 
              ? '2px solid #10b981' 
              : '1px solid rgba(16, 185, 129, 0.35)',
            background: activeFacility?.id === nearestHospital?.id
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(16, 185, 129, 0.06) 100%)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-hospital" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} /> #1 NEAREST HOSPITAL
            </span>
            <div style={{ textAlign: 'right' }}>
              <span className="mono" style={{ fontSize: '0.92rem', color: '#34d399', fontWeight: 800 }}>
                {nearestHospital?.distance}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                (ETA {nearestHospital?.eta})
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.02rem', color: '#f8fafc', margin: '4px 0', fontWeight: 700 }}>
            {nearestHospital?.name}
          </h3>
          <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
            {nearestHospital?.address} &bull; Bearing: <strong style={{ color: '#cbd5e1' }}>{nearestHospital?.bearing}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', marginBottom: '14px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
            <div>
              <span style={{ color: '#64748b' }}>ICU Beds:</span>{' '}
              <strong style={{ color: '#34d399' }}>{nearestHospital?.icuBeds} Ready</strong>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '10px' }}>
              <span style={{ color: '#64748b' }}>Route:</span>{' '}
              <strong style={{ color: '#34d399' }}>
                {activeFacility?.id === nearestHospital?.id ? '✓ Displaying on Map' : 'Click to Plot Route'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
            <a 
              href={`tel:${nearestHospital?.emergencyHotline?.split('/')[0]?.trim() || nearestHospital?.phone}`} 
              className="btn btn-medical" 
              style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
            >
              <PhoneCall size={14} /> Call ER ({nearestHospital?.emergencyHotline?.split('/')[0]?.trim() || '102'})
            </a>
            <button
              onClick={() => setRouteTarget(nearestHospital)}
              className="btn btn-ghost" 
              style={{ padding: '7px 12px', fontSize: '0.78rem', borderColor: activeFacility?.id === nearestHospital?.id ? '#10b981' : undefined, color: '#34d399' }}
            >
              <Route size={14} /> {activeFacility?.id === nearestHospital?.id ? 'Routing' : 'Show Shortest Route'}
            </button>
          </div>
        </div>

        {/* Nearest Police Station Card */}
        <div 
          onClick={() => setRouteTarget(nearestPolice)}
          className="glass-card" 
          style={{
            padding: '18px',
            border: activeFacility?.id === nearestPolice?.id 
              ? '2px solid #3b82f6' 
              : '1px solid rgba(59, 130, 246, 0.35)',
            background: activeFacility?.id === nearestPolice?.id
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(59, 130, 246, 0.06) 100%)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-police" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldAlert size={13} /> #1 NEAREST POLICE STATION
            </span>
            <div style={{ textAlign: 'right' }}>
              <span className="mono" style={{ fontSize: '0.92rem', color: '#60a5fa', fontWeight: 800 }}>
                {nearestPolice?.distance}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                (ETA {nearestPolice?.eta})
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.02rem', color: '#f8fafc', margin: '4px 0', fontWeight: 700 }}>
            {nearestPolice?.name}
          </h3>
          <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
            Jurisdiction: {nearestPolice?.jurisdiction || nearestPolice?.address} &bull; Bearing: <strong style={{ color: '#cbd5e1' }}>{nearestPolice?.bearing}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', marginBottom: '14px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Active Patrols:</span>{' '}
              <strong style={{ color: '#60a5fa' }}>{nearestPolice?.patrolUnitsActive || 4} Interceptors</strong>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '10px' }}>
              <span style={{ color: '#64748b' }}>Route:</span>{' '}
              <strong style={{ color: '#60a5fa' }}>
                {activeFacility?.id === nearestPolice?.id ? '✓ Displaying on Map' : 'Click to Plot Route'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
            <a 
              href={`tel:${nearestPolice?.phone || '112'}`} 
              className="btn btn-police" 
              style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
            >
              <PhoneCall size={14} /> Dispatch Police ({nearestPolice?.phone || '112'})
            </a>
            <button
              onClick={() => setRouteTarget(nearestPolice)}
              className="btn btn-ghost" 
              style={{ padding: '7px 12px', fontSize: '0.78rem', borderColor: activeFacility?.id === nearestPolice?.id ? '#3b82f6' : undefined, color: '#60a5fa' }}
            >
              <Route size={14} /> {activeFacility?.id === nearestPolice?.id ? 'Routing' : 'Show Shortest Route'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Map Container */}
      <div className="glass-card" style={{ overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* Map Header Toolbar */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'rgba(10, 15, 26, 0.95)'
        }}>
          {/* Facility Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                background: filterType === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: filterType === 'all' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                color: filterType === 'all' ? '#f8fafc' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Responders ({allSorted.length})
            </button>
            <button
              onClick={() => setFilterType('hospital')}
              style={{
                background: filterType === 'hospital' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                border: filterType === 'hospital' ? '1px solid #10b981' : '1px solid transparent',
                color: filterType === 'hospital' ? '#34d399' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🏥 Hospitals ({hospitals.length})
            </button>
            <button
              onClick={() => setFilterType('police')}
              style={{
                background: filterType === 'police' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                border: filterType === 'police' ? '1px solid #3b82f6' : '1px solid transparent',
                color: filterType === 'police' ? '#60a5fa' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              👮 Police Stations ({policeStations.length})
            </button>
          </div>

          {/* Quick Route Switcher on Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Active Route:</span>
            <button
              onClick={() => setRouteTarget(nearestHospital)}
              style={{
                background: activeFacility?.id === nearestHospital?.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: activeFacility?.id === nearestHospital?.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeFacility?.id === nearestHospital?.id ? '#34d399' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🏥 Nearest Hospital
            </button>
            <button
              onClick={() => setRouteTarget(nearestPolice)}
              style={{
                background: activeFacility?.id === nearestPolice?.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: activeFacility?.id === nearestPolice?.id ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeFacility?.id === nearestPolice?.id ? '#60a5fa' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              👮 Nearest Police
            </button>
          </div>
        </div>

        {/* Leaflet Map with Real Shortest Road Route */}
        <div style={{ height: 'clamp(380px, 58vh, 540px)', position: 'relative' }}>
          <MapContainer 
            center={position} 
            zoom={14} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', background: '#090d16' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Vehicle Location Marker */}
            <Marker position={position} icon={createVehiclePin()}>
              <Popup>
                <div style={{ color: '#0f172a', padding: '6px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#ef4444' }}>🚨 {selectedVehicle.name} (SOS Device)</strong><br />
                  <span style={{ fontSize: '0.78rem' }}>Plate: <strong>{selectedVehicle.registrationNumber}</strong></span><br />
                  <span style={{ fontSize: '0.78rem' }}>GPS: {telemetry.lat.toFixed(5)}, {telemetry.lng.toFixed(5)}</span><br />
                  <span style={{ fontSize: '0.78rem' }}>Speed: {telemetry.speedKmh.toFixed(1)} km/h</span>
                </div>
              </Popup>
            </Marker>

            {/* Emergency Safety Geofence Circle */}
            <Circle 
              center={position} 
              radius={1000} 
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.04, weight: 1.5, dashArray: '6, 6' }} 
            />

            {/* THE POSSIBLE SHORTEST ROAD ROUTE (Following Real Street Geometry) */}
            {routeData && routeData.coordinates && routeData.coordinates.length > 0 && (
              <>
                {/* Outer Glow Aura for Contrast on Dark Map */}
                <Polyline 
                  positions={routeData.coordinates}
                  pathOptions={{ 
                    color: routeThemeColor, 
                    weight: 8, 
                    opacity: 0.35, 
                    lineCap: 'round',
                    lineJoin: 'round'
                  }} 
                />
                {/* Inner High-Contrast Shortest Road Route */}
                <Polyline 
                  positions={routeData.coordinates}
                  pathOptions={{ 
                    color: routeThemeColor, 
                    weight: 4.5, 
                    opacity: 0.95, 
                    lineCap: 'round',
                    lineJoin: 'round'
                  }} 
                />
              </>
            )}

            {/* Responders Markers */}
            {displayedResponders.map(r => {
              const isHosp = r.type === 'Hospital';
              const isNearestHosp = isHosp && r.id === nearestHospital?.id;
              const isNearestPol = !isHosp && r.id === nearestPolice?.id;
              const isSelected = activeFacility?.id === r.id;
              const pin = isHosp ? createHospitalPin(isNearestHosp, isSelected) : createPolicePin(isNearestPol, isSelected);

              return (
                <Marker 
                  key={r.id} 
                  position={[r.coordinates.lat, r.coordinates.lng]} 
                  icon={pin}
                  eventHandlers={{
                    click: () => setRouteTarget(r)
                  }}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', padding: '6px', minWidth: '190px' }}>
                      <strong style={{ fontSize: '0.88rem', color: isHosp ? '#059669' : '#1d4ed8' }}>
                        {isHosp ? '🏥' : '👮'} {r.name}
                      </strong>
                      <div style={{ fontSize: '0.76rem', color: '#475569', margin: '4px 0' }}>
                        Distance: <strong>{r.distance}</strong> &bull; ETA: <strong>{r.eta}</strong>
                      </div>
                      {isHosp && r.icuBeds !== undefined && (
                        <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                          ✓ {r.icuBeds} ICU Beds Open
                        </div>
                      )}
                      {!isHosp && r.jurisdiction && (
                        <div style={{ fontSize: '0.74rem', color: '#1d4ed8' }}>
                          Jurisdiction: {r.jurisdiction}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button
                          onClick={() => setRouteTarget(r)}
                          style={{
                            background: isHosp ? '#10b981' : '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Plot Shortest Route
                        </button>
                        <a 
                          href={r.googleMapsDirUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 700, alignSelf: 'center' }}
                        >
                          Google Maps
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* ACTIVE SHORTEST ROUTE FLOATING HUD / CARD */}
          <div className="map-hud-floating" style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'rgba(9, 13, 22, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${routeThemeColor}66`,
            borderRadius: '14px',
            padding: '16px',
            maxWidth: 'min(360px, calc(100% - 32px))',
            color: '#f8fafc',
            boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px ${routeThemeColor}33`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.74rem', color: routeThemeColor, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Route size={15} /> Shortest Road Route Plotted
              </div>
              {isLoadingRoute && (
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Loader2 size={12} className="spin" /> Calculating...
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0 6px 0' }}>
              {activeFacility?.name}
            </div>

            {/* Turn-by-Turn Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              marginBottom: '10px'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>ROAD DISTANCE</span>
                <div style={{ color: routeThemeColor, fontWeight: 800, fontSize: '0.92rem' }} className="mono">
                  {routeData ? routeData.distanceText : activeFacility?.distance}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>ESTIMATED TIME</span>
                <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.92rem' }}>
                  {routeData ? routeData.durationText : activeFacility?.eta}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Compass size={12} color="#64748b" />
              <span>Corridor: <strong style={{ color: '#cbd5e1' }}>{routeData?.summary || 'Fastest emergency path'}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={activeFacility?.googleMapsDirUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.76rem', borderColor: `${routeThemeColor}66`, color: routeThemeColor }}
              >
                <Navigation size={13} /> Turn-by-Turn GPS
              </a>
              <a 
                href={`tel:${activeFacility?.phone}`}
                className="btn btn-ghost"
                style={{ padding: '7px 12px', fontSize: '0.76rem' }}
              >
                <PhoneCall size={13} /> Call
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sorted Emergency Responders List */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Layers size={18} color="#f59e0b" /> Verified Emergency Facilities Ranked by Proximity ({displayedResponders.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Click any facility to plot its possible shortest road route on the map
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {displayedResponders.map(r => {
            const isHosp = r.type === 'Hospital';
            const isNearest = (isHosp && r.id === nearestHospital?.id) || (!isHosp && r.id === nearestPolice?.id);
            const isSelected = activeFacility?.id === r.id;

            return (
              <div 
                key={r.id}
                onClick={() => setRouteTarget(r)}
                style={{
                  background: isSelected 
                    ? (isHosp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)')
                    : isNearest 
                      ? (isHosp ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)') 
                      : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected 
                    ? `2px solid ${isHosp ? '#10b981' : '#3b82f6'}` 
                    : isNearest 
                      ? (isHosp ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)') 
                      : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${isHosp ? 'badge-hospital' : 'badge-police'}`}>
                        {isHosp ? '🏥 Hospital' : '👮 Police Station'}
                      </span>
                      {isNearest && (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          ★ CLOSEST
                        </span>
                      )}
                      {isSelected && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          ACTIVE ROUTE
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: '0.84rem', color: isHosp ? '#34d399' : '#60a5fa', fontWeight: 800 }}>
                        {r.distance}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>
                        ({r.eta})
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', margin: '4px 0 2px 0', fontWeight: 700 }}>
                    {r.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 6px 0' }}>
                    {r.address}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                    Bearing: <strong className="mono">{r.bearing}</strong> &bull; {isHosp ? `${r.icuBeds || 6} ICU Beds` : `Jurisdiction: ${r.jurisdiction || 'Highway Patrol'}`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }} onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setRouteTarget(r)}
                    className="btn btn-ghost" 
                    style={{ padding: '4px 10px', fontSize: '0.74rem', color: isSelected ? (isHosp ? '#34d399' : '#60a5fa') : undefined }}
                  >
                    <Route size={12} /> {isSelected ? 'Routing on Map' : 'Plot Route'}
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a 
                      href={`tel:${r.phone}`} 
                      className="btn btn-ghost" 
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                    >
                      <PhoneCall size={12} /> Call
                    </a>
                    <a 
                      href={r.googleMapsDirUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-ghost" 
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                    >
                      <Navigation size={12} /> GPS
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
