import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Star, Car, FileText, Shield, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Driver, User as UserType } from '@/types';

export function DriverProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/driver/me').catch(() => null), api.get('/driver/profile')])
      .then(([d, p]) => {
        if (d) setDriver(d as unknown as Driver);
        setProfile(p as unknown as UserType);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login?portal=driver');
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 text-center"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <h2 className="text-lg font-bold text-neutral-900">{user?.name}</h2>
        <p className="text-sm text-neutral-500">{user?.phone}</p>
        {driver?.isVerified && (
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-success-50 text-success-600 rounded-full text-xs font-medium">
            <Shield className="w-3.5 h-3.5" /> Verified Driver
          </div>
        )}
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-neutral-100 divide-y divide-neutral-100"
      >
        {[
          { icon: Phone, label: 'Phone', value: profile?.phone },
          { icon: Mail, label: 'Email', value: profile?.email || '—' },
          { icon: FileText, label: 'License', value: driver?.licenseNumber || '—' },
          {
            icon: Star,
            label: 'Rating',
            value: driver ? `${driver.avgRating?.toFixed(1)} / 5` : '—',
          },
          { icon: Car, label: 'Total Rides', value: driver?.totalRides?.toString() || '0' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
            <item.icon className="w-5 h-5 text-neutral-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400">{item.label}</p>
              <p className="text-sm text-neutral-800 font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-error-600 border-error-200 hover:bg-error-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </motion.div>
    </div>
  );
}
