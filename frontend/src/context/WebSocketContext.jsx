import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WS_URL, api } from '../services/api';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[CloudShield WS] Connected to live security telemetry stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'LIVE_TELEMETRY') {
            setLiveEvents((prev) => [msg, ...prev.slice(0, 19)]);
          } else if (msg.type === 'NEW_ALERT') {
            setLatestAlert(msg.alert);
            setLiveEvents((prev) => [
              {
                type: 'ALERT_EVENT',
                timestamp: msg.alert.timestamp,
                username: msg.alert.username,
                event_type: 'SECURITY_ALERT_TRIGGERED',
                resource: msg.alert.title,
                risk_level: msg.alert.severity,
                message: msg.alert.description
              },
              ...prev.slice(0, 19)
            ]);
          } else if (msg.type === 'CONNECTION_ESTABLISHED') {
            setSimulatorRunning(msg.simulator_running);
          }
        } catch (e) {
          // Non-JSON message
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setConnected(false);
      };
    } catch (e) {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  };

  useEffect(() => {
    connect();
    // Check initial simulator status
    api.getSimulatorStatus().then((s) => setSimulatorRunning(s.is_running)).catch(() => {});

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const toggleSimulator = async () => {
    try {
      if (simulatorRunning) {
        await api.stopSimulator();
        setSimulatorRunning(false);
      } else {
        await api.startSimulator();
        setSimulatorRunning(true);
      }
    } catch (e) {
      console.error('Failed to toggle simulator', e);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        liveEvents,
        latestAlert,
        simulatorRunning,
        toggleSimulator,
        setSimulatorRunning
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
