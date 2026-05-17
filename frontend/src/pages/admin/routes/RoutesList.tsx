import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Route, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RoutePricing } from '@/types';

export function RoutesList() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/routes');
      setRoutes(res.routes || res.data || res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const formatAmount = (amount: number) => `\u20B9${(amount / 100).toLocaleString('en-IN')}`;

  const toggleStatus = async (route: RoutePricing) => {
    try {
      await api.put(`/admin/routes/${route._id}`, { isActive: !route.isActive });
      toast.success(`Route ${route.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchRoutes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update route status');
    }
  };

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
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Distance (km)</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Price/km</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Base Fare</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Tolls</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {routes.map((route) => (
                <tr key={route._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">{route.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{route.distanceKm}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{formatAmount(route.pricePerKm)}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{formatAmount(route.baseFare)}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{formatAmount(route.tollEstimate)}</td>
                  <td className="px-4 py-3">
                    <Badge status={route.isActive ? 'confirmed' : 'cancelled'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/routes/${route._id}/edit`)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant={route.isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => toggleStatus(route)}
                      >
                        {route.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
