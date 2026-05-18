import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBookings } from '@/store/slices/bookingsSlice';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const ACTIVE_STATUSES = 'driver_assigned,driver_en_route,picked_up,in_progress';

export function TrackRides() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: bookings, loading } = useAppSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchBookings({ status: ACTIVE_STATUSES, limit: 20 }));
  }, [dispatch]);

  return (
    <div className="pb-24">
      <PageHeader title="Track Rides" subtitle="Monitor your active rides" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Navigation}
          title="No active rides"
          description="When your ride is in progress, you can track it live here."
          actionLabel="Book a Ride"
          onAction={() => navigate('/customer/book')}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-400">{booking.bookingId}</span>
                <Badge status={booking.status} />
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-neutral-700 line-clamp-1">{booking.pickup?.address}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-error-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-neutral-700 line-clamp-1">{booking.drop?.address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {booking.schedule?.startDate
                      ? new Date(booking.schedule.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : ''}{' '}
                    {booking.schedule?.startTime}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/customer/track/${booking._id}`)}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Track Live
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
