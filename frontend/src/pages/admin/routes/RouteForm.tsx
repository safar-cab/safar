import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

interface RouteFormData {
  name: string;
  distanceKm: string;
  pricePerKm: string;
  baseFare: string;
  tollEstimate: string;
}

const initialData: RouteFormData = {
  name: '',
  distanceKm: '',
  pricePerKm: '',
  baseFare: '',
  tollEstimate: '',
};

export function RouteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<RouteFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      api
        .get(`/admin/routes/${id}`)
        .then((res: any) => {
          setForm({
            name: res.name || '',
            distanceKm: res.distanceKm?.toString() || '',
            pricePerKm: res.pricePerKm?.toString() || '',
            baseFare: res.baseFare?.toString() || '',
            tollEstimate: res.tollEstimate?.toString() || '',
          });
        })
        .catch((err: any) => toast.error(err.message || 'Failed to load route'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.distanceKm || !form.pricePerKm || !form.baseFare) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        distanceKm: Number(form.distanceKm),
        pricePerKm: Number(form.pricePerKm),
        baseFare: Number(form.baseFare),
        tollEstimate: Number(form.tollEstimate) || 0,
      };

      if (isEdit) {
        await api.put(`/admin/routes/${id}`, payload);
        toast.success('Route updated successfully');
      } else {
        await api.post('/admin/routes', payload);
        toast.success('Route created successfully');
      }
      navigate('/admin/routes');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Edit Route' : 'Add Route'} showBack />
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Route' : 'Add New Route'} showBack />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-4">
          <Input
            label="Route Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Mumbai to Pune"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Distance (km) *"
              name="distanceKm"
              type="number"
              value={form.distanceKm}
              onChange={handleChange}
              placeholder="150"
            />
            <Input
              label="Price per km (paise) *"
              name="pricePerKm"
              type="number"
              value={form.pricePerKm}
              onChange={handleChange}
              placeholder="1200"
            />
            <Input
              label="Base Fare (paise) *"
              name="baseFare"
              type="number"
              value={form.baseFare}
              onChange={handleChange}
              placeholder="50000"
            />
            <Input
              label="Toll Estimate (paise)"
              name="tollEstimate"
              type="number"
              value={form.tollEstimate}
              onChange={handleChange}
              placeholder="15000"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/routes')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Update Route' : 'Create Route'}
          </Button>
        </div>
      </form>
    </div>
  );
}
