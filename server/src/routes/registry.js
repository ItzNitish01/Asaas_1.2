import express from 'express';
import { getDb } from '../config/db.js';

const router = express.Router();

// --- Vehicles ---
router.get('/vehicles', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM vehicles');
    res.json({ status: 'SUCCESS', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

router.post('/vehicles', async (req, res) => {
  try {
    const { id = `v-${Date.now()}`, name, registration_number, device_id, vehicle_type, fuel_type, driver_name, blood_group, insurance_policy } = req.body;
    const db = getDb();
    await db.run(`
      INSERT INTO vehicles (id, name, registration_number, device_id, vehicle_type, fuel_type, driver_name, blood_group, insurance_policy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, registration_number, device_id, vehicle_type, fuel_type, driver_name, blood_group, insurance_policy]);
    res.status(201).json({ status: 'SUCCESS', message: 'Vehicle registered' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// --- Medical Profile ---
router.get('/medical', async (req, res) => {
  try {
    const db = getDb();
    const profile = await db.get('SELECT * FROM medical_profiles LIMIT 1');
    res.json({ status: 'SUCCESS', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

router.put('/medical', async (req, res) => {
  try {
    const { full_name, age, gender, blood_group, abha_id, emergency_notes, allergies, medical_conditions, primary_physician_name, primary_physician_phone, organ_donor } = req.body;
    const db = getDb();
    await db.run(`
      UPDATE medical_profiles 
      SET full_name = ?, age = ?, gender = ?, blood_group = ?, abha_id = ?, emergency_notes = ?, allergies = ?, medical_conditions = ?, primary_physician_name = ?, primary_physician_phone = ?, organ_donor = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 'med-1'
    `, [full_name, age, gender, blood_group, abha_id, emergency_notes, allergies, medical_conditions, primary_physician_name, primary_physician_phone, organ_donor ? 1 : 0]);
    res.json({ status: 'SUCCESS', message: 'Medical profile updated' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// --- Emergency Contacts ---
router.get('/contacts', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM emergency_contacts ORDER BY is_primary DESC');
    res.json({ status: 'SUCCESS', data: rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    const { id = `ec-${Date.now()}`, user_id = 'u1', name, relation, phone, is_primary = 0, notify_sms = 1 } = req.body;
    const db = getDb();
    await db.run(`
      INSERT INTO emergency_contacts (id, user_id, name, relation, phone, is_primary, notify_sms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, user_id, name, relation, phone, is_primary ? 1 : 0, notify_sms ? 1 : 0]);
    res.status(201).json({ status: 'SUCCESS', message: 'Contact added' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

export default router;
