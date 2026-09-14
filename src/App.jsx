import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TelemetryBar from './components/TelemetryBar';
import DashboardTab from './components/Dashboard/DashboardTab';
import AccidentMapTab from './components/Map/AccidentMapTab';
import PersonalHospitalMapTab from './components/Map/PersonalHospitalMapTab';
import AiAnalysisTab from './components/AIAnalysis/AiAnalysisTab';
import VehicleManagerTab from './components/Vehicles/VehicleManagerTab';
import MedicalCareTab from './components/Medical/MedicalCareTab';
import EmergencyContactsTab from './components/Contacts/EmergencyContactsTab';
import AccidentHistoryTab from './components/History/AccidentHistoryTab';
import Esp32ApiHubTab from './components/ApiHub/Esp32ApiHubTab';
import ArchitectureTab from './components/Architecture/ArchitectureTab';
import EmergencySosModal from './components/Emergency/EmergencySosModal';
import AuthModal from './components/Auth/AuthModal';
import LoginPage from './components/Auth/LoginPage';
import VehicleInfoForm from './components/Forms/VehicleInfoForm';
import MedicalInfoForm from './components/Forms/MedicalInfoForm';
import MobileBottomNav from './components/MobileBottomNav';
import HospitalTerminalTab from './components/Hospital/HospitalTerminalTab';
import HospitalIncidentRecordsTab from './components/Hospital/HospitalIncidentRecordsTab';
import HospitalDirectoryTab from './components/Hospital/HospitalDirectoryTab';
import PoliceCommandTab from './components/Police/PoliceCommandTab';
import PoliceFirRecordsTab from './components/Police/PoliceFirRecordsTab';
import PoliceDirectoryTab from './components/Police/PoliceDirectoryTab';
import GuardianPortalTab from './components/Guardian/GuardianPortalTab';
import GuardianTripHistoryTab from './components/Guardian/GuardianTripHistoryTab';
import GuardianCircleTab from './components/Guardian/GuardianCircleTab';
import MultiDeviceModal from './components/MultiDevice/MultiDeviceModal';
import cloudDb from './services/cloudDbEngine';

import { 
  initialVehicles, 
  initialMedicalProfile, 
  initialEmergencyContacts 
} from './services/mockData';
import { defaultTelemetryState } from './services/telemetryEngine';

const getInitialUser = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'hospital') {
      return {
        name: 'Dr. Rohan Sharma (ER Doctor)',
        email: 'dr.rohan@trauma108.gov.in',
        role: 'Paramedic ER'
      };
    }
    if (view === 'police') {
      return {
        name: 'Inspector Vijay Kumar (PCR 112)',
        email: 'inspector.vijay@delhipolice.gov.in',
        role: 'Police Command'
      };
    }
    if (view === 'guardian') {
      return {
        name: 'Sarah Mercer (Guardian)',
        email: 'sarah.mercer@example.com',
        role: 'Guardian'
      };
    }
  } catch (e) {}
  return {
    name: 'Alex Mercer (Owner)',
    email: 'alex.mercer@safedrive.io',
    role: 'Vehicle Owner'
  };
};

