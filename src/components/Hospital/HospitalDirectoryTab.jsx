import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Bell, 
  Users, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  X,
  Radio,
  Sparkles
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function HospitalDirectoryTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [searchTerm, setSearchTerm] = useState('');
  const [dutyFilter, setDutyFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [contactModal, setContactModal] = useState({ isOpen: false, mode: 'add', data: null });

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

  const directory = dbState.hospitalEmergencyDirectory || [];

  const filteredDirectory = directory.filter(c => {
    const matchesSearch = !searchTerm.trim() || (
      c.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extension?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.inCharge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesDuty = dutyFilter === 'all' || c.dutyStatus?.toLowerCase().includes(dutyFilter.toLowerCase());
    return matchesSearch && matchesDuty;
  });

  const active24x7Count = directory.filter(c => c.dutyStatus?.includes('24x7')).length;
  const totalExtensions = directory.length;

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
            background: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={28} color="#60a5fa" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                AIIMS APEX TRAUMA CENTER — EMERGENCY DIRECTORY
              </h1>
              <span style={{
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                INTERNAL EXTENSIONS & HOTLINES
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Departmental Emergency Extensions • Trauma Bays, Blood Bank, ICU Desks & Police Liaison • AIIMS Apex Trauma Centre, New Delhi
            </p>
          </div>
        </div>

        <button
          onClick={() => setContactModal({
            isOpen: true,
            mode: 'add',
            data: {
              department: '',
              role: 'Emergency Medical Unit',
              extension: `Ext. ${Math.floor(100 + Math.random() * 900)}`,
              directPhone: '+91 11 2659 0000',
              mobile: '+91 98765 00000',
              location: 'AIIMS Apex Trauma Building',
              inCharge: 'Duty Officer',
              dutyStatus: 'Active 24x7',
              badgeColor: '#3b82f6'
            }
          })}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}
        >
          <Plus size={16} />
          <span>Add Emergency Extension</span>
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
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TOTAL REGISTERED EXTENSIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totalExtensions}</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>24x7 EMERGENCY HOTLINES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{active24x7Count}</div>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>CENTRAL EPABX ROUTING</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>OPERATIONAL</div>
        </div>
      </div>

      {/* Search and Filters */}
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
            placeholder="Search department, extension, officer name, or room..."
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
            <span>Duty Status:</span>
          </div>
          <select
            value={dutyFilter}
            onChange={e => setDutyFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          >
            <option value="all">All Duty Rosters</option>
            <option value="24x7">Active 24x7</option>
            <option value="On Duty">On Duty</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '16px'
      }}>
        {filteredDirectory.map(c => {
          return (
            <div
              key={c.id}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                      {c.department}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}>
                      {c.role}
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {c.dutyStatus}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '14px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>PABX Extension:</span>
                    <strong style={{ color: '#f59e0b', fontSize: '0.9rem' }}>{c.extension}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Direct Hospital Phone:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{c.directPhone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Emergency Mobile:</span>
                    <span style={{ color: '#cbd5e1' }}>{c.mobile}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Department Lead:</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{c.inCharge}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Location / Room:</span>
                    <span style={{ color: '#94a3b8' }}>{c.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <a
                  href={`tel:${c.directPhone}`}
                  style={{
                    flex: '1 1 auto',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid #3b82f6',
                    color: '#60a5fa',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Phone size={12} />
                  <span>Call {c.extension}</span>
                </a>

                <button
                  onClick={() => {
                    showToast(`🚨 High-Priority Pager Alert Transmitted to ${c.department} (${c.inCharge})!`);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Bell size={12} />
                  <span>Page</span>
                </button>

                <button
                  onClick={() => setContactModal({ isOpen: true, mode: 'edit', data: { ...c } })}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete extension ${c.extension} (${c.department})?`)) {
                      cloudDb.deleteHospitalDirectoryContact(c.id);
                      showToast(`Extension ${c.extension} removed`, 'info');
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EMERGENCY EXTENSION                                     */}
      {/* ========================================================================= */}
      {contactModal.isOpen && (
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
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                {contactModal.mode === 'add' ? 'Register New Hospital Extension' : 'Edit Hospital Extension'}
              </h3>
              <button
                onClick={() => setContactModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Department / Unit Name</label>
                <input
                  type="text"
                  value={contactModal.data?.department || ''}
                  onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, department: e.target.value } }))}
                  placeholder="e.g. Trauma Operation Theatre Suite #03"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PABX Extension</label>
                  <input
                    type="text"
                    value={contactModal.data?.extension || ''}
                    onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, extension: e.target.value } }))}
                    placeholder="e.g. Ext. 120"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Direct Hospital Phone</label>
                  <input
                    type="text"
                    value={contactModal.data?.directPhone || ''}
                    onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, directPhone: e.target.value } }))}
                    placeholder="+91 11 2659 8120"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Emergency Mobile</label>
                  <input
                    type="text"
                    value={contactModal.data?.mobile || ''}
                    onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, mobile: e.target.value } }))}
                    placeholder="+91 98765 00120"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Duty Status</label>
                  <select
                    value={contactModal.data?.dutyStatus || 'Active 24x7'}
                    onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, dutyStatus: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  >
                    <option value="Active 24x7">Active 24x7</option>
                    <option value="On Duty">On Duty</option>
                    <option value="On Call">On Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Officer / Specialist In-Charge</label>
                <input
                  type="text"
                  value={contactModal.data?.inCharge || ''}
                  onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, inCharge: e.target.value } }))}
                  placeholder="e.g. Sister In-charge Anjali Sharma"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Location / Wing inside Trauma Center</label>
                <input
                  type="text"
                  value={contactModal.data?.location || ''}
                  onChange={e => setContactModal(prev => ({ ...prev, data: { ...prev.data, location: e.target.value } }))}
                  placeholder="e.g. 2nd Floor, Operation Theatre Wing"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setContactModal({ isOpen: false, mode: 'add', data: null })}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (contactModal.mode === 'add') {
                    cloudDb.addHospitalDirectoryContact(contactModal.data);
                    showToast('Emergency department extension added!');
                  } else {
                    cloudDb.updateHospitalDirectoryContact(contactModal.data.id, contactModal.data);
                    showToast('Emergency department extension updated!');
                  }
                  setContactModal({ isOpen: false, mode: 'add', data: null });
                }}
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

