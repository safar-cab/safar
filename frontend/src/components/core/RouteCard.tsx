import { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import type { RoutePricing } from '@/types';

interface RouteCardProps {
  route: RoutePricing;
  onClick?: () => void;
  index?: number;
}

export const RouteCard = memo(function RouteCard({ route, onClick, index = 0 }: RouteCardProps) {
  const total = route.baseFare + route.distanceKm * route.pricePerKm + route.tollEstimate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-neutral-900">{route.name}</h3>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{route.distanceKm} km</span>
        <span>₹{route.pricePerKm}/km</span>
        {route.tollEstimate > 0 && <span>Tolls ₹{route.tollEstimate}</span>}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <span className="text-base font-bold text-primary-700">
          ₹{total.toLocaleString('en-IN')}
        </span>
        <ArrowRight className="w-4 h-4 text-neutral-400" />
      </div>
    </motion.div>
  );
});
