import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

interface TrackingState {
  isTracking: boolean;
  error: string | null;
  lastSent: Date | null;
  watchId: number | null;
}

export function useDriverTracking(bookingId: string | null) {
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    error: null,
    lastSent: null,
    watchId: null,
  });
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const startTracking = useCallback(() => {
    if (!bookingId || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) {
      setState((s) => ({ ...s, error: 'Not connected to server' }));
      return;
    }

    // Request Wake Lock to keep screen on
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLockRef.current = lock;
        })
        .catch(() => {});
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading, accuracy } = position.coords;
        lastPositionRef.current = { lat: latitude, lng: longitude };

        socket.emit('location:send', {
          bookingId,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          accuracy: accuracy || 0,
        });

        setState((s) => ({
          ...s,
          isTracking: true,
          error: null,
          lastSent: new Date(),
        }));
      },
      (err) => {
        setState((s) => ({
          ...s,
          error: `Location error: ${err.message}`,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    setState((s) => ({ ...s, isTracking: true, watchId }));
  }, [bookingId]);

  const stopTracking = useCallback(() => {
    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    setState({ isTracking: false, error: null, lastSent: null, watchId: null });
  }, [state.watchId]);

  const updateStatus = useCallback(
    (status: string) => {
      const socket = getSocket();
      if (!socket?.connected || !bookingId) return;
      socket.emit('status:update', { bookingId, status });
    },
    [bookingId],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.watchId !== null) {
        navigator.geolocation.clearWatch(state.watchId);
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    updateStatus,
    lastPosition: lastPositionRef.current,
  };
}
