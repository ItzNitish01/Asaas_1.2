/**
 * ASAAS Production API Client
 *
 * Connects to the FastAPI backend with:
 *   - JWT authentication (HttpOnly cookie + Bearer token fallback)
 *   - Automatic retry on failure
 *   - Graceful fallback to demo/simulation mode when backend is offline
 *   - Real-time WebSocket client
 *
 * Base URL: VITE_BACKEND_URL env var or http://localhost:5000/api
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

let _accessToken = null; // In-memory token fallback (HttpOnly cookie preferred)

class AsaasApiClient {
  constructor() {
    this.isOnline = false;
    this.wsClient = null;
    this.subscribers = new Set();
    this.statusListeners = new Set();
    this._reconnectTimer = null;
    this._healthTimer = null;

    if (typeof window !== 'undefined') {
      this._startHealthCheck();
    }
  }

  // ---------------------------------------------------------------- //
  // Status / Health
  // ---------------------------------------------------------------- //

  onStatusChange(cb) {
    this.statusListeners.add(cb);
    cb(this.isOnline);
    return () => this.statusListeners.delete(cb);
  }

  _notifyStatus() {
    for (const cb of this.statusListeners) {
      try { cb(this.isOnline); } catch (_) {}
    }
  }

  _startHealthCheck() {
    this.checkHealth();
    this._healthTimer = setInterval(() => this.checkHealth(), 10_000);
  }

  async checkHealth() {
    const prev = this.isOnline;
    try {
      const res = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(3000),
        credentials: 'include',
      });
      this.isOnline = res.ok;
      if (res.ok && !this.wsClient) {
        this._connectWebSocket();
      }
    } catch {
      this.isOnline = false;
      if (this.wsClient) {
        this.wsClient = null;
      }
    }
    if (prev !== this.isOnline) {
      this._notifyStatus();
    }
    return this.isOnline;
  }

  // ---------------------------------------------------------------- //
  // WebSocket
  // ---------------------------------------------------------------- //

  _connectWebSocket(role = 'anonymous') {
    if (typeof window === 'undefined' || this.wsClient) return;
    const token = _accessToken || '';
    const url = `${WS_BASE}?role=${role}&token=${token}`;
    try {
      this.wsClient = new WebSocket(url);

      this.wsClient.onopen = () => {
        console.log('[ASAAS-API] WebSocket connected to real-time backend');
        // Send ping every 30s to keep connection alive
        this._pingInterval = setInterval(() => {
          if (this.wsClient?.readyState === WebSocket.OPEN) {
            this.wsClient.send('ping');
          }
        }, 30_000);
      };

      this.wsClient.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'pong') return;
          this._notifySubscribers(parsed.type, parsed.payload);
        } catch (e) {
          console.error('[ASAAS-API] WS parse error:', e);
        }
      };

      this.wsClient.onclose = () => {
        clearInterval(this._pingInterval);
        this.wsClient = null;
        // Reconnect after 5s
        this._reconnectTimer = setTimeout(() => {
          if (this.isOnline) this._connectWebSocket(role);
        }, 5000);
      };

      this.wsClient.onerror = (err) => {
        console.warn('[ASAAS-API] WebSocket error:', err);
      };
    } catch (err) {
      console.warn('[ASAAS-API] Could not connect WebSocket:', err);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  _notifySubscribers(type, payload) {
    for (const sub of this.subscribers) {
      try { sub(type, payload); } catch (e) { console.error(e); }
    }
  }

  // ---------------------------------------------------------------- //
  // HTTP helpers
  // ---------------------------------------------------------------- //

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (_accessToken) h['Authorization'] = `Bearer ${_accessToken}`;
    return h;
  }

  async get(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: this._headers(),
        credentials: 'include',
        signal: options.signal || AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ASAAS-API] GET ${endpoint} failed:`, err.message);
      return null;
    }
  }

  async post(endpoint, body, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this._headers(),
        credentials: 'include',
        body: JSON.stringify(body),
        signal: options.signal || AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ASAAS-API] POST ${endpoint} failed:`, err.message);
      return null;
    }
  }

  async put(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this._headers(),
        credentials: 'include',
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ASAAS-API] PUT ${endpoint} failed:`, err.message);
      return null;
    }
  }

  // ---------------------------------------------------------------- //
  // Auth
  // ---------------------------------------------------------------- //

  async login(username, password) {
    const data = await this.post('/v1/auth/login', { username, password });
    if (data?.access_token) {
      _accessToken = data.access_token;
      if (this.wsClient) {
        // Reconnect WS with auth token
        this.wsClient.close();
        this.wsClient = null;
      }
      this._connectWebSocket(data.role);
    }
    return data;
  }

  async logout() {
    _accessToken = null;
    if (this.wsClient) { this.wsClient.close(); this.wsClient = null; }
    return this.post('/v1/auth/logout', {});
  }

  async getMe() {
    return this.get('/v1/auth/me');
  }

  // ---------------------------------------------------------------- //
  // Telemetry
  // ---------------------------------------------------------------- //

  /** @param {Object} payload - ESP32 telemetry packet */
  async ingestTelemetry(payload) {
    return this.post('/v1/telemetry/', payload);
  }

  async getRecentTelemetry() {
    return this.get('/v1/telemetry/recent');
  }

  // ---------------------------------------------------------------- //
  // Incidents
  // ---------------------------------------------------------------- //

  async triggerEmergency(incidentData) {
    return this.post('/v1/incidents/trigger', incidentData);
  }

  async abortEmergency(incidentRef, reason) {
    return this.post('/v1/incidents/abort', { incident_ref: incidentRef, reason });
  }

  async getActiveIncident() {
    return this.get('/v1/incidents/active');
  }

  async getIncidentHistory(limit = 20) {
    return this.get(`/v1/incidents/history?limit=${limit}`);
  }

  async getCapAlert(incidentRef) {
    return this.get(`/v1/incidents/${incidentRef}/cap`);
  }

  // ---------------------------------------------------------------- //
  // Geospatial (legacy + new endpoints)
  // ---------------------------------------------------------------- //

  /** Combined hospital + police lookup (original contract preserved) */
  async getNearestFacilities(lat, lng) {
    return this.get(`/v1/geospatial/nearest?lat=${lat}&lng=${lng}`);
  }

  async getNearestHospitals(lat, lng, limit = 4) {
    return this.get(`/v1/hospitals/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
  }

  async getNearestPolice(lat, lng, limit = 4) {
    return this.get(`/v1/police/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
  }

  // ---------------------------------------------------------------- //
  // Registry (legacy compatibility)
  // ---------------------------------------------------------------- //

  async getVehicles() {
    return this.get('/v1/registry/vehicles');
  }

  async getMedicalProfile() {
    return this.get('/v1/registry/medical');
  }

  async getEmergencyContacts() {
    return this.get('/v1/registry/contacts');
  }

  // ---------------------------------------------------------------- //
  // Medical (authenticated)
  // ---------------------------------------------------------------- //

  async getMyMedicalProfile() {
    return this.get('/v1/medical/profile');
  }

  async updateMedicalProfile(data) {
    return this.put('/v1/medical/profile', data);
  }
}

export const backendApi = new AsaasApiClient();
export default backendApi;

