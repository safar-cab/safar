import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import api from '@/lib/api';
import {
  fetchRoutes,
  fetchRoutesSuccess,
  fetchRouteDetail,
  fetchRouteDetailSuccess,
  fetchStates,
  fetchStatesSuccess,
  fetchCities,
  fetchCitiesSuccess,
  fetchRouteInfo,
  setGoogleRouteLoading,
  fetchRouteInfoSuccess,
  clearRouteInfo,
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

function* handleFetchStates() {
  try {
    const data: unknown = yield call(api.get, '/locations/states');
    yield put(fetchStatesSuccess(data as any[]));
  } catch {
    // silent
  }
}

function* handleFetchCities(action: ReturnType<typeof fetchCities>) {
  try {
    const stateId = action.payload;
    const data: unknown = yield call(api.get, `/locations/states/${stateId}/cities`);
    yield put(fetchCitiesSuccess({ stateId, cities: data as any[] }));
  } catch {
    // silent
  }
}

function* handleFetchRouteInfo(action: ReturnType<typeof fetchRouteInfo>) {
  try {
    yield put(setGoogleRouteLoading());
    const { origin, destination } = action.payload;
    const data: unknown = yield call(
      api.get,
      `/tracking/route-info?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
    );
    yield put(fetchRouteInfoSuccess(data as any));
  } catch {
    yield put(clearRouteInfo());
  }
}

export function* routesSaga() {
  yield takeLatest(fetchRoutes.type, handleFetchRoutes);
  yield takeLatest(fetchRouteDetail.type, handleFetchRouteDetail);
  yield takeLatest(fetchStates.type, handleFetchStates);
  yield takeEvery(fetchCities.type, handleFetchCities);
  yield takeLatest(fetchRouteInfo.type, handleFetchRouteInfo);
}
