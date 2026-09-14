import React, { useState } from 'react';
import { 
  Share2, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Copy, 
  Check, 
  Globe, 
  Radio, 
  X, 
  ExternalLink,
  Shield,
  Heart,
  Car
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function MultiDeviceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentRoom = cloudDb.roomId;
  const [roomInput, setRoomInput] = useState(currentRoom);
  const [copiedKey, setCopiedKey] = useState(null);

  const getBaseUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  const deviceLinks = [
    {
      key: 'vehicle',
      title: 'Device 1: Vehicle Cockpit (Driver)',
      deviceType: 'Smartphone (Driver in Car)',
      icon: Car,
      color: '#f59e0b',
      url: `${getBaseUrl()}?view=vehicle&room=${currentRoom}`,
      desc: 'Simulate driving, MPU6050 accelerometer, 5.99g crash & SOS button'
    },
    {
      key: 'hospital',
      title: 'Device 2: Hospital Emergency Trauma Desk',
      deviceType: 'Tablet / ER Terminal',
      icon: Heart,
      color: '#ef4444',
      url: `${getBaseUrl()}?view=hospital&room=${currentRoom}`,
      desc: 'Real-time Code Red alarm, Golden Hour timer, Patient blood group & ALS 108 dispatch'
    },
    {
      key: 'police',
      title: 'Device 3: Police PCR Highway Patrol Command',
      deviceType: 'Laptop / PCR Control Station',
      icon: Shield,
      color: '#38bdf8',
      url: `${getBaseUrl()}?view=police&room=${currentRoom}`,
      desc: 'Highway crash radar, GPS coordinates, RTO plate lookup, Green corridor & e-FIR'
    }
  ];

  const handleCopy = (key, url) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateRoom = (e) => {
    e.preventDefault();
    if (roomInput && roomInput.trim()) {
      cloudDb.setRoom(roomInput.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        color: '#f1f5f9'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Worldwide Multi-Device Presentation Hub
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Open separate station interfaces on multiple phones, tablets, or laptops anywhere in the world.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Room Session Code Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} /> ACTIVE WORLDWIDE SESSION ROOM CODE
          </div>
          <form onSubmit={handleUpdateRoom} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              placeholder="e.g. NITISH-VIVA-2026"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.82rem'
              }}
            >
              Update Room
            </button>
          </form>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
            💡 Devices anywhere on earth entering the same room code will instantly synchronize in real time ($&lt;50\text{ms}$).
          </div>
        </div>

        {/* 3 Presentation Station Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {deviceLinks.map(link => {
            const Icon = link.icon;
            const isCopied = copiedKey === link.key;
            return (
              <div
                key={link.key}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${link.color}33`,
                  borderLeft: `4px solid ${link.color}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color={link.color} />
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      {link.title}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255,255,255,0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#cbd5e1'
                    }}>
                      {link.deviceType}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleCopy(link.key, link.url)}
                      style={{
                        background: isCopied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Open Tab</span>
                    </a>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {link.desc}
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  color: '#93c5fd',
                  wordBreak: 'break-all'
                }}>
                  {link.url}
                </div>
              </div>
            );
          })}
        </div>

        {/* Viva Demo Instructions Box */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '14px',
          fontSize: '0.8rem',
          color: '#d1fae5',
          lineHeight: 1.5
        }}>
          <strong>🎯 How to Present During Your Viva:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Copy the <strong>Device 1 link</strong> and open it on your <strong>Mobile Phone</strong> (simulate the car driver).</li>
            <li>Copy the <strong>Device 2 link</strong> and open it on a <strong>Tablet / Screen</strong> (simulate the Hospital ER Desk).</li>
            <li>Copy the <strong>Device 3 link</strong> and open it on your <strong>Laptop</strong> (simulate Police Command 112).</li>
            <li>On your Phone, tap <strong>"Simulate 5.99g Crash"</strong>.</li>
            <li>Watch BOTH the Hospital and Police screens immediately start screaming sirens, flashing Code Red, and showing live telemetry across the globe!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

