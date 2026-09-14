import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import { socketService } from './services/socketService.js';
import { startMqttBridge } from './services/mqttBridge.js';

import telemetryRoutes from './routes/telemetry.js';
import incidentRoutes from './routes/incidents.js';
import geospatialRoutes from './routes/geospatial.js';
import registryRoutes from './routes/registry.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for web portals and mobile frontends
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());

// Initialize Database & Websockets
async function bootstrap() {
  try {
    console.log('========================================================');
    console.log('  ASAAS REAL-TIME EMERGENCY TELEMETRY & DISPATCH ENGINE ');
    console.log('========================================================');

    // 1. Connect & Bootstrap Database (SQLite / PostgreSQL)
    await initDatabase();

    // 2. Initialize Real-Time WebSocket Service
    socketService.init(server);

    // 3. Start MQTT Hardware Bridge for ESP32 & SIM800L
    startMqttBridge();

    // 4. API Endpoints
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ONLINE',
        service: 'ASAAS IoT Emergency Response Gateway',
        version: '2.0.0',
        activeClients: socketService.clients.size,
        timestamp: new Date().toISOString()
      });
    });

    app.use('/api/v1/telemetry', telemetryRoutes);
    app.use('/api/v1/incidents', incidentRoutes);
    app.use('/api/v1/geospatial', geospatialRoutes);
    app.use('/api/v1/registry', registryRoutes);

    // Start Listening
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[HTTP] ASAAS REST API active on: http://localhost:${PORT}`);
      console.log(`[WS]   WebSocket live endpoint on: ws://localhost:${PORT}/ws`);
      console.log(`[SYS]  Ready for ESP32 hardware telemetry & web portal connections.`);
      console.log('--------------------------------------------------------');
    });

  } catch (err) {
    console.error('[BOOTSTRAP] Fatal Error starting ASAAS server:', err);
    process.exit(1);
  }
}

bootstrap();
