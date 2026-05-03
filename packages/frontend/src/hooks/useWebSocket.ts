import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimelineEvent } from '../types';
import { WS } from '../types';

export function useWebSocket() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onSnapshotRef = useRef<((data: any) => void) | null>(null);

  const registerSnapshotHandler = useCallback((handler: (data: any) => void) => {
    onSnapshotRef.current = handler;
  }, []);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (e) => {
        try {
          const item = JSON.parse(e.data);
          if (item.event === 'snapshot') {
            if (onSnapshotRef.current) onSnapshotRef.current(item.data);
            // Also seed events from snapshot
            setEvents(item.data.events || []);
            return;
          }
          setEvents(prev => [...prev.slice(-300), item]);
        } catch { /* bad JSON */ }
      };
    };

    connect();
    return () => { wsRef.current?.close(); };
  }, []);

  return { events, connected, registerSnapshotHandler };
}
