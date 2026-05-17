import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CalendarCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Booking, User, Car } from '@/types';

export function BookingsList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res: any = await api.get('/admin/bookings', { params });
      setBookings(res.bookings || res.data || res || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchBookings();
  };

  const formatAmount = (amount: number) => `\u20B9${(amount / 100).toLocaleString('en-IN')}`;

  const getCustomerName = (booking: Booking): string => {
    if (typeof booking.user === 'object' && booking.user !== null) {
      return (booking.user as User).name || '-';
    }
    return '-';
  };

  const getCarInfo = (booking: Booking): string => {
    if (typeof booking.car === 'object' && booking.car !== null) {
      const car = booking.car as Car;
      return `${car.make} ${car.model}`;
    }
    return '-';
  };

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Manage all bookings" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-64">
          <Input
            placeholder="Search by booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="driver_assigned">Driver Assigned</option>
          <option value="driver_en_route">En Route</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <Button variant="outline" onClick={handleSearch}>Search</Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="No bookings match the current filters."
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Booking ID</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Car</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{booking.bookingId}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getCustomerName(booking)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getCarInfo(booking)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      <span className="truncate max-w-[150px] inline-block" title={`${booking.pickup.address} → ${booking.drop.address}`}>
                        {booking.pickup.address?.split(',')[0]} → {booking.drop.address?.split(',')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {booking.schedule?.startDate
                        ? new Date(booking.schedule.startDate).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {formatAmount(booking.pricing?.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">Showing {bookings.length} of {total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
