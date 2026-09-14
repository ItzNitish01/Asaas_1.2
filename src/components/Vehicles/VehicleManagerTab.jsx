import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Download, 
  ShieldCheck, 
  Calendar,
  X,
  PlusCircle,
  Cpu,
  Palette,
  Hash,
  FileCheck,
  Trash2,
  Edit3,
  RefreshCw,
  Eye,
  Wrench,
  Fuel,
  BatteryCharging,
  Gauge,
  Activity,
  Check,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function VehicleManagerTab({ 
  vehicles, 
  setVehicles, 
  selectedVehicle, 
  setSelectedVehicle 
}) {
  // Navigation sub-tab: 'garage' | 'vault' | 'service' | 'diagnostics'
  const [subTab, setSubTab] = useState('garage');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals visibility
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [viewingDocCertificate, setViewingDocCertificate] = useState(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [deletingServiceLog, setDeletingServiceLog] = useState(null);

  // Diagnostics simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [isCheckingOta, setIsCheckingOta] = useState(false);
  const [otaStatus, setOtaStatus] = useState(null);

  // Filter state for Document Vault
  const [docFilter, setDocFilter] = useState('all'); // 'all' | 'valid' | 'expiring_soon' | 'expired'

  // Form states for Add / Edit Vehicle
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    type: 'four-wheeler',
    category: 'Compact SUV',
    registrationNumber: '',
    vin: '',
    engineNumber: '',
    color: 'Titan Grey',
    year: '2024',
    fuelType: 'Petrol (Turbo)',
    odometerKm: 15000,
    serviceDueKm: 20000,
    batteryHealth: 98,
    fuelLevelPercent: 75,
    espDeviceId: ''
  });

  // Form states for Add / Edit Document
  const [docForm, setDocForm] = useState({
    title: '',
    number: '',
    category: 'Insurance',
    issuer: 'HDFC Ergo General Insurance',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  // Form states for Add Service Log
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    odometerKm: selectedVehicle?.odometerKm || 18450,
    type: 'Scheduled Periodic Service',
    center: 'Authorized Brand Service Center',
    cost: 3500,
    technician: 'Senior Diagnostic Specialist',
    notes: 'Engine oil replaced, air & oil filter changed, brake pads & tire pressure verified.'
  });

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Safe fallback if selected vehicle was deleted or invalid
  const activeVehicle = vehicles.find(v => v.id === selectedVehicle?.id) || vehicles[0] || null;

  // --- VEHICLE ACTIONS ---
  const handleOpenAddVehicle = () => {
    setVehicleForm({
      name: '',
      type: 'four-wheeler',
      category: 'SUV / Sedan',
      registrationNumber: '',
      vin: '',
      engineNumber: '',
      color: 'Onyx Black',
      year: '2024',
      fuelType: 'Petrol / Hybrid',
      odometerKm: 5000,
      serviceDueKm: 15000,
      batteryHealth: 100,
      fuelLevelPercent: 85,
      espDeviceId: `ASAAS-00${vehicles.length + 1}`
    });
    setShowAddVehicleModal(true);
  };

  const handleOpenEditVehicle = (vehicle, e) => {
    if (e) e.stopPropagation();
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name || '',
      type: vehicle.type || 'four-wheeler',
      category: vehicle.category || 'Passenger Vehicle',
      registrationNumber: vehicle.registrationNumber || '',
      vin: vehicle.vin || '',
      engineNumber: vehicle.engineNumber || '',
      color: vehicle.color || 'Titan Grey',
      year: vehicle.year || '2023',
      fuelType: vehicle.fuelType || 'Petrol',
      odometerKm: vehicle.odometerKm || 10000,
      serviceDueKm: vehicle.serviceDueKm || 20000,
      batteryHealth: vehicle.batteryHealth || 95,
      fuelLevelPercent: vehicle.fuelLevelPercent || 70,
      espDeviceId: vehicle.espDeviceId || `ASAAS-001`
    });
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    if (!vehicleForm.name || !vehicleForm.registrationNumber) return;

    if (editingVehicle) {
      // Update existing
      const updatedFields = {
        name: vehicleForm.name,
        type: vehicleForm.type,
        category: vehicleForm.category,
        registrationNumber: vehicleForm.registrationNumber.toUpperCase(),
        vin: vehicleForm.vin.toUpperCase() || editingVehicle.vin,
        engineNumber: vehicleForm.engineNumber.toUpperCase() || editingVehicle.engineNumber,
        color: vehicleForm.color,
        year: vehicleForm.year,
        fuelType: vehicleForm.fuelType,
        odometerKm: Number(vehicleForm.odometerKm) || editingVehicle.odometerKm,
        serviceDueKm: Number(vehicleForm.serviceDueKm) || editingVehicle.serviceDueKm,
        batteryHealth: Number(vehicleForm.batteryHealth) || 98,
        fuelLevelPercent: Number(vehicleForm.fuelLevelPercent) || 75,
        espDeviceId: vehicleForm.espDeviceId || editingVehicle.espDeviceId
      };

      const updatedList = vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...updatedFields } : v);
      setVehicles(updatedList);
      if (selectedVehicle?.id === editingVehicle.id) {
        setSelectedVehicle({ ...editingVehicle, ...updatedFields });
      }
      cloudDb.updateVehicle(editingVehicle.id, updatedFields);
      setEditingVehicle(null);
      showNotification(`Vehicle "${vehicleForm.name}" specifications updated successfully!`);
    } else {
      // Add new
      const newV = {
        id: `v-${Date.now()}`,
        name: vehicleForm.name,
        type: vehicleForm.type,
        category: vehicleForm.category,
        registrationNumber: vehicleForm.registrationNumber.toUpperCase(),
        vin: vehicleForm.vin.toUpperCase() || `VIN-${Math.floor(Math.random()*900000+100000)}`,
        engineNumber: vehicleForm.engineNumber.toUpperCase() || `ENG-${Math.floor(Math.random()*900000)}`,
        color: vehicleForm.color,
        year: vehicleForm.year,
        fuelType: vehicleForm.fuelType,
        odometerKm: Number(vehicleForm.odometerKm) || 2500,
        serviceDueKm: Number(vehicleForm.serviceDueKm) || 10000,
        batteryHealth: 100,
        fuelLevelPercent: 85,
        espDeviceId: vehicleForm.espDeviceId || `ASAAS-00${vehicles.length + 1}`,
        firmwareVersion: 'v2.4.1-OTA',
        status: 'online',
        lastSync: 'Just now',
        tirePressure: vehicleForm.type === 'two-wheeler' 
          ? { front: 32, rear: 36, unit: 'PSI', status: 'optimal' }
          : { frontLeft: 33, frontRight: 33, rearLeft: 32, rearRight: 32, unit: 'PSI', status: 'optimal' },
        documents: [
          { 
            id: `d-${Date.now()}-1`, 
            title: 'Registration Certificate (RC)', 
            number: vehicleForm.registrationNumber.toUpperCase(), 
            issueDate: new Date().toISOString().split('T')[0], 
            expiryDate: '2039-01-01', 
            status: 'valid', 
            issuer: 'Ministry of Road Transport & Highways',
            fileUrl: '#' 
          },
          { 
            id: `d-${Date.now()}-2`, 
            title: 'Motor Comprehensive Insurance', 
            number: `POL-${Math.floor(Math.random()*9000000+1000000)}`, 
            issueDate: new Date().toISOString().split('T')[0], 
            expiryDate: '2027-01-01', 
            status: 'valid', 
            issuer: 'HDFC Ergo General Insurance',
            fileUrl: '#' 
          },
          { 
            id: `d-${Date.now()}-3`, 
            title: 'PUC Certificate (Pollution)', 
            number: `PUC-${Math.floor(Math.random()*90000+10000)}`, 
            issueDate: new Date().toISOString().split('T')[0], 
            expiryDate: '2026-12-31', 
            status: 'valid', 
            issuer: 'State Transport Authority',
            fileUrl: '#' 
          }
        ],
        serviceHistory: []
      };

      const updatedList = [...vehicles, newV];
      setVehicles(updatedList);
      setSelectedVehicle(newV);
      cloudDb.addVehicle(newV);
      setShowAddVehicleModal(false);
      showNotification(`Vehicle "${newV.name}" registered & paired with ${newV.espDeviceId}!`);
    }
  };

  const handleDeleteVehicleConfirm = () => {
    if (!deletingVehicle) return;
    if (vehicles.length <= 1) {
      alert('Cannot delete the only registered vehicle. Add another vehicle first.');
      setDeletingVehicle(null);
      return;
    }

    const remaining = vehicles.filter(v => v.id !== deletingVehicle.id);
    setVehicles(remaining);
    if (selectedVehicle?.id === deletingVehicle.id) {
      setSelectedVehicle(remaining[0]);
    }
    cloudDb.deleteVehicle(deletingVehicle.id);
    showNotification(`Vehicle "${deletingVehicle.name}" (${deletingVehicle.registrationNumber}) removed.`);
    setDeletingVehicle(null);
  };

  // --- DOCUMENT ACTIONS ---
  const handleOpenAddDoc = () => {
    setDocForm({
      title: '',
      number: '',
      category: 'Insurance',
      issuer: 'HDFC Ergo General Insurance',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-01-01'
    });
    setShowAddDocModal(true);
  };

  const handleOpenEditDoc = (doc, e) => {
    if (e) e.stopPropagation();
    setEditingDoc(doc);
    setDocForm({
      title: doc.title || '',
      number: doc.number || '',
      category: doc.category || 'General',
      issuer: doc.issuer || 'Transport Authority',
      issueDate: doc.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: doc.expiryDate || ''
    });
  };

  const handleSaveDocument = (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.expiryDate || !activeVehicle) return;

    const today = new Date();
    const exp = new Date(docForm.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    let docStatus = 'valid';
    if (diffDays < 0) docStatus = 'expired';
    else if (diffDays <= 30) docStatus = 'expiring_soon';

    if (editingDoc) {
      // Update
      const updatedDocFields = {
        title: docForm.title,
        number: docForm.number,
        issuer: docForm.issuer,
        expiryDate: docForm.expiryDate,
        status: docStatus,
        daysLeft: diffDays > 0 && diffDays <= 30 ? diffDays : null,
        daysAgo: diffDays < 0 ? Math.abs(diffDays) : null
      };

      const updatedVehicles = vehicles.map(v => {
        if (v.id === activeVehicle.id) {
          const updatedDocs = (v.documents || []).map(d => d.id === editingDoc.id ? { ...d, ...updatedDocFields } : d);
          return { ...v, documents: updatedDocs };
        }
        return v;
      });

      setVehicles(updatedVehicles);
      const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
      if (sel) setSelectedVehicle(sel);
      cloudDb.updateDocument(activeVehicle.id, editingDoc.id, updatedDocFields);
      setEditingDoc(null);
      showNotification(`Document "${docForm.title}" updated successfully!`);
    } else {
      // Add
      const newDoc = {
        id: `d-${Date.now()}`,
        title: docForm.title,
        number: docForm.number || `DOC-${Math.floor(Math.random()*90000+10000)}`,
        issueDate: docForm.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: docForm.expiryDate,
        status: docStatus,
        issuer: docForm.issuer,
        daysLeft: diffDays > 0 && diffDays <= 30 ? diffDays : null,
        daysAgo: diffDays < 0 ? Math.abs(diffDays) : null,
        fileUrl: '#'
      };

      const updatedVehicles = vehicles.map(v => {
        if (v.id === activeVehicle.id) {
          return { ...v, documents: [...(v.documents || []), newDoc] };
        }
        return v;
      });

      setVehicles(updatedVehicles);
      const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
      if (sel) setSelectedVehicle(sel);
      cloudDb.addDocument(activeVehicle.id, newDoc);
      setShowAddDocModal(false);
      showNotification(`Document "${newDoc.title}" stored in vault!`);
    }
  };

  const handleQuickRenew = (doc, e) => {
    if (e) e.stopPropagation();
    if (!activeVehicle) return;

    const today = new Date();
    const newExpiry = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    const updatedDocFields = {
      expiryDate: newExpiry,
      status: 'valid',
      daysLeft: null,
      daysAgo: null,
      renewedAt: new Date().toLocaleDateString()
    };

    const updatedVehicles = vehicles.map(v => {
      if (v.id === activeVehicle.id) {
        const updatedDocs = (v.documents || []).map(d => d.id === doc.id ? { ...d, ...updatedDocFields } : d);
        return { ...v, documents: updatedDocs };
      }
      return v;
    });

    setVehicles(updatedVehicles);
    const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
    if (sel) setSelectedVehicle(sel);
    cloudDb.quickRenewDocument(activeVehicle.id, doc.id, 1);
    showNotification(`⚡ "${doc.title}" renewed for +1 Year (Valid until ${newExpiry})!`);
  };

  const handleDeleteDocConfirm = () => {
    if (!deletingDoc || !activeVehicle) return;

    const updatedVehicles = vehicles.map(v => {
      if (v.id === activeVehicle.id) {
        return { ...v, documents: (v.documents || []).filter(d => d.id !== deletingDoc.id) };
      }
      return v;
    });

    setVehicles(updatedVehicles);
    const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
    if (sel) setSelectedVehicle(sel);
    cloudDb.deleteDocument(activeVehicle.id, deletingDoc.id);
    showNotification(`Document "${deletingDoc.title}" removed from vault.`);
    setDeletingDoc(null);
  };

  // --- SERVICE LOG ACTIONS ---
  const handleOpenAddService = () => {
    setServiceForm({
      date: new Date().toISOString().split('T')[0],
      odometerKm: activeVehicle?.odometerKm ? activeVehicle.odometerKm + 500 : 19000,
      type: 'Periodic Maintenance & Safety Inspection',
      center: 'Koncept Hyundai Authorized Workshop',
      cost: 4200,
      technician: 'Rajesh Verma (Lead Diagnostic Master)',
      notes: 'Synthetic oil replacement, new air & oil filter, brake calliper lubrication, ASAAS ESP32 firmware ping verified.'
    });
    setShowAddServiceModal(true);
  };

  const handleSaveServiceLog = (e) => {
    e.preventDefault();
    if (!activeVehicle) return;

    const newLog = {
      id: `srv-${Date.now()}`,
      date: serviceForm.date,
      odometerKm: Number(serviceForm.odometerKm) || activeVehicle.odometerKm,
      type: serviceForm.type,
      center: serviceForm.center,
      cost: Number(serviceForm.cost) || 0,
      technician: serviceForm.technician,
      notes: serviceForm.notes
    };

    const nextOdo = Math.max(activeVehicle.odometerKm || 0, newLog.odometerKm);
    const nextDue = nextOdo + 10000;

    const updatedVehicles = vehicles.map(v => {
      if (v.id === activeVehicle.id) {
        return {
          ...v,
          odometerKm: nextOdo,
          serviceDueKm: nextDue,
          serviceHistory: [newLog, ...(v.serviceHistory || [])]
        };
      }
      return v;
    });

    setVehicles(updatedVehicles);
    const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
    if (sel) setSelectedVehicle(sel);
    cloudDb.addServiceLog(activeVehicle.id, newLog);
    setShowAddServiceModal(false);
    showNotification(`Service entry logged! Odometer updated to ${nextOdo.toLocaleString()} km.`);
  };

  const handleDeleteServiceConfirm = () => {
    if (!deletingServiceLog || !activeVehicle) return;

    const updatedVehicles = vehicles.map(v => {
      if (v.id === activeVehicle.id) {
        return {
          ...v,
          serviceHistory: (v.serviceHistory || []).filter(s => s.id !== deletingServiceLog.id)
        };
      }
      return v;
    });

    setVehicles(updatedVehicles);
    const sel = updatedVehicles.find(v => v.id === activeVehicle.id);
    if (sel) setSelectedVehicle(sel);
    cloudDb.deleteServiceLog(activeVehicle.id, deletingServiceLog.id);
    showNotification('Service record deleted.');
    setDeletingServiceLog(null);
  };

  // --- DIAGNOSTICS ACTIONS ---
  const handleRunSelfCheck = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        timestamp: new Date().toLocaleTimeString(),
        coreMcu: 'ESP32 Dual-Core Xtensa LX6 @ 240MHz [PASS]',
        mpuSensor: 'MPU6050 6-Axis Gyro/Accelerometer I2C 0x68 [ONLINE - 0.00g ZERO-OFFSET]',
        gpsModule: 'Neo-6M GPS Engine UART 9600 baud [LOCKED - 12 SATS, HDOP 0.7]',
        gsmModule: 'SIM800L Cellular Quad-Band [AIRTEL 4G LTE IoT - RSSI: -64 dBm]',
        relayAudio: '12V High-Decibel Safety Relay Horn [ARMED & STANDBY]',
        batterySupply: '4.18V DC Li-Ion Backup Buffer [HEALTHY 98%]',
        overallHealth: '100% OPERATIONAL'
      });
      showNotification('Hardware diagnostic self-check completed: ALL SENSORS HEALTHY');
    }, 2000);
  };

  const handleCalibrateGyro = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrated(true);
      showNotification('MPU6050 Gyroscope zero-level calibrated on horizontal plane (0.0° Roll, 0.0° Pitch)!');
    }, 1500);
  };

  const handleCheckOta = () => {
    setIsCheckingOta(true);
    setOtaStatus(null);
    setTimeout(() => {
      setIsCheckingOta(false);
      setOtaStatus({
        currentVersion: activeVehicle?.firmwareVersion || 'v2.4.1-OTA',
        latestAvailable: 'v2.4.1-OTA',
        status: 'UP TO DATE',
        checkedAt: new Date().toLocaleTimeString()
      });
      showNotification('Hardware node firmware is on the latest production build.');
    }, 1400);
  };

  // Collect all expiring or expired docs across all vehicles for alerts
  const allDocuments = vehicles.flatMap(v => 
    (v.documents || []).map(d => ({ ...d, vehicleName: v.name, regNo: v.registrationNumber, vehicleId: v.id }))
  );
  const expiredDocs = allDocuments.filter(d => d.status === 'expired');
  const expiringSoonDocs = allDocuments.filter(d => d.status === 'expiring_soon');

  // Filtered active vehicle documents
  const activeVehicleDocs = (activeVehicle?.documents || []).filter(d => {
    if (docFilter === 'all') return true;
    return d.status === docFilter;
  });

  return (
    <div className="tab-content-container">
      {/* VEHICLE OWNER TOP HEADER WITH ACTIVE VEHICLE QUICK HUD */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'linear-gradient(135deg, rgba(12, 12, 12, 0.95) 0%, rgba(245, 158, 11, 0.08) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            {activeVehicle?.type === 'two-wheeler' ? <Bike size={26} color="#f59e0b" /> : <Car size={26} color="#f59e0b" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0, fontWeight: 800 }}>
                {activeVehicle?.name || 'My Garage'}
              </h2>
              <span className="mono" style={{ 
                background: '#1e293b', 
                color: '#fbbf24', 
                padding: '2px 8px', 
                borderRadius: '6px', 
                fontSize: '0.8rem',
                border: '1px solid rgba(251, 191, 36, 0.3)' 
              }}>
                {activeVehicle?.registrationNumber}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Node: <strong style={{ color: '#f8fafc' }}>{activeVehicle?.espDeviceId}</strong> | Powertrain: <span style={{ color: '#cbd5e1' }}>{activeVehicle?.fuelType || 'Petrol'}</span> | Odometer: <span className="mono" style={{ color: '#34d399' }}>{(activeVehicle?.odometerKm || 0).toLocaleString()} km</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleOpenAddVehicle} 
            className="btn btn-primary" 
            style={{ fontSize: '0.82rem', padding: '9px 16px' }}
          >
            <Plus size={16} /> Register Vehicle
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
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
          justifyContent: 'space-between',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUB-NAVIGATION TABS BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '8px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setSubTab('garage')}
          className={`btn ${subTab === 'garage' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px' }}
        >
          <Car size={16} /> My Garage & Vehicles ({vehicles.length})
        </button>

        <button
          onClick={() => setSubTab('vault')}
          className={`btn ${subTab === 'vault' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px', position: 'relative' }}
        >
          <FileText size={16} /> Document Vault & Expiry Radar
          {(expiredDocs.length > 0 || expiringSoonDocs.length > 0) && (
            <span style={{
              background: expiredDocs.length > 0 ? '#ef4444' : '#f59e0b',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '6px'
            }}>
              {expiredDocs.length + expiringSoonDocs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('service')}
          className={`btn ${subTab === 'service' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px' }}
        >
          <Wrench size={16} /> Service & Maintenance Logbook
        </button>

        <button
          onClick={() => setSubTab('diagnostics')}
          className={`btn ${subTab === 'diagnostics' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px' }}
        >
          <Cpu size={16} /> Hardware Node Diagnostics
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MY GARAGE & VEHICLES */}
      {/* ========================================================================= */}
      {subTab === 'garage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Vehicle Telemetry Summary Strip */}
          {activeVehicle && (
            <div className="glass-card" style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>ODOMETER READING</div>
                  <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }} className="mono">
                    {(activeVehicle.odometerKm || 0).toLocaleString()} km
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>NEXT SERVICE DUE</div>
                  <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }} className="mono">
                    {(activeVehicle.serviceDueKm || (activeVehicle.odometerKm + 5000)).toLocaleString()} km
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>BATTERY HEALTH</div>
                  <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>
                    {activeVehicle.batteryHealth || 98}% (Optimal)
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>TIRE PRESSURE (TPMS)</div>
                  <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }} className="mono">
                    {activeVehicle.type === 'two-wheeler' ? 'F: 32 | R: 36 PSI' : 'F: 33 | R: 32 PSI'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>VAULT DOCUMENTS</div>
                  <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>
                    {(activeVehicle.documents || []).length} Records
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Garage Vehicles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
            {vehicles.map(v => {
              const isSelected = v.id === activeVehicle?.id;
              const Icon = v.type === 'two-wheeler' ? Bike : Car;
              const docCount = (v.documents || []).length;
              const hasExpired = (v.documents || []).some(d => d.status === 'expired');
              const hasExpiringSoon = (v.documents || []).some(d => d.status === 'expiring_soon');

              return (
                <div 
                  key={v.id} 
                  className="glass-card"
                  style={{
                    padding: '22px',
                    border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(10, 10, 10, 0.95) 100%)' : 'rgba(12, 12, 12, 0.85)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedVehicle(v);
                    cloudDb.setSelectedVehicleId(v.id);
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={22} color={isSelected ? '#f59e0b' : '#94a3b8'} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                          {v.name}
                        </h3>
                        <span className="mono" style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                          {v.registrationNumber}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> ACTIVE
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(v);
                          cloudDb.setSelectedVehicleId(v.id);
                        }} 
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        Select
                      </button>
                    )}
                  </div>

                  {/* Vehicle Specs Grid */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Hardware Node:</span>
                      <strong className="mono" style={{ color: '#f59e0b' }}>{v.espDeviceId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>VIN / Chassis:</span>
                      <span className="mono" style={{ color: '#cbd5e1' }}>{v.vin || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Category & Fuel:</span>
                      <span>{v.category || (v.type === 'two-wheeler' ? 'Motorcycle' : 'Sedan')} ({v.fuelType || 'Petrol'})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Color & Year:</span>
                      <span>{v.color || 'Standard'} • {v.year || '2024'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Odometer:</span>
                      <strong className="mono" style={{ color: '#34d399' }}>{(v.odometerKm || 0).toLocaleString()} km</strong>
                    </div>
                  </div>

                  {/* Document & Service Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>📁 {docCount} Docs</span>
                      {hasExpired && <span className="badge badge-danger" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>EXPIRED</span>}
                      {!hasExpired && hasExpiringSoon && <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>EXPIRING</span>}
                      {!hasExpired && !hasExpiringSoon && <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>ALL VALID</span>}
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {(v.serviceHistory || []).length} Services
                    </span>
                  </div>

                  {/* Card Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <button
                      onClick={(e) => handleOpenEditVehicle(v, e)}
                      className="btn btn-ghost"
                      style={{ flex: 1, padding: '7px', fontSize: '0.76rem' }}
                    >
                      <Edit3 size={13} /> Edit Specs
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(v);
                        cloudDb.setSelectedVehicleId(v.id);
                        setSubTab('vault');
                      }}
                      className="btn btn-ghost"
                      style={{ flex: 1, padding: '7px', fontSize: '0.76rem' }}
                    >
                      <FileText size={13} /> Vault
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingVehicle(v);
                      }}
                      className="btn btn-outline-danger"
                      style={{ padding: '7px 10px', fontSize: '0.76rem' }}
                      title="Remove Vehicle"
                      disabled={vehicles.length <= 1}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DIGITAL DOCUMENT VAULT & EXPIRY RADAR */}
      {/* ========================================================================= */}
      {subTab === 'vault' && activeVehicle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* RADAR ALERTS BANNER */}
          {(expiredDocs.length > 0 || expiringSoonDocs.length > 0) && (
            <div className="glass-card" style={{ padding: '18px 20px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(20, 15, 5, 0.9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24', fontSize: '0.96rem', fontWeight: 700, marginBottom: '12px' }}>
                <AlertTriangle size={20} /> ⏰ Vehicle Compliance Radar (Action Required)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {expiredDocs.map(d => (
                  <div key={d.id} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.84rem' }}>{d.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{d.vehicleName} ({d.regNo})</div>
                    </div>
                    <button onClick={(e) => handleQuickRenew(d, e)} className="btn btn-emergency" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                      ⚡ Renew Now
                    </button>
                  </div>
                ))}

                {expiringSoonDocs.map(d => (
                  <div key={d.id} style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.84rem' }}>{d.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Expires in {d.daysLeft || 12} days ({d.vehicleName})</div>
                    </div>
                    <button onClick={(e) => handleQuickRenew(d, e)} className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                      ⚡ Renew
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Vault Controls */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#f59e0b" /> Digital Document Vault for {activeVehicle.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  RC, Motor Insurance, PUC, Driving License & Road Tax records with 1-click renewal
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Filter Selector */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                  {['all', 'valid', 'expiring_soon', 'expired'].map(status => (
                    <button
                      key={status}
                      onClick={() => setDocFilter(status)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        background: docFilter === status ? '#f59e0b' : 'transparent',
                        color: docFilter === status ? '#000' : '#94a3b8',
                        fontWeight: docFilter === status ? 700 : 500
                      }}
                    >
                      {status.toUpperCase().replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button onClick={handleOpenAddDoc} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  <PlusCircle size={15} /> Upload Document
                </button>
              </div>
            </div>

            {/* Documents Table */}
            <div className="touch-scroll-x no-scrollbar" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>DOCUMENT NAME & ISSUER</th>
                    <th style={{ padding: '12px' }}>POLICY / REG NO.</th>
                    <th style={{ padding: '12px' }}>EXPIRY DATE</th>
                    <th style={{ padding: '12px' }}>COMPLIANCE STATUS</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVehicleDocs.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{doc.issuer || 'Government Authority'}</div>
                      </td>

                      <td style={{ padding: '12px', color: '#cbd5e1' }} className="mono">
                        {doc.number}
                      </td>

                      <td style={{ padding: '12px', color: '#cbd5e1' }} className="mono">
                        {doc.expiryDate}
                        {doc.renewedAt && (
                          <div style={{ fontSize: '0.7rem', color: '#34d399' }}>✓ Renewed: {doc.renewedAt}</div>
                        )}
                      </td>

                      <td style={{ padding: '12px' }}>
                        {doc.status === 'valid' && <span className="badge badge-success">VALID</span>}
                        {doc.status === 'expiring_soon' && <span className="badge badge-warning">EXPIRING IN {doc.daysLeft || 12}D</span>}
                        {doc.status === 'expired' && <span className="badge badge-danger">EXPIRED ({doc.daysAgo || 7}D AGO)</span>}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setViewingDocCertificate(doc)}
                            className="btn btn-ghost"
                            style={{ padding: '5px 9px', fontSize: '0.72rem' }}
                            title="View DigiLocker Certificate"
                          >
                            <Eye size={12} /> View
                          </button>

                          {(doc.status === 'expired' || doc.status === 'expiring_soon') && (
                            <button
                              onClick={(e) => handleQuickRenew(doc, e)}
                              className="btn btn-primary"
                              style={{ padding: '5px 9px', fontSize: '0.72rem' }}
                              title="Quick Renew for +1 Year"
                            >
                              ⚡ +1 Yr
                            </button>
                          )}

                          <button
                            onClick={(e) => handleOpenEditDoc(doc, e)}
                            className="btn btn-ghost"
                            style={{ padding: '5px 9px', fontSize: '0.72rem' }}
                            title="Edit Document"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => setDeletingDoc(doc)}
                            className="btn btn-outline-danger"
                            style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                            title="Delete Document"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeVehicleDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        No documents found matching the filter "{docFilter}". Click "Upload Document" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SERVICE & MAINTENANCE LOGBOOK */}
      {/* ========================================================================= */}
      {subTab === 'service' && activeVehicle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Service Vitals Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL SERVICE SPEND</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                ₹{((activeVehicle.serviceHistory || []).reduce((acc, curr) => acc + (curr.cost || 0), 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: '4px' }}>
                ✓ {(activeVehicle.serviceHistory || []).length} Recorded Maintenance Cycles
              </div>
            </div>

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT ODOMETER</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }} className="mono">
                {(activeVehicle.odometerKm || 0).toLocaleString()} km
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                Recorded via CAN-bus / Service Logs
              </div>
            </div>

            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>NEXT SCHEDULED SERVICE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }} className="mono">
                {(activeVehicle.serviceDueKm || (activeVehicle.odometerKm + 5000)).toLocaleString()} km
              </div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '4px' }}>
                In {Math.max(0, (activeVehicle.serviceDueKm || (activeVehicle.odometerKm + 5000)) - (activeVehicle.odometerKm || 0)).toLocaleString()} km remaining
              </div>
            </div>
          </div>

          {/* Service Log Table & Header */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={20} color="#f59e0b" /> Scheduled Maintenance History & Invoices
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Track oil changes, brake pads, tire rotations, and authorized service center receipts
                </p>
              </div>

              <button onClick={handleOpenAddService} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                <Plus size={15} /> Log New Service
              </button>
            </div>

            {/* Service Records Table */}
            <div className="touch-scroll-x no-scrollbar" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>DATE & WORKSHOP</th>
                    <th style={{ padding: '12px' }}>ODOMETER</th>
                    <th style={{ padding: '12px' }}>SERVICE TYPE & REMARKS</th>
                    <th style={{ padding: '12px' }}>COST (₹)</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeVehicle.serviceHistory || []).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{log.date}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{log.center}</div>
                        {log.technician && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tech: {log.technician}</div>}
                      </td>

                      <td style={{ padding: '12px', color: '#cbd5e1' }} className="mono">
                        {(log.odometerKm || 0).toLocaleString()} km
                      </td>

                      <td style={{ padding: '12px', color: '#cbd5e1', maxWidth: '320px' }}>
                        <strong style={{ color: '#fbbf24' }}>{log.type}</strong>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>{log.notes}</div>
                      </td>

                      <td style={{ padding: '12px', color: '#34d399', fontWeight: 700 }} className="mono">
                        ₹{(log.cost || 0).toLocaleString()}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => setDeletingServiceLog(log)}
                          className="btn btn-outline-danger"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="Delete Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!activeVehicle.serviceHistory || activeVehicle.serviceHistory.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        No service logs yet for {activeVehicle.name}. Click "Log New Service" to record your maintenance history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: HARDWARE NODE & IOT DIAGNOSTICS */}
      {/* ========================================================================= */}
      {subTab === 'diagnostics' && activeVehicle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                    ASAAS Telemetry Node ({activeVehicle.espDeviceId})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    ESP32-WROOM-32 IoT telemetry gateway with MPU6050 6-Axis IMU & Neo-6M GPS Engine
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRunSelfCheck}
                  disabled={isScanning}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                >
                  <Activity size={14} className={isScanning ? 'spin' : ''} /> {isScanning ? 'Running Self-Check...' : 'Run Hardware Self-Check'}
                </button>

                <button
                  onClick={handleCalibrateGyro}
                  disabled={isCalibrating}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <RefreshCw size={14} className={isCalibrating ? 'spin' : ''} /> {isCalibrating ? 'Calibrating...' : 'Calibrate Gyro Level'}
                </button>

                <button
                  onClick={handleCheckOta}
                  disabled={isCheckingOta}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Sparkles size={14} /> Check Firmware OTA
                </button>
              </div>
            </div>

            {/* Sensor Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ACCELEROMETER & GYRO</div>
                <div style={{ color: '#34d399', fontWeight: 800, marginTop: '4px' }}>MPU-6050 I2C (Healthy ✓)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {calibrated ? '✓ Zero-level calibrated just now' : 'Factory Calibrated (±16g range)'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>SATELLITE NAVIGATION</div>
                <div style={{ color: '#34d399', fontWeight: 800, marginTop: '4px' }}>Neo-6M GPS (Locked ✓)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>12 Satellites Fix | HDOP: 0.7m</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>CELLULAR MODEM</div>
                <div style={{ color: '#34d399', fontWeight: 800, marginTop: '4px' }}>SIM800L GSM (Online ✓)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Airtel 4G IoT | -64 dBm RSSI</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>FIRMWARE VERSION</div>
                <div style={{ color: '#fbbf24', fontWeight: 800, marginTop: '4px' }} className="mono">
                  {activeVehicle.firmwareVersion || 'v2.4.1-OTA'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {otaStatus ? `OTA Status: ${otaStatus.status}` : 'Production OTA Ready'}
                </div>
              </div>
            </div>

            {/* Diagnostic Results Box */}
            {scanResult && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px 20px',
                borderRadius: '12px',
                marginTop: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> COMPREHENSIVE HARDWARE SELF-CHECK PASSED ({scanResult.timestamp})
                  </strong>
                  <span className="badge badge-success">{scanResult.overallHealth}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }} className="mono">
                  <div>• {scanResult.coreMcu}</div>
                  <div>• {scanResult.mpuSensor}</div>
                  <div>• {scanResult.gpsModule}</div>
                  <div>• {scanResult.gsmModule}</div>
                  <div>• {scanResult.relayAudio}</div>
                  <div>• {scanResult.batterySupply}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT VEHICLE MODAL */}
      {/* ========================================================================= */}
      {(showAddVehicleModal || editingVehicle) && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(640px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Car size={22} color="#f59e0b" />
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                  {editingVehicle ? `Edit Specifications: ${editingVehicle.name}` : 'Register New Vehicle to Garage'}
                </h3>
              </div>
              <button 
                onClick={() => { setShowAddVehicleModal(false); setEditingVehicle(null); }} 
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>VEHICLE NAME & MODEL *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mahindra XUV700 AX7"
                  value={vehicleForm.name}
                  onChange={e => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>REGISTRATION NUMBER (PLATE) *</label>
                <input 
                  type="text" 
                  placeholder="e.g. DL-01-AB-9921"
                  value={vehicleForm.registrationNumber}
                  onChange={e => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>VEHICLE TYPE</label>
                <select 
                  value={vehicleForm.type}
                  onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                >
                  <option value="four-wheeler">Four-Wheeler (Car / SUV / EV)</option>
                  <option value="two-wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                <input 
                  type="text" 
                  placeholder="e.g. Compact SUV / Adventure Bike"
                  value={vehicleForm.category}
                  onChange={e => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>VIN / CHASSIS NUMBER</label>
                <input 
                  type="text" 
                  placeholder="e.g. MALC341C89M992100"
                  value={vehicleForm.vin}
                  onChange={e => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ENGINE / MOTOR SERIAL</label>
                <input 
                  type="text" 
                  placeholder="e.g. ENG-992104"
                  value={vehicleForm.engineNumber}
                  onChange={e => setVehicleForm({ ...vehicleForm, engineNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>POWERTRAIN / FUEL TYPE</label>
                <input 
                  type="text" 
                  placeholder="e.g. Petrol Turbo / EV / Diesel"
                  value={vehicleForm.fuelType}
                  onChange={e => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>COLOR & YEAR</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Color"
                    value={vehicleForm.color}
                    onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Year"
                    value={vehicleForm.year}
                    onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    style={{ width: '80px', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ODOMETER READING (KM)</label>
                <input 
                  type="number" 
                  value={vehicleForm.odometerKm}
                  onChange={e => setVehicleForm({ ...vehicleForm, odometerKm: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PAIRED ESP32 DEVICE ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ASAAS-003"
                  value={vehicleForm.espDeviceId}
                  onChange={e => setVehicleForm({ ...vehicleForm, espDeviceId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowAddVehicleModal(false); setEditingVehicle(null); }} 
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Save Modifications' : 'Register Vehicle & Pair Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE VEHICLE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingVehicle && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(420px, 90vw)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                  Remove Vehicle from Garage?
                </h3>
                <span className="mono" style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  {deletingVehicle.name} ({deletingVehicle.registrationNumber})
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              This will remove this vehicle and its paired hardware node records from your active garage profile.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingVehicle(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleDeleteVehicleConfirm} className="btn btn-emergency">
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT DOCUMENT MODAL */}
      {/* ========================================================================= */}
      {(showAddDocModal || editingDoc) && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(460px, 92vw)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                {editingDoc ? `Edit Document: ${editingDoc.title}` : `Upload Document for ${activeVehicle?.name}`}
              </h3>
              <button 
                onClick={() => { setShowAddDocModal(false); setEditingDoc(null); }} 
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Document Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Motor Insurance Policy / PUC"
                  value={docForm.title}
                  onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Policy / Certificate Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. POL-882019"
                  value={docForm.number}
                  onChange={e => setDocForm({ ...docForm, number: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Issuing Authority / Insurance Co.</label>
                <input 
                  type="text" 
                  placeholder="e.g. HDFC Ergo / RTO Delhi"
                  value={docForm.issuer}
                  onChange={e => setDocForm({ ...docForm, issuer: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Expiry Date *</label>
                <input 
                  type="date" 
                  value={docForm.expiryDate}
                  onChange={e => setDocForm({ ...docForm, expiryDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowAddDocModal(false); setEditingDoc(null); }} 
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDoc ? 'Save Changes' : 'Save Document to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE DOCUMENT CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingDoc && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(400px, 90vw)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0 0 10px 0', fontWeight: 700 }}>
              Delete Document?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#f8fafc' }}>{deletingDoc.title}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingDoc(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleDeleteDocConfirm} className="btn btn-emergency">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DIGILOCKER / GOVT DIGITAL PASS PREVIEW */}
      {/* ========================================================================= */}
      {viewingDocCertificate && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(500px, 94vw)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700 }}>
                  VERIFIED DIGITAL CERTIFICATE
                </h3>
              </div>
              <button onClick={() => setViewingDocCertificate(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '0.84rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>CREDENTIAL TYPE</div>
                  <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{viewingDocCertificate.title}</strong>
                </div>
                <span className="badge badge-success">DIGILOCKER VERIFIED ✓</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#cbd5e1' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>VEHICLE REGISTRATION</span>
                  <div className="mono" style={{ fontWeight: 700, color: '#fbbf24' }}>{activeVehicle?.registrationNumber}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>POLICY / IDENTIFIER</span>
                  <div className="mono" style={{ fontWeight: 700 }}>{viewingDocCertificate.number}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ISSUING AUTHORITY</span>
                  <div>{viewingDocCertificate.issuer || 'Ministry of Transport'}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>VALID UNTIL</span>
                  <div className="mono" style={{ fontWeight: 700, color: viewingDocCertificate.status === 'expired' ? '#ef4444' : '#34d399' }}>
                    {viewingDocCertificate.expiryDate}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                🔐 Cryptographically Authenticated & Linked to ASAAS Telemetry Core
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setViewingDocCertificate(null)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: LOG NEW SERVICE ENTRY */}
      {/* ========================================================================= */}
      {showAddServiceModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(480px, 92vw)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} color="#f59e0b" /> Log Maintenance for {activeVehicle?.name}
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveServiceLog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Service Date</label>
                  <input 
                    type="date" 
                    value={serviceForm.date}
                    onChange={e => setServiceForm({ ...serviceForm, date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Odometer at Service (km)</label>
                  <input 
                    type="number" 
                    value={serviceForm.odometerKm}
                    onChange={e => setServiceForm({ ...serviceForm, odometerKm: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Service Type</label>
                <input 
                  type="text" 
                  placeholder="e.g. Periodic Service / Brake Pads / Oil Change"
                  value={serviceForm.type}
                  onChange={e => setServiceForm({ ...serviceForm, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Workshop / Center</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Authorized Workshop"
                    value={serviceForm.center}
                    onChange={e => setServiceForm({ ...serviceForm, center: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Cost Invoiced (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 4500"
                    value={serviceForm.cost}
                    onChange={e => setServiceForm({ ...serviceForm, cost: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Work Done / Parts Replaced Notes</label>
                <textarea 
                  rows={3}
                  value={serviceForm.notes}
                  onChange={e => setServiceForm({ ...serviceForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DELETE SERVICE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingServiceLog && (
        <div className="modal-overlay">
          <div className="glass-card modal-content-responsive" style={{ width: 'min(400px, 90vw)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0 0 10px 0', fontWeight: 700 }}>
              Delete Service Record?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Are you sure you want to delete the maintenance record from {deletingServiceLog.date} ({deletingServiceLog.type})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingServiceLog(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleDeleteServiceConfirm} className="btn btn-emergency">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
