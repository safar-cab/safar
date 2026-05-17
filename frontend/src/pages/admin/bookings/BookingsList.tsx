import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Tooltip } from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Booking, User, Car } from '@/types';

interface SelectOption {
  value: string;
  label: string;
}

export function BookingsList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([]);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = (await api.get('/lookup/booking-statuses')) as string[];
      setStatusOptions(
        res.map((s) => ({
          value: s,
          label: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '),
        })),
      );
    } catch {
      setStatusOptions([
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'driver_assigned', label: 'Driver Assigned' },
        { value: 'driver_en_route', label: 'En Route' },
        { value: 'picked_up', label: 'Picked Up' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
      ]);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = (await api.get('/admin/bookings', { params })) as {
        bookings?: Booking[];
        data?: Booking[];
        total?: number;
        totalPages?: number;
      };
      setBookings((res.bookings || res.data || []) as Booking[]);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bookings';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleSort = useCallback(
    (field: string) => {
      setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
      setSortBy(field);
    },
    [sortBy, sortOrder],
  );

  const getCustomerName = useCallback((booking: Booking): string => {
    if (typeof booking.user === 'object' && booking.user !== null) {
      return (booking.user as User).name || '-';
    }
    return '-';
  }, []);

  const getCarInfo = useCallback((booking: Booking): string => {
    if (typeof booking.car === 'object' && booking.car !== null) {
      const car = booking.car as Car;
      return `${car.make} ${car.model}`;
    }
    return '-';
  }, []);

  const statusFilterOptions = useMemo(
    () => [{ value: '', label: 'All Statuses' }, ...statusOptions],
    [statusOptions],
  );

  const thClass =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';
  const thStatic =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3';

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
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Statuses"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
          />
        </div>
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
                  <th className={thClass} onClick={() => handleSort('bookingId')}>
                    Booking ID {sortBy === 'bookingId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Customer</th>
                  <th className={thStatic}>Car</th>
                  <th className={thStatic}>Route</th>
                  <th className={thClass} onClick={() => handleSort('createdAt')}>
                    Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('status')}>
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Amount</th>
                  <th className={thStatic}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">
                      {booking.bookingId}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {getCustomerName(booking)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{getCarInfo(booking)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      <span
                        className="truncate max-w-[150px] inline-block"
                        title={`${booking.pickup.address} → ${booking.drop.address}`}
                      >
                        {booking.pickup.address?.split(',')[0]} →{' '}
                        {booking.drop.address?.split(',')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {booking.schedule?.startDate ? formatDate(booking.schedule.startDate) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {formatCurrency(booking.pricing?.totalAmount || 0, true)}
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip content="View booking">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
