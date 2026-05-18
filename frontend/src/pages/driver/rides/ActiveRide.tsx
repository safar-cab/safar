import { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, Play, Square, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useDriverTracking } from '@/hooks/useDriverTracking';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/cn';

interface StopInfo {
  order: number;
  address: string;
  status: string;
  reachedAt?: string;
}

interface BookingInfo {
  _id: string;
  bookingId: string;
  status: string;
  pickup: { address: string };
  drop: { address: string };
  stops: StopInfo[];
  user: { name: string; phone: string };
}

const STATUS_FLOW = [
  { key: 'driver_en_route', label: 'Start Driving', next: 'En Route to Pickup' },
  { key: 'picked_up', label: 'Arrived at Pickup', next: 'Mark Arrived' },
  { key: 'in_progress', label: 'Start Trip', next: 'Passenger Picked Up' },
  { key: 'completed', label: 'Complete Trip', next: 'Trip Done' },
];

export function ActiveRide() {
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const socket = connectSocket(token);
      socket.emit('driver:join');
    }
    return () => disconnectSocket();
  }, [token]);

  const { isTracking, error, lastSent, startTracking, stopTracking, updateStatus } =
    useDriverTracking(id || null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/driver/bookings/${id}`);
        setBooking(res as unknown as BookingInfo);
      } catch {
        toast.error('Failed to load booking');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus(newStatus);
    setBooking((b) => (b ? { ...b, status: newStatus } : b));

    if (newStatus === 'driver_en_route') {
      startTracking();
      toast.success('Tracking started');
    } else if (newStatus === 'completed') {
      stopTracking();
      toast.success('Trip completed!');
      setTimeout(() => navigate('/driver/rides'), 1500);
    } else {
      toast.success('Status updated');
    }
  };

  const getNextStatus = () => {
    if (!booking) return null;
    const currentIdx = STATUS_FLOW.findIndex((s) => s.key === booking.status);
    if (currentIdx === -1) {
      // If driver_assigned, first action is to start driving
      if (booking.status === 'driver_assigned') {
        return STATUS_FLOW[0];
      }
      return null;
    }
    if (currentIdx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIdx + 1];
  };

  const openNavigation = () => {
    if (!booking) return;
    const isPrePickup =
      booking.status === 'driver_assigned' || booking.status === 'driver_en_route';

    if (isPrePickup) {
      // Navigate to pickup
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickup.address)}`,
        '_blank',
      );
    } else {
      // Navigate through remaining stops + drop
      const pendingStops = (booking.stops || [])
        .filter((s) => s.status !== 'reached')
        .map((s) => s.address);
      const waypoints =
        pendingStops.length > 0
          ? `&waypoints=${pendingStops.map(encodeURIComponent).join('|')}`
          : '';
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.drop.address)}${waypoints}`,
        '_blank',
      );
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-4">
        <PageHeader title="Active Ride" showBack />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-100 rounded-xl" />
          <div className="h-48 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 py-4">
        <PageHeader title="Active Ride" showBack />
        <p className="text-neutral-500 text-center py-8">Booking not found</p>
      </div>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <div className="px-4 py-4 pb-32">
      <PageHeader title={`Ride ${booking.bookingId}`} showBack />

      {/* Tracking status */}
      <div
        className={cn(
          'rounded-xl p-4 mb-4 border',
          isTracking ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isTracking ? 'bg-green-500 animate-pulse' : 'bg-neutral-300',
            )}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isTracking ? 'Location Tracking Active' : 'Tracking Inactive'}
            </p>
            {lastSent && (
              <p className="text-xs text-neutral-400">Last sent: {lastSent.toLocaleTimeString()}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          {!isTracking && booking.status !== 'completed' && (
            <Button size="sm" onClick={startTracking}>
              <Play className="w-3.5 h-3.5" />
              Start
            </Button>
          )}
          {isTracking && (
            <Button size="sm" variant="outline" onClick={stopTracking}>
              <Square className="w-3.5 h-3.5" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Route info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            {(booking.stops || []).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-neutral-200 my-0.5" />
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    _.status === 'reached' ? 'bg-green-500' : 'bg-amber-400',
                  )}
                />
              </div>
            ))}
            <div className="w-0.5 h-6 bg-neutral-200 my-0.5" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-neutral-400">Pickup</p>
              <p className="text-sm font-medium text-neutral-800">{booking.pickup.address}</p>
            </div>
            {(booking.stops || []).map((stop) => (
              <div key={stop.order} className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-amber-600 font-medium">
                    Stop {stop.order} {stop.status === 'reached' && '✓'}
                  </p>
                  <p className="text-sm text-neutral-700">{stop.address}</p>
                </div>
                {stop.status === 'pending' && booking.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      const socket = getSocket();
                      if (socket) {
                        socket.emit('stop:reached', { bookingId: id, stopOrder: stop.order });
                        setBooking((b) =>
                          b
                            ? {
                                ...b,
                                stops: b.stops.map((s) =>
                                  s.order === stop.order ? { ...s, status: 'reached' } : s,
                                ),
                              }
                            : b,
                        );
                        toast.success(`Stop ${stop.order} reached`);
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Mark Reached
                  </button>
                )}
              </div>
            ))}
            <div>
              <p className="text-xs text-neutral-400">Drop</p>
              <p className="text-sm font-medium text-neutral-800">{booking.drop.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-800">{booking.user.name}</p>
            <p className="text-xs text-neutral-400">{booking.user.phone}</p>
          </div>
          <a
            href={`tel:${booking.user.phone}`}
            className="p-2.5 rounded-lg bg-primary-50 text-primary-600"
          >
            <Navigation className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-neutral-100 safe-area-bottom z-30">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={openNavigation}>
            <ExternalLink className="w-4 h-4" />
            Navigate
          </Button>
          {nextStatus && (
            <Button className="flex-1" onClick={() => handleStatusUpdate(nextStatus.key)}>
              {nextStatus.key === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {nextStatus.next}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
