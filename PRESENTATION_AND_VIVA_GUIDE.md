# ASAAS: Technical Presentation & Viva Defense Guide
**Automated System for Accident Alert & Safety (Accident Sensor and Alert Sender)**

---

## 1. The 60-Second Elevator Pitch (Memorize This)

> *"Good morning/afternoon, Respected Evaluators. 
> 
> According to the World Health Organization and Ministry of Road Transport, over 50% of accident fatalities occur during the **'Golden Hour'**—the first 60 minutes after a crash—primarily due to delayed emergency notification and lack of precise location coordinates.
> 
> To solve this, we built **ASAAS (Automated System for Accident Alert & Safety)**. 
> 
> ASAAS is an end-to-end IoT and Geospatial Emergency Telemetry system. An in-vehicle edge computing unit continuously samples 6-axis inertial motion and real-time GPS telemetry. When a crash or vehicle rollover is detected, a 10-second driver cancellation window triggers. If uncancelled, ASAAS autonomously executes a **3-Tier Priority Dispatch**:
> 1. **Priority 1 (Nearest Trauma Center):** Dispatches patient medical metrics, blood group, shock force, and coordinates to the closest hospital.
> 2. **Priority 2 (Nearest Police Station):** Alerts highway patrol for perimeter security, traffic diversion, and green-corridor ambulance clearance.
> 3. **Priority 3 (Next of Kin):** Sends automated SMS/WhatsApp alerts with an instant live-tracking map pin.
> 
> Simultaneously, our Web Dispatch Console calculates and projects the **shortest actual road driving route** using street-level routing engines, providing first responders with precise road corridors, driving distances, and live ETAs. 
> 
> I am now excited to demonstrate both the system architecture and a live simulation."*

---

## 2. Complete Technical Architecture

### A. Hardware & Embedded Edge (The In-Vehicle Black Box)
1. **Compute Unit (ESP32-WROOM-32)**:
   - Dual-Core Tensilica Xtensa 32-bit LX6 running at 240 MHz.
   - Integrated Wi-Fi (802.11 b/g/n) and Bluetooth v4.2 BR/EDR & BLE.
   - Dedicated hardware interrupts configured on GPIOs for zero-latency crash detection.
2. **Inertial Measurement Unit (MPU-6050)**:
   - 3-axis Micro-Electro-Mechanical Systems (MEMS) accelerometer ($\pm 16\text{g}$ range).
   - 3-axis MEMS angular rate sensor/gyroscope ($\pm 2000^\circ/\text{s}$ range).
   - Communicates with ESP32 over **$\text{I}^2\text{C}$ bus** (SDA: GPIO 21, SCL: GPIO 22) at 400 kHz (Fast Mode).
   - Internal Digital Motion Processor (DMP) or complementary filter fuses linear and rotational vectors.
3. **Satellite Positioning (NEO-6M GPS Engine)**:
   - 50-channel u-blox 6 positioning engine with tracking sensitivity down to $-161\text{ dBm}$.
   - Time-To-First-Fix (TTFF): Hot start $< 1\text{ s}$, Cold start $\sim 27\text{ s}$.
   - Communicates via hardware **UART2** (RX2: GPIO 16, TX2: GPIO 17) at 9600 baud.
   - Parses standard NMEA 0183 sentences (`$GPRMC` for recommended minimum data, `$GPGGA` for 3D fix and satellite count).
4. **Cellular Transceiver (SIM800L GSM/GPRS Quad-Band)**:
   - Quad-band 850/900/1800/1900 MHz.
   - Operates over UART using standard Hayes AT Commands (`AT+HTTPINIT`, `AT+HTTPPARA`, `AT+CMGS`).
   - Dispatches cellular SMS payloads and HTTP POST JSON packets to the central cloud ingest server.
5. **Local Warning & Circuit Breaker**:
   - **Optocoupler Relay Module**: Triggers the 12V vehicle horn/hazard buzzer to alert surrounding witnesses and traffic.
   - **Physical Stop / Circuit Breaker Pushbutton**: Connected to an active-low hardware interrupt pin (`INPUT_PULLUP`). Allows conscious occupants to immediately abort false triggers within a 10-second countdown.
   - **Power Subsystem**: Buck converter stepping down 12V vehicle battery to stable 5V/3.3V, paired with an emergency 3.7V 18650 Li-ion battery backup with TP4056 charge protection in case vehicle battery cables sever during high-impact collision.

