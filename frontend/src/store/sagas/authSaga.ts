import { call, put, takeLatest } from 'redux-saga/effects';
import api from '@/lib/api';
import { loginRequest, registerRequest, authSuccess, authFailure } from '../slices/authSlice';
import type { AuthResponse } from '@/types';

function* handleLogin(action: ReturnType<typeof loginRequest>) {
  try {
    const { phone, password, portal } = action.payload;
    const endpoint =
      portal === 'admin' ? '/admin/auth/login' :
      portal === 'driver' ? '/driver/auth/login' :
      '/customer/auth/login';

    const data: AuthResponse = yield call(api.post, endpoint, { phone, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    yield put(authSuccess({ user: data.user, token: data.accessToken }));
  } catch (err) {
    yield put(authFailure(err instanceof Error ? err.message : 'Login failed'));
  }
}

function* handleRegister(action: ReturnType<typeof registerRequest>) {
  try {
    const { portal, ...formData } = action.payload;
    const endpoint = portal === 'driver' ? '/driver/auth/register' : '/customer/auth/register';

    const data: AuthResponse = yield call(api.post, endpoint, formData);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    yield put(authSuccess({ user: data.user, token: data.accessToken }));
  } catch (err) {
    yield put(authFailure(err instanceof Error ? err.message : 'Registration failed'));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
}
