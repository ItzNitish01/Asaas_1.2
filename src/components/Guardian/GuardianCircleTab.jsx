import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Send, 
  Heart, 
  Shield, 
  Search, 
  CheckCircle2, 
  X,
  PhoneCall,
  Radio
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function GuardianCircleTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPriority, setFormPriority] = useState('Primary ICE (Tier-1)');
  const [formNotifySms, setFormNotifySms] = useState(true);
  const [formNotifyCall, setFormNotifyCall] = useState(true);

  useEffect(() => {
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const circleContacts = dbState.guardianCircle || [];

  const filteredContacts = circleContacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.relation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormRelation('');
    setFormPhone('');
    setFormAltPhone('');
    setFormEmail('');
    setFormPriority('Primary ICE (Tier-1)');
    setFormNotifySms(true);
    setFormNotifyCall(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setFormName(contact.name || '');
    setFormRelation(contact.relation || '');
    setFormPhone(contact.phone || '');
    setFormAltPhone(contact.alternatePhone || '');
    setFormEmail(contact.email || '');
    setFormPriority(contact.priority || 'Secondary Contact');
    setFormNotifySms(contact.notifySms !== false);
    setFormNotifyCall(contact.notifyCall || false);
    setIsAddModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (editingContact) {
      cloudDb.updateGuardianCircleContact(editingContact.id, {
        name: formName,
        relation: formRelation,
        phone: formPhone,
        alternatePhone: formAltPhone,
        email: formEmail,
        priority: formPriority,
        notifySms: formNotifySms,
        notifyCall: formNotifyCall
      });
    } else {
      cloudDb.addGuardianCircleContact({
        name: formName,
        relation: formRelation,
        phone: formPhone,
        alternatePhone: formAltPhone,
        email: formEmail,
        priority: formPriority,
        notifySms: formNotifySms,
        notifyCall: formNotifyCall,
        avatar: formRelation.toLowerCase().includes('doctor') ? '🩺' : '👥'
      });
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteContact = (id) => {
    if (window.confirm('Are you sure you want to remove this contact from your Family Emergency Circle?')) {
      cloudDb.deleteGuardianCircleContact(id);
    }
  };

  const handleBroadcastFamilyPing = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="terminal-container" style={{
      padding: '20px',
      maxWidth: '1240px',
      margin: '0 auto',
      color: '#f1f5f9',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #3b0764 0%, #1e1b4b 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '22px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.2)',
            border: '2px solid #c084fc',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                FAMILY EMERGENCY CIRCLE & ICE DIRECTORY
              </h1>
              <span style={{
                background: '#7e22ce',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                PRIMARY ICE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              Trusted family guardians, emergency doctors, and dedicated 24x7 highway rescue hotlines with 1-click dispatch
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleBroadcastFamilyPing}
            style={{
              background: broadcastSent ? 'rgba(16, 185, 129, 0.25)' : 'rgba(168, 85, 247, 0.15)',
              border: broadcastSent ? '1px solid #10b981' : '1px solid rgba(168, 85, 247, 0.4)',
              color: broadcastSent ? '#6ee7b7' : '#d8b4fe',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {broadcastSent ? <CheckCircle2 size={16} /> : <Send size={16} />}
            <span>{broadcastSent ? 'Safety Ping Sent!' : 'Broadcast Safety Ping'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
            }}
          >
            <UserPlus size={16} /> Add Emergency Contact
          </button>
        </div>
      </div>

      {/* Broadcast Banner Toast */}
      {broadcastSent && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#6ee7b7',
          fontSize: '0.86rem'
        }}>
          <CheckCircle2 size={18} />
          <span>Simulated encrypted SMS & App push dispatched to all {circleContacts.length} trusted emergency contacts with live GPS coordinates (28.4595° N, 77.0266° E).</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by contact name, relation, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '0.86rem',
            outline: 'none',
            width: '100%'
          }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Contact Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px'
      }}>
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: contact.priority?.includes('Primary') ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}>
                    {contact.avatar || '👥'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>{contact.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '2px', fontWeight: 600 }}>{contact.relation}</div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: contact.priority?.includes('Primary') ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: contact.priority?.includes('Primary') ? '#e9d5ff' : '#94a3b8',
                  border: contact.priority?.includes('Primary') ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {contact.priority}
                </span>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                  <Phone size={14} color="#10b981" />
                  <strong>{contact.phone}</strong>
                  {contact.alternatePhone && <span style={{ color: '#64748b' }}>({contact.alternatePhone})</span>}
                </div>
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.76rem' }}>
                    <Mail size={13} color="#38bdf8" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>

              {/* Notification Badges */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: contact.notifySms ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: contact.notifySms ? '#6ee7b7' : '#64748b',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {contact.notifySms ? '✓ SMS Alerts' : '✕ No SMS'}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: contact.notifyCall ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: contact.notifyCall ? '#7dd3fc' : '#64748b',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {contact.notifyCall ? '✓ Auto-Call' : '✕ No Call'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <a
                href={`tel:${contact.phone}`}
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid #10b981',
                  color: '#6ee7b7',
                  textDecoration: 'none',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PhoneCall size={14} /> Call Now
              </a>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleOpenEdit(contact)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
                  title="Edit Contact"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
                  title="Delete Contact"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveContact} style={{
            background: '#0b1329',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                {editingContact ? 'Edit Emergency Contact' : 'Add Family Emergency Contact'}
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mercer"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Relationship / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother / Primary Guardian"
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Primary Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98111..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Alt Phone</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formAltPhone}
                    onChange={(e) => setFormAltPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Priority Tier</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                >
                  <option value="Primary ICE (Tier-1)" style={{ background: '#0f172a' }}>Primary ICE (Tier-1 - Immediate Contact)</option>
                  <option value="Secondary Contact (Tier-2)" style={{ background: '#0f172a' }}>Secondary Contact (Tier-2 - Backup)</option>
                  <option value="Medical Advisor" style={{ background: '#0f172a' }}>Medical Advisor / Physician</option>
                  <option value="Law Enforcement" style={{ background: '#0f172a' }}>Law Enforcement</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formNotifySms}
                    onChange={(e) => setFormNotifySms(e.target.checked)}
                  />
                  <span>Send Instant SMS Alert</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formNotifyCall}
                    onChange={(e) => setFormNotifyCall(e.target.checked)}
                  />
                  <span>Trigger Automated Call</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '9px 16px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {editingContact ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

