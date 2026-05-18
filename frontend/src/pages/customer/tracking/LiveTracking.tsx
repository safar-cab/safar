import { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navigation, Phone, MapPin, ExternalLink } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DirectionsMap } from '@/components/core/DirectionsMap';
import api from '@/lib/api';
import { cn } from '@/lib/cn';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  driver_assigned: { label: 'Driver Assigned', color: 'text-blue-600' },
  driver_en_route: { label: 'Driver En Route', color: 'text-indigo-600' },
  picked_up: { label: 'Driver Arrived', color: 'text-purple-600' },
  in_progress: { label: 'Trip In Progress', color: 'text-green-600' },
  completed: { label: 'Completed', color: 'text-emerald-600' },
};


interface BookingInfo {
  pickup?: { address: string };
  drop?: { address: string };
  driver?: { userId?: { name: string; phone: string } } | null;
}

export function LiveTracking() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { token } = useContext(AuthContext);
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => disconnectSocket();
  }, [token]);

  useEffect(() => {
    if (bookingId) {
      api
        .get(`/customer/bookings/${bookingId}`)
        .then((res) => setBooking(res as BookingInfo))
        .catch(() => {});
    }
  }, [bookingId]);

  const { position, status } = useLiveTracking(bookingId || null);

  const currentStatus = status?.status || 'driver_en_route';
  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.driver_en_route;

  const pickupAddr = booking?.pickup?.address;
  const dropAddr = booking?.drop?.address;
  const driverInfo =
    booking?.driver && typeof booking.driver === 'object'
      ? (booking.driver as any)?.userId
      : null;

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

      {/* Map — interactive with traffic + route */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden mb-4">
        <div className="h-72 sm:h-96">
          {pickupAddr && dropAddr ? (
            <DirectionsMap
              origin={pickupAddr}
              destination={dropAddr}
              className="h-full"
              showTraffic
              showAlternatives={false}
              driverPosition={
                position
                  ? { lat: position.latitude, lng: position.longitude }
                  : null
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Loading route...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route info */}
      {pickupAddr && dropAddr && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="w-0.5 h-6 bg-neutral-200 my-0.5" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-neutral-400">Pickup</p>
                <p className="text-sm font-medium text-neutral-800">{pickupAddr}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Drop</p>
                <p className="text-sm font-medium text-neutral-800">{dropAddr}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {driverInfo?.name || 'Driver'}
              </p>
              <p className="text-xs text-neutral-400">
                {driverInfo?.phone || 'Call for updates'}
              </p>
            </div>
          </div>
          {driverInfo?.phone && (
            <a
              href={`tel:${driverInfo.phone}`}
              className="p-2.5 rounded-lg bg-primary-50 text-primary-600"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Open in Google Maps */}
      {position && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            window.open(
              `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
              '_blank',
            )
          }
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </Button>
      )}
    </div>
  );
}
