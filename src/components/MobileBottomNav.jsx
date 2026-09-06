import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  HeartPulse, 
  Menu 
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenMenu, emergencyActive }) {
  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'GPS Map', icon: MapPin },
    { id: 'hospital-map', label: 'Hospitals', icon: Building2 },
    { id: 'medical', label: 'Medical', icon: HeartPulse }
  ];

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
              {tab.id === 'dashboard' && emergencyActive && (
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

