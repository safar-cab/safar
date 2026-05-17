import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Rating } from '@/types';

export function MyRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/driver/ratings/my')
      .then((data) => setRatings(data as unknown as Rating[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">My Ratings</h1>
      <p className="text-sm text-neutral-500 mb-5">What customers say about you</p>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : ratings.length === 0 ? (
        <EmptyState icon={Star} title="No ratings yet" description="Complete rides to get ratings from customers" />
      ) : (
        <>
          {/* Average */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100 text-center mb-5"
          >
            <p className="text-4xl font-bold text-neutral-900">{avgRating}</p>
            <div className="flex items-center justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'text-secondary-400 fill-secondary-400' : 'text-neutral-200'}`}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-500">{ratings.length} rating{ratings.length !== 1 ? 's' : ''}</p>
          </motion.div>

          {/* List */}
          <div className="space-y-3">
            {ratings.map((rating, i) => (
              <motion.div
                key={rating._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rating.rating ? 'text-secondary-400 fill-secondary-400' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(rating.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {rating.review && (
                  <div className="flex items-start gap-2 mt-2">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-neutral-600">{rating.review}</p>
                  </div>
                )}
                <p className="text-xs text-neutral-400 mt-2">
                  By {typeof rating.fromUser === 'object' ? rating.fromUser.name : 'Customer'}
                </p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
