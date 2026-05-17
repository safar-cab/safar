import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Star, Clock, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Driver, Booking } from '@/types';
import toast from 'react-hot-toast';

export function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rides, setRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [driverData, ridesData] = await Promise.all([
        api.get('/driver/me').catch(() => null),
        api.get('/driver/bookings'),
      ]);
      if (driverData) setDriver(driverData as unknown as Driver);
      setRides(ridesData as unknown as Booking[]);
    } catch {
      // Driver profile may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAvailability = async () => {
    if (!driver) return;
    setToggling(true);
    try {
      const updated = await api.put('/driver/availability', {
        isAvailable: !driver.isAvailable,
      }) as unknown as Driver;
      setDriver(updated);
      toast.success(updated.isAvailable ? 'You are now online' : 'You are now offline');
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const activeRides = rides.filter((r) =>
    ['driver_assigned', 'driver_en_route', 'picked_up', 'in_progress'].includes(r.status),
  );

  return (
    <div className="p-4 space-y-5">
      {/* Header with availability */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Welcome back</p>
            <h1 className="text-xl font-bold text-neutral-900">{user?.name}</h1>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={toggling || !driver}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              driver?.isAvailable ? 'bg-success-500' : 'bg-neutral-300'
            } ${toggling ? 'opacity-60' : ''}`}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ left: driver?.isAvailable ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </button>
        </div>
        <p className={`text-xs font-medium mt-2 ${driver?.isAvailable ? 'text-success-600' : 'text-neutral-400'}`}>
          {driver?.isAvailable ? '● Online — Available for rides' : '○ Offline'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Rating', value: driver?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-secondary-500' },
          { label: 'Total Rides', value: driver?.totalRides || 0, icon: Car, color: 'text-primary-600' },
          { label: 'Today', value: activeRides.length, icon: Clock, color: 'text-success-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl p-3.5 shadow-sm border border-neutral-100 text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Rides */}
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-3">Active Rides</h2>
        {activeRides.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No active rides"
            description="New rides will appear here when assigned"
          />
        ) : (
          <div className="space-y-3">
            {activeRides.map((ride, i) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/driver/rides/${ride._id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-neutral-400">{ride.bookingId}</span>
                  <Badge status={ride.status} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
                    <p className="text-sm text-neutral-700">{ride.pickup?.address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-error-500 mt-1.5 shrink-0" />
                    <p className="text-sm text-neutral-700">{ride.drop?.address}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    {ride.schedule?.startTime}
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
