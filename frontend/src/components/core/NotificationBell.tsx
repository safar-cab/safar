import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotifications, markRead, markAllRead } from '@/store/slices/notificationsSlice';
import { cn } from '@/lib/cn';

const TYPE_COLORS: Record<string, string> = {
  booking_confirmed: 'bg-green-500',
  driver_assigned: 'bg-blue-500',
  driver_en_route: 'bg-indigo-500',
  driver_arrived: 'bg-purple-500',
  ride_started: 'bg-cyan-500',
  ride_completed: 'bg-emerald-500',
  booking_cancelled: 'bg-red-500',
  payment_received: 'bg-amber-500',
  general: 'bg-neutral-400',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, unreadCount, loading } = useAppSelector((s) => s.notifications);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (!open) {
      dispatch(fetchNotifications({ page: 1 }));
    }
    setOpen(!open);
  };

  const handleClick = (notif: (typeof list)[0]) => {
    if (!notif.read) {
      dispatch(markRead(notif._id));
    }
    setOpen(false);
    if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllRead())}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && list.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">No notifications yet</div>
            ) : (
              list.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-50',
                    !notif.read && 'bg-primary-50/30',
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mt-2 shrink-0',
                      TYPE_COLORS[notif.type] || TYPE_COLORS.general,
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm',
                        !notif.read ? 'font-semibold text-neutral-900' : 'text-neutral-700',
                      )}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {notif.read && <Check className="w-3.5 h-3.5 text-neutral-300 mt-1 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
