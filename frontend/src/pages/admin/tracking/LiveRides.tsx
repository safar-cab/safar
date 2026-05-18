import { useEffect, useContext, useState } from 'react';
import { Navigation, MapPin, Clock, X, Phone, ExternalLink } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/cn';

interface ActiveRide {
  _id: string;
  bookingId: string;
  status: string;
  pickup: { address: string };
  drop: { address: string };
  driver: { userId: { name: string; phone: string } } | null;
  user: { name: string; phone: string };
}

interface Position {
  latitude: number;
  longitude: number;
  speed: number;
}

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

function getStaticMapUrl(lat: number, lng: number, pickup?: string, drop?: string): string {
  if (!MAPS_KEY) return '';
  const markers = `markers=color:blue|${lat},${lng}`;
  const pickupMarker = pickup ? `&markers=color:green|label:P|${encodeURIComponent(pickup)}` : '';
  const dropMarker = drop ? `&markers=color:red|label:D|${encodeURIComponent(drop)}` : '';
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=13&size=800x400&scale=2&${markers}${pickupMarker}${dropMarker}&key=${MAPS_KEY}`;
}

export function LiveRides() {
  const { token } = useContext(AuthContext);
  const [rides, setRides] = useState<ActiveRide[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = (await api.get('/api/tracking/admin/active')) as any;
        setRides(res.bookings || []);
        setPositions(res.positions || {});
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();

    const socket = connectSocket(token);
    socket.emit('admin:join');

    socket.on('admin:positions', (data: Record<string, Position>) => {
      setPositions(data);
    });

    socket.on('admin:location', (data: Position & { bookingId: string }) => {
      setPositions((prev) => ({
        ...prev,
        [data.bookingId]: {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
        },
      }));
    });

    return () => disconnectSocket();
  }, [token]);

  const selectedPos = selectedRide ? positions[selectedRide._id] : null;
  const driverNameOf = (ride: ActiveRide) =>
    ride.driver && typeof ride.driver === 'object'
      ? (ride.driver as any).userId?.name || 'Driver'
      : 'Unassigned';
  const driverPhoneOf = (ride: ActiveRide) =>
    ride.driver && typeof ride.driver === 'object'
      ? (ride.driver as any).userId?.phone || ''
      : '';

  return (
    <div>
      <PageHeader title="Live Rides" subtitle={`${rides.length} active rides`} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No active rides</p>
          <p className="text-sm text-neutral-400">
            Rides will appear here when drivers are en route
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Ride cards */}
          <div className="space-y-3">
            {rides.map((ride) => {
              const pos = positions[ride._id];
              const isSelected = selectedRide?._id === ride._id;

              return (
                <div
                  key={ride._id}
                  onClick={() => setSelectedRide(isSelected ? null : ride)}
                  className={cn(
                    'bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary-400 ring-2 ring-primary-100'
                      : 'border-neutral-100 hover:border-primary-200',
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{ride.bookingId}</p>
                      <p className="text-xs text-neutral-400">
                        {driverNameOf(ride)} → {ride.user.name}
                      </p>
                    </div>
                    <Badge status={ride.status} />
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="w-0.5 h-5 bg-neutral-200 my-0.5" />
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-2 text-xs text-neutral-600">
                      <p className="line-clamp-1">{ride.pickup.address}</p>
                      <p className="line-clamp-1">{ride.drop.address}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs rounded-lg p-2',
                      pos ? 'bg-green-50 text-green-700' : 'bg-neutral-50 text-neutral-400',
                    )}
                  >
                    {pos ? (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>
                          {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
                        </span>
                        <span className="ml-auto">{(pos.speed * 3.6).toFixed(0)} km/h</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Waiting for location...</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map + details panel */}
          <div className="lg:sticky lg:top-20 h-fit">
            {selectedRide ? (
              <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                {/* Map */}
                <div className="h-72 bg-neutral-100 relative">
                  {selectedPos && MAPS_KEY ? (
                    <img
                      src={getStaticMapUrl(
                        selectedPos.latitude,
                        selectedPos.longitude,
                        selectedRide.pickup.address,
                        selectedRide.drop.address,
                      )}
                      alt="Map"
                      className="w-full h-full object-cover"
                    />
                  ) : selectedPos ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Navigation
                            className="w-7 h-7 text-white"
                            style={{ transform: `rotate(${0}deg)` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-neutral-700">
                          {selectedPos.latitude.toFixed(5)}, {selectedPos.longitude.toFixed(5)}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Speed: {(selectedPos.speed * 3.6).toFixed(0)} km/h
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${selectedPos.latitude},${selectedPos.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-xs text-primary-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in Google Maps
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                        <p className="text-sm text-neutral-400">No location data yet</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedRide(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white"
                  >
                    <X className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>

                {/* Ride details */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-neutral-900">
                        {selectedRide.bookingId}
                      </p>
                      <Badge status={selectedRide.status} />
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <div className="w-0.5 h-8 bg-neutral-200 my-0.5" />
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-neutral-400">Pickup</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {selectedRide.pickup.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Drop</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {selectedRide.drop.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Driver + Customer */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-400 mb-1">Driver</p>
                      <p className="text-sm font-medium text-neutral-800">
                        {driverNameOf(selectedRide)}
                      </p>
                      {driverPhoneOf(selectedRide) && (
                        <a
                          href={`tel:${driverPhoneOf(selectedRide)}`}
                          className="inline-flex items-center gap-1 text-xs text-primary-600 mt-1"
                        >
                          <Phone className="w-3 h-3" />
                          {driverPhoneOf(selectedRide)}
                        </a>
                      )}
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-400 mb-1">Customer</p>
                      <p className="text-sm font-medium text-neutral-800">
                        {selectedRide.user.name}
                      </p>
                      <a
                        href={`tel:${selectedRide.user.phone}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 mt-1"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedRide.user.phone}
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedPos && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${selectedPos.latitude},${selectedPos.longitude}`,
                          '_blank',
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Google Maps
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-200 p-12 text-center">
                <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">
                  Select a ride to view map and details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
