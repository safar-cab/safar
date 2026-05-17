import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Clock, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Booking } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'driver_assigned', label: 'Assigned' },
  { value: 'driver_en_route', label: 'En Route' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_progress', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function RideList() {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    api.get(`/driver/bookings${params}`)
      .then((data) => setRides(data as unknown as Booking[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">My Rides</h1>
        <p className="text-sm text-neutral-500">All assigned rides</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rides */}
      {loading ? (
        <div className="space-y-3 mt-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : rides.length === 0 ? (
        <EmptyState icon={Car} title="No rides found" description="Try changing the filter" />
      ) : (
        <div className="space-y-3 mt-2">
          {rides.map((ride, i) => (
            <motion.div
              key={ride._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
                  <p className="text-sm text-neutral-700 line-clamp-1">{ride.pickup?.address}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-error-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-neutral-700 line-clamp-1">{ride.drop?.address}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ride.schedule?.startDate ? new Date(ride.schedule.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                  <span>{ride.schedule?.startTime}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
