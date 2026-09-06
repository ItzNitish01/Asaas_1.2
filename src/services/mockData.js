export const initialVehicles = [
  {
    id: 'v1',
    name: 'Hyundai Creta SX (O) Turbo',
    type: 'four-wheeler',
    registrationNumber: 'DL-01-AB-4321',
    vin: 'MALC341C89M203912',
    color: 'Titan Grey',
    espDeviceId: 'ASAAS-001',
    firmwareVersion: 'v2.4.1-OTA',
    status: 'online',
    lastSync: 'Just now',
    documents: [
      { id: 'd1', title: 'Registration Certificate (RC)', number: 'DL012023004921', issueDate: '2023-04-12', expiryDate: '2038-04-11', status: 'valid', fileUrl: '#' },
      { id: 'd2', title: 'Motor Insurance Policy (HDFC Ergo)', number: 'POL-9928104', issueDate: '2025-09-15', expiryDate: '2026-09-14', status: 'expiring_soon', daysLeft: 12, fileUrl: '#' },
      { id: 'd3', title: 'PUC Certificate (Pollution)', number: 'PUC-DEL-88210', issueDate: '2026-02-28', expiryDate: '2026-08-30', status: 'expired', daysAgo: 3, fileUrl: '#' },
      { id: 'd4', title: 'Driving License (DL)', number: 'DL-1420180092811', issueDate: '2018-05-10', expiryDate: '2038-05-09', status: 'valid', fileUrl: '#' },
      { id: 'd8', title: 'Manufacturer Warranty & RSA Pass', number: 'WAR-CRETA-8821', issueDate: '2023-04-12', expiryDate: '2028-04-11', status: 'valid', fileUrl: '#' }
    ]
  },
  {
    id: 'v2',
    name: 'Royal Enfield Himalayan 450',
    type: 'two-wheeler',
    registrationNumber: 'HR-26-DJ-9081',
    vin: 'ME4RE450HK019283',
    color: 'Kamet White',
    espDeviceId: 'ASAAS-002',
    firmwareVersion: 'v2.3.9',
    status: 'standby',
    lastSync: '10 mins ago',
    documents: [
      { id: 'd5', title: 'Registration Certificate (RC)', number: 'HR262024001192', issueDate: '2024-01-10', expiryDate: '2039-01-09', status: 'valid', fileUrl: '#' },
      { id: 'd6', title: 'Two-Wheeler Comprehensive Insurance', number: 'ICICI-TW-55421', issueDate: '2026-01-15', expiryDate: '2027-01-14', status: 'valid', fileUrl: '#' },
      { id: 'd7', title: 'PUC Certificate', number: 'PUC-GGN-77319', issueDate: '2026-05-01', expiryDate: '2026-11-01', status: 'valid', fileUrl: '#' }
    ]
  }
];

export const initialMedicalProfile = {
  fullName: 'Alex Mercer',
  age: 32,
  gender: 'Male',
  bloodGroup: 'O+ (Positive)',
  heightCm: 178,
  weightKg: 74,
  allergies: ['Penicillin', 'Peanut Dust'],
  medicalConditions: ['Mild Exercise-Induced Asthma'],
  currentMedications: ['Montelukast 10mg', 'Inhaler (SOS)'],
  organDonor: true,
  organDonorId: 'OD-IN-99218-DEL',
  insuranceProvider: 'Star Health Comprehensive Gold',
  insurancePolicyNumber: 'SH-88492019-X',
  insuranceExpiry: '2027-03-31',
  primaryPhysician: {
    name: 'Dr. Rohan Sharma',
    specialty: 'Trauma & Critical Care',
    hospital: 'Max Super Speciality Hospital',
    phone: '+91 98765 43210'
  },
  medicalDocuments: [
    { id: 'm1', name: 'Emergency Medical ID & Blood Passport', category: 'ID Card', date: '2025-11-10', format: 'PDF' },
    { id: 'm2', name: 'Organ Donor Registration Pass', category: 'Certificate', date: '2024-03-15', format: 'PDF' },
    { id: 'm3', name: 'Health Insurance E-Card & Cashless Network', category: 'Insurance', date: '2026-01-01', format: 'PDF' },
    { id: 'm4', name: 'Recent Electrocardiogram (ECG) Report', category: 'Lab Report', date: '2026-06-20', format: 'PDF' }
  ]
};

export const initialEmergencyContacts = [
  {
    id: 'c1',
    name: 'Sarah Mercer',
    relation: 'Spouse / Primary Guardian',
    phone: '+91 98111 22233',
    email: 'sarah.mercer@example.com',
    isPrimary: true,
    autoSms: true,
    autoCall: true,
    whatsappAlert: true
  },
  {
    id: 'c2',
    name: 'David Mercer',
    relation: 'Brother',
    phone: '+91 98222 33344',
    email: 'david.m@example.com',
    isPrimary: false,
    autoSms: true,
    autoCall: false,
    whatsappAlert: true
  },
  {
    id: 'c3',
    name: 'Dr. Rohan Sharma',
    relation: 'Family Physician',
    phone: '+91 98765 43210',
    email: 'dr.rohan@maxhealth.example.com',
    isPrimary: false,
    autoSms: true,
    autoCall: false,
    whatsappAlert: false
  }
];

export const accidentHistory = [
  {
    id: 'INC-2026-0814',
    date: '2026-08-14 22:41:09',
    vehicleName: 'Hyundai Creta SX (O) Turbo',
    registrationNumber: 'DL-01-AB-4321',
    deviceId: 'ASAAS-001',
    severity: 'CRITICAL',
    peakGForce: '5.84g',
    speedAtImpact: '74 km/h',
    location: 'NH-48 Expressway, KM 34.2 (Near Hero Honda Chowk)',
    coordinates: { lat: 28.4595, lng: 77.0266 },
    status: 'Resolved (Priority Dispatch Completed)',
    ambulanceEta: '3.5 mins (AIIMS Trauma #08)',
    aiSummary: 'Sequential priority alert dispatched: Hospital (1st) -> Police (2nd) -> Family (3rd). MPU6050 recorded 5.84g deceleration.'
  },
  {
    id: 'INC-2026-0602',
    date: '2026-06-02 14:15:30',
    vehicleName: 'Royal Enfield Himalayan 450',
    registrationNumber: 'HR-26-DJ-9081',
    deviceId: 'ASAAS-002',
    severity: 'MODERATE',
    peakGForce: '2.15g',
    speedAtImpact: '38 km/h',
    location: 'Golf Course Road, Sector 54, Gurugram',
    coordinates: { lat: 28.4392, lng: 77.1025 },
    status: 'Interrupted by Circuit Stop Button',
    ambulanceEta: 'N/A (Stopped by User)',
    aiSummary: 'Sudden hard brake event. Physical Stop Button pressed at t+4s, breaking relay circuit and halting ambulance dispatch.'
  }
];

import { emergencyFacilitiesDatabase } from './geoService';

export const nearbyResponders = emergencyFacilitiesDatabase;


