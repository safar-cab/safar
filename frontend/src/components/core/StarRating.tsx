import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function StarRating({ value, onChange, size = 'md', readonly }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          whileTap={readonly ? {} : { scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer')}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value
                ? 'text-secondary-400 fill-secondary-400'
                : 'text-neutral-200',
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}
