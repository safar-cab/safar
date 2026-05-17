import { all, fork } from 'redux-saga/effects';
import { authSaga } from './authSaga';
import { bookingsSaga } from './bookingsSaga';
import { carsSaga } from './carsSaga';
import { routesSaga } from './routesSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(bookingsSaga),
    fork(carsSaga),
    fork(routesSaga),
  ]);
}
