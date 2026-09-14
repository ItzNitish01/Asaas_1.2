// Function to dynamically resolve API base URL (supports local dev, Vercel HTTPS, and custom user endpoints)
export const resolveApiBase = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('asaas_backend_url');
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');

    // In browser: if accessing via HTTPS (such as Vercel), plain http://localhost:5000 is blocked by browsers as Mixed Content.
    // Default automatically to live production cloud backend!
    if (window.location.protocol === 'https:' && !import.meta.env.VITE_BACKEND_URL) {
      return 'https://asaas-backend-1-2.onrender.com/api';
    }
  }
  return (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
};

export const resolveWsBase = (apiBase) => {
  if (typeof window !== 'undefined') {
    const customWs = localStorage.getItem('asaas_ws_url');
    if (customWs && customWs.trim()) return customWs.trim();
  }
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (apiBase && apiBase.startsWith('https:')) {
    return apiBase.replace(/^https:/, 'wss:').replace(/\/api\/?$/, '/ws');
  }
  return 'ws://localhost:5000/ws';
};

class BackendApiService {
  constructor() {
    this.apiBase = resolveApiBase();
    this.wsBase = resolveWsBase(this.apiBase);
    this.isBackendOnline = false;
    this.isWarmingUp = false;
    this.lastLatencyMs = null;
    this.failCount = 0;
    this.wsClient = null;
    this.subscribers = new Set();
    this.statusListeners = new Set();
    this.checkHealth(6000);
    // Periodic heartbeat every 12s
    if (typeof window !== 'undefined') {
      setInterval(() => this.checkHealth(6000), 12000);
    }
  }

  getActiveBackendUrl() {
    return this.apiBase;
  }

  isCustomConfigured() {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem('asaas_backend_url'));
    }
    return false;
  }

  resetBackendUrl() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asaas_backend_url');
      localStorage.removeItem('asaas_ws_url');
    }
    this.apiBase = resolveApiBase();
    this.wsBase = resolveWsBase(this.apiBase);
    if (this.wsClient) {
      try { this.wsClient.close(); } catch {}
      this.wsClient = null;
    }
    return this.checkHealth(6000);
  }

  setBackendUrl(newUrl) {
    if (!newUrl || !newUrl.trim()) return;
    const cleanUrl = newUrl.trim().replace(/\/+$/, '');
    this.apiBase = cleanUrl;
    this.wsBase = resolveWsBase(cleanUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asaas_backend_url', cleanUrl);
    }
    if (this.wsClient) {
      try { this.wsClient.close(); } catch {}
      this.wsClient = null;
    }
    return this.checkHealth(6000);
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

  async checkHealth(timeoutMs = 6000) {
    const prev = this.isBackendOnline;
    const startTime = performance.now();
    try {
      const res = await fetch(`${this.apiBase}/health`, { signal: AbortSignal.timeout(timeoutMs) });
      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        this.isBackendOnline = true;
        this.isWarmingUp = false;
        this.lastLatencyMs = elapsed;
        this.failCount = 0;
        if (!this.wsClient) {
          this.connectWebSocket();
        }
      } else {
        this.failCount++;
        if (this.failCount >= 2) {
          this.isBackendOnline = false;
        }
      }
    } catch {
      this.failCount++;
      if (this.failCount >= 2) {
        this.isBackendOnline = false;
      }
    }
    if (prev !== this.isBackendOnline) {
      this.notifyStatus();
    }
    return this.isBackendOnline;
  }

  connectWebSocket() {
    if (typeof window === 'undefined' || this.wsClient) return;

    try {
      this.wsClient = new WebSocket(this.wsBase);

      this.wsClient.onopen = () => {
        console.log('[BACKEND-API] WebSocket connected to real-time backend engine at', this.wsBase);
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

  async get(endpoint, timeoutMs = 2500) {
    try {
      const res = await fetch(`${this.apiBase}${endpoint}`, {
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[BACKEND-API] GET ${endpoint} failed:`, err.message);
      return null;
    }
  }

  async post(endpoint, body, timeoutMs = 2500) {
    try {
      const res = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs)
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

