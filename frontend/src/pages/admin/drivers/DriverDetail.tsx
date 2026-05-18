import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Star, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { DocumentsPanel } from '@/components/core/DocumentsPanel';
import type { Driver, User } from '@/types';

export function DriverDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const res = (await api.get(`/admin/drivers/${id}`)) as Driver;
      setDriver(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch driver';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleVerify = async () => {
    try {
      await api.put(`/admin/drivers/${id}/verify`);
      toast.success('Driver verified successfully');
      fetchDriver();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify driver';
      toast.error(message);
    }
  };

  const user: Partial<User> =
    driver && typeof driver.userId === 'object' ? (driver.userId as User) : {};

  if (loading) {
    return (
      <div>
        <PageHeader title="Driver Details" showBack />
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div>
        <PageHeader title="Driver Details" showBack />
        <p className="text-neutral-500">Driver not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Driver Details"
        showBack
        actions={
          !driver.isVerified ? (
            <Button onClick={handleVerify}>
              <ShieldCheck className="w-4 h-4" />
              Verify Driver
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-3xl space-y-6">
        {/* Driver Photo */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 flex items-center gap-5">
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={user.name || 'Driver'}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-primary-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-neutral-300" />
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-neutral-900">{user.name || 'Unknown'}</p>
            <p className="text-sm text-neutral-500">{user.phone || ''}</p>
            <div className="mt-1">
              <Badge status={driver.isVerified ? 'completed' : 'pending'} />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">User Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Name</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{user.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{user.phone || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{user.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Role</p>
              <p className="text-sm font-medium text-neutral-900 mt-1 capitalize">
                {user.role || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Driver Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">License Number</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{driver.licenseNumber}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">License Expiry</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {driver.licenseExpiry
                  ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">
                Verification Status
              </p>
              <div className="mt-1">
                <Badge status={driver.isVerified ? 'completed' : 'pending'} />
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Availability</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {driver.isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Average Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                <span className="text-sm font-medium text-neutral-900">
                  {driver.avgRating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Total Rides</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">{driver.totalRides ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">Joined</p>
              <p className="text-sm font-medium text-neutral-900 mt-1">
                {new Date(driver.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Document Photos */}
        {(() => {
          const docPhotos = [driver.licensePhoto, driver.aadhaarPhoto].filter((p): p is string =>
            Boolean(p),
          );
          return docPhotos.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Document Photos</h3>
              <ImageGallery images={docPhotos} />
            </div>
          ) : null;
        })()}

        {/* Verification Documents */}
        <DocumentsPanel entityType="driver" entityId={id!} isAdmin />
      </div>
    </div>
  );
}
