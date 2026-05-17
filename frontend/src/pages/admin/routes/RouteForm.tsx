import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, MapPin, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/format';

const INDIAN_STATES = [
  'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Uttar Pradesh',
  'Karnataka', 'Tamil Nadu', 'Telangana', 'Kerala', 'Andhra Pradesh',
  'West Bengal', 'Bihar', 'Punjab', 'Haryana', 'Chhattisgarh',
  'Jharkhand', 'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Delhi',
].map((s) => ({ value: s, label: s }));

interface RouteFormData {
  fromCity: string;
  fromState: string;
  toCity: string;
  toState: string;
  distanceKm: string;
  pricePerKm: string;
  baseFare: string;
  tollEstimate: string;
}

const initialData: RouteFormData = {
  fromCity: '', fromState: 'Madhya Pradesh',
  toCity: '', toState: 'Madhya Pradesh',
  distanceKm: '', pricePerKm: '', baseFare: '', tollEstimate: '',
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
      api.get(`/admin/routes/${id}`)
        .then((res: unknown) => {
          const data = res as Record<string, unknown>;
          const from = data.fromCity as Record<string, string> | undefined;
          const to = data.toCity as Record<string, string> | undefined;
          // Parse name "City1 to City2" as fallback
          const nameParts = String(data.name || '').split(' to ');
          setForm({
            fromCity: from?.name || nameParts[0] || '',
            fromState: from?.state || 'Madhya Pradesh',
            toCity: to?.name || nameParts[1] || '',
            toState: to?.state || 'Madhya Pradesh',
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

  const handleSelect = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Auto-generate route name
  const routeName = useMemo(() => {
    if (form.fromCity && form.toCity) return `${form.fromCity} to ${form.toCity}`;
    return '';
  }, [form.fromCity, form.toCity]);

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
  const showCalc = distanceKm > 0 && pricePerKm > 0;

  // Check if inter-state (IGST vs CGST+SGST)
  const isInterState = useMemo(() => form.fromState !== form.toState, [form.fromState, form.toState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromCity || !form.toCity || !form.distanceKm || !form.pricePerKm) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: routeName,
        fromCity: { name: form.fromCity, state: form.fromState },
        toCity: { name: form.toCity, state: form.toState },
        distanceKm, pricePerKm, baseFare, tollEstimate,
      };
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
  }, [form, routeName, distanceKm, pricePerKm, baseFare, tollEstimate, isEdit, id, navigate]);

  if (fetching) {
    return (
      <div>
        <PageHeader title={isEdit ? 'Edit Route' : 'Add Route'} showBack />
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Route' : 'Add New Route'} showBack />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-5">
          {/* Route Name (auto-generated) */}
          {routeName && (
            <div className="flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-800">{form.fromCity}</span>
              <ArrowRight className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-semibold text-primary-800">{form.toCity}</span>
              {isInterState && <span className="ml-auto text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">Inter-State</span>}
            </div>
          )}

          {/* From */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">From</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" name="fromCity" value={form.fromCity} onChange={handleChange} placeholder="Indore" />
              <Select label="State *" options={INDIAN_STATES} value={form.fromState} onChange={(v) => handleSelect('fromState', v)} />
            </div>
          </div>

          {/* To */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">To</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" name="toCity" value={form.toCity} onChange={handleChange} placeholder="Bhopal" />
              <Select label="State *" options={INDIAN_STATES} value={form.toState} onChange={(v) => handleSelect('toState', v)} />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Distance (km) *" name="distanceKm" type="number" value={form.distanceKm} onChange={handleChange} placeholder="195" />
              <Input label="Price per km (₹) *" name="pricePerKm" type="number" value={form.pricePerKm} onChange={handleChange} placeholder="12" />
              <Input label="Base Fare (₹)" name="baseFare" type="number" value={form.baseFare} onChange={handleChange} placeholder="500" />
              <Input label="Toll Estimate (₹)" name="tollEstimate" type="number" value={form.tollEstimate} onChange={handleChange} placeholder="200" />
            </div>
          </div>

          {/* Auto-Calculated */}
          {showCalc && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Auto-Calculated</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Distance Charge</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(distanceCharge)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Taxable Amount</label>
                  <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                    {formatCurrency(taxableAmount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {isInterState ? (
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">IGST (5%)</label>
                    <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                      {formatCurrency(gstTotal)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">CGST 2.5%</label>
                      <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                        {formatCurrency(cgst)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">SGST 2.5%</label>
                      <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                        {formatCurrency(sgst)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Total GST</label>
                      <div className="h-12 px-4 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center text-neutral-700 font-medium">
                        {formatCurrency(gstTotal)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Grand Total</label>
                <div className="h-14 px-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center text-primary-700 font-bold text-lg">
                  {formatCurrency(grandTotal)}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {isInterState ? 'IGST' : 'CGST+SGST'} on {formatCurrency(taxableAmount)} | Tolls {formatCurrency(tollEstimate)} (exempt) | SAC: 996601
                </p>
              </div>
            </div>
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
