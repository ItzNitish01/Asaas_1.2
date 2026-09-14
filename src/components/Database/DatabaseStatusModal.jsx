import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Laptop, 
  X, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import backendApi from '../../services/apiClient';
import cloudDb from '../../services/cloudDbEngine';

export default function DatabaseStatusModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeUrl, setActiveUrl] = useState(backendApi.getActiveBackendUrl());
  const [customInput, setCustomInput] = useState(backendApi.getActiveBackendUrl());
  const [isOnline, setIsOnline] = useState(backendApi.isBackendOnline);
  const [latency, setLatency] = useState(backendApi.lastLatencyMs);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  const CLOUD_RENDER_URL = 'https://asaas-backend-1-2.onrender.com/api';
  const LOCAL_DEV_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const unsub = backendApi.onStatusChange((status) => {
      setIsOnline(status);
      setLatency(backendApi.lastLatencyMs);
    });
    return unsub;
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);
    try {
      const online = await backendApi.checkHealth(8000);
      setIsOnline(online);
      setLatency(backendApi.lastLatencyMs);
      if (online) {
        setMessage({ type: 'success', text: `Gateway responded in ${backendApi.lastLatencyMs || '<100'}ms! PostgreSQL / SQLite database is live.` });
      } else {
        setMessage({ type: 'error', text: 'Gateway did not respond or connection was refused. Check URL or ensure server is running.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSelectPreset = async (url) => {
    setCustomInput(url);
    setActiveUrl(url);
    setTesting(true);
    setMessage(null);
    backendApi.setBackendUrl(url);
    const online = await backendApi.checkHealth(8000);
    setIsOnline(online);
    setLatency(backendApi.lastLatencyMs);
    setTesting(false);
    if (online) {
      setMessage({ type: 'success', text: `Connected to ${url}` });
      cloudDb.syncFromBackend?.();
    } else {
      setMessage({ type: 'error', text: `Could not reach ${url}. (If Render, free instances may take ~30s to wake up)` });
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    await handleSelectPreset(customInput.trim());
  };

  const handleResetAuto = async () => {
    setTesting(true);
    setMessage(null);
    backendApi.resetBackendUrl();
    const current = backendApi.getActiveBackendUrl();
    setActiveUrl(current);
    setCustomInput(current);
    const online = await backendApi.checkHealth(8000);
    setIsOnline(online);
    setLatency(backendApi.lastLatencyMs);
    setTesting(false);
    setMessage({ type: 'info', text: `Reset to automatic endpoint: ${current}` });
    if (online) cloudDb.syncFromBackend?.();
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
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        color: '#f1f5f9'
      }}>
        {/* Header */}
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
              background: isOnline ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isOnline ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none'
            }}>
              <Database size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                ASAAS Database &amp; Gateway Manager
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Dual-layer synchronization: PostgreSQL/SQLite Server + MQTT Worldwide Mesh
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

        {/* Live Status Banner */}
        <div style={{
          background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isOnline ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <AlertCircle size={24} color="#f59e0b" />
            )}
            <div>
              <div style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: isOnline ? '#34d399' : '#fbbf24'
              }}>
                {isOnline ? 'DATABASE GATEWAY LIVE (POSTGRESQL / SQLITE)' : 'STANDALONE CLIENT SYNC (LOCAL STORAGE)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {isOnline 
                  ? `Telemetry, incident dispatch & medical records verified in real time.`
                  : 'Backend server currently offline or spinning up. Running on local resilient state.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {latency !== null && isOnline && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Activity size={12} /> {latency} ms
              </div>
            )}
            <button
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                background: isOnline ? '#10b981' : '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing...' : 'Test Ping'}
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${message.type === 'success' ? '#10b981' : message.type === 'error' ? '#ef4444' : '#3b82f6'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#fff',
            marginBottom: '16px'
          }}>
            {message.text}
          </div>
        )}

        {/* Active Gateway Details */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
            ACTIVE BACKEND ENDPOINT
          </div>
          <div style={{
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#38bdf8',
            wordBreak: 'break-all',
            marginBottom: '12px'
          }}>
            {activeUrl}
          </div>

          {/* Preset Buttons */}
          <div style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>
            SELECT PRESET GATEWAY:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <button
              onClick={() => handleSelectPreset(CLOUD_RENDER_URL)}
              style={{
                background: activeUrl === CLOUD_RENDER_URL ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${activeUrl === CLOUD_RENDER_URL ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                color: activeUrl === CLOUD_RENDER_URL ? '#34d399' : '#f1f5f9',
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Globe size={16} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Render Cloud API</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Live HTTPS (for Vercel &amp; Mobile)</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset(LOCAL_DEV_URL)}
              style={{
                background: activeUrl === LOCAL_DEV_URL ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${activeUrl === LOCAL_DEV_URL ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}`,
                color: activeUrl === LOCAL_DEV_URL ? '#7dd3fc' : '#f1f5f9',
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Laptop size={16} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Local VS Code</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>http://localhost:5000</div>
              </div>
            </button>
          </div>

          {/* Custom URL Form */}
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="https://your-custom-backend.com/api"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                color: '#fff'
              }}
            />
            <button
              type="submit"
              disabled={testing}
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetAuto}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title="Revert custom override and use default auto-detection"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Diagnostic Guide for SIH & Vercel */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          lineHeight: '1.5'
        }}>
          <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Why does Vercel behave differently than Localhost?
          </div>
          <div>
            1. <strong>Mixed Content Security:</strong> Browsers forbid an <code>https://</code> site (like your deployed Vercel domain) from querying insecure <code>http://localhost:5000</code>.
          </div>
          <div style={{ marginTop: '3px' }}>
            2. <strong>Auto-Failover Activated:</strong> ASAAS automatically routes Vercel requests to the production cloud gateway on Render. Free Render tiers enter sleep after inactivity; if waking up, click <strong>Test Ping</strong> after 25s.
          </div>
          <div style={{ marginTop: '3px' }}>
            3. <strong>Resilient Multi-Device Sync:</strong> Even if the HTTP backend is waking up, the built-in MQTT Worldwide Mesh instantly coordinates Code Red, telemetry, and dispatches across all connected presentation devices.
          </div>
        </div>
      </div>
    </div>
  );
}

