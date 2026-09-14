import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2,
  BrainCircuit, 
  Car, 
  HeartPulse, 
  Users, 
  History, 
  Cpu, 
  Network,
  ShieldAlert,
  AlertTriangle,
  Zap,
  FileText,
  ClipboardList,
  Server,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  documentExpiryCount, 
  emergencyActive,
  isMobileOpen,
  onCloseMobile,
  currentUser
}) {
  const role = currentUser?.role || 'Vehicle Owner';

  // Strict Role-Based Tab Configurations
  let navItems = [];
  if (role === 'Super Admin' || role === 'SUPER_ADMIN') {
    navItems = [
      { id: 'admin-audit', label: 'Master System & Fleet Audit', icon: ShieldAlert, badge: 'ROOT', badgeColor: 'primary' },
      { id: 'hospital-terminal', label: 'Trauma ER Terminal', icon: HeartPulse, badge: emergencyActive ? 'CODE RED' : null, badgeColor: 'danger' },
      { id: 'police-command', label: 'Highway PCR Command', icon: ShieldAlert },
      { id: 'guardian-portal', label: 'Family Safety Portal', icon: Users },
      { id: 'dashboard', label: 'Driver Cockpit & Telemetry', icon: LayoutDashboard },
      { id: 'map', label: 'Live GPS Accident Radar', icon: MapPin },
      { id: 'hospital-map', label: 'Trauma Centers GIS', icon: Building2 },
      { id: 'ai-analysis', label: 'AI Crash Severity', icon: BrainCircuit },
      { id: 'vehicles', label: 'Fleet Garage & Documents', icon: Car, badge: documentExpiryCount > 0 ? `${documentExpiryCount}` : null, badgeColor: 'warning' },
      { id: 'medical', label: 'ABHA Medical Records', icon: HeartPulse },
      { id: 'contacts', label: 'Global Directory', icon: Users },
      { id: 'history', label: 'Full Incident Logs', icon: History },
      { id: 'architecture', label: 'System Architecture', icon: Network },
      { id: 'api-hub', label: 'IoT Hardware API Hub', icon: Cpu }
    ];
  } else if (role === 'Paramedic ER' || role === 'Hospital Staff') {
    navItems = [
      { id: 'hospital-terminal', label: 'Emergency Trauma Triage', icon: HeartPulse, badge: emergencyActive ? 'CODE RED' : 'STANDBY', badgeColor: emergencyActive ? 'danger' : 'success' },
      { id: 'hospital-map', label: 'Trauma Centers & Routes', icon: Building2 },
      { id: 'history', label: 'Hospital Incident & MLC Records', icon: History },
      { id: 'contacts', label: 'Hospital Emergency Directory', icon: Users }
    ];
  } else if (role === 'Police Command' || role === 'Police / Traffic Control') {
    navItems = [
      { id: 'police-command', label: 'Highway PCR Command', icon: ShieldAlert, badge: emergencyActive ? 'ALERT' : 'PATROL', badgeColor: emergencyActive ? 'danger' : 'info' },
      { id: 'map', label: 'Expressway GPS Radar', icon: MapPin },
      { id: 'history', label: 'Accident FIR & Legal Records', icon: History },
      { id: 'contacts', label: 'Highway Police Directory', icon: Users }
    ];
  } else if (role === 'Guardian') {
    navItems = [
      { id: 'guardian-portal', label: 'Family Safety Portal', icon: Users, badge: emergencyActive ? 'CRASH' : 'SAFE', badgeColor: emergencyActive ? 'danger' : 'success' },
      { id: 'map', label: 'Vehicle Live GPS', icon: MapPin },
      { id: 'history', label: 'Family Trip & Safety Logs', icon: History },
      { id: 'contacts', label: 'Family Emergency Circle', icon: Users }
    ];
  } else {
    // Default: Vehicle Owner
    navItems = [
      { id: 'dashboard', label: 'Driver Cockpit & Telemetry', icon: LayoutDashboard, badge: emergencyActive ? 'CRASH' : null, badgeColor: 'danger' },
      { id: 'map', label: 'Accident Map & GPS', icon: MapPin },
      { id: 'hospital-map', label: 'Nearby Facilities Map', icon: Building2 },
      { id: 'ai-analysis', label: 'AI Crash Analysis', icon: BrainCircuit },
      { id: 'vehicles', label: 'Vehicles & Documents', icon: Car, badge: documentExpiryCount > 0 ? `${documentExpiryCount} Expiring` : null, badgeColor: 'warning' },
      { id: 'medical', label: 'Medical Info & Records', icon: HeartPulse },
      { id: 'contacts', label: 'Emergency Contacts', icon: Users },
      { id: 'history', label: 'Trip & Accident Logs', icon: History },
      { id: 'architecture', label: 'System Architecture', icon: Network },
      { id: 'api-hub', label: 'ESP32 / Arduino API', icon: Cpu }
    ];
  }

  const renderNavButtons = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ padding: '0 12px 12px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {role.toUpperCase()} PORTAL
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onCloseMobile) onCloseMobile();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isActive ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
              borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
              color: isActive ? '#f8fafc' : '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={18} color={isActive ? '#f59e0b' : '#94a3b8'} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`badge badge-${item.badgeColor}`} style={{ fontSize: '0.65rem' }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderHardwareCard = () => {
    if (role === 'Super Admin' || role === 'SUPER_ADMIN') {
      return (
        <div className="glass-card" style={{ padding: '14px', marginTop: '20px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#a855f7', marginBottom: '6px' }}>
            <Server size={14} /> Global Central Gateway
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            FastAPI: <strong style={{ color: '#10b981' }}>Port 5000 Online</strong><br />
            Database: <strong style={{ color: '#38bdf8' }}>Neon PostGIS (9 ER / 5 PCR)</strong><br />
            Event Bus: <strong style={{ color: '#a855f7' }}>Upstash TLS Live</strong>
          </p>
        </div>
      );
    }
    if (role === 'Paramedic ER') {
      return (
        <div className="glass-card" style={{ padding: '14px', marginTop: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
            <HeartPulse size={14} /> AIIMS Trauma ER Terminal
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Trauma Bay: <strong style={{ color: '#10b981' }}>Bay #04 Ready</strong><br />
            ALS 108 Fleet: <strong style={{ color: '#10b981' }}>Online (Unit #12)</strong><br />
            Blood Bank: <strong style={{ color: '#10b981' }}>O+ Pre-matched</strong>
          </p>
        </div>
      );
    }
    if (role === 'Police Command') {
      return (
        <div className="glass-card" style={{ padding: '14px', marginTop: '20px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
            <ShieldAlert size={14} /> PCR 112 Highway Node
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            PCR Interceptors: <strong style={{ color: '#38bdf8' }}>Unit #07 Active</strong><br />
            Expressway Radar: <strong style={{ color: '#10b981' }}>NH-48 Sector 4</strong><br />
            Traffic Corridors: <strong style={{ color: '#10b981' }}>Ready to Sync</strong>
          </p>
        </div>
      );
    }
    if (role === 'Guardian') {
      return (
        <div className="glass-card" style={{ padding: '14px', marginTop: '20px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
            <Users size={14} /> Family Safety Link
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Driver Status: <strong style={{ color: '#10b981' }}>Live Monitored</strong><br />
            Vehicle: <strong style={{ color: '#c084fc' }}>Hyundai Creta</strong><br />
            Emergency SOS: <strong style={{ color: '#10b981' }}>Armed & Ready</strong>
          </p>
        </div>
      );
    }
    return (
      <div className="glass-card" style={{ padding: '14px', marginTop: '20px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
          <Zap size={14} /> Active Node Status
        </div>
        <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          MPU6050 Accel: <strong style={{ color: '#10b981' }}>OK (±16g)</strong><br />
          NEO-6M GPS: <strong style={{ color: '#10b981' }}>3D Fixed (12 Sats)</strong><br />
          SIM800L GSM: <strong style={{ color: '#10b981' }}>GPRS Active</strong>
        </p>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Fixed Sidebar (Visible on 1025px+) */}
      <aside className="desktop-sidebar-only" style={{
        background: 'rgba(5, 5, 5, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 'calc(100vh - 120px)'
      }}>
        {renderNavButtons()}
        {renderHardwareCard()}
      </aside>

      {/* 2. Mobile / Tablet Off-Canvas Drawer (Active when isMobileOpen is true) */}
      {isMobileOpen && (
        <div 
          className="mobile-drawer-overlay mobile-only" 
          onClick={onCloseMobile}
        />
      )}

      <div className={`mobile-drawer mobile-only ${isMobileOpen ? 'open' : 'closed'}`} style={{
        padding: '20px 14px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>ASAAS Console</strong>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Navigation Center</div>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '8px' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {renderNavButtons()}
        {renderHardwareCard()}
      </div>
    </>
  );
}
