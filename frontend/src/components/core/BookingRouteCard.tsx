import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface Stop {
  order?: number;
  address: string;
  status?: string;
}

interface BookingRouteCardProps {
  bookingId: string;
  status: string;
  pickup: { address: string; landmark?: string };
  drop: { address: string; landmark?: string };
  stops?: Stop[];
}

export function BookingRouteCard({
  bookingId,
  status,
  pickup,
  drop,
  stops = [],
}: BookingRouteCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-mono text-neutral-400">{bookingId}</span>
        <Badge status={status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3 h-3 rounded-full border-2 border-success-500 bg-success-100" />
            {stops.map((stop, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-neutral-200" />
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border-2',
                    stop.status === 'reached'
                      ? 'border-success-500 bg-success-100'
                      : 'border-amber-400 bg-amber-50',
                  )}
                />
              </div>
            ))}
            <div className="w-0.5 h-8 bg-neutral-200" />
            <div className="w-3 h-3 rounded-full border-2 border-error-500 bg-error-100" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-neutral-400 font-medium">PICKUP</p>
              <p className="text-sm text-neutral-800 font-medium">{pickup.address}</p>
              {pickup.landmark && (
                <p className="text-xs text-neutral-500">{pickup.landmark}</p>
              )}
            </div>
            {stops.map((stop, i) => (
              <div key={i}>
                <p className="text-xs text-amber-600 font-medium">
                  STOP {stop.order || i + 1}
                  {stop.status === 'reached' ? ' ✓' : ''}
                </p>
                <p className="text-sm text-neutral-700">{stop.address}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-neutral-400 font-medium">DROP</p>
              <p className="text-sm text-neutral-800 font-medium">{drop.address}</p>
              {drop.landmark && (
                <p className="text-xs text-neutral-500">{drop.landmark}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
