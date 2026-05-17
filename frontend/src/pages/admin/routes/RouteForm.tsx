import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface PricingPreviewProps {
  distanceKm: number;
  pricePerKm: number;
  baseFare: number;
  tollEstimate: number;
}

function PricingPreview({ distanceKm, pricePerKm, baseFare, tollEstimate }: PricingPreviewProps) {
  const distanceCharge = useMemo(() => distanceKm * pricePerKm, [distanceKm, pricePerKm]);
  const subtotal = useMemo(() => baseFare + distanceCharge + tollEstimate, [baseFare, distanceCharge, tollEstimate]);
  const gst = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  if (distanceKm <= 0 || pricePerKm <= 0) return null;

  return (
    <div className="bg-primary-50 rounded-lg p-4 space-y-2 text-sm mt-4">
      <h4 className="font-semibold text-primary-800">Estimated Pricing</h4>
      <div className="flex justify-between"><span>Distance Charge</span><span>{'\u20B9'}{distanceCharge.toLocaleString()}</span></div>
      <div className="flex justify-between"><span>Base Fare</span><span>{'\u20B9'}{baseFare.toLocaleString()}</span></div>
      <div className="flex justify-between"><span>Tolls</span><span>{'\u20B9'}{tollEstimate.toLocaleString()}</span></div>
      <div className="flex justify-between"><span>GST (5%)</span><span>{'\u20B9'}{gst.toLocaleString()}</span></div>
      <div className="flex justify-between font-bold text-primary-900 pt-2 border-t border-primary-200">
        <span>Total</span><span>{'\u20B9'}{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

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
        .then((res: unknown) => {
          const data = res as Record<string, unknown>;
          setForm({
            name: (data.name as string) || '',
            distanceKm: data.distanceKm?.toString() || '',
            pricePerKm: data.pricePerKm?.toString() || '',
            baseFare: data.baseFare?.toString() || '',
            tollEstimate: data.tollEstimate?.toString() || '',
          });
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to load route';
          toast.error(message);
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save route';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [form, isEdit, id, navigate]);

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
              label="Price per km (₹) *"
              name="pricePerKm"
              type="number"
              value={form.pricePerKm}
              onChange={handleChange}
              placeholder="1200"
            />
            <Input
              label="Base Fare (₹) *"
              name="baseFare"
              type="number"
              value={form.baseFare}
              onChange={handleChange}
              placeholder="50000"
            />
            <Input
              label="Toll Estimate (₹)"
              name="tollEstimate"
              type="number"
              value={form.tollEstimate}
              onChange={handleChange}
              placeholder="15000"
            />
          </div>
        </div>

        <PricingPreview
          distanceKm={Number(form.distanceKm) || 0}
          pricePerKm={Number(form.pricePerKm) || 0}
          baseFare={Number(form.baseFare) || 0}
          tollEstimate={Number(form.tollEstimate) || 0}
        />

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
