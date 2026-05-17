import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DriverFormData {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export function DriverForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<DriverFormData>({
    userId: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      });
      toast.success('Driver profile created successfully');
      navigate('/admin/drivers');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add New Driver" showBack />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <div className="space-y-4">
          <Input
            label="User ID (role=driver) *"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            placeholder="Enter user ID of a user with driver role"
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