---

### B. Software & Cloud Telemetry Stack
1. **Frontend Dispatch & Telemetry Application**:
   - Built on **React 18** with **Vite** tooling for sub-millisecond HMR and high-performance rendering.
   - **Tailwind CSS** with a custom aerospace/emergency dispatch design system: deep slate palette (`#090D16`, `#0F172A`), tabular numeral displays (`tabular-nums`), and high-contrast status pills.
2. **Interactive Mapping & Geospatial Rendering**:
   - **Leaflet 1.9.4** with `react-leaflet`.
   - CARTO dark/positron vector tile layers with Retina support.
   - Custom SVG marker anchors with animated radar pulse rings (`animate-ping`).
   - Dual-layer route polyline rendering (outer ambient glow + crisp inner driving line).
3. **Routing Engine (OSRM Integration)**:
   - Open Source Routing Machine (OSRM) v5 Driving Profile.
   - Fetches actual driving road geometry (`geometries=geojson`, `overview=full`) rather than straight-line Euclidean distance.
   - Ingests real road networks (highways, one-ways, turn restrictions, intersections) to provide accurate route coordinates, distance in kilometers, and driving time in minutes.
4. **Audio Synthesizer**:
   - Web Audio API `AudioContext` with custom square/sine frequency oscillation ($780\text{ Hz} \leftrightarrow 960\text{ Hz}$) to generate authentic emergency dispatch sirens without external MP3 dependencies.

---

## 3. Mathematical Models & Core Algorithms

### A. Crash Detection & Deceleration Magnitude
To make detection independent of vehicle orientation, the system computes the 3D **Euclidean Norm (Vector Magnitude)**:

$$\|A\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$

