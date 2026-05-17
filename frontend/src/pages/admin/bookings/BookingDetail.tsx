import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw, XCircle, Clock, MapPin, IndianRupee, Car, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Booking, User, Car as CarType, Driver } from '@/types';

const STATUS_TIMELINE = [
  'pending',
  'confirmed',
  'driver_assigned',
  'driver_en_route',
  'picked_up',
  'in_progress',
  'completed',
];

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Assign driver modal
  const [assignModal, setAssignModal] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Update status
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/admin/bookings/${id}`);
      setBooking(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const formatAmount = (amount: number) => `\u20B9${(amount / 100).toLocaleString('en-IN')}`;

  const handleAssignDriver = async () => {
    if (!driverId.trim()) {
      toast.error('Please enter a driver ID');
      return;
    }
    setAssigning(true);
    try {
      await api.put(`/admin/bookings/${id}/assign-driver`, { driverId });
      toast.success('Driver assigned successfully');
      setAssignModal(false);
      setDriverId('');
      fetchBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    setUpdatingStatus(true);
    try {
      await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      setNewStatus('');
      fetchBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/admin/bookings/${id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled successfully');
      setCancelModal(false);
      fetchBooking();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Booking Details" showBack />
        <div className="max-w-4xl space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking Details" showBack />
        <p className="text-neutral-500">Booking not found.</p>
      </div>
    );
  }

  const customer: Partial<User> =
    typeof booking.user === 'object' ? (booking.user as User) : {};
  const car: Partial<CarType> =
    typeof booking.car === 'object' ? (booking.car as CarType) : {};
  const driver: Partial<Driver> =
    booking.driver && typeof booking.driver === 'object' ? (booking.driver as Driver) : {};
  const driverUser: Partial<User> =
    driver.userId && typeof driver.userId === 'object' ? (driver.userId as User) : {};

  const currentStatusIndex = STATUS_TIMELINE.indexOf(booking.status);

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.bookingId}`}
        showBack
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setAssignModal(true)}>
              <UserPlus className="w-4 h-4" />
              Assign Driver
            </Button>
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button variant="danger" onClick={() => { setCancelReason(''); setCancelModal(true); }}>
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <div className="max-w-4xl space-y-6">
        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Status Timeline</h3>
          {booking.status === 'cancelled' ? (
            <div className="flex items-center gap-2">
              <Badge status="cancelled" />
              {booking.cancellation?.reason && (
                <span className="text-sm text-neutral-500">- {booking.cancellation.reason}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {STATUS_TIMELINE.map((status, i) => {
                const isActive = i <= currentStatusIndex;
                return (
                  <div key={status} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div
                        className={`w-8 h-0.5 ${
                          i < currentStatusIndex ? 'bg-primary-600' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-neutral-600">Current:</span>
            <Badge status={booking.status} />
          </div>

          {/* Update Status */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-100">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
            >
              <option value="">Change status...</option>
              {STATUS_TIMELINE.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleUpdateStatus} loading={updatingStatus} disabled={!newStatus}>
              <RefreshCw className="w-3.5 h-3.5" />
              Update
            </Button>
          </div>
        </div>

        {/* Booking Info */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Route Info */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              Route
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Pickup</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{booking.pickup.address}</p>
                {booking.pickup.landmark && (
                  <p className="text-xs text-neutral-500 mt-0.5">Landmark: {booking.pickup.landmark}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Drop</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{booking.drop.address}</p>
                {booking.drop.landmark && (
                  <p className="text-xs text-neutral-500 mt-0.5">Landmark: {booking.drop.landmark}</p>
                )}
              </div>
              {booking.stops?.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Stops</p>
                  {booking.stops.map((stop, i) => (
                    <p key={i} className="text-sm text-neutral-700 mt-1">
                      {stop.order}. {stop.address} ({stop.status})
                    </p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Distance</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{booking.distance?.estimated} km</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Actual Distance</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{booking.distance?.actual || '-'} km</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary-600" />
              Pricing Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Base Fare</span>
                <span className="text-neutral-900">{formatAmount(booking.pricing?.baseFare || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Price/km</span>
                <span className="text-neutral-900">{formatAmount(booking.pricing?.pricePerKm || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Distance Charge</span>
                <span className="text-neutral-900">{formatAmount(booking.pricing?.distanceCharge || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Toll Estimate</span>
                <span className="text-neutral-900">{formatAmount(booking.pricing?.tollEstimate || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">GST</span>
                <span className="text-neutral-900">{formatAmount(booking.pricing?.gstAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-neutral-100">
                <span className="text-neutral-900">Total</span>
                <span className="text-primary-600">{formatAmount(booking.pricing?.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer, Driver, Car Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary-600" />
              Customer
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-500">Name</p>
                <p className="text-sm font-medium text-neutral-900">{customer.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Phone</p>
                <p className="text-sm font-medium text-neutral-900">{customer.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Email</p>
                <p className="text-sm font-medium text-neutral-900">{customer.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-success-600" />
              Driver
            </h3>
            {booking.driver ? (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-neutral-500">Name</p>
                  <p className="text-sm font-medium text-neutral-900">{driverUser.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Phone</p>
                  <p className="text-sm font-medium text-neutral-900">{driverUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">License</p>
                  <p className="text-sm font-medium text-neutral-900">{driver.licenseNumber || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No driver assigned</p>
            )}
          </div>

          {/* Car */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-secondary-600" />
              Car
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-500">Vehicle</p>
                <p className="text-sm font-medium text-neutral-900">{car.make} {car.model}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Reg No</p>
                <p className="text-sm font-medium text-neutral-900">{car.registrationNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Category</p>
                <p className="text-sm font-medium text-neutral-900 capitalize">{car.category?.replace('_', ' ') || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Schedule
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Start Date</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {booking.schedule?.startDate
                  ? new Date(booking.schedule.startDate).toLocaleDateString('en-IN')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Start Time</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{booking.schedule?.startTime || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">End Date</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {booking.schedule?.endDate
                  ? new Date(booking.schedule.endDate).toLocaleDateString('en-IN')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">End Time</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{booking.schedule?.endTime || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Driver">
        <div className="space-y-4">
          <Input
            label="Driver ID"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Enter driver ID..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button loading={assigning} onClick={handleAssignDriver}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Are you sure you want to cancel this booking?</p>
          <Input
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelModal(false)}>Close</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>Cancel Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
