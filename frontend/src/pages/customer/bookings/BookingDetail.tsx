import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, Navigation, AlertTriangle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBookingDetail, cancelBooking } from '@/store/slices/bookingsSlice';
import { PriceBreakdown } from '@/components/core/PriceBreakdown';
import { BookingRouteCard } from '@/components/core/BookingRouteCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';

const CANCELLABLE = ['pending', 'confirmed', 'driver_assigned'];

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Booking Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'driver_assigned', label: 'Driver Assigned' },
  { key: 'driver_en_route', label: 'Driver En Route' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

function getStepIndex(status: string): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current: booking, loading, cancelling, error } = useAppSelector((s) => s.bookings);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchBookingDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleCancel = () => {
    if (!id || !cancelReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    dispatch(cancelBooking({ id, reason: cancelReason.trim() }));
    setCancelModal(false);
    setCancelReason('');
  };

  if (loading || !booking) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const car = typeof booking.car === 'object' ? booking.car : null;
  const isCancellable = CANCELLABLE.includes(booking.status);
  const isCancelled = booking.status === 'cancelled';
  const currentStepIdx = getStepIndex(booking.status);

  return (
    <div className="pb-28">
      <PageHeader title="Booking Detail" showBack showHome={booking.status === 'pending'} />

      {/* Booking ID + Status + Route */}
      <div className="mb-4">
        <BookingRouteCard
          bookingId={booking.bookingId}
          status={booking.status}
          pickup={booking.pickup}
          drop={booking.drop}
          stops={booking.stops}
        />
      </div>

      {/* Driver Info (when assigned) */}
      {booking.driver && typeof booking.driver === 'object' && (booking.driver as any).userId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4"
        >
          <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-3">Driver</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">
                  {((booking.driver as any).userId?.name || '?')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {(booking.driver as any).userId?.name || 'Driver'}
                </p>
                <p className="text-xs text-neutral-500">
                  {(booking.driver as any).userId?.phone || ''}
                </p>
              </div>
            </div>
            {(booking.driver as any).userId?.phone && (
              <a
                href={`tel:${(booking.driver as any).userId.phone}`}
                className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 text-success-600" />
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Schedule & Car Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            icon={<Clock className="w-4 h-4 text-primary-500" />}
            label="Date"
            value={
              booking.schedule?.startDate
                ? new Date(booking.schedule.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'
            }
          />
          <InfoItem
            icon={<Clock className="w-4 h-4 text-primary-500" />}
            label="Time"
            value={booking.schedule?.startTime || '--'}
          />
          {car && (
            <InfoItem
              icon={<Car className="w-4 h-4 text-primary-500" />}
              label="Car"
              value={`${car.make} ${car.model}`}
            />
          )}
          <InfoItem
            icon={<MapPin className="w-4 h-4 text-primary-500" />}
            label="Distance"
            value={`${booking.distance?.estimated || 0} km`}
          />
        </div>
      </motion.div>

      {/* Status Timeline */}
      {!isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 mb-4"
        >
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">Ride Status</h3>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isDone = i <= currentStepIdx;
              const isLast = i === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full border-2 shrink-0',
                        isDone
                          ? 'bg-success-500 border-success-500'
                          : 'bg-white border-neutral-300',
                      )}
                    />
                    {!isLast && (
                      <div
                        className={cn('w-0.5 h-6', isDone ? 'bg-success-500' : 'bg-neutral-200')}
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm -mt-0.5',
                      isDone ? 'text-neutral-800 font-medium' : 'text-neutral-400',
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cancellation Info */}
      {isCancelled && booking.cancellation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-error-50 rounded-xl p-5 border border-error-100 mb-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-error-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-error-700">Cancelled</h4>
              <p className="text-xs text-error-600 mt-1">Reason: {booking.cancellation.reason}</p>
              {booking.cancellation.refundAmount > 0 && (
                <p className="text-xs text-error-600 mt-0.5">
                  Refund: Rs.{booking.cancellation.refundAmount.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Price Breakdown */}
      {booking.pricing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <PriceBreakdown
            baseFare={booking.pricing.baseFare}
            distanceKm={booking.distance?.estimated || 0}
            pricePerKm={booking.pricing.pricePerKm}
            tollEstimate={booking.pricing.tollEstimate}
            stopCount={booking.pricing.stopCount}
            stopChargePerStop={booking.pricing.stopChargePerStop}
            totalStopCharge={booking.pricing.totalStopCharge}
            cgst={booking.pricing.cgst}
            sgst={booking.pricing.sgst}
            gstAmount={booking.pricing.gstAmount}
            totalAmount={booking.pricing.totalAmount}
          />
        </motion.div>
      )}

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 flex gap-3 safe-area-bottom z-30">
        {isCancellable && (
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            loading={cancelling}
            onClick={() => setCancelModal(true)}
          >
            Cancel Booking
          </Button>
        )}
        {['driver_assigned', 'driver_en_route', 'picked_up', 'in_progress'].includes(
          booking.status,
        ) && (
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/customer/track/${booking._id}`)}
          >
            <Navigation className="w-4 h-4" />
            Track Live
          </Button>
        )}
        {booking.status === 'completed' && (
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/customer/rate/${booking._id}`)}
          >
            Rate this Ride
          </Button>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Booking"
        size="sm"
      >
        <p className="text-sm text-neutral-600 mb-4">
          Please tell us why you want to cancel this booking.
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason..."
          rows={3}
          className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setCancelModal(false)}
          >
            Keep Booking
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            loading={cancelling}
            onClick={handleCancel}
          >
            Confirm Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-800">{value}</p>
      </div>
    </div>
  );
}
