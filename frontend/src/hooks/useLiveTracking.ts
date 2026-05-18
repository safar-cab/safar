import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

interface DriverPosition {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  updatedAt: string;
}

interface RideStatus {
  bookingId: string;
  status: string;
  updatedAt: string;
}

export function useLiveTracking(bookingId: string | null) {
  const [position, setPosition] = useState<DriverPosition | null>(null);
  const [status, setStatus] = useState<RideStatus | null>(null);
  const [connected, setConnected] = useState(false);

  const joinRoom = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected || !bookingId) return;

    socket.emit('customer:join', { bookingId });
    setConnected(true);
  }, [bookingId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !bookingId) return;

    const handleLocationUpdate = (data: DriverPosition & { bookingId: string }) => {
      if (data.bookingId === bookingId) {
        setPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          updatedAt: data.updatedAt,
        });
      }
    };

    const handleStatusChanged = (data: RideStatus) => {
      if (data.bookingId === bookingId) {
        setStatus(data);
      }
    };

    const handleConnect = () => {
      joinRoom();
    };

    socket.on('location:update', handleLocationUpdate);
    socket.on('status:changed', handleStatusChanged);
    socket.on('connect', handleConnect);

    // Join immediately if already connected
    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off('location:update', handleLocationUpdate);
      socket.off('status:changed', handleStatusChanged);
      socket.off('connect', handleConnect);
    };
  }, [bookingId, joinRoom]);

  return { position, status, connected };
}
