import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Car, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  FileText, 
  Navigation, 
  RotateCcw, 
  CheckCircle2, 
  Siren, 
  Clock, 
  Volume2, 
  VolumeX, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  Building2, 
  Check, 
  X, 
  Download, 
  Flame, 
  Zap, 
  Sliders,
  Compass
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';
import { sirenSound } from '../../services/telemetryEngine';

export default function PoliceCommandTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [soundMuted, setSoundMuted] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('command'); // 'command' | 'fleet' | 'corridor' | 'perimeter' | 'stations'
  const [showFirModal, setShowFirModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filters & Modal States
  const [fleetFilter, setFleetFilter] = useState('all');
  const [interceptorModal, setInterceptorModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [perimeterModal, setPerimeterModal] = useState({ isOpen: false, data: null });

  useEffect(() => {
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

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

  const handleDispatchPcr = () => {
    cloudDb.updatePoliceDispatch({
      pcrStatus: 'dispatched',
      pcrEtaMinutes: 4,
      dispatchedAt: new Date().toLocaleTimeString()
    });
    const pcr = (dbState.policeInterceptors || []).find(p => p.status === 'patrolling' || p.status === 'standby');
    if (pcr) {
      cloudDb.updatePoliceInterceptor(pcr.id, { status: 'dispatched', etaMinutes: 4 });
    }
    showToast('PCR Interceptor Unit #07 Dispatched to Accident Scene!');
  };

  const handleToggleGreenCorridor = () => {
    const nextState = !dbState.dispatches.police.greenCorridorActive;
    cloudDb.updatePoliceDispatch({
      greenCorridorActive: nextState
    });
    showToast(nextState ? 'Green Corridor Traffic Signals Synchronized to AIIMS!' : 'Green Corridor Deactivated. Normal Traffic Restored.');
  };

  const handleTogglePerimeter = () => {
    const nextState = !dbState.dispatches.police.hazardPerimeterSet;
    cloudDb.updatePoliceDispatch({
      hazardPerimeterSet: nextState
    });
    showToast(nextState ? 'Highway Lane 1 & 2 Barricaded. Hazard Perimeter Active!' : 'Hazard Perimeter Cleared. Lanes Re-opened.');
  };

  const handleGenerateFir = () => {
    cloudDb.updatePoliceDispatch({
      firGenerated: true
    });
    setShowFirModal(true);
    showToast('Official Digital e-FIR Generated with IoT Forensics!');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset emergency state across all connected devices?')) {
      cloudDb.resetDemoState(true);
      showToast('Emergency state reset across all stations', 'info');
    }
  };

  const activeIncident = dbState.activeIncident;
  const dispatches = dbState.dispatches.police;
  const hospitalDispatches = dbState.dispatches.hospital;
  const interceptors = dbState.policeInterceptors || [];
  const junctions = dbState.trafficJunctions || [];
  const perimeters = dbState.hazardPerimeters || [];

  // Filtered Interceptors
  const filteredInterceptors = interceptors.filter(p => {
    return fleetFilter === 'all' || p.status === fleetFilter;
  });

  const totalInterceptors = interceptors.length;
  const activePatrolling = interceptors.filter(p => p.status === 'patrolling').length;
  const dispatchedUnits = interceptors.filter(p => p.status === 'dispatched' || p.status === 'on_scene').length;

  return (
    <div className="terminal-container" style={{
      padding: '16px',
      maxWidth: '1440px',
      margin: '0 auto',
      color: '#f1f5f9',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Toast Alert */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'warning' ? '#d97706' : toast.type === 'info' ? '#2563eb' : '#0284c7',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Station Header Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
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
            background: 'rgba(56, 189, 248, 0.2)',
            border: '2px solid #38bdf8',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={28} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 3.8vw, 1.25rem)', fontWeight: 800, letterSpacing: '0.02em', color: '#fff' }}>
                HIGHWAY PATROL & PCR COMMAND 112
              </h1>
              <span style={{
                background: '#0284c7',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                SECTOR 04 INTERCEPTOR HUB
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Traffic Law Enforcement & Crash Forensics • Inspector Vikram Malhotra (Station House Officer) • Room: {dbState.roomId}
            </p>
          </div>
        </div>

        {/* Global Controls & Sync Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#38bdf8',
            fontWeight: 600
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbState.connectionStatus === 'connected' ? '#38bdf8' : '#f59e0b',
              boxShadow: '0 0 8px #38bdf8'
            }}></span>
            <span>Worldwide Sync: {dbState.connectionStatus.toUpperCase()}</span>
          </div>

          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#7dd3fc',
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
              background: soundMuted ? 'rgba(255,255,255,0.06)' : 'rgba(2, 132, 199, 0.25)',
              border: soundMuted ? '1px solid rgba(255,255,255,0.15)' : '1px solid #38bdf8',
              color: soundMuted ? '#94a3b8' : '#38bdf8',
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
      <div className="touch-scroll-x no-scrollbar" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {[
          { 
            id: 'command', 
            label: 'Highway Incident Command', 
            icon: Siren, 
            badge: activeIncident ? 'PRIORITY 1' : null,
            badgeColor: '#ef4444' 
          },
          { 
            id: 'fleet', 
            label: 'PCR Interceptor Fleet', 
            icon: Car, 
            badge: `${activePatrolling}/${totalInterceptors} Patrol`,
            badgeColor: '#38bdf8' 
          },
          { 
            id: 'corridor', 
            label: 'Green Corridor Preemption', 
            icon: Navigation, 
            badge: dispatches.greenCorridorActive ? 'ACTIVE (AIIMS)' : 'STANDBY',
            badgeColor: dispatches.greenCorridorActive ? '#10b981' : '#64748b' 
          },
          { 
            id: 'perimeter', 
            label: 'Hazard Perimeter & Diversions', 
            icon: AlertTriangle, 
            badge: dispatches.hazardPerimeterSet ? 'LANES BLOCKED' : 'CLEAR',
            badgeColor: dispatches.hazardPerimeterSet ? '#f59e0b' : '#10b981' 
          },
          { 
            id: 'stations', 
            label: 'Highway Police Precincts', 
            icon: Building2, 
            badge: 'Sector 04',
            badgeColor: '#6366f1' 
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                flex: '0 0 auto',
                minWidth: 'clamp(140px, 30vw, 190px)',
                whiteSpace: 'nowrap',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.3) 0%, rgba(3, 105, 161, 0.25) 100%)' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
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
              <Icon size={18} color={isActive ? '#38bdf8' : '#64748b'} />
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
      {/* SUB-TAB 1: HIGHWAY INCIDENT COMMAND & LIVE TRIAGE                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'command' && (
        <div>
          {/* ACTIVE HIGHWAY CRASH ALERT BANNER */}
          {activeIncident ? (
            <div style={{
              background: 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #0284c7',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 0 35px rgba(2, 132, 199, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    background: '#0284c7',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 15px rgba(2, 132, 199, 0.6)'
                  }}>
                    <Siren size={20} />
                    <span>PCR 112 HIGHWAY CRASH ALERT</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#7dd3fc' }}>
                      Case ID: <strong>{activeIncident.id}</strong> • Priority 1 Rapid Dispatch
                    </span>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      Expressway Sector: <strong>{activeIncident.location}</strong> ({activeIncident.coordinates?.lat?.toFixed(4)}°N, {activeIncident.coordinates?.lng?.toFixed(4)}°E)
                    </div>
                  </div>
                </div>

                {/* Hospital Triage Linkage Indicator & Quick Resolve */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: hospitalDispatches.ambulanceStatus === 'dispatched' ? '#10b981' : '#f59e0b',
                      boxShadow: '0 0 8px #10b981'
                    }}></div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>HOSPITAL TRAUMA DESK:</div>
                      <div style={{ color: '#38bdf8' }}>
                        {hospitalDispatches.ambulanceStatus === 'dispatched' 
                          ? 'ALS 108 Ambulance Dispatched (ETA: 7 mins)' 
                          : 'Awaiting Trauma Desk Dispatch'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleResetDemo}
                    title="Resolve highway incident and reset to standby"
                    style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Resolve / Reset Alert</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Police Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                marginBottom: '24px'
              }}>
                {/* 1. Dispatch PCR Interceptor */}
                <button
                  onClick={handleDispatchPcr}
                  disabled={dispatches.pcrStatus === 'dispatched'}
                  style={{
                    background: dispatches.pcrStatus === 'dispatched' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: dispatches.pcrStatus === 'dispatched' ? '1px solid #10b981' : 'none',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: dispatches.pcrStatus === 'dispatched' ? 'default' : 'pointer',
                    textAlign: 'left',
                    boxShadow: dispatches.pcrStatus === 'dispatched' ? 'none' : '0 4px 15px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Car size={26} color={dispatches.pcrStatus === 'dispatched' ? '#10b981' : '#fff'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.pcrStatus === 'dispatched' ? '#10b981' : 'rgba(255,255,255,0.25)'
                    }}>
                      {dispatches.pcrStatus === 'dispatched' ? 'EN ROUTE (ETA 4 MIN)' : 'DISPATCH PCR'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.pcrStatus === 'dispatched' ? 'PCR Unit #07 Dispatched' : 'Dispatch PCR Patrol Unit'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    {dispatches.pcrStatus === 'dispatched'
                      ? 'Unit #07 moving towards KM 34.2'
                      : 'Deploy nearest highway patrol interceptor to secure site'}
                  </div>
                </button>

                {/* 2. Green Corridor Activation */}
                <button
                  onClick={handleToggleGreenCorridor}
                  style={{
                    background: dispatches.greenCorridorActive 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: dispatches.greenCorridorActive ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: dispatches.greenCorridorActive ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Navigation size={26} color={dispatches.greenCorridorActive ? '#fff' : '#10b981'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.greenCorridorActive ? 'rgba(0,0,0,0.3)' : 'rgba(16, 185, 129, 0.2)'
                    }}>
                      {dispatches.greenCorridorActive ? 'CORRIDOR ACTIVE' : 'SIGNALS STANDBY'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.greenCorridorActive ? 'Green Corridor: ACTIVE' : 'Activate Green Corridor'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    Synchronize 6 traffic lights from NH-48 to AIIMS Trauma Centre
                  </div>
                </button>

                {/* 3. Highway Hazard Perimeter */}
                <button
                  onClick={handleTogglePerimeter}
                  style={{
                    background: dispatches.hazardPerimeterSet 
                      ? 'rgba(245, 158, 11, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: dispatches.hazardPerimeterSet ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <AlertTriangle size={26} color={dispatches.hazardPerimeterSet ? '#f59e0b' : '#94a3b8'} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: dispatches.hazardPerimeterSet ? '#f59e0b' : 'rgba(255,255,255,0.1)'
                    }}>
                      {dispatches.hazardPerimeterSet ? 'PERIMETER SET' : 'UNSECURED'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    {dispatches.hazardPerimeterSet ? 'Highway Lanes Barricaded' : 'Deploy Hazard Perimeter'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    Block Lane 1 & 2 at KM 34.2 with flares & cones
                  </div>
                </button>

                {/* 4. Generate e-FIR Report */}
                <button
                  onClick={handleGenerateFir}
                  style={{
                    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <FileText size={26} color="#38bdf8" />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8'
                    }}>
                      DIGITAL FORENSIC
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    Generate Digital e-FIR
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px' }}>
                    Download official police accident record with sensor logs
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
              <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', marginBottom: '12px' }}>
                <Shield size={36} color="#38bdf8" />
              </div>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.15rem', fontWeight: 700 }}>
                PCR HIGHWAY COMMAND RADAR: NORMAL PATROL
              </h3>
              <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Listening to global vehicle telemetry network. All expressways clear.
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
                    background: 'rgba(2, 132, 199, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
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

          {/* Grid: Vehicle Plate Legal Lookup & Forensics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Card 1: Vahan RTO Database Lookup */}
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
                  <Car size={20} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    RTO VAHAN Vehicle Dossier
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  GOVT DATABASE
                </span>
              </div>

              <div style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
                border: '2px solid #38bdf8',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>REGISTRATION NUMBER</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>
                    DL-01-AB-4321
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>VEHICLE MAKE</div>
                  <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.95rem' }}>Hyundai Creta Turbo</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Owner Name:</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>Alex Mercer</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>RC Certificate:</div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem' }}>VALID (Till 2038)</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Motor Insurance:</div>
                  <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>HDFC Ergo (Active)</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PUC Certificate:</div>
                  <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.88rem' }}>EXPIRED (3 Days)</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#7dd3fc'
              }}>
                ℹ️ <strong>RTO Record Note:</strong> No active theft or traffic warrants registered on this vehicle plate.
              </div>
            </div>

            {/* Card 2: Police PCR Radio Logs & Event Trail */}
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
                  <Radio size={20} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Police PCR Event & Radio Logs
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  LIVE AUDIT TRAIL
                </span>
              </div>

              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.78rem',
                fontFamily: 'monospace'
              }}>
                {dispatches.logs && dispatches.logs.length > 0 ? (
                  dispatches.logs.map((log, index) => (
                    <div key={index} style={{ padding: '6px 0', color: '#7dd3fc', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#64748b' }}>No police actions dispatched yet. Standby mode active.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PCR INTERCEPTOR FLEET & HIGHWAY PATROL (CRUD)                  */}
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
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL PATROL FLEET</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalInterceptors}</div>
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#7dd3fc' }}>ACTIVE PATROLLING</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{activePatrolling}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>DISPATCHED TO SCENE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{dispatchedUnits}</div>
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
                value={fleetFilter}
                onChange={e => setFleetFilter(e.target.value)}
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
                <option value="patrolling">Patrolling</option>
                <option value="dispatched">Dispatched</option>
                <option value="on_scene">On Scene</option>
                <option value="escorting">Escorting Ambulance</option>
                <option value="standby">Standby</option>
              </select>
            </div>

            <button
              onClick={() => setInterceptorModal({
                isOpen: true,
                mode: 'add',
                data: {
                  callSign: `Highway Patrol Interceptor #${interceptors.length + 1 < 10 ? '0' + (interceptors.length + 1) : interceptors.length + 1}`,
                  plateNumber: `DL-01-GP-00${interceptors.length + 1}`,
                  vehicleModel: 'Tata Safari Stealth (Police Pursuit)',
                  officerInCharge: 'Sub-Inspector Rohit Sharma',
                  officerPhone: '+91 98111 77015',
                  assignedSector: 'NH-48 Expressway Sector 04',
                  status: 'patrolling',
                  speedRadar: 'Active (Laser Doppler)',
                  equipment: 'Radar Gun, Breathalyzer, Spike Strips',
                  currentLocation: 'Sector 04 Patrol Bay',
                  etaMinutes: 5
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>Commission Interceptor Unit</span>
            </button>
          </div>

          {/* Fleet Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {filteredInterceptors.map(pcr => {
              const statusBadges = {
                patrolling: { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', color: '#7dd3fc', label: 'PATROLLING' },
                dispatched: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#f87171', label: 'DISPATCHED (CODE RED)' },
                on_scene: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#fbbf24', label: 'ON SCENE' },
                escorting: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#34d399', label: 'ESCORTING AMBULANCE' },
                standby: { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', color: '#94a3b8', label: 'STANDBY AT BASE' }
              };
              const sBadge = statusBadges[pcr.status] || statusBadges.patrolling;

              return (
                <div
                  key={pcr.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${sBadge.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: pcr.status === 'dispatched' ? '0 0 16px rgba(239, 68, 68, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{pcr.callSign}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{pcr.vehicleModel} • {pcr.plateNumber}</div>
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
                      <span style={{ color: '#94a3b8' }}>Officer in Charge:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{pcr.officerInCharge}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Assigned Sector:</span>
                      <span style={{ color: '#cbd5e1' }}>{pcr.assignedSector}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Speed Radar:</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>{pcr.speedRadar}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Live Location / ETA:</span>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{pcr.currentLocation} ({pcr.etaMinutes}m)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <select
                      value={pcr.status}
                      onChange={e => {
                        cloudDb.updatePoliceInterceptor(pcr.id, { status: e.target.value });
                        showToast(`${pcr.callSign} set to ${e.target.value.toUpperCase()}`);
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
                      <option value="patrolling">Patrolling</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="on_scene">On Scene</option>
                      <option value="escorting">Escorting</option>
                      <option value="standby">Standby</option>
                    </select>

                    <a
                      href={`tel:${pcr.officerPhone}`}
                      style={{
                        background: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
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
                      <span>Call IO</span>
                    </a>

                    <button
                      onClick={() => setInterceptorModal({
                        isOpen: true,
                        mode: 'edit',
                        data: {
                          ...pcr,
                          equipment: Array.isArray(pcr.equipment) ? pcr.equipment.join(', ') : pcr.equipment
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
                        if (window.confirm(`Decommission ${pcr.callSign}?`)) {
                          cloudDb.deletePoliceInterceptor(pcr.id);
                          showToast(`${pcr.callSign} decommissioned`, 'info');
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
      {/* SUB-TAB 3: GREEN CORRIDOR SIGNAL PREEMPTION VISUALIZER                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'corridor' && (
        <div>
          {/* Status Overview Card */}
          <div style={{
            background: dispatches.greenCorridorActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.7)',
            border: `1px solid ${dispatches.greenCorridorActive ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={24} color={dispatches.greenCorridorActive ? '#10b981' : '#94a3b8'} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {dispatches.greenCorridorActive ? 'GREEN CORRIDOR: PREEMPTION ACTIVE' : 'GREEN CORRIDOR: STANDBY'}
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
                Route: NH-48 KM 34.2 (Accident Site) ➔ AIIMS Apex Trauma Centre, New Delhi (24.1 KM)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ESTIMATED TIME SAVINGS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>18 Mins Saved</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>24 min standard ➔ 6 min cleared</div>
              </div>

              <button
                onClick={handleToggleGreenCorridor}
                style={{
                  background: dispatches.greenCorridorActive 
                    ? '#ef4444' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {dispatches.greenCorridorActive ? 'Deactivate Corridor' : 'Lock Green Corridor'}
              </button>
            </div>
          </div>

          {/* Interactive Junctions Chain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {junctions.map((junc, index) => {
              const isPreempted = dispatches.greenCorridorActive || junc.status === 'preempted';

              return (
                <div
                  key={junc.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: `1px solid ${isPreempted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    padding: '14px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isPreempted ? '#10b981' : '#f59e0b',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      boxShadow: isPreempted ? '0 0 12px #10b981' : 'none'
                    }}>
                      #{index + 1}
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{junc.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Marker: {junc.distanceKm} KM from Crash Point • Clearance Window: {junc.clearTimeSec}s
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      background: isPreempted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: isPreempted ? '#34d399' : '#fbbf24',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {isPreempted ? '🟢 LOCKED GREEN FOR AMBULANCE' : '🟡 CYCLIC TRAFFIC LIGHT'}
                    </span>

                    <button
                      onClick={() => {
                        cloudDb.toggleTrafficJunction(junc.id);
                        showToast(`Junction ${junc.name} overridden`);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Override Light
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: ROAD HAZARD PERIMETER & TRAFFIC DIVERSIONS                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'perimeter' && (
        <div>
          {/* Overview */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Highway Crash Perimeter & Traffic Diversion Console
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Lane barricades, safety flares, and Variable Message Sign (VMS) advisory speeds.
              </p>
            </div>

            <button
              onClick={() => setPerimeterModal({
                isOpen: true,
                data: perimeters[0] || {
                  location: 'NH-48 KM 34.2',
                  lanesBlocked: 'Lane 1, Lane 2',
                  vmsSpeedLimit: '30 km/h',
                  flaresDeployed: 8,
                  coneBarrierLengthMeters: 150
                }
              })}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Configure Hazard Perimeter
            </button>
          </div>

          {/* Perimeters List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {perimeters.map(hp => (
              <div
                key={hp.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '14px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{
                      background: '#f59e0b',
                      color: '#000',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {hp.status} BARRICADE
                    </span>
                    <h4 style={{ margin: '6px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{hp.location}</h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Setup Time: {hp.setupTime}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700 }}>LANES CLOSED / BARRICADED</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                      {Array.isArray(hp.lanesBlocked) ? hp.lanesBlocked.join(', ') : hp.lanesBlocked}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>LANES OPEN FOR DIVERSION</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                      {Array.isArray(hp.openLanes) ? hp.openLanes.join(', ') : hp.openLanes}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>VMS ADVISORY SPEED LIMIT</div>
                    <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.2rem', marginTop: '2px' }}>
                      {hp.vmsSpeedLimit}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#7dd3fc', fontWeight: 700 }}>SAFETY HARDWARE DEPLOYED</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                      {hp.flaresDeployed} Flares • {hp.coneBarrierLengthMeters}m Cone Wall
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: HIGHWAY POLICE STATIONS & PRECINCTS                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'stations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[
            {
              name: 'PCR Highway Command Sector 04 Post',
              officer: 'Inspector Vikram Malhotra (SHO)',
              phone: '+91 98111 77007',
              location: 'KM 32.5 Expressway Toll Plaza Annex',
              coverage: 'NH-48 KM 28 to KM 42 (Hero Honda Chowk & Flyovers)',
              frequency: '154.600 MHz (Channel 04)'
            },
            {
              name: 'Cyber City Expressway Traffic Police Station',
              officer: 'Sub-Inspector Ankit Rawat',
              phone: '+91 98222 77002',
              location: 'DLF Phase 2 Underpass Control Complex',
              coverage: 'Expressway Cyber Hub Corridor & Golf Course Ext.',
              frequency: '154.650 MHz (Channel 02)'
            },
            {
              name: 'Delhi-Gurugram Border Highway Patrol Unit',
              officer: 'ASI Deepa Nair',
              phone: '+91 98333 77011',
              location: 'Sirhaul Border Toll Plaza Patrol Bay',
              coverage: 'Interstate Border KM 18 to KM 28',
              frequency: '154.700 MHz (Channel 01)'
            },
            {
              name: 'Regional Transport Office (RTO) Enforcement',
              officer: 'MLO S.K. Duggal',
              phone: '+91 11 2399 8115',
              location: 'RTO South-West District HQ',
              coverage: 'Commercial Vehicle Fitness & Overload Enforcement',
              frequency: 'Official Phone Hotline'
            }
          ].map((st, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{st.name}</h4>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '8px' }}>Commander: {st.officer}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Base: {st.location}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Sector: {st.coverage}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginBottom: '12px' }}>Radio: {st.frequency}</div>
              <a
                href={`tel:${st.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <Phone size={12} />
                <span>Call Station ({st.phone})</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMMISSION / EDIT INTERCEPTOR                                      */}
      {/* ========================================================================= */}
      {interceptorModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {interceptorModal.mode === 'add' ? 'Commission Highway Interceptor' : 'Edit Interceptor Profile'}
              </h3>
              <button
                onClick={() => setInterceptorModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Call Sign / Unit Designation</label>
                <input
                  type="text"
                  value={interceptorModal.data?.callSign || ''}
                  onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, callSign: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Plate Number</label>
                  <input
                    type="text"
                    value={interceptorModal.data?.plateNumber || ''}
                    onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, plateNumber: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Vehicle Model</label>
                  <input
                    type="text"
                    value={interceptorModal.data?.vehicleModel || ''}
                    onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, vehicleModel: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Officer in Charge</label>
                  <input
                    type="text"
                    value={interceptorModal.data?.officerInCharge || ''}
                    onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, officerInCharge: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Officer Phone</label>
                  <input
                    type="text"
                    value={interceptorModal.data?.officerPhone || ''}
                    onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, officerPhone: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assigned Highway Sector</label>
                <input
                  type="text"
                  value={interceptorModal.data?.assignedSector || ''}
                  onChange={e => setInterceptorModal(prev => ({ ...prev, data: { ...prev.data, assignedSector: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setInterceptorModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (interceptorModal.mode === 'add') {
                    cloudDb.addPoliceInterceptor(interceptorModal.data);
                    showToast('Interceptor commissioned into fleet!');
                  } else {
                    cloudDb.updatePoliceInterceptor(interceptorModal.data.id, interceptorModal.data);
                    showToast('Interceptor details updated!');
                  }
                  setInterceptorModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Interceptor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital e-FIR Quick Modal */}
      {showFirModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '2px solid #38bdf8',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.4)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={24} color="#38bdf8" />
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                  DELHI POLICE DIGITAL e-FIR
                </h3>
              </div>
              <button
                onClick={() => setShowFirModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              <div><strong>FIR Number:</strong> FIR-2026-DEL-8821</div>
              <div><strong>Date & Time:</strong> {activeIncident ? activeIncident.date : new Date().toLocaleString()}</div>
              <div><strong>Police Station:</strong> Sector 04 PCR Highway Command, NH-48</div>
              <div><strong>Incident Location:</strong> {activeIncident ? activeIncident.location : 'NH-48 KM 34.2'}</div>
              <div><strong>GPS Coordinates:</strong> 28.4595° N, 77.0266° E</div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
              <div><strong>Vehicle Involved:</strong> Hyundai Creta Turbo (DL-01-AB-4321)</div>
              <div><strong>Driver / Owner:</strong> Alex Mercer (Age 32, Male)</div>
              <div><strong>MPU6050 Peak Deceleration:</strong> {activeIncident ? activeIncident.peakGForce : '5.84g'}</div>
              <div><strong>Pre-Impact Speed:</strong> {activeIncident ? activeIncident.speedAtImpact : '74 km/h'}</div>
              <div><strong>Status:</strong> ALS Ambulance #12 Dispatched to AIIMS Trauma</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  alert('Official Digital e-FIR FIR-2026-DEL-8821 downloaded to terminal.');
                  setShowFirModal(false);
                }}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={16} />
                <span>Save Official e-FIR (PDF)</span>
              </button>
              <button
                onClick={() => setShowFirModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
