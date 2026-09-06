import React, { useState } from 'react';
import { 
  UserCheck, 
  Lock, 
  Mail, 
  X, 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  KeyRound,
  UserPlus,
  LogIn,
  Car,
  Bike,
  CheckCircle2,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, setCurrentUser, onLogout }) {
  const [activeMode, setActiveMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [email, setEmail] = useState(currentUser?.email || 'alex.mercer@asaas.io');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'Vehicle Owner');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Vehicle Owner');
  const [regVehicleType, setRegVehicleType] = useState('four-wheeler');
  const [regPlate, setRegPlate] = useState('');
  
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  if (!isOpen) return null;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'Vehicle Owner') {
      setEmail('alex.mercer@asaas.io');
    } else if (role === 'Paramedic ER') {
      setEmail('dr.rohan@trauma108.gov.in');
    } else if (role === 'Guardian') {
      setEmail('guardian.alert@gmail.com');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const displayName = selectedRole === 'Paramedic ER' 
      ? 'Dr. Rohan Sharma (Paramedic 108)' 
      : selectedRole === 'Guardian' 
        ? 'Sarah Mercer (Guardian)' 
        : (currentUser?.name || 'Alex Mercer');

    setCurrentUser({
      name: displayName,
      email: email,
      role: selectedRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    });
    setFeedbackMsg(`Logged in successfully as ${selectedRole}`);
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 400);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    setCurrentUser({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      vehicleType: regVehicleType,
      plateNumber: regPlate.trim() || 'NEW-REG-01',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    });

    setFeedbackMsg(`Account created for ${regName.trim()} (${regRole})!`);
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: '100%', 
          maxWidth: '460px', 
          padding: 'clamp(18px, 4vw, 28px)', 
          borderRadius: '24px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)'
            }}>
              <ShieldAlert size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0, fontWeight: 800 }}>
                ASAAS OS Authentication
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Secure Access for Drivers, ER & Guardians
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '8px' }}
            aria-label="Close"
          >
            <X size={20} color="#94a3b8" />
          </button>
        </div>

        {/* Feedback Alert if any */}
        {feedbackMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#34d399',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} /> {feedbackMsg}
          </div>
        )}

        {/* Dual Mode Switcher Tab (Sign In vs Register) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            type="button"
            onClick={() => setActiveMode('login')}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeMode === 'login' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: activeMode === 'login' ? '#000' : '#cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('register')}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeMode === 'register' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: activeMode === 'register' ? '#000' : '#cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={15} /> Register New User
          </button>
        </div>

        {/* MODE 1: SIGN IN */}
        {activeMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Role Selection Tabs */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.04em' }}>
                SELECT ACCESS ROLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'Vehicle Owner', icon: ShieldCheck },
                  { id: 'Paramedic ER', icon: Stethoscope },
                  { id: 'Guardian', icon: Users }
                ].map(r => {
                  const Icon = r.icon;
                  const active = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: active ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#f59e0b' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} /> {r.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#05070d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#05070d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
              Login to ASAAS IoT OS
            </button>

            {/* Switch to Register link */}
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Need a new user account?{' '}
                <button 
                  type="button"
                  onClick={() => setActiveMode('register')} 
                  style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem', textDecoration: 'underline' }}
                >
                  Register here
                </button>
              </span>
            </div>

            {/* Optional Logout Button if already logged in */}
            {onLogout && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { onLogout(); onClose(); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={13} /> Sign Out of Current Session
                </button>
              </div>
            )}
          </form>
        )}

        {/* MODE 2: REGISTER NEW USER */}
        {activeMode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Full Name *</label>
              <input 
                type="text"
                placeholder="e.g. Nitish Kumar"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#05070d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                required
              />
            </div>

            {/* Access Role Selector */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.04em' }}>
                SELECT USER ROLE *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'Vehicle Owner', icon: ShieldCheck },
                  { id: 'Paramedic ER', icon: Stethoscope },
                  { id: 'Guardian', icon: Users }
                ].map(r => {
                  const Icon = r.icon;
                  const active = regRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegRole(r.id)}
                      style={{
                        padding: '9px 4px',
                        borderRadius: '10px',
                        border: active ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#f59e0b' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} /> {r.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="email" 
                  placeholder="e.g. nitish@gmail.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#05070d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Create Password *</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="password" 
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#05070d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Vehicle Category */}
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Primary Vehicle Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRegVehicleType('four-wheeler')}
                  className={`btn ${regVehicleType === 'four-wheeler' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '8px' }}
                >
                  <Car size={14} /> Four-Wheeler
                </button>
                <button
                  type="button"
                  onClick={() => setRegVehicleType('two-wheeler')}
                  className={`btn ${regVehicleType === 'two-wheeler' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '8px' }}
                >
                  <Bike size={14} /> Two-Wheeler
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
              <UserPlus size={16} /> Register & Activate Profile
            </button>

            {/* Switch to Login link */}
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Already registered?{' '}
                <button 
                  type="button"
                  onClick={() => setActiveMode('login')} 
                  style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem', textDecoration: 'underline' }}
                >
                  Sign In instead
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
