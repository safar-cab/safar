import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Star,
  HelpCircle,
  LogOut,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { PageHeader } from '@/components/ui/PageHeader';

const MENU_ITEMS = [
  { icon: Pencil, label: 'Edit Profile', path: '/customer/profile/edit' },
  { icon: CreditCard, label: 'Payment History', path: '/customer/bookings' },
  { icon: Star, label: 'My Ratings', path: '/customer/bookings' },
  { icon: HelpCircle, label: 'Help & Support', path: '#' },
];

export function CustomerProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader title="Profile" />

      {/* Avatar + Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-primary-600">{initials}</span>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">{user?.name || 'Customer'}</h2>
        <p className="text-sm text-neutral-500">{user?.phone || ''}</p>
        {user?.email && (
          <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
        )}
      </motion.div>

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden mb-4"
      >
        {MENU_ITEMS.map((item, _i) => (
          <button
            key={item.label}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <item.icon className="w-4.5 h-4.5 text-neutral-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-neutral-800">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-4 bg-white rounded-xl border border-error-100 hover:bg-error-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-error-50 flex items-center justify-center">
            <LogOut className="w-4.5 h-4.5 text-error-500" />
          </div>
          <span className="text-sm font-medium text-error-600">Logout</span>
        </button>
      </motion.div>
    </div>
  );
}
