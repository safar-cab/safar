import { STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} />
      {config.label}
    </span>
  );
}
