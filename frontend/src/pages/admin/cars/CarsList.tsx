import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Tooltip } from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import type { Car as CarType } from '@/types';

interface CategoryOption {
  value: string;
  label: string;
}

export function CarsList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = (await api.get('/lookup/car-categories')) as string[];
      setCategories(
        res.map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' '),
        })),
      );
    } catch {
      // fallback categories
      setCategories([
        { value: 'sedan', label: 'Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'hatchback', label: 'Hatchback' },
        { value: 'tempo_traveller', label: 'Tempo Traveller' },
        { value: 'luxury', label: 'Luxury' },
      ]);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (category) params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = (await api.get('/admin/cars', { params })) as {
        cars?: CarType[];
        data?: CarType[];
        total?: number;
        totalPages?: number;
      };
      setCars((res.cars || res.data || []) as CarType[]);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch cars';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const handleSort = useCallback(
    (field: string) => {
      setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
      setSortBy(field);
    },
    [sortBy, sortOrder],
  );

  const toggleStatus = useCallback(
    async (car: CarType) => {
      try {
        await api.put(`/admin/cars/${car._id}`, { isActive: !car.isActive });
        toast.success(`Car ${car.isActive ? 'deactivated' : 'activated'} successfully`);
        fetchCars();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update car status';
        toast.error(message);
      }
    },
    [fetchCars],
  );

  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All Categories' }, ...categories],
    [categories],
  );

  const thClass =
    'text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none';

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
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Categories"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
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
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                    Photo
                  </th>
                  <th className={thClass} onClick={() => handleSort('registrationNumber')}>
                    Reg No {sortBy === 'registrationNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('make')}>
                    Make / Model {sortBy === 'make' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={thClass} onClick={() => handleSort('category')}>
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                    Seats
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                    Driver
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      {car.photos?.length > 0 ? (
                        <img
                          src={car.photos[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-neutral-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {car.registrationNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {car.make} {car.model}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 capitalize">
                      {car.category?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{car.seats}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {car.assignedDriver
                        ? typeof car.assignedDriver === 'string'
                          ? car.assignedDriver
                          : (car.assignedDriver as unknown as Record<string, Record<string, string>>).userId
                              ?.name || 'Assigned'
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={car.isActive ? 'confirmed' : 'cancelled'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Edit car">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/cars/${car._id}/edit`)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={car.isActive ? 'Deactivate car' : 'Activate car'}>
                          <Button
                            variant={car.isActive ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => toggleStatus(car)}
                          >
                            {car.isActive ? 'Deactivate' : 'Activate'}
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
