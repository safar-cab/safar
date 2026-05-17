import { call, put, takeLatest } from 'redux-saga/effects';
import api from '@/lib/api';
import {
  fetchBookings,
  fetchBookingsSuccess,
  fetchBookingDetail,
  fetchBookingDetailSuccess,
  createBooking,
  createBookingSuccess,
  cancelBooking,
  cancelBookingSuccess,
  rateBooking,
  rateBookingSuccess,
  bookingsError,
} from '../slices/bookingsSlice';
import type { Booking } from '@/types';

function* handleFetchBookings(action: ReturnType<typeof fetchBookings>) {
  try {
    const { page = 1, status, limit = 10 } = action.payload;
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);

    const data: { bookings: Booking[]; total: number; page: number; totalPages: number } =
      yield call(api.get, `/customer/bookings?${params}`);
    yield put(fetchBookingsSuccess(data));
  } catch (err) {
    yield put(bookingsError(err instanceof Error ? err.message : 'Failed to fetch bookings'));
  }
}

function* handleFetchBookingDetail(action: ReturnType<typeof fetchBookingDetail>) {
  try {
    const data: Booking = yield call(api.get, `/customer/bookings/${action.payload}`);
    yield put(fetchBookingDetailSuccess(data));
  } catch (err) {
    yield put(bookingsError(err instanceof Error ? err.message : 'Failed to fetch booking'));
  }
}

function* handleCreateBooking(action: ReturnType<typeof createBooking>) {
  try {
    const data: Booking = yield call(api.post, '/customer/bookings', action.payload);
    yield put(createBookingSuccess(data));
  } catch (err) {
    yield put(bookingsError(err instanceof Error ? err.message : 'Failed to create booking'));
  }
}

function* handleCancelBooking(action: ReturnType<typeof cancelBooking>) {
  try {
    const { id, reason } = action.payload;
    const data: Booking = yield call(api.put, `/customer/bookings/${id}/cancel`, { reason });
    yield put(cancelBookingSuccess(data));
  } catch (err) {
    yield put(bookingsError(err instanceof Error ? err.message : 'Failed to cancel booking'));
  }
}

function* handleRateBooking(action: ReturnType<typeof rateBooking>) {
  try {
    yield call(api.post, '/customer/ratings', action.payload);
    yield put(rateBookingSuccess());
  } catch (err) {
    yield put(bookingsError(err instanceof Error ? err.message : 'Failed to rate ride'));
  }
}

export function* bookingsSaga() {
  yield takeLatest(fetchBookings.type, handleFetchBookings);
  yield takeLatest(fetchBookingDetail.type, handleFetchBookingDetail);
  yield takeLatest(createBooking.type, handleCreateBooking);
  yield takeLatest(cancelBooking.type, handleCancelBooking);
  yield takeLatest(rateBooking.type, handleRateBooking);
}
