import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, ShieldCheck, UserCheck, Search } from 'lucide-react';
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
import { formatPhone } from '@/utils/format';
import type { Driver, User } from '@/types';

const VERIFIED_OPTIONS = [
  { value: '', label: 'All Drivers' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Not Verified' },
];

export function DriversList() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (verifiedFilter) params.isVerified = verifiedFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = (await api.get('/admin/drivers', { params })) as {
        drivers?: Driver[];
        data?: Driver[];
        total?: number;
        totalPages?: number;
      };
      setDrivers((res.drivers || res.data || []) as Driver[]);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch drivers';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, verifiedFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, verifiedFilter]);

  const handleSort = useCallback(
    (field: string) => {
      setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
      setSortBy(field);
    },
    [sortBy, sortOrder],
  );

  const handleVerify = useCallback(
    async (driverId: string) => {
      try {
        await api.put(`/admin/drivers/${driverId}/verify`);
        toast.success('Driver verified successfully');
        fetchDrivers();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify driver';
        toast.error(message);
      }
    },
    [fetchDrivers],
  );

  const getDriverUser = useCallback((driver: Driver): Partial<User> => {
    if (typeof driver.userId === 'object' && driver.userId !== null) {
      return driver.userId as User;
    }
    return {};
  }, []);

  const thClass =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';
  const thStatic =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3';

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle="Manage driver profiles"
        actions={
          <Button onClick={() => navigate('/admin/drivers/new')}>
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-64">
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Drivers"
            options={VERIFIED_OPTIONS}
            value={verifiedFilter}
            onChange={setVerifiedFilter}
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
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No drivers found"
          description="Add your first driver to get started."
          actionLabel="Add Driver"
          onAction={() => navigate('/admin/drivers/new')}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className={thClass} onClick={() => handleSort('name')}>
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Phone</th>
                  <th className={thClass} onClick={() => handleSort('licenseNumber')}>
                    License {sortBy === 'licenseNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('isVerified')}>
                    Verified {sortBy === 'isVerified' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Available</th>
                  <th className={thClass} onClick={() => handleSort('avgRating')}>
                    Rating {sortBy === 'avgRating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {drivers.map((driver) => {
                  const user = getDriverUser(driver);
                  return (
                    <tr key={driver._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                        {user.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {user.phone ? formatPhone(user.phone) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{driver.licenseNumber}</td>
                      <td className="px-4 py-3">
                        <Badge status={driver.isVerified ? 'completed' : 'pending'} />
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {driver.isAvailable ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {driver.avgRating?.toFixed(1) || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tooltip content="View driver">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/drivers/${driver._id}`)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Tooltip>
                          {!driver.isVerified && (
                            <Tooltip content="Verify driver">
                              <Button size="sm" onClick={() => handleVerify(driver._id)}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
