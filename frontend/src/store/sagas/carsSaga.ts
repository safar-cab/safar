import { call, put, takeLatest } from 'redux-saga/effects';
import api from '@/lib/api';
import { fetchAvailableCars, fetchAvailableCarsSuccess, fetchCarDetail, fetchCarDetailSuccess, carsError } from '../slices/carsSlice';
import type { Car } from '@/types';

function* handleFetchAvailableCars(action: ReturnType<typeof fetchAvailableCars>) {
  try {
    const params = action.payload?.category ? `?category=${action.payload.category}` : '';
    const data: Car[] = yield call(api.get, `/customer/cars/available${params}`);
    yield put(fetchAvailableCarsSuccess(data));
  } catch (err) {
    yield put(carsError(err instanceof Error ? err.message : 'Failed to fetch cars'));
  }
}

function* handleFetchCarDetail(action: ReturnType<typeof fetchCarDetail>) {
  try {
    const data: Car = yield call(api.get, `/customer/cars/${action.payload}`);
    yield put(fetchCarDetailSuccess(data));
  } catch (err) {
    yield put(carsError(err instanceof Error ? err.message : 'Failed to fetch car'));
  }
}

export function* carsSaga() {
  yield takeLatest(fetchAvailableCars.type, handleFetchAvailableCars);
  yield takeLatest(fetchCarDetail.type, handleFetchCarDetail);
}
