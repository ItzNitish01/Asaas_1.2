import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Siren, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  MapPin, 
  Heart, 
  Clock, 
  Navigation,
  Building2,
  Volume2,
  ShieldAlert,
  Octagon,
  Radio,
  ExternalLink
} from 'lucide-react';
import { sirenSound } from '../../services/telemetryEngine';
import { findNearestEmergencyServices } from '../../services/geoService';

export default function EmergencySosModal({ 
  isOpen, 
  onClose, 
  selectedVehicle, 
  telemetry, 
  emergencyData, 
  medicalProfile, 
  emergencyContacts 
}) {
  // Step progression: 0: Accident Detected -> 1: GPS Fix -> 2: Hospital (1st) -> 3: Police (2nd) -> 4: Family (3rd) -> 5: Complete
  const [step, setStep] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [timeline, setTimeline] = useState([]);
  
  // Configurable Cancellation Window Duration (Default: 15 seconds, selectable: 10s, 15s, 20s, 30s)
  const [cancellationDuration, setCancellationDuration] = useState(15);
  const [countdown, setCountdown] = useState(15);
  const [isWindowExpired, setIsWindowExpired] = useState(false);

  // Freeze crash coordinates on modal open so live GPS jitter doesn't reset the countdown
  const [crashLocation, setCrashLocation] = useState({ 
    lat: telemetry.lat, 
    lng: telemetry.lng, 
    gForce: telemetry.totalGForce || 4.85 
  });

  // Dynamically compute the exact nearest hospital and nearest police station from frozen crash location
  const { nearestHospital, nearestPolice } = useMemo(() => {
    return findNearestEmergencyServices(crashLocation.lat, crashLocation.lng);
  }, [crashLocation.lat, crashLocation.lng]);

  const getCurrentTimeStr = () => new Date().toLocaleTimeString();

  // Guards to prevent duplicate executions
  const hasDispatchedRef = useRef(false);
  const timerRefs = useRef([]);

  const clearAllTimers = () => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
  };

  // 1. Initialize modal ONCE when isOpen turns true
  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      sirenSound.stopSiren();
      hasDispatchedRef.current = false;
      return;
    }

    // Freeze snapshot of crash moment
    const snapLat = telemetry.lat;
    const snapLng = telemetry.lng;
    const snapG = telemetry.totalGForce || 4.85;
    setCrashLocation({ lat: snapLat, lng: snapLng, gForce: snapG });

    // Reset progression & start siren
    sirenSound.startSiren();
    setStep(0);
    setIsStopped(false);
    setIsWindowExpired(false);
    setCountdown(cancellationDuration);
    hasDispatchedRef.current = false;
    clearAllTimers();

    const initialTime = getCurrentTimeStr();
    setTimeline([
      { time: initialTime, text: `Collision Sensor Impact Detected (${snapG.toFixed(2)}g)`, icon: '💥' },
      { time: initialTime, text: 'Relay Module Siren / Alarm Tripped (Local Audio Warning Active)', icon: '🔊' },
      { time: initialTime, text: `Safety Cancellation Window Activated: ${cancellationDuration}s countdown to abort false positive`, icon: '⏳' }
    ]);

    // Fast GPS acquisition lock at 1200ms
    const tGps = setTimeout(() => {
      setStep(1);
      setTimeline(prev => [
        ...prev, 
        { time: getCurrentTimeStr(), text: `GPS Fix Locked: ${snapLat.toFixed(5)}°N, ${snapLng.toFixed(5)}°E (${telemetry.gpsSatellites || 12} Sats locked)`, icon: '📍' }
      ]);
    }, 1200);

    timerRefs.current.push(tGps);

    return () => {
      clearAllTimers();
      sirenSound.stopSiren();
    };
  }, [isOpen]); // ONLY triggers when opening or closing modal!

  // 2. Second-by-second countdown ticker for the cancellation window
  useEffect(() => {
    if (!isOpen || isStopped || isWindowExpired) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWindowExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isStopped, isWindowExpired]);

  // 3. When cancellation window reaches 0, trigger the 3-Tier Priority Dispatch (EXACTLY ONCE)
  useEffect(() => {
    if (!isWindowExpired || isStopped || hasDispatchedRef.current) return;
    hasDispatchedRef.current = true; // Lock immediately to prevent duplicate triggers

    setTimeline(prev => [
      ...prev,
      { time: getCurrentTimeStr(), text: 'CANCELLATION WINDOW EXPIRED: Zero occupant override received. LOCKING IN PRIORITY DISPATCH.', icon: '🚨' }
    ]);

    // Priority 1: Hospital (at +800ms)
    const tHospital = setTimeout(() => {
      setStep(2);
      setTimeline(prev => [
        ...prev, 
        { time: getCurrentTimeStr(), text: `Priority 1: Nearest Trauma Center alerted -> ${nearestHospital?.name || 'Emergency Hospital'} (${nearestHospital?.distance || 'nearby'})`, icon: '🏥' }
      ]);
    }, 800);

    // Priority 2: Police (at +2500ms)
    const tPolice = setTimeout(() => {
      setStep(3);
      setTimeline(prev => [
        ...prev, 
        { time: getCurrentTimeStr(), text: `Priority 2: Nearest Police Station alerted -> ${nearestPolice?.name || 'Highway Police'} (${nearestPolice?.distance || 'nearby'})`, icon: '👮' }
      ]);
    }, 2500);

    // Priority 3: Family (at +4200ms)
    const tFamily = setTimeout(() => {
      setStep(4);
      setTimeline(prev => [
        ...prev, 
        { time: getCurrentTimeStr(), text: 'Priority 3: Family Emergency SOS SMS & WhatsApp packets dispatched', icon: '👨‍👩‍👧' }
      ]);
    }, 4200);

    timerRefs.current.push(tHospital, tPolice, tFamily);
  }, [isWindowExpired, isStopped, nearestHospital, nearestPolice]);

  // Dynamic user adjustment of window duration
  const handleDurationChange = (sec) => {
    if (isWindowExpired || isStopped) return;
    setCancellationDuration(sec);
    setCountdown(sec);
    setTimeline(prev => [
      ...prev,
      { time: getCurrentTimeStr(), text: `Cancellation Window adjusted to ${sec}s by occupant`, icon: '⏱️' }
    ]);
  };

  // Circuit breaker stop action
  const handleStopButton = () => {
    clearAllTimers();
    sirenSound.stopSiren();
    setIsStopped(true);
    hasDispatchedRef.current = false;
    setTimeline(prev => [
      ...prev,
      { time: getCurrentTimeStr(), text: 'HARDWARE CIRCUIT INTERRUPT: Stop Button Pressed - Audio Siren & Alert Halted (False Alarm Cancelled)', icon: '🛑' }
    ]);
  };

  if (!isOpen) return null;

  const primaryContact = emergencyContacts.find(c => c.isPrimary) || emergencyContacts[0];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${crashLocation.lat},${crashLocation.lng}`;
  const smsBody = `🚨 ASAAS ACCIDENT ALERT!\nVehicle: ${selectedVehicle.name} (${selectedVehicle.registrationNumber})\nDevice: ${selectedVehicle.espDeviceId}\nGPS: ${crashLocation.lat.toFixed(5)}, ${crashLocation.lng.toFixed(5)}\nMap: ${mapsUrl}\nNearest Hospital: ${nearestHospital?.name} (${nearestHospital?.distance}, ETA ${nearestHospital?.eta})\nNearest Police: ${nearestPolice?.name} (${nearestPolice?.distance}, ETA ${nearestPolice?.eta})\nPatient Blood: ${medicalProfile.bloodGroup}`;

  return (
    <div className="modal-overlay">
      <div className="glass-card glass-card-emergency modal-content-responsive" style={{
        width: 'min(760px, 95vw)',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '20px',
        color: '#f8fafc',
        position: 'relative'
      }}>
        {/* Header Alert Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className={isStopped ? '' : 'pulse-red'} style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: isStopped ? '#475569' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Siren size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0, fontWeight: 800, letterSpacing: '-0.01em' }}>
                {isStopped ? 'HARDWARE CIRCUIT INTERRUPTED' : 'CRITICAL ACCIDENT SOS BROADCAST'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                Vehicle: <strong style={{ color: '#f8fafc' }}>{selectedVehicle.registrationNumber}</strong> | Node: <span className="mono" style={{ color: '#fbbf24' }}>{selectedVehicle.espDeviceId}</span> | Coords: <span className="mono">{crashLocation.lat.toFixed(4)}°, {crashLocation.lng.toFixed(4)}°</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => { sirenSound.stopSiren(); onClose(); }}
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '8px' }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* DYNAMIC SAFETY CANCELLATION WINDOW & CIRCUIT BREAKER BAR */}
        <div style={{
          background: isStopped 
            ? 'rgba(71, 85, 105, 0.25)' 
            : !isWindowExpired 
              ? 'rgba(239, 68, 68, 0.15)' 
              : 'rgba(16, 185, 129, 0.12)',
          border: isStopped 
            ? '1px solid #475569' 
            : !isWindowExpired 
              ? '1px solid rgba(239, 68, 68, 0.45)' 
              : '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isStopped ? '#334155' : !isWindowExpired ? '#dc2626' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: !isStopped && !isWindowExpired ? '1.15rem' : '0.85rem'
              }} className={!isStopped && !isWindowExpired ? 'pulse-red' : ''}>
                {isStopped ? '🛑' : !isWindowExpired ? `${countdown}s` : '✓'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ 
                    color: isStopped ? '#cbd5e1' : !isWindowExpired ? '#fca5a5' : '#6ee7b7', 
                    fontSize: '0.92rem',
                    letterSpacing: '-0.01em'
                  }}>
                    {isStopped 
                      ? 'CIRCUIT INTERRUPTED: FALSE ALARM CANCELLED' 
                      : !isWindowExpired 
                        ? `CANCELLATION WINDOW ACTIVE: ${countdown}s TO ABORT` 
                        : 'WINDOW EXPIRED: PRIORITY DISPATCH COMMITTED'}
                  </strong>
                  {!isStopped && !isWindowExpired && (
                    <span className="live-dot alert" />
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isStopped 
                    ? 'Driver pressed physical stop switch — siren silenced & emergency broadcast terminated' 
                    : !isWindowExpired 
                      ? `Vehicle horn/relay active. If uncancelled, Priority 1 Hospital dispatch initiates in ${countdown}s` 
                      : 'Zero occupant override received — autonomous 3-tier emergency network triggered'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {!isStopped && !isWindowExpired ? (
                <>
                  <button 
                    onClick={handleStopButton}
                    className="btn btn-emergency"
                    style={{
                      fontSize: '0.86rem',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                      fontWeight: 700
                    }}
                  >
                    <Octagon size={18} /> STOP / CANCEL EMERGENCY
                  </button>
                </>
              ) : isStopped ? (
                <span className="badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  DISPATCH TERMINATED (FALSE ALARM)
                </span>
              ) : (
                <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  TRANSMISSION ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar during countdown */}
          {!isStopped && !isWindowExpired && (
            <div>
              <div style={{
                height: '6px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(countdown / cancellationDuration) * 100}%`,
                  background: countdown > 5 ? '#ef4444' : '#f97316',
                  transition: 'width 1s linear',
                  borderRadius: '999px'
                }} />
              </div>

              {/* Quick Timing Preset Selectors for Demonstration */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: '8px',
                fontSize: '0.74rem',
                color: '#94a3b8'
              }}>
                <span>Adjust Window Duration:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[10, 15, 20, 30].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleDurationChange(sec)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: cancellationDuration === sec ? 700 : 500,
                        background: cancellationDuration === sec ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                        border: cancellationDuration === sec ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: cancellationDuration === sec ? '#fca5a5' : '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {sec}s{sec === 15 ? ' (Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DYNAMIC NEAREST SERVICES DUAL CARD (HOSPITAL & POLICE) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px', marginBottom: '18px' }}>
          {/* 1st Priority: Nearest Hospital */}
          <div style={{
            background: step >= 2 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            border: step >= 2 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
            padding: '16px',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-hospital" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={13} /> 1st Priority &bull; Nearest Hospital
                </span>
                <span className="mono" style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                  {nearestHospital?.distance} &bull; ETA {nearestHospital?.eta}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', margin: '4px 0 2px 0', fontWeight: 700 }}>
                {nearestHospital?.name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {nearestHospital?.traumaLevel || nearestHospital?.category}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '0.74rem' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  ✓ {nearestHospital?.icuBeds} ICU Beds Available
                </span>
                <span style={{ color: '#64748b' }}>&bull;</span>
                <span style={{ color: '#cbd5e1' }}>
                  {nearestHospital?.bloodBank?.split(' ')[0] || 'Blood Bank Ready'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a 
                href={`tel:${nearestHospital?.emergencyHotline?.split('/')[0]?.trim() || nearestHospital?.phone}`} 
                className="btn btn-medical" 
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem' }}
              >
                <PhoneCall size={13} /> Call ER ({nearestHospital?.emergencyHotline?.split('/')[0]?.trim() || '102'})
              </a>
              <a 
                href={nearestHospital?.googleMapsDirUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-ghost" 
                style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                title="Open Route Navigation"
              >
                <Navigation size={13} /> Route
              </a>
            </div>
          </div>

          {/* 2nd Priority: Nearest Police Station */}
          <div style={{
            background: step >= 3 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            border: step >= 3 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
            padding: '16px',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-police" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={13} /> 2nd Priority &bull; Nearest Police Station
                </span>
                <span className="mono" style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>
                  {nearestPolice?.distance} &bull; ETA {nearestPolice?.eta}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', margin: '4px 0 2px 0', fontWeight: 700 }}>
                {nearestPolice?.name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Jurisdiction: {nearestPolice?.jurisdiction || nearestPolice?.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '0.74rem' }}>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                  ✓ {nearestPolice?.patrolUnitsActive || 4} Patrol Units Active
                </span>
                <span style={{ color: '#64748b' }}>&bull;</span>
                <span style={{ color: '#cbd5e1' }}>
                  Direct Helpline: 112
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a 
                href={`tel:${nearestPolice?.phone || '112'}`} 
                className="btn btn-police" 
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem' }}
              >
                <PhoneCall size={13} /> Call Police ({nearestPolice?.phone || '112'})
              </a>
              <a 
                href={nearestPolice?.googleMapsDirUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-ghost" 
                style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                title="Open Route Navigation"
              >
                <Navigation size={13} /> Route
              </a>
            </div>
          </div>
        </div>

        {/* 3rd Priority: Family Contact Bar */}
        <div style={{
          background: step >= 4 ? 'rgba(192, 132, 252, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: step >= 4 ? '1px solid rgba(192, 132, 252, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={18} color="#c084fc" />
            <div>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700 }}>
                3RD PRIORITY &bull; EMERGENCY CONTACTS
              </span>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 600 }}>
                {primaryContact?.name} ({primaryContact?.relation}) &bull; {primaryContact?.phone}
              </div>
            </div>
          </div>

          <a 
            href={`https://wa.me/${primaryContact?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(smsBody)}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: '0.76rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
          >
            <MessageSquare size={14} /> Send WhatsApp SOS Payload
          </a>
        </div>

        {/* LIVE RESPONSE TIMELINE */}
        <div style={{
          background: 'rgba(10, 15, 26, 0.95)',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          marginBottom: '18px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} color="#f59e0b" /> Real-time Sequential Telemetry Log
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
            {timeline.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                <span className="mono" style={{ color: '#64748b', fontSize: '0.72rem', minWidth: '70px' }}>{ev.time}</span>
                <span>{ev.icon}</span>
                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{ev.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Vitals Pill */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '0.76rem',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px'
        }}>
          <Heart size={14} />
          <span>
            <strong>Transmitted Dossier:</strong> Blood Group: <strong>{medicalProfile?.bloodGroup}</strong> &bull; Known Allergies: <strong>{medicalProfile?.allergies?.join(', ') || 'None'}</strong> &bull; Organ Donor: <strong>{medicalProfile?.organDonor ? 'Yes' : 'No'}</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
            Dismiss & Keep Monitoring
          </button>
        </div>
      </div>
    </div>
  );
}
