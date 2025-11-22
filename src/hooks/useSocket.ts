import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GenericSSEEvent } from '../types';

interface UseSocketOptions {
  roomCode: string;
  userId?: string;
  onEvent: (event: GenericSSEEvent) => void;
  enabled?: boolean;
}

export function useSocket({
  roomCode,
  userId,
  onEvent,
  enabled = true,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onEventRef = useRef(onEvent);

  // Keep the ref updated
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  const stableOnEvent = useCallback((event: GenericSSEEvent) => {
    onEventRef.current(event);
  }, []); // Empty dependency array - truly stable

  useEffect(() => {
    if (!enabled || !roomCode) {
      return;
    }

    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin // Use current domain in production
        : window.location.origin; // Use Vite dev server in development (will proxy to backend)

    console.log('Connecting to Socket.IO server:', serverUrl);

    // Create socket connection
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected for room:', roomCode);

      // Join the room
      if (userId) {
        socket.emit('join-room', { roomCode, userId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    // Listen for real-time events
    socket.on('user-joined', (data) => {
      console.log('Socket.IO: user-joined', data);
      stableOnEvent({ type: 'user-joined', data });
    });

    socket.on('user-left', (data) => {
      console.log('Socket.IO: user-left', data);
      stableOnEvent({ type: 'user-left', data });
    });

    socket.on('vote-cast', (data) => {
      console.log('Socket.IO: vote-cast', data);
      stableOnEvent({ type: 'vote-cast', data });
    });

    socket.on('votes-revealed', (data) => {
      console.log('Socket.IO: votes-revealed', data);
      stableOnEvent({ type: 'votes-revealed', data });
    });

    socket.on('voting-reset', (data) => {
      console.log('Socket.IO: voting-reset', data);
      stableOnEvent({ type: 'voting-reset', data });
    });

    socket.on('emoji-flying', (data) => {
      console.log('Socket.IO: emoji-flying', data);
      stableOnEvent({ type: 'emoji-flying', data });
    });

    socket.on('self-emoji', (data) => {
      console.log('Socket.IO: self-emoji', data);
      stableOnEvent({ type: 'self-emoji', data });
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Socket.IO connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, userId, enabled, stableOnEvent]);

  // Cleanup function that can be called manually
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return { disconnect, socket: socketRef.current };
}
