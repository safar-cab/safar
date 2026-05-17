import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBookings } from '@/store/slices/bookingsSlice';
import { BookingCard } from '@/components/core/BookingCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

type TabKey = 'upcoming' | 'past' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

const TAB_STATUS_MAP: Record<TabKey, string> = {
  upcoming: 'pending,confirmed,driver_assigned',
  past: 'completed',
  cancelled: 'cancelled',
};

const EMPTY_STATE: Record<TabKey, { title: string; description: string }> = {
  upcoming: {
    title: 'No upcoming bookings',
    description: 'Your upcoming rides will appear here once you book.',
  },
  past: { title: 'No past rides', description: 'Completed rides will show up here.' },
  cancelled: { title: 'No cancelled bookings', description: 'Cancelled rides will appear here.' },
};

export function MyBookings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [page] = useState(1);

  const { list, loading, error } = useAppSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchBookings({ page, status: TAB_STATUS_MAP[activeTab] }));
  }, [dispatch, activeTab, page]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="pb-24">
      <PageHeader title="My Bookings" subtitle="View and manage your rides" />

      {/* Tab Pills */}
      <div className="flex gap-2 mb-6 bg-neutral-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
              activeTab === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={EMPTY_STATE[activeTab].title}
          description={EMPTY_STATE[activeTab].description}
          actionLabel={activeTab === 'upcoming' ? 'Book a Ride' : undefined}
          onAction={activeTab === 'upcoming' ? () => navigate('/customer/book') : undefined}
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {list.map((booking, i) => (
            <motion.div
              key={booking._id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <BookingCard
                booking={booking}
                index={i}
                onClick={() => navigate(`/customer/bookings/${booking._id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
