import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Star, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const tabs = [
  { to: '/driver', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/driver/rides', icon: Car, label: 'Rides' },
  { to: '/driver/ratings', icon: Star, label: 'Ratings' },
  { to: '/driver/profile', icon: User, label: 'Profile' },
];

export function DriverLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-16 sm:pb-18">
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
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 py-2 px-4 text-xs font-medium transition-colors relative',
                isActive ? 'text-primary-600' : 'text-neutral-400',
              )}
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
