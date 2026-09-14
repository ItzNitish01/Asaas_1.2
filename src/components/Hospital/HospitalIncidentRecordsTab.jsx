import React, { useState, useEffect } from 'react';
import { 
  History, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  User, 
  Phone, 
  Building2, 
  AlertTriangle,
  X,
  Printer,
  Sparkles
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function HospitalIncidentRecordsTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [recordModal, setRecordModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [mlcCertModal, setMlcCertModal] = useState({ isOpen: false, record: null });

  useEffect(() => {
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const records = dbState.hospitalIncidentRecords || [];

  const filteredRecords = records.filter(r => {
    const matchesSearch = !searchTerm.trim() || (
      r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mlcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.collisionType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || r.admissionStatus?.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalRecords = records.length;
  const criticalCount = records.filter(r => r.severity === 'CRITICAL').length;
  const surgeryCompleted = records.filter(r => r.surgicalStatus?.toLowerCase().includes('completed')).length;

  return (
    <div style={{
      padding: '20px',
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
          background: toast.type === 'warning' ? '#d97706' : '#059669',
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

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <History size={28} color="#818cf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                AIIMS APEX TRAUMA CENTER — INCIDENT & MLC REGISTRY
              </h1>
              <span style={{
                background: '#4f46e5',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                MEDICO-LEGAL ARCHIVE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Emergency Trauma Admissions • Police Forensics & Medico-Legal Cases (MLC) • AIIMS Apex Trauma Centre, New Delhi
            </p>
          </div>
        </div>

        <button
          onClick={() => setRecordModal({
            isOpen: true,
            mode: 'add',
            data: {
              patientName: '',
              age: 30,
              gender: 'Male',
              bloodGroup: 'O+',
              severity: 'CRITICAL',
              triageCategory: 'RED (Immediate)',
              peakGForce: '5.20g',
              speedAtImpact: '68 km/h',
              collisionType: 'High-Impact Vehicle Collision',
              assignedBay: 'Trauma Bay #04',
              attendingSurgeon: 'Dr. Rohan Sharma (Chief Surgeon)',
              ambulanceUnit: 'ALS 108 Mobile ICU #12',
              bloodUnitsUsed: '2 Units O+ Packed Cells',
              policeStationIntimation: 'Sector 37 Police Station Intimated',
              surgicalStatus: 'Emergency Surgery Scheduled',
              admissionStatus: 'Admitted to Trauma Resuscitation',
              notes: 'Recorded via ASAAS automated crash telemetry and hospital intake.'
            }
          })}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
          }}
        >
          <Plus size={16} />
          <span>Log New MLC Trauma Admission</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL HOSPITAL TRAUMA ADMISSIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalRecords}</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171' }}>CODE RED EMERGENCY SURGERIES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{criticalCount}</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>DEFINITIVE SURGERIES COMPLETED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{surgeryCompleted}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search patient, MLC #, incident ID, or collision mechanism..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
            <Filter size={15} />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical (Code Red)</option>
            <option value="MODERATE">Moderate (Yellow)</option>
            <option value="MINOR">Minor (Green)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          >
            <option value="all">All Care Statuses</option>
            <option value="Admitted">Admitted in Hospital</option>
            <option value="ICU">In Surgical ICU</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Incident Records Roster */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRecords.map(rec => {
          const isCrit = rec.severity === 'CRITICAL';
          const sevColor = isCrit ? '#ef4444' : rec.severity === 'MODERATE' ? '#f59e0b' : '#10b981';

          return (
            <div
              key={rec.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${isCrit ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '14px',
                padding: '20px',
                boxShadow: isCrit ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '14px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: sevColor,
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {rec.triageCategory || rec.severity}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      {rec.patientName}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Age: {rec.age} yrs • {rec.gender} • Blood: <strong style={{ color: '#ef4444' }}>{rec.bloodGroup}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700 }}>
                    {rec.mlcNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Record ID: {rec.id} • Admitted: {rec.date}
                  </div>
                </div>
              </div>

              {/* Grid: Crash Telemetry + Hospital Clinical Intake */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px',
                marginBottom: '14px'
              }}>
                {/* Forensic Mechanism */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    COLLISION FORENSICS (IOT SENSOR TELEMETRY)
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.86rem' }}>{rec.collisionType}</div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.78rem' }}>
                    <span>Deceleration: <strong style={{ color: '#ef4444' }}>{rec.peakGForce}</strong></span>
                    <span>Speed: <strong style={{ color: '#f59e0b' }}>{rec.speedAtImpact}</strong></span>
                  </div>
                </div>

                {/* Treatment & Bay */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    SURGICAL TEAM & ALLOCATED RESUSCITATION BAY
                  </div>
                  <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.86rem' }}>{rec.assignedBay}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                    Surgeon: <strong>{rec.attendingSurgeon}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Fleet: {rec.ambulanceUnit} • Blood: {rec.bloodUnitsUsed}
                  </div>
                </div>

                {/* Police Liaison & MLC */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    POLICE INTIMATION & CARE STATUS
                  </div>
                  <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.86rem' }}>{rec.surgicalStatus}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                    Station: <strong>{rec.policeStationIntimation}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Current Ward: {rec.admissionStatus}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {rec.notes && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px', fontStyle: 'italic' }}>
                  Clinical Note: "{rec.notes}"
                </div>
              )}

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <button
                  onClick={() => setMlcCertModal({ isOpen: true, record: rec })}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid #6366f1',
                    color: '#a5b4fc',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  <span>Generate Official MLC Certificate</span>
                </button>

                <button
                  onClick={() => setRecordModal({ isOpen: true, mode: 'edit', data: { ...rec } })}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit Record</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete MLC record ${rec.mlcNumber}?`)) {
                      cloudDb.deleteHospitalIncidentRecord(rec.id);
                      showToast(`MLC record ${rec.mlcNumber} removed`, 'info');
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '6px 10px',
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

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT HOSPITAL INCIDENT RECORD                                 */}
      {/* ========================================================================= */}
      {recordModal.isOpen && (
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
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {recordModal.mode === 'add' ? 'Log New Hospital Medico-Legal Record' : 'Edit MLC Incident Record'}
              </h3>
              <button
                onClick={() => setRecordModal({ isOpen: false, mode: 'add', data: null })}
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
                  value={recordModal.data?.patientName || ''}
                  onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, patientName: e.target.value } }))}
                  placeholder="e.g. Alex Mercer"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Age</label>
                  <input
                    type="number"
                    value={recordModal.data?.age || 30}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, age: parseInt(e.target.value) || 30 } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gender</label>
                  <select
                    value={recordModal.data?.gender || 'Male'}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, gender: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Blood Group</label>
                  <select
                    value={recordModal.data?.bloodGroup || 'O+'}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, bloodGroup: e.target.value } }))}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Severity</label>
                  <select
                    value={recordModal.data?.severity || 'CRITICAL'}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, severity: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="CRITICAL">Critical (Code Red)</option>
                    <option value="MODERATE">Moderate (Yellow)</option>
                    <option value="MINOR">Minor (Green)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MLC Number</label>
                  <input
                    type="text"
                    value={recordModal.data?.mlcNumber || ''}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, mlcNumber: e.target.value } }))}
                    placeholder="MLC/2026/08/9912"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Collision Forensic Mechanism</label>
                <input
                  type="text"
                  value={recordModal.data?.collisionType || ''}
                  onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, collisionType: e.target.value } }))}
                  placeholder="e.g. Frontal Off-Center Collision (NH-48 KM 34.2)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Peak Deceleration</label>
                  <input
                    type="text"
                    value={recordModal.data?.peakGForce || '5.84g'}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, peakGForce: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Speed at Impact</label>
                  <input
                    type="text"
                    value={recordModal.data?.speedAtImpact || '74 km/h'}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, speedAtImpact: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assigned Resuscitation Bay</label>
                  <input
                    type="text"
                    value={recordModal.data?.assignedBay || ''}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, assignedBay: e.target.value } }))}
                    placeholder="Trauma Bay #04"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attending Surgeon</label>
                  <input
                    type="text"
                    value={recordModal.data?.attendingSurgeon || ''}
                    onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, attendingSurgeon: e.target.value } }))}
                    placeholder="Dr. Rohan Sharma"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Surgical & Care Status</label>
                <input
                  type="text"
                  value={recordModal.data?.surgicalStatus || ''}
                  onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, surgicalStatus: e.target.value } }))}
                  placeholder="e.g. Laparotomy & Splenic Hemostasis Completed"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clinical & Medico-Legal Notes</label>
                <textarea
                  rows="2"
                  value={recordModal.data?.notes || ''}
                  onChange={e => setRecordModal(prev => ({ ...prev, data: { ...prev.data, notes: e.target.value } }))}
                  placeholder="Details of resuscitation, Golden Hour arrival, police post intimation..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setRecordModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (recordModal.mode === 'add') {
                    cloudDb.addHospitalIncidentRecord(recordModal.data);
                    showToast('Hospital MLC record registered successfully!');
                  } else {
                    cloudDb.updateHospitalIncidentRecord(recordModal.data.id, recordModal.data);
                    showToast('Hospital MLC record updated successfully!');
                  }
                  setRecordModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL MLC CERTIFICATE PASS                                      */}
      {/* ========================================================================= */}
      {mlcCertModal.isOpen && mlcCertModal.record && (
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
            background: '#fff',
            color: '#0f172a',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '640px',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            fontFamily: 'serif'
          }}>
            {/* Header with National Emblems representation */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: '#475569' }}>
                GOVERNMENT OF NCT OF DELHI • MINISTRY OF HEALTH & FAMILY WELFARE
              </div>
              <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                AIIMS APEX TRAUMA CENTRE, NEW DELHI
              </h2>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', letterSpacing: '0.05em' }}>
                OFFICIAL MEDICO-LEGAL CASE (MLC) ADMISSION RECORD
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Generated via Automated Sensor Crash Alert System (ASAAS Forensic Network)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.88rem', fontFamily: 'sans-serif' }}>
              <div>
                <strong>MLC Reference No:</strong> {mlcCertModal.record.mlcNumber}
              </div>
              <div>
                <strong>Date & Time of ER Arrival:</strong> {mlcCertModal.record.date}
              </div>
              <div>
                <strong>Patient Name:</strong> {mlcCertModal.record.patientName}
              </div>
              <div>
                <strong>Age / Gender / Blood:</strong> {mlcCertModal.record.age} yrs / {mlcCertModal.record.gender} / {mlcCertModal.record.bloodGroup}
              </div>
              <div>
                <strong>Assigned Trauma Bay:</strong> {mlcCertModal.record.assignedBay}
              </div>
              <div>
                <strong>Attending Surgeon:</strong> {mlcCertModal.record.attendingSurgeon}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontFamily: 'sans-serif', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                IOT SENSOR TELEMETRY & INJURY FORENSICS:
              </div>
              <div>Collision Type: <strong>{mlcCertModal.record.collisionType}</strong></div>
              <div>Peak Impact Deceleration: <strong>{mlcCertModal.record.peakGForce}</strong> • Pre-Impact Speed: <strong>{mlcCertModal.record.speedAtImpact}</strong></div>
              <div>Surgical Procedure: <strong>{mlcCertModal.record.surgicalStatus}</strong></div>
              <div>Police Liaison Intimation: <strong>{mlcCertModal.record.policeStationIntimation}</strong></div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginBottom: '20px', fontFamily: 'sans-serif' }}>
              "This electronic certificate verifies patient admission and medical emergency care following highway vehicular collision. Telemetry and MPU6050 accelerometer readings are authenticated for judicial/insurance purposes."
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #94a3b8', paddingTop: '12px', fontFamily: 'sans-serif' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Dr. Rohan Sharma</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chief Attending Trauma Surgeon • AIIMS</div>
              </div>
              <button
                onClick={() => setMlcCertModal({ isOpen: false, record: null })}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

