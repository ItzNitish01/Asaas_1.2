import sqlite3 from 'sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const isPostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
let dbInstance = null;

export const initDatabase = async () => {
  if (isPostgres) {
    console.log('[DB] Connecting to Remote PostgreSQL Database...');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Execute schema for PostgreSQL
    const schemaSql = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf-8');
    // Replace AUTOINCREMENT with SERIAL for Postgres compatibility
    const pgSchema = schemaSql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    
    await pool.query(pgSchema);
    console.log('[DB] PostgreSQL Schema Verified.');
    
    dbInstance = {
      type: 'postgres',
      query: (text, params) => pool.query(text, params),
      all: async (text, params = []) => {
        const res = await pool.query(text, params);
        return res.rows;
      },
      get: async (text, params = []) => {
        const res = await pool.query(text, params);
        return res.rows[0];
      },
      run: async (text, params = []) => {
        const res = await pool.query(text, params);
        return { changes: res.rowCount };
      }
    };
    return dbInstance;
  } else {
    // Local SQLite database (persists in server/data/asaas.db)
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'asaas.db');
    console.log(`[DB] Using Persistent SQLite Database at: ${dbPath}`);

    const sqliteDb = new sqlite3.Database(dbPath);

    const schemaSql = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf-8');
    
    await new Promise((resolve, reject) => {
      sqliteDb.exec(schemaSql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log('[DB] SQLite Schema Verified.');

    dbInstance = {
      type: 'sqlite',
      all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      },
      get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          sqliteDb.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      },
      run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          sqliteDb.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      }
    };

    // Seed default baseline data if empty
    await seedBaselineData(dbInstance);

    return dbInstance;
  }
};

async function seedBaselineData(db) {
  try {
    const existingVehicles = await db.all('SELECT id FROM vehicles');
    if (existingVehicles.length === 0) {
      console.log('[DB] Seeding baseline emergency fleet, hospital, and vehicle registry...');
      
      // Default Vehicle
      await db.run(`
        INSERT INTO vehicles (id, name, registration_number, device_id, vehicle_type, fuel_type, driver_name, blood_group, insurance_policy)
        VALUES ('v1', 'Hyundai Creta SX (O) Turbo', 'DL-01-AB-4321', 'ASAAS-001', 'Compact SUV', 'Petrol Turbo', 'Aaradhya Sharma', 'O+ (Positive)', 'ICICI-LOMBARD-POL-88219')
      `);

      // Medical Profile
      await db.run(`
        INSERT INTO medical_profiles (id, user_id, full_name, age, gender, blood_group, abha_id, emergency_notes, allergies, medical_conditions, primary_physician_name, primary_physician_phone, organ_donor)
        VALUES ('med-1', 'u1', 'Aaradhya Sharma', 26, 'Male', 'O+ (Positive)', '91-8823-4412-9012', 'Severe allergy to Penicillin. Wear medic alert bracelet.', 'Penicillin, Sulfa drugs', 'Mild Asthmatic (inhaler carried)', 'Dr. Sunita Varma', '+91 98112 34567', 1)
      `);

      // Emergency Contacts
      await db.run(`
        INSERT INTO emergency_contacts (id, user_id, name, relation, phone, is_primary, notify_sms)
        VALUES 
          ('ec-1', 'u1', 'Col. Rajesh Sharma', 'Father', '+91 98765 43210', 1, 1),
          ('ec-2', 'u1', 'Dr. Meenakshi Sharma', 'Mother', '+91 98111 22334', 0, 1),
          ('ec-3', 'u1', 'Pooja Sharma', 'Sister / Guardian', '+91 98450 99887', 0, 1)
      `);

      // Hospitals
      await db.run(`
        INSERT INTO hospitals (id, name, type, lat, lng, phone, total_icu_beds, available_icu_beds, blood_bank_status)
        VALUES 
          ('hosp-1', 'AIIMS Apex Trauma Centre, New Delhi', 'Trauma Center Level 1', 28.5672, 77.2100, '+91 11 2659 8600', 40, 12, 'O+, B+, A+ Stock Full'),
          ('hosp-2', 'Medanta - The Medicity, Gurugram', 'Multi-Super Specialty & Trauma', 28.4394, 77.0423, '+91 124 414 1414', 65, 18, 'All Units Adequate'),
          ('hosp-3', 'Fortis Memorial Research Institute (FMRI)', 'Level 1 Emergency Center', 28.4595, 77.0726, '+91 124 496 2200', 35, 9, 'Adequate')
      `);

      // Police Stations
      await db.run(`
        INSERT INTO police_stations (id, name, division, lat, lng, phone, active_interceptors, pcr_code)
        VALUES 
          ('pol-1', 'Sushant Lok Police Station & PCR Hub', 'Gurugram East Division', 28.4682, 77.0782, '+91 124 238 5100', 6, 'PCR-GGM-112'),
          ('pol-2', 'DLF Phase-2 Traffic Police Post', 'Highway Traffic Zone 3', 28.4900, 77.0890, '+91 124 256 0100', 4, 'PCR-GGM-07')
      `);

      console.log('[DB] Baseline Data Seeded Successfully.');
    }
  } catch (err) {
    console.error('[DB] Seeding error:', err);
  }
}

export const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized! Call initDatabase() first.');
  }
  return dbInstance;
};
