import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Car, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRoutes } from '@/store/slices/routesSlice';
import { fetchBookings } from '@/store/slices/bookingsSlice';
import { RouteCard } from '@/components/core/RouteCard';
import { BookingCard } from '@/components/core/BookingCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((s) => s.auth);
  const { list: routes, loading: routesLoading, error: routesError } = useAppSelector((s) => s.routes);
  const { list: bookings, loading: bookingsLoading, error: bookingsError } = useAppSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchRoutes());
    dispatch(fetchBookings({ limit: 3 }));
  }, [dispatch]);

  useEffect(() => {
    if (routesError) toast.error(routesError);
  }, [routesError]);

  useEffect(() => {
    if (bookingsError) toast.error(bookingsError);
  }, [bookingsError]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="pb-24">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-neutral-500">Welcome back,</p>
        <h1 className="text-2xl font-bold text-neutral-900">{firstName}</h1>
      </motion.div>

      {/* Search Bar (visual only) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-8"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Where do you want to go?"
          readOnly
          onClick={() => navigate('/customer/book')}
          className="w-full h-12 bg-white border border-neutral-200 rounded-xl pl-12 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 cursor-pointer shadow-sm focus:outline-none"
        />
      </motion.div>

      {/* Book a Ride CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 mb-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">Book a Ride</h2>
            <p className="text-sm text-primary-100">Comfortable rides at the best prices</p>
          </div>
          <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
            <Car className="w-7 h-7" />
          </div>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full mt-4"
          onClick={() => navigate('/customer/book')}
        >
          Book Now
        </Button>
      </motion.div>

      {/* Popular Routes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Popular Routes</h2>
        </div>
        {routesLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-56 h-32 shrink-0" />
            ))}
          </div>
        ) : routes.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {routes.map((route, i) => (
              <div key={route._id} className="min-w-[220px] shrink-0">
                <RouteCard
                  route={route}
                  index={i}
                  onClick={() => navigate('/customer/book')}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-6">No routes available</p>
        )}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Recent Bookings</h2>
          {bookings.length > 0 && (
            <button
              onClick={() => navigate('/customer/bookings')}
              className="flex items-center gap-0.5 text-sm text-primary-600 font-medium"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {bookingsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking, i) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                index={i}
                onClick={() => navigate(`/customer/bookings/${booking._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-400 mb-3">No bookings yet</p>
            <Button size="sm" onClick={() => navigate('/customer/book')}>
              Book your first ride
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
