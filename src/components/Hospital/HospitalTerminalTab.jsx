import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Heart, 
  Phone, 
  ShieldAlert, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Navigation, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  User, 
  Droplet, 
  Flame, 
  Bed, 
  Ambulance, 
  FileText,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  Send,
  Stethoscope,
  Users,
  Bell,
  AlertCircle,
  Sparkles,
  MapPin,
  Gauge
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';
import { sirenSound } from '../../services/telemetryEngine';

export default function HospitalTerminalTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [soundMuted, setSoundMuted] = useState(true);
  const [goldenHourSeconds, setGoldenHourSeconds] = useState(3600); // 60 minutes
  const [activeSubTab, setActiveSubTab] = useState('triage'); // 'triage' | 'beds' | 'fleet' | 'blood' | 'doctors' | 'registry'

  // Toast / Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filter & Search states
  const [bedWardFilter, setBedWardFilter] = useState('all');
  const [bedStatusFilter, setBedStatusFilter] = useState('all');
  const [ambulanceFilter, setAmbulanceFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [caseSearch, setCaseSearch] = useState('');

  // Modals state
  const [bedModal, setBedModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [ambulanceModal, setAmbulanceModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [bloodModal, setBloodModal] = useState({ isOpen: false, mode: 'requisition', group: 'O+', units: 2, recipient: '', reason: '' });
  const [doctorModal, setDoctorModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [caseModal, setCaseModal] = useState({ isOpen: false, mode: 'add', data: null });

  // Subscribe to Cloud DB and fetch current database records on mount
  useEffect(() => {
    cloudDb.syncFromBackend?.();
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Golden Hour Countdown Timer
  useEffect(() => {
    let interval = null;
    if (dbState.activeIncident) {
      interval = setInterval(() => {
        setGoldenHourSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setGoldenHourSeconds(3600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dbState.activeIncident]);

  // Audio Siren Management
  useEffect(() => {
    if (dbState.activeIncident && !soundMuted) {
      sirenSound.startSiren();
    } else {
      sirenSound.stopSiren();
    }
    return () => sirenSound.stopSiren();
  }, [dbState.activeIncident, soundMuted]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDispatchAmbulance = () => {
    cloudDb.updateHospitalDispatch({
      ambulanceStatus: 'dispatched',
      ambulanceEtaMinutes: 7,
      dispatchedAt: new Date().toLocaleTimeString()
    });
    // Also mark first standby ambulance as dispatched
    const amb = (dbState.hospitalAmbulances || []).find(a => a.status === 'standby');
    if (amb) {
      cloudDb.updateAmbulanceStatus(amb.id, { status: 'dispatched', etaMinutes: 7 });
    }
    showToast('ALS 108 Ambulance Unit #12 Dispatched to Crash Site!');
  };

  const handleReserveIcu = () => {
    cloudDb.updateHospitalDispatch({
      icuBedReserved: true,
      icuBedNumber: 'Trauma Bay #04 (Ventilator Ready)'
    });
    // Reserve Bay #04 if present
    const bay4 = (dbState.hospitalBeds || []).find(b => b.name.includes('#04') || b.id === 'bed-4');
    if (bay4) {
      cloudDb.updateHospitalBed(bay4.id, { 
        status: 'reserved', 
        patientName: 'Incoming Crash Victim (Telemetry)', 
        attendingDoctor: 'Dr. Rohan Sharma' 
      });
    }
    showToast('Trauma Bay #04 Locked & Reserved for Incoming Patient!');
  };

  const handleReserveBlood = () => {
    cloudDb.updateHospitalDispatch({
      bloodUnitsReserved: 2,
      bloodType: 'O+ (Positive)'
    });
    cloudDb.requisitionBlood('O+', 2, 'Incoming Driver (Alex Mercer)', 'Pre-crossmatch for Trauma Bay #04');
    showToast('2 Units O+ Cross-Matched & Reserved from Blood Vault!');
  };

  const handleRequestGreenCorridor = () => {
    cloudDb.updatePoliceDispatch({
      greenCorridorActive: true
    });
    showToast('Green Corridor Request Sent to Traffic Control!');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset emergency state across all connected devices?')) {
      cloudDb.resetDemoState(true);
      showToast('Emergency state reset to standby across all stations', 'info');
    }
  };

  const activeIncident = dbState.activeIncident;
  const dispatches = dbState.dispatches.hospital;
  const policeDispatches = dbState.dispatches.police;
  const patient = dbState.medicalProfile;
  const beds = dbState.hospitalBeds || [];
  const ambulances = dbState.hospitalAmbulances || [];
  const bloodStock = dbState.bloodBankStock || [];
  const doctors = dbState.hospitalDoctors || [];
  const triageCases = dbState.hospitalTriageCases || [];

  // Filtered lists
  const filteredBeds = beds.filter(b => {
    const matchesWard = bedWardFilter === 'all' || b.ward === bedWardFilter;
    const matchesStatus = bedStatusFilter === 'all' || b.status === bedStatusFilter;
    return matchesWard && matchesStatus;
  });

  const filteredAmbulances = ambulances.filter(a => {
    return ambulanceFilter === 'all' || a.status === ambulanceFilter;
  });

  const filteredDoctors = doctors.filter(d => {
    return doctorFilter === 'all' || d.dutyStatus === doctorFilter;
  });

  const filteredCases = triageCases.filter(c => {
    if (!caseSearch.trim()) return true;
    const q = caseSearch.toLowerCase();
    return (
      c.patientName?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q) ||
      c.triageTag?.toLowerCase().includes(q) ||
      c.crashMechanism?.toLowerCase().includes(q)
    );
  });

  // Bed Metrics
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const reservedBeds = beds.filter(b => b.status === 'reserved').length;

  // Ambulance Metrics
  const totalAmbulances = ambulances.length;
  const standbyAmbulances = ambulances.filter(a => a.status === 'standby').length;
  const activeMissions = ambulances.filter(a => a.status !== 'standby').length;

  // Blood Metrics
  const criticalBloodCount = bloodStock.filter(b => b.status === 'critical').length;
  const totalBloodUnits = bloodStock.reduce((acc, curr) => acc + curr.units, 0);

  // Doctor Metrics
  const onDutyDocs = doctors.filter(d => d.dutyStatus === 'on-duty').length;

  return (
    <div className="terminal-container" style={{
      padding: '16px',
      maxWidth: '1440px',
      margin: '0 auto',
      color: '#f1f5f9',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'warning' ? '#d97706' : toast.type === 'info' ? '#2563eb' : '#059669',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <CheckCircle2 size={20} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Station Header Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '12px',
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
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #ef4444',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={28} color="#ef4444" className={activeIncident ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
                AIIMS APEX TRAUMA CENTER
              </h1>
              <span style={{
                background: '#dc2626',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                LEVEL 1 TRAUMA PORTAL
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Emergency Operations Center • Dr. Rohan Sharma (Chief Surgeon) • Room: {dbState.roomId}
            </p>
          </div>
        </div>

        {/* Global Controls & Sync Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#34d399',
            fontWeight: 600
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbState.connectionStatus === 'connected' ? '#10b981' : '#f59e0b',
              boxShadow: '0 0 8px #10b981'
            }}></span>
            <span>Worldwide Sync: {dbState.connectionStatus.toUpperCase()}</span>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Radio size={14} />
            <span>Room: {dbState.roomId}</span>
          </div>

          <button
            onClick={() => setSoundMuted(prev => !prev)}
            style={{
              background: soundMuted ? 'rgba(255,255,255,0.06)' : 'rgba(239, 68, 68, 0.25)',
              border: soundMuted ? '1px solid rgba(255,255,255,0.15)' : '1px solid #ef4444',
              color: soundMuted ? '#94a3b8' : '#ef4444',
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
            {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{soundMuted ? 'Siren Muted' : 'Siren Live'}</span>
          </button>

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

      {/* SUB-NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { 
            id: 'triage', 
            label: 'Emergency Triage Desk', 
            icon: AlertTriangle, 
            badge: activeIncident ? 'CODE RED' : null,
            badgeColor: '#ef4444' 
          },
          { 
            id: 'beds', 
            label: 'ICU Beds & Trauma Bays', 
            icon: Bed, 
            badge: `${availableBeds}/${totalBeds} Avail`,
            badgeColor: availableBeds > 0 ? '#10b981' : '#ef4444' 
          },
          { 
            id: 'fleet', 
            label: 'Ambulance Fleet Dispatch', 
            icon: Ambulance, 
            badge: `${standbyAmbulances} Standby`,
            badgeColor: '#3b82f6' 
          },
          { 
            id: 'blood', 
            label: 'Blood Bank & Plasma Vault', 
            icon: Droplet, 
            badge: criticalBloodCount > 0 ? `${criticalBloodCount} Critical` : `${totalBloodUnits} Units`,
            badgeColor: criticalBloodCount > 0 ? '#ef4444' : '#10b981' 
          },
          { 
            id: 'doctors', 
            label: 'Trauma Doctors On-Call', 
            icon: Stethoscope, 
            badge: `${onDutyDocs} On-Duty`,
            badgeColor: '#8b5cf6' 
          },
          { 
            id: 'registry', 
            label: 'Patient Case Registry', 
            icon: FileText, 
            badge: `${triageCases.length} Cases`,
            badgeColor: '#64748b' 
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                flex: '1 1 auto',
                minWidth: '170px',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '10px 14px',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: tab.badgeColor,
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: '0.02em'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: EMERGENCY TRIAGE DESK (LIVE TELEMETRY & INCIDENT RESPONSE)      */}
      {/* ========================================================================= */}
      {activeSubTab === 'triage' && (
        <div>
          {/* EMERGENCY CODE RED LIVE ALERT BANNER */}
          {activeIncident ? (
            <div style={{
              background: 'radial-gradient(ellipse at top, rgba(220, 38, 38, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 0 35px rgba(239, 68, 68, 0.3)',
              animation: 'borderPulse 2s infinite'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
                  }}>
                    <Flame size={20} />
                    <span>CODE RED: VEHICLE COLLISION</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                      Incident ID: <strong>{activeIncident.id}</strong> • Detected at {activeIncident.date}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      Location: <strong>{activeIncident.location}</strong> ({activeIncident.coordinates?.lat?.toFixed(4)}°N, {activeIncident.coordinates?.lng?.toFixed(4)}°E)
                    </div>
                  </div>
                </div>

                {/* Golden Hour Countdown Display */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CRITICAL GOLDEN HOUR
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: goldenHourSeconds < 1800 ? '#ef4444' : '#fbbf24',
                    letterSpacing: '0.05em'
                  }}>
                    {formatTimer(goldenHourSeconds)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Time to Definitive Trauma Surgery</div>
                  <button
                    onClick={handleResetDemo}
                    title="Resolve and reset emergency state across all terminals"
                    style={{
                      marginTop: '8px',
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Resolve / Reset Alert</span>
                  </button>
                </div>
              </div>

              {/* Quick Action Matrix for Hospital Doctors & Triage */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}>
                {/* 1. Dispatch 108 Ambulance */}
                <button
                  onClick={handleDispatchAmbulance}
                  disabled={dispatches.ambulanceStatus === 'dispatched'}
                  style={{
                    background: dispatches.ambulanceStatus === 'dispatched' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    border: dispatches.ambulanceStatus === 'dispatched' ? '1px solid #10b981' : 'none',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: dispatches.ambulanceStatus === 'dispatched' ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: dispatches.ambulanceStatus === 'dispatched' ? 'none' : '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Ambulance size={26} color={dispatches.ambulanceStatus === 'dispatched' ? '#10b981' : '#fff'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.ambulanceStatus === 'dispatched' ? '#10b981' : 'rgba(255,255,255,0.25)'
                    }}>
                      {dispatches.ambulanceStatus === 'dispatched' ? 'EN ROUTE (ETA 7 MIN)' : 'ACTION REQUIRED'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.ambulanceStatus === 'dispatched' ? 'Ambulance 108 Dispatched' : 'Dispatch ALS Ambulance 108'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    {dispatches.ambulanceStatus === 'dispatched' 
                      ? `${dispatches.ambulanceUnit} deployed with portable ventilator & defibrillator` 
                      : 'Deploy nearest mobile trauma unit to crash site'}
                  </div>
                </button>

                {/* 2. Reserve ICU Bay */}
                <button
                  onClick={handleReserveIcu}
                  disabled={dispatches.icuBedReserved}
                  style={{
                    background: dispatches.icuBedReserved 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    border: dispatches.icuBedReserved ? '1px solid #10b981' : 'none',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: dispatches.icuBedReserved ? 'default' : 'pointer',
                    textAlign: 'left',
                    boxShadow: dispatches.icuBedReserved ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Bed size={26} color={dispatches.icuBedReserved ? '#10b981' : '#fff'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.icuBedReserved ? '#10b981' : 'rgba(255,255,255,0.25)'
                    }}>
                      {dispatches.icuBedReserved ? 'BAY RESERVED' : 'LOCK ICU BAY'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.icuBedReserved ? 'Trauma Bay #04 Locked' : 'Reserve Emergency ICU Bay'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    {dispatches.icuBedReserved 
                      ? 'Assigned to Dr. Rohan Sharma (Attending Trauma Surgeon)' 
                      : 'Pre-allocate critical care bed with ICU ventilator'}
                  </div>
                </button>

                {/* 3. Pre-Match Blood Bank */}
                <button
                  onClick={handleReserveBlood}
                  disabled={dispatches.bloodUnitsReserved > 0}
                  style={{
                    background: dispatches.bloodUnitsReserved > 0 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    border: dispatches.bloodUnitsReserved > 0 ? '1px solid #10b981' : 'none',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: dispatches.bloodUnitsReserved > 0 ? 'default' : 'pointer',
                    textAlign: 'left',
                    boxShadow: dispatches.bloodUnitsReserved > 0 ? 'none' : '0 4px 15px rgba(217, 119, 6, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Droplet size={26} color={dispatches.bloodUnitsReserved > 0 ? '#10b981' : '#fff'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.bloodUnitsReserved > 0 ? '#10b981' : 'rgba(255,255,255,0.25)'
                    }}>
                      {dispatches.bloodUnitsReserved > 0 ? '2 UNITS MATCHED' : 'BLOOD BANK REQUISITION'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.bloodUnitsReserved > 0 ? 'Blood Ready: 2 Units O+' : 'Requisition Blood: O+ (Positive)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    Pre-crossmatch packed red blood cells for driver
                  </div>
                </button>

                {/* 4. Request Green Corridor from Traffic Police */}
                <button
                  onClick={handleRequestGreenCorridor}
                  disabled={policeDispatches.greenCorridorActive}
                  style={{
                    background: policeDispatches.greenCorridorActive 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: policeDispatches.greenCorridorActive ? '1px solid #10b981' : 'none',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: policeDispatches.greenCorridorActive ? 'default' : 'pointer',
                    textAlign: 'left',
                    boxShadow: policeDispatches.greenCorridorActive ? 'none' : '0 4px 15px rgba(5, 150, 105, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Navigation size={26} color={policeDispatches.greenCorridorActive ? '#10b981' : '#fff'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: policeDispatches.greenCorridorActive ? '#10b981' : 'rgba(255,255,255,0.25)'
                    }}>
                      {policeDispatches.greenCorridorActive ? 'ROUTE SYNCHRONIZED' : 'POLICE SYNC'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {policeDispatches.greenCorridorActive ? 'Green Corridor Active' : 'Request Police Green Corridor'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    Signal priority from NH-48 to AIIMS Trauma Centre
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '12px' }}>
                <Activity size={36} color="#10b981" />
              </div>
              <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.15rem', fontWeight: 700 }}>
                HOSPITAL EMERGENCY TRIAGE MONITORING: ALL CLEAR
              </h3>
              <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Telemetry stream active across global network. Waiting for incident trigger from vehicle sensor...
              </p>
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={() => {
                    cloudDb.triggerCrashIncident({
                      severity: 'CRITICAL',
                      reason: 'Simulated High Impact Collision (5.99g)',
                      peakGForce: '5.99g',
                      speedAtImpact: '88 km/h',
                      location: 'NH-48 Expressway KM 34.2'
                    });
                    showToast('Emergency Incident Broadcasted across all connected devices!', 'warning');
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Simulate Emergency Crash Broadcast from this Terminal
                </button>
              </div>
            </div>
          )}

          {/* Grid: Patient Medical Dossier & Crash Forensics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Card 1: Patient Medical Passport */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="#6366f1" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Patient Medical Dossier
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  ASAAS MED-PASS
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div style={{
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(15, 23, 42, 1) 100%)',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700 }}>BLOOD GROUP</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>
                    {patient.bloodGroup ? patient.bloodGroup.split(' ')[0] : 'O+'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>RH FACTOR +</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{patient.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {patient.age} yrs • {patient.gender} • {patient.heightCm} cm / {patient.weightKg} kg
                  </div>
                  <div style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <CheckCircle2 size={12} />
                    <span>Organ Donor: {patient.organDonorId}</span>
                  </div>
                </div>
              </div>

              {/* Critical Warnings: Allergies & Conditions */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>
                  CRITICAL ALLERGIES (DO NOT ADMINISTER):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(Array.isArray(patient.allergies) ? patient.allergies : (typeof patient.allergies === 'string' ? patient.allergies.split(',').map(s => s.trim()).filter(Boolean) : [])).map((allergy, i) => (
                    <span key={i} style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#fca5a5',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Chronic Medical Conditions:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {Array.isArray(patient.medicalConditions) ? patient.medicalConditions.join(', ') : (patient.medicalConditions || 'None reported')}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Current Medications:
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  {patient.currentMedications?.join(', ')}
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Emergency ICE Guardian Contact:</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>Sarah Mercer (Spouse)</strong>
                    <div style={{ fontSize: '0.78rem', color: '#60a5fa' }}>+91 98111 22233</div>
                  </div>
                  <a 
                    href="tel:+919811122233"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid #3b82f6',
                      color: '#60a5fa',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Phone size={12} />
                    <span>Call ICE</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Crash Sensor Telemetry Forensics */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Vehicle Impact Forensics (IoT Telemetry)
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  MPU6050 + NEO-6M
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PEAK IMPACT DECELERATION</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>
                    {activeIncident ? activeIncident.peakGForce : `${(dbState.telemetry.totalGForce || 1.0).toFixed(2)}g`}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Threshold: {'>'} 3.5g Critical</div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PRE-CRASH SPEED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                    {activeIncident ? activeIncident.speedAtImpact : `${(dbState.telemetry.speedKmh || 0).toFixed(1)} km/h`}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>GPS Speed Log</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>VEHICLE SPECIFICATION:</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                  Hyundai Creta SX (O) Turbo [DL-01-AB-4321]
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  VIN: MALC341C89M203912 • Device: ASAAS-001 (OTA v2.4.1)
                </div>
              </div>

              {/* Hospital Real-Time Dispatch Log */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>
                  HOSPITAL DISPATCH LOGS (REAL-TIME AUDIT TRAIL):
                </div>
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {dispatches.logs && dispatches.logs.length > 0 ? (
                    dispatches.logs.map((log, index) => (
                      <div key={index} style={{ padding: '3px 0', color: '#34d399', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b' }}>No hospital emergency dispatches recorded in this session.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ICU BEDS & TRAUMA BAYS (CRUD MANAGEMENT)                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'beds' && (
        <div>
          {/* Bed Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL TRAUMA & ICU BEDS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalBeds}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>AVAILABLE BAYS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{availableBeds}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>OCCUPIED BEDS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{occupiedBeds}</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>RESERVED / CODE RED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{reservedBeds}</div>
            </div>
          </div>

          {/* Controls Bar: Ward Filter, Status Filter, Add Bed Button */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#94a3b8' }}>
                <Filter size={16} />
                <span>Filter Ward:</span>
              </div>
              <select
                value={bedWardFilter}
                onChange={e => setBedWardFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <option value="all">All Wards</option>
                <option value="Trauma Resuscitation Unit">Trauma Resuscitation Unit</option>
                <option value="Rapid Trauma Bay">Rapid Trauma Bay</option>
                <option value="Post-Op Neuro/Trauma ICU">Post-Op Neuro/Trauma ICU</option>
              </select>

              <select
                value={bedStatusFilter}
                onChange={e => setBedStatusFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <button
              onClick={() => setBedModal({
                isOpen: true,
                mode: 'add',
                data: {
                  name: `Trauma Bay #${beds.length + 1 < 10 ? '0' + (beds.length + 1) : beds.length + 1}`,
                  ward: 'Trauma Resuscitation Unit',
                  status: 'available',
                  patientName: '',
                  patientAge: '',
                  attendingDoctor: 'Dr. Rohan Sharma',
                  equipment: 'Ventilator, Defibrillator, Multi-para Monitor',
                  oxygenSupport: true,
                  lastSanitized: 'Just Sterilized'
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Add Trauma Bay / Bed</span>
            </button>
          </div>

          {/* Bed Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredBeds.map(bed => {
              const statusColors = {
                available: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#34d399', label: 'AVAILABLE' },
                occupied: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#f87171', label: 'OCCUPIED' },
                reserved: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24', label: 'RESERVED (SOS)' },
                maintenance: { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', text: '#94a3b8', label: 'MAINTENANCE' }
              };
              const conf = statusColors[bed.status] || statusColors.available;

              return (
                <div
                  key={bed.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${conf.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: bed.status === 'reserved' ? '0 0 15px rgba(245, 158, 11, 0.25)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{bed.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bed.ward}</div>
                    </div>
                    <span style={{
                      background: conf.bg,
                      color: conf.text,
                      border: `1px solid ${conf.border}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {conf.label}
                    </span>
                  </div>

                  {/* Patient Info if occupied/reserved */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    fontSize: '0.82rem'
                  }}>
                    {bed.status === 'available' ? (
                      <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} />
                        <span>Ready for immediate admission</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>
                          Patient: {bed.patientName || 'Unregistered Patient'}
                        </div>
                        {bed.patientAge && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Age: {bed.patientAge} yrs</div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                          Surgeon: <strong>{bed.attendingDoctor || 'On-duty trauma team'}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Equipment Tags */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>CONNECTED RIG & SUPPORT:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.isArray(bed.equipment) ? (
                        bed.equipment.map((eq, i) => (
                          <span key={i} style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#cbd5e1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {eq}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{bed.equipment}</span>
                      )}
                      {bed.oxygenSupport && (
                        <span style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          O2 Port Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '14px' }}>
                    Sanitized: {bed.lastSanitized || 'Verified sterilized'}
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    {bed.status !== 'available' ? (
                      <button
                        onClick={() => {
                          cloudDb.releaseHospitalBed(bed.id);
                          showToast(`${bed.name} released and prepped for next triage!`);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Release & Sanitize
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          cloudDb.updateHospitalBed(bed.id, {
                            status: 'occupied',
                            patientName: 'Walk-in Trauma Patient',
                            patientAge: 35,
                            attendingDoctor: 'Dr. Rohan Sharma'
                          });
                          showToast(`${bed.name} assigned to patient!`);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid #6366f1',
                          color: '#818cf8',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Admit Patient
                      </button>
                    )}

                    <button
                      onClick={() => setBedModal({
                        isOpen: true,
                        mode: 'edit',
                        data: {
                          ...bed,
                          equipment: Array.isArray(bed.equipment) ? bed.equipment.join(', ') : bed.equipment
                        }
                      })}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#cbd5e1',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${bed.name} permanently?`)) {
                          cloudDb.deleteHospitalBed(bed.id);
                          showToast(`${bed.name} removed from registry`, 'info');
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: AMBULANCE FLEET DISPATCH (CRUD MANAGEMENT)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'fleet' && (
        <div>
          {/* Fleet Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL AMBULANCE UNITS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalAmbulances}</div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>STANDBY AT BAY</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{standbyAmbulances}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>ACTIVE IN FLIGHT / TRANSIT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{activeMissions}</div>
            </div>
          </div>

          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Filter Status:</span>
              <select
                value={ambulanceFilter}
                onChange={e => setAmbulanceFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <option value="all">All Fleets</option>
                <option value="standby">Standby (At Bay)</option>
                <option value="dispatched">Dispatched</option>
                <option value="en_route">En Route</option>
                <option value="on_scene">On Scene</option>
                <option value="returning">Returning</option>
              </select>
            </div>

            <button
              onClick={() => setAmbulanceModal({
                isOpen: true,
                mode: 'add',
                data: {
                  unitNumber: `ALS 108 Mobile ICU #${ambulances.length + 1 < 10 ? '0' + (ambulances.length + 1) : ambulances.length + 1}`,
                  type: 'Advanced Life Support (ALS)',
                  plateNumber: 'DL-01-AX-1085',
                  driverName: 'Ravi Verma',
                  driverPhone: '+91 98444 88015',
                  emtLead: 'Paramedic Neeraj Kumar',
                  status: 'standby',
                  currentLocation: 'AIIMS Apex Trauma Ambulance Bay',
                  etaMinutes: 10,
                  equipment: 'Transport Ventilator, Defibrillator, Spinal Board'
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Add Ambulance Unit</span>
            </button>
          </div>

          {/* Fleet Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {filteredAmbulances.map(amb => {
              const statusBadges = {
                standby: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#34d399', label: 'STANDBY AT BAY' },
                dispatched: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#f87171', label: 'DISPATCHED (CODE RED)' },
                en_route: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#fbbf24', label: 'EN ROUTE TO SCENE' },
                on_scene: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', color: '#818cf8', label: 'ON SCENE / RESCUE' },
                returning: { bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9', color: '#38bdf8', label: 'RETURNING TO ER' }
              };
              const sBadge = statusBadges[amb.status] || statusBadges.standby;

              return (
                <div
                  key={amb.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${sBadge.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: amb.status !== 'standby' ? '0 0 16px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{amb.unitNumber}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{amb.type} • {amb.plateNumber}</div>
                    </div>
                    <span style={{
                      background: sBadge.bg,
                      color: sBadge.color,
                      border: `1px solid ${sBadge.border}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      {sBadge.label}
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Driver / Pilot:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{amb.driverName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>EMT Lead:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{amb.emtLead}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Current Location:</span>
                      <span style={{ color: '#cbd5e1' }}>{amb.currentLocation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Estimated ETA:</span>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{amb.etaMinutes} mins</span>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>EQUIPMENT ONBOARD:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.isArray(amb.equipment) ? (
                        amb.equipment.map((eq, i) => (
                          <span key={i} style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#cbd5e1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {eq}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{amb.equipment}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Changer */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <select
                      value={amb.status}
                      onChange={e => {
                        cloudDb.updateAmbulanceStatus(amb.id, { status: e.target.value });
                        showToast(`${amb.unitNumber} status set to ${e.target.value.toUpperCase()}`);
                      }}
                      style={{
                        flex: '1 1 120px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="standby">Standby</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="en_route">En Route</option>
                      <option value="on_scene">On Scene</option>
                      <option value="returning">Returning</option>
                    </select>

                    <a
                      href={`tel:${amb.driverPhone}`}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Phone size={12} />
                      <span>Call Driver</span>
                    </a>

                    <button
                      onClick={() => setAmbulanceModal({
                        isOpen: true,
                        mode: 'edit',
                        data: {
                          ...amb,
                          equipment: Array.isArray(amb.equipment) ? amb.equipment.join(', ') : amb.equipment
                        }
                      })}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#cbd5e1',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Decommission ${amb.unitNumber}?`)) {
                          cloudDb.deleteAmbulance(amb.id);
                          showToast(`${amb.unitNumber} decommissioned`, 'info');
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: BLOOD BANK & PLASMA VAULT (CRUD & REQUISITION)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'blood' && (
        <div>
          {/* Overview Warning if Critical */}
          {criticalBloodCount > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '14px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={22} color="#ef4444" />
                <div>
                  <strong style={{ color: '#f87171', fontSize: '0.92rem' }}>
                    CRITICAL INVENTORY ALERT: {criticalBloodCount} Blood Groups Below Safety Reserve!
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Immediate emergency donor recall or regional blood exchange advised (O-Negative reserve low).
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  cloudDb.updateBloodStock('O-', 10, true);
                  showToast('Restocked 10 units of Universal Donor O-Negative!');
                }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Emergency Restock O-
              </button>
            </div>
          )}

          {/* Blood Stock Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {bloodStock.map(b => {
              const isCrit = b.units <= 4;
              const isWarn = b.units > 4 && b.units <= 8;
              const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
              const bg = isCrit ? 'rgba(239, 68, 68, 0.15)' : isWarn ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)';

              return (
                <div
                  key={b.group}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${color}`,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: isCrit ? '0 0 16px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: bg,
                        border: `2px solid ${color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        color: '#fff'
                      }}>
                        {b.group}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                          Blood Group {b.group}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {b.group === 'O-' ? '⭐ Universal Red Cell Donor' : b.group === 'AB+' ? '⭐ Universal Plasma Recipient' : 'Type-Matched PRBC'}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      background: bg,
                      color,
                      border: `1px solid ${color}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}>
                      {isCrit ? 'CRITICAL' : isWarn ? 'WARNING' : 'OPTIMAL'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '14px 0 10px 0' }}>
                    <div>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{b.units}</span>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: '6px' }}>Units in Vault</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      Shelf Life: <strong>{b.shelfLifeDays || 35} days</strong>
                    </div>
                  </div>

                  {/* Stock Quick Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        cloudDb.updateBloodStock(b.group, 1, true);
                        showToast(`+1 Unit added to ${b.group}`);
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      +1 Unit
                    </button>

                    <button
                      onClick={() => {
                        if (b.units > 0) {
                          cloudDb.updateBloodStock(b.group, -1, true);
                          showToast(`-1 Unit deducted from ${b.group}`);
                        }
                      }}
                      disabled={b.units <= 0}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: b.units > 0 ? '#fff' : '#64748b',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: b.units > 0 ? 'pointer' : 'default'
                      }}
                    >
                      -1 Unit
                    </button>

                    <button
                      onClick={() => setBloodModal({
                        isOpen: true,
                        mode: 'requisition',
                        group: b.group,
                        units: 2,
                        recipient: patient?.fullName || 'Trauma Patient',
                        reason: 'Emergency Resuscitation'
                      })}
                      style={{
                        flex: 1.5,
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Requisition
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: TRAUMA DOCTORS ON-CALL (CRUD & PAGING)                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'doctors' && (
        <div>
          {/* Doctor Controls Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Filter Duty:</span>
              <select
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                <option value="all">All Surgeons & Specialists</option>
                <option value="on-duty">On Duty (Active in ER)</option>
                <option value="on-call">On Call (Immediate Page)</option>
                <option value="off-duty">Off Duty</option>
              </select>
            </div>

            <button
              onClick={() => setDoctorModal({
                isOpen: true,
                mode: 'add',
                data: {
                  name: 'Dr. ',
                  role: 'Attending Trauma Surgeon',
                  specialty: 'Trauma & Emergency Surgery',
                  pagerId: `PAGER-AIIMS-${Math.floor(100 + Math.random() * 900)}`,
                  phone: '+91 98765 00000',
                  dutyStatus: 'on-duty',
                  room: 'Trauma Bay #03',
                  casesToday: 0
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Add On-Call Physician</span>
            </button>
          </div>

          {/* Doctors Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredDoctors.map(doc => {
              const dutyColors = {
                'on-duty': { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#34d399', label: 'ON DUTY (IN ER)' },
                'on-call': { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#fbbf24', label: 'ON CALL' },
                'off-duty': { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', color: '#94a3b8', label: 'OFF DUTY' }
              };
              const dStyle = dutyColors[doc.dutyStatus] || dutyColors['on-duty'];

              return (
                <div
                  key={doc.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${dStyle.border}`,
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{doc.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}>{doc.role}</div>
                    </div>
                    <span style={{
                      background: dStyle.bg,
                      color: dStyle.color,
                      border: `1px solid ${dStyle.border}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}>
                      {dStyle.label}
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Specialty:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{doc.specialty}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Digital Pager:</span>
                      <span style={{ color: '#60a5fa', fontWeight: 700 }}>{doc.pagerId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Current Station:</span>
                      <span style={{ color: '#cbd5e1' }}>{doc.room}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Trauma Cases Today:</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{doc.casesToday} cases</span>
                    </div>
                  </div>

                  {/* Actions & Paging */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <button
                      onClick={() => {
                        showToast(`🚨 High-Priority Pager Alert Transmitted to ${doc.name} (${doc.pagerId})!`);
                      }}
                      style={{
                        flex: '1 1 auto',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Bell size={13} />
                      <span>Page Stat</span>
                    </button>

                    <a
                      href={`tel:${doc.phone}`}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid #3b82f6',
                        color: '#60a5fa',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Phone size={12} />
                      <span>Call</span>
                    </a>

                    <select
                      value={doc.dutyStatus}
                      onChange={e => {
                        cloudDb.updateDoctorStatus(doc.id, { dutyStatus: e.target.value });
                        showToast(`${doc.name} status updated to ${e.target.value.toUpperCase()}`);
                      }}
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="on-duty">On Duty</option>
                      <option value="on-call">On Call</option>
                      <option value="off-duty">Off Duty</option>
                    </select>

                    <button
                      onClick={() => setDoctorModal({
                        isOpen: true,
                        mode: 'edit',
                        data: { ...doc }
                      })}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#cbd5e1',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${doc.name} from hospital directory?`)) {
                          cloudDb.deleteDoctor(doc.id);
                          showToast(`${doc.name} removed from directory`, 'info');
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: PATIENT CASE REGISTRY (TRIAGE AUDIT LOGS)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'registry' && (
        <div>
          {/* Search & Actions Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search patient name, incident ID, or mechanism..."
                value={caseSearch}
                onChange={e => setCaseSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <button
              onClick={() => setCaseModal({
                isOpen: true,
                mode: 'add',
                data: {
                  patientName: 'Alex Mercer (Incoming Driver)',
                  age: 32,
                  gender: 'Male',
                  bloodGroup: 'O+',
                  gcsScore: 14,
                  triageTag: 'RED',
                  vitals: 'BP 110/72, HR 104, SpO2 97%',
                  crashMechanism: '5.84g High Deceleration Collision (NH-48 Expressway)',
                  assignedBay: 'Trauma Bay #04',
                  attendingDoctor: 'Dr. Rohan Sharma',
                  status: 'Triage In Progress'
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Log New Trauma Admission</span>
            </button>
          </div>

          {/* Cases List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCases.map(c => {
              const tagColors = {
                RED: { bg: '#ef4444', text: '#fff', label: 'RED (IMMEDIATE / LIFE-THREATENING)' },
                YELLOW: { bg: '#f59e0b', text: '#000', label: 'YELLOW (URGENT / STABILIZED)' },
                GREEN: { bg: '#10b981', text: '#fff', label: 'GREEN (DELAYED / MINOR)' },
                BLACK: { bg: '#000', text: '#fff', label: 'BLACK (EXPECTANT)' }
              };
              const tagStyle = tagColors[c.triageTag] || tagColors.RED;

              return (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: '2 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        background: tagStyle.bg,
                        color: tagStyle.text,
                        fontWeight: 900,
                        fontSize: '0.68rem',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {tagStyle.label}
                      </span>
                      <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{c.patientName}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        ({c.age} yrs • {c.gender} • Blood: <span style={{ color: '#ef4444', fontWeight: 700 }}>{c.bloodGroup}</span>)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      Mechanism: <strong>{c.crashMechanism}</strong>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span>Vitals: <strong style={{ color: '#34d399' }}>{c.vitals}</strong></span>
                      <span>GCS Score: <strong style={{ color: '#fbbf24' }}>{c.gcsScore}/15</strong></span>
                      <span>Assigned: <strong style={{ color: '#818cf8' }}>{c.assignedBay}</strong></span>
                      <span>Doctor: <strong style={{ color: '#fff' }}>{c.attendingDoctor}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right', marginRight: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.date}</div>
                      <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>{c.status}</div>
                    </div>

                    <button
                      onClick={() => {
                        const nextStatus = c.status === 'Triage Completed' ? 'Transferred to OT' : 'Triage Completed';
                        cloudDb.updateTriageCase(c.id, { status: nextStatus });
                        showToast(`Case ${c.id} updated to ${nextStatus}`);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT HOSPITAL BED                                             */}
      {/* ========================================================================= */}
      {bedModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {bedModal.mode === 'add' ? 'Add New Trauma Bay / ICU Bed' : 'Edit Trauma Bay Specification'}
              </h3>
              <button
                onClick={() => setBedModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bed / Bay Designation</label>
                <input
                  type="text"
                  value={bedModal.data?.name || ''}
                  onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  placeholder="e.g. Trauma Bay #05"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ward / Department</label>
                <select
                  value={bedModal.data?.ward || 'Trauma Resuscitation Unit'}
                  onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, ward: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <option value="Trauma Resuscitation Unit">Trauma Resuscitation Unit</option>
                  <option value="Rapid Trauma Bay">Rapid Trauma Bay</option>
                  <option value="Post-Op Neuro/Trauma ICU">Post-Op Neuro/Trauma ICU</option>
                  <option value="Burn & Plastic Trauma Unit">Burn & Plastic Trauma Unit</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</label>
                  <select
                    value={bedModal.data?.status || 'available'}
                    onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attending Surgeon</label>
                  <input
                    type="text"
                    value={bedModal.data?.attendingDoctor || ''}
                    onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, attendingDoctor: e.target.value } }))}
                    placeholder="e.g. Dr. Rohan Sharma"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Patient Name (if occupied)</label>
                <input
                  type="text"
                  value={bedModal.data?.patientName || ''}
                  onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, patientName: e.target.value } }))}
                  placeholder="Leave empty if vacant"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Equipment Ready (comma separated)</label>
                <input
                  type="text"
                  value={bedModal.data?.equipment || ''}
                  onChange={e => setBedModal(prev => ({ ...prev, data: { ...prev.data, equipment: e.target.value } }))}
                  placeholder="e.g. Ventilator, Defibrillator, Syringe Pump"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setBedModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const eqList = typeof bedModal.data.equipment === 'string'
                    ? bedModal.data.equipment.split(',').map(s => s.trim()).filter(Boolean)
                    : bedModal.data.equipment;

                  if (bedModal.mode === 'add') {
                    cloudDb.addHospitalBed({
                      ...bedModal.data,
                      equipment: eqList
                    });
                    showToast('Trauma bay added successfully!');
                  } else {
                    cloudDb.updateHospitalBed(bedModal.data.id, {
                      ...bedModal.data,
                      equipment: eqList
                    });
                    showToast('Trauma bay updated successfully!');
                  }
                  setBedModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Bed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT AMBULANCE FLEET                                         */}
      {/* ========================================================================= */}
      {ambulanceModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {ambulanceModal.mode === 'add' ? 'Commission New Ambulance' : 'Edit Ambulance Specifications'}
              </h3>
              <button
                onClick={() => setAmbulanceModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unit Designation / Call Sign</label>
                <input
                  type="text"
                  value={ambulanceModal.data?.unitNumber || ''}
                  onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, unitNumber: e.target.value } }))}
                  placeholder="e.g. ALS 108 Mobile ICU #15"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fleet Type</label>
                  <select
                    value={ambulanceModal.data?.type || 'Advanced Life Support (ALS)'}
                    onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, type: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                    <option value="Critical Care Helicopter (Air EMS)">Critical Care Helicopter (Air EMS)</option>
                    <option value="Neonatal Intensive Care Unit (NICU)">Neonatal ICU Mobile</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Plate / Registration</label>
                  <input
                    type="text"
                    value={ambulanceModal.data?.plateNumber || ''}
                    onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, plateNumber: e.target.value } }))}
                    placeholder="DL-01-AX-1081"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Driver Name</label>
                  <input
                    type="text"
                    value={ambulanceModal.data?.driverName || ''}
                    onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, driverName: e.target.value } }))}
                    placeholder="e.g. Mohan Singh"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Driver Emergency Phone</label>
                  <input
                    type="text"
                    value={ambulanceModal.data?.driverPhone || ''}
                    onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, driverPhone: e.target.value } }))}
                    placeholder="+91 98111 88012"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EMT Lead / Paramedic In-Charge</label>
                <input
                  type="text"
                  value={ambulanceModal.data?.emtLead || ''}
                  onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, emtLead: e.target.value } }))}
                  placeholder="e.g. Paramedic Devendra Joshi"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Equipment (comma separated)</label>
                <input
                  type="text"
                  value={ambulanceModal.data?.equipment || ''}
                  onChange={e => setAmbulanceModal(prev => ({ ...prev, data: { ...prev.data, equipment: e.target.value } }))}
                  placeholder="e.g. Transport Ventilator, Defibrillator, Spinal Board"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setAmbulanceModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const eqList = typeof ambulanceModal.data.equipment === 'string'
                    ? ambulanceModal.data.equipment.split(',').map(s => s.trim()).filter(Boolean)
                    : ambulanceModal.data.equipment;

                  if (ambulanceModal.mode === 'add') {
                    cloudDb.addAmbulance({
                      ...ambulanceModal.data,
                      equipment: eqList
                    });
                    showToast('Ambulance commissioned into fleet!');
                  } else {
                    cloudDb.updateAmbulanceStatus(ambulanceModal.data.id, {
                      ...ambulanceModal.data,
                      equipment: eqList
                    });
                    showToast('Ambulance details updated!');
                  }
                  setAmbulanceModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Ambulance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BLOOD REQUISITION / RESTOCK                                        */}
      {/* ========================================================================= */}
      {bloodModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                Requisition Blood Units: {bloodModal.group}
              </h3>
              <button
                onClick={() => setBloodModal(prev => ({ ...prev, isOpen: false }))}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Units to Requisition</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bloodModal.units}
                  onChange={e => setBloodModal(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Recipient Patient Name</label>
                <input
                  type="text"
                  value={bloodModal.recipient}
                  onChange={e => setBloodModal(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="e.g. Alex Mercer"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clinical Indication / Procedure</label>
                <input
                  type="text"
                  value={bloodModal.reason}
                  onChange={e => setBloodModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Severe Trauma Hemorrhagic Shock"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setBloodModal(prev => ({ ...prev, isOpen: false }))}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = cloudDb.requisitionBlood(bloodModal.group, bloodModal.units, bloodModal.recipient, bloodModal.reason);
                  if (res.success) {
                    showToast(res.message);
                  } else {
                    showToast(res.message, 'warning');
                  }
                  setBloodModal(prev => ({ ...prev, isOpen: false }));
                }}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ON-CALL DOCTOR                                          */}
      {/* ========================================================================= */}
      {doctorModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {doctorModal.mode === 'add' ? 'Add On-Call Physician' : 'Edit Physician Profile'}
              </h3>
              <button
                onClick={() => setDoctorModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Physician Full Name</label>
                <input
                  type="text"
                  value={doctorModal.data?.name || ''}
                  onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  placeholder="e.g. Dr. Rohan Sharma"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Role / Designation</label>
                  <input
                    type="text"
                    value={doctorModal.data?.role || ''}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}
                    placeholder="e.g. Senior Trauma Surgeon"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Specialty</label>
                  <input
                    type="text"
                    value={doctorModal.data?.specialty || ''}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, specialty: e.target.value } }))}
                    placeholder="e.g. Trauma & Resuscitation"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pager Call ID</label>
                  <input
                    type="text"
                    value={doctorModal.data?.pagerId || ''}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, pagerId: e.target.value } }))}
                    placeholder="PAGER-AIIMS-101"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Direct Phone</label>
                  <input
                    type="text"
                    value={doctorModal.data?.phone || ''}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Duty Status</label>
                  <select
                    value={doctorModal.data?.dutyStatus || 'on-duty'}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, dutyStatus: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="on-duty">On Duty</option>
                    <option value="on-call">On Call</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Room / Station</label>
                  <input
                    type="text"
                    value={doctorModal.data?.room || ''}
                    onChange={e => setDoctorModal(prev => ({ ...prev, data: { ...prev.data, room: e.target.value } }))}
                    placeholder="Trauma Bay #02"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setDoctorModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (doctorModal.mode === 'add') {
                    cloudDb.addDoctor(doctorModal.data);
                    showToast('Doctor added to hospital directory!');
                  } else {
                    cloudDb.updateDoctorStatus(doctorModal.data.id, doctorModal.data);
                    showToast('Doctor details updated!');
                  }
                  setDoctorModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG NEW TRAUMA ADMISSION CASE                                      */}
      {/* ========================================================================= */}
      {caseModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                Log New Emergency Trauma Admission
              </h3>
              <button
                onClick={() => setCaseModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Patient Full Name</label>
                <input
                  type="text"
                  value={caseModal.data?.patientName || ''}
                  onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, patientName: e.target.value } }))}
                  placeholder="e.g. Alex Mercer"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Age</label>
                  <input
                    type="number"
                    value={caseModal.data?.age || 30}
                    onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, age: parseInt(e.target.value) || 30 } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Blood Group</label>
                  <select
                    value={caseModal.data?.bloodGroup || 'O+'}
                    onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, bloodGroup: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Triage Tag</label>
                  <select
                    value={caseModal.data?.triageTag || 'RED'}
                    onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, triageTag: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="RED">RED (Immediate)</option>
                    <option value="YELLOW">YELLOW (Urgent)</option>
                    <option value="GREEN">GREEN (Delayed)</option>
                    <option value="BLACK">BLACK (Expectant)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Crash Mechanism / Trauma History</label>
                <input
                  type="text"
                  value={caseModal.data?.crashMechanism || ''}
                  onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, crashMechanism: e.target.value } }))}
                  placeholder="e.g. 5.84g High Deceleration Collision (NH-48 Expressway)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assigned Trauma Bay</label>
                  <input
                    type="text"
                    value={caseModal.data?.assignedBay || ''}
                    onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, assignedBay: e.target.value } }))}
                    placeholder="Trauma Bay #04"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attending Surgeon</label>
                  <input
                    type="text"
                    value={caseModal.data?.attendingDoctor || ''}
                    onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, attendingDoctor: e.target.value } }))}
                    placeholder="Dr. Rohan Sharma"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Admission Vitals</label>
                <input
                  type="text"
                  value={caseModal.data?.vitals || ''}
                  onChange={e => setCaseModal(prev => ({ ...prev, data: { ...prev.data, vitals: e.target.value } }))}
                  placeholder="BP 110/72, HR 104, SpO2 97%"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setCaseModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cloudDb.addTriageCase(caseModal.data);
                  showToast('Trauma case registered successfully!');
                  setCaseModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Register Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
