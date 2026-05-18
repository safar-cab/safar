import { useEffect, useContext, useState } from 'react';
import { Navigation, MapPin, Users, Clock } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { cn } from '@/lib/cn';

interface ActiveRide {
  _id: string;
  bookingId: string;
  status: string;
  pickup: { address: string };
  drop: { address: string };
  driver: { userId: { name: string } } | null;
  user: { name: string; phone: string };
}

interface Position {
  latitude: number;
  longitude: number;
  speed: number;
}

export function LiveRides() {
  const { token } = useContext(AuthContext);
  const [rides, setRides] = useState<ActiveRide[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch initial data via REST
    (async () => {
      try {
        const res = await api.get('/api/tracking/admin/active') as any;
        setRides(res.bookings || []);
        setPositions(res.positions || {});
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();

    // Connect WebSocket for live updates
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

  return (
    <div>
      <PageHeader
        title="Live Rides"
        subtitle={`${rides.length} active rides`}
      />

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
          <p className="text-sm text-neutral-400">Rides will appear here when drivers are en route</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => {
            const pos = positions[ride._id];
            const driverName =
              ride.driver && typeof ride.driver === 'object'
                ? (ride.driver as any).userId?.name || 'Driver'
                : 'Unassigned';

            return (
              <div
                key={ride._id}
                className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{ride.bookingId}</p>
                    <p className="text-xs text-neutral-400">{driverName} → {ride.user.name}</p>
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

                {/* Live position */}
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
                      <span className="ml-auto">
                        {(pos.speed * 3.6).toFixed(0)} km/h
                      </span>
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
      )}
    </div>
  );
}
