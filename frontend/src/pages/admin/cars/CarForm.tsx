import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

interface CarFormData {
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  category: string;
  seats: string;
}

const initialData: CarFormData = {
  registrationNumber: '',
  make: '',
  model: '',
  year: '',
  color: '',
  category: 'sedan',
  seats: '4',
};

export function CarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CarFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      api
        .get(`/admin/cars/${id}`)
        .then((res: any) => {
          setForm({
            registrationNumber: res.registrationNumber || '',
            make: res.make || '',
            model: res.model || '',
            year: res.year?.toString() || '',
            color: res.color || '',
            category: res.category || 'sedan',
            seats: res.seats?.toString() || '4',
          });
        })
        .catch((err: any) => toast.error(err.message || 'Failed to load car'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registrationNumber || !form.make || !form.model) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        registrationNumber: form.registrationNumber,
        make: form.make,
        model: form.model,
        year: form.year ? Number(form.year) : undefined,
        color: form.color || undefined,
        category: form.category,
        seats: Number(form.seats),
      };

      if (isEdit) {
        await api.put(`/admin/cars/${id}`, payload);
        toast.success('Car updated successfully');
      } else {
        await api.post('/admin/cars', payload);
        toast.success('Car created successfully');
      }
      navigate('/admin/cars');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
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
          <div className="w-full">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="tempo_traveller">Tempo Traveller</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <Input
            label="Seats *"
            name="seats"
            type="number"
            value={form.seats}
            onChange={handleChange}
            placeholder="4"
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
