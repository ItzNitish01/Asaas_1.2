import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Car, 
  Bike, 
  Wifi, 
  BatteryCharging, 
  Radio, 
  AlertTriangle, 
  UserCheck, 
  Lock,
  Zap,
  Menu,
  Globe,
  Heart,
  Shield,
  Building2,
  PhoneCall,
  Users,
  Server,
  Database
} from 'lucide-react';
import cloudDb from '../services/cloudDbEngine';
import { backendApi } from '../services/apiClient';

export default function Navbar({ 
  vehicles, 
  selectedVehicle, 
  setSelectedVehicle, 
  telemetry, 
  triggerEmergency, 
  currentUser, 
  openAuthModal,
  expiryAlertCount,
  onToggleMobileMenu,
  activeTab,
  setActiveTab,
  onOpenMultiDevice
}) {
  const role = currentUser?.role || 'Vehicle Owner';
  const isSuperAdmin = role === 'Super Admin' || role === 'SUPER_ADMIN';
  const isHospital = role === 'Paramedic ER' || role === 'Hospital Staff' || role === 'HOSPITAL_ER';
  const isPolice = role === 'Police Command' || role === 'Police / Traffic Control' || role === 'POLICE_CONTROL';
  const isGuardian = role === 'Guardian' || role === 'GUARDIAN_PUBLIC';
  const isVehicleOwner = !isSuperAdmin && !isHospital && !isPolice && !isGuardian;

  const [backendOnline, setBackendOnline] = useState(backendApi.isBackendOnline);

  useEffect(() => {
    return backendApi.onStatusChange((status) => {
      setBackendOnline(status);
    });
  }, []);

  return (
    <header className="navbar-container">
      {/* Brand & Hamburger */}
      <div className="navbar-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 0 }}>
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="mobile-nav-toggle btn btn-ghost"
          style={{
            padding: '8px',
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'rgba(255, 255, 255, 0.12)'
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} color="#f8fafc" />
        </button>

        <div style={{
          width: 'clamp(32px, 4vw, 38px)',
          height: 'clamp(32px, 4vw, 38px)',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
          flexShrink: 0
        }}>
          <ShieldAlert size={20} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(0.95rem, 3.2vw, 1.2rem)', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, lineHeight: 1.1 }}>
            ASAAS <span style={{ color: '#f59e0b', fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>OS</span>
          </h1>
          <p className="navbar-brand-subtitle desktop-only" style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Automated System for Accident Alert & Safety</p>
        </div>
      </div>

      {/* Right Cluster: Role-Specific Headers & Controls */}
      <div className="navbar-right-cluster" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.2vw, 12px)', minWidth: 0, flexShrink: 1 }}>
        
        {/* ==================== 1. VEHICLE OWNER HEADER ==================== */}
        {isVehicleOwner && (
          <>
            {/* Vehicle Selector Dropdown */}
            <div className="navbar-vehicle-select-container" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '4px clamp(5px, 1vw, 10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {selectedVehicle?.type === 'two-wheeler' ? (
                <Bike size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
              ) : (
                <Car size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
              )}
              <select 
                value={selectedVehicle?.id || ''}
                onChange={(e) => {
                  const found = vehicles.find(v => v.id === e.target.value);
                  if (found) setSelectedVehicle(found);
                }}
                className="navbar-vehicle-select"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: 'clamp(70px, 18vw, 120px)',
                  textOverflow: 'ellipsis'
                }}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} style={{ background: '#0d0d0d', color: '#fff' }}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ESP32 Hardware Status Indicator */}
            <div className="navbar-hw-stats" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.78rem',
              color: '#94a3b8',
              background: 'rgba(12, 12, 12, 0.8)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <span className="live-dot" /> ESP32 Online
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BatteryCharging size={14} color="#f59e0b" /> {telemetry.batteryPercent}%
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio size={14} color="#a855f7" /> {telemetry.gpsSatellites} Sats
              </span>
            </div>

            {/* Document Expiry Alerts Badge */}
            {expiryAlertCount > 0 && (
              <div className="navbar-hw-stats" style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}>
                <AlertTriangle size={14} /> {expiryAlertCount} Alert{expiryAlertCount > 1 ? 's' : ''}
              </div>
            )}
          </>
        )}

        {/* ==================== 2. HOSPITAL ER HEADER ==================== */}
        {isHospital && (
          <>
            {/* Hospital Facility Identification */}
            <div className="navbar-station-badge desktop-only" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '5px 12px',
              color: '#fca5a5',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <Building2 size={16} color="#ef4444" />
              <span>AIIMS Apex Trauma Centre</span>
            </div>

            {/* Hospital Hotline & Trauma Level */}
            <div className="navbar-hotline-badge desktop-only" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '20px',
              padding: '5px 12px',
              color: '#6ee7b7',
              fontSize: '0.74rem',
              fontWeight: 600,
              flexShrink: 0
            }}>
              <PhoneCall size={13} color="#10b981" />
              <span>ER Hotline: 108 / (011) 2659-3333</span>
            </div>
          </>
        )}

        {/* ==================== 3. POLICE COMMAND HEADER ==================== */}
        {isPolice && (
          <>
            {/* Police Command Identity */}
            <div className="navbar-station-badge desktop-only" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '5px 12px',
              color: '#7dd3fc',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <ShieldAlert size={16} color="#38bdf8" />
              <span>Delhi Police CAD 112 Hub</span>
            </div>

            {/* Police Beat & Frequency */}
            <div className="navbar-hotline-badge desktop-only" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '20px',
              padding: '5px 12px',
              color: '#6ee7b7',
              fontSize: '0.74rem',
              fontWeight: 600,
              flexShrink: 0
            }}>
              <Radio size={13} color="#10b981" />
              <span>NH-48 Sector 4 | VHF Ch 14</span>
            </div>
          </>
        )}

        {/* ==================== 4. GUARDIAN HEADER ==================== */}
        {isGuardian && (
          <div className="navbar-station-badge desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '5px 12px',
            color: '#6ee7b7',
            fontSize: '0.78rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            <Car size={15} color="#10b981" />
            <span>Monitoring: Alex (Hyundai Creta)</span>
          </div>
        )}

        {/* ==================== 5. SUPER ADMIN HEADER ==================== */}
        {isSuperAdmin && (
          <div className="navbar-station-badge desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '10px',
            padding: '5px 12px',
            color: '#d8b4fe',
            fontSize: '0.78rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            <ShieldAlert size={16} color="#a855f7" />
            <span>Root Fleet &amp; Gateway Audit</span>
          </div>
        )}

        {/* Role Badge Indicator */}
        <div className="navbar-role-badge desktop-tablet-only" style={{
          alignItems: 'center',
          gap: '6px',
          padding: '5px 11px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 800,
          background: isSuperAdmin ? 'rgba(168, 85, 247, 0.25)'
            : isHospital ? 'rgba(239, 68, 68, 0.2)' 
            : isPolice ? 'rgba(56, 189, 248, 0.2)'
            : isGuardian ? 'rgba(16, 185, 129, 0.2)'
            : 'rgba(245, 158, 11, 0.2)',
          border: isSuperAdmin ? '1px solid #a855f7'
            : isHospital ? '1px solid #ef4444' 
            : isPolice ? '1px solid #38bdf8'
            : isGuardian ? '1px solid #10b981'
            : '1px solid #f59e0b',
          color: isSuperAdmin ? '#d8b4fe'
            : isHospital ? '#fca5a5' 
            : isPolice ? '#7dd3fc'
            : isGuardian ? '#6ee7b7'
            : '#fde68a',
          flexShrink: 0
        }}>
          {isSuperAdmin ? <ShieldAlert size={14} color="#a855f7" />
            : isHospital ? <Heart size={14} color="#ef4444" />
            : isPolice ? <Shield size={14} color="#38bdf8" />
            : isGuardian ? <Users size={14} color="#10b981" />
            : <Car size={14} color="#f59e0b" />}
          <span className="btn-text-hide-xs">
            {isSuperAdmin ? 'SUPER ADMIN ROOT'
              : isHospital ? 'HOSPITAL ER TRAUMA'
              : isPolice ? 'POLICE PCR COMMAND'
              : isGuardian ? 'FAMILY GUARDIAN'
              : 'VEHICLE COCKPIT'}
          </span>
        </div>

        {/* Live Backend & Database Engine Status Indicator */}
        <div 
          className="navbar-db-badge desktop-tablet-only"
          title={backendOnline ? "ASAAS Real-Time Production Backend & Database: CONNECTED" : "Backend Server: Standalone Client Mode"}
          style={{
            alignItems: 'center',
            gap: '5px',
            background: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: backendOnline ? '#34d399' : '#fbbf24',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: backendOnline ? '#10b981' : '#f59e0b',
            boxShadow: backendOnline ? '0 0 8px #10b981' : 'none'
          }}></div>
          <Database size={13} color={backendOnline ? "#10b981" : "#f59e0b"} />
          <span className="btn-text-hide-xs">{backendOnline ? 'DB LIVE' : 'CLIENT SYNC'}</span>
        </div>

        {/* Worldwide Room Sync Button */}
        <button
          onClick={onOpenMultiDevice}
          className="navbar-sync-btn"
          title="Worldwide Multi-Device Presentation Setup (Open on Phone, Tablet & Laptop)"
          style={{
            background: 'rgba(99, 102, 241, 0.18)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc',
            borderRadius: '20px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Globe size={14} color="#818cf8" />
          <span className="desktop-tablet-only">Sync:</span>
          <span className="desktop-tablet-only">{cloudDb.roomId.length > 12 ? `${cloudDb.roomId.substring(0, 10)}...` : cloudDb.roomId}</span>
        </button>

        {/* Emergency SOS / Simulation Trigger (Context-Aware) */}
        {isVehicleOwner && (
          <button 
            className="btn btn-emergency pulse-red navbar-sos-btn"
            onClick={() => triggerEmergency('MANUAL_SOS_BUTTON', 'CRITICAL', 'User Pressed SOS Panic Button')}
            style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            id="btn-emergency-sos-top"
          >
            <Zap size={14} /> <span className="desktop-tablet-only">EMERGENCY </span><span>SOS</span>
          </button>
        )}

        {isHospital && (
          <button 
            className="btn btn-emergency pulse-red navbar-sos-btn"
            onClick={() => triggerEmergency('TRAUMA_SIMULATION_DRILL', 'CRITICAL', 'Simulated Mass Casualty Trauma Admission (ER Drill)')}
            style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            title="Simulate Level-1 trauma crash admission to test hospital triage desk"
          >
            <Zap size={14} /> <span className="desktop-tablet-only">TEST </span><span className="desktop-tablet-only">TRAUMA </span><span>DRILL</span>
          </button>
        )}

        {isPolice && (
          <button 
            className="btn btn-emergency pulse-red navbar-sos-btn"
            onClick={() => triggerEmergency('HIGHWAY_CRASH_SIMULATION', 'CRITICAL', 'Simulated Highway Expressway Crash Event by PCR 112 CAD')}
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.78rem', 
              whiteSpace: 'nowrap', 
              flexShrink: 0,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
              borderColor: '#38bdf8' 
            }}
            title="Simulate highway crash incident to test patrol interceptor dispatch & green corridor"
          >
            <Zap size={14} /> <span className="desktop-tablet-only">TEST </span><span className="desktop-tablet-only">PCR </span><span>ALERT</span>
          </button>
        )}

        {isSuperAdmin && (
          <button 
            className="btn btn-emergency pulse-red navbar-sos-btn"
            onClick={() => triggerEmergency('FLEET_GATEWAY_DRILL', 'CRITICAL', 'Simulated Fleet-Wide Gateway Emergency Drill (Root Command)')}
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.78rem', 
              whiteSpace: 'nowrap', 
              flexShrink: 0,
              background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)', 
              borderColor: '#a855f7' 
            }}
            title="Simulate full emergency response across all portals"
          >
            <Zap size={14} /> <span className="desktop-tablet-only">ROOT </span><span>DRILL</span>
          </button>
        )}

        {/* User Profile / Auth Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button 
            onClick={openAuthModal}
            className="btn btn-ghost navbar-user-btn"
            style={{ padding: '6px 8px', borderRadius: '8px' }}
            title={currentUser ? currentUser.role : 'Login'}
          >
            <UserCheck size={16} color="#f59e0b" />
            <span className="desktop-only" style={{ fontSize: '0.78rem' }}>{currentUser ? currentUser.role : 'Login'}</span>
          </button>

          {currentUser && (
            <button 
              onClick={currentUser.onLogout}
              className="btn btn-ghost navbar-logout-btn desktop-tablet-only"
              title="Logout"
              style={{ padding: '6px 7px', borderRadius: '8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <Lock size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
