import mqtt from 'mqtt';
import { 
  initialMedicalProfile, 
  initialVehicles, 
  initialEmergencyContacts, 
  accidentHistory,
  initialHospitalBeds,
  initialHospitalAmbulances,
  initialBloodBankStock,
  initialHospitalDoctors,
  initialHospitalTriageCases,
  initialHospitalIncidentRecords,
  initialHospitalEmergencyDirectory,
  initialPoliceInterceptors,
  initialPoliceFirRecords,
  initialPoliceDirectory,
  initialTrafficJunctions,
  initialHazardPerimeters,
  initialFamilyMembers,
  initialGeofenceZones,
  initialFamilyTripLogs,
  initialGuardianCircle,
  initialGuardianSettings
} from './mockData';
import { defaultTelemetryState } from './telemetryEngine';
import { backendApi } from './apiClient';

// Default Demo Room Code for Global Isolation
const DEFAULT_ROOM_ID = 'ASAAS-GLOBAL-LIVE';

// Public Enterprise-grade MQTT Cloud Brokers (Free, zero-key, works worldwide across cellular & Wi-Fi)
const PRIMARY_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const FALLBACK_BROKER = 'wss://broker.hivemq.com:8884/mqtt';

// Safe normalization helper to ensure allergies and conditions are always arrays for UI components
const normalizeArrayField = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return fallback;
};

class CloudDbEngine {
  constructor() {
    this.client = null;
    this.roomId = this.getInitialRoomId();
    this.connectionStatus = 'connecting';
    this.listeners = new Set();
    this.clientId = 'client_' + Math.random().toString(16).substring(2, 10);
    this.lastBroadcastTime = 0;

    // Default Initial State
    this.state = {
      roomId: this.roomId,
      connectionStatus: 'connecting',
      telemetry: { ...defaultTelemetryState },
      activeIncident: null,
      incidentHistory: [...accidentHistory],
      medicalProfile: { ...initialMedicalProfile },
      emergencyContacts: [...initialEmergencyContacts],
      vehicles: [...initialVehicles],
      selectedVehicleId: 'v1',
      hospitalBeds: [...initialHospitalBeds],
      hospitalAmbulances: [...initialHospitalAmbulances],
      bloodBankStock: [...initialBloodBankStock],
      hospitalDoctors: [...initialHospitalDoctors],
      hospitalTriageCases: [...initialHospitalTriageCases],
      hospitalIncidentRecords: [...initialHospitalIncidentRecords],
      hospitalEmergencyDirectory: [...initialHospitalEmergencyDirectory],
      policeInterceptors: [...initialPoliceInterceptors],
      policeFirRecords: [...initialPoliceFirRecords],
      policeDirectory: [...initialPoliceDirectory],
      trafficJunctions: [...initialTrafficJunctions],
      hazardPerimeters: [...initialHazardPerimeters],
      familyMembers: [...initialFamilyMembers],
      selectedFamilyMemberId: 'fam-1',
      geofenceZones: [...initialGeofenceZones],
      familyTripLogs: [...initialFamilyTripLogs],
      guardianCircle: [...initialGuardianCircle],
      guardianSettings: { ...initialGuardianSettings },
      dispatches: {
        hospital: {
          ambulanceStatus: 'standby', // 'standby' | 'dispatched' | 'en_route' | 'arrived'
          ambulanceUnit: 'ALS 108 - Trauma Mobile ICU #12',
          ambulanceEtaMinutes: 8,
          icuBedReserved: false,
          icuBedNumber: 'Trauma Bay #04',
          bloodUnitsReserved: 0,
          bloodType: 'O+ (Positive)',
          hospitalName: 'AIIMS Apex Trauma Centre, New Delhi',
          dispatchedAt: null,
          logs: []
        },
        police: {
          pcrStatus: 'patrolling', // 'patrolling' | 'dispatched' | 'on_scene'
          pcrUnit: 'Highway Patrol Interceptor #07',
          pcrEtaMinutes: 4,
          greenCorridorActive: false,
          hazardPerimeterSet: false,
          firGenerated: false,
          firNumber: 'FIR-2026-DEL-8821',
          dispatchedAt: null,
          logs: []
        }
      }
    };

    // Attempt to load cached state from localStorage
    this.loadFromLocalStorage();

    // Setup Local Cross-Tab Broadcast Channel (for instant same-browser multi-window testing)
    this.setupBroadcastChannel();

    // Connect to Worldwide Real-time Cloud Broker
    this.connectCloudBroker();

    // Hook Real-Time Backend WebSocket notifications
    this.initBackendSocketBridge();
  }

  initBackendSocketBridge() {
    // When backend connects or status changes, trigger automatic sync with PostgreSQL database
    backendApi.onStatusChange((isOnline) => {
      if (isOnline) {
        this.syncFromBackend();
      }
    });

    // Run immediate sync if backend is already online
    if (backendApi.isBackendOnline) {
      this.syncFromBackend();
    }

    backendApi.subscribe((type, payload) => {
      if (type === 'TELEMETRY_STREAM' && payload) {
        const t = payload.telemetry || payload;
        this.state.telemetry = { 
          ...this.state.telemetry, 
          ...t,
          speedKmh: t.speedKmh ?? this.state.telemetry.speedKmh,
          totalGForce: t.totalGForce ?? this.state.telemetry.totalGForce,
          lat: t.lat ?? this.state.telemetry.lat,
          lng: t.lng ?? this.state.telemetry.lng
        };
        this.notify();
      } else if (type === 'INCIDENT_TRIGGERED' && payload) {
        const inc = payload.incident || payload;
        const dispatches = payload.dispatches;
        this.applyBackendIncident(inc, dispatches, true);
      } else if (type === 'INCIDENT_ABORTED') {
        this.abortEmergency();
      }
    });
  }

  applyBackendIncident(inc, dispatches, isLiveAlert = false) {
    if (!inc) return;
    const incidentObj = {
      id: inc.incidentRef || inc.id || `INC-${Date.now().toString().slice(-6)}`,
      date: inc.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
      vehicleName: inc.patientSnapshot?.vehiclePlate ? `Vehicle (${inc.patientSnapshot.vehiclePlate})` : 'Hyundai Creta SX (O) Turbo',
      registrationNumber: inc.patientSnapshot?.vehiclePlate || 'DL-01-AB-4321',
      deviceId: inc.deviceId || 'ASAAS-001',
      severity: inc.severity || 'CRITICAL',
      peakGForce: inc.peakGForce || '5.84g',
      speedAtImpact: inc.speedAtImpact || '74 km/h',
      location: inc.locationName || inc.location || 'NH-48 Expressway, KM 34.2',
      coordinates: inc.coordinates || { lat: inc.lat || 28.4595, lng: inc.lng || 77.0266 },
      status: inc.status || 'Emergency Active',
      ambulanceEta: dispatches?.hospital?.ambulanceEtaMinutes ? `${dispatches.hospital.ambulanceEtaMinutes} mins` : '8 mins',
      aiSummary: inc.aiSummary || `${inc.severity || 'CRITICAL'} Impact Collision. Dispatches in progress.`,
      patientSnapshot: inc.patientSnapshot ? {
        name: inc.patientSnapshot.name || this.state.medicalProfile.fullName,
        bloodGroup: inc.patientSnapshot.bloodGroup || this.state.medicalProfile.bloodGroup,
        allergies: normalizeArrayField(inc.patientSnapshot.allergies, this.state.medicalProfile.allergies),
        conditions: normalizeArrayField(inc.patientSnapshot.conditions || inc.patientSnapshot.medicalConditions, this.state.medicalProfile.medicalConditions),
        physicianPhone: inc.patientSnapshot.physicianPhone || this.state.medicalProfile.primaryPhysicianPhone || '+91 98765 43210'
      } : {
        name: this.state.medicalProfile.fullName,
        bloodGroup: this.state.medicalProfile.bloodGroup,
        allergies: normalizeArrayField(this.state.medicalProfile.allergies),
        conditions: normalizeArrayField(this.state.medicalProfile.medicalConditions),
        physicianPhone: this.state.medicalProfile.primaryPhysicianPhone || '+91 98765 43210'
      }
    };

    this.state.activeIncident = incidentObj;

    // ONLY set emergency alert flags on live triggers, NEVER on initial background sync / refresh
    if (isLiveAlert) {
      this.state.telemetry = {
        ...this.state.telemetry,
        isEmergencyAlert: true,
        alertSeverity: inc.severity || 'CRITICAL',
        alertReason: inc.reason || 'Crash Collision Detected'
      };
    }

    if (dispatches?.hospital) {
      this.state.dispatches.hospital = {
        ...this.state.dispatches.hospital,
        hospitalName: dispatches.hospital.hospitalName || this.state.dispatches.hospital.hospitalName,
        ambulanceStatus: dispatches.hospital.ambulanceStatus || 'dispatched',
        ambulanceUnit: dispatches.hospital.ambulanceUnit || this.state.dispatches.hospital.ambulanceUnit,
        ambulanceEtaMinutes: dispatches.hospital.ambulanceEtaMinutes || 8,
        icuBedReserved: dispatches.hospital.icuBedReserved ?? true,
        icuBedNumber: dispatches.hospital.icuBedNumber || 'Trauma Bay #04',
        bloodUnitsReserved: dispatches.hospital.bloodUnitsReserved || 2,
        bloodType: dispatches.hospital.bloodType || 'O+'
      };
    }

    if (dispatches?.police) {
      this.state.dispatches.police = {
        ...this.state.dispatches.police,
        policeStationName: dispatches.police.policeStationName || this.state.dispatches.police.policeStationName,
        pcrStatus: dispatches.police.pcrStatus || 'dispatched',
        pcrUnit: dispatches.police.pcrUnit || this.state.dispatches.police.pcrUnit,
        pcrEtaMinutes: dispatches.police.pcrEtaMinutes || 5,
        greenCorridorActive: dispatches.police.greenCorridorActive ?? true,
        firGenerated: dispatches.police.firGenerated ?? true,
        firNumber: dispatches.police.firNumber || 'FIR-2026-DEL-8821'
      };
    }

    this.saveToLocalStorage();
    this.notify();
  }

