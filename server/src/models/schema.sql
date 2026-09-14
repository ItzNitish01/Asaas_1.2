-- ASAAS Production Relational Database Schema
-- Compatible with SQLite3 and PostgreSQL

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL UNIQUE,
  vehicle_type TEXT DEFAULT 'Car',
  fuel_type TEXT DEFAULT 'Petrol',
  status TEXT DEFAULT 'Active',
  driver_name TEXT,
  blood_group TEXT,
  insurance_policy TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  speed_kmh REAL DEFAULT 0,
  accel_x REAL DEFAULT 0,
  accel_y REAL DEFAULT 0,
  accel_z REAL DEFAULT 0,
  total_g REAL DEFAULT 1.0,
  pitch_deg REAL DEFAULT 0,
  roll_deg REAL DEFAULT 0,
  lat REAL DEFAULT 28.4595,
  lng REAL DEFAULT 77.0266,
  gps_sats INTEGER DEFAULT 8,
  battery_percent INTEGER DEFAULT 90,
  gsm_dbm INTEGER DEFAULT -70,
  sos_button TEXT DEFAULT 'RELEASED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  blood_group TEXT NOT NULL,
  abha_id TEXT,
  emergency_notes TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  primary_physician_name TEXT,
  primary_physician_phone TEXT,
  organ_donor INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  notify_sms INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT,
  device_id TEXT NOT NULL,
  severity TEXT DEFAULT 'CRITICAL',
  reason TEXT,
  peak_g_force TEXT,
  speed_at_impact TEXT,
  location_name TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  status TEXT DEFAULT 'Emergency Active (Dispatches In Progress)',
  patient_snapshot TEXT, -- JSON snapshot of medical profile
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispatches (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  hospital_name TEXT,
  ambulance_status TEXT DEFAULT 'standby',
  ambulance_unit TEXT,
  ambulance_eta_minutes INTEGER DEFAULT 8,
  icu_bed_number TEXT,
  icu_bed_reserved INTEGER DEFAULT 0,
  blood_units_reserved INTEGER DEFAULT 0,
  blood_type TEXT,
  police_station_name TEXT,
  pcr_status TEXT DEFAULT 'patrolling',
  pcr_unit TEXT,
  pcr_eta_minutes INTEGER DEFAULT 4,
  green_corridor_active INTEGER DEFAULT 0,
  hazard_perimeter_set INTEGER DEFAULT 0,
  fir_generated INTEGER DEFAULT 0,
  fir_number TEXT,
  logs TEXT, -- JSON array of timestamped activity logs
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Trauma Center Level 1',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  phone TEXT,
  total_icu_beds INTEGER DEFAULT 20,
  available_icu_beds INTEGER DEFAULT 6,
  blood_bank_status TEXT DEFAULT 'Adequate',
  ambulance_fleet_count INTEGER DEFAULT 8
);

CREATE TABLE IF NOT EXISTS police_stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  phone TEXT,
  active_interceptors INTEGER DEFAULT 5,
  pcr_code TEXT DEFAULT 'PCR-112'
);

CREATE TABLE IF NOT EXISTS fir_records (
  id TEXT PRIMARY KEY,
  fir_number TEXT NOT NULL UNIQUE,
  incident_id TEXT NOT NULL,
  vehicle_plate TEXT,
  investigating_officer TEXT,
  sections_applied TEXT,
  status TEXT DEFAULT 'Automated Digital e-FIR Filed',
  evidence_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
