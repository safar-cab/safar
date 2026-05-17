import { call, put, takeLatest } from 'redux-saga/effects';
import api from '@/lib/api';
import {
  fetchRoutes,
  fetchRoutesSuccess,
  fetchRouteDetail,
  fetchRouteDetailSuccess,
  routesError,
} from '../slices/routesSlice';
import type { RoutePricing } from '@/types';

function* handleFetchRoutes() {
  try {
    const data: RoutePricing[] = yield call(api.get, '/customer/routes');
    yield put(fetchRoutesSuccess(data));
  } catch (err) {
    yield put(routesError(err instanceof Error ? err.message : 'Failed to fetch routes'));
  }
}

function* handleFetchRouteDetail(action: ReturnType<typeof fetchRouteDetail>) {
  try {
    const data: RoutePricing = yield call(api.get, `/customer/routes/${action.payload}`);
    yield put(fetchRouteDetailSuccess(data));
  } catch (err) {
    yield put(routesError(err instanceof Error ? err.message : 'Failed to fetch route'));
  }
}

export function* routesSaga() {
  yield takeLatest(fetchRoutes.type, handleFetchRoutes);
  yield takeLatest(fetchRouteDetail.type, handleFetchRouteDetail);
}
