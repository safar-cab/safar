import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-1', trendUp ? 'text-success-600' : 'text-error-600')}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
