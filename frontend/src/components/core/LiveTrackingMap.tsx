import { useEffect, useContext, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { DirectionsMap } from '@/components/core/DirectionsMap';

const ACTIVE_STATUSES = ['driver_assigned', 'driver_en_route', 'picked_up', 'in_progress'];

interface LiveTrackingMapProps {
  bookingId: string;
  status: string;
  pickupAddress: string;
  dropAddress: string;
}

export function LiveTrackingMap({
  bookingId,
  status,
  pickupAddress,
  dropAddress,
}: LiveTrackingMapProps) {
  const { token } = useContext(AuthContext);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const isActive = ACTIVE_STATUSES.includes(status);

  useEffect(() => {
    if (!isActive || !token || !bookingId) return;

    const socket = connectSocket(token);
    socket.emit('customer:join', { bookingId });

    const handleLocation = (data: any) => {
      if (data.bookingId === bookingId) {
        setPosition({ lat: data.latitude, lng: data.longitude });
        setLastUpdate(new Date().toLocaleTimeString());
      }
    };

    socket.on('location:update', handleLocation);

    return () => {
      socket.off('location:update', handleLocation);
    };
  }, [isActive, token, bookingId]);

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Tracking
        </h3>
        {lastUpdate && (
          <span className="text-[10px] text-neutral-400">
            Updated: {lastUpdate}
          </span>
        )}
      </div>
      <div className="h-56 sm:h-72">
        {pickupAddress && dropAddress ? (
          <DirectionsMap
            mapKey={`live-${bookingId}`}
            origin={pickupAddress}
            destination={dropAddress}
            className="h-full"
            showTraffic
            showAlternatives={false}
            driverPosition={position}
          />
        ) : (
          <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">Waiting for route data...</p>
            </div>
          </div>
        )}
      </div>
      {position && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center gap-2 text-xs text-green-700">
          <Navigation className="w-3.5 h-3.5" />
          Driver is on the way — {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </div>
      )}
      {!position && (
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-400">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse [animation-delay:0.4s]" />
          </div>
          Waiting for driver location...
        </div>
      )}
    </div>
  );
}
