import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket — Generic React hook for Socket.io connections.
 *
 * @param {string} namespace - Socket.io namespace (e.g., '/chat', '/notify')
 * @returns {Socket|null} - Connected Socket instance
 */
export default function useSocket(namespace = '/') {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Target URL path structure matching Nginx proxy pass
    const targetUrl = window.location.origin;

    const instance = io(`${targetUrl}${namespace}`, {
      path: '/socket.io/',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = instance;
    setSocket(instance);

    instance.on('connect', () => {
      console.log(`[useSocket] Connected to namespace ${namespace} (Socket ID: ${instance.id})`);
    });

    instance.on('connect_error', (err) => {
      console.warn(`[useSocket] Connection error on ${namespace}:`, err.message);
    });

    return () => {
      if (instance) {
        console.log(`[useSocket] Disconnecting socket for ${namespace}...`);
        instance.disconnect();
      }
    };
  }, [namespace]);

  return socket;
}
