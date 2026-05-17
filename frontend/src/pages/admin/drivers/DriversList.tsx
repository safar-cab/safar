import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, ShieldCheck, UserCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Driver, User } from '@/types';

export function DriversList() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (verifiedFilter) params.isVerified = verifiedFilter;
      const res: any = await api.get('/admin/drivers', { params });
      setDrivers(res.drivers || res.data || res || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, verifiedFilter]);

  const handleVerify = async (driverId: string) => {
    try {
      await api.put(`/admin/drivers/${driverId}/verify`);
      toast.success('Driver verified successfully');
      fetchDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify driver');
    }
  };

  const getDriverUser = (driver: Driver): Partial<User> => {
    if (typeof driver.userId === 'object' && driver.userId !== null) {
      return driver.userId as User;
    }
    return {};
  };

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
        <select
          value={verifiedFilter}
          onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
          className="h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          <option value="">All Drivers</option>
          <option value="true">Verified</option>
          <option value="false">Not Verified</option>
        </select>
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
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">License</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Verified</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Available</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Rating</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {drivers.map((driver) => {
                  const user = getDriverUser(driver);
                  return (
                    <tr key={driver._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">{user.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{user.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{driver.licenseNumber}</td>
                      <td className="px-4 py-3">
                        <Badge status={driver.isVerified ? 'completed' : 'pending'} />
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{driver.isAvailable ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{driver.avgRating?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/drivers/${driver._id}`)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                          {!driver.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(driver._id)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verify
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">Showing {drivers.length} of {total}</p>
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
