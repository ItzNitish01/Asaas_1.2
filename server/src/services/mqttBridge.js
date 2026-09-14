import mqtt from 'mqtt';
import { getDb } from '../config/db.js';
import { socketService } from './socketService.js';

const PRIMARY_MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';

export function startMqttBridge() {
  console.log(`[MQTT-BRIDGE] Connecting to Hardware Cloud Broker: ${PRIMARY_MQTT_BROKER}`);
  
  const client = mqtt.connect(PRIMARY_MQTT_BROKER, {
    clientId: `asaas_backend_server_${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 4000
  });

  client.on('connect', () => {
    console.log('[MQTT-BRIDGE] Connected to MQTT Broker. Subscribing to telemetry topics...');
    client.subscribe(['asaas/+/telemetry', 'asaas/+/crash', 'asaas/+/sos'], (err) => {
      if (err) console.error('[MQTT-BRIDGE] Subscription error:', err);
    });
  });

  client.on('message', async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      const db = getDb();
      
      // Store high-frequency telemetry in database asynchronously
      if (topic.endsWith('/telemetry')) {
        const t = data.telemetry || data;
        const deviceId = data.deviceId || t.deviceId || 'ESP32-HARDWARE-01';
        
        // Log telemetry packet
        await db.run(`
          INSERT INTO telemetry_logs (device_id, speed_kmh, accel_x, accel_y, accel_z, total_g, pitch_deg, roll_deg, lat, lng, gps_sats, battery_percent, gsm_dbm, sos_button)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          deviceId,
          t.speedKmh || t.speed || 0,
          t.accelX || 0,
          t.accelY || 0,
          t.accelZ || 0,
          t.totalGForce || t.total_g || 1.0,
          t.pitchDeg || 0,
          t.rollDeg || 0,
          t.lat || 28.4595,
          t.lng || 77.0266,
          t.gpsSatellites || 8,
          t.batteryPercent || 90,
          t.gsmSignalDbm || -70,
          t.sosPhysicalButton || 'RELEASED'
        ]);

        // Push real-time update to web dashboards via WebSockets
        socketService.broadcast('TELEMETRY_STREAM', { deviceId, telemetry: t });
      }
    } catch (err) {
      console.warn('[MQTT-BRIDGE] Error processing message:', err.message);
    }
  });

  client.on('error', (err) => {
    console.warn('[MQTT-BRIDGE] Broker connection warning:', err.message);
  });

  return client;
}