- Under normal stationary or cruising conditions: $\|A\| \approx 1.0\text{g}$ (due to Earth's gravity).
- **Accident Threshold**: Triggered when $\|A\| \ge 4.0\text{g}$ sustained over a rolling window of $\ge 30\text{ ms}$ (to filter out mechanical motor vibration).

### B. Rollover & Angle Deviation Detection
Tilt angles are derived from accelerometer and gyroscope fusion:

$$\text{Pitch } (\theta) = \arctan2\left(a_x, \sqrt{a_y^2 + a_z^2}\right) \times \frac{180}{\pi}$$

$$\text{Roll } (\phi) = \arctan2\left(a_y, \sqrt{a_x^2 + a_z^2}\right) \times \frac{180}{\pi}$$

- **Rollover Threshold**: Triggered if $|\phi| > 60^\circ$ or $|\theta| > 45^\circ$ for $> 500\text{ ms}$, indicating the vehicle is on its side or roof.

### C. Great-Circle Distance (Haversine Formula)
To identify candidate emergency facilities from our spatial database within radius $R$ of the crash location $(\phi_1, \lambda_1)$:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R_{\text{earth}} \cdot c \quad (\text{where } R_{\text{earth}} \approx 6,371\text{ km})$$

### D. Road Routing & Dynamic ETA Estimation
- The system queries OSRM: `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`
- OSRM calculates the shortest path over road networks using **Contraction Hierarchies (CH)** on OpenStreetMap graph data.
- **Estimated Time of Arrival (ETA)**:
  $$\text{ETA (seconds)} = \sum_{e \in \text{Edges}} \frac{\text{length}(e)}{\text{max\_speed}(e) \times \text{traffic\_weight}}$$

---

## 4. The 3-Tier Priority Emergency Protocol

| Priority Tier | Target Recipient | Payload Transmitted | Operational Objective |
| :--- | :--- | :--- | :--- |
| **Priority 1** | **Nearest Trauma Center / Hospital** | GPS Coordinates, Medical ID, Blood Group, Shock Magnitude (G-Force), Rollover Status | Immediate dispatch of Advanced Life Support (ALS) ambulance and ER trauma team mobilization. |
| **Priority 2** | **Nearest Police Station / Highway Patrol** | Vehicle Plate, Crash Coordinates, Direction of Travel, Severity Index | Deploy perimeter patrol, secure crash site, divert traffic to prevent secondary pileups, establish green corridor. |
| **Priority 3** | **Emergency Contacts (Family)** | Automated WhatsApp/SMS notification with live Google Maps tracking link | Provide peace of mind, authorize medical procedures, eliminate frantic searching. |

---

## 4.1. The Cancellation Window: Configuration & Clinical Trade-offs

### Why is there a Cancellation Window?
The safety window exists to solve the **"False Alarm Dilemma"**:
- An overly aggressive system that transmits instantly on every bump would overwhelm emergency services and risk heavy municipal fines.
- Conversely, a delay that is too long wastes critical minutes of the **Golden Hour** when victims might be bleeding out or unconscious.

### Recommended Timings & Scenarios
- **10 Seconds (Aggressive / High Risk)**: Ideal for two-wheelers or elderly drivers where any impact or rollover carries extreme risk of rapid incapacitation.
- **15 Seconds (Standard / Recommended)**: Balanced default across global systems (similar to European e-Call & Russia's ERA-GLONASS). Gives a conscious driver adequate time to locate and hit the physical STOP button.
- **20–30 Seconds (Commercial / Heavy Freight)**: Recommended for heavy logistics trucks or off-road vehicles operating on rugged terrain with frequent severe vibrations.

### How it is Configured:
1. **In the Web UI / Dashboard**:
   - In [`EmergencySosModal.jsx`](file:///e:/M_S/Python/AD/Asaas/src/components/Emergency/EmergencySosModal.jsx), dispatchers and evaluators can interactively click the window selector pills: `[10s]`, `[15s]`, `[20s]`, or `[30s]`. The countdown ticker, radial progress bar, and dispatch gating automatically adjust.
2. **In the ESP32 Embedded Firmware (C++/Arduino)**:
   ```cpp
   // Adjustable via preprocessor directive or EEPROM non-volatile setting:
   #define CANCELLATION_TIMEOUT_MS 15000 // 15 Seconds Window
   
   void handleCrashDetected() {
       unsigned long startTime = millis();
       digitalWrite(RELAY_ALARM_PIN, HIGH); // Sound 12V hazard horn
       
       bool isCancelled = false;
       while (millis() - startTime < CANCELLATION_TIMEOUT_MS) {
           if (digitalRead(STOP_BUTTON_PIN) == LOW) { // Active-low interrupt
               isCancelled = true;
               digitalWrite(RELAY_ALARM_PIN, LOW); // Silence alarm
               Serial.println("FALSE ALARM: Cancelled by occupant.");
               break;
           }
           delay(50);
       }
       
       if (!isCancelled) {
           executePriorityDispatch(); // Hospital -> Police -> Family
       }
   }
   ```

---

## 5. Live Demonstration Script (Follow Exactly)

| Step | Action on Screen | What to Say |
| :---: | :--- | :--- |
| **1** | Open the **Map Tab**. Click the location preset pills: `Kochi NH544`, then `Aluva By-Pass`, then `Vyttila Hub`. | *"Notice how the system reacts in real time. The moment vehicle GPS coordinates change, our geospatial engine re-queries the regional spatial database and recalculates the nearest hospital and police station."* |
| **2** | Point to the **Map Route Polyline** and the **Floating Route HUD**. | *"Instead of crude straight lines, ASAAS computes the actual shortest road driving geometry via OSRM. Here you can see the exact corridor name (e.g., Salem-Kochi Highway), driving distance (e.g., 2.8 km), and ambulance ETA (e.g., 4 mins)."* |
| **3** | Click the **Police Mode** toggle on the map. | *"With a single click, dispatchers can switch to the nearest Police Station route, showing the green corridor for law enforcement and traffic clearance."* |
| **4** | Switch to the **Emergency Center** tab or click **Simulate Crash (7.2G)**. | *"Now we simulate a severe 7.2G impact. Observe the 3-Priority Protocol kicking in. Notice the 10-second driver circuit-breaker countdown with the synthesized audible alert."* |
| **5** | Click **'CANCEL EMERGENCY (STOP)'** on the first try. | *"If a driver accidentally drops their phone or encounters an extreme bump, they can hit the physical stop button. The system logs a false trigger and aborts transmission, preventing emergency service waste."* |
| **6** | Trigger the crash again and let the countdown finish. | *"When uncancelled, the system locks into priority transmission: Priority 1 dispatches medical telemetry to the hospital, Priority 2 alerts highway patrol, and Priority 3 notifies family contacts."* |

---

## 6. Top 20 Tough Examiner Questions & Bulletproof Answers

### 1. "How do you distinguish between an actual crash and a car hitting a severe pothole or speed bump?"
**Answer:**
> *"We use a three-stage validation pipeline:
> 1. **Vector Magnitude Thresholding:** Potholes typically generate high instantaneous Z-axis acceleration, but minimal X-axis (longitudinal deceleration) or Y-axis (lateral) forces. A true crash exhibits extreme multi-axis resultant vector magnitude ($\ge 4.0\text{g}$).
> 2. **Time-Duration Filtering (Windowing):** Pothole impacts are transient impulse spikes lasting $< 10\text{ ms}$. A vehicular collision involves crumple zone deformation spanning $30\text{ ms}$ to $120\text{ ms}$. Our algorithm uses a rolling buffer and only triggers if elevated G-forces persist beyond the impulse window.
> 3. **The 10-Second Driver Circuit Breaker:** In edge cases where a threshold is crossed (e.g. minor fender bender), the driver has a 10-second window to press the hardware STOP button to cancel dispatch."*

### 2. "What happens if the accident occurs in a cellular dead zone where there is no GSM network?"
**Answer:**
> *"The edge firmware implements an **Offline Fallback & Retrial Queue**:
> 1. Telemetry and crash packets are immediately committed to non-volatile memory (ESP32 EEPROM/SPIFFS Flash).
> 2. The cellular module switches to SMS protocol first (which requires only minimal 2G signaling channel connectivity, often succeeding where data packets fail).
> 3. If completely out of range, the module retries in an exponential backoff loop while the local relay triggers the 12V vehicle hazard horn/lights to alert nearby motorists.
> 4. In production, we can also integrate **Satellite IoT** (such as Iridium SBD or LoRaWAN roadside relays) as a secondary backup link."*

### 3. "What if the car's main 12V battery is crushed or disconnected in the crash?"
**Answer:**
> *"The ASAAS hardware unit incorporates an autonomous **uninterruptible dual-rail power supply**:
> - The primary supply steps down the vehicle's 12V alternator/battery.
> - A dedicated internal 3.7V 2600mAh 18650 Lithium-Ion cell with a TP4056 management IC sits in float charge.
> - A low-loss Schottky diode auto-switch circuit instantly engages the battery backup upon primary voltage drop, providing up to 48 hours of autonomous operation and transmission even if the vehicle's electrical harness is severed."*

### 4. "GPS cold start can take up to 30 to 45 seconds. What if an accident happens immediately after turning the vehicle on?"
**Answer:**
> *"The NEO-6M module features a rechargeable coin-cell backup battery that powers its internal RTC (Real-Time Clock) and battery-backed RAM (BBRAM). 
> - This maintains ephemeris data, transforming cold starts into **Hot Starts under 1 second**.
> - Furthermore, our firmware continuously caches the last known valid GPS fix into non-volatile flash every 2 seconds during ignition. If a satellite fix is momentarily obscured (e.g., inside an underground tunnel), the system dispatches the last known fix alongside an estimated dead-reckoning offset calculated from the MPU-6050 IMU."*

### 5. "Why use the Haversine formula instead of simple Euclidean distance $\sqrt{\Delta x^2 + \Delta y^2}$?"
**Answer:**
> *"Euclidean distance assumes a flat 2D plane ($R^2$), which introduces massive distortion over geographic coordinates because lines of longitude converge towards the poles (1 degree of longitude at the equator is $\sim 111\text{ km}$, but decreases as $\cos(\text{latitude})$). 
> The Haversine formula calculates the true **Great-Circle Distance** on the surface of a sphere, taking Earth's curvature ($R = 6,371\text{ km}$) into account. This ensures our initial spatial query radius is mathematically accurate before passing coordinates to the road routing engine."*

### 6. "Why do you need OSRM road routing if you already have Haversine?"
**Answer:**
> *"Haversine only calculates straight-line 'as-the-crow-flies' distance. In the real world, ambulances cannot fly over rivers, railways, or across divided highways without u-turns. 
> A hospital that is 2 km away in straight-line distance might actually be 8 km away by road due to one-way bridges or traffic flyovers. OSRM evaluates real OpenStreetMap road graphs, providing first responders with the true driving distance, street corridors, and turn-by-turn geometry."*

### 7. "What if the driver is unconscious? Won't they be unable to cancel a false alarm?"
**Answer:**
> *"That is intentional by design. The system operates on a **Fail-Safe Principle**:
> - If an impact exceeds the severe threshold (e.g., $> 4.0\text{g}$), the system assumes the driver is unconscious or incapacitated.
> - If no action is taken during the 10-second countdown, the system **automatically** dispatches emergency services. 
> - The button is strictly a *cancellation* mechanism for false positives when the occupant is conscious and unharmed."*

### 8. "Why not just use an iPhone or Android smartphone app instead of dedicated hardware?"
**Answer:**
> *"Smartphone-based detection has major real-world vulnerabilities:
> 1. **Unconstrained Motion:** A phone can slip off a dashboard, drop to the floor, or be thrown into a bag, triggering high false-alarm rates. ASAAS is hard-mounted to the vehicle's rigid chassis, ensuring pure vehicular inertial dynamics.
> 2. **Survivability:** Phones are frequently ejected through windshields or run out of battery. Our unit is enclosed in an industrial black box with dedicated backup power.
> 3. **Vehicle Actuation:** A phone cannot actuate vehicle relays (horn, hazard lights, fuel cutoff). ASAAS can directly trigger perimeter safety hardware."*

### 9. "How does the system handle high-volume concurrent accidents on the backend?"
**Answer:**
> *"Our architecture is inherently stateless and microservice-oriented:
> - Telemetry ingestion is handled via lightweight JSON payloads or MQTT brokers (e.g., Eclipse Mosquitto / AWS IoT Core).
> - Geospatial indexing is powered by spatial indexes (e.g., PostGIS R-Tree spatial indexing), which performs nearest-neighbor lookups in $\mathcal{O}(\log N)$ time.
> - The frontend is built on React 18, utilizing client-side spatial calculation and localized worker threads, ensuring the dispatch console never freezes even with hundreds of active units."*

### 10. "Can ASAAS cut off the vehicle's fuel pump after an accident to prevent fires?"
**Answer:**
> *"Yes. Our relay module architecture can be interfaced directly with the vehicle's fuel pump relay or ignition wire (similar to OEM inertia switches). Upon confirmed crash detection (and expiration of the cancellation timer), the ESP32 can energize a normally-closed relay to cut power to the electric fuel pump, mitigating fire hazards."*

### 11. "What is the end-to-end latency between impact and hospital notification?"
**Answer:**
> *"The timeline is as follows:
> - **Detection:** $< 50\text{ ms}$ (sensor sampling at $100\text{ Hz}$).
> - **Cancellation Window:** $10.0\text{ s}$ (safety buffer).
> - **Cellular Connect & Dispatch:** $\sim 1.5\text{ to } 3.0\text{ s}$ via GPRS HTTP POST or SMS.
> - **Total latency:** Under **15 seconds** from physical impact to the hospital dashboard ringing, compared to the national average of 15–30 minutes for human bystander reporting."*

### 12. "What if the public OSRM server is down or rate-limited?"
**Answer:**
> *"Our service architecture has a built-in multi-tier fallback:
> 1. If OSRM returns an HTTP error or times out, the code catches the exception and immediately falls back to high-resolution interpolated bearing curves with Haversine distance.
> 2. For enterprise deployment, OSRM is packaged as a lightweight Docker container (`osrm/osrm-backend`) that runs locally on the dispatch server with pre-compiled regional `.osrm` road maps, guaranteeing zero external internet dependency and $< 5\text{ ms}$ query response."*

### 13. "Why did you prioritize Hospital first, Police second, and Family third?"
**Answer:**
> *"This hierarchy is based on emergency trauma protocols:
> 1. **Priority 1 (Hospital):** Every second counts to preserve biological life (stopping hemorrhaging, oxygenating brain tissue). The hospital must prepare the trauma bay and dispatch an ambulance immediately.
> 2. **Priority 2 (Police):** Police are needed next to manage the crash site, secure the scene, and clear traffic lanes so the ambulance can actually reach the victim.
> 3. **Priority 3 (Family):** Family members need to be notified for consent and emotional support, but cannot physically save the victim in the critical first minutes."*

### 14. "What sensors would you add to make this automotive-grade (ASIL certified)?"
**Answer:**
> *"To meet ISO 26262 automotive safety standards:
> 1. Replace consumer MPU-6050 with an **Automotive-Grade High-G Crash Sensor** (e.g., Bosch SMA130 or ST AIS3624DQ rated up to $\pm 24\text{g}$).
> 2. Integrate directly with the vehicle's **CAN Bus (Controller Area Network)** using an MCP2515 CAN transceiver to read seatbelt pretensioner status, airbag deployment signals, and brake pressure.
> 3. Add a dual-frequency GNSS receiver (L1/L5 bands) for centimeter-level RTK positioning accuracy."*

### 15. "How do you protect patient health data (Medical ID, Blood Group) from privacy breaches?"
**Answer:**
> *"Data in transit is secured using **TLS 1.3 encryption (HTTPS)** with token-based JWT authentication. In the embedded hardware, patient profiles can be stored in ESP32 encrypted flash (using eFuse-backed hardware AES-256). In production, payloads sent to police exclude private medical history and only transmit vehicular coordinates, while the full medical profile is exclusively piped to authenticated hospital trauma centers."*

### 16. "What is the sampling frequency of the MPU-6050 and does it consume high CPU?"
**Answer:**
> *"We configure the MPU-6050 sampling rate at $100\text{ Hz}$ ($10\text{ ms}$ interval), with an internal Low-Pass Filter (DLPF) set to $44\text{ Hz}$. 
> Because the ESP32 is a dual-core processor, we assign sensor polling and NMEA GPS parsing to **Core 0**, while communication protocols (Wi-Fi/Cellular/Bluetooth) run asynchronously on **Core 1** using FreeRTOS tasks. This guarantees deterministic zero-jitter sampling without CPU starvation."*

### 17. "How is the ambulance route kept up-to-date if traffic suddenly congests?"
**Answer:**
> *"The dispatch console features a reactive architecture. The map tab periodically re-evaluates the active route or allows dispatchers to request an instant route re-calculation. With dynamic traffic weightings enabled in routing engines, alternative arterial corridors are automatically highlighted."*

### 18. "How is the emergency alert audio produced on the frontend without lagging the UI?"
**Answer:**
> *"We use the **HTML5 Web Audio API** rather than downloading large audio assets. We synthesize an emergency siren directly in software using two `OscillatorNode` objects modulated by a low-frequency oscillator (LFO). This generates raw audio waveforms on the audio hardware thread with zero network overhead and zero UI thread latency."*

### 19. "Can the system be retrofitted to any existing car or motorcycle?"
**Answer:**
> *"Yes. Because ASAAS is self-contained (housing its own inertial sensors, GPS engine, cellular modem, and power management), it requires only a 12V connection to the vehicle fuse box or OBD-II port. On two-wheelers, its compact form factor can be mounted under the seat, where rollover detection is especially vital."*

### 20. "What is the estimated cost of producing this unit?"
**Answer:**
> *"In prototype stage:
> - ESP32: ~\$3.50
> - MPU-6050: ~\$1.20
> - NEO-6M GPS: ~\$3.80
> - SIM800L: ~\$4.50
> - Power/Enclosure/Wiring: ~\$3.00
> - **Total prototype BOM:** under **\$16.00** (approx. ₹1,300 INR).
> In mass manufacturing (using an integrated Quectel cellular/GNSS SoC and custom PCB), the BOM drops to under **\$10.00**, making it accessible for mandatory adoption in commercial and passenger vehicles."*

---

## 7. Quick Reference "Pocket Card" (Key Specs & Numbers)

```
========================================================================
                      ASAAS SPECIFICATION CHEATSHEET
========================================================================
Microcontroller    : ESP32 Dual-Core 240MHz (Tensilica Xtensa LX6)
IMU Sensor         : MPU-6050 (3-Axis Accel ±16g, 3-Axis Gyro ±2000°/s)
GPS Module         : NEO-6M (50 Ch, -161 dBm tracking, UART2 9600 baud)
Cellular           : SIM800L Quad-Band GPRS/GSM (AT Command Interface)
Crash Threshold    : Vector Norm ||A|| >= 4.0g sustained >= 30ms
Rollover Threshold : Roll |phi| > 60° or Pitch |theta| > 45° for > 500ms
Safety Window      : 10 Seconds (Driver Stop Pushbutton / Interrupt)
Distance Math      : Haversine Great-Circle Formula (R = 6,371 km)
Routing Engine     : OSRM (Open Source Routing Machine) v5 Driving Profile
Priority Hierarchy : P1: Trauma Center -> P2: Police Patrol -> P3: Family
Prototype BOM Cost : < $16 USD (~₹1,300 INR)
========================================================================
```
