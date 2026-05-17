import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Phone,
  User,
  Car,
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Booking } from '@/types';
import toast from 'react-hot-toast';

const STATUS_ACTIONS: Record<
  string,
  { label: string; next: string; icon: typeof Navigation; color: string }
> = {
  driver_assigned: {
    label: 'Start — En Route',
    next: 'driver_en_route',
    icon: Navigation,
    color: 'bg-primary-600 hover:bg-primary-700',
  },
  driver_en_route: {
    label: 'Arrived at Pickup',
    next: 'picked_up',
    icon: MapPin,
    color: 'bg-secondary-500 hover:bg-secondary-600',
  },
  picked_up: {
    label: 'Start Ride',
    next: 'in_progress',
    icon: Car,
    color: 'bg-primary-600 hover:bg-primary-700',
  },
  in_progress: {
    label: 'Complete Ride',
    next: 'completed',
    icon: CheckCircle,
    color: 'bg-success-600 hover:bg-success-700',
  },
};

export function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/driver/bookings/${id}`)
      .then((data) => setRide(data as unknown as Booking))
      .catch(() => toast.error('Failed to load ride'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const updated = (await api.put(`/driver/bookings/${id}/status`, {
        status,
      })) as unknown as Booking;
      setRide(updated);
      setConfirmStatus(null);
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`);
      if (status === 'completed') {
        setTimeout(() => navigate('/driver/rides'), 1500);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    );
  }

  if (!ride) return null;

  const action = STATUS_ACTIONS[ride.status];
  const customer = ride.user && typeof ride.user === 'object' ? ride.user : null;
  const car = ride.car && typeof ride.car === 'object' ? ride.car : null;

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-neutral-600"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-neutral-400">{ride.bookingId}</span>
          <Badge status={ride.status} />
        </div>

        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-success-500 bg-success-100" />
              <div className="w-0.5 h-8 bg-neutral-200" />
              <div className="w-3 h-3 rounded-full border-2 border-error-500 bg-error-100" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-neutral-400 font-medium">PICKUP</p>
                <p className="text-sm text-neutral-800 font-medium">{ride.pickup?.address}</p>
                {ride.pickup?.landmark && (
                  <p className="text-xs text-neutral-500">{ride.pickup.landmark}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-medium">DROP</p>
                <p className="text-sm text-neutral-800 font-medium">{ride.drop?.address}</p>
                {ride.drop?.landmark && (
                  <p className="text-xs text-neutral-500">{ride.drop.landmark}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Customer Info */}
      {customer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
        >
          <p className="text-xs text-neutral-400 font-medium mb-2">CUSTOMER</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{customer.name}</p>
                <p className="text-xs text-neutral-500">{customer.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${customer.phone}`}
              className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center"
            >
              <Phone className="w-5 h-5 text-success-600" />
            </a>
          </div>
        </motion.div>
      )}

      {/* Car + Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-400 font-medium mb-1">CAR</p>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-neutral-500" />
              <p className="text-sm text-neutral-800">{car ? `${car.make} ${car.model}` : '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium mb-1">SCHEDULE</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <p className="text-sm text-neutral-800">
                {ride.schedule?.startDate
                  ? new Date(ride.schedule.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''}{' '}
                {ride.schedule?.startTime}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Action */}
      {action && (
        <div className="fixed bottom-20 inset-x-0 px-4 pb-2">
          <AnimatePresence>
            {confirmStatus ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-neutral-200 space-y-3"
              >
                <div className="flex items-center gap-2 text-neutral-700">
                  <AlertCircle className="w-5 h-5 text-secondary-500" />
                  <p className="text-sm font-medium">Confirm: {action.label}?</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setConfirmStatus(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className={`flex-1 ${action.color} text-white`}
                    loading={updating}
                    onClick={() => updateStatus(action.next)}
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  size="xl"
                  className={`w-full ${action.color} text-white`}
                  onClick={() => setConfirmStatus(action.next)}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
