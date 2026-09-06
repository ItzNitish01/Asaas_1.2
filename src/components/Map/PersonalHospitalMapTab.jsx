import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  AlertTriangle, 
  PhoneCall, 
  Radio, 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Send, 
  Navigation, 
  User, 
  Sliders, 
  Zap, 
  Crosshair, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  BellRing,
  LocateFixed,
  Compass,
  Route,
  Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { findNearestEmergencyServices, locationPresets, fetchShortestRoute } from '../../services/geoService';

// Fix Leaflet icons
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

// Custom Leaflet Icons
const createUserLocationIcon = () => {
  if (!L || typeof L.divIcon !== 'function') return null;
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: pulse-emergency 1.8s infinite ease-out;"></div>
        <div style="background: #2563eb; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(37, 99, 235, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">🚗</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const createFacilityPinIcon = (facility, isTargeted, isAlertActive) => {
  if (!L || typeof L.divIcon !== 'function') return null;
  const isHosp = facility.type === 'Hospital';
  const bgColor = isAlertActive && isTargeted ? '#ef4444' : isHosp ? '#10b981' : '#2563eb';
  const iconSymbol = isHosp ? '🏥' : '👮';
  
  return L.divIcon({
    className: `custom-fac-pin-${facility.id}`,
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${(isAlertActive && isTargeted) || isTargeted ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${bgColor}44; animation: pulse-emergency 1.4s infinite;"></div>` : ''}
        <div style="background: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 14px ${bgColor}99; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; transition: transform 0.2s ease;">
          ${iconSymbol}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

export default function PersonalHospitalMapTab({ selectedVehicle, medicalProfile, telemetry, triggerEmergency, updateTelemetry }) {
  const userPosition = [telemetry.lat, telemetry.lng];

  // Component states
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'hospital' | 'police'
  const [onlyIcu, setOnlyIcu] = useState(false);
  const [locating, setLocating] = useState(false);

  // Compute live nearest emergency services dynamically
  const { nearestHospital, nearestPolice, allSorted, hospitals, policeStations } = 
    findNearestEmergencyServices(telemetry.lat, telemetry.lng);

  const [selectedFacility, setSelectedFacility] = useState(nearestHospital || allSorted[0]);
  const [routeData, setRouteData] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Keep selected facility in sync if location shifts
  useEffect(() => {
    if (nearestHospital && (!selectedFacility || selectedFacility.type === 'Hospital')) {
      setSelectedFacility(nearestHospital);
    }
  }, [telemetry.lat, telemetry.lng]);

  // Fetch shortest road route to selectedFacility
  useEffect(() => {
    if (!selectedFacility || !selectedFacility.coordinates) return;

    let isMounted = true;
    setIsLoadingRoute(true);

    fetchShortestRoute(
      telemetry.lat,
      telemetry.lng,
      selectedFacility.coordinates.lat,
      selectedFacility.coordinates.lng
    ).then(res => {
      if (isMounted) {
        setRouteData(res);
        setIsLoadingRoute(false);
      }
    });

    return () => { isMounted = false; };
  }, [telemetry.lat, telemetry.lng, selectedFacility?.id]);

  // Alert simulation state
  const [alertState, setAlertState] = useState({
    active: false,
    targetFacility: null,
    broadcast: false,
    stage: 0,
    timestamp: null,
    logEntries: []
  });

  // Filter facilities based on user inputs
  const filteredFacilities = allSorted.filter(fac => {
    const matchesCategory = categoryFilter === 'all' || 
      (categoryFilter === 'hospital' && fac.type === 'Hospital') || 
      (categoryFilter === 'police' && fac.type === 'Police Station');

    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (fac.address && fac.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRadius = fac.distanceKm <= radiusKm;
    const matchesIcu = !onlyIcu || (fac.icuBeds && fac.icuBeds > 0);

    return matchesCategory && matchesSearch && matchesRadius && matchesIcu;
  });

  // Alert progression simulation
  useEffect(() => {
    let timer;
    if (alertState.active && alertState.stage > 0 && alertState.stage < 4) {
      timer = setTimeout(() => {
        setAlertState(prev => {
          const nextStage = prev.stage + 1;
          let newLog = '';
          const targetName = prev.broadcast ? 'All Emergency Command Units' : prev.targetFacility?.name;

          if (nextStage === 2) {
            newLog = `t+3s: [CONFIRMED] Dispatch Controller at ${targetName} received patient telemetry payload.`;
          } else if (nextStage === 3) {
            newLog = `t+6s: [RESERVED] Emergency triage slot & blood packet (${medicalProfile?.bloodGroup}) staged.`;
          } else if (nextStage === 4) {
            newLog = `t+9s: [EN-ROUTE] Emergency Unit deployed with siren priority to ${telemetry.lat.toFixed(4)}°, ${telemetry.lng.toFixed(4)}°.`;
          }

          return {
            ...prev,
            stage: nextStage,
            logEntries: [...prev.logEntries, newLog]
          };
        });
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [alertState.active, alertState.stage]);

  const handleTriggerAlert = (facility) => {
    setSelectedFacility(facility);
    setAlertState({
      active: true,
      targetFacility: facility,
      broadcast: false,
      stage: 1,
      timestamp: new Date().toLocaleTimeString(),
      logEntries: [
        `t+0s: Emergency Alert dispatched to ${facility.name} (${facility.distance}, ETA ${facility.eta})`,
        `t+1s: Payload transmitted - GPS: ${telemetry.lat.toFixed(5)}, ${telemetry.lng.toFixed(5)} | Blood: ${medicalProfile?.bloodGroup} | Speed: ${telemetry.speedKmh.toFixed(1)} km/h`
      ]
    });

    if (triggerEmergency) {
      triggerEmergency('FACILITY_DIRECT_ALERT', 'CRITICAL', `Direct Emergency Alert Sent to ${facility.name}`);
    }
  };

  const handleBroadcastAlert = () => {
    setAlertState({
      active: true,
      targetFacility: null,
      broadcast: true,
      stage: 1,
      timestamp: new Date().toLocaleTimeString(),
      logEntries: [
        `t+0s: [BROADCAST] Multi-Agency Emergency Alert broadcasted to ${filteredFacilities.length} nearby response units!`,
        `t+1s: Payload sent - Vehicle: ${selectedVehicle.name} (${selectedVehicle.registrationNumber}) | Blood: ${medicalProfile?.bloodGroup}`
      ]
    });

    if (triggerEmergency) {
      triggerEmergency('FACILITY_BROADCAST', 'CRITICAL', `Broadcast SOS sent to ${filteredFacilities.length} Emergency Units`);
    }
  };

  const handleCancelAlert = () => {
    setAlertState({
      active: false,
      targetFacility: null,
      broadcast: false,
      stage: 0,
      timestamp: null,
      logEntries: []
    });
  };

  // Live GPS geolocation
  const handleUseBrowserGps = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not supported.');
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
            gpsSatellites: 14
          });
        }
      },
      (err) => {
        setLocating(false);
        alert(`Location acquisition error: ${err.message}`);
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

  return (
    <div className="tab-content-container">
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <Building2 size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', margin: 0, fontWeight: 800 }}>
                Emergency Facilities & Dispatch Console
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Real-time Haversine distance detection for nearest Trauma Hospitals and Police Stations
              </p>
            </div>
          </div>
        </div>

        {/* Live GPS & Broadcast Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleUseBrowserGps}
            disabled={locating}
            className="btn btn-ghost"
            style={{ fontSize: '0.76rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <LocateFixed size={14} /> {locating ? 'Acquiring GPS...' : 'Use Live Device GPS'}
          </button>

          {alertState.active ? (
            <button 
              onClick={handleCancelAlert}
              className="btn btn-outline-danger"
              style={{ fontSize: '0.8rem' }}
            >
              <RefreshCw size={15} /> Reset Active Alert
            </button>
          ) : (
            <button 
              onClick={handleBroadcastAlert}
              className="btn btn-emergency pulse-red"
              style={{ fontSize: '0.82rem' }}
            >
              <Radio size={16} /> Broadcast Emergency Signal
            </button>
          )}
        </div>
      </div>

      {/* GPS Location Presets Switcher Bar */}
      <div 
        className="touch-scroll-x no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '8px 12px',
          overflowX: 'auto'
        }}
      >
        <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Compass size={13} color="#f59e0b" /> Simulate Location:
        </span>
        {locationPresets.map(preset => {
          const isSelected = Math.abs(telemetry.lat - preset.lat) < 0.005 && Math.abs(telemetry.lng - preset.lng) < 0.005;
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              style={{
                background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.07)',
                color: isSelected ? '#34d399' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 700 : 500
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* PROMINENT DUAL NEAREST RESPONDERS CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
        {/* Closest Hospital */}
        <div className="glass-card" style={{
          padding: '16px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="badge badge-hospital">
              <Building2 size={13} /> #1 NEAREST HOSPITAL
            </span>
            <span className="mono" style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 800 }}>
              {nearestHospital?.distance} &bull; {nearestHospital?.eta}
            </span>
          </div>
          <h4 style={{ fontSize: '0.98rem', color: '#f8fafc', margin: '4px 0', fontWeight: 700 }}>
            {nearestHospital?.name}
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
            {nearestHospital?.address} &bull; Bearing: {nearestHospital?.bearing}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleTriggerAlert(nearestHospital)}
              className="btn btn-medical"
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.76rem' }}
            >
              <Radio size={13} /> Direct Alert ER
            </button>
            <a 
              href={`tel:${nearestHospital?.emergencyHotline?.split('/')[0]?.trim() || nearestHospital?.phone}`}
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
            >
              <PhoneCall size={13} /> Call
            </a>
            <a 
              href={nearestHospital?.googleMapsDirUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
            >
              <Navigation size={13} /> Route
            </a>
          </div>
        </div>

        {/* Closest Police Station */}
        <div className="glass-card" style={{
          padding: '16px',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(59, 130, 246, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="badge badge-police">
              <ShieldAlert size={13} /> #1 NEAREST POLICE STATION
            </span>
            <span className="mono" style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 800 }}>
              {nearestPolice?.distance} &bull; {nearestPolice?.eta}
            </span>
          </div>
          <h4 style={{ fontSize: '0.98rem', color: '#f8fafc', margin: '4px 0', fontWeight: 700 }}>
            {nearestPolice?.name}
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
            Jurisdiction: {nearestPolice?.jurisdiction || nearestPolice?.address} &bull; Bearing: {nearestPolice?.bearing}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleTriggerAlert(nearestPolice)}
              className="btn btn-police"
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.76rem' }}
            >
              <Radio size={13} /> Dispatch Police
            </button>
            <a 
              href={`tel:${nearestPolice?.phone || '112'}`}
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
            >
              <PhoneCall size={13} /> Call
            </a>
            <a 
              href={nearestPolice?.googleMapsDirUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
            >
              <Navigation size={13} /> Route
            </a>
          </div>
        </div>
      </div>

      {/* Active Alert Banner (When Dispatched) */}
      {alertState.active && (
        <div className="glass-card-emergency" style={{ padding: '18px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BellRing size={24} color="#ef4444" className="pulse-red" />
              <div>
                <div style={{ color: '#fca5a5', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {alertState.broadcast ? 'MULTI-AGENCY BROADCAST ACTIVE' : 'DIRECT EMERGENCY SIGNAL TRANSMITTED'}
                </div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '2px 0' }}>
                  {alertState.broadcast ? `Alert Active Across ${filteredFacilities.length} Response Hubs` : `Target: ${alertState.targetFacility?.name}`}
                </h3>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TRANSMISSION TIME</span>
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }} className="mono">
                {alertState.timestamp}
              </div>
            </div>
          </div>

          {/* 4-Stage Progress Tracker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {[
              { step: 1, title: '1. SOS Dispatched', desc: 'GPS & Telemetry Sent' },
              { step: 2, title: '2. Unit Acknowledged', desc: 'Control Post Notified' },
              { step: 3, title: '3. Staging Resource', desc: `Triage / Interceptor Mount` },
              { step: 4, title: '4. Unit En-Route', desc: 'Active Sirens Clearance' }
            ].map(s => {
              const isPassed = alertState.stage >= s.step;
              const isCurrent = alertState.stage === s.step;
              return (
                <div 
                  key={s.step}
                  style={{
                    background: isPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent ? '1.5px solid #ef4444' : isPassed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '8px 12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isPassed ? '#34d399' : '#94a3b8' }}>
                      {s.title}
                    </span>
                    {isPassed ? <CheckCircle2 size={13} color="#34d399" /> : isCurrent ? <Activity size={13} color="#ef4444" /> : <Clock size={13} color="#64748b" />}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{s.desc}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '12px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#34d399', maxHeight: '80px', overflowY: 'auto' }}>
            {alertState.logEntries.map((log, idx) => (
              <div key={idx}>➜ {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Controls & Map | Right Selected Facility & Telemetry Payload */}
      <div className="map-split-layout">
        
        {/* Left Column: Filter Bar & Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '200px', flex: 1 }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search hospital or police station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Category Segmented Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCategoryFilter('all')}
                style={{
                  background: categoryFilter === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  color: categoryFilter === 'all' ? '#fff' : '#94a3b8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All ({allSorted.length})
              </button>
              <button
                onClick={() => setCategoryFilter('hospital')}
                style={{
                  background: categoryFilter === 'hospital' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  border: 'none',
                  color: categoryFilter === 'hospital' ? '#34d399' : '#94a3b8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🏥 Hospitals ({hospitals.length})
              </button>
              <button
                onClick={() => setCategoryFilter('police')}
                style={{
                  background: categoryFilter === 'police' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: 'none',
                  color: categoryFilter === 'police' ? '#60a5fa' : '#94a3b8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                👮 Police ({policeStations.length})
              </button>
            </div>

            {/* Radius Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>RADIUS:</span>
              {[5, 10, 20].map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: radiusKm === r ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: radiusKm === r ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                    color: radiusKm === r ? '#34d399' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Map View */}
          <div className="glass-card" style={{ height: 'clamp(380px, 55vh, 520px)', overflow: 'hidden', position: 'relative' }}>
            <MapContainer 
              center={userPosition} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%', background: '#090d16' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* User Position */}
              <Marker position={userPosition} icon={createUserLocationIcon()}>
                <Popup>
                  <div style={{ color: '#0f172a', padding: '4px' }}>
                    <strong>🚨 {selectedVehicle.name}</strong><br />
                    <span>Reg: {selectedVehicle.registrationNumber}</span><br />
                    <span>GPS: {telemetry.lat.toFixed(4)}, {telemetry.lng.toFixed(4)}</span>
                  </div>
                </Popup>
              </Marker>

              {/* Proximity Circle */}
              <Circle 
                center={userPosition} 
                radius={radiusKm * 1000} 
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.04, weight: 1.5, dashArray: '6, 8' }} 
              />

              {/* Shortest Road Route Polyline Following Real Street Geometry */}
              {routeData && routeData.coordinates && routeData.coordinates.length > 0 && (
                <>
                  <Polyline 
                    positions={routeData.coordinates}
                    pathOptions={{ 
                      color: selectedFacility.type === 'Hospital' ? '#10b981' : '#3b82f6', 
                      weight: 8, 
                      opacity: 0.35, 
                      lineCap: 'round',
                      lineJoin: 'round'
                    }} 
                  />
                  <Polyline 
                    positions={routeData.coordinates}
                    pathOptions={{ 
                      color: selectedFacility.type === 'Hospital' ? '#10b981' : '#3b82f6', 
                      weight: 4.5, 
                      opacity: 0.95, 
                      lineCap: 'round',
                      lineJoin: 'round'
                    }} 
                  />
                </>
              )}

              {/* Facilities */}
              {filteredFacilities.map(fac => {
                const isTargeted = selectedFacility?.id === fac.id;
                return (
                  <Marker 
                    key={fac.id} 
                    position={[fac.coordinates.lat, fac.coordinates.lng]} 
                    icon={createFacilityPinIcon(fac, isTargeted, alertState.active)}
                    eventHandlers={{ click: () => setSelectedFacility(fac) }}
                  >
                    <Popup>
                      <div style={{ color: '#0f172a', padding: '6px', minWidth: '180px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: fac.type === 'Hospital' ? '#059669' : '#1d4ed8' }}>
                            {fac.type === 'Hospital' ? '🏥 Hospital' : '👮 Police'}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>{fac.distance}</span>
                        </div>
                        <strong style={{ fontSize: '0.88rem' }}>{fac.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#475569', margin: '4px 0' }}>
                          ETA: <strong>{fac.eta}</strong> &bull; Bearing: <strong>{fac.bearing}</strong>
                        </div>
                        <button
                          onClick={() => handleTriggerAlert(fac)}
                          style={{
                            marginTop: '6px',
                            width: '100%',
                            padding: '4px 8px',
                            background: fac.type === 'Hospital' ? '#10b981' : '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Alert This Unit
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Active Route HUD Overlay */}
            {selectedFacility && (
              <div 
                className="map-hud-floating"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  zIndex: 1000,
                  background: 'rgba(9, 13, 22, 0.94)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${selectedFacility.type === 'Hospital' ? '#10b981' : '#3b82f6'}66`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  maxWidth: 'min(340px, calc(100% - 32px))',
                  color: '#fff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: selectedFacility.type === 'Hospital' ? '#34d399' : '#60a5fa', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Route size={13} /> Shortest Road Route Plotted
                  </span>
                  {isLoadingRoute && (
                    <span style={{ fontSize: '0.68rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Loader2 size={11} className="spin" /> Calculating...
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedFacility.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Road Distance: <strong style={{ color: selectedFacility.type === 'Hospital' ? '#34d399' : '#60a5fa' }}>{routeData ? routeData.distanceText : selectedFacility.distance}</strong> &bull; ETA: <strong style={{ color: '#fbbf24' }}>{routeData ? routeData.durationText : selectedFacility.eta}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Unit Details & Payload Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Selected Facility Card */}
          {selectedFacility && (
            <div className="glass-card" style={{ padding: '16px', border: selectedFacility.type === 'Hospital' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className={`badge ${selectedFacility.type === 'Hospital' ? 'badge-hospital' : 'badge-police'}`}>
                  {selectedFacility.type === 'Hospital' ? '🏥 Hospital' : '👮 Police Station'}
                </span>
                <span className="mono" style={{ fontSize: '0.82rem', color: selectedFacility.type === 'Hospital' ? '#34d399' : '#60a5fa', fontWeight: 800 }}>
                  {selectedFacility.distance} ({selectedFacility.eta})
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '4px 0 6px 0', fontWeight: 700 }}>
                {selectedFacility.name}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                {selectedFacility.address}
              </p>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', fontSize: '0.74rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>BEARING:</span>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }} className="mono">{selectedFacility.bearing}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>HOTLINE:</span>
                  <div style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedFacility.phone}</div>
                </div>
                {selectedFacility.icuBeds !== undefined && (
                  <div>
                    <span style={{ color: '#64748b' }}>ICU BEDS:</span>
                    <div style={{ color: '#34d399', fontWeight: 700 }}>{selectedFacility.icuBeds} Open</div>
                  </div>
                )}
                {selectedFacility.patrolUnitsActive !== undefined && (
                  <div>
                    <span style={{ color: '#64748b' }}>PATROLS:</span>
                    <div style={{ color: '#60a5fa', fontWeight: 700 }}>{selectedFacility.patrolUnitsActive} Active</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleTriggerAlert(selectedFacility)}
                  className={selectedFacility.type === 'Hospital' ? 'btn btn-medical' : 'btn btn-police'}
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                >
                  <Radio size={14} /> Send Priority Dispatch Alert
                </button>
                <a 
                  href={`tel:${selectedFacility.phone}`}
                  className="btn btn-ghost"
                  style={{ width: '100%', padding: '7px', fontSize: '0.76rem' }}
                >
                  <PhoneCall size={13} /> Call {selectedFacility.phone}
                </a>
                <a 
                  href={selectedFacility.googleMapsDirUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  style={{ width: '100%', padding: '7px', fontSize: '0.76rem' }}
                >
                  <Navigation size={13} /> Navigate Route
                </a>
              </div>
            </div>
          )}

          {/* Dossier Transmit Preview */}
          <div className="glass-card" style={{ padding: '14px', background: 'rgba(10, 15, 26, 0.95)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} /> Automated Dispatch Payload
            </div>
            <div style={{ background: '#070b12', padding: '10px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>
              <div>DRIVER: <strong style={{ color: '#fff' }}>{medicalProfile?.fullName}</strong></div>
              <div>BLOOD: <strong style={{ color: '#ef4444' }}>{medicalProfile?.bloodGroup}</strong></div>
              <div>ALLERGIES: <span style={{ color: '#f59e0b' }}>{medicalProfile?.allergies?.join(', ') || 'None'}</span></div>
              <div>SPEED: <strong style={{ color: '#fff' }}>{telemetry.speedKmh.toFixed(1)} km/h</strong></div>
              <div>G-FORCE: <strong style={{ color: '#10b981' }}>{telemetry.totalGForce.toFixed(2)}g</strong></div>
              <div>COORDS: <strong style={{ color: '#fbbf24' }}>{telemetry.lat.toFixed(4)}, {telemetry.lng.toFixed(4)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
