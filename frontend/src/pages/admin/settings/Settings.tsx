import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CompanySettings } from '@/types';

interface SettingsFormData {
  companyName: string;
  phone: string;
  email: string;
  defaultPricePerKm: string;
}

export function Settings() {
  const [form, setForm] = useState<SettingsFormData>({
    companyName: '',
    phone: '',
    email: '',
    defaultPricePerKm: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/admin/dashboard/settings')
      .then((res: any) => {
        setForm({
          companyName: res.companyName || '',
          phone: res.phone || '',
          email: res.email || '',
          defaultPricePerKm: res.defaultPricePerKm?.toString() || '',
        });
      })
      .catch((err: any) => toast.error(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/dashboard/settings', {
        companyName: form.companyName,
        phone: form.phone,
        email: form.email,
        defaultPricePerKm: Number(form.defaultPricePerKm),
      });
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Company configuration" />
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company configuration" />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-4">
          <Input
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Safar"
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@example.com"
          />
          <Input
            label="Default Price per km (paise)"
            name="defaultPricePerKm"
            type="number"
            value={form.defaultPricePerKm}
            onChange={handleChange}
            placeholder="1200"
          />
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-neutral-100">
          <Button type="submit" loading={saving}>
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
