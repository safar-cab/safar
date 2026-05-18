import { Outlet, NavLink } from 'react-router-dom';
import { Home, CalendarCheck, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NotificationBell } from '@/components/core/NotificationBell';

const tabs = [
  { to: '/customer', icon: Home, label: 'Home', end: true },
  { to: '/customer/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/customer/track', icon: MapPin, label: 'Track' },
  { to: '/customer/profile', icon: User, label: 'Profile' },
];

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-16 sm:pb-18">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-100">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Safar" className="w-7 h-7 rounded-lg" />
            <span className="font-semibold text-neutral-800 text-lg">Safar</span>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-50 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {tabs.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 px-4 text-xs font-medium transition-colors relative',
                  isActive ? 'text-primary-600' : 'text-neutral-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-0.5 w-5 h-0.5 bg-primary-600 rounded-full" />
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
