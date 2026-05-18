import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Navigation, Phone, MapPin } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  driver_assigned: { label: 'Driver Assigned', color: 'text-blue-600' },
  driver_en_route: { label: 'Driver En Route', color: 'text-indigo-600' },
  picked_up: { label: 'Driver Arrived', color: 'text-purple-600' },
  in_progress: { label: 'Trip In Progress', color: 'text-green-600' },
  completed: { label: 'Completed', color: 'text-emerald-600' },
};

export function LiveTracking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => disconnectSocket();
  }, [token]);

  const { position, status } = useLiveTracking(bookingId || null);

  const currentStatus = status?.status || 'driver_en_route';
  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.driver_en_route;

  return (
    <div className="px-4 py-4">
      <PageHeader title="Live Tracking" showBack />

      {/* Status banner */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className={cn('text-sm font-semibold', statusInfo.color)}>{statusInfo.label}</p>
            <p className="text-xs text-neutral-400">
              {position
                ? `Last update: ${new Date(position.updatedAt).toLocaleTimeString()}`
                : 'Waiting for driver location...'}
            </p>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden mb-4">
        <div className="h-80 bg-neutral-50 flex items-center justify-center relative">
          {position ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Navigation
                  className="w-6 h-6 text-white"
                  style={{ transform: `rotate(${position.heading}deg)` }}
                />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Speed: {(position.speed * 3.6).toFixed(0)} km/h
              </p>
              <p className="text-[10px] text-neutral-300 mt-3">
                Google Maps integration available with VITE_GOOGLE_MAPS_KEY
              </p>
            </div>
          ) : (
            <div className="text-center">
              <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Waiting for driver location...</p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver info / actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">Contact Driver</p>
              <p className="text-xs text-neutral-400">Call for updates</p>
            </div>
          </div>
          <Badge status={currentStatus === 'completed' ? 'completed' : 'confirmed'} />
        </div>
      </div>
    </div>
  );
}
