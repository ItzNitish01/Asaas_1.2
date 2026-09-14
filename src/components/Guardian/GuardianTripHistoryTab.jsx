import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle2, 
  X, 
  Calendar,
  Zap,
  Car,
  Bike,
  Plus
} from 'lucide-react';
import cloudDb from '../../services/cloudDbEngine';

export default function GuardianTripHistoryTab() {
  const [dbState, setDbState] = useState(cloudDb.getState());
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportTrip, setSelectedReportTrip] = useState(null);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

  // Add Trip Form State
  const [newTripMember, setNewTripMember] = useState('Alex Mercer');
  const [newTripVehicle, setNewTripVehicle] = useState('Hyundai Creta [DL-01-AB-1234]');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');
  const [newTripDist, setNewTripDist] = useState('12.5');
  const [newTripDuration, setNewTripDuration] = useState('28');
  const [newTripMaxSpeed, setNewTripMaxSpeed] = useState('65');

  useEffect(() => {
    const unsubscribe = cloudDb.subscribe((newState) => {
      setDbState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const tripLogs = dbState.familyTripLogs || [];

  const filteredTrips = tripLogs.filter(trip => {
    const matchesSearch = 
      trip.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.startLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.endLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'CRASH') return trip.status?.includes('Crash') || trip.harshEvents > 1;
    if (filterType === 'ACTIVE') return trip.status?.includes('Active') || trip.status?.includes('Progress');
    if (filterType === 'COMPLETED') return trip.status?.includes('Completed');
    return true;
  });

  const handleCreateTrip = (e) => {
    e.preventDefault();
    cloudDb.addFamilyTripLog({
      memberName: newTripMember,
      vehicle: newTripVehicle,
      startLocation: newTripStart || 'Origin Location',
      endLocation: newTripEnd || 'Destination Location',
      distanceKm: parseFloat(newTripDist) || 10,
      durationMins: parseInt(newTripDuration, 10) || 25,
      maxSpeedKmh: parseInt(newTripMaxSpeed, 10) || 60,
      avgSpeedKmh: Math.round((parseFloat(newTripDist) / (parseInt(newTripDuration, 10) / 60)) || 35),
      status: 'Completed Safely',
      safetyScore: 96,
      harshEvents: 0
    });
    setIsAddTripModalOpen(false);
    setNewTripStart('');
    setNewTripEnd('');
  };

  return (
    <div className="terminal-container" style={{
      padding: '20px',
      maxWidth: '1240px',
      margin: '0 auto',
      color: '#f1f5f9',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #3b0764 0%, #1e1b4b 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '22px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.2)',
            border: '2px solid #c084fc',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <History size={28} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                FAMILY TRIP & INCIDENT HISTORY ARCHIVE
              </h1>
              <span style={{
                background: '#7e22ce',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                TELEMETRY LOGS
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
              Automated trip tracking, geofence enter/exit records, driving safety audits, and crash forensic timeline
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddTripModalOpen(true)}
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
          }}
        >
          <Plus size={16} /> Log Completed Journey
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Journeys Monitored</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{tripLogs.length} Trips</div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px' }}>100% cloud telemetry verified</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Family Safety Index</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>96.2 / 100</div>
          <div style={{ fontSize: '0.74rem', color: '#6ee7b7', marginTop: '4px' }}>Low harsh deceleration events</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Geofence Boundaries</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
            {dbState.geofenceZones?.length || 4} Zones
          </div>
          <div style={{ fontSize: '0.74rem', color: '#7dd3fc', marginTop: '4px' }}>Safe arrival alerts armed</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Emergency Crash Events</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: dbState.activeIncident ? '#ef4444' : '#10b981', marginTop: '4px' }}>
            {dbState.activeIncident ? '1 Active' : '0 Active'}
          </div>
          <div style={{ fontSize: '0.74rem', color: dbState.activeIncident ? '#fca5a5' : '#6ee7b7', marginTop: '4px' }}>
            {dbState.activeIncident ? 'Incident alert broadcasting' : 'All family members safe'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by driver name, vehicle, or route location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.86rem',
              outline: 'none',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'COMPLETED', 'ACTIVE', 'CRASH'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: filterType === type ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                background: filterType === type ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: filterType === type ? '#f3e8ff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredTrips.map(trip => (
          <div
            key={trip.id}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: trip.status?.includes('Active') ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {trip.vehicle?.includes('Activa') ? '🛵' : '🚗'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#fff' }}>{trip.memberName}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>• {trip.vehicle}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Calendar size={13} /> {trip.date}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: trip.status?.includes('Active') ? 'rgba(56, 189, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                  color: trip.status?.includes('Active') ? '#7dd3fc' : '#6ee7b7',
                  border: trip.status?.includes('Active') ? '1px solid #38bdf8' : '1px solid #10b981'
                }}>
                  {trip.status}
                </span>

                <button
                  onClick={() => setSelectedReportTrip(trip)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} color="#c084fc" /> View Safety Dossier
                </button>
              </div>
            </div>

            {/* Route & Telemetry Strip */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>ROUTE DEPARTURE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#f59e0b" /> {trip.startLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>DESTINATION ARRIVAL</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Navigation size={13} color="#10b981" /> {trip.endLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>DISTANCE & TIME</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {trip.distanceKm} km • {trip.durationMins} mins
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>MAX SPEED / AVG</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                  {trip.maxSpeedKmh} km/h <span style={{ color: '#64748b', fontSize: '0.74rem' }}>({trip.avgSpeedKmh} avg)</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>SAFETY AUDIT SCORE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                  {trip.safetyScore} / 100
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No trips found matching your filter or search criteria.
          </div>
        )}
      </div>

      {/* Printable Safety Report Modal */}
      {selectedReportTrip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: '#0b1329',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#c084fc" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Official Family Driving Safety Certificate</h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ASAAS Cloud Telemetry Certified Audit</div>
                </div>
              </div>
              <button onClick={() => setSelectedReportTrip(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem' }}>
                <div><span style={{ color: '#94a3b8' }}>Driver:</span> <strong style={{ color: '#fff' }}>{selectedReportTrip.memberName}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Vehicle:</span> <strong style={{ color: '#fff' }}>{selectedReportTrip.vehicle}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Trip Date:</span> <strong style={{ color: '#fff' }}>{selectedReportTrip.date}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Duration:</span> <strong style={{ color: '#fff' }}>{selectedReportTrip.durationMins} minutes</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Distance Covered:</span> <strong style={{ color: '#fff' }}>{selectedReportTrip.distanceKm} km</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Max Recorded Speed:</span> <strong style={{ color: '#38bdf8' }}>{selectedReportTrip.maxSpeedKmh} km/h</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Harsh Events (Brake/Turn):</span> <strong style={{ color: '#10b981' }}>{selectedReportTrip.harshEvents} Events</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Safety Score:</span> <strong style={{ color: '#10b981' }}>{selectedReportTrip.safetyScore} / 100</strong></div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
              This document certifies that the journey between <strong>{selectedReportTrip.startLocation}</strong> and <strong>{selectedReportTrip.endLocation}</strong> was continuously monitored by the Automated System for Accident Alert & Safety (ASAAS) IoT node. No critical impact deceleration anomalies were logged.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> Print Safety Certificate
              </button>
              <button
                onClick={() => setSelectedReportTrip(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Completed Trip Modal */}
      {isAddTripModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <form onSubmit={handleCreateTrip} style={{
            background: '#0b1329',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Log Family Journey Record</h3>
              <button type="button" onClick={() => setIsAddTripModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Family Member</label>
                <select
                  value={newTripMember}
                  onChange={(e) => {
                    setNewTripMember(e.target.value);
                    if (e.target.value === 'Rohan Mercer') setNewTripVehicle('Honda Activa [DL-04-XY-8821]');
                    else if (e.target.value === 'Eleanor Mercer') setNewTripVehicle('Maruti Baleno [HR-26-DQ-5512]');
                    else setNewTripVehicle('Hyundai Creta [DL-01-AB-1234]');
                  }}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                >
                  <option value="Alex Mercer" style={{ background: '#0f172a' }}>Alex Mercer (Spouse)</option>
                  <option value="Rohan Mercer" style={{ background: '#0f172a' }}>Rohan Mercer (Son)</option>
                  <option value="Eleanor Mercer" style={{ background: '#0f172a' }}>Eleanor Mercer (Daughter)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Departure Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 56 Home"
                  value={newTripStart}
                  onChange={(e) => setNewTripStart(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Destination Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLF Cyber Hub"
                  value={newTripEnd}
                  onChange={(e) => setNewTripEnd(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Distance (km)</label>
                  <input
                    type="number"
                    value={newTripDist}
                    onChange={(e) => setNewTripDist(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Duration (min)</label>
                  <input
                    type="number"
                    value={newTripDuration}
                    onChange={(e) => setNewTripDuration(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Max Speed</label>
                  <input
                    type="number"
                    value={newTripMaxSpeed}
                    onChange={(e) => setNewTripMaxSpeed(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsAddTripModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '9px 16px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Save Journey Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

