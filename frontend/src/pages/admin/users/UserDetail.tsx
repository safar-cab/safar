import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldBan, ShieldCheck, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User } from '@/types';

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Block modal
  const [blockModal, setBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/admin/users/${id}`);
      setUser(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await api.put(`/admin/users/${id}/block`, { reason: blockReason });
      toast.success('User blocked successfully');
      setBlockModal(false);
      fetchUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async () => {
    try {
      await api.put(`/admin/users/${id}/unblock`);
      toast.success('User unblocked successfully');
      fetchUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unblock user');
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="User Details" showBack />
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="User Details" showBack />
        <p className="text-neutral-500">User not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User Details"
        showBack
        actions={
          user.isBlocked ? (
            <Button onClick={handleUnblock}>
              <ShieldCheck className="w-4 h-4" />
              Unblock User
            </Button>
          ) : (
            <Button variant="danger" onClick={() => { setBlockReason(''); setBlockModal(true); }}>
              <ShieldBan className="w-4 h-4" />
              Block User
            </Button>
          )
        }
      />

      <div className="max-w-3xl space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={user.isBlocked ? 'cancelled' : 'completed'} />
                <span className="text-xs text-neutral-500 capitalize bg-neutral-100 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{user.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Joined</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Last Login</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        {user.address && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Street</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{user.address.street}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">City</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{user.address.city}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">State</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{user.address.state}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Pincode</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">{user.address.pincode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Block Info */}
        {user.isBlocked && user.blockReason && (
          <div className="bg-error-50 rounded-xl border border-error-200 p-6">
            <h3 className="text-base font-semibold text-error-700 mb-2">Blocked</h3>
            <p className="text-sm text-error-600">Reason: {user.blockReason}</p>
          </div>
        )}
      </div>

      {/* Block Modal */}
      <Modal open={blockModal} onClose={() => setBlockModal(false)} title="Block User">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to block <span className="font-semibold">{user.name}</span>?
          </p>
          <Input
            label="Reason for blocking"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBlockModal(false)}>Cancel</Button>
            <Button variant="danger" loading={blocking} onClick={handleBlock}>Block User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
