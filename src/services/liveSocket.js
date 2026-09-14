/**
 * ASAAS Live Socket Service
 *
 * Thin wrapper used by some components that import liveSocket directly.
 * Delegates to the main backendApi WebSocket instance.
 */

import { backendApi } from './api.js';

class LiveSocketService {
  /**
   * Subscribe to WebSocket events.
   * @param {Function} callback - Called with (eventType, payload)
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    return backendApi.subscribe(callback);
  }

  /**
   * Check if WebSocket is connected.
   */
  get isConnected() {
    return backendApi.wsClient?.readyState === WebSocket.OPEN;
  }
}

export const liveSocket = new LiveSocketService();
export default liveSocket;

