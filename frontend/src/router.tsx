import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RootRedirect } from '@/components/RootRedirect';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { DriverLayout } from '@/layouts/DriverLayout';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';

// Admin pages
import { Dashboard } from '@/pages/admin/Dashboard';
import { CarsList } from '@/pages/admin/cars/CarsList';
import { CarForm } from '@/pages/admin/cars/CarForm';
import { DriversList } from '@/pages/admin/drivers/DriversList';
import { DriverForm } from '@/pages/admin/drivers/DriverForm';
import { DriverDetail } from '@/pages/admin/drivers/DriverDetail';
import { UsersList } from '@/pages/admin/users/UsersList';
import { UserDetail } from '@/pages/admin/users/UserDetail';
import { BookingsList } from '@/pages/admin/bookings/BookingsList';
import { BookingDetail } from '@/pages/admin/bookings/BookingDetail';
import { PaymentsList } from '@/pages/admin/payments/PaymentsList';
import { RoutesList } from '@/pages/admin/routes/RoutesList';
import { RouteForm } from '@/pages/admin/routes/RouteForm';
import { Settings } from '@/pages/admin/settings/Settings';

// Placeholder for future phases
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-neutral-700">{title}</h2>
      <p className="text-sm text-neutral-400 mt-1">Coming soon</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  // Auth
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
    ],
  },

  // Admin
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'bookings', element: <BookingsList /> },
      { path: 'bookings/:id', element: <BookingDetail /> },
      { path: 'cars', element: <CarsList /> },
      { path: 'cars/new', element: <CarForm /> },
      { path: 'cars/:id/edit', element: <CarForm /> },
      { path: 'drivers', element: <DriversList /> },
      { path: 'drivers/new', element: <DriverForm /> },
      { path: 'drivers/:id', element: <DriverDetail /> },
      { path: 'users', element: <UsersList /> },
      { path: 'users/:id', element: <UserDetail /> },
      { path: 'payments', element: <PaymentsList /> },
      { path: 'routes', element: <RoutesList /> },
      { path: 'routes/new', element: <RouteForm /> },
      { path: 'routes/:id/edit', element: <RouteForm /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // Driver
  {
    path: '/driver',
    element: <ProtectedRoute role="driver"><DriverLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Placeholder title="Driver Dashboard" /> },
      { path: 'rides', element: <Placeholder title="My Rides" /> },
      { path: 'rides/:id', element: <Placeholder title="Ride Detail" /> },
      { path: 'ratings', element: <Placeholder title="My Ratings" /> },
      { path: 'profile', element: <Placeholder title="Profile" /> },
    ],
  },

  // Customer
  {
    path: '/customer',
    element: <ProtectedRoute role="customer"><CustomerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Placeholder title="Home" /> },
      { path: 'bookings', element: <Placeholder title="My Bookings" /> },
      { path: 'bookings/:id', element: <Placeholder title="Booking Detail" /> },
      { path: 'track', element: <Placeholder title="Track" /> },
      { path: 'track/:bookingId', element: <Placeholder title="Live Tracking" /> },
      { path: 'book', element: <Placeholder title="Book a Ride" /> },
      { path: 'cars', element: <Placeholder title="Cars" /> },
      { path: 'payment/:bookingId', element: <Placeholder title="Payment" /> },
      { path: 'rate/:bookingId', element: <Placeholder title="Rate Ride" /> },
      { path: 'profile', element: <Placeholder title="Profile" /> },
      { path: 'profile/edit', element: <Placeholder title="Edit Profile" /> },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-neutral-300">404</h1>
          <p className="text-neutral-500 mt-2">Page not found</p>
          <a href="/" className="text-primary-600 text-sm mt-4 inline-block hover:underline">Go home</a>
        </div>
      </div>
    ),
  },
]);
