import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Shield, 
  Clock, 
  Ambulance, 
  Radio, 
  Send,
  Navigation,
  Activity,
  Compass,
  Bell,
  Sliders,
  Plus,
  Edit3,
  Trash2,
  X,
  FileText,
  ShieldCheck,
  Moon,
  Zap,
  PhoneCall,
  UserPlus,
  RotateCcw
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function GuardianPortalTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [activeSubTab, setActiveSubTab] = useState('radar'); // 'radar' | 'family' | 'geofence' | 'behavior' | 'medical'

  // Family Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memName, setMemName] = useState('');
  const [memRelation, setMemRelation] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memVehicleName, setMemVehicleName] = useState('');
  const [memVehiclePlate, setMemVehiclePlate] = useState('');
  const [memVehicleType, setMemVehicleType] = useState('four-wheeler');
  const [memBloodGroup, setMemBloodGroup] = useState('O+');

  // Geofence Modal State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneName, setZoneName] = useState('');
  const [zoneAddress, setZoneAddress] = useState('');
  const [zoneRadius, setZoneRadius] = useState('500');
  const [zoneCategory, setZoneCategory] = useState('General');
  const [zoneAlertExit, setZoneAlertExit] = useState(true);
  const [zoneAlertEntry, setZoneAlertEntry] = useState(true);

  // Settings State
  const [speedThreshold, setSpeedThreshold] = useState(
    cloudDb.state.guardianSettings?.speedAlertThresholdKmh || 85
  );
  const [curfewActive, setCurfewActive] = useState(
    cloudDb.state.guardianSettings?.curfewAlertEnabled !== false
  );
  const [savedToast, setSavedToast] = useState('');

  useEffect(() => {
    cloudDb.syncFromBackend?.();
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const handleResetDemo = () => {
    if (window.confirm('Reset emergency state across all connected devices?')) {
      cloudDb.resetDemoState(true);
      setSavedToast('Emergency state reset to standby across all stations');
      setTimeout(() => setSavedToast(''), 3000);
    }
  };

  const activeIncident = dbState.activeIncident;
  const dispatches = dbState.dispatches.hospital;
  const policeDispatches = dbState.dispatches.police;
  const patient = dbState.medicalProfile;
  const telemetry = dbState.telemetry;
  const familyMembers = dbState.familyMembers || [];
  const geofenceZones = dbState.geofenceZones || [];
  const selectedMemberId = dbState.selectedFamilyMemberId || familyMembers[0]?.id;
  const selectedMember = familyMembers.find(m => m.id === selectedMemberId) || familyMembers[0] || {};

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemName('');
    setMemRelation('');
    setMemPhone('');
    setMemVehicleName('');
    setMemVehiclePlate('');
    setMemVehicleType('four-wheeler');
    setMemBloodGroup('O+');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m) => {
    setEditingMember(m);
    setMemName(m.name || '');
    setMemRelation(m.relation || '');
    setMemPhone(m.phone || '');
    setMemVehicleName(m.vehicleName || '');
    setMemVehiclePlate(m.vehiclePlate || '');
    setMemVehicleType(m.vehicleType || 'four-wheeler');
    setMemBloodGroup(m.bloodGroup || 'O+');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      cloudDb.updateFamilyMember(editingMember.id, {
        name: memName,
        relation: memRelation,
        phone: memPhone,
        vehicleName: memVehicleName,
        vehiclePlate: memVehiclePlate,
        vehicleType: memVehicleType,
        bloodGroup: memBloodGroup
      });
    } else {
      cloudDb.addFamilyMember({
        name: memName,
        relation: memRelation,
        phone: memPhone,
        vehicleName: memVehicleName,
        vehiclePlate: memVehiclePlate,
        vehicleType: memVehicleType,
        bloodGroup: memBloodGroup,
        avatar: memVehicleType === 'two-wheeler' ? '🛵' : '🚗'
      });
    }
    setIsMemberModalOpen(false);
  };

  const handleOpenAddZone = () => {
    setEditingZone(null);
    setZoneName('');
    setZoneAddress('');
    setZoneRadius('500');
    setZoneCategory('General');
    setZoneAlertExit(true);
    setZoneAlertEntry(true);
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (z) => {
    setEditingZone(z);
    setZoneName(z.name || '');
    setZoneAddress(z.address || '');
    setZoneRadius(String(z.radiusMeters || 500));
    setZoneCategory(z.category || 'General');
    setZoneAlertExit(z.alertOnExit !== false);
    setZoneAlertEntry(z.alertOnEntry !== false);
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = (e) => {
    e.preventDefault();
    if (editingZone) {
      cloudDb.updateGeofenceZone(editingZone.id, {
        name: zoneName,
        address: zoneAddress,
        radiusMeters: Number(zoneRadius),
        category: zoneCategory,
        alertOnExit: zoneAlertExit,
        alertOnEntry: zoneAlertEntry
      });
    } else {
      cloudDb.addGeofenceZone({
        name: zoneName,
        address: zoneAddress,
        radiusMeters: Number(zoneRadius),
        category: zoneCategory,
        alertOnExit: zoneAlertExit,
        alertOnEntry: zoneAlertEntry,
        color: zoneCategory === 'Home' ? '#10b981' : zoneCategory === 'Office' ? '#38bdf8' : '#c084fc'
      });
    }
    setIsZoneModalOpen(false);
  };

  const handleSaveSettings = () => {
    cloudDb.updateGuardianSettings({
      speedAlertThresholdKmh: Number(speedThreshold),
      curfewAlertEnabled: curfewActive
    });
    setSavedToast('Guardian alert preferences synced to cloud!');
    setTimeout(() => setSavedToast(''), 3000);
  };

  return (
    <div className="terminal-container" style={{
      padding: '16px',
      maxWidth: '1240px',
      margin: '0 auto',
      color: '#f1f5f9',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Guardian Header */}
      <div style={{
        background: 'linear-gradient(90deg, #3b0764 0%, #1e1b4b 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.2)',
            border: '2px solid #c084fc',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 3.8vw, 1.25rem)', fontWeight: 800, color: '#fff' }}>
                FAMILY GUARDIAN SAFETY PORTAL
              </h1>
              <span style={{
                background: '#7e22ce',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                PRIMARY ICE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              Logged in as Sarah Mercer (Spouse) • Monitoring: {selectedMember.name} ({selectedMember.vehiclePlate})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#d8b4fe',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Radio size={14} />
            <span>Room: {dbState.roomId}</span>
          </div>

          <button
            onClick={handleResetDemo}
            title="Reset incident across all devices"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Standby</span>
          </button>
        </div>
      </div>

      {/* Operations Sub-Tab Switcher Strip */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { id: 'radar', label: 'Emergency Rescue Radar', icon: Activity, alertBadge: activeIncident ? 'ALERT' : null },
          { id: 'family', label: `Family Vehicles (${familyMembers.length})`, icon: Car },
          { id: 'geofence', label: `Safe Zones & Curfew (${geofenceZones.length})`, icon: MapPin },
          { id: 'behavior', label: 'Speed & Driving Safety', icon: Sliders },
          { id: 'medical', label: 'Family Medical Passport', icon: Heart }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#f3e8ff' : '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#c084fc' : '#94a3b8'} />
              <span>{tab.label}</span>
              {tab.alertBadge && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  {tab.alertBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: EMERGENCY RESCUE RADAR                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'radar' && (
        <div>
          {/* Live Incident Alert Card */}
          {activeIncident ? (
            <div style={{
              background: 'radial-gradient(ellipse at top, rgba(220, 38, 38, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 0 35px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '12px',
                  animation: 'pulse 1s infinite'
                }}>
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                    🚨 EMERGENCY CRASH ALERT: {selectedMember.name.toUpperCase()}'S VEHICLE INVOLVED IN ACCIDENT
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '3px' }}>
                    Detected at {activeIncident.date} • Peak Deceleration Force: <strong>{activeIncident.peakGForce}</strong> • Speed at Impact: <strong>{activeIncident.speedAtImpact}</strong>
                  </div>
                </div>
              </div>

              {/* 6-Stage Emergency Rescue Progress Lifecycle */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#10b981" /> 6-STAGE EMERGENCY RESCUE LIFECYCLE
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '8px'
                }}>
                  {[
                    { step: '1. ESP32 Impact', desc: 'G-Force Decel', active: true, color: '#10b981' },
                    { step: '2. Cloud SOS', desc: 'Global Alert', active: true, color: '#10b981' },
                    { 
                      step: '3. ALS 108 EMS', 
                      desc: dispatches.ambulanceStatus === 'dispatched' ? 'En Route (8m)' : 'Standby', 
                      active: dispatches.ambulanceStatus === 'dispatched', 
                      color: dispatches.ambulanceStatus === 'dispatched' ? '#10b981' : '#f59e0b' 
                    },
                    { 
                      step: '4. Police PCR', 
                      desc: policeDispatches.pcrStatus === 'dispatched' ? 'Unit #07 En Route' : 'Alerted', 
                      active: policeDispatches.pcrStatus === 'dispatched', 
                      color: policeDispatches.pcrStatus === 'dispatched' ? '#10b981' : '#f59e0b' 
                    },
                    { 
                      step: '5. Green Corridor', 
                      desc: policeDispatches.greenCorridorActive ? 'Waves Armed' : 'Standby', 
                      active: policeDispatches.greenCorridorActive, 
                      color: policeDispatches.greenCorridorActive ? '#10b981' : '#64748b' 
                    },
                    { 
                      step: '6. Trauma Bay', 
                      desc: dispatches.icuBedReserved ? 'Bay #04 Locked' : 'Pre-matching', 
                      active: dispatches.icuBedReserved, 
                      color: dispatches.icuBedReserved ? '#10b981' : '#64748b' 
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: item.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: item.active ? `1px solid ${item.color}` : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: item.color }}>{item.step}</div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Calling Hub */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={`tel:${selectedMember.phone}`}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <PhoneCall size={16} /> Call Driver ({selectedMember.phone})
                </a>

                <a
                  href="tel:+919810110801"
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Ambulance size={16} /> Call Ambulance Lead (+91 98101 10801)
                </a>

                <a
                  href="tel:+911126598655"
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Heart size={16} /> Call AIIMS ER Trauma Desk
                </a>

                <a
                  href="tel:112"
                  style={{
                    background: 'rgba(56, 189, 248, 0.25)',
                    border: '1px solid #38bdf8',
                    color: '#7dd3fc',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Shield size={16} /> Call Police PCR (112)
                </a>

                <button
                  onClick={handleResetDemo}
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={16} /> Mark Safe & Stop Alert
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '14px',
                  borderRadius: '12px'
                }}>
                  <CheckCircle2 size={36} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.2rem', fontWeight: 800 }}>
                    ALL MONITORED FAMILY VEHICLES SAFE & NORMAL
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                    {selectedMember.name}'s vehicle is transmitting normal telemetry. Current speed: {telemetry.speedKmh ? telemetry.speedKmh.toFixed(0) : 0} km/h • G-Force: {telemetry.totalGForce ? telemetry.totalGForce.toFixed(2) : '1.01'}g.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#6ee7b7',
                  border: '1px solid #10b981'
                }}>
                  ✓ Real-Time GPS Active
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#7dd3fc',
                  border: '1px solid #38bdf8'
                }}>
                  ✓ Crash Sensors Armed
                </span>
              </div>
            </div>
          )}

          {/* Monitored Driver Live Telemetry Overview */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#c084fc" /> Active Telemetry Dossier: {selectedMember.name} ({selectedMember.vehicleName})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>LIVE SPEED</div>
                <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.2rem', marginTop: '2px' }}>
                  {telemetry.speedKmh ? telemetry.speedKmh.toFixed(0) : 0} km/h
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Below {speedThreshold} km/h safety limit</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>G-FORCE LOAD</div>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem', marginTop: '2px' }}>
                  {telemetry.totalGForce ? telemetry.totalGForce.toFixed(2) : '1.00'}g
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Normal gravitational baseline</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CURRENT LOCATION</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginTop: '2px' }}>
                  {selectedMember.lastLocation}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#60a5fa' }}>GPS: 28.4595° N, 77.0266° E</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SAFE ZONE STATUS</div>
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem', marginTop: '2px' }}>
                  Inside {selectedMember.activeSafeZone || 'Safe Corridor'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Geofence radius: 1000m</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MONITORED FAMILY MEMBERS & VEHICLES (CRUD)                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'family' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Registered Family Vehicles & Commuters</h2>
            <button
              onClick={handleOpenAddMember}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <UserPlus size={16} /> Add Family Member
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {familyMembers.map(member => {
              const isSelected = member.id === selectedMemberId;
              return (
                <div
                  key={member.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: isSelected ? '2px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem'
                        }}>
                          {member.avatar || '👤'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{member.name}</h3>
                            {member.isPrimary && (
                              <span style={{ fontSize: '0.65rem', background: '#7e22ce', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Primary</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>{member.relation}</div>
                        </div>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: member.currentStatus?.includes('Driving') ? 'rgba(56, 189, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                        color: member.currentStatus?.includes('Driving') ? '#7dd3fc' : '#6ee7b7',
                        border: member.currentStatus?.includes('Driving') ? '1px solid #38bdf8' : '1px solid #10b981'
                      }}>
                        {member.currentStatus}
                      </span>
                    </div>

                    <div style={{
                      marginTop: '14px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Vehicle:</span><br />
                        <strong style={{ color: '#fff' }}>{member.vehicleName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Number Plate:</span><br />
                        <strong style={{ color: '#fbbf24' }}>{member.vehiclePlate}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Phone:</span><br />
                        <strong style={{ color: '#e2e8f0' }}>{member.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Blood Group:</span><br />
                        <strong style={{ color: '#ef4444' }}>{member.bloodGroup || 'O+'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '12px'
                  }}>
                    <button
                      onClick={() => cloudDb.setSelectedFamilyMember(member.id)}
                      style={{
                        background: isSelected ? '#7e22ce' : 'rgba(255,255,255,0.06)',
                        border: isSelected ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.12)',
                        color: isSelected ? '#fff' : '#cbd5e1',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ Active Track' : 'Monitor Live'}
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEditMember(member)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                        title="Edit Member"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => cloudDb.deleteFamilyMember(member.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
                        title="Delete Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: GEOFENCING & SAFE ZONES (CRUD)                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'geofence' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Geofence Safe Zones & Curfew Radar</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Instant notifications when family members enter or leave designated safety boundaries
              </p>
            </div>
            <button
              onClick={handleOpenAddZone}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Safe Zone
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {geofenceZones.map(zone => (
              <div
                key={zone.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: zone.status === 'ACTIVE' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MapPin size={18} color="#c084fc" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#fff' }}>{zone.name}</h3>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{zone.category} • Radius {zone.radiusMeters}m</div>
                      </div>
                    </div>

                    <button
                      onClick={() => cloudDb.toggleGeofenceZone(zone.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: zone.status === 'ACTIVE' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        background: zone.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255,255,255,0.04)',
                        color: zone.status === 'ACTIVE' ? '#6ee7b7' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {zone.status === 'ACTIVE' ? '● ACTIVE' : '○ PAUSED'}
                    </button>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '10px 0 0 0' }}>
                    {zone.address}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: zone.alertOnEntry ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.04)',
                      color: zone.alertOnEntry ? '#7dd3fc' : '#64748b'
                    }}>
                      {zone.alertOnEntry ? '✓ Entry Alert' : '✕ No Entry Alert'}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: zone.alertOnExit ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.04)',
                      color: zone.alertOnExit ? '#fbbf24' : '#64748b'
                    }}>
                      {zone.alertOnExit ? '✓ Exit Alert' : '✕ No Exit Alert'}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '10px'
                }}>
                  <button
                    onClick={() => handleOpenEditZone(zone)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                    title="Edit Safe Zone"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => cloudDb.deleteGeofenceZone(zone.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
                    title="Delete Safe Zone"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SPEED & DRIVING BEHAVIOR                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'behavior' && (
        <div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#c084fc" /> Driving Safety & Speed Alert Thresholds
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Max Speed Alert Slider */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>Over-Speed Alert Threshold</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>{speedThreshold} km/h</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0 0 14px 0' }}>
                  Send instantaneous SMS and push notifications to Sarah Mercer if vehicle exceeds this limit.
                </p>
                <input
                  type="range"
                  min="50"
                  max="140"
                  step="5"
                  value={speedThreshold}
                  onChange={(e) => setSpeedThreshold(e.target.value)}
                  style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                  <span>50 km/h (City)</span>
                  <span>90 km/h (Highway)</span>
                  <span>140 km/h (Expressway)</span>
                </div>
              </div>

              {/* Late Night Curfew Monitor */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Moon size={16} color="#fbbf24" /> Late-Night Curfew Alert
                  </span>
                  <button
                    onClick={() => setCurfewActive(prev => !prev)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: curfewActive ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: curfewActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255,255,255,0.04)',
                      color: curfewActive ? '#6ee7b7' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {curfewActive ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                  Triggers immediate notification if vehicle starts moving between <strong>11:00 PM and 05:00 AM</strong>.
                </p>
                <div style={{ fontSize: '0.76rem', color: '#10b981' }}>
                  ✓ Monitored on all active family vehicles
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px', alignItems: 'center' }}>
              {savedToast && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{savedToast}</span>}
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: FAMILY MEDICAL PASSPORT & INSURANCE                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'medical' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="#ef4444" /> {selectedMember.name}'s Medical ID & Insurance Dossier
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>FULL NAME</div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>{patient.fullName}</div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Age {patient.age} • Male</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>BLOOD GROUP</div>
              <div style={{ fontWeight: 900, color: '#ef4444', fontSize: '1.3rem', marginTop: '2px' }}>{patient.bloodGroup}</div>
              <div style={{ fontSize: '0.74rem', color: '#10b981' }}>Organ Donor Registered</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CRITICAL ALLERGIES</div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.88rem', marginTop: '2px' }}>
                {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || 'None')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Alerted to Trauma ER</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>HEALTH INSURANCE</div>
              <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.88rem', marginTop: '2px' }}>Star Health Comprehensive</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Policy: SH-88492019-X (Cashless)</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={24} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6ee7b7' }}>
                Pre-Authorized Surgical Consent Active
              </div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '2px' }}>
                Sarah Mercer has digitally pre-authorized attending trauma surgeons at accredited hospitals (including AIIMS Apex Trauma) to initiate emergency life-saving procedures without administrative delays.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Family Member Modal */}
      {isMemberModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveMember} style={{
            background: '#0b1329',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                {editingMember ? 'Edit Family Member' : 'Register Family Member & Vehicle'}
              </h3>
              <button type="button" onClick={() => setIsMemberModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Mercer"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Son / Daughter / Parent"
                  value={memRelation}
                  onChange={(e) => setMemRelation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98000..."
                    value={memPhone}
                    onChange={(e) => setMemPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Blood Group</label>
                  <select
                    value={memBloodGroup}
                    onChange={(e) => setMemBloodGroup(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg} style={{ background: '#0f172a' }}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vehicle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda Activa 6G"
                    value={memVehicleName}
                    onChange={(e) => setMemVehicleName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Number Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-04-XY-8821"
                    value={memVehiclePlate}
                    onChange={(e) => setMemVehiclePlate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '9px 16px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Geofence Zone Modal */}
      {isZoneModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveZone} style={{
            background: '#0b1329',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                {editingZone ? 'Edit Safe Zone' : 'Create Geofence Safe Zone'}
              </h3>
              <button type="button" onClick={() => setIsZoneModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Sanctuary / Office"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Address / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 56, Gurugram"
                  value={zoneAddress}
                  onChange={(e) => setZoneAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Radius (meters)</label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="50"
                    value={zoneRadius}
                    onChange={(e) => setZoneRadius(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={zoneCategory}
                    onChange={(e) => setZoneCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  >
                    <option value="Home" style={{ background: '#0f172a' }}>Home</option>
                    <option value="Office" style={{ background: '#0f172a' }}>Office / Work</option>
                    <option value="Education" style={{ background: '#0f172a' }}>School / College</option>
                    <option value="Fitness" style={{ background: '#0f172a' }}>Gym / Sports</option>
                    <option value="General" style={{ background: '#0f172a' }}>General Zone</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={zoneAlertEntry}
                    onChange={(e) => setZoneAlertEntry(e.target.checked)}
                  />
                  <span>Alert on Entry</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={zoneAlertExit}
                    onChange={(e) => setZoneAlertExit(e.target.checked)}
                  />
                  <span>Alert on Exit</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsZoneModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '9px 16px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Save Safe Zone
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
