import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface CarFormData {
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  category: string;
  seats: string;
  photos: string[];
  assignedDriver: string;
}

interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

const initialData: CarFormData = {
  registrationNumber: '',
  make: '',
  model: '',
  year: '',
  color: '',
  category: 'sedan',
  seats: '4',
  photos: [],
  assignedDriver: '',
};

export function CarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CarFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<SelectOption[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = (await api.get('/lookup/car-categories')) as string[];
      setCategoryOptions(
        res.map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' '),
        })),
      );
    } catch {
      setCategoryOptions([
        { value: 'sedan', label: 'Sedan' },
        { value: 'suv', label: 'SUV' },
        { value: 'hatchback', label: 'Hatchback' },
        { value: 'tempo_traveller', label: 'Tempo Traveller' },
        { value: 'luxury', label: 'Luxury' },
      ]);
    }
  }, []);

  const fetchDrivers = useCallback(async (query: string) => {
    try {
      setDriversLoading(true);
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const res = (await api.get('/lookup/drivers', { params })) as {
        _id: string;
        userId: { name: string; phone: string } | string;
        licenseNumber: string;
        avgRating?: number;
      }[];
      setDriverOptions(
        res.map((d) => ({
          value: d._id,
          label: typeof d.userId === 'object' ? d.userId.name : d._id,
          sublabel: typeof d.userId === 'object' ? d.userId.phone : undefined,
        })),
      );
    } catch {
      setDriverOptions([]);
    } finally {
      setDriversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchDrivers('');
  }, [fetchCategories, fetchDrivers]);

  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      api
        .get(`/admin/cars/${id}`)
        .then((res: unknown) => {
          const data = res as Record<string, unknown>;
          const driverId = data.assignedDriver
            ? typeof data.assignedDriver === 'string'
              ? data.assignedDriver
              : (data.assignedDriver as Record<string, string>)._id || ''
            : '';
          setForm({
            registrationNumber: (data.registrationNumber as string) || '',
            make: (data.make as string) || '',
            model: (data.model as string) || '',
            year: data.year?.toString() || '',
            color: (data.color as string) || '',
            category: (data.category as string) || 'sedan',
            seats: data.seats?.toString() || '4',
            photos: Array.isArray(data.photos) ? (data.photos as string[]) : [],
            assignedDriver: driverId,
          });
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to load car';
          toast.error(message);
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.registrationNumber || !form.make || !form.model) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);
      try {
        const payload: Record<string, unknown> = {
          registrationNumber: form.registrationNumber,
          make: form.make,
          model: form.model,
          year: form.year ? Number(form.year) : undefined,
          color: form.color || undefined,
          category: form.category,
          seats: Number(form.seats),
          photos: form.photos,
        };
        if (form.assignedDriver) payload.assignedDriver = form.assignedDriver;

        if (isEdit) {
          await api.put(`/admin/cars/${id}`, payload);
          toast.success('Car updated successfully');
        } else {
          await api.post('/admin/cars', payload);
          toast.success('Car created successfully');
        }
        navigate('/admin/cars');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save car';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [form, isEdit, id, navigate],
  );

  if (fetching) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Edit Car' : 'Add Car'} showBack />
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Car' : 'Add New Car'} showBack />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Registration Number *"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            placeholder="MH01AB1234"
          />
          <Input
            label="Make *"
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="Toyota"
          />
          <Input
            label="Model *"
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Innova"
          />
          <Input
            label="Year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            placeholder="2024"
          />
          <Input
            label="Color"
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="White"
          />
          <Select
            label="Category *"
            options={categoryOptions}
            value={form.category}
            onChange={(val) => handleSelectChange('category', val)}
          />
          <Input
            label="Seats *"
            name="seats"
            type="number"
            value={form.seats}
            onChange={handleChange}
            placeholder="4"
          />
          <Select
            label="Assign Driver"
            placeholder="Select driver..."
            options={driverOptions}
            value={form.assignedDriver}
            onChange={(val) => handleSelectChange('assignedDriver', val)}
            searchable
            onSearch={fetchDrivers}
            loading={driversLoading}
            clearable
          />
        </div>

        <div className="mt-4">
          <ImageUpload
            label="Car Photos"
            value={form.photos}
            onChange={(urls) => setForm({ ...form, photos: urls })}
            maxFiles={6}
            folder="cars"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/cars')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Update Car' : 'Create Car'}
          </Button>
        </div>
      </form>
    </div>
  );
}
