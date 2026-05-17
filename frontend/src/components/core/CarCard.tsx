import { memo } from 'react';
import { motion } from 'framer-motion';
import { Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Car as CarType } from '@/types';
import { cn } from '@/lib/cn';

interface CarCardProps {
  car: CarType;
  selected?: boolean;
  onSelect?: () => void;
  index?: number;
}

const categoryColors: Record<string, string> = {
  sedan: 'bg-primary-50 text-primary-700',
  suv: 'bg-success-50 text-success-700',
  hatchback: 'bg-secondary-50 text-secondary-700',
  tempo_traveller: 'bg-warning-50 text-warning-700',
  luxury: 'bg-purple-50 text-purple-700',
};

export const CarCard = memo(function CarCard({ car, selected, onSelect, index = 0 }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer',
        selected
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-neutral-100 active:scale-[0.98]',
      )}
      onClick={onSelect}
    >
      {/* Car icon placeholder */}
      <div className="w-full h-28 bg-neutral-50 rounded-lg flex items-center justify-center mb-3">
        <Car className="w-12 h-12 text-neutral-300" />
      </div>

      <h3 className="text-sm font-semibold text-neutral-900">
        {car.make} {car.model}
      </h3>

      <div className="flex items-center gap-2 mt-1.5">
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
            categoryColors[car.category] || 'bg-neutral-100 text-neutral-600',
          )}
        >
          {car.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Users className="w-3.5 h-3.5" /> {car.seats}
        </span>
        {car.color && <span className="text-xs text-neutral-400">{car.color}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <span className="text-sm font-bold text-primary-700">₹12/km</span>
        {onSelect && (
          <Button size="sm" variant={selected ? 'primary' : 'outline'}>
            {selected ? 'Selected' : 'Select'}
          </Button>
        )}
      </div>
    </motion.div>
  );
});
