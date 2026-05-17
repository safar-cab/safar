import { useState, useEffect, useCallback } from 'react';
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
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate, formatPhone } from '@/utils/format';
import type { Booking, User, Car as CarType, Driver } from '@/types';

interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

const STATUS_TIMELINE = [
  'pending',
  'confirmed',
  'driver_assigned',
  'driver_en_route',
  'picked_up',
  'in_progress',
  'completed',
];

const STATUS_OPTIONS: SelectOption[] = STATUS_TIMELINE.map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
}));

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Assign driver modal
  const [assignModal, setAssignModal] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [driverOptions, setDriverOptions] = useState<SelectOption[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Update status
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/bookings/${id}`) as Booking;
      setBooking(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch booking';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDriverOptions = useCallback(async (query: string) => {
    try {
      setDriversLoading(true);
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const res = await api.get('/lookup/drivers', { params }) as {
        _id: string;
        userId: { name: string; phone: string } | string;
        licenseNumber: string;
        avgRating?: number;
      }[];
      setDriverOptions(res.map((d) => ({
        value: d._id,
        label: typeof d.userId === 'object' ? d.userId.name : d._id,
        sublabel: typeof d.userId === 'object' ? d.userId.phone : undefined,
      })));
    } catch {
      setDriverOptions([]);
    } finally {
      setDriversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Load drivers when assign modal opens
  useEffect(() => {
    if (assignModal) fetchDriverOptions('');
  }, [assignModal, fetchDriverOptions]);

  const handleAssignDriver = useCallback(async () => {
    if (!driverId.trim()) {
      toast.error('Please select a driver');
      return;
    }
    setAssigning(true);
    try {
      await api.put(`/admin/bookings/${id}/assign-driver`, { driverId });
      toast.success('Driver assigned successfully');
      setAssignModal(false);
      setDriverId('');
      fetchBooking();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign driver';
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  }, [driverId, id, fetchBooking]);

  const handleUpdateStatus = useCallback(async () => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
    }
  }, [newStatus, id, fetchBooking]);

  const handleCancel = useCallback(async () => {
    setCancelling(true);
    try {
      await api.put(`/admin/bookings/${id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled successfully');
      setCancelModal(false);
      fetchBooking();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }, [cancelReason, id, fetchBooking]);

  const openAssignModal = useCallback(() => {
    setAssignModal(true);
    fetchDriverOptions('');
  }, [fetchDriverOptions]);

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
            <Button variant="outline" onClick={openAssignModal}>
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
            <div className="w-56">
              <Select
                placeholder="Change status..."
                options={STATUS_OPTIONS}
                value={newStatus}
                onChange={setNewStatus}
              />
            </div>
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
                <span className="text-neutral-900">{formatCurrency(booking.pricing?.baseFare || 0, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Price/km</span>
                <span className="text-neutral-900">{formatCurrency(booking.pricing?.pricePerKm || 0, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Distance Charge</span>
                <span className="text-neutral-900">{formatCurrency(booking.pricing?.distanceCharge || 0, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Toll Estimate</span>
                <span className="text-neutral-900">{formatCurrency(booking.pricing?.tollEstimate || 0, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">GST</span>
                <span className="text-neutral-900">{formatCurrency(booking.pricing?.gstAmount || 0, true)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-neutral-100">
                <span className="text-neutral-900">Total</span>
                <span className="text-primary-600">{formatCurrency(booking.pricing?.totalAmount || 0, true)}</span>
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
                <p className="text-sm font-medium text-neutral-900">{customer.phone ? formatPhone(customer.phone) : '-'}</p>
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
                  <p className="text-sm font-medium text-neutral-900">{driverUser.phone ? formatPhone(driverUser.phone) : '-'}</p>
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
                  ? formatDate(booking.schedule.startDate)
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
                  ? formatDate(booking.schedule.endDate)
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
          <Select
            label="Select Driver"
            placeholder="Search for a driver..."
            options={driverOptions}
            value={driverId}
            onChange={setDriverId}
            searchable
            onSearch={fetchDriverOptions}
            loading={driversLoading}
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
