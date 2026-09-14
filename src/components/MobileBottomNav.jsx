import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  HeartPulse, 
  Menu,
  Heart,
  Shield,
  ShieldAlert,
  Users,
  History
} from 'lucide-react';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenMenu, 
  emergencyActive,
  currentUser
}) {
  const role = currentUser?.role || 'Vehicle Owner';

  let mainTabs = [];
  if (role === 'Paramedic ER' || role === 'Hospital Staff') {
    mainTabs = [
      { id: 'hospital-terminal', label: 'Trauma ER', icon: Heart },
      { id: 'hospital-map', label: 'Trauma Map', icon: Building2 },
      { id: 'history', label: 'Incidents', icon: History },
      { id: 'contacts', label: 'ICE Doctors', icon: Users }
    ];
  } else if (role === 'Police Command' || role === 'Police / Traffic Control') {
    mainTabs = [
      { id: 'police-command', label: 'PCR 112', icon: Shield },
      { id: 'map', label: 'Radar Map', icon: MapPin },
      { id: 'history', label: 'FIR Logs', icon: History },
      { id: 'contacts', label: 'Police Dir', icon: Users }
    ];
  } else if (role === 'Guardian') {
    mainTabs = [
      { id: 'guardian-portal', label: 'Safety', icon: Users },
      { id: 'map', label: 'Live GPS', icon: MapPin },
      { id: 'history', label: 'Trips', icon: History },
      { id: 'contacts', label: 'Circle', icon: Users }
    ];
  } else {
    // Default: Vehicle Owner
    mainTabs = [
      { id: 'dashboard', label: 'Cockpit', icon: LayoutDashboard },
      { id: 'map', label: 'GPS Map', icon: MapPin },
      { id: 'hospital-map', label: 'Hospitals', icon: Building2 },
      { id: 'medical', label: 'Medical ID', icon: HeartPulse }
    ];
  }

  return (
    <nav className="mobile-bottom-nav mobile-only-flex" aria-label="Mobile Navigation">
      {mainTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Icon size={20} />
              {(tab.id === 'dashboard' || tab.id === 'hospital-terminal' || tab.id === 'police-command' || tab.id === 'guardian-portal') && emergencyActive && (
                <span className="mobile-nav-indicator-alert" />
              )}
            </div>
            <span className="label">{tab.label}</span>
          </button>
        );
      })}

      {/* 5th Button: Open Full Drawer Menu */}
      <button
        onClick={onOpenMenu}
        className="mobile-bottom-nav-item"
        aria-label="Open Full Menu"
      >
        <div className="icon-wrapper">
          <Menu size={20} />
        </div>
        <span className="label">More</span>
      </button>
    </nav>
  );
}
