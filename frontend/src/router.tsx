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
import { PaymentDetail } from '@/pages/admin/payments/PaymentDetail';
import { DocumentQueue } from '@/pages/admin/documents/DocumentQueue';
import { LiveRides } from '@/pages/admin/tracking/LiveRides';
import { StatesAndCities } from '@/pages/admin/locations/StatesAndCities';
import { LiveTracking } from '@/pages/customer/tracking/LiveTracking';
import { TrackRides } from '@/pages/customer/tracking/TrackRides';
import { ActiveRide } from '@/pages/driver/rides/ActiveRide';

// Driver pages
import { DriverDashboard } from '@/pages/driver/Dashboard';
import { RideList } from '@/pages/driver/rides/RideList';
import { RideDetail } from '@/pages/driver/rides/RideDetail';
import { MyRatings } from '@/pages/driver/ratings/MyRatings';
import { DriverProfile } from '@/pages/driver/profile/DriverProfile';

// Customer pages
import { Home as CustomerHome } from '@/pages/customer/Home';
import { MyBookings } from '@/pages/customer/bookings/MyBookings';
import { BookingDetail as CustomerBookingDetail } from '@/pages/customer/bookings/BookingDetail';
import { BookingForm } from '@/pages/customer/booking/BookingForm';
import { RateRide } from '@/pages/customer/rating/RateRide';
import { CustomerProfile } from '@/pages/customer/profile/CustomerProfile';

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
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
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
      { path: 'payments/:id', element: <PaymentDetail /> },
      { path: 'routes', element: <RoutesList /> },
      { path: 'routes/new', element: <RouteForm /> },
      { path: 'routes/:id/edit', element: <RouteForm /> },
      { path: 'documents', element: <DocumentQueue /> },
      { path: 'live-rides', element: <LiveRides /> },
      { path: 'locations', element: <StatesAndCities /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // Driver
  {
    path: '/driver',
    element: (
      <ProtectedRoute role="driver">
        <DriverLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DriverDashboard /> },
      { path: 'rides', element: <RideList /> },
      { path: 'rides/:id', element: <RideDetail /> },
      { path: 'rides/:id/active', element: <ActiveRide /> },
      { path: 'ratings', element: <MyRatings /> },
      { path: 'profile', element: <DriverProfile /> },
    ],
  },

  // Customer
  {
    path: '/customer',
    element: (
      <ProtectedRoute role="customer">
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CustomerHome /> },
      { path: 'bookings', element: <MyBookings /> },
      { path: 'bookings/:id', element: <CustomerBookingDetail /> },
      { path: 'track', element: <TrackRides /> },
      { path: 'track/:bookingId', element: <LiveTracking /> },
      { path: 'book', element: <BookingForm /> },
      { path: 'cars', element: <Placeholder title="Cars" /> },
      { path: 'payment/:bookingId', element: <Placeholder title="Payment" /> },
      { path: 'rate/:bookingId', element: <RateRide /> },
      { path: 'profile', element: <CustomerProfile /> },
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
          <a href="/" className="text-primary-600 text-sm mt-4 inline-block hover:underline">
            Go home
          </a>
        </div>
      </div>
    ),
  },
]);
