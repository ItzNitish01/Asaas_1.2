export const initialVehicles = [
  {
    id: 'v1',
    name: 'Hyundai Creta SX (O) Turbo',
    type: 'four-wheeler',
    category: 'Compact SUV',
    registrationNumber: 'DL-01-AB-4321',
    vin: 'MALC341C89M203912',
    engineNumber: 'G4LD-991204',
    color: 'Titan Grey',
    year: '2023',
    fuelType: 'Petrol (Turbo GDi)',
    odometerKm: 18420,
    serviceDueKm: 20000,
    batteryHealth: 98,
    fuelLevelPercent: 68,
    tirePressure: {
      frontLeft: 33,
      frontRight: 33,
      rearLeft: 32,
      rearRight: 32,
      unit: 'PSI',
      status: 'optimal'
    },
    espDeviceId: 'ASAAS-001',
    firmwareVersion: 'v2.4.1-OTA',
    status: 'online',
    lastSync: 'Just now',
    documents: [
      { id: 'd1', title: 'Registration Certificate (RC)', number: 'DL012023004921', issueDate: '2023-04-12', expiryDate: '2038-04-11', status: 'valid', issuer: 'RTO Delhi Central (DL-01)', fileUrl: '#' },
      { id: 'd2', title: 'Motor Insurance Policy (HDFC Ergo)', number: 'POL-9928104', issueDate: '2025-09-15', expiryDate: '2026-09-14', status: 'expiring_soon', daysLeft: 12, issuer: 'HDFC Ergo General Insurance', fileUrl: '#' },
      { id: 'd3', title: 'PUC Certificate (Pollution)', number: 'PUC-DEL-88210', issueDate: '2026-02-28', expiryDate: '2026-08-30', status: 'expired', daysAgo: 7, issuer: 'Delhi Transport Dept', fileUrl: '#' },
      { id: 'd4', title: 'Driving License (DL)', number: 'DL-1420180092811', issueDate: '2018-05-10', expiryDate: '2038-05-09', status: 'valid', issuer: 'Ministry of Road Transport', fileUrl: '#' },
      { id: 'd8', title: 'Manufacturer Warranty & RSA Pass', number: 'WAR-CRETA-8821', issueDate: '2023-04-12', expiryDate: '2028-04-11', status: 'valid', issuer: 'Hyundai Motor India Ltd', fileUrl: '#' }
    ],
    serviceHistory: [
      {
        id: 'srv-1',
        date: '2026-03-10',
        odometerKm: 15100,
        type: 'Second Scheduled Periodic Service',
        center: 'Koncept Hyundai Authorized Workshop, Okhla',
        cost: 4850,
        technician: 'Rajesh Verma (Master Tech)',
        notes: 'Engine oil 5W-30 synthetic replaced, oil filter & cabin AC filter changed, brake pads inspected (75% remaining).'
      },
      {
        id: 'srv-2',
        date: '2025-08-22',
        odometerKm: 10050,
        type: 'First Periodic Oil & Filter Service',
        center: 'Koncept Hyundai Authorized Workshop, Okhla',
        cost: 2900,
        technician: 'Vikas Kumar',
        notes: 'Full synthetic oil change, tire rotation, ECU software patch applied.'
      }
    ]
  },
  {
    id: 'v2',
    name: 'Royal Enfield Himalayan 450',
    type: 'two-wheeler',
    category: 'Adventure Tourer',
    registrationNumber: 'HR-26-DJ-9081',
    vin: 'ME4RE450HK019283',
    engineNumber: 'SHERPA-452-8812',
    color: 'Kamet White',
    year: '2024',
    fuelType: 'Petrol (Liquid-Cooled)',
    odometerKm: 6150,
    serviceDueKm: 10000,
    batteryHealth: 94,
    fuelLevelPercent: 82,
    tirePressure: {
      front: 32,
      rear: 36,
      unit: 'PSI',
      status: 'optimal'
    },
    espDeviceId: 'ASAAS-002',
    firmwareVersion: 'v2.3.9',
    status: 'standby',
    lastSync: '10 mins ago',
    documents: [
      { id: 'd5', title: 'Registration Certificate (RC)', number: 'HR262024001192', issueDate: '2024-01-10', expiryDate: '2039-01-09', status: 'valid', issuer: 'RTO Gurugram North (HR-26)', fileUrl: '#' },
      { id: 'd6', title: 'Two-Wheeler Comprehensive Insurance', number: 'ICICI-TW-55421', issueDate: '2026-01-15', expiryDate: '2027-01-14', status: 'valid', issuer: 'ICICI Lombard GIC', fileUrl: '#' },
      { id: 'd7', title: 'PUC Certificate', number: 'PUC-GGN-77319', issueDate: '2026-05-01', expiryDate: '2026-11-01', status: 'valid', issuer: 'Haryana Transport Dept', fileUrl: '#' }
    ],
    serviceHistory: [
      {
        id: 'srv-3',
        date: '2026-02-14',
        odometerKm: 5000,
        type: '5,000 KM Periodic Inspection',
        center: 'Manzil Royal Enfield, Golf Course Road',
        cost: 2150,
        technician: 'Amit Tanwar',
        notes: 'Chain clean and lube, clutch cable free play adjusted, brake fluid topped up.'
      }
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

// --- HOSPITAL ER & TRAUMA OPERATIONS DATASETS ---
export const initialHospitalBeds = [
  {
    id: 'bed-1',
    name: 'Trauma Bay #01',
    ward: 'Trauma Resuscitation Unit',
    status: 'occupied', // 'available' | 'reserved' | 'occupied' | 'maintenance'
    patientName: 'Kunal Singhania',
    patientAge: 44,
    attendingDoctor: 'Dr. Rohan Sharma',
    equipment: ['Ventilator (Hamilton-G5)', 'Multi-para Monitor', 'Defibrillator'],
    oxygenSupport: true,
    lastSanitized: 'Today, 18:30'
  },
  {
    id: 'bed-2',
    name: 'Trauma Bay #02',
    ward: 'Trauma Resuscitation Unit',
    status: 'occupied',
    patientName: 'Sunita Mehra',
    patientAge: 29,
    attendingDoctor: 'Dr. Vikram Mehta',
    equipment: ['Multi-para Monitor', 'Suction Unit'],
    oxygenSupport: true,
    lastSanitized: 'Today, 19:15'
  },
  {
    id: 'bed-3',
    name: 'Trauma Bay #03',
    ward: 'Trauma Resuscitation Unit',
    status: 'available',
    patientName: null,
    patientAge: null,
    attendingDoctor: 'Unassigned',
    equipment: ['Ventilator Ready', 'Crash Cart #02', 'Defibrillator'],
    oxygenSupport: true,
    lastSanitized: 'Today, 21:00 (Sterilized & Prepped)'
  },
  {
    id: 'bed-4',
    name: 'Trauma Bay #04',
    ward: 'Rapid Trauma Bay',
    status: 'reserved',
    patientName: 'Incoming Crash Victim (ASAAS Telemetry)',
    patientAge: 32,
    attendingDoctor: 'Dr. Rohan Sharma',
    equipment: ['High-Flow Ventilator', 'Arterial Line Monitor', 'Chest Tube Tray'],
    oxygenSupport: true,
    lastSanitized: 'Locked & Reserved for Emergency Triage'
  },
  {
    id: 'bed-5',
    name: 'Surgical ICU Bed #08',
    ward: 'Post-Op Neuro/Trauma ICU',
    status: 'available',
    patientName: null,
    patientAge: null,
    attendingDoctor: 'Unassigned',
    equipment: ['ICP Monitor', 'Ventilator', 'Syringe Infusion Pumps (x4)'],
    oxygenSupport: true,
    lastSanitized: 'Today, 20:45'
  },
  {
    id: 'bed-6',
    name: 'Surgical ICU Bed #09',
    ward: 'Post-Op Neuro/Trauma ICU',
    status: 'occupied',
    patientName: 'Ramesh Chawla',
    patientAge: 58,
    attendingDoctor: 'Dr. Ananya Sen',
    equipment: ['Ventilator', 'Dialysis Ports', 'Infusion Array'],
    oxygenSupport: true,
    lastSanitized: 'Today, 14:00'
  }
];

export const initialHospitalAmbulances = [
  {
    id: 'amb-1',
    unitNumber: 'ALS 108 - Trauma Mobile ICU #12',
    type: 'Advanced Life Support (ALS)',
    plateNumber: 'DL-01-AX-1081',
    driverName: 'Mohan Singh',
    driverPhone: '+91 98111 88012',
    emtLead: 'Paramedic Devendra Joshi',
    status: 'standby', // 'standby' | 'dispatched' | 'en_route' | 'on_scene' | 'returning'
    currentLocation: 'AIIMS Apex Trauma Ambulance Bay',
    etaMinutes: 8,
    equipment: ['Transport Ventilator', 'Zoll X Series Defibrillator', 'Immobilization Spinal Board', 'Oxygen 2000L']
  },
  {
    id: 'amb-2',
    unitNumber: 'ALS 108 - Trauma Mobile ICU #09',
    type: 'Advanced Life Support (ALS)',
    plateNumber: 'DL-01-AX-1089',
    driverName: 'Kavita Rawat',
    driverPhone: '+91 98222 88019',
    emtLead: 'Paramedic Suraj Pal',
    status: 'standby',
    currentLocation: 'AIIMS Apex Trauma Ambulance Bay',
    etaMinutes: 12,
    equipment: ['Transport Ventilator', 'Defibrillator', 'Portable Suction']
  },
  {
    id: 'amb-3',
    unitNumber: 'BLS 102 - Patient Transport #04',
    type: 'Basic Life Support (BLS)',
    plateNumber: 'DL-01-BX-1024',
    driverName: 'Sanjay Kumar',
    driverPhone: '+91 98333 88024',
    emtLead: 'EMT Rahul Verma',
    status: 'standby',
    currentLocation: 'Emergency Gate #02',
    etaMinutes: 15,
    equipment: ['Oxygen Cylinders (x2)', 'Foldable Stretcher', 'Basic Trauma First Aid Kit']
  },
  {
    id: 'amb-4',
    unitNumber: 'Heli-Trauma Air Ambulance #01',
    type: 'Critical Care Helicopter (Air EMS)',
    plateNumber: 'VT-EMG-AIR',
    driverName: 'Capt. Siddharth Malhotra (Pilot)',
    driverPhone: '+91 98777 99001',
    emtLead: 'Flight Nurse Priya Nair',
    status: 'standby',
    currentLocation: 'AIIMS Trauma Rooftop Helipad',
    etaMinutes: 20,
    equipment: ['Aviation Certified Ventilator', 'ECMO Transport Rig', 'Blood Warmer', 'Infusion System']
  }
];

export const initialBloodBankStock = [
  { group: 'O+', units: 18, status: 'optimal', shelfLifeDays: 32 },
  { group: 'O-', units: 4, status: 'critical', shelfLifeDays: 28 }, // Universal Donor - low reserve
  { group: 'A+', units: 24, status: 'optimal', shelfLifeDays: 35 },
  { group: 'A-', units: 6, status: 'warning', shelfLifeDays: 30 },
  { group: 'B+', units: 28, status: 'optimal', shelfLifeDays: 38 },
  { group: 'B-', units: 5, status: 'warning', shelfLifeDays: 25 },
  { group: 'AB+', units: 12, status: 'optimal', shelfLifeDays: 34 },
  { group: 'AB-', units: 3, status: 'critical', shelfLifeDays: 20 }
];

export const initialHospitalDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Rohan Sharma',
    role: 'Chief Attending Trauma Surgeon',
    specialty: 'Trauma & Critical Surgical Care',
    pagerId: 'PAGER-AIIMS-101',
    phone: '+91 98765 43210',
    dutyStatus: 'on-duty', // 'on-duty' | 'on-call' | 'off-duty'
    room: 'Trauma OR #02',
    casesToday: 4
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Sen',
    role: 'Consultant Neurosurgeon',
    specialty: 'Cranial & Spinal Trauma',
    pagerId: 'PAGER-AIIMS-104',
    phone: '+91 98765 43211',
    dutyStatus: 'on-call',
    room: 'Neuro ICU Annex',
    casesToday: 2
  },
  {
    id: 'doc-3',
    name: 'Dr. Vikram Mehta',
    role: 'Senior Orthopedic Trauma Specialist',
    specialty: 'Complex Fracture & Pelvic Reconstruction',
    pagerId: 'PAGER-AIIMS-108',
    phone: '+91 98765 43212',
    dutyStatus: 'on-duty',
    room: 'Trauma Bay #02',
    casesToday: 5
  },
  {
    id: 'doc-4',
    name: 'Dr. Neha Kapoor',
    role: 'Consultant Cardiac Anesthesiologist',
    specialty: 'Emergency Airway & Critical Resuscitation',
    pagerId: 'PAGER-AIIMS-112',
    phone: '+91 98765 43213',
    dutyStatus: 'on-call',
    room: 'Surgical ICU',
    casesToday: 3
  }
];

export const initialHospitalTriageCases = [
  {
    id: 'CAS-2026-0814',
    date: '2026-08-14 22:45',
    patientName: 'Alex Mercer (Incoming Vehicle Collision)',
    age: 32,
    gender: 'Male',
    bloodGroup: 'O+',
    gcsScore: 14,
    triageTag: 'RED', // 'RED' (Immediate) | 'YELLOW' (Urgent) | 'GREEN' (Delayed) | 'BLACK' (Expectant)
    vitals: 'BP 110/72, Pulse 104, SpO2 97%',
    crashMechanism: '5.84g High Deceleration Collision (NH-48 Expressway)',
    assignedBay: 'Trauma Bay #04',
    attendingDoctor: 'Dr. Rohan Sharma',
    status: 'Triaged & Bay Reserved'
  },
  {
    id: 'CAS-2026-0810',
    date: '2026-08-10 16:20',
    patientName: 'Suresh Raina',
    age: 28,
    gender: 'Male',
    bloodGroup: 'B+',
    gcsScore: 12,
    triageTag: 'YELLOW',
    vitals: 'BP 125/80, Pulse 92, SpO2 99%',
    crashMechanism: 'Motorcycle Skid & Right Clavicle Fracture',
    assignedBay: 'Trauma Bay #02',
    attendingDoctor: 'Dr. Vikram Mehta',
    status: 'Surgery Completed & Stable'
  }
];

// --- HOSPITAL INCIDENT & MEDICO-LEGAL RECORDS (MLC) ---
export const initialHospitalIncidentRecords = [
  {
    id: 'INC-AIIMS-2026-0814',
    mlcNumber: 'MLC/2026/08/9912',
    date: '2026-08-14 22:45',
    hospitalName: 'AIIMS Apex Trauma Centre, New Delhi',
    patientName: 'Alex Mercer',
    age: 32,
    gender: 'Male',
    bloodGroup: 'O+',
    severity: 'CRITICAL',
    triageCategory: 'RED (Immediate)',
    peakGForce: '5.84g',
    speedAtImpact: '74 km/h',
    collisionType: 'Frontal Off-Center Collision (NH-48 KM 34.2)',
    assignedBay: 'Trauma Bay #04 (Ventilator Ready)',
    attendingSurgeon: 'Dr. Rohan Sharma (Chief Surgeon)',
    ambulanceUnit: 'ALS 108 Mobile ICU #12 (ETA 7 mins)',
    bloodUnitsUsed: '2 Units O+ Packed Cells',
    policeStationIntimation: 'Sector 37 Police Station (Station Officer Intimated)',
    surgicalStatus: 'Laparotomy & Splenic Hemostasis Completed',
    admissionStatus: 'Admitted to Post-Op Surgical ICU Bed #08',
    notes: 'MPU6050 recorded 5.84g deceleration. Patient arrived in hypovolemic shock, resuscitated within Golden Hour.'
  },
  {
    id: 'INC-AIIMS-2026-0810',
    mlcNumber: 'MLC/2026/08/9884',
    date: '2026-08-10 16:20',
    hospitalName: 'AIIMS Apex Trauma Centre, New Delhi',
    patientName: 'Suresh Raina',
    age: 28,
    gender: 'Male',
    bloodGroup: 'B+',
    severity: 'MODERATE',
    triageCategory: 'YELLOW (Urgent)',
    peakGForce: '3.10g',
    speedAtImpact: '45 km/h',
    collisionType: 'Motorcycle Skid & Right Clavicle Fracture',
    assignedBay: 'Trauma Bay #02',
    attendingSurgeon: 'Dr. Vikram Mehta (Senior Ortho)',
    ambulanceUnit: 'BLS 102 Transport #04',
    bloodUnitsUsed: '0 Units (Type & Screen only)',
    policeStationIntimation: 'Cyber City Traffic Post (e-FIR Logged)',
    surgicalStatus: 'Closed Reduction & Internal Fixation Completed',
    admissionStatus: 'Discharged & Follow-up in Ortho OPD',
    notes: 'No loss of consciousness. GCS 15/15. Patient stable and discharged with sling immobilization.'
  },
  {
    id: 'INC-AIIMS-2026-0728',
    mlcNumber: 'MLC/2026/07/9710',
    date: '2026-07-28 03:12',
    hospitalName: 'AIIMS Apex Trauma Centre, New Delhi',
    patientName: 'Pooja Verma',
    age: 24,
    gender: 'Female',
    bloodGroup: 'A+',
    severity: 'CRITICAL',
    triageCategory: 'RED (Immediate)',
    peakGForce: '6.45g',
    speedAtImpact: '82 km/h',
    collisionType: 'Rear-end Highway Barrier Impact',
    assignedBay: 'Trauma Bay #01',
    attendingSurgeon: 'Dr. Ananya Sen (Neurosurgeon)',
    ambulanceUnit: 'ALS 108 Mobile ICU #09',
    bloodUnitsUsed: '4 Units A+ Crossmatched',
    policeStationIntimation: 'Highway Patrol Control Room',
    surgicalStatus: 'Emergency Craniotomy & Subdural Evacuation',
    admissionStatus: 'Transferred to Neuro ICU Annex Bed #03',
    notes: 'Severe closed head injury with acute subdural hematoma. Rapid decompressive craniotomy performed within 45 mins.'
  }
];

// --- HOSPITAL EMERGENCY DIRECTORY & DEPARTMENT EXTENSIONS ---
export const initialHospitalEmergencyDirectory = [
  {
    id: 'hed-1',
    department: 'Emergency Trauma Triage Desk',
    role: 'Central ER Reception & Red Code Intake',
    extension: 'Ext. 101',
    directPhone: '+91 11 2659 8101',
    mobile: '+91 98765 00101',
    location: 'Ground Floor, Trauma Center Main Gate',
    inCharge: 'Head Nurse Meenakshi Sundaram',
    dutyStatus: 'Active 24x7',
    badgeColor: '#ef4444'
  },
  {
    id: 'hed-2',
    department: 'Blood Bank & Transfusion Medicine',
    role: 'Cryo-Vault & Emergency Crossmatching',
    extension: 'Ext. 104',
    directPhone: '+91 11 2659 8104',
    mobile: '+91 98765 00104',
    location: '1st Floor, Room 114 (Blood Bank Annex)',
    inCharge: 'Dr. Praveen Saxena (Transfusion Specialist)',
    dutyStatus: 'Active 24x7',
    badgeColor: '#dc2626'
  },
  {
    id: 'hed-3',
    department: 'Chief Trauma Surgeon Desk',
    role: 'Attending Surgical Lead & Emergency OR Command',
    extension: 'Ext. 102',
    directPhone: '+91 11 2659 8102',
    mobile: '+91 98765 43210',
    location: 'Trauma Operation Theatre Suite #02',
    inCharge: 'Dr. Rohan Sharma (Chief Surgeon)',
    dutyStatus: 'On Duty',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'hed-4',
    department: 'Surgical ICU (SICU) Nurse Station',
    role: 'Critical Care & Ventilator Support Roster',
    extension: 'Ext. 108',
    directPhone: '+91 11 2659 8108',
    mobile: '+91 98765 00108',
    location: '2nd Floor, Surgical ICU Wing A',
    inCharge: 'Sister In-charge Rita Thomas',
    dutyStatus: 'Active 24x7',
    badgeColor: '#10b981'
  },
  {
    id: 'hed-5',
    department: 'Emergency Radiology & CT / FAST Ultrasound',
    role: 'Polytrauma Whole-Body CT & X-Ray',
    extension: 'Ext. 110',
    directPhone: '+91 11 2659 8110',
    mobile: '+91 98765 00110',
    location: 'Ground Floor, Imaging Suite B',
    inCharge: 'Dr. Amit Joshi (Emergency Radiologist)',
    dutyStatus: 'Active 24x7',
    badgeColor: '#f59e0b'
  },
  {
    id: 'hed-6',
    department: 'Hospital Police Post & Medico-Legal Cell (MLC)',
    role: 'FIR Intimation, MLC Numbering & Forensic Registry',
    extension: 'Ext. 112',
    directPhone: '+91 11 2659 8112',
    mobile: '+91 98765 00112',
    location: 'Emergency Entrance (Police Booth #01)',
    inCharge: 'Sub-Inspector R.P. Yadav (Police Liaison)',
    dutyStatus: 'Active 24x7',
    badgeColor: '#3b82f6'
  },
  {
    id: 'hed-7',
    department: 'State 108/102 Ambulance Dispatch Bay',
    role: 'Fleet Control & Air Helipad Coordination',
    extension: 'Ext. 118',
    directPhone: '+91 11 2659 8118',
    mobile: '+91 98765 00118',
    location: 'Ambulance Ramp & Heli-Deck Control',
    inCharge: 'Dispatch Coordinator Mohan Lal',
    dutyStatus: 'Active 24x7',
    badgeColor: '#06b6d4'
  },
  {
    id: 'hed-8',
    department: 'Medical Oxygen & Cryogenic Engineering',
    role: 'Central Pipeline Pressure & Liquid O2 Monitoring',
    extension: 'Ext. 115',
    directPhone: '+91 11 2659 8115',
    mobile: '+91 98765 00115',
    location: 'Utility Block, Cryogenic Tank Yard',
    inCharge: 'Engineer S.K. Bansal',
    dutyStatus: 'Active 24x7',
    badgeColor: '#64748b'
  }
];

// --- POLICE PCR & HIGHWAY PATROL DATASETS ---
export const initialPoliceInterceptors = [
  {
    id: 'pcr-1',
    callSign: 'Highway Patrol Interceptor #07',
    plateNumber: 'DL-01-GP-0007',
    vehicleModel: 'Tata Safari Stealth (Police Pursuit)',
    officerInCharge: 'Inspector Vikram Malhotra',
    officerPhone: '+91 98111 77007',
    assignedSector: 'NH-48 Expressway Sector 04 (KM 28 - KM 42)',
    status: 'patrolling', // 'patrolling' | 'dispatched' | 'on_scene' | 'escorting' | 'standby'
    speedRadar: 'Active (Stalker DSR 2X)',
    equipment: ['Radar Gun', 'Breathalyzer', 'Spike Strips', 'First Aid Kit', 'Emergency Flares'],
    currentLocation: 'NH-48 Near Rajiv Chowk Flyover',
    etaMinutes: 4
  },
  {
    id: 'pcr-2',
    callSign: 'Falcon Highway Patrol #02',
    plateNumber: 'DL-01-GP-0002',
    vehicleModel: 'Mahindra Scorpio-N 4x4 Interceptor',
    officerInCharge: 'Sub-Inspector Ankit Rawat',
    officerPhone: '+91 98222 77002',
    assignedSector: 'Delhi-Gurugram Border (KM 18 - KM 28)',
    status: 'standby',
    speedRadar: 'Active (LaserCam 4)',
    equipment: ['ALPR License Camera', 'Hydraulic Jaws of Life', 'Emergency Lightbar'],
    currentLocation: 'Sirhaul Border Toll Plaza Patrol Bay',
    etaMinutes: 8
  },
  {
    id: 'pcr-3',
    callSign: 'Traffic Interceptor Unit #11',
    plateNumber: 'DL-01-GP-0011',
    vehicleModel: 'Toyota Innova Crysta Traffic Command',
    officerInCharge: 'ASI Deepa Nair',
    officerPhone: '+91 98333 77011',
    assignedSector: 'Cyber Hub & Golf Course Extension',
    status: 'patrolling',
    speedRadar: 'Active (Doppler Radar)',
    equipment: ['Speed Violation Camera Rig', 'Traffic Barricades', 'Public Address System (PA)'],
    currentLocation: 'IFFCO Chowk Intersection',
    etaMinutes: 6
  },
  {
    id: 'pcr-4',
    callSign: 'Rapid Motorcycle Alpha #04',
    plateNumber: 'DL-01-MP-0004',
    vehicleModel: 'BMW R1250RT Police Pursuit Bike',
    officerInCharge: 'Head Constable Rajesh Tomar',
    officerPhone: '+91 98444 77004',
    assignedSector: 'NH-48 Elevated Flyover Express Lanes',
    status: 'standby',
    speedRadar: 'Handheld TruSpeed S',
    equipment: ['Crash Site Pre-Scout Rig', 'Trauma Tourniquet Kit', 'Siren Strobe Array'],
    currentLocation: 'Hero Honda Chowk Elevated Deck',
    etaMinutes: 3
  }
];

export const initialPoliceFirRecords = [
  {
    id: 'FIR-2026-DEL-8821',
    firNumber: 'FIR No. 8821/2026',
    date: '2026-08-14 22:50',
    policeStation: 'Sector 04 PCR Highway Command, NH-48',
    district: 'South-West District, Delhi Police',
    incidentLocation: 'NH-48 Expressway, KM 34.2 (Near Hero Honda Chowk)',
    complainantName: 'State (Suo Motu via ASAAS IoT Crash Sensor)',
    accusedDriver: 'Alex Mercer (Hyundai Creta DL-01-AB-4321)',
    investigatingOfficer: 'Inspector Vikram Malhotra (IO #4421)',
    ioPhone: '+91 98111 77007',
    legalSections: 'Sec 279 IPC / BNS 281 (Rash Driving), Sec 337 IPC / BNS 125(a) (Endangering Life)',
    peakGForce: '5.84g',
    speedAtImpact: '74 km/h',
    status: 'Investigation Underway',
    evidenceSummary: 'MPU6050 recorded 5.84g deceleration. Pre-crash GPS speed 74 km/h. Driver admitted to AIIMS Trauma Bay #04. No other vehicles involved.',
    impoundedVehicle: 'Hyundai Creta SX (O) Turbo [DL-01-AB-4321]',
    alcoholTestResult: 'Negative (0.00% BAC via Paramedic Sensor)',
    hospitalReference: 'MLC/2026/08/9912 (AIIMS Apex Trauma)'
  },
  {
    id: 'FIR-2026-DEL-7419',
    firNumber: 'FIR No. 7419/2026',
    date: '2026-08-10 16:35',
    policeStation: 'Cyber City Traffic Police Station',
    district: 'Gurugram Traffic Police',
    incidentLocation: 'Golf Course Road, Sector 54 (Underpass Exit)',
    complainantName: 'Head Constable Manoj Yadav',
    accusedDriver: 'Suresh Raina (Royal Enfield HR-26-DJ-9081)',
    investigatingOfficer: 'Sub-Inspector Ankit Rawat (IO #3910)',
    ioPhone: '+91 98222 77002',
    legalSections: 'Sec 279 IPC (Rash Driving on Public Way)',
    peakGForce: '3.10g',
    speedAtImpact: '45 km/h',
    status: 'Chargesheet Filed',
    evidenceSummary: 'Single motorcycle skid on wet asphalt. Clavicle fracture reported. Driver stabilized at AIIMS Trauma Bay #02.',
    impoundedVehicle: 'Royal Enfield Himalayan 450 [HR-26-DJ-9081]',
    alcoholTestResult: 'Negative (0.00% BAC)',
    hospitalReference: 'MLC/2026/08/9884 (AIIMS Apex Trauma)'
  }
];

export const initialPoliceDirectory = [
  {
    id: 'pdir-1',
    unitName: 'Central PCR 112 Emergency Dispatch Room',
    role: 'Central CAD Highway Control & Dial 112 Call Center',
    extension: 'Ext. 112 / Line 01',
    directPhone: '+91 11 2346 9112',
    mobile: '+91 98111 00112',
    location: 'Police Headquarters, 5th Floor Central CAD Floor',
    officerInCharge: 'DCP Rajeshwar Sharma (IPS)',
    dutyStatus: 'Active 24x7',
    category: 'Control Room'
  },
  {
    id: 'pdir-2',
    unitName: 'Highway Patrol Sector 04 Command Post',
    role: 'NH-48 Expressway Immediate Interceptor Base',
    extension: 'Ext. 104',
    directPhone: '+91 11 2659 0104',
    mobile: '+91 98111 77007',
    location: 'KM 32.5 Expressway Toll Plaza Annex',
    officerInCharge: 'Inspector Vikram Malhotra (Station House Officer)',
    dutyStatus: 'Active 24x7',
    category: 'Patrol Base'
  },
  {
    id: 'pdir-3',
    unitName: 'Traffic Police Green Corridor Command Cell',
    role: 'Automated Signal Preemption & Route Synchronization',
    extension: 'Ext. 103',
    directPhone: '+91 11 2346 9103',
    mobile: '+91 98222 00103',
    location: 'Traffic Management Center, Todapur Complex',
    officerInCharge: 'ACP Meenakshi Sundaram (Traffic)',
    dutyStatus: 'Active 24x7',
    category: 'Traffic Control'
  },
  {
    id: 'pdir-4',
    unitName: 'Highway Crane & Heavy Rescue Towing Squad',
    role: 'Hydraulic Wrecker & Crash Obstruction Clearing',
    extension: 'Ext. 109',
    directPhone: '+91 11 2659 0109',
    mobile: '+91 98333 00109',
    location: 'NH-48 Heavy Vehicle Impound Yard',
    officerInCharge: 'Sub-Inspector Baldev Singh (Recovery Lead)',
    dutyStatus: 'Active 24x7',
    category: 'Recovery & Towing'
  },
  {
    id: 'pdir-5',
    unitName: 'Delhi Fire & Highway Rescue Tender Squad',
    role: 'Vehicle Extrication & Chemical Spill Neutralization',
    extension: 'Ext. 101',
    directPhone: '+91 11 2341 2222',
    mobile: '+91 98444 00101',
    location: 'Udyog Vihar Fire Station (Expressway Wing)',
    officerInCharge: 'Divisional Fire Officer Harish Chander',
    dutyStatus: 'Active 24x7',
    category: 'Emergency Services'
  },
  {
    id: 'pdir-6',
    unitName: 'Regional Transport Office (RTO) Enforcement',
    role: 'Vahan Database Clearance & Fitness Auditing',
    extension: 'Ext. 115',
    directPhone: '+91 11 2399 8115',
    mobile: '+91 98555 00115',
    location: 'RTO South-West District HQ',
    officerInCharge: 'Motor Licensing Officer (MLO) S.K. Duggal',
    dutyStatus: '09:00 - 18:00',
    category: 'Government Authority'
  }
];

export const initialTrafficJunctions = [
  { id: 'junc-1', name: 'NH-48 KM 34.2 (Accident Site)', status: 'preempted', distanceKm: 0.0, clearTimeSec: 45 },
  { id: 'junc-2', name: 'Hero Honda Chowk Intersect', status: 'preempted', distanceKm: 2.4, clearTimeSec: 60 },
  { id: 'junc-3', name: 'Rajiv Chowk Underpass / Flyover', status: 'preempted', distanceKm: 5.8, clearTimeSec: 75 },
  { id: 'junc-4', name: 'Shankar Chowk Expressway Exit', status: 'preempted', distanceKm: 11.2, clearTimeSec: 90 },
  { id: 'junc-5', name: 'Dhaula Kuan Junction Ring Road', status: 'preempted', distanceKm: 18.5, clearTimeSec: 110 },
  { id: 'junc-6', name: 'AIIMS Apex Trauma Gate Signal', status: 'preempted', distanceKm: 24.1, clearTimeSec: 30 }
];

export const initialHazardPerimeters = [
  {
    id: 'hp-1',
    location: 'NH-48 Expressway KM 34.2 (Northbound Lanes)',
    lanesBlocked: ['Lane 1 (Fast Lane)', 'Lane 2 (Middle Lane)'],
    openLanes: ['Lane 3 (Slow Lane)', 'Emergency Shoulder'],
    vmsSpeedLimit: '30 km/h',
    flaresDeployed: 8,
    coneBarrierLengthMeters: 150,
    status: 'ACTIVE',
    setupTime: '22:48'
  }
];

import { emergencyFacilitiesDatabase } from './geoService';

export const nearbyResponders = emergencyFacilitiesDatabase;

export const initialFamilyMembers = [
  {
    id: 'fam-1',
    name: 'Alex Mercer',
    relation: 'Spouse / Partner',
    avatar: '👨‍💼',
    phone: '+91 98111 22233',
    email: 'alex.mercer@safedrive.io',
    vehicleName: 'Hyundai Creta SX(O)',
    vehiclePlate: 'DL-01-AB-1234',
    vehicleType: 'four-wheeler',
    currentStatus: 'Driving (NH-48)',
    currentSpeedKmh: 68,
    lastLocation: 'NH-48 Expressway KM 34.2 (Hero Honda Chowk)',
    batteryLevel: 92,
    activeSafeZone: 'Cyber City Corridor',
    bloodGroup: 'O+',
    isPrimary: true
  },
  {
    id: 'fam-2',
    name: 'Rohan Mercer',
    relation: 'Son (College Commuter)',
    avatar: '🧑‍🎓',
    phone: '+91 98222 33445',
    email: 'rohan.mercer@campus.du.ac.in',
    vehicleName: 'Honda Activa 6G',
    vehiclePlate: 'DL-04-XY-8821',
    vehicleType: 'two-wheeler',
    currentStatus: 'Parked (Engine Off)',
    currentSpeedKmh: 0,
    lastLocation: 'DU North Campus, Chhatra Marg Gate 3',
    batteryLevel: 88,
    activeSafeZone: 'DU North Campus Zone',
    bloodGroup: 'B+',
    isPrimary: false
  },
  {
    id: 'fam-3',
    name: 'Eleanor Mercer',
    relation: 'Daughter (High School)',
    avatar: '👩‍🎓',
    phone: '+91 98333 44556',
    email: 'eleanor.m@family.org',
    vehicleName: 'Maruti Baleno Alpha',
    vehiclePlate: 'HR-26-DQ-5512',
    vehicleType: 'four-wheeler',
    currentStatus: 'Safe at Home',
    currentSpeedKmh: 0,
    lastLocation: 'Sector 56, Golf Course Extension, Gurugram',
    batteryLevel: 95,
    activeSafeZone: 'Home Sanctuary',
    bloodGroup: 'O+',
    isPrimary: false
  }
];

export const initialGeofenceZones = [
  {
    id: 'geo-1',
    name: 'Home Sanctuary',
    address: 'Sector 56, Golf Course Extension Road, Gurugram',
    radiusMeters: 500,
    category: 'Home',
    color: '#10b981',
    alertOnExit: true,
    alertOnEntry: true,
    status: 'ACTIVE',
    activeOccupants: ['Eleanor Mercer'],
    coordinates: { lat: 28.4235, lng: 77.0982 }
  },
  {
    id: 'geo-2',
    name: 'Cyber City Work Hub',
    address: 'DLF Cyber City Tower B, DLF Phase 2, Gurugram',
    radiusMeters: 1000,
    category: 'Office',
    color: '#38bdf8',
    alertOnExit: true,
    alertOnEntry: true,
    status: 'ACTIVE',
    activeOccupants: ['Alex Mercer'],
    coordinates: { lat: 28.4952, lng: 77.0891 }
  },
  {
    id: 'geo-3',
    name: 'Delhi University Campus',
    address: 'North Campus, Faculty of Arts, University Enclave, Delhi',
    radiusMeters: 800,
    category: 'Education',
    color: '#c084fc',
    alertOnExit: true,
    alertOnEntry: false,
    status: 'ACTIVE',
    activeOccupants: ['Rohan Mercer'],
    coordinates: { lat: 28.6892, lng: 77.2104 }
  },
  {
    id: 'geo-4',
    name: 'Gym & Sports Arena',
    address: 'Sector 29 Leisure Valley Park Zone, Gurugram',
    radiusMeters: 400,
    category: 'Fitness',
    color: '#f59e0b',
    alertOnExit: false,
    alertOnEntry: true,
    status: 'ACTIVE',
    activeOccupants: [],
    coordinates: { lat: 28.4682, lng: 77.0621 }
  }
];

export const initialFamilyTripLogs = [
  {
    id: 'trip-101',
    memberName: 'Alex Mercer',
    vehicle: 'Hyundai Creta [DL-01-AB-1234]',
    date: 'Today, 08:35 AM - 09:12 AM',
    startLocation: 'Sector 56 Home',
    endLocation: 'Cyber City Tower B',
    distanceKm: 18.4,
    durationMins: 37,
    maxSpeedKmh: 74,
    avgSpeedKmh: 42,
    harshEvents: 0,
    safetyScore: 98,
    status: 'Completed Safely'
  },
  {
    id: 'trip-102',
    memberName: 'Alex Mercer',
    vehicle: 'Hyundai Creta [DL-01-AB-1234]',
    date: 'Today, 22:15 PM - In Progress',
    startLocation: 'Cyber City Office',
    endLocation: 'NH-48 KM 34.2 (Hero Honda)',
    distanceKm: 12.1,
    durationMins: 18,
    maxSpeedKmh: 82,
    avgSpeedKmh: 54,
    harshEvents: 0,
    safetyScore: 94,
    status: 'Active Driving'
  },
  {
    id: 'trip-103',
    memberName: 'Rohan Mercer',
    vehicle: 'Honda Activa [DL-04-XY-8821]',
    date: 'Today, 09:45 AM - 10:20 AM',
    startLocation: 'Civil Lines Metro',
    endLocation: 'DU North Campus Gate 3',
    distanceKm: 6.2,
    durationMins: 24,
    maxSpeedKmh: 46,
    avgSpeedKmh: 28,
    harshEvents: 1,
    safetyScore: 89,
    status: 'Completed Safely'
  },
  {
    id: 'trip-104',
    memberName: 'Eleanor Mercer',
    vehicle: 'Maruti Baleno [HR-26-DQ-5512]',
    date: 'Yesterday, 17:10 PM - 17:42 PM',
    startLocation: 'South City High School',
    endLocation: 'Sector 56 Home',
    distanceKm: 9.8,
    durationMins: 32,
    maxSpeedKmh: 55,
    avgSpeedKmh: 34,
    harshEvents: 0,
    safetyScore: 99,
    status: 'Completed Safely'
  }
];

export const initialGuardianCircle = [
  {
    id: 'gc-1',
    name: 'Sarah Mercer',
    relation: 'Primary Guardian (Spouse)',
    phone: '+91 98111 55667',
    alternatePhone: '+91 11 2659 8899',
    email: 'sarah.mercer@example.com',
    priority: 'Primary ICE (Tier-1)',
    notifySms: true,
    notifyCall: true,
    avatar: '👩'
  },
  {
    id: 'gc-2',
    name: 'Vikram Mercer',
    relation: 'Secondary Guardian (Brother)',
    phone: '+91 98222 66778',
    alternatePhone: '+91 98222 00001',
    email: 'vikram.mercer@enterprise.in',
    priority: 'Secondary Contact (Tier-2)',
    notifySms: true,
    notifyCall: false,
    avatar: '👨'
  },
  {
    id: 'gc-3',
    name: 'Dr. K.K. Bansal (MD Medicine)',
    relation: 'Trusted Family Physician',
    phone: '+91 98100 12345',
    alternatePhone: '+91 11 2658 9000',
    email: 'dr.bansal@medclinic.in',
    priority: 'Medical Advisor',
    notifySms: true,
    notifyCall: false,
    avatar: '🩺'
  },
  {
    id: 'gc-4',
    name: 'Highway Police Patrol (Dial 112)',
    relation: 'State Police Command CAD',
    phone: '112',
    alternatePhone: '+91 11 2346 9112',
    email: 'cad112@delhipolice.gov.in',
    priority: 'Law Enforcement',
    notifySms: true,
    notifyCall: true,
    avatar: '🚓'
  },
  {
    id: 'gc-5',
    name: 'AIIMS Apex Trauma Desk (108 ER)',
    relation: 'Government Level-1 Trauma Bay',
    phone: '108',
    alternatePhone: '+91 11 2659 8655',
    email: 'er.trauma@aiims.edu',
    priority: 'Emergency Hospital',
    notifySms: true,
    notifyCall: true,
    avatar: '🏥'
  }
];

export const initialGuardianSettings = {
  speedAlertThresholdKmh: 85,
  curfewAlertEnabled: true,
  curfewStartTime: '23:00',
  curfewEndTime: '05:00',
  smsEmergencyBroadcast: true,
  geofenceTransitionAlerts: true,
  autoAmbulanceConsent: true,
  organDonorSharing: true
};



