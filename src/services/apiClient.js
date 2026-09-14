// ASAAS Real-Time Client API Service
// Connects to local or production cloud backend with automatic fallback

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

class BackendApiService {
  constructor() {
    this.isBackendOnline = false;
    this.wsClient = null;
    this.subscribers = new Set();
    this.statusListeners = new Set();
    this.checkHealth();
    // Periodic heartbeat every 10s
    if (typeof window !== 'undefined') {
      setInterval(() => this.checkHealth(), 10000);
    }
  }

  onStatusChange(cb) {
    this.statusListeners.add(cb);
    cb(this.isBackendOnline);
    return () => this.statusListeners.delete(cb);
  }

  notifyStatus() {
    for (const cb of this.statusListeners) {
      try { cb(this.isBackendOnline); } catch (e) {}
    }
  }

  async checkHealth() {
    const prev = this.isBackendOnline;
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
      this.isBackendOnline = res.ok;
      if (res.ok && !this.wsClient) {
        this.connectWebSocket();
      }
    } catch {
      this.isBackendOnline = false;
    }
    if (prev !== this.isBackendOnline) {
      this.notifyStatus();
    }
    return this.isBackendOnline;
  }

  connectWebSocket() {
    if (typeof window === 'undefined' || this.wsClient) return;

    try {
      this.wsClient = new WebSocket(WS_BASE);

      this.wsClient.onopen = () => {
        console.log('[BACKEND-API] WebSocket connected to real-time backend engine');
      };

      this.wsClient.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notifySubscribers(parsed.type, parsed.payload);
        } catch (err) {
          console.error('[BACKEND-API] WS parse error:', err);
        }
      };

      this.wsClient.onclose = () => {
        this.wsClient = null;
        // Attempt reconnection after 5s
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (err) {
      console.warn('[BACKEND-API] Could not connect WebSocket:', err);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(type, payload) {
    for (const sub of this.subscribers) {
      try { sub(type, payload); } catch (e) { console.error(e); }
    }
  }

  // --- REST Endpoints ---
  async ingestTelemetry(payload) {
    return this.post('/v1/telemetry', payload);
  }

  async triggerEmergency(incidentData) {
    return this.post('/v1/incidents/trigger', incidentData);
  }

  async abortEmergency(incidentId, reason) {
    return this.post('/v1/incidents/abort', { incidentId, reason });
  }

  async getActiveIncident() {
    return this.get('/v1/incidents/active');
  }

  async getNearestFacilities(lat, lng) {
    return this.get(`/v1/geospatial/nearest?lat=${lat}&lng=${lng}`);
  }

  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[BACKEND-API] GET ${endpoint} failed:`, err.message);
      return null;
    }
  }

  async post(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[BACKEND-API] POST ${endpoint} failed:`, err.message);
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
export const apiClient = backendApi;
export default backendApi;

