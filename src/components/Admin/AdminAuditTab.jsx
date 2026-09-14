import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  Database,
  Radio,
  Cpu,
  Activity,
  Users,
  Building2,
  Car,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Zap,
  Lock,
  FileText,
  Clock,
  ArrowRight,
  Shield,
  HeartPulse,
  Key
} from 'lucide-react';
import { cloudDb } from '../../services/cloudDbEngine';
import { apiClient } from '../../services/apiClient';

export default function AdminAuditTab({ setActiveTab }) {
  const [systemStats, setSystemStats] = useState({
    apiStatus: 'ONLINE',
    dbStatus: 'CONNECTED (Neon PostGIS)',
    redisStatus: 'CONNECTED (Upstash TLS)',
    wsConnections: 1,
    latencyMs: 38,
    activeIncidentsCount: 0,
    hospitalsCount: 9,
    policeCount: 5,
    vehiclesCount: 4,
    registeredUsersCount: 5
  });

  const [incidentsList, setIncidentsList] = useState([]);
  const [deviceList, setDeviceList] = useState([
    { deviceId: 'ASAAS-001', vehiclePlate: 'DL-01-AB-4321', firmware: 'v2.4.1-PROD', status: 'ONLINE', lastPing: 'Just now', signal: '-65 dBm' },
    { deviceId: 'ESP32-HARDWARE-02', vehiclePlate: 'HR-26-DK-8392', firmware: 'v2.4.1-PROD', status: 'ONLINE', lastPing: '2s ago', signal: '-70 dBm' },
    { deviceId: 'ESP32-NODE-03', vehiclePlate: 'MH-02-CP-9011', firmware: 'v2.3.9-LTS', status: 'STANDBY', lastPing: '14s ago', signal: '-74 dBm' },
    { deviceId: 'ESP32-DEV-TEST', vehiclePlate: 'KA-04-EV-2024', firmware: 'v2.5.0-BETA', status: 'ONLINE', lastPing: 'Just now', signal: '-61 dBm' }
  ]);

  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Fetch live system health and active incidents
  const refreshAuditData = async () => {
    setLoading(true);
    try {
      // Check health
      const health = await apiClient.get('/health');
      if (health) {
        setSystemStats(prev => ({
          ...prev,
          apiStatus: health.status || 'ONLINE',
          wsConnections: health.websocket_connections || 1
        }));
      }

      // Check active incident
      const activeInc = await apiClient.get('/v1/incidents/active');
      if (activeInc && activeInc.incident_ref) {
        setIncidentsList([activeInc]);
        setSystemStats(prev => ({ ...prev, activeIncidentsCount: 1 }));
      } else {
        setIncidentsList([]);
        setSystemStats(prev => ({ ...prev, activeIncidentsCount: 0 }));
      }

      // Check hospitals
      const hosps = await apiClient.get('/v1/hospitals/all');
      if (hosps && Array.isArray(hosps)) {
        setSystemStats(prev => ({ ...prev, hospitalsCount: hosps.length }));
      }

      // Check police
      const police = await apiClient.get('/v1/police/all');
      if (police && Array.isArray(police)) {
        setSystemStats(prev => ({ ...prev, policeCount: police.length }));
      }
    } catch (err) {
      console.warn('[ADMIN-AUDIT] Local state fallback active:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuditData();
    const timer = setInterval(refreshAuditData, 15000);
    return () => clearInterval(timer);
  }, []);

  const triggerSystemDrill = async () => {
    setActionFeedback('Triggering live multi-agency trauma drill across all connected portals...');
    try {
      await apiClient.post('/v1/incidents/trigger', {
        device_id: 'ASAAS-001',
        severity: 'HIGH',
        reason: 'Super Admin Scheduled Trauma Response Drill',
        peak_g_force: '5.24g',
        speed_at_impact: '62 km/h',
        coordinates: { lat: 28.4595, lng: 77.0266 }
      });
      refreshAuditData();
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      setActionFeedback('Drill simulated locally in test environment.');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const resolveAllIncidents = async () => {
    setActionFeedback('Broadcasting emergency resolution and clearing live alerts...');
    try {
      cloudDb.abortEmergency?.('Super Admin Manual Reset');
      cloudDb.clearActiveIncident?.();
      await apiClient.post('/v1/incidents/abort', {
        incident_ref: 'ALL',
        reason: 'Super Admin Command Reset'
      });
      refreshAuditData();
      setTimeout(() => setActionFeedback(null), 2500);
    } catch (e) {
      setTimeout(() => setActionFeedback(null), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(20, 24, 38, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(168, 85, 247, 0.45)'
          }}>
            <ShieldAlert size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                Master System Audit & Root Fleet Command
              </h2>
              <span className="badge badge-primary" style={{ background: '#7e22ce', color: '#fff', fontSize: '0.72rem' }}>
                ROOT PRIVILEGES
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
              Central supervisory terminal managing IoT telemetry nodes, dual database engines, and cross-agency dispatch protocols.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={refreshAuditData}
            disabled={loading}
            className="btn btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Auditing...' : 'Sync Gateway'}
          </button>
          <button
            onClick={triggerSystemDrill}
            className="btn btn-warning"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Zap size={15} /> Trigger Trauma Drill
          </button>
          <button
            onClick={resolveAllIncidents}
            className="btn btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          >
            <CheckCircle2 size={15} /> Reset All Alerts
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div style={{
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid #a855f7',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#d8b4fe',
          fontSize: '0.86rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Activity size={18} /> {actionFeedback}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>FASTAPI GATEWAY</span>
            <Server size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{systemStats.apiStatus}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Port 5000 | WebSocket Active</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>PERSISTENCE ENGINE</span>
            <Database size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>PostgreSQL + PostGIS</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Neon AWS Pooler | SQLite Fallback Ready</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>REAL-TIME EVENT BUS</span>
            <Radio size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>Upstash Redis TLS</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Global Pub/Sub | Latency &lt; 25ms</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE EMERGENCIES</span>
            <AlertTriangle size={18} color={systemStats.activeIncidentsCount > 0 ? '#ef4444' : '#10b981'} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: systemStats.activeIncidentsCount > 0 ? '#ef4444' : '#10b981' }}>
            {systemStats.activeIncidentsCount > 0 ? `${systemStats.activeIncidentsCount} ACTIVE CODE RED` : '0 (STANDBY)'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>All 3 Tiers Staged</div>
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>EMERGENCY NETWORK</span>
            <Building2 size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {systemStats.hospitalsCount} ER / {systemStats.policeCount} PCR
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>K-NN Spatial Spatial Radius 20km</div>
        </div>
      </div>

      {/* Multi-Agency Fast Access Navigation */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
          Multi-Agency Operational Console Jump
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Super Admin root access enables instantaneous inspection and control over all frontline response terminals:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('hospital-terminal')}
            className="btn btn-ghost"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#ef4444' }}>
                <HeartPulse size={18} /> Trauma ER Console
              </div>
              <ArrowRight size={15} color="#ef4444" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              ICU bed reservation, blood transfusion bay staging, and incoming ambulance telemetry.
            </span>
          </button>

          <button
            onClick={() => setActiveTab('police-command')}
            className="btn btn-ghost"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#38bdf8' }}>
                <Shield size={18} /> Highway Police PCR
              </div>
              <ArrowRight size={15} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              PCR interceptor dispatch, traffic green corridor clearance, and electronic FIR generation.
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guardian-portal')}
            className="btn btn-ghost"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#10b981' }}>
                <Users size={18} /> Guardian Family Portal
              </div>
              <ArrowRight size={15} color="#10b981" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Family emergency broadcast roster, WhatsApp crash alerts, and live GPS trip tracking.
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn btn-ghost"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#f59e0b' }}>
                <Car size={18} /> Driver Cockpit &amp; HUD
              </div>
              <ArrowRight size={15} color="#f59e0b" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              100Hz MPU6050 accelerometer vectors, digital speedometer, and physical abort switch.
            </span>
          </button>
        </div>
      </div>

      {/* Two Column Section: Hardware Nodes & Active Incident Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* IoT Hardware Fleet Provisioning */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#a855f7" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                IoT Hardware Node Registry
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>4 NODES REGISTERED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deviceList.map(dev => (
              <div key={dev.deviceId} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.86rem' }}>{dev.deviceId}</strong>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{dev.vehiclePlate}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                    Firmware: {dev.firmware} | Heartbeat: {dev.lastPing}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: dev.status === 'ONLINE' ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dev.status === 'ONLINE' ? '#10b981' : '#f59e0b' }} />
                    {dev.status}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{dev.signal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Incident Dispatch Audit Log */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Global Emergency Dispatch Audit
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Full Archive &rarr;
            </button>
          </div>

          {incidentsList.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>Zero active emergency incidents in system buffer.</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>All trauma facilities, police divisions, and vehicles are standing by.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidentsList.map(inc => (
                <div key={inc.incident_ref} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>{inc.incident_ref}</strong>
                    <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{inc.severity || 'CRITICAL'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{inc.reason || 'Collision Detected'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                    Peak G: <strong>{inc.peak_g_force || '5.2g'}</strong> | Speed: <strong>{inc.speed_at_impact || '60 km/h'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