  abortEmergency(reason = 'Driver cancelled emergency alert') {
    this.state.activeIncident = null;
    this.state.telemetry = {
      ...this.state.telemetry,
      isEmergencyAlert: false,
      alertSeverity: 'NONE',
      alertReason: '',
      relayHornActive: false,
      stopButtonPressed: false
    };
    if (this.state.dispatches?.hospital) {
      this.state.dispatches.hospital.ambulanceStatus = 'standby';
      this.state.dispatches.hospital.icuBedReserved = false;
      this.state.dispatches.hospital.bloodUnitsReserved = 0;
    }
    if (this.state.dispatches?.police) {
      this.state.dispatches.police.pcrStatus = 'patrolling';
      this.state.dispatches.police.greenCorridorActive = false;
      this.state.dispatches.police.hazardPerimeterSet = false;
      this.state.dispatches.police.firGenerated = false;
    }
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/action`, { action: 'abort', reason });
    backendApi.abortEmergency(null, reason).catch(() => {});
    this.notify();
  }

  clearActiveIncident() {
    this.abortEmergency('Dismissed by user');
  }

  async syncFromBackend() {
    try {
      // 1. Fetch active incident from PostgreSQL database (for terminal triage records; isLiveAlert = false)
      const activeRes = await backendApi.getActiveIncident();
      if (activeRes && activeRes.status === 'SUCCESS') {
        if (activeRes.incident) {
          const keepLive = Boolean(this.state.telemetry?.isEmergencyAlert);
          this.applyBackendIncident(activeRes.incident, activeRes.incident.dispatch, keepLive);
        } else if (this.state.activeIncident && !this.state.telemetry?.isEmergencyAlert) {
          // Clear stale active incident cached from prior sessions ONLY if no emergency is underway
          this.state.activeIncident = null;
          this.state.telemetry = {
            ...this.state.telemetry,
            isEmergencyAlert: false,
            alertSeverity: '',
            alertReason: '',
            relayHornActive: false,
            stopButtonPressed: false
          };
          if (this.state.dispatches?.hospital) {
            this.state.dispatches.hospital.ambulanceStatus = 'standby';
            this.state.dispatches.hospital.icuBedReserved = false;
            this.state.dispatches.hospital.bloodUnitsReserved = 0;
          }
          if (this.state.dispatches?.police) {
            this.state.dispatches.police.pcrStatus = 'patrolling';
            this.state.dispatches.police.greenCorridorActive = false;
            this.state.dispatches.police.hazardPerimeterSet = false;
            this.state.dispatches.police.firGenerated = false;
          }
          this.saveToLocalStorage();
          this.notify();
        }
      }

      // 2. Fetch live hospitals from PostgreSQL database
      const hospRes = await backendApi.get('/v1/hospitals/all');
      if (hospRes && hospRes.status === 'SUCCESS' && Array.isArray(hospRes.data) && hospRes.data.length > 0) {
        const dbHospitals = hospRes.data.map(h => ({
          id: `hosp-${h.id}`,
          name: h.name,
          category: 'Apex Trauma',
          phone: h.phone || '+91 11 2659 8600',
          distance: h.city || 'NCR',
          status: 'Online',
          type: 'hospital',
          lat: h.lat,
          lng: h.lng
        }));
        this.state.hospitalEmergencyDirectory = [
          ...dbHospitals,
          ...this.state.hospitalEmergencyDirectory.filter(d => d.type !== 'hospital')
        ];
      }

      // 3. Fetch registered vehicles
      const vehRes = await backendApi.get('/v1/registry/vehicles');
      if (vehRes && vehRes.status === 'SUCCESS' && Array.isArray(vehRes.data) && vehRes.data.length > 0) {
        this.state.vehicles = vehRes.data.map((v, idx) => ({
          id: `v${v.id || idx + 1}`,
          name: v.name,
          plateNumber: v.registrationNumber,
          driverName: v.driverName || 'Aaradhya Sharma',
          bloodGroup: v.bloodGroup || 'O+ (Positive)',
          type: 'car',
          deviceId: v.deviceId || 'ASAAS-001',
          documents: []
        }));
      }

      // 4. Fetch medical profile
      const medRes = await backendApi.get('/v1/registry/medical');
      if (medRes && medRes.status === 'SUCCESS' && medRes.data) {
        this.state.medicalProfile = {
          ...this.state.medicalProfile,
          fullName: medRes.data.fullName || this.state.medicalProfile.fullName,
          bloodGroup: medRes.data.bloodGroup || this.state.medicalProfile.bloodGroup,
          abhaId: medRes.data.abhaId || this.state.medicalProfile.abhaId,
          allergies: normalizeArrayField(medRes.data.allergies, this.state.medicalProfile.allergies),
          medicalConditions: normalizeArrayField(medRes.data.medicalConditions, this.state.medicalProfile.medicalConditions),
          primaryPhysicianName: medRes.data.primaryPhysicianName || this.state.medicalProfile.primaryPhysicianName,
          primaryPhysicianPhone: medRes.data.primaryPhysicianPhone || this.state.medicalProfile.primaryPhysicianPhone
        };
      }

      // 5. Fetch emergency contacts
      const contactsRes = await backendApi.get('/v1/registry/contacts');
      if (contactsRes && contactsRes.status === 'SUCCESS' && Array.isArray(contactsRes.data) && contactsRes.data.length > 0) {
        this.state.emergencyContacts = contactsRes.data.map((c, idx) => ({
          id: `c${c.id || idx + 1}`,
          name: c.name,
          relation: c.relation,
          phone: c.phone,
          isPrimary: c.isPrimary
        }));
      }

      this.saveToLocalStorage();
      this.notify();
    } catch (e) {
      console.warn('[CLOUD-DB] syncFromBackend error:', e);
    }
  }

  getInitialRoomId() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam && roomParam.trim()) {
        return roomParam.trim().toUpperCase();
      }
      const saved = localStorage.getItem('asaas_active_room');
      if (saved && saved.trim()) {
        return saved.trim().toUpperCase();
      }
    } catch (e) {
      console.warn('Could not read room URL parameter', e);
    }
    return DEFAULT_ROOM_ID;
  }

  setupBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(`asaas_room_${this.roomId}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type && event.data.sender !== this.clientId) {
            this.handleIncomingMessage(event.data.type, event.data.payload);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }

