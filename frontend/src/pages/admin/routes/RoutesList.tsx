import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCurrency } from '@/utils/format';
import type { RoutePricing } from '@/types';

export function RoutesList() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      const res = (await api.get('/admin/routes', { params })) as
        | {
            routes?: RoutePricing[];
            data?: RoutePricing[];
            total?: number;
            totalPages?: number;
          }
        | RoutePricing[];
      if (Array.isArray(res)) {
        setRoutes(res);
        setTotal(res.length);
        setTotalPages(1);
      } else {
        setRoutes((res.routes || res.data || []) as RoutePricing[]);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch routes';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleSort = useCallback(
    (field: string) => {
      setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
      setSortBy(field);
    },
    [sortBy, sortOrder],
  );

  const toggleStatus = useCallback(
    async (route: RoutePricing) => {
      try {
        await api.put(`/admin/routes/${route._id}`, { isActive: !route.isActive });
        toast.success(`Route ${route.isActive ? 'deactivated' : 'activated'} successfully`);
        fetchRoutes();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update route status';
        toast.error(message);
      }
    },
    [fetchRoutes],
  );

  const thClass =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';
  const thStatic =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3';

  return (
    <div>
      <PageHeader
        title="Routes"
        subtitle="Manage route pricing"
        actions={
          <Button onClick={() => navigate('/admin/routes/new')}>
            <Plus className="w-4 h-4" />
            Add Route
          </Button>
        }
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No routes found"
          description="Add your first route to get started."
          actionLabel="Add Route"
          onAction={() => navigate('/admin/routes/new')}
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
                  <th className={thClass} onClick={() => handleSort('distanceKm')}>
                    Distance (km) {sortBy === 'distanceKm' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('pricePerKm')}>
                    Price/km {sortBy === 'pricePerKm' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('baseFare')}>
                    Base Fare {sortBy === 'baseFare' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thStatic}>Tolls</th>
                  <th className={thStatic}>Status</th>
                  <th className={thStatic}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{route.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{route.distanceKm}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {formatCurrency(route.pricePerKm, true)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {formatCurrency(route.baseFare, true)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {formatCurrency(route.tollEstimate, true)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={route.isActive ? 'confirmed' : 'cancelled'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Edit route">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/routes/${route._id}/edit`)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={route.isActive ? 'Deactivate route' : 'Activate route'}>
                          <Button
                            variant={route.isActive ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => toggleStatus(route)}
                          >
                            {route.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </Tooltip>
                      </div>
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
