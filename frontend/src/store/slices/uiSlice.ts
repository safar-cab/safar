import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  globalLoading: boolean;
  bookingStep: number;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | null;
}

const initialState: UiState = {
  globalLoading: false,
  bookingStep: 1,
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setBookingStep: (state, action: PayloadAction<number>) => {
      state.bookingStep = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    clearToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const { setGlobalLoading, setBookingStep, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
