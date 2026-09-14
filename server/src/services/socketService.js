import { WebSocketServer, WebSocket } from 'ws';

class SocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      console.log(`[WS] Client connected from ${req.socket.remoteAddress}. Total active: ${this.clients.size}`);

      // Send initial welcome & handshake
      ws.send(JSON.stringify({
        type: 'CONNECTION_ACK',
        message: 'Connected to ASAAS Real-Time Emergency Socket Engine',
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message.toString());
          this.handleClientMessage(ws, parsed);
        } catch (err) {
          console.error('[WS] Invalid JSON payload from client:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WS] Client disconnected. Total active: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.warn('[WS] Socket error:', err);
        this.clients.delete(ws);
      });
    });

    console.log('[WS] WebSocket Server listening on /ws');
  }

  handleClientMessage(senderWs, data) {
    // Broadcast incoming messages from one portal to all other connected portals
    this.broadcast(data.type, data.payload, senderWs);
  }

  broadcast(type, payload, excludeWs = null) {
    const message = JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

export const socketService = new SocketService();
