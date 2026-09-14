import React from 'react';
import { 
  Battery, 
  Signal, 
  Compass, 
  Activity, 
  Radio, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Building2,
  HeartPulse,
  Truck,
  Droplet,
  UserCheck,
  Shield,
  ShieldAlert,
  Car,
  Navigation
} from 'lucide-react';

export default function TelemetryBar({ telemetry, currentUser, cloudDb }) {
  const role = currentUser?.role || 'Vehicle Owner';
  const isHospital = role === 'Paramedic ER' || role === 'Hospital Staff';
  const isPolice = role === 'Police Command' || role === 'Police / Traffic Control';
  const isGuardian = role === 'Guardian';

  // ==================== 1. HOSPITAL ER OPERATIONS STRIP ====================
  if (isHospital) {
    const bays = cloudDb?.state?.hospitalBays || [];
    const availableBays = bays.filter(b => b.status === 'AVAILABLE').length;
    const reservedBays = bays.filter(b => b.status === 'RESERVED').length;
    const ambulances = cloudDb?.state?.ambulances || [];
    const activeAmbs = ambulances.filter(a => a.status !== 'Standby').length;
    const bloodUnits = (cloudDb?.state?.bloodStock || []).reduce((acc, b) => acc + (b.units || 0), 0);
    const doctors = cloudDb?.state?.onCallDoctors || [];
    const onDutyDocs = doctors.filter(d => d.dutyStatus === 'On Duty (In ER)').length;

    return (
      <div className="telemetry-bar-container touch-scroll-x no-scrollbar" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
        {/* Hospital Command Hub */}
        <div className="telemetry-bar-item">
          <Building2 size={16} color="#ef4444" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ER COMMAND HUB</span>
            <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot" style={{ background: '#ef4444' }} /> AIIMS Trauma Center (Node 108)
            </div>
          </div>
        </div>

        {/* ICU / Trauma Bays */}
        <div className="telemetry-bar-item">
          <HeartPulse size={16} color="#f59e0b" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>TRAUMA BAYS</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              <span style={{ color: '#10b981' }}>{availableBays || 4} Available</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}> ({reservedBays || 2} Locked Code Red)</span>
            </div>
          </div>
        </div>

        {/* ALS Ambulances */}
        <div className="telemetry-bar-item">
          <Truck size={16} color="#38bdf8" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ALS 108 AMBULANCE FLEET</span>
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>
              {activeAmbs || 1} En Route <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({ambulances.length || 6} Total in Fleet)</span>
            </div>
          </div>
        </div>

        {/* Blood Bank Reserve */}
        <div className="telemetry-bar-item">
          <Droplet size={16} color="#f43f5e" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>CRYO BLOOD VAULT</span>
            <div style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} /> {bloodUnits || 88} Units <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(All 8 Types Ready)</span>
            </div>
          </div>
        </div>

        {/* On-Duty Surgeons */}
        <div className="telemetry-bar-item">
          <UserCheck size={16} color="#10b981" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>TRAUMA SURGEONS</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              <span style={{ color: '#10b981' }}>{onDutyDocs || 3} In ER</span> <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({doctors.length || 5} On Call)</span>
            </div>
          </div>
        </div>

        {/* CAD Ping */}
        <div className="telemetry-bar-item">
          <Clock size={16} color="#64748b" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>HOSPITAL CAD SYNC</span>
            <div style={{ fontWeight: 600, color: '#94a3b8' }} className="mono">
              {telemetry?.lastUpdateTimestamp || '00:00:01'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. POLICE COMMAND OPERATIONS STRIP ====================
  if (isPolice) {
    const interceptors = cloudDb?.state?.policeInterceptors || [];
    const activePatrols = interceptors.filter(i => i.status === 'Patrolling' || i.status === 'Dispatched').length;
    const junctions = cloudDb?.state?.trafficJunctions || [];
    const greenCorridorActive = junctions.some(j => j.status === 'GREEN_WAVE_ACTIVE');

    return (
      <div className="telemetry-bar-container touch-scroll-x no-scrollbar" style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
        {/* Police CAD Hub */}
        <div className="telemetry-bar-item">
          <ShieldAlert size={16} color="#38bdf8" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>HIGHWAY CONTROL DESK</span>
            <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot" style={{ background: '#38bdf8' }} /> Delhi Police CAD 112 Hub
            </div>
          </div>
        </div>

        {/* Patrol Fleet */}
        <div className="telemetry-bar-item">
          <Shield size={16} color="#10b981" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>INTERCEPTOR PATROLS</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              <span style={{ color: '#10b981' }}>{activePatrols || 3} Active</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}> ({interceptors.length || 4} Total Units)</span>
            </div>
          </div>
        </div>

        {/* Green Corridor Status */}
        <div className="telemetry-bar-item">
          <Activity size={16} color={greenCorridorActive ? '#10b981' : '#f59e0b'} />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>GREEN CORRIDOR SYNC</span>
            <div style={{ fontWeight: 700, color: greenCorridorActive ? '#10b981' : '#fbbf24' }}>
              {greenCorridorActive ? '🚨 ALL GREEN WAVE ACTIVE' : '⚡ STANDBY (Ready to Preempt)'}
            </div>
          </div>
        </div>

        {/* Expressway Radar Surveillance */}
        <div className="telemetry-bar-item">
          <Navigation size={16} color="#a855f7" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>EXPRESSWAY SURVEILLANCE</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              NH-48 KM 34.2 <span style={{ fontSize: '0.7rem', color: '#10b981' }}>(Sector 01-04 Radar Online)</span>
            </div>
          </div>
        </div>

        {/* Police Radio Frequency */}
        <div className="telemetry-bar-item">
          <Radio size={16} color="#38bdf8" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ENCRYPTED WIRELESS</span>
            <div style={{ fontWeight: 700, color: '#7dd3fc' }}>
              VHF Ch 14 <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(156.700 MHz CAD)</span>
            </div>
          </div>
        </div>

        {/* CAD Ping */}
        <div className="telemetry-bar-item">
          <Clock size={16} color="#64748b" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>POLICE CAD SYNC</span>
            <div style={{ fontWeight: 600, color: '#94a3b8' }} className="mono">
              {telemetry?.lastUpdateTimestamp || '00:00:01'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. GUARDIAN LIVE TRACKING STRIP ====================
  if (isGuardian) {
    return (
      <div className="telemetry-bar-container touch-scroll-x no-scrollbar" style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div className="telemetry-bar-item">
          <Car size={16} color="#c084fc" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>MONITORED FAMILY CAR</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              Alex's Hyundai Creta <span style={{ fontSize: '0.7rem', color: '#64748b' }}>(DL-01-AB-1234)</span>
            </div>
          </div>
        </div>

        <div className="telemetry-bar-item">
          <Compass size={16} color="#a855f7" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>LIVE LOCATION</span>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>
              NH-48 Expressway KM 34.2 <span style={{ fontSize: '0.7rem', color: '#10b981' }}>(GPS Fixed)</span>
            </div>
          </div>
        </div>

        <div className="telemetry-bar-item">
          <Activity size={16} color="#38bdf8" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>VEHICLE SPEED</span>
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>
              {telemetry?.speedKmh ? telemetry.speedKmh.toFixed(0) : 0} km/h
            </div>
          </div>
        </div>

        <div className="telemetry-bar-item">
          <ShieldCheck size={16} color={telemetry?.isEmergencyAlert ? '#ef4444' : '#10b981'} />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>FAMILY SAFETY STATUS</span>
            <div style={{ fontWeight: 700, color: telemetry?.isEmergencyAlert ? '#ef4444' : '#10b981' }}>
              {telemetry?.isEmergencyAlert ? '🚨 CRITICAL CRASH ALERT' : '✅ DRIVING SAFELY (NORMAL)'}
            </div>
          </div>
        </div>

        <div className="telemetry-bar-item">
          <Clock size={16} color="#64748b" />
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>GPS LAST SEEN</span>
            <div style={{ fontWeight: 600, color: '#94a3b8' }} className="mono">
              {telemetry?.lastUpdateTimestamp || '00:00:01'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 4. DEFAULT: VEHICLE OWNER IOT HARDWARE STRIP ====================
  return (
    <div className="telemetry-bar-container touch-scroll-x no-scrollbar">
      {/* Battery */}
      <div className="telemetry-bar-item">
        <Battery size={16} color="#f59e0b" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>BATTERY</span>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>
            {telemetry.batteryPercent}% <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({telemetry.batteryVoltage})</span>
          </div>
        </div>
      </div>

      {/* GPS Location Status */}
      <div className="telemetry-bar-item">
        <Compass size={16} color="#a855f7" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>GPS FIX (NEO-6M)</span>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>
            {telemetry.gpsSatellites} Sats <span style={{ fontSize: '0.7rem', color: '#64748b' }}>HDOP {telemetry.gpsHdop}</span>
          </div>
        </div>
      </div>

      {/* GSM Signal */}
      <div className="telemetry-bar-item">
        <Signal size={16} color="#10b981" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>GSM SIGNAL (SIM800L)</span>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>
            {telemetry.gsmSignalDbm} dBm <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({telemetry.gsmCarrier})</span>
          </div>
        </div>
      </div>

      {/* MPU6050 Accelerometer */}
      <div className="telemetry-bar-item">
        <Activity size={16} color="#f59e0b" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>MPU6050 ACCEL</span>
          <div style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> {telemetry.mpuSensorStatus}
          </div>
        </div>
      </div>

      {/* Physical Hardware SOS Switch */}
      <div className="telemetry-bar-item">
        <Radio size={16} color="#ef4444" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>HW SOS SWITCH</span>
          <div style={{ fontWeight: 700, color: telemetry.sosPhysicalButton === 'PRESSED' ? '#ef4444' : '#94a3b8' }}>
            {telemetry.sosPhysicalButton}
          </div>
        </div>
      </div>

      {/* Last Heartbeat */}
      <div className="telemetry-bar-item">
        <Clock size={16} color="#64748b" />
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>TELEMETRY PING</span>
          <div style={{ fontWeight: 600, color: '#94a3b8' }} className="mono">
            {telemetry.lastUpdateTimestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
