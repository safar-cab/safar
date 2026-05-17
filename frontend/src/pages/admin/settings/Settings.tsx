import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

type TabId = 'general' | 'payment' | 'email';

interface SettingsFormData {
  // General
  companyName: string;
  phone: string;
  email: string;
  defaultPricePerKm: string;
  // Payment
  razorpayKeyId: string;
  razorpayKeySecret: string;
  webhookSecret: string;
  // Email
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpFrom: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'payment', label: 'Payment Settings' },
  { id: 'email', label: 'Email Settings' },
];

const initialForm: SettingsFormData = {
  companyName: '',
  phone: '',
  email: '',
  defaultPricePerKm: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  webhookSecret: '',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpFrom: '',
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [form, setForm] = useState<SettingsFormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/admin/dashboard/settings')
      .then((res: unknown) => {
        const data = res as Record<string, unknown>;
        setForm({
          companyName: (data.companyName as string) || '',
          phone: (data.phone as string) || '',
          email: (data.email as string) || '',
          defaultPricePerKm: data.defaultPricePerKm?.toString() || '',
          razorpayKeyId: (data.razorpayKeyId as string) || '',
          razorpayKeySecret: (data.razorpayKeySecret as string) || '',
          webhookSecret: (data.webhookSecret as string) || '',
          smtpHost: (data.smtpHost as string) || '',
          smtpPort: data.smtpPort?.toString() || '',
          smtpUser: (data.smtpUser as string) || '',
          smtpFrom: (data.smtpFrom as string) || '',
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load settings';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/dashboard/settings', {
        companyName: form.companyName,
        phone: form.phone,
        email: form.email,
        defaultPricePerKm: Number(form.defaultPricePerKm),
        razorpayKeyId: form.razorpayKeyId,
        razorpayKeySecret: form.razorpayKeySecret,
        webhookSecret: form.webhookSecret,
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
        smtpUser: form.smtpUser,
        smtpFrom: form.smtpFrom,
      });
      toast.success('Settings saved successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [form]);

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

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
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
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <Input
              label="Razorpay Key ID"
              name="razorpayKeyId"
              value={form.razorpayKeyId}
              onChange={handleChange}
              placeholder="rzp_live_..."
            />
            <Input
              label="Razorpay Key Secret"
              name="razorpayKeySecret"
              type="password"
              value={form.razorpayKeySecret}
              onChange={handleChange}
              placeholder="Enter key secret"
            />
            <Input
              label="Webhook Secret"
              name="webhookSecret"
              type="password"
              value={form.webhookSecret}
              onChange={handleChange}
              placeholder="Enter webhook secret"
            />
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <Input
              label="SMTP Host"
              name="smtpHost"
              value={form.smtpHost}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
            />
            <Input
              label="SMTP Port"
              name="smtpPort"
              type="number"
              value={form.smtpPort}
              onChange={handleChange}
              placeholder="587"
            />
            <Input
              label="SMTP User"
              name="smtpUser"
              value={form.smtpUser}
              onChange={handleChange}
              placeholder="user@gmail.com"
            />
            <Input
              label="SMTP From Address"
              name="smtpFrom"
              type="email"
              value={form.smtpFrom}
              onChange={handleChange}
              placeholder="noreply@example.com"
            />
          </div>
        )}

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
