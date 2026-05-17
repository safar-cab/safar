import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { rateBooking } from '@/store/slices/bookingsSlice';
import { StarRating } from '@/components/core/StarRating';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export function RateRide() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((s) => s.bookings);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (submitted && !loading && !error) {
      toast.success('Thanks for your feedback!');
      navigate(`/customer/bookings/${bookingId}`, { replace: true });
    }
  }, [submitted, loading, error, navigate, bookingId]);

  const handleSubmit = () => {
    if (!bookingId) return;
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitted(true);
    dispatch(
      rateBooking({
        bookingId,
        rating,
        review: review.trim() || undefined,
      }),
    );
  };

  const ratingLabels = ['', 'Poor', 'Below Average', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="pb-28">
      <PageHeader title="Rate Your Ride" showBack />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center mt-8 mb-8"
      >
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-primary-500" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-1">How was your ride?</h2>
        <p className="text-sm text-neutral-500 max-w-xs">
          Your feedback helps us improve the experience for everyone.
        </p>
      </motion.div>

      {/* Star Rating */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center mb-8"
      >
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-secondary-600 mt-3"
          >
            {ratingLabels[rating]}
          </motion.p>
        )}
      </motion.div>

      {/* Review Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Write a review (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          maxLength={500}
          className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
        />
        <p className="text-xs text-neutral-400 mt-1 text-right">{review.length}/500</p>
      </motion.div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 safe-area-bottom z-30">
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          loading={loading}
          disabled={rating === 0}
          onClick={handleSubmit}
        >
          Submit Rating
        </Button>
      </div>
    </div>
  );
}
