"""
ASAAS Database Seeder

Seeds:
  - 4 RBAC user accounts (admin, hospital, police, owner)
  - Level-1 Trauma hospitals across India (Bangalore, Delhi, Mumbai, Hyderabad, Gurugram)
  - Police control rooms and highway patrol units
  - Demo vehicle + medical profile + emergency contacts

Usage:
    cd backend
    python -m database.seed
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, init_db, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.medical import MedicalProfile, EmergencyContact
from app.models.spatial import Hospital, PoliceStation

# Import all models so metadata is populated
import app.models.user      # noqa
import app.models.vehicle   # noqa
import app.models.medical   # noqa
import app.models.spatial   # noqa
import app.models.incident  # noqa


HOSPITALS = [
    # Delhi / NCR
    {"name": "AIIMS Apex Trauma Centre, New Delhi", "hospital_type": "Trauma Center Level 1",
     "address": "Sri Aurobindo Marg, New Delhi - 110029", "lat": 28.5672, "lng": 77.2100,
     "phone": "+91 11 2659 8600", "total_icu_beds": 40, "available_icu_beds": 12,
     "blood_bank_status": "O+, B+, A+ Stock Full", "trauma_level": "Level 1", "city": "New Delhi"},
    {"name": "Medanta - The Medicity, Gurugram", "hospital_type": "Multi-Super Specialty & Trauma",
     "address": "Sector 38, Gurugram - 122001", "lat": 28.4394, "lng": 77.0423,
     "phone": "+91 124 414 1414", "total_icu_beds": 65, "available_icu_beds": 18,
     "blood_bank_status": "All Units Adequate", "trauma_level": "Level 1", "city": "Gurugram"},
    {"name": "Fortis Memorial Research Institute (FMRI)", "hospital_type": "Level 1 Emergency Center",
     "address": "Sector 44, Gurugram - 122002", "lat": 28.4595, "lng": 77.0726,
     "phone": "+91 124 496 2200", "total_icu_beds": 35, "available_icu_beds": 9,
     "blood_bank_status": "Adequate", "trauma_level": "Level 1", "city": "Gurugram"},
    # Bangalore
    {"name": "Victoria Hospital Trauma Centre, Bengaluru", "hospital_type": "Government Trauma Level 1",
     "address": "Fort Road, Bengaluru - 560002", "lat": 12.9642, "lng": 77.5799,
     "phone": "+91 80 2670 1150", "total_icu_beds": 50, "available_icu_beds": 14,
     "blood_bank_status": "O+, O-, A+ Available", "trauma_level": "Level 1", "city": "Bengaluru"},
    {"name": "Manipal Hospital Hebbal, Bengaluru", "hospital_type": "Multi-Specialty & Trauma",
     "address": "Hebbal, Bengaluru - 560024", "lat": 13.0358, "lng": 77.5970,
     "phone": "+91 80 2502 4444", "total_icu_beds": 45, "available_icu_beds": 11,
     "blood_bank_status": "Full Stock", "trauma_level": "Level 1", "city": "Bengaluru"},
    # Mumbai
    {"name": "LTMG Hospital Sion, Mumbai", "hospital_type": "Government Trauma Level 1",
     "address": "Sion, Mumbai - 400022", "lat": 19.0396, "lng": 72.8697,
     "phone": "+91 22 2407 6381", "total_icu_beds": 60, "available_icu_beds": 15,
     "blood_bank_status": "All Groups Available", "trauma_level": "Level 1", "city": "Mumbai"},
    {"name": "KEM Hospital, Mumbai", "hospital_type": "Government Trauma Level 1",
     "address": "Parel, Mumbai - 400012", "lat": 18.9975, "lng": 72.8404,
     "phone": "+91 22 2410 7000", "total_icu_beds": 75, "available_icu_beds": 20,
     "blood_bank_status": "Adequate", "trauma_level": "Level 1", "city": "Mumbai"},
    # Hyderabad
    {"name": "Osmania General Hospital, Hyderabad", "hospital_type": "Government Trauma Level 1",
     "address": "Afzalgunj, Hyderabad - 500012", "lat": 17.3720, "lng": 78.4620,
     "phone": "+91 40 2461 0021", "total_icu_beds": 40, "available_icu_beds": 10,
     "blood_bank_status": "O+, A+ Available", "trauma_level": "Level 1", "city": "Hyderabad"},
    {"name": "Apollo Hospitals, Jubilee Hills, Hyderabad", "hospital_type": "Private Trauma Level 1",
     "address": "Jubilee Hills, Hyderabad - 500033", "lat": 17.4239, "lng": 78.4085,
     "phone": "+91 40 2360 7777", "total_icu_beds": 55, "available_icu_beds": 16,
     "blood_bank_status": "Full Stock", "trauma_level": "Level 1", "city": "Hyderabad"},
]

POLICE_STATIONS = [
    {"name": "Sushant Lok Police Station & PCR Hub", "division": "Gurugram East Division",
     "address": "Sushant Lok Phase 1, Gurugram - 122001", "lat": 28.4682, "lng": 77.0782,
     "phone": "+91 124 238 5100", "active_interceptors": 6, "pcr_code": "PCR-GGM-112", "city": "Gurugram"},
    {"name": "DLF Phase-2 Traffic Police Post", "division": "Highway Traffic Zone 3",
     "address": "DLF Phase 2, Gurugram - 122002", "lat": 28.4900, "lng": 77.0890,
     "phone": "+91 124 256 0100", "active_interceptors": 4, "pcr_code": "PCR-GGM-07", "city": "Gurugram"},
    {"name": "Sion Police Station, Mumbai", "division": "Zone IV, Mumbai Police",
     "address": "Sion (East), Mumbai - 400022", "lat": 19.0411, "lng": 72.8693,
     "phone": "+91 22 2407 3210", "active_interceptors": 5, "pcr_code": "PCR-MUM-04", "city": "Mumbai"},
    {"name": "Bengaluru City Police - Central Division", "division": "Central Division",
     "address": "Infantry Road, Bengaluru - 560001", "lat": 12.9785, "lng": 77.6059,
     "phone": "+91 80 2294 3344", "active_interceptors": 8, "pcr_code": "PCR-BLR-01", "city": "Bengaluru"},
    {"name": "Hyderabad Traffic Police HQ", "division": "Cyberabad Traffic Wing",
     "address": "Banjara Hills, Hyderabad - 500034", "lat": 17.4155, "lng": 78.4407,
     "phone": "+91 40 2785 6100", "active_interceptors": 7, "pcr_code": "PCR-HYD-01", "city": "Hyderabad"},
]

USERS = [
    {"username": "admin", "email": "admin@asaas.gov.in", "password": "Admin@1234",
     "role": "SUPER_ADMIN", "full_name": "ASAAS System Administrator"},
    {"username": "hospital_er", "email": "er@aiims.ac.in", "password": "Hospital@1234",
     "role": "HOSPITAL_ER", "full_name": "Dr. Priya Mehta (ER Chief)"},
    {"username": "police_ctrl", "email": "pcr@delhipolice.gov.in", "password": "Police@1234",
     "role": "POLICE_CONTROL", "full_name": "SI Vikram Nair (PCR Controller)"},
    {"username": "vehicle_owner", "email": "owner@example.com", "password": "Owner@1234",
     "role": "VEHICLE_OWNER", "full_name": "Aaradhya Sharma"},
    {"username": "guardian_user", "email": "guardian@example.com", "password": "Guardian@1234",
     "role": "GUARDIAN_PUBLIC", "full_name": "Sarah Mercer (Family Guardian)"},
]


async def seed():
    print("[SEED] Initializing database tables...")
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # ---- Users ----
        for u in USERS:
            existing = await db.execute(select(User).where(User.username == u["username"]))
            if not existing.scalar_one_or_none():
                user = User(
                    username=u["username"], email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"], full_name=u["full_name"],
                )
                db.add(user)
                print(f"[SEED] Created user: {u['username']} ({u['role']})")

        await db.flush()

        # Get vehicle_owner user
        result = await db.execute(select(User).where(User.username == "vehicle_owner"))
        owner = result.scalar_one_or_none()

        # ---- Vehicle ----
        if owner:
            existing_v = await db.execute(select(Vehicle).where(Vehicle.registration_number == "DL-01-AB-4321"))
            if not existing_v.scalar_one_or_none():
                vehicle = Vehicle(
                    owner_id=owner.id,
                    name="Hyundai Creta SX (O) Turbo",
                    registration_number="DL-01-AB-4321",
                    device_id="ASAAS-001",
                    vehicle_type="Compact SUV",
                    fuel_type="Petrol Turbo",
                    driver_name="Aaradhya Sharma",
                    blood_group="O+ (Positive)",
                    insurance_policy="ICICI-LOMBARD-POL-88219",
                )
                db.add(vehicle)
                await db.flush()
                print(f"[SEED] Created vehicle: DL-01-AB-4321")

                # ---- Medical Profile ----
                medical = MedicalProfile(
                    user_id=owner.id,
                    full_name="Aaradhya Sharma",
                    age=26, gender="Male",
                    blood_group="O+ (Positive)",
                    abha_id="91-8823-4412-9012",
                    emergency_notes="Severe allergy to Penicillin. Wear medic alert bracelet.",
                    allergies="Penicillin, Sulfa drugs",
                    medical_conditions="Mild Asthmatic (inhaler carried)",
                    primary_physician_name="Dr. Sunita Varma",
                    primary_physician_phone="+91 98112 34567",
                    organ_donor=True,
                )
                db.add(medical)
                await db.flush()

                # ---- Emergency Contacts ----
                contacts = [
                    {"name": "Col. Rajesh Sharma", "relation": "Father", "phone": "+91 98765 43210", "is_primary": True},
                    {"name": "Dr. Meenakshi Sharma", "relation": "Mother", "phone": "+91 98111 22334", "is_primary": False},
                    {"name": "Pooja Sharma", "relation": "Sister / Guardian", "phone": "+91 98450 99887", "is_primary": False},
                ]
                for c in contacts:
                    db.add(EmergencyContact(
                        profile_id=medical.id,
                        name=c["name"], relation=c["relation"], phone=c["phone"],
                        is_primary=c["is_primary"], notify_sms=True,
                    ))
                print("[SEED] Created medical profile + 3 emergency contacts")

        # ---- Hospitals ----
        existing_hosps = await db.execute(select(Hospital))
        if not existing_hosps.scalars().all():
            for h in HOSPITALS:
                db.add(Hospital(**h))
            print(f"[SEED] Created {len(HOSPITALS)} hospitals")

        # ---- Police Stations ----
        existing_pol = await db.execute(select(PoliceStation))
        if not existing_pol.scalars().all():
            for p in POLICE_STATIONS:
                db.add(PoliceStation(**p))
            print(f"[SEED] Created {len(POLICE_STATIONS)} police stations")

        await db.commit()
        print("[SEED] Database seeded successfully!")
        print()
        print("Demo Accounts:")
        for u in USERS:
            print(f"  {u['role']:20s} | username: {u['username']:20s} | password: {u['password']}")


if __name__ == "__main__":
    asyncio.run(seed())

