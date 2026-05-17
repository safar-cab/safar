import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Car as CarType } from '@/types';

export function CarsList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (category) params.category = category;
      if (search) params.search = search;
      const res: any = await api.get('/admin/cars', { params });
      setCars(res.cars || res.data || res || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [page, category]);

  const handleSearch = () => {
    setPage(1);
    fetchCars();
  };

  const toggleStatus = async (car: CarType) => {
    try {
      await api.put(`/admin/cars/${car._id}`, { isActive: !car.isActive });
      toast.success(`Car ${car.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCars();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update car status');
    }
  };

  return (
    <div>
      <PageHeader
        title="Cars"
        subtitle="Manage your fleet"
        actions={
          <Button onClick={() => navigate('/admin/cars/new')}>
            <Plus className="w-4 h-4" />
            Add Car
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-64">
          <Input
            placeholder="Search by reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          <option value="">All Categories</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="hatchback">Hatchback</option>
          <option value="tempo_traveller">Tempo Traveller</option>
          <option value="luxury">Luxury</option>
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
      ) : cars.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No cars found"
          description="Add your first car to get started."
          actionLabel="Add Car"
          onAction={() => navigate('/admin/cars/new')}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Reg No</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Make / Model</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Seats</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Driver</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{car.registrationNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{car.make} {car.model}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 capitalize">{car.category?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{car.seats}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {car.assignedDriver
                        ? typeof car.assignedDriver === 'string'
                          ? car.assignedDriver
                          : (car.assignedDriver as any).userId?.name || 'Assigned'
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={car.isActive ? 'confirmed' : 'cancelled'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/cars/${car._id}/edit`)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant={car.isActive ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => toggleStatus(car)}
                        >
                          {car.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-neutral-500">Showing {cars.length} of {total}</p>
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