  connectCloudBroker() {
    const brokerUrl = PRIMARY_BROKER;
    const options = {
      clientId: `asaas_web_${this.clientId}`,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
      keepalive: 30
    };

    try {
      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        this.connectionStatus = 'connected';
        this.state.connectionStatus = 'connected';
        this.notify();

        // Subscribe to Room Topics
        const baseTopic = `asaas/${this.roomId}`;
        this.client.subscribe([
          `${baseTopic}/telemetry`,
          `${baseTopic}/incident`,
          `${baseTopic}/dispatch`,
          `${baseTopic}/action`,
          `${baseTopic}/vehicles`,
          `${baseTopic}/medical`,
          `${baseTopic}/contacts`,
          `${baseTopic}/hospital_ops`,
          `${baseTopic}/police_ops`,
          `${baseTopic}/guardian_ops`,
          `${baseTopic}/sync_req`,
          `${baseTopic}/sync_resp`
        ], (err) => {
          if (!err) {
            // Request latest state from any existing active station in the room
            this.publishToCloud(`${baseTopic}/sync_req`, { requesterId: this.clientId });
          }
        });
      });

      this.client.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.sender === this.clientId) return; // Skip own echoed messages

          const topicSuffix = topic.split('/').pop();

          if (topicSuffix === 'sync_req') {
            // Another device just connected and needs the current room state
            if (this.state.activeIncident || this.state.dispatches.hospital.ambulanceStatus !== 'standby') {
              this.publishToCloud(`asaas/${this.roomId}/sync_resp`, {
                state: {
                  telemetry: this.state.telemetry,
                  activeIncident: this.state.activeIncident,
                  dispatches: this.state.dispatches,
                  selectedVehicleId: this.state.selectedVehicleId
                }
              });
            }
          } else if (topicSuffix === 'sync_resp') {
            if (payload.state) {
              this.state.telemetry = { ...this.state.telemetry, ...payload.state.telemetry };
              this.state.activeIncident = payload.state.activeIncident;
              this.state.dispatches = payload.state.dispatches;
              this.saveToLocalStorage();
              this.notify();
            }
          } else {
            this.handleIncomingMessage(topicSuffix, payload);
          }
        } catch (e) {
          console.error('Error parsing cloud message:', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('Cloud broker connection warning:', err);
        this.connectionStatus = 'reconnecting';
        this.state.connectionStatus = 'reconnecting';
        this.notify();
      });

      this.client.on('close', () => {
        this.connectionStatus = 'disconnected';
        this.state.connectionStatus = 'disconnected';
        this.notify();
      });
    } catch (e) {
      console.warn('Failed to initiate cloud MQTT connection, using local fallback:', e);
    }
  }

  handleIncomingMessage(type, payload) {
    if (type === 'telemetry') {
      this.state.telemetry = { ...this.state.telemetry, ...payload.telemetry };
      this.notify();
    } else if (type === 'incident') {
      this.state.activeIncident = payload.incident;
      if (payload.incident) {
        // Prepend to history if not already present
        const exists = this.state.incidentHistory.some(i => i.id === payload.incident.id);
        if (!exists) {
          this.state.incidentHistory = [payload.incident, ...this.state.incidentHistory];
        }
        // Update telemetry to emergency mode
        this.state.telemetry = {
          ...this.state.telemetry,
          isEmergencyAlert: true,
          alertSeverity: payload.incident.severity || 'CRITICAL',
          alertReason: payload.incident.reason || 'Accident Crash Detected'
        };
      }
      this.saveToLocalStorage();
      this.notify();
    } else if (type === 'dispatch') {
      if (payload.hospital) {
        this.state.dispatches.hospital = {
          ...this.state.dispatches.hospital,
          ...payload.hospital
        };
      }
      if (payload.police) {
        this.state.dispatches.police = {
          ...this.state.dispatches.police,
          ...payload.police
        };
      }
      this.saveToLocalStorage();
      this.notify();
    } else if (type === 'action') {
      if (payload.action === 'RESET_DEMO') {
        this.resetLocalState(false);
      }
    } else if (type === 'vehicles') {
      if (payload.vehicles && Array.isArray(payload.vehicles)) {
        this.state.vehicles = payload.vehicles;
        this.saveToLocalStorage();
        this.notify();
      }
    } else if (type === 'medical') {
      if (payload.medicalProfile) {
        this.state.medicalProfile = payload.medicalProfile;
        this.saveToLocalStorage();
        this.notify();
      }
    } else if (type === 'contacts') {
      if (payload.emergencyContacts && Array.isArray(payload.emergencyContacts)) {
        this.state.emergencyContacts = payload.emergencyContacts;
        this.saveToLocalStorage();
        this.notify();
      }
    } else if (type === 'hospital_ops') {
      if (payload.hospitalBeds && Array.isArray(payload.hospitalBeds)) {
        this.state.hospitalBeds = payload.hospitalBeds;
      }
      if (payload.hospitalAmbulances && Array.isArray(payload.hospitalAmbulances)) {
        this.state.hospitalAmbulances = payload.hospitalAmbulances;
      }
      if (payload.bloodBankStock && Array.isArray(payload.bloodBankStock)) {
        this.state.bloodBankStock = payload.bloodBankStock;
      }
      if (payload.hospitalDoctors && Array.isArray(payload.hospitalDoctors)) {
        this.state.hospitalDoctors = payload.hospitalDoctors;
      }
      if (payload.hospitalTriageCases && Array.isArray(payload.hospitalTriageCases)) {
        this.state.hospitalTriageCases = payload.hospitalTriageCases;
      }
      if (payload.hospitalIncidentRecords && Array.isArray(payload.hospitalIncidentRecords)) {
        this.state.hospitalIncidentRecords = payload.hospitalIncidentRecords;
      }
      if (payload.hospitalEmergencyDirectory && Array.isArray(payload.hospitalEmergencyDirectory)) {
        this.state.hospitalEmergencyDirectory = payload.hospitalEmergencyDirectory;
      }
      this.saveToLocalStorage();
      this.notify();
    } else if (type === 'police_ops') {
      if (payload.policeInterceptors && Array.isArray(payload.policeInterceptors)) {
        this.state.policeInterceptors = payload.policeInterceptors;
      }
      if (payload.policeFirRecords && Array.isArray(payload.policeFirRecords)) {
        this.state.policeFirRecords = payload.policeFirRecords;
      }
      if (payload.policeDirectory && Array.isArray(payload.policeDirectory)) {
        this.state.policeDirectory = payload.policeDirectory;
      }
      if (payload.trafficJunctions && Array.isArray(payload.trafficJunctions)) {
        this.state.trafficJunctions = payload.trafficJunctions;
      }
      if (payload.hazardPerimeters && Array.isArray(payload.hazardPerimeters)) {
        this.state.hazardPerimeters = payload.hazardPerimeters;
      }
      this.saveToLocalStorage();
      this.notify();
    } else if (type === 'guardian_ops') {
      if (payload.familyMembers && Array.isArray(payload.familyMembers)) {
        this.state.familyMembers = payload.familyMembers;
      }
      if (payload.geofenceZones && Array.isArray(payload.geofenceZones)) {
        this.state.geofenceZones = payload.geofenceZones;
      }
      if (payload.familyTripLogs && Array.isArray(payload.familyTripLogs)) {
        this.state.familyTripLogs = payload.familyTripLogs;
      }
      if (payload.guardianCircle && Array.isArray(payload.guardianCircle)) {
        this.state.guardianCircle = payload.guardianCircle;
      }
      if (payload.guardianSettings) {
        this.state.guardianSettings = { ...this.state.guardianSettings, ...payload.guardianSettings };
      }
      this.saveToLocalStorage();
      this.notify();
    }
  }

  publishToCloud(topic, data) {
    const payload = {
      ...data,
      sender: this.clientId,
      timestamp: new Date().toISOString()
    };
    const payloadString = JSON.stringify(payload);

    // 1. Send via Cloud MQTT (Worldwide)
    if (this.client && this.client.connected) {
      this.client.publish(topic, payloadString, { qos: 1 });
    }

    // 2. Send via Local BroadcastChannel (Same PC Instant tabs)
    if (this.broadcastChannel) {
      const type = topic.split('/').pop();
      this.broadcastChannel.postMessage({
        type,
        payload,
        sender: this.clientId
      });
    }
  }

  // --- Public API Methods ---

  setRoom(newRoomId) {
    if (!newRoomId || newRoomId.trim() === '' || newRoomId === this.roomId) return;
    const cleanRoom = newRoomId.trim().toUpperCase();
    this.roomId = cleanRoom;
    this.state.roomId = cleanRoom;
    localStorage.setItem('asaas_active_room', cleanRoom);

    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
    }
    this.setupBroadcastChannel();

    if (this.client) {
      try { this.client.end(true); } catch (e) {}
    }
    this.connectCloudBroker();
    this.notify();
  }

  broadcastTelemetry(telemetryUpdate) {
    this.state.telemetry = { ...this.state.telemetry, ...telemetryUpdate };
    
    // Throttle high-frequency telemetry updates to 5 per second max over cloud
    const now = Date.now();
    if (now - this.lastBroadcastTime > 200 || telemetryUpdate.isEmergencyAlert) {
      this.lastBroadcastTime = now;
      this.publishToCloud(`asaas/${this.roomId}/telemetry`, {
        telemetry: this.state.telemetry
      });
    }
    this.notify();
  }

  triggerCrashIncident({ severity, reason, peakGForce, speedAtImpact, location, coordinates }) {
    const incidentId = `INC-${Date.now().toString().slice(-6)}`;
    const newIncident = {
      id: incidentId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      vehicleName: 'Hyundai Creta SX (O) Turbo',
      registrationNumber: 'DL-01-AB-4321',
      deviceId: 'ASAAS-001',
      severity: severity || 'CRITICAL',
      peakGForce: peakGForce || '5.84g',
      speedAtImpact: speedAtImpact || '74 km/h',
      location: location || 'NH-48 Expressway, KM 34.2 (Near Hero Honda Chowk)',
      coordinates: coordinates || { lat: 28.4595, lng: 77.0266 },
      status: 'Emergency Active (Dispatches In Progress)',
      ambulanceEta: '8 mins (ALS #12 En Route)',
      aiSummary: `${severity || 'CRITICAL'} Impact Collision: MPU6050 recorded ${peakGForce || '5.84g'} deceleration. Worldwide alert dispatched to Hospital & Police stations.`,
      patientSnapshot: {
        name: this.state.medicalProfile.fullName,
        bloodGroup: this.state.medicalProfile.bloodGroup,
        allergies: this.state.medicalProfile.allergies,
        conditions: this.state.medicalProfile.medicalConditions,
        physicianPhone: this.state.medicalProfile.primaryPhysician?.phone || '+91 98765 43210'
      }
    };

    this.state.activeIncident = newIncident;
    this.state.incidentHistory = [newIncident, ...this.state.incidentHistory];
    this.state.telemetry = {
      ...this.state.telemetry,
      isEmergencyAlert: true,
      alertSeverity: severity || 'CRITICAL',
      alertReason: reason || 'Accident Crash Detected'
    };

    // Reset dispatches for fresh emergency response
    this.state.dispatches.hospital.ambulanceStatus = 'standby';
    this.state.dispatches.hospital.icuBedReserved = false;
    this.state.dispatches.hospital.bloodUnitsReserved = 0;
    this.state.dispatches.police.pcrStatus = 'patrolling';
    this.state.dispatches.police.greenCorridorActive = false;
    this.state.dispatches.police.hazardPerimeterSet = false;
    this.state.dispatches.police.firGenerated = false;

    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/incident`, { incident: newIncident });
    
    // Async push to backend persistent database
    backendApi.triggerEmergency({
      deviceId: 'ASAAS-001',
      severity: severity || 'CRITICAL',
      reason: reason || 'Accident Crash Detected',
      peakGForce: peakGForce || '5.84g',
      speedAtImpact: speedAtImpact || '74 km/h',
      coordinates: coordinates || { lat: 28.4595, lng: 77.0266 }
    }).catch(e => console.warn('Backend sync warning:', e));

    this.notify();
    return newIncident;
  }

  updateHospitalDispatch(hospitalUpdate) {
    const timestamp = new Date().toLocaleTimeString();
    const currentLogs = this.state.dispatches.hospital.logs || [];
    let logMsg = '';

    if (hospitalUpdate.ambulanceStatus === 'dispatched') {
      logMsg = `[${timestamp}] ALS 108 Ambulance Unit #12 Dispatched (ETA: 8 mins)`;
    } else if (hospitalUpdate.icuBedReserved) {
      logMsg = `[${timestamp}] Emergency ICU Trauma Bay #04 Locked & Reserved`;
    } else if (hospitalUpdate.bloodUnitsReserved) {
      logMsg = `[${timestamp}] Blood Bank Requisition: 2 Units O-Negative Pre-Matched`;
    }

    const updatedHospital = {
      ...this.state.dispatches.hospital,
      ...hospitalUpdate,
      logs: logMsg ? [logMsg, ...currentLogs] : currentLogs
    };

    this.state.dispatches.hospital = updatedHospital;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/dispatch`, { hospital: updatedHospital });
    this.notify();
  }

  updatePoliceDispatch(policeUpdate) {
    const timestamp = new Date().toLocaleTimeString();
    const currentLogs = this.state.dispatches.police.logs || [];
    let logMsg = '';

    if (policeUpdate.pcrStatus === 'dispatched') {
      logMsg = `[${timestamp}] PCR Interceptor Unit #07 Dispatched to NH-48 (ETA: 4 mins)`;
    } else if (policeUpdate.greenCorridorActive) {
      logMsg = `[${timestamp}] Green Corridor Traffic Synchronized: NH-48 -> AIIMS Trauma Center`;
    } else if (policeUpdate.hazardPerimeterSet) {
      logMsg = `[${timestamp}] Lane Barricades & Hazard Flares Deployed at KM 34.2`;
    } else if (policeUpdate.firGenerated) {
      logMsg = `[${timestamp}] Digital e-FIR FIR-2026-DEL-8821 Generated with MPU6050 Forensics`;
    }

    const updatedPolice = {
      ...this.state.dispatches.police,
      ...policeUpdate,
      logs: logMsg ? [logMsg, ...currentLogs] : currentLogs
    };

    this.state.dispatches.police = updatedPolice;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/dispatch`, { police: updatedPolice });
    this.notify();
  }

  resetDemoState(broadcast = true) {
    this.resetLocalState(broadcast);
    backendApi.abortEmergency(null, 'Reset from Terminal').catch(() => {});
  }

  resetLocalState(broadcast = true) {
    this.state.activeIncident = null;
    this.state.telemetry = {
      ...defaultTelemetryState,
      isEmergencyAlert: false,
      alertSeverity: '',
      alertReason: '',
      relayHornActive: false,
      stopButtonPressed: false
    };
    this.state.dispatches = {
      hospital: {
        ambulanceStatus: 'standby',
        ambulanceUnit: 'ALS 108 - Trauma Mobile ICU #12',
        ambulanceEtaMinutes: 8,
        icuBedReserved: false,
        icuBedNumber: 'Trauma Bay #04',
        bloodUnitsReserved: 0,
        bloodType: 'O+ (Positive)',
        hospitalName: 'AIIMS Apex Trauma Centre, New Delhi',
        dispatchedAt: null,
        logs: []
      },
      police: {
        pcrStatus: 'patrolling',
        pcrUnit: 'Highway Patrol Interceptor #07',
        pcrEtaMinutes: 4,
        greenCorridorActive: false,
        hazardPerimeterSet: false,
        firGenerated: false,
        firNumber: 'FIR-2026-DEL-8821',
        dispatchedAt: null,
        logs: []
      }
    };

    this.saveToLocalStorage();
    if (broadcast) {
      this.publishToCloud(`asaas/${this.roomId}/action`, { action: 'RESET_DEMO' });
    }
    this.notify();
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem(`asaas_state_${this.roomId}`, JSON.stringify({
        telemetry: {
          ...this.state.telemetry,
          isEmergencyAlert: false,
          alertSeverity: '',
          alertReason: '',
          relayHornActive: false,
          stopButtonPressed: false
        },
        activeIncident: null,
        dispatches: this.state.dispatches,
        vehicles: this.state.vehicles,
        selectedVehicleId: this.state.selectedVehicleId,
        medicalProfile: this.state.medicalProfile,
        emergencyContacts: this.state.emergencyContacts,
        hospitalBeds: this.state.hospitalBeds,
        hospitalAmbulances: this.state.hospitalAmbulances,
        bloodBankStock: this.state.bloodBankStock,
        hospitalDoctors: this.state.hospitalDoctors,
        hospitalTriageCases: this.state.hospitalTriageCases,
        hospitalIncidentRecords: this.state.hospitalIncidentRecords,
        hospitalEmergencyDirectory: this.state.hospitalEmergencyDirectory,
        policeInterceptors: this.state.policeInterceptors,
        policeFirRecords: this.state.policeFirRecords,
        policeDirectory: this.state.policeDirectory,
        trafficJunctions: this.state.trafficJunctions,
        hazardPerimeters: this.state.hazardPerimeters,
        familyMembers: this.state.familyMembers,
        selectedFamilyMemberId: this.state.selectedFamilyMemberId,
        geofenceZones: this.state.geofenceZones,
        familyTripLogs: this.state.familyTripLogs,
        guardianCircle: this.state.guardianCircle,
        guardianSettings: this.state.guardianSettings
      }));
    } catch (e) {}
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(`asaas_state_${this.roomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.telemetry) {
          // Never restore emergency alert state on a fresh page reload
          this.state.telemetry = { 
            ...this.state.telemetry, 
            ...parsed.telemetry,
            isEmergencyAlert: false,
            alertSeverity: '',
            alertReason: '',
            relayHornActive: false,
            stopButtonPressed: false
          };
        }
        // Always ensure activeIncident is null on reload
        this.state.activeIncident = null;
        if (parsed.dispatches) this.state.dispatches = parsed.dispatches;
        if (parsed.vehicles && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
          this.state.vehicles = parsed.vehicles;
        }
        if (parsed.selectedVehicleId) {
          this.state.selectedVehicleId = parsed.selectedVehicleId;
        }
        if (parsed.medicalProfile) {
          this.state.medicalProfile = {
            ...parsed.medicalProfile,
            allergies: normalizeArrayField(parsed.medicalProfile.allergies),
            medicalConditions: normalizeArrayField(parsed.medicalProfile.medicalConditions)
          };
        }
        // Ensure active incident remains null on reload so fresh session starts normal
        this.state.activeIncident = null;
        if (parsed.emergencyContacts && Array.isArray(parsed.emergencyContacts) && parsed.emergencyContacts.length > 0) {
          this.state.emergencyContacts = parsed.emergencyContacts;
        }
        if (parsed.hospitalBeds && Array.isArray(parsed.hospitalBeds) && parsed.hospitalBeds.length > 0) {
          this.state.hospitalBeds = parsed.hospitalBeds;
        }
        if (parsed.hospitalAmbulances && Array.isArray(parsed.hospitalAmbulances) && parsed.hospitalAmbulances.length > 0) {
          this.state.hospitalAmbulances = parsed.hospitalAmbulances;
        }
        if (parsed.bloodBankStock && Array.isArray(parsed.bloodBankStock) && parsed.bloodBankStock.length > 0) {
          this.state.bloodBankStock = parsed.bloodBankStock;
        }
        if (parsed.hospitalDoctors && Array.isArray(parsed.hospitalDoctors) && parsed.hospitalDoctors.length > 0) {
          this.state.hospitalDoctors = parsed.hospitalDoctors;
        }
        if (parsed.hospitalTriageCases && Array.isArray(parsed.hospitalTriageCases) && parsed.hospitalTriageCases.length > 0) {
          this.state.hospitalTriageCases = parsed.hospitalTriageCases;
        }
        if (parsed.hospitalIncidentRecords && Array.isArray(parsed.hospitalIncidentRecords) && parsed.hospitalIncidentRecords.length > 0) {
          this.state.hospitalIncidentRecords = parsed.hospitalIncidentRecords;
        }
        if (parsed.hospitalEmergencyDirectory && Array.isArray(parsed.hospitalEmergencyDirectory) && parsed.hospitalEmergencyDirectory.length > 0) {
          this.state.hospitalEmergencyDirectory = parsed.hospitalEmergencyDirectory;
        }
        if (parsed.policeInterceptors && Array.isArray(parsed.policeInterceptors) && parsed.policeInterceptors.length > 0) {
          this.state.policeInterceptors = parsed.policeInterceptors;
        }
        if (parsed.policeFirRecords && Array.isArray(parsed.policeFirRecords) && parsed.policeFirRecords.length > 0) {
          this.state.policeFirRecords = parsed.policeFirRecords;
        }
        if (parsed.policeDirectory && Array.isArray(parsed.policeDirectory) && parsed.policeDirectory.length > 0) {
          this.state.policeDirectory = parsed.policeDirectory;
        }
        if (parsed.trafficJunctions && Array.isArray(parsed.trafficJunctions) && parsed.trafficJunctions.length > 0) {
          this.state.trafficJunctions = parsed.trafficJunctions;
        }
        if (parsed.hazardPerimeters && Array.isArray(parsed.hazardPerimeters) && parsed.hazardPerimeters.length > 0) {
          this.state.hazardPerimeters = parsed.hazardPerimeters;
        }
        if (parsed.familyMembers && Array.isArray(parsed.familyMembers) && parsed.familyMembers.length > 0) {
          this.state.familyMembers = parsed.familyMembers;
        }
        if (parsed.selectedFamilyMemberId) {
          this.state.selectedFamilyMemberId = parsed.selectedFamilyMemberId;
        }
        if (parsed.geofenceZones && Array.isArray(parsed.geofenceZones) && parsed.geofenceZones.length > 0) {
          this.state.geofenceZones = parsed.geofenceZones;
        }
        if (parsed.familyTripLogs && Array.isArray(parsed.familyTripLogs) && parsed.familyTripLogs.length > 0) {
          this.state.familyTripLogs = parsed.familyTripLogs;
        }
        if (parsed.guardianCircle && Array.isArray(parsed.guardianCircle) && parsed.guardianCircle.length > 0) {
          this.state.guardianCircle = parsed.guardianCircle;
        }
        if (parsed.guardianSettings) {
          this.state.guardianSettings = { ...this.state.guardianSettings, ...parsed.guardianSettings };
        }
      }
    } catch (e) {}
  }

  // --- VEHICLE LIFECYCLE MANAGEMENT (CRUD) ---
  setVehicles(vehicles) {
    this.state.vehicles = vehicles;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles });
    this.notify();
  }

  addVehicle(newVehicle) {
    this.state.vehicles = [...this.state.vehicles, newVehicle];
    this.state.selectedVehicleId = newVehicle.id;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
    return newVehicle;
  }

  updateVehicle(vehicleId, updatedFields) {
    this.state.vehicles = this.state.vehicles.map(v => 
      v.id === vehicleId ? { ...v, ...updatedFields } : v
    );
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  deleteVehicle(vehicleId) {
    const remaining = this.state.vehicles.filter(v => v.id !== vehicleId);
    this.state.vehicles = remaining;
    if (this.state.selectedVehicleId === vehicleId && remaining.length > 0) {
      this.state.selectedVehicleId = remaining[0].id;
    }
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  setSelectedVehicleId(id) {
    this.state.selectedVehicleId = id;
    this.saveToLocalStorage();
    this.notify();
  }

  // --- DOCUMENT VAULT MANAGEMENT (CRUD) ---
  addDocument(vehicleId, doc) {
    this.state.vehicles = this.state.vehicles.map(v => {
      if (v.id === vehicleId) {
        return { ...v, documents: [...(v.documents || []), doc] };
      }
      return v;
    });
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  updateDocument(vehicleId, docId, updatedFields) {
    this.state.vehicles = this.state.vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          documents: (v.documents || []).map(d => d.id === docId ? { ...d, ...updatedFields } : d)
        };
      }
      return v;
    });
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  quickRenewDocument(vehicleId, docId, yearsToAdd = 1) {
    const today = new Date();
    const newExpiry = new Date(today.getFullYear() + yearsToAdd, today.getMonth(), today.getDate()).toISOString().split('T')[0];
    this.updateDocument(vehicleId, docId, {
      expiryDate: newExpiry,
      status: 'valid',
      daysLeft: null,
      daysAgo: null,
      renewedAt: new Date().toLocaleDateString()
    });
  }

  deleteDocument(vehicleId, docId) {
    this.state.vehicles = this.state.vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          documents: (v.documents || []).filter(d => d.id !== docId)
        };
      }
      return v;
    });
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  // --- MAINTENANCE & SERVICE LOGS (CRUD) ---
  addServiceLog(vehicleId, log) {
    this.state.vehicles = this.state.vehicles.map(v => {
      if (v.id === vehicleId) {
        const currentLogs = v.serviceHistory || [];
        const nextOdo = log.odometerKm ? Math.max(v.odometerKm || 0, log.odometerKm) : v.odometerKm;
        return { 
          ...v, 
          odometerKm: nextOdo,
          serviceHistory: [log, ...currentLogs] 
        };
      }
      return v;
    });
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  deleteServiceLog(vehicleId, logId) {
    this.state.vehicles = this.state.vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          serviceHistory: (v.serviceHistory || []).filter(s => s.id !== logId)
        };
      }
      return v;
    });
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/vehicles`, { vehicles: this.state.vehicles });
    this.notify();
  }

  // --- DRIVER PROFILE & CONTACTS ---
  updateMedicalProfile(profile) {
    this.state.medicalProfile = profile;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/medical`, { medicalProfile: profile });
    this.notify();
  }

  updateEmergencyContacts(contacts) {
    this.state.emergencyContacts = contacts;
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/contacts`, { emergencyContacts: contacts });
    this.notify();
  }

  // --- HOSPITAL ER & TRAUMA OPERATIONS (CRUD) ---

  broadcastHospitalOps() {
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/hospital_ops`, {
      hospitalBeds: this.state.hospitalBeds,
      hospitalAmbulances: this.state.hospitalAmbulances,
      bloodBankStock: this.state.bloodBankStock,
      hospitalDoctors: this.state.hospitalDoctors,
      hospitalTriageCases: this.state.hospitalTriageCases,
      hospitalIncidentRecords: this.state.hospitalIncidentRecords,
      hospitalEmergencyDirectory: this.state.hospitalEmergencyDirectory
    });
    this.notify();
  }

  // Hospital Beds
  addHospitalBed(newBed) {
    const bed = {
      id: newBed.id || `bed-${Date.now()}`,
      name: newBed.name || 'Trauma Bay',
      ward: newBed.ward || 'Trauma Resuscitation Unit',
      status: newBed.status || 'available',
      patientName: newBed.patientName || null,
      patientAge: newBed.patientAge || null,
      attendingDoctor: newBed.attendingDoctor || 'Unassigned',
      equipment: newBed.equipment || ['Multi-para Monitor', 'Oxygen Support'],
      oxygenSupport: newBed.oxygenSupport !== false,
      lastSanitized: newBed.lastSanitized || 'Sterilized & Ready'
    };
    this.state.hospitalBeds = [...this.state.hospitalBeds, bed];
    this.broadcastHospitalOps();
    return bed;
  }

  updateHospitalBed(bedId, updatedFields) {
    this.state.hospitalBeds = this.state.hospitalBeds.map(b =>
      b.id === bedId ? { ...b, ...updatedFields } : b
    );
    this.broadcastHospitalOps();
  }

  releaseHospitalBed(bedId) {
    this.state.hospitalBeds = this.state.hospitalBeds.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: 'available',
          patientName: null,
          patientAge: null,
          attendingDoctor: 'Unassigned',
          lastSanitized: `Sanitized & Disinfected (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        };
      }
      return b;
    });
    this.broadcastHospitalOps();
  }

  deleteHospitalBed(bedId) {
    this.state.hospitalBeds = this.state.hospitalBeds.filter(b => b.id !== bedId);
    this.broadcastHospitalOps();
  }

  // Hospital Ambulances
  addAmbulance(newAmb) {
    const ambulance = {
      id: newAmb.id || `amb-${Date.now()}`,
      unitNumber: newAmb.unitNumber || 'ALS 108 Mobile ICU',
      type: newAmb.type || 'Advanced Life Support (ALS)',
      plateNumber: newAmb.plateNumber || 'DL-01-XX-0000',
      driverName: newAmb.driverName || 'Duty Paramedic',
      driverPhone: newAmb.driverPhone || '+91 98000 00000',
      emtLead: newAmb.emtLead || 'Paramedic Staff',
      status: newAmb.status || 'standby',
      currentLocation: newAmb.currentLocation || 'Hospital Ambulance Bay',
      etaMinutes: Number(newAmb.etaMinutes) || 10,
      equipment: newAmb.equipment || ['Oxygen 2000L', 'Defibrillator', 'Stretcher']
    };
    this.state.hospitalAmbulances = [...this.state.hospitalAmbulances, ambulance];
    this.broadcastHospitalOps();
    return ambulance;
  }

  updateAmbulanceStatus(ambId, updatedFields) {
    this.state.hospitalAmbulances = this.state.hospitalAmbulances.map(a =>
      a.id === ambId ? { ...a, ...updatedFields } : a
    );
    this.broadcastHospitalOps();
  }

  deleteAmbulance(ambId) {
    this.state.hospitalAmbulances = this.state.hospitalAmbulances.filter(a => a.id !== ambId);
    this.broadcastHospitalOps();
  }

  // Blood Bank Stock
  updateBloodStock(group, unitsValue, isDelta = false) {
    this.state.bloodBankStock = this.state.bloodBankStock.map(item => {
      if (item.group === group) {
        const newUnits = Math.max(0, isDelta ? item.units + unitsValue : unitsValue);
        let status = 'optimal';
        if (newUnits <= 4) status = 'critical';
        else if (newUnits <= 8) status = 'warning';
        return {
          ...item,
          units: newUnits,
          status
        };
      }
      return item;
    });
    this.broadcastHospitalOps();
  }

  requisitionBlood(group, units, patientName = 'Emergency Patient', reason = 'Trauma Resuscitation') {
    const item = this.state.bloodBankStock.find(b => b.group === group);
    if (!item || item.units < units) {
      return { success: false, message: `Insufficient units for ${group}` };
    }
    this.updateBloodStock(group, -units, true);
    return { success: true, message: `Requisitioned ${units} units of ${group} for ${patientName}` };
  }

  // Hospital Doctors
  addDoctor(newDoc) {
    const doctor = {
      id: newDoc.id || `doc-${Date.now()}`,
      name: newDoc.name || 'Dr. Specialist',
      role: newDoc.role || 'Senior Trauma Specialist',
      specialty: newDoc.specialty || 'Critical Care',
      pagerId: newDoc.pagerId || `PAGER-${Math.floor(100 + Math.random() * 900)}`,
      phone: newDoc.phone || '+91 98000 11111',
      dutyStatus: newDoc.dutyStatus || 'on-duty',
      room: newDoc.room || 'Trauma Bay #01',
      casesToday: Number(newDoc.casesToday) || 0
    };
    this.state.hospitalDoctors = [...this.state.hospitalDoctors, doctor];
    this.broadcastHospitalOps();
    return doctor;
  }

  updateDoctorStatus(docId, updatedFields) {
    this.state.hospitalDoctors = this.state.hospitalDoctors.map(d =>
      d.id === docId ? { ...d, ...updatedFields } : d
    );
    this.broadcastHospitalOps();
  }

  deleteDoctor(docId) {
    this.state.hospitalDoctors = this.state.hospitalDoctors.filter(d => d.id !== docId);
    this.broadcastHospitalOps();
  }

  // Hospital Triage Cases
  addTriageCase(newCase) {
    const triageCase = {
      id: newCase.id || `CAS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      date: newCase.date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      patientName: newCase.patientName || 'Unknown Trauma Patient',
      age: newCase.age || 30,
      gender: newCase.gender || 'Unknown',
      bloodGroup: newCase.bloodGroup || 'Unknown',
      gcsScore: newCase.gcsScore || 15,
      triageTag: newCase.triageTag || 'RED',
      vitals: newCase.vitals || 'BP 120/80, HR 80, SpO2 98%',
      crashMechanism: newCase.crashMechanism || 'Impact Crash',
      assignedBay: newCase.assignedBay || 'Trauma Bay #04',
      attendingDoctor: newCase.attendingDoctor || 'Dr. Rohan Sharma',
      status: newCase.status || 'Admitted & Bay Reserved'
    };
    this.state.hospitalTriageCases = [triageCase, ...this.state.hospitalTriageCases];
    this.broadcastHospitalOps();
    return triageCase;
  }

  updateTriageCase(caseId, updatedFields) {
    this.state.hospitalTriageCases = this.state.hospitalTriageCases.map(c =>
      c.id === caseId ? { ...c, ...updatedFields } : c
    );
    this.broadcastHospitalOps();
  }

  // Hospital Incident & Medico-Legal Records (MLC)
  addHospitalIncidentRecord(newRecord) {
    const record = {
      id: newRecord.id || `INC-AIIMS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      mlcNumber: newRecord.mlcNumber || `MLC/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: newRecord.date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      hospitalName: newRecord.hospitalName || 'AIIMS Apex Trauma Centre, New Delhi',
      patientName: newRecord.patientName || 'Unknown Trauma Victim',
      age: newRecord.age || 30,
      gender: newRecord.gender || 'Unknown',
      bloodGroup: newRecord.bloodGroup || 'O+',
      severity: newRecord.severity || 'CRITICAL',
      triageCategory: newRecord.triageCategory || 'RED (Immediate)',
      peakGForce: newRecord.peakGForce || '4.50g',
      speedAtImpact: newRecord.speedAtImpact || '60 km/h',
      collisionType: newRecord.collisionType || 'High-Deceleration Impact',
      assignedBay: newRecord.assignedBay || 'Trauma Bay #04',
      attendingSurgeon: newRecord.attendingSurgeon || 'Dr. Rohan Sharma (Chief Surgeon)',
      ambulanceUnit: newRecord.ambulanceUnit || 'ALS 108 Mobile ICU #12',
      bloodUnitsUsed: newRecord.bloodUnitsUsed || '2 Units O+ Packed Cells',
      policeStationIntimation: newRecord.policeStationIntimation || 'Highway Patrol Control Room',
      surgicalStatus: newRecord.surgicalStatus || 'Emergency Intervention Underway',
      admissionStatus: newRecord.admissionStatus || 'Admitted to Trauma Resuscitation',
      notes: newRecord.notes || 'Emergency admission via ASAAS telemetry alert network.'
    };
    this.state.hospitalIncidentRecords = [record, ...this.state.hospitalIncidentRecords];
    this.broadcastHospitalOps();
    return record;
  }

  updateHospitalIncidentRecord(recordId, updatedFields) {
    this.state.hospitalIncidentRecords = this.state.hospitalIncidentRecords.map(r =>
      r.id === recordId ? { ...r, ...updatedFields } : r
    );
    this.broadcastHospitalOps();
  }

  deleteHospitalIncidentRecord(recordId) {
    this.state.hospitalIncidentRecords = this.state.hospitalIncidentRecords.filter(r => r.id !== recordId);
    this.broadcastHospitalOps();
  }

  // Hospital Emergency Directory & Medical Extensions
  addHospitalDirectoryContact(newContact) {
    const contact = {
      id: newContact.id || `hed-${Date.now()}`,
      department: newContact.department || 'Hospital Department',
      role: newContact.role || 'Emergency Response Lead',
      extension: newContact.extension || `Ext. ${Math.floor(100 + Math.random() * 900)}`,
      directPhone: newContact.directPhone || '+91 11 2659 0000',
      mobile: newContact.mobile || '+91 98765 00000',
      location: newContact.location || 'Trauma Center Main Building',
      inCharge: newContact.inCharge || 'Duty Officer',
      dutyStatus: newContact.dutyStatus || 'Active 24x7',
      badgeColor: newContact.badgeColor || '#3b82f6'
    };
    this.state.hospitalEmergencyDirectory = [...this.state.hospitalEmergencyDirectory, contact];
    this.broadcastHospitalOps();
    return contact;
  }

  updateHospitalDirectoryContact(contactId, updatedFields) {
    this.state.hospitalEmergencyDirectory = this.state.hospitalEmergencyDirectory.map(c =>
      c.id === contactId ? { ...c, ...updatedFields } : c
    );
    this.broadcastHospitalOps();
  }

  deleteHospitalDirectoryContact(contactId) {
    this.state.hospitalEmergencyDirectory = this.state.hospitalEmergencyDirectory.filter(c => c.id !== contactId);
    this.broadcastHospitalOps();
  }

  // --- POLICE HIGHWAY PATROL & TRAFFIC OPERATIONS (CRUD) ---

  broadcastPoliceOps() {
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/police_ops`, {
      policeInterceptors: this.state.policeInterceptors,
      policeFirRecords: this.state.policeFirRecords,
      policeDirectory: this.state.policeDirectory,
      trafficJunctions: this.state.trafficJunctions,
      hazardPerimeters: this.state.hazardPerimeters
    });
    this.notify();
  }

  // PCR Interceptor Fleet Management
  addPoliceInterceptor(newPcr) {
    const interceptor = {
      id: newPcr.id || `pcr-${Date.now()}`,
      callSign: newPcr.callSign || 'Highway Patrol Unit',
      plateNumber: newPcr.plateNumber || 'DL-01-GP-0000',
      vehicleModel: newPcr.vehicleModel || 'Tata Safari Stealth (Police Pursuit)',
      officerInCharge: newPcr.officerInCharge || 'Duty Sub-Inspector',
      officerPhone: newPcr.officerPhone || '+91 98000 77000',
      assignedSector: newPcr.assignedSector || 'NH-48 Expressway Sector',
      status: newPcr.status || 'patrolling',
      speedRadar: newPcr.speedRadar || 'Active (Radar Gun)',
      equipment: newPcr.equipment || ['Radar Gun', 'Breathalyzer', 'Emergency Flares'],
      currentLocation: newPcr.currentLocation || 'Highway Patrol Bay',
      etaMinutes: Number(newPcr.etaMinutes) || 5
    };
    this.state.policeInterceptors = [...this.state.policeInterceptors, interceptor];
    this.broadcastPoliceOps();
    return interceptor;
  }

  updatePoliceInterceptor(pcrId, updatedFields) {
    this.state.policeInterceptors = this.state.policeInterceptors.map(p =>
      p.id === pcrId ? { ...p, ...updatedFields } : p
    );
    this.broadcastPoliceOps();
  }

  deletePoliceInterceptor(pcrId) {
    this.state.policeInterceptors = this.state.policeInterceptors.filter(p => p.id !== pcrId);
    this.broadcastPoliceOps();
  }

  // Police Accident e-FIR Records
  addPoliceFirRecord(newFir) {
    const fir = {
      id: newFir.id || `FIR-${new Date().getFullYear()}-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      firNumber: newFir.firNumber || `FIR No. ${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
      date: newFir.date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      policeStation: newFir.policeStation || 'Sector 04 PCR Highway Command, NH-48',
      district: newFir.district || 'South-West District, Delhi Police',
      incidentLocation: newFir.incidentLocation || 'NH-48 Expressway, KM 34.2',
      complainantName: newFir.complainantName || 'State (Suo Motu via ASAAS IoT Crash Sensor)',
      accusedDriver: newFir.accusedDriver || 'Unknown Driver',
      investigatingOfficer: newFir.investigatingOfficer || 'Inspector Vikram Malhotra (IO #4421)',
      ioPhone: newFir.ioPhone || '+91 98111 77007',
      legalSections: newFir.legalSections || 'Sec 279 IPC / BNS 281 (Rash Driving)',
      peakGForce: newFir.peakGForce || '4.80g',
      speedAtImpact: newFir.speedAtImpact || '65 km/h',
      status: newFir.status || 'Investigation Underway',
      evidenceSummary: newFir.evidenceSummary || 'Automated sensor evidence collected at accident location.',
      impoundedVehicle: newFir.impoundedVehicle || 'Vehicle at Scene',
      alcoholTestResult: newFir.alcoholTestResult || 'Negative (0.00% BAC)',
      hospitalReference: newFir.hospitalReference || 'MLC Intake Registered'
    };
    this.state.policeFirRecords = [fir, ...this.state.policeFirRecords];
    this.broadcastPoliceOps();
    return fir;
  }

  updatePoliceFirRecord(firId, updatedFields) {
    this.state.policeFirRecords = this.state.policeFirRecords.map(f =>
      f.id === firId ? { ...f, ...updatedFields } : f
    );
    this.broadcastPoliceOps();
  }

  deletePoliceFirRecord(firId) {
    this.state.policeFirRecords = this.state.policeFirRecords.filter(f => f.id !== firId);
    this.broadcastPoliceOps();
  }

  // Police Emergency Directory & Stations
  addPoliceDirectoryContact(newContact) {
    const contact = {
      id: newContact.id || `pdir-${Date.now()}`,
      unitName: newContact.unitName || 'Police Highway Post',
      role: newContact.role || 'Traffic & Patrol Desk',
      extension: newContact.extension || `Ext. ${Math.floor(100 + Math.random() * 900)}`,
      directPhone: newContact.directPhone || '+91 11 2346 0000',
      mobile: newContact.mobile || '+91 98000 00112',
      location: newContact.location || 'Expressway Post',
      officerInCharge: newContact.officerInCharge || 'Duty Officer',
      dutyStatus: newContact.dutyStatus || 'Active 24x7',
      category: newContact.category || 'Patrol Base'
    };
    this.state.policeDirectory = [...this.state.policeDirectory, contact];
    this.broadcastPoliceOps();
    return contact;
  }

  updatePoliceDirectoryContact(contactId, updatedFields) {
    this.state.policeDirectory = this.state.policeDirectory.map(c =>
      c.id === contactId ? { ...c, ...updatedFields } : c
    );
    this.broadcastPoliceOps();
  }

  deletePoliceDirectoryContact(contactId) {
    this.state.policeDirectory = this.state.policeDirectory.filter(c => c.id !== contactId);
    this.broadcastPoliceOps();
  }

  // Green Corridor Junction Preemption
  toggleTrafficJunction(junctionId) {
    this.state.trafficJunctions = this.state.trafficJunctions.map(j => {
      if (j.id === junctionId) {
        return {
          ...j,
          status: j.status === 'preempted' ? 'normal' : 'preempted'
        };
      }
      return j;
    });
    this.broadcastPoliceOps();
  }

  // Hazard Perimeter Management
  addHazardPerimeter(newHp) {
    const hp = {
      id: newHp.id || `hp-${Date.now()}`,
      location: newHp.location || 'Expressway Sector',
      lanesBlocked: newHp.lanesBlocked || ['Lane 1 (Fast Lane)'],
      openLanes: newHp.openLanes || ['Lane 2', 'Lane 3'],
      vmsSpeedLimit: newHp.vmsSpeedLimit || '30 km/h',
      flaresDeployed: Number(newHp.flaresDeployed) || 6,
      coneBarrierLengthMeters: Number(newHp.coneBarrierLengthMeters) || 100,
      status: newHp.status || 'ACTIVE',
      setupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state.hazardPerimeters = [...this.state.hazardPerimeters, hp];
    this.broadcastPoliceOps();
    return hp;
  }

  updateHazardPerimeter(id, updatedFields) {
    this.state.hazardPerimeters = this.state.hazardPerimeters.map(h =>
      h.id === id ? { ...h, ...updatedFields } : h
    );
    this.broadcastPoliceOps();
  }

  // --- GUARDIAN & FAMILY SAFETY MANAGEMENT ---
  broadcastGuardianOps() {
    this.saveToLocalStorage();
    this.publishToCloud(`asaas/${this.roomId}/guardian_ops`, {
      familyMembers: this.state.familyMembers,
      geofenceZones: this.state.geofenceZones,
      familyTripLogs: this.state.familyTripLogs,
      guardianCircle: this.state.guardianCircle,
      guardianSettings: this.state.guardianSettings
    });
    this.notify();
  }

  // Family Members CRUD
  addFamilyMember(newMember) {
    const member = {
      id: newMember.id || `fam-${Date.now()}`,
      name: newMember.name || 'Family Member',
      relation: newMember.relation || 'Dependent',
      avatar: newMember.avatar || '👤',
      phone: newMember.phone || '+91 98000 00000',
      email: newMember.email || '',
      vehicleName: newMember.vehicleName || 'Personal Vehicle',
      vehiclePlate: newMember.vehiclePlate || 'DL-01-XX-0000',
      vehicleType: newMember.vehicleType || 'four-wheeler',
      currentStatus: 'Safe (Parked)',
      currentSpeedKmh: 0,
      lastLocation: newMember.lastLocation || 'Home Safe Zone',
      batteryLevel: 100,
      activeSafeZone: 'Home Sanctuary',
      bloodGroup: newMember.bloodGroup || 'O+',
      isPrimary: false
    };
    this.state.familyMembers = [...this.state.familyMembers, member];
    this.broadcastGuardianOps();
    return member;
  }

  updateFamilyMember(id, updatedFields) {
    this.state.familyMembers = this.state.familyMembers.map(m =>
      m.id === id ? { ...m, ...updatedFields } : m
    );
    this.broadcastGuardianOps();
  }

  deleteFamilyMember(id) {
    this.state.familyMembers = this.state.familyMembers.filter(m => m.id !== id);
    if (this.state.selectedFamilyMemberId === id && this.state.familyMembers.length > 0) {
      this.state.selectedFamilyMemberId = this.state.familyMembers[0].id;
    }
    this.broadcastGuardianOps();
  }

  setSelectedFamilyMember(id) {
    this.state.selectedFamilyMemberId = id;
    this.saveToLocalStorage();
    this.notify();
  }

  // Geofence Safe Zones CRUD
  addGeofenceZone(newZone) {
    const zone = {
      id: newZone.id || `geo-${Date.now()}`,
      name: newZone.name || 'New Safe Zone',
      address: newZone.address || 'Address Location',
      radiusMeters: Number(newZone.radiusMeters) || 500,
      category: newZone.category || 'General',
      color: newZone.color || '#10b981',
      alertOnExit: newZone.alertOnExit !== false,
      alertOnEntry: newZone.alertOnEntry !== false,
      status: 'ACTIVE',
      activeOccupants: [],
      coordinates: newZone.coordinates || { lat: 28.4595, lng: 77.0266 }
    };
    this.state.geofenceZones = [...this.state.geofenceZones, zone];
    this.broadcastGuardianOps();
    return zone;
  }

  updateGeofenceZone(id, updatedFields) {
    this.state.geofenceZones = this.state.geofenceZones.map(z =>
      z.id === id ? { ...z, ...updatedFields } : z
    );
    this.broadcastGuardianOps();
  }

  deleteGeofenceZone(id) {
    this.state.geofenceZones = this.state.geofenceZones.filter(z => z.id !== id);
    this.broadcastGuardianOps();
  }

  toggleGeofenceZone(id) {
    this.state.geofenceZones = this.state.geofenceZones.map(z =>
      z.id === id ? { ...z, status: z.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : z
    );
    this.broadcastGuardianOps();
  }

  // Trip Log Management
  addFamilyTripLog(newTrip) {
    const trip = {
      id: newTrip.id || `trip-${Date.now()}`,
      memberName: newTrip.memberName || 'Alex Mercer',
      vehicle: newTrip.vehicle || 'Hyundai Creta [DL-01-AB-1234]',
      date: newTrip.date || 'Today, Just Now',
      startLocation: newTrip.startLocation || 'Departure Point',
      endLocation: newTrip.endLocation || 'Destination Point',
      distanceKm: Number(newTrip.distanceKm) || 5.0,
      durationMins: Number(newTrip.durationMins) || 15,
      maxSpeedKmh: Number(newTrip.maxSpeedKmh) || 60,
      avgSpeedKmh: Number(newTrip.avgSpeedKmh) || 35,
      harshEvents: Number(newTrip.harshEvents) || 0,
      safetyScore: Number(newTrip.safetyScore) || 95,
      status: newTrip.status || 'Completed Safely'
    };
    this.state.familyTripLogs = [trip, ...this.state.familyTripLogs];
    this.broadcastGuardianOps();
    return trip;
  }

  // Guardian Circle Contacts CRUD
  addGuardianCircleContact(newContact) {
    const contact = {
      id: newContact.id || `gc-${Date.now()}`,
      name: newContact.name || 'Emergency Contact',
      relation: newContact.relation || 'Family Contact',
      phone: newContact.phone || '',
      alternatePhone: newContact.alternatePhone || '',
      email: newContact.email || '',
      priority: newContact.priority || 'Secondary Contact',
      notifySms: newContact.notifySms !== false,
      notifyCall: newContact.notifyCall || false,
      avatar: newContact.avatar || '👥'
    };
    this.state.guardianCircle = [...this.state.guardianCircle, contact];
    this.broadcastGuardianOps();
    return contact;
  }

  updateGuardianCircleContact(id, updatedFields) {
    this.state.guardianCircle = this.state.guardianCircle.map(c =>
      c.id === id ? { ...c, ...updatedFields } : c
    );
    this.broadcastGuardianOps();
  }

  deleteGuardianCircleContact(id) {
    this.state.guardianCircle = this.state.guardianCircle.filter(c => c.id !== id);
    this.broadcastGuardianOps();
  }

  // Guardian Preferences
  updateGuardianSettings(updates) {
    this.state.guardianSettings = { ...this.state.guardianSettings, ...updates };
    this.broadcastGuardianOps();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error in cloudDbEngine subscriber:', e);
      }
    }
  }

  getState() {
    return this.state;
  }
}

// Global Singleton Instance
export const cloudDb = new CloudDbEngine();
export default cloudDb;

