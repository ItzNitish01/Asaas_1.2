import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  FileText, 
  Download, 
  CheckCircle2, 
  PhoneCall, 
  AlertCircle, 
  Award,
  Stethoscope,
  UserCheck,
  Zap,
  Printer,
  Plus,
  Pill,
  X,
  FilePlus,
  Trash2,
  Edit3,
  ShieldCheck
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function MedicalCareTab({ medicalProfile, setMedicalProfile }) {
  const [paramedicMode, setParamedicMode] = useState(false);
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add medication form states
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medDoctor, setMedDoctor] = useState('');

  // Edit profile form states
  const [profileForm, setProfileForm] = useState({
    fullName: medicalProfile.fullName || 'Alex Mercer',
    age: medicalProfile.age || 32,
    gender: medicalProfile.gender || 'Male',
    bloodGroup: medicalProfile.bloodGroup || 'O+ (Positive)',
    heightCm: medicalProfile.heightCm || 178,
    weightKg: medicalProfile.weightKg || 74,
    allergies: (medicalProfile.allergies || []).join(', '),
    medicalConditions: (medicalProfile.medicalConditions || []).join(', '),
    insuranceProvider: medicalProfile.insuranceProvider || 'Star Health Comprehensive Gold',
    insurancePolicyNumber: medicalProfile.insurancePolicyNumber || 'SH-88492019-X',
    doctorName: medicalProfile.primaryPhysician?.name || 'Dr. Rohan Sharma',
    doctorSpecialty: medicalProfile.primaryPhysician?.specialty || 'Trauma & Critical Care',
    doctorHospital: medicalProfile.primaryPhysician?.hospital || 'Max Super Speciality Hospital',
    doctorPhone: medicalProfile.primaryPhysician?.phone || '+91 98765 43210'
  });

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      fullName: medicalProfile.fullName || 'Alex Mercer',
      age: medicalProfile.age || 32,
      gender: medicalProfile.gender || 'Male',
      bloodGroup: medicalProfile.bloodGroup || 'O+ (Positive)',
      heightCm: medicalProfile.heightCm || 178,
      weightKg: medicalProfile.weightKg || 74,
      allergies: (medicalProfile.allergies || []).join(', '),
      medicalConditions: (medicalProfile.medicalConditions || []).join(', '),
      insuranceProvider: medicalProfile.insuranceProvider || 'Star Health Comprehensive Gold',
      insurancePolicyNumber: medicalProfile.insurancePolicyNumber || 'SH-88492019-X',
      doctorName: medicalProfile.primaryPhysician?.name || 'Dr. Rohan Sharma',
      doctorSpecialty: medicalProfile.primaryPhysician?.specialty || 'Trauma & Critical Care',
      doctorHospital: medicalProfile.primaryPhysician?.hospital || 'Max Super Speciality Hospital',
      doctorPhone: medicalProfile.primaryPhysician?.phone || '+91 98765 43210'
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const parsedAllergies = profileForm.allergies
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const parsedConditions = profileForm.medicalConditions
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const updated = {
      ...medicalProfile,
      fullName: profileForm.fullName,
      age: Number(profileForm.age) || medicalProfile.age,
      gender: profileForm.gender,
      bloodGroup: profileForm.bloodGroup,
      heightCm: Number(profileForm.heightCm) || medicalProfile.heightCm,
      weightKg: Number(profileForm.weightKg) || medicalProfile.weightKg,
      allergies: parsedAllergies,
      medicalConditions: parsedConditions,
      insuranceProvider: profileForm.insuranceProvider,
      insurancePolicyNumber: profileForm.insurancePolicyNumber,
      primaryPhysician: {
        ...medicalProfile.primaryPhysician,
        name: profileForm.doctorName,
        specialty: profileForm.doctorSpecialty,
        hospital: profileForm.doctorHospital,
        phone: profileForm.doctorPhone
      }
    };

    setMedicalProfile(updated);
    cloudDb.updateMedicalProfile(updated);
    setShowEditProfileModal(false);
    showNotification('Emergency Medical Passport updated successfully!');
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!medName) return;

    const newMedicationStr = `${medName}${medDosage ? ` (${medDosage})` : ''}${medDoctor ? ` - Prescribed by ${medDoctor}` : ''}`;
    const updatedMeds = [...(medicalProfile.currentMedications || []), newMedicationStr];

    const updated = {
      ...medicalProfile,
      currentMedications: updatedMeds
    };

    setMedicalProfile(updated);
    cloudDb.updateMedicalProfile(updated);
    setMedName('');
    setMedDosage('');
    setMedDoctor('');
    setShowAddMedForm(false);
    showNotification(`Medication "${medName}" added to active prescriptions.`);
  };

  const handleDeleteMedication = (index) => {
    const updatedMeds = (medicalProfile.currentMedications || []).filter((_, i) => i !== index);
    const updated = {
      ...medicalProfile,
      currentMedications: updatedMeds
    };
    setMedicalProfile(updated);
    cloudDb.updateMedicalProfile(updated);
    showNotification('Medication removed.');
  };

  return (
    <div className="tab-content-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeartPulse size={26} color="#ef4444" /> Emergency Medical Profile & Prescriptions
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Instant blood group, critical allergies, medication prescriptions, and paramedic emergency dossier
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleOpenEditProfile}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            <Edit3 size={15} /> Edit Medical Passport
          </button>

          <button 
            onClick={() => setShowAddMedForm(!showAddMedForm)}
            className="btn btn-ghost"
            style={{ fontSize: '0.82rem' }}
          >
            <Plus size={15} /> Add Prescription
          </button>

          {/* Paramedic Quick View Toggle */}
          <button 
            onClick={() => setParamedicMode(!paramedicMode)}
            className={`btn ${paramedicMode ? 'btn-emergency pulse-red' : 'btn-ghost'}`}
            style={{ fontSize: '0.82rem' }}
          >
            <Stethoscope size={16} /> {paramedicMode ? 'EXIT PARAMEDIC MODE' : 'PARAMEDIC ACCESS VIEW'}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          padding: '12px 18px',
          borderRadius: '12px',
          color: '#34d399',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* HIGH PRIORITY PARAMEDIC VIEW */}
      {paramedicMode && (
        <div className="glass-card glass-card-emergency" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                  🚨 FIRST RESPONDER & PARAMEDIC EMERGENCY DOSSIER
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
                  Critical trauma care facts formatted for EMTs, 108 ALS Ambulance & ER doctors
                </span>
              </div>
            </div>
            <span className="badge badge-danger">CRITICAL TRIAGE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>BLOOD GROUP & TYPE</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '4px' }} className="mono">
                {medicalProfile.bloodGroup}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                Universal match compatibility checked
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>KNOWN CRITICAL ALLERGIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {medicalProfile.allergies && medicalProfile.allergies.map((a, i) => (
                  <span key={i} style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    ⛔ {a}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>ORGAN DONOR STATUS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} color="#34d399" /> REGISTERED DONOR
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }} className="mono">
                ID: {medicalProfile.organDonorId || 'OD-IN-99218-DEL'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>CASHLESS HEALTH INSURANCE</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {medicalProfile.insuranceProvider}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }} className="mono">
                Policy: {medicalProfile.insurancePolicyNumber}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Medical Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Patient Identity & Vitals Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#f59e0b" /> Patient Vitals & Bio
            </h3>
            <button onClick={handleOpenEditProfile} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
              <Edit3 size={12} /> Edit
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>FULL NAME</span>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{medicalProfile.fullName}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>AGE & GENDER</span>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{medicalProfile.age} yrs | {medicalProfile.gender}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>BLOOD GROUP</span>
              <div style={{ fontWeight: 700, color: '#ef4444' }} className="mono">{medicalProfile.bloodGroup}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>HEIGHT / WEIGHT</span>
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{medicalProfile.heightCm} cm | {medicalProfile.weightKg} kg</div>
            </div>
          </div>

          {/* Allergies & Conditions pills */}
          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '6px' }}>ALLERGIES:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(medicalProfile.allergies || []).map((a, i) => (
                <span key={i} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>{a}</span>
              ))}
              {(!medicalProfile.allergies || medicalProfile.allergies.length === 0) && (
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>None recorded</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '6px' }}>CHRONIC CONDITIONS:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(medicalProfile.medicalConditions || []).map((c, i) => (
                <span key={i} className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{c}</span>
              ))}
              {(!medicalProfile.medicalConditions || medicalProfile.medicalConditions.length === 0) && (
                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Current Prescriptions & Medications Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={20} color="#ef4444" /> Active Prescriptions
            </h3>
            <button onClick={() => setShowAddMedForm(true)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
              <Plus size={13} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medicalProfile.currentMedications && medicalProfile.currentMedications.length > 0 ? (
              medicalProfile.currentMedications.map((m, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Pill size={16} color="#ef4444" />
                    <span>{m}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMedication(idx)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    title="Remove prescription"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', padding: '16px 0', textAlign: 'center' }}>
                No active prescriptions listed. Click "+ Add" above to add drugs.
              </div>
            )}
          </div>
        </div>

        {/* Primary Physician & Emergency Hospital Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} color="#a855f7" /> Primary Physician Contact
            </h3>
            <span className="badge badge-info">PREFERRED HOSPITAL</span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            {medicalProfile.primaryPhysician?.name || 'Dr. Rohan Sharma'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a855f7', marginTop: '2px' }}>
            {medicalProfile.primaryPhysician?.specialty || 'Trauma & Critical Care'} - {medicalProfile.primaryPhysician?.hospital || 'Max Super Speciality Hospital'}
          </div>

          <div style={{ marginTop: '16px' }}>
            <a href={`tel:${medicalProfile.primaryPhysician?.phone}`} className="btn btn-primary" style={{ width: '100%', fontSize: '0.82rem' }}>
              <PhoneCall size={14} /> Call Doctor: {medicalProfile.primaryPhysician?.phone || '+91 98765 43210'}
            </a>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddMedForm && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(440px, 92vw)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                Add Prescription / Medication
              </h3>
              <button onClick={() => setShowAddMedForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedication} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Medication / Drug Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Montelukast / Aspirin"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dosage & Frequency</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10mg Once Daily (Bedtime)"
                  value={medDosage}
                  onChange={e => setMedDosage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Prescribed By</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Rohan Sharma"
                  value={medDoctor}
                  onChange={e => setMedDoctor(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddMedForm(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Full Medical Passport Modal */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(620px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HeartPulse size={22} color="#ef4444" />
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                  Edit Emergency Medical Passport
                </h3>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                <input 
                  type="text" 
                  value={profileForm.fullName}
                  onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>BLOOD GROUP *</label>
                <select 
                  value={profileForm.bloodGroup}
                  onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                >
                  <option value="O+ (Positive)">O+ (Positive)</option>
                  <option value="O- (Negative)">O- (Negative) - Universal Donor</option>
                  <option value="A+ (Positive)">A+ (Positive)</option>
                  <option value="A- (Negative)">A- (Negative)</option>
                  <option value="B+ (Positive)">B+ (Positive)</option>
                  <option value="B- (Negative)">B- (Negative)</option>
                  <option value="AB+ (Positive)">AB+ (Positive) - Universal Recipient</option>
                  <option value="AB- (Negative)">AB- (Negative)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>AGE & GENDER</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={profileForm.age}
                    onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                    style={{ width: '80px', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                  <input 
                    type="text" 
                    value={profileForm.gender}
                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>HEIGHT (CM) & WEIGHT (KG)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    placeholder="Height"
                    value={profileForm.heightCm}
                    onChange={e => setProfileForm({ ...profileForm, heightCm: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Weight"
                    value={profileForm.weightKg}
                    onChange={e => setProfileForm({ ...profileForm, weightKg: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>KNOWN ALLERGIES (Comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Penicillin, Peanut Dust, Latex"
                  value={profileForm.allergies}
                  onChange={e => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CHRONIC MEDICAL CONDITIONS (Comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mild Exercise-Induced Asthma, Hypertension"
                  value={profileForm.medicalConditions}
                  onChange={e => setProfileForm({ ...profileForm, medicalConditions: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>HEALTH INSURANCE PROVIDER</label>
                <input 
                  type="text" 
                  value={profileForm.insuranceProvider}
                  onChange={e => setProfileForm({ ...profileForm, insuranceProvider: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>INSURANCE POLICY NUMBER</label>
                <input 
                  type="text" 
                  value={profileForm.insurancePolicyNumber}
                  onChange={e => setProfileForm({ ...profileForm, insurancePolicyNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PRIMARY PHYSICIAN NAME</label>
                <input 
                  type="text" 
                  value={profileForm.doctorName}
                  onChange={e => setProfileForm({ ...profileForm, doctorName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PHYSICIAN PHONE</label>
                <input 
                  type="tel" 
                  value={profileForm.doctorPhone}
                  onChange={e => setProfileForm({ ...profileForm, doctorPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Medical Passport</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
