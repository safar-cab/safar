import { call, put, takeLatest } from 'redux-saga/effects';
import api from '@/lib/api';
import {
  fetchNotifications,
  fetchNotificationsSuccess,
  fetchUnreadCount,
  setUnreadCount,
  markRead,
  markReadSuccess,
  markAllRead,
  markAllReadSuccess,
  notificationsError,
  setLoading,
} from '../slices/notificationsSlice';

function* handleFetchNotifications(action: ReturnType<typeof fetchNotifications>) {
  try {
    yield put(setLoading());
    const { page = 1 } = action.payload;
    const { data } = yield call(api.get, `/api/notifications?page=${page}&limit=20`);
    yield put(fetchNotificationsSuccess(data));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load notifications';
    yield put(notificationsError(msg));
  }
}

function* handleFetchUnreadCount() {
  try {
    const { data } = yield call(api.get, '/api/notifications/unread-count');
    yield put(setUnreadCount(data.count));
  } catch {
    // silent fail for count
  }
}

function* handleMarkRead(action: ReturnType<typeof markRead>) {
  try {
    yield call(api.patch, `/api/notifications/${action.payload}/read`);
    yield put(markReadSuccess(action.payload));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to mark as read';
    yield put(notificationsError(msg));
  }
}

function* handleMarkAllRead() {
  try {
    yield call(api.post, '/api/notifications/mark-all-read');
    yield put(markAllReadSuccess());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to mark all as read';
    yield put(notificationsError(msg));
  }
}

export function* notificationsSaga() {
  yield takeLatest(fetchNotifications.type, handleFetchNotifications);
  yield takeLatest(fetchUnreadCount.type, handleFetchUnreadCount);
  yield takeLatest(markRead.type, handleMarkRead);
  yield takeLatest(markAllRead.type, handleMarkAllRead);
}
