import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Car, 
  Phone, 
  Calendar, 
  Download, 
  Printer, 
  AlertTriangle,
  X,
  Scale
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function PoliceFirRecordsTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [firModal, setFirModal] = useState({ isOpen: false, mode: 'add', data: null });
  const [certModal, setCertModal] = useState({ isOpen: false, fir: null });

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

  const firRecords = dbState.policeFirRecords || [];

  const filteredFirs = firRecords.filter(f => {
    const matchesSearch = !searchTerm.trim() || (
      f.firNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.accusedDriver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.incidentLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.legalSections?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.investigatingOfficer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFirs = firRecords.length;
  const activeInvestigations = firRecords.filter(f => f.status === 'Investigation Underway').length;
  const chargesheetsFiled = firRecords.filter(f => f.status === 'Chargesheet Filed').length;

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
          background: toast.type === 'warning' ? '#d97706' : '#0284c7',
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
        background: 'linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
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
            background: 'rgba(56, 189, 248, 0.2)',
            border: '2px solid #38bdf8',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={28} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                DELHI POLICE HIGHWAY COMMAND — ACCIDENT e-FIR ARCHIVE
              </h1>
              <span style={{
                background: '#0284c7',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                LEGAL FORENSICS
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Statutory First Information Reports • BNS / IPC Crash Inquests • Automated Sensor Evidence Registry
            </p>
          </div>
        </div>

        <button
          onClick={() => setFirModal({
            isOpen: true,
            mode: 'add',
            data: {
              firNumber: `FIR No. ${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
              policeStation: 'Sector 04 PCR Highway Command, NH-48',
              district: 'South-West District, Delhi Police',
              incidentLocation: 'NH-48 Expressway KM 34.2',
              complainantName: 'State (Suo Motu via ASAAS IoT Crash Sensor)',
              accusedDriver: 'Alex Mercer (Hyundai Creta DL-01-AB-4321)',
              investigatingOfficer: 'Inspector Vikram Malhotra (IO #4421)',
              ioPhone: '+91 98111 77007',
              legalSections: 'Sec 279 IPC / BNS 281 (Rash Driving), Sec 337 IPC / BNS 125(a)',
              peakGForce: '5.84g',
              speedAtImpact: '74 km/h',
              status: 'Investigation Underway',
              evidenceSummary: 'MPU6050 recorded 5.84g deceleration. Pre-crash GPS speed 74 km/h. Driver admitted to AIIMS Trauma Bay #04.',
              impoundedVehicle: 'Hyundai Creta SX (O) Turbo [DL-01-AB-4321]',
              alcoholTestResult: 'Negative (0.00% BAC)',
              hospitalReference: 'MLC/2026/08/9912 (AIIMS Apex Trauma)'
            }
          })}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Plus size={16} />
          <span>Register New Accident e-FIR</span>
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
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL ACCIDENT e-FIRs LODGED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalFirs}</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>ACTIVE HIGHWAY INVESTIGATIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{activeInvestigations}</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>CHARGESHEETS / COMPLETED CASES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{chargesheetsFiled}</div>
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
            placeholder="Search FIR number, accused driver, location, sections, or IO..."
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
            <span>Case Status:</span>
          </div>
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
            <option value="all">All FIR Statuses</option>
            <option value="Investigation Underway">Investigation Underway</option>
            <option value="Chargesheet Filed">Chargesheet Filed</option>
            <option value="Disposed / Closed">Disposed / Closed</option>
          </select>
        </div>
      </div>

      {/* FIR Records Roster */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFirs.map(fir => {
          const isUnderway = fir.status === 'Investigation Underway';
          const statusColor = isUnderway ? '#f59e0b' : '#10b981';

          return (
            <div
              key={fir.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '14px',
                padding: '20px'
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
                    background: statusColor,
                    color: isUnderway ? '#000' : '#fff',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {fir.status.toUpperCase()}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                      {fir.firNumber}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Station: {fir.policeStation} • {fir.district}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    Date: {fir.date}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Hospital MLC Ref: {fir.hospitalReference}
                  </div>
                </div>
              </div>

              {/* Grid: Legal Sections + Forensic Evidence */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px',
                marginBottom: '14px'
              }}>
                {/* Legal Breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    LEGAL CHARGES & PENAL SECTIONS
                  </div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.86rem' }}>{fir.legalSections}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
                    Accused: <strong>{fir.accusedDriver}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Complainant: {fir.complainantName}
                  </div>
                </div>

                {/* Crash Forensics */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    IOT CRASH TELEMETRY EVIDENCE
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem' }}>
                    <span>Peak Deceleration: <strong style={{ color: '#ef4444' }}>{fir.peakGForce}</strong></span>
                    <span>Speed: <strong style={{ color: '#f59e0b' }}>{fir.speedAtImpact}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
                    Impounded: <strong>{fir.impoundedVehicle}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '2px' }}>
                    Sobriety/Alcohol: {fir.alcoholTestResult}
                  </div>
                </div>

                {/* Investigating Officer */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                    INVESTIGATING OFFICER (IO)
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.86rem' }}>{fir.investigatingOfficer}</div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px' }}>
                    Phone: {fir.ioPhone}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Location: {fir.incidentLocation}
                  </div>
                </div>
              </div>

              {/* Evidence Summary */}
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px', fontStyle: 'italic' }}>
                Summary: "{fir.evidenceSummary}"
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <button
                  onClick={() => setCertModal({ isOpen: true, fir })}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #38bdf8',
                    color: '#7dd3fc',
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
                  <span>Generate Official e-FIR Pass</span>
                </button>

                <button
                  onClick={() => setFirModal({ isOpen: true, mode: 'edit', data: { ...fir } })}
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
                  <span>Edit FIR</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete FIR ${fir.firNumber}?`)) {
                      cloudDb.deletePoliceFirRecord(fir.id);
                      showToast(`FIR ${fir.firNumber} removed from police archive`, 'info');
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
      {/* MODAL: ADD / EDIT e-FIR RECORD                                             */}
      {/* ========================================================================= */}
      {firModal.isOpen && (
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
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {firModal.mode === 'add' ? 'Lodge New Digital e-FIR' : 'Edit Police e-FIR Record'}
              </h3>
              <button
                onClick={() => setFirModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FIR Reference Number</label>
                  <input
                    type="text"
                    value={firModal.data?.firNumber || ''}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, firNumber: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</label>
                  <select
                    value={firModal.data?.status || 'Investigation Underway'}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="Investigation Underway">Investigation Underway</option>
                    <option value="Chargesheet Filed">Chargesheet Filed</option>
                    <option value="Disposed / Closed">Disposed / Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Accused Driver Name & Vehicle</label>
                <input
                  type="text"
                  value={firModal.data?.accusedDriver || ''}
                  onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, accusedDriver: e.target.value } }))}
                  placeholder="e.g. Alex Mercer (Hyundai Creta DL-01-AB-4321)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Legal Sections Applied</label>
                <input
                  type="text"
                  value={firModal.data?.legalSections || ''}
                  onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, legalSections: e.target.value } }))}
                  placeholder="Sec 279 IPC / BNS 281 (Rash Driving), Sec 337 IPC"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Peak Deceleration</label>
                  <input
                    type="text"
                    value={firModal.data?.peakGForce || '5.84g'}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, peakGForce: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pre-Impact Speed</label>
                  <input
                    type="text"
                    value={firModal.data?.speedAtImpact || '74 km/h'}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, speedAtImpact: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Investigating Officer (IO)</label>
                  <input
                    type="text"
                    value={firModal.data?.investigatingOfficer || ''}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, investigatingOfficer: e.target.value } }))}
                    placeholder="Inspector Vikram Malhotra"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IO Contact Number</label>
                  <input
                    type="text"
                    value={firModal.data?.ioPhone || ''}
                    onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, ioPhone: e.target.value } }))}
                    placeholder="+91 98111 77007"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Forensic Evidence Summary</label>
                <textarea
                  rows="2"
                  value={firModal.data?.evidenceSummary || ''}
                  onChange={e => setFirModal(prev => ({ ...prev, data: { ...prev.data, evidenceSummary: e.target.value } }))}
                  placeholder="Details of MPU6050 deceleration readings, GPS track, lane blockages..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setFirModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (firModal.mode === 'add') {
                    cloudDb.addPoliceFirRecord(firModal.data);
                    showToast('e-FIR registered in police system!');
                  } else {
                    cloudDb.updatePoliceFirRecord(firModal.data.id, firModal.data);
                    showToast('e-FIR details updated!');
                  }
                  setFirModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save FIR Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL POLICE e-FIR PRINTABLE PASS                               */}
      {/* ========================================================================= */}
      {certModal.isOpen && certModal.fir && (
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
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: '#475569' }}>
                DELHI POLICE • HIGHWAY TRAFFIC & CRIME CRASH INVESTIGATION UNIT
              </div>
              <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                FIRST INFORMATION REPORT (e-FIR)
              </h2>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', letterSpacing: '0.05em' }}>
                {certModal.fir.firNumber} • UNDER SECTION 154 Cr.P.C. / BNSS
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                LODGED VIA ASAAS HIGHWAY AUTOMATED TELEMETRY FORENSICS NETWORK
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.88rem', fontFamily: 'sans-serif' }}>
              <div>
                <strong>Police Station:</strong> {certModal.fir.policeStation}
              </div>
              <div>
                <strong>Date & Time:</strong> {certModal.fir.date}
              </div>
              <div>
                <strong>Incident Location:</strong> {certModal.fir.incidentLocation}
              </div>
              <div>
                <strong>Legal Sections:</strong> {certModal.fir.legalSections}
              </div>
              <div>
                <strong>Accused Driver:</strong> {certModal.fir.accusedDriver}
              </div>
              <div>
                <strong>Investigating Officer:</strong> {certModal.fir.investigatingOfficer}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontFamily: 'sans-serif', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                CRASH SENSOR & PHYSICAL IMPACT EVIDENCE:
              </div>
              <div>MPU6050 Peak Deceleration: <strong>{certModal.fir.peakGForce}</strong> • Speed at Impact: <strong>{certModal.fir.speedAtImpact}</strong></div>
              <div>Impounded Vehicle: <strong>{certModal.fir.impoundedVehicle}</strong></div>
              <div>Hospital Medico-Legal Link: <strong>{certModal.fir.hospitalReference}</strong></div>
              <div>Evidence Summary: <em>{certModal.fir.evidenceSummary}</em></div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginBottom: '20px', fontFamily: 'sans-serif' }}>
              "Certified that the above information is recorded in the automated digital crime and criminal tracking network system (CCTNS). Signed by IO under Section 154."
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #94a3b8', paddingTop: '12px', fontFamily: 'sans-serif' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Inspector Vikram Malhotra</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Station House Officer • Highway Patrol Command</div>
              </div>
              <button
                onClick={() => setCertModal({ isOpen: false, fir: null })}
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
                Close e-FIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

