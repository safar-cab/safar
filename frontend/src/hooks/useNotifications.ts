import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchUnreadCount, addNotification } from '@/store/slices/notificationsSlice';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useNotifications(isAuthenticated: boolean) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Poll unread count
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 30_000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    // Request permission + register token
    (async () => {
      const token = await requestNotificationPermission();
      if (token) {
        try {
          await api.post('/notifications/fcm-token', {
            token,
            platform: 'web',
          });
        } catch {
          // silent fail
        }
      }
    })();

    // Handle foreground messages
    const unsubscribe = onForegroundMessage((payload: any) => {
      const { title, body } = payload?.notification || {};
      const data = payload?.data || {};

      if (title) {
        toast(title, { icon: '🔔' });

        dispatch(
          addNotification({
            _id: Date.now().toString(),
            title,
            body: body || '',
            type: data.type || 'general',
            data,
            read: false,
            createdAt: new Date().toISOString(),
          }),
        );
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isAuthenticated, dispatch]);
}
