import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface DriverFormData {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  photo: string;
}

interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function DriverForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<DriverFormData>({
    userId: '',
    licenseNumber: '',
    licenseExpiry: '',
    photo: '',
  });
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchDriverUsers = useCallback(async (query: string) => {
    try {
      setUsersLoading(true);
      const params: Record<string, string> = {};
      if (query) params.search = query;
      const res = await api.get('/lookup/driver-users', { params }) as SelectOption[];
      setUserOptions(res);
    } catch {
      setUserOptions([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverUsers('');
  }, [fetchDriverUsers]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.licenseNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/drivers', {
        userId: form.userId,
        licenseNumber: form.licenseNumber,
        licenseExpiry: form.licenseExpiry || undefined,
        photo: form.photo || undefined,
      });
      toast.success('Driver profile created successfully');
      navigate('/admin/drivers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create driver';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [form, navigate]);

  return (
    <div>
      <PageHeader title="Add New Driver" showBack />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-4">
          <Select
            label="User (role=driver) *"
            placeholder="Search and select a user..."
            options={userOptions}
            value={form.userId}
            onChange={(val) => setForm((prev) => ({ ...prev, userId: val }))}
            searchable
            onSearch={fetchDriverUsers}
            loading={usersLoading}
          />
          <Input
            label="License Number *"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            placeholder="DL1234567890"
          />
          <Input
            label="License Expiry"
            name="licenseExpiry"
            type="date"
            value={form.licenseExpiry}
            onChange={handleChange}
          />
          <ImageUpload
            label="Driver Photo"
            value={form.photo ? [form.photo] : []}
            onChange={(urls) => setForm((prev) => ({ ...prev, photo: urls[0] || '' }))}
            maxFiles={1}
            folder="drivers"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/drivers')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            <Save className="w-4 h-4" />
            Create Driver
          </Button>
        </div>
      </form>
    </div>
  );
}
