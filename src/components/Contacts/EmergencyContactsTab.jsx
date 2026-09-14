import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  MessageSquare, 
  Plus, 
  ShieldCheck, 
  Star, 
  X, 
  CheckCircle2, 
  Zap,
  PhoneForwarded,
  Edit3,
  Trash2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function EmergencyContactsTab({ contacts, setContacts, telemetry, selectedVehicle }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [autoSms, setAutoSms] = useState(true);
  const [autoCall, setAutoCall] = useState(false);
  const [whatsappAlert, setWhatsappAlert] = useState(true);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenAddModal = () => {
    setName('');
    setRelation('');
    setPhone('');
    setIsPrimary(contacts.length === 0);
    setAutoSms(true);
    setAutoCall(false);
    setWhatsappAlert(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name || '');
    setRelation(contact.relation || '');
    setPhone(contact.phone || '');
    setIsPrimary(!!contact.isPrimary);
    setAutoSms(contact.autoSms !== false);
    setAutoCall(!!contact.autoCall);
    setWhatsappAlert(contact.whatsappAlert !== false);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingContact) {
      // Edit
      let updated = contacts.map(c => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name,
            relation: relation || 'Family Member',
            phone,
            isPrimary,
            autoSms,
            autoCall,
            whatsappAlert
          };
        }
        // If this contact was marked primary, demote others
        if (isPrimary && c.id !== editingContact.id) {
          return { ...c, isPrimary: false };
        }
        return c;
      });

      setContacts(updated);
      cloudDb.updateEmergencyContacts(updated);
      setEditingContact(null);
      showNotification(`Contact "${name}" updated successfully!`);
    } else {
      // Add
      const newContact = {
        id: `c-${Date.now()}`,
        name,
        relation: relation || 'Family Member',
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        isPrimary,
        autoSms,
        autoCall,
        whatsappAlert
      };

      let updated = [...contacts];
      if (isPrimary) {
        updated = updated.map(c => ({ ...c, isPrimary: false }));
        updated.unshift(newContact);
      } else {
        updated.push(newContact);
      }

      setContacts(updated);
      cloudDb.updateEmergencyContacts(updated);
      setShowAddModal(false);
      showNotification(`Emergency contact "${name}" added to roster!`);
    }
  };

  const handleDeleteContactConfirm = () => {
    if (!deletingContact) return;
    if (contacts.length <= 1) {
      alert('You must have at least one emergency contact registered for automated crash alerts.');
      setDeletingContact(null);
      return;
    }

    const updated = contacts.filter(c => c.id !== deletingContact.id);
    // If the deleted contact was primary, make the first remaining primary
    if (deletingContact.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    setContacts(updated);
    cloudDb.updateEmergencyContacts(updated);
    showNotification(`Contact "${deletingContact.name}" removed.`);
    setDeletingContact(null);
  };

  const handleSetPrimary = (contact) => {
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === contact.id
    }));
    setContacts(updated);
    cloudDb.updateEmergencyContacts(updated);
    showNotification(`"${contact.name}" is now designated as the Primary Guardian.`);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${telemetry.lat},${telemetry.lng}`;
  const getSmsMessage = (contact) => 
    `🚨 EMERGENCY ALERT for ${contact.name}! Crash detected on ${selectedVehicle?.name || 'Vehicle'} (${selectedVehicle?.registrationNumber || 'Car'}). Speed: ${telemetry.speedKmh.toFixed(1)} km/h. Location: ${mapsUrl}`;

  return (
    <div className="tab-content-container">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="#f59e0b" /> Emergency Contacts & Guardian Roster
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Automated SMS dispatch, priority voice call hotline, and WhatsApp crash telemetry packets
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
          <Plus size={16} /> Add Emergency Contact
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          padding: '12px 18px',
          borderRadius: '12px',
          color: '#34d399',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Contacts List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {contacts.map(c => (
          <div 
            key={c.id} 
            className="glass-card" 
            style={{ 
              padding: '24px', 
              border: c.isPrimary ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
              background: c.isPrimary ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)' : 'rgba(12, 12, 12, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: c.isPrimary ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.isPrimary ? '#ef4444' : '#f59e0b',
                  fontWeight: 700
                }}>
                  {c.isPrimary ? <Star size={20} /> : <Users size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>{c.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{c.relation}</span>
                </div>
              </div>
              {c.isPrimary ? (
                <span className="badge badge-danger">PRIMARY GUARDIAN</span>
              ) : (
                <button
                  onClick={() => handleSetPrimary(c)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                  title="Make Primary Guardian"
                >
                  Set Primary
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f59e0b', margin: '10px 0' }} className="mono">
              {c.phone}
            </div>

            {/* Notification Toggles Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span>📲 Auto SMS: <strong style={{ color: c.autoSms ? '#10b981' : '#64748b' }}>{c.autoSms ? 'ON' : 'OFF'}</strong></span>
              <span>📞 Auto Voice: <strong style={{ color: c.autoCall ? '#10b981' : '#64748b' }}>{c.autoCall ? 'ON' : 'OFF'}</strong></span>
              <span>💬 WhatsApp: <strong style={{ color: c.whatsappAlert ? '#10b981' : '#64748b' }}>{c.whatsappAlert ? 'ON' : 'OFF'}</strong></span>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href={`tel:${c.phone}`} className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.78rem' }}>
                <PhoneCall size={14} /> Call
              </a>
              <a 
                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getSmsMessage(c))}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderColor: '#25D366', color: '#25D366' }}
              >
                <MessageSquare size={14} /> WhatsApp
              </a>
              <button
                onClick={() => handleOpenEditModal(c)}
                className="btn btn-ghost"
                style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                title="Edit Contact Details"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => setDeletingContact(c)}
                className="btn btn-outline-danger"
                style={{ padding: '8px 10px', fontSize: '0.78rem' }}
                title="Remove Contact"
                disabled={contacts.length <= 1}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {(showAddModal || editingContact) && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(440px, 92vw)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                {editingContact ? `Edit Contact: ${editingContact.name}` : 'Add Emergency Contact'}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingContact(null); }} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Mercer"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Relationship</label>
                <input 
                  type="text" 
                  placeholder="e.g. Spouse / Brother / Father"
                  value={relation}
                  onChange={e => setRelation(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone Number (with country code) *</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98111 22233"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="primaryCheck"
                    checked={isPrimary}
                    onChange={e => setIsPrimary(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="primaryCheck" style={{ fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer' }}>Designate as Primary Emergency Guardian</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="smsCheck"
                    checked={autoSms}
                    onChange={e => setAutoSms(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="smsCheck" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>Send Instant SMS Crash Location Packet</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="waCheck"
                    checked={whatsappAlert}
                    onChange={e => setWhatsappAlert(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="waCheck" style={{ fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>Dispatch Automated WhatsApp Emergency Ping</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setEditingContact(null); }} 
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContact ? 'Save Changes' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Modal */}
      {deletingContact && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(400px, 90vw)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0 0 10px 0', fontWeight: 700 }}>
              Remove Emergency Contact?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Are you sure you want to remove <strong style={{ color: '#f8fafc' }}>{deletingContact.name}</strong> ({deletingContact.phone})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingContact(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleDeleteContactConfirm} className="btn btn-emergency">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
