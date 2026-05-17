import { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
  index?: number;
}

export const BookingCard = memo(function BookingCard({
  booking,
  onClick,
  index = 0,
}: BookingCardProps) {
  const car = typeof booking.car === 'object' ? booking.car : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2.5">
        <span className="text-xs font-mono text-neutral-400">{booking.bookingId}</span>
        <Badge status={booking.status} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
          <p className="text-sm text-neutral-700 line-clamp-1">{booking.pickup?.address}</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-error-500 mt-1.5 shrink-0" />
          <p className="text-sm text-neutral-700 line-clamp-1">{booking.drop?.address}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          {car && (
            <span>
              {car.make} {car.model}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {booking.schedule?.startDate
              ? new Date(booking.schedule.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            ₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}
          </span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
    </motion.div>
  );
});
