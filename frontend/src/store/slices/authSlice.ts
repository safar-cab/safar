import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'driver' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, _action: PayloadAction<{ phone: string; password: string; portal: string }>) => {
      state.loading = true;
      state.error = null;
    },
    registerRequest: (state, _action: PayloadAction<{ name: string; phone: string; email?: string; password: string; portal: string }>) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginRequest, registerRequest, authSuccess, authFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
