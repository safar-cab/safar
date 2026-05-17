import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/format';

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
        .then((res: unknown) => {
          const data = res as Record<string, unknown>;
          setForm({
            name: String(data.name || ''),
            distanceKm: String(data.distanceKm || ''),
            pricePerKm: String(data.pricePerKm || ''),
            baseFare: String(data.baseFare || ''),
            tollEstimate: String(data.tollEstimate || ''),
          });
        })
        .catch((err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Failed to load route');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Auto-calculated values
  const distanceKm = useMemo(() => Number(form.distanceKm) || 0, [form.distanceKm]);
  const pricePerKm = useMemo(() => Number(form.pricePerKm) || 0, [form.pricePerKm]);
  const baseFare = useMemo(() => Number(form.baseFare) || 0, [form.baseFare]);
  const tollEstimate = useMemo(() => Number(form.tollEstimate) || 0, [form.tollEstimate]);

  const distanceCharge = useMemo(() => distanceKm * pricePerKm, [distanceKm, pricePerKm]);
  const taxableAmount = useMemo(() => baseFare + distanceCharge, [baseFare, distanceCharge]);
  const cgst = useMemo(() => Math.round(taxableAmount * 0.025), [taxableAmount]);
  const sgst = useMemo(() => Math.round(taxableAmount * 0.025), [taxableAmount]);
  const gstTotal = cgst + sgst;
  const grandTotal = useMemo(() => taxableAmount + tollEstimate + gstTotal, [taxableAmount, tollEstimate, gstTotal]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.distanceKm || !form.pricePerKm) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, distanceKm, pricePerKm, baseFare, tollEstimate };
      if (isEdit) {
        await api.put(`/admin/routes/${id}`, payload);
        toast.success('Route updated');
      } else {
        await api.post('/admin/routes', payload);
        toast.success('Route created');
      }
      navigate('/admin/routes');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save route');
    } finally {
      setLoading(false);
    }
  }, [form.name, distanceKm, pricePerKm, baseFare, tollEstimate, isEdit, id, navigate]);

  if (fetching) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Edit Route' : 'Add Route'} showBack />
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Route' : 'Add New Route'} showBack />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-4">
          <Input label="Route Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Indore to Bhopal" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Distance (km) *" name="distanceKm" type="number" value={form.distanceKm} onChange={handleChange} placeholder="195" />
            <Input label="Price per km (₹) *" name="pricePerKm" type="number" value={form.pricePerKm} onChange={handleChange} placeholder="12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Fare (₹)" name="baseFare" type="number" value={form.baseFare} onChange={handleChange} placeholder="500" />
            <Input label="Toll Estimate (₹)" name="tollEstimate" type="number" value={form.tollEstimate} onChange={handleChange} placeholder="200" />
          </div>

          {/* Auto-calculated readonly fields */}
          {distanceKm > 0 && pricePerKm > 0 && (
            <>
              <div className="border-t border-neutral-200 pt-4 mt-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Auto-Calculated</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Distance Charge (₹)</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(distanceCharge)}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{distanceKm} km x {formatCurrency(pricePerKm)}/km</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Taxable Amount (₹)</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(taxableAmount)}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Base fare + Distance charge</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">CGST 2.5% (₹)</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(cgst)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">SGST 2.5% (₹)</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(sgst)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Total GST (₹)</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(gstTotal)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Grand Total (₹)</label>
                <div className="h-14 px-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center text-primary-700 font-bold text-lg">
                  {formatCurrency(grandTotal)}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Taxable {formatCurrency(taxableAmount)} + Tolls {formatCurrency(tollEstimate)} + GST {formatCurrency(gstTotal)}
                  <span className="ml-2 text-neutral-300">| SAC: 996601</span>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/routes')}>Cancel</Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" />
            {isEdit ? 'Update Route' : 'Create Route'}
          </Button>
        </div>
      </form>
    </div>
  );
}
