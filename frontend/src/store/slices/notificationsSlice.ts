import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationsState {
  list: AppNotification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  list: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotifications(_state, _action: PayloadAction<{ page?: number }>) {},
    fetchNotificationsSuccess(
      state,
      action: PayloadAction<{
        notifications: AppNotification[];
        total: number;
        page: number;
        totalPages: number;
        unreadCount: number;
      }>,
    ) {
      state.list = action.payload.notifications;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.unreadCount = action.payload.unreadCount;
      state.loading = false;
    },

    fetchUnreadCount() {},
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },

    markRead(_state, _action: PayloadAction<string>) {},
    markReadSuccess(state, action: PayloadAction<string>) {
      const n = state.list.find((n) => n._id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllRead() {},
    markAllReadSuccess(state) {
      state.list.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },

    // Add a new notification from foreground push
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
      state.total += 1;
    },

    notificationsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    setLoading(state) {
      state.loading = true;
    },
  },
});

export const {
  fetchNotifications,
  fetchNotificationsSuccess,
  fetchUnreadCount,
  setUnreadCount,
  markRead,
  markReadSuccess,
  markAllRead,
  markAllReadSuccess,
  addNotification,
  notificationsError,
  setLoading,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