const getRoleHomeTab = (role) => {
  if (role === 'Paramedic ER' || role === 'Hospital Staff') return 'hospital-terminal';
  if (role === 'Police Command' || role === 'Police / Traffic Control') return 'police-command';
  if (role === 'Guardian') return 'guardian-portal';
  return 'dashboard';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState(() => getRoleHomeTab(getInitialUser().role));
  const [isMultiDeviceOpen, setIsMultiDeviceOpen] = useState(false);
  const [vehicles, setVehicles] = useState(() => cloudDb.state.vehicles || initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    const selId = cloudDb.state.selectedVehicleId;
    const found = (cloudDb.state.vehicles || []).find(v => v.id === selId);
    return found || cloudDb.state.vehicles?.[0] || initialVehicles[0];
  });
  const [medicalProfile, setMedicalProfile] = useState(() => cloudDb.state.medicalProfile || initialMedicalProfile);
  const [emergencyContacts, setEmergencyContacts] = useState(() => cloudDb.state.emergencyContacts || initialEmergencyContacts);
  const [telemetry, setTelemetry] = useState(defaultTelemetryState);

  // Emergency SOS Modal State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState({ triggerSource: '', severity: '', reason: '' });
  const lastProcessedIncidentId = useRef(null);
  const isInitialMount = useRef(true);

  // Auth User State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscribe to Worldwide Real-time Cloud Database
  useEffect(() => {
    const unsubscribe = cloudDb.subscribe((state) => {
      if (state.telemetry) {
        setTelemetry(prev => ({ ...prev, ...state.telemetry }));
      }
      if (state.vehicles && Array.isArray(state.vehicles) && state.vehicles.length > 0) {
        setVehicles(state.vehicles);
        if (state.selectedVehicleId) {
          const found = state.vehicles.find(v => v.id === state.selectedVehicleId);
          if (found) setSelectedVehicle(found);
        }
      }
      if (state.medicalProfile) {
        setMedicalProfile(state.medicalProfile);
      }
      if (state.emergencyContacts && Array.isArray(state.emergencyContacts)) {
        setEmergencyContacts(state.emergencyContacts);
      }

      // On initial page mount or reload, ignore existing active incidents so SOS never starts automatically
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (state.activeIncident) {
          lastProcessedIncidentId.current = state.activeIncident.id;
        }
        return;
      }

      if (state.activeIncident && state.telemetry?.isEmergencyAlert) {
        setEmergencyData({
          triggerSource: 'WORLDWIDE_CLOUD_EVENT',
          severity: state.activeIncident.severity || 'CRITICAL',
          reason: state.activeIncident.aiSummary || state.activeIncident.reason || 'Accident Collision Detected'
        });
        // On driver cockpit, pop up emergency modal ONLY for newly triggered incidents
        if (activeTab === 'dashboard' && state.activeIncident.id !== lastProcessedIncidentId.current) {
          lastProcessedIncidentId.current = state.activeIncident.id;
          setIsSosOpen(true);
        }
      } else {
        setIsSosOpen(false);
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    setActiveTab(getRoleHomeTab(userObj.role));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Calculate global document expiry count for badges
  const allDocs = vehicles.flatMap(v => v.documents);
  const expiryAlertCount = allDocs.filter(d => d.status === 'expired' || d.status === 'expiring_soon').length;

  const triggerEmergency = (triggerSource, severity, reason) => {
    setEmergencyData({ triggerSource, severity, reason });
    setTelemetry(prev => ({
      ...prev,
      isEmergencyAlert: true,
      alertSeverity: severity,
      alertReason: reason
    }));
    const newIncident = cloudDb.triggerCrashIncident({
      severity,
      reason,
      peakGForce: triggerSource.includes('IMPACT') ? '5.99g' : '3.82g',
      speedAtImpact: `${telemetry.speedKmh.toFixed(0)} km/h`,
      location: 'NH-48 Expressway, KM 34.2 (Near Hero Honda Chowk)'
    });
    if (newIncident && newIncident.id) {
      lastProcessedIncidentId.current = newIncident.id;
    }
    setIsSosOpen(true);
  };

  const updateTelemetry = (newTelemetry) => {
    setTelemetry(prev => ({ ...prev, ...newTelemetry }));
    cloudDb.broadcastTelemetry(newTelemetry);
  };

  // IF NOT LOGGED IN -> RENDER FIRST LOGIN / REGISTRATION PAGE
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const currentUserWithLogout = currentUser ? { ...currentUser, onLogout: handleLogout } : null;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        telemetry={telemetry}
        triggerEmergency={triggerEmergency}
        currentUser={currentUserWithLogout}
        openAuthModal={() => setIsAuthOpen(true)}
        expiryAlertCount={expiryAlertCount}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMultiDevice={() => setIsMultiDeviceOpen(true)}
      />

      {/* Hardware / Operational Status Strip */}
      <TelemetryBar telemetry={telemetry} currentUser={currentUser} cloudDb={cloudDb} />

      {/* Tablet Quick Horizontal Tab Strip (Visible on tablet 769px - 1024px) */}
      <nav className="tablet-nav-strip touch-scroll-x no-scrollbar" style={{
        background: 'rgba(10, 15, 26, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '8px 12px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        position: 'sticky',
        top: '62px',
        zIndex: 900
      }}>
        {(() => {
          const role = currentUser?.role || 'Vehicle Owner';
          let tabs = [];
          if (role === 'Paramedic ER' || role === 'Hospital Staff') {
            tabs = [
              { id: 'hospital-terminal', label: 'Trauma ER', icon: '🏥' },
              { id: 'hospital-map', label: 'Trauma Map', icon: '🚑' },
              { id: 'history', label: 'MLC Incidents', icon: '📜' },
              { id: 'contacts', label: 'ER Directory', icon: '📞' }
            ];
          } else if (role === 'Police Command' || role === 'Police / Traffic Control') {
            tabs = [
              { id: 'police-command', label: 'PCR Command', icon: '🚓' },
              { id: 'map', label: 'Radar Map', icon: '🗺️' },
              { id: 'history', label: 'FIR Records', icon: '📜' },
              { id: 'contacts', label: 'Police Dir', icon: '📞' }
            ];
          } else if (role === 'Guardian') {
            tabs = [
              { id: 'guardian-portal', label: 'Safety', icon: '👨‍👩‍👧' },
              { id: 'map', label: 'Live GPS', icon: '🗺️' },
              { id: 'history', label: 'Trips', icon: '📜' },
              { id: 'contacts', label: 'Circle', icon: '👥' }
            ];
          } else {
            tabs = [
              { id: 'dashboard', label: 'Cockpit', icon: '📊' },
              { id: 'map', label: 'GPS Map', icon: '🗺️' },
              { id: 'hospital-map', label: 'Facilities', icon: '🚑' },
              { id: 'ai-analysis', label: 'AI Analysis', icon: '🧠' },
              { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
              { id: 'medical', label: 'Medical', icon: '🩺' },
              { id: 'contacts', label: 'Contacts', icon: '👥' },
              { id: 'history', label: 'History', icon: '📜' },
              { id: 'architecture', label: 'Architecture', icon: '⚡' },
              { id: 'api-hub', label: 'ESP32 API', icon: '🔌' }
            ];
          }
          return tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
                border: activeTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeTab === tab.id ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab.id ? '#fbbf24' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ));
        })()}
      </nav>

      {/* Main Grid Content */}
      <div className="app-main">
        {/* Sidebar Nav */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          documentExpiryCount={expiryAlertCount}
          emergencyActive={telemetry.isEmergencyAlert}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          currentUser={currentUser}
        />

        {/* Tab Content Rendering */}
        <main className="main-content-viewport">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              vehicles={vehicles}
              setVehicles={setVehicles}
              medicalProfile={medicalProfile}
              setMedicalProfile={setMedicalProfile}
              telemetry={telemetry}
              updateTelemetry={updateTelemetry}
              triggerEmergency={triggerEmergency}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'hospital-terminal' && (
            <HospitalTerminalTab />
          )}

          {activeTab === 'police-command' && (
            <PoliceCommandTab />
          )}

          {activeTab === 'guardian-portal' && (
            <GuardianPortalTab />
          )}

          {activeTab === 'map' && (
            <AccidentMapTab 
              selectedVehicle={selectedVehicle}
              telemetry={telemetry}
              updateTelemetry={updateTelemetry}
            />
          )}

          {activeTab === 'hospital-map' && (
            <PersonalHospitalMapTab 
              selectedVehicle={selectedVehicle}
              medicalProfile={medicalProfile}
              telemetry={telemetry}
              triggerEmergency={triggerEmergency}
              updateTelemetry={updateTelemetry}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AiAnalysisTab 
              selectedVehicle={selectedVehicle}
              telemetry={telemetry}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagerTab 
              vehicles={vehicles}
              setVehicles={setVehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
            />
          )}

          {activeTab === 'medical' && (
            <MedicalCareTab 
              medicalProfile={medicalProfile}
              setMedicalProfile={setMedicalProfile}
            />
          )}

          {activeTab === 'contacts' && (
            (currentUser?.role === 'Paramedic ER' || currentUser?.role === 'Hospital Staff') ? (
              <HospitalDirectoryTab />
            ) : (currentUser?.role === 'Police Command' || currentUser?.role === 'Police / Traffic Control') ? (
              <PoliceDirectoryTab />
            ) : (currentUser?.role === 'Guardian') ? (
              <GuardianCircleTab />
            ) : (
              <EmergencyContactsTab 
                contacts={emergencyContacts}
                setContacts={setEmergencyContacts}
                telemetry={telemetry}
                selectedVehicle={selectedVehicle}
              />
            )
          )}

          {activeTab === 'history' && (
            (currentUser?.role === 'Paramedic ER' || currentUser?.role === 'Hospital Staff') ? (
              <HospitalIncidentRecordsTab />
            ) : (currentUser?.role === 'Police Command' || currentUser?.role === 'Police / Traffic Control') ? (
              <PoliceFirRecordsTab />
            ) : (currentUser?.role === 'Guardian') ? (
              <GuardianTripHistoryTab />
            ) : (
              <AccidentHistoryTab />
            )
          )}

          {activeTab === 'architecture' && (
            <ArchitectureTab />
          )}

          {activeTab === 'api-hub' && (
            <Esp32ApiHubTab 
              updateTelemetry={updateTelemetry}
              triggerEmergency={triggerEmergency}
            />
          )}
        </main>
      </div>

      {/* High Priority Emergency SOS Modal */}
      <EmergencySosModal 
        isOpen={isSosOpen}
        onClose={() => {
          setIsSosOpen(false);
          setTelemetry(prev => ({ ...prev, isEmergencyAlert: false }));
        }}
        selectedVehicle={selectedVehicle}
        telemetry={telemetry}
        emergencyData={emergencyData}
        medicalProfile={medicalProfile}
        emergencyContacts={emergencyContacts}
      />

      {/* User Login & Role Switcher Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onLogout={handleLogout}
      />

      {/* Worldwide Multi-Device Presentation Setup Modal */}
      <MultiDeviceModal 
        isOpen={isMultiDeviceOpen}
        onClose={() => setIsMultiDeviceOpen(false)}
      />

      {/* Native Mobile Bottom Navigation Bar (< 769px) */}
      <MobileBottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        emergencyActive={telemetry.isEmergencyAlert}
        currentUser={currentUser}
      />
    </div>
  );
}
