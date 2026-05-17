import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Car } from '@/types';

interface CarsState {
  available: Car[];
  current: Car | null;
  loading: boolean;
  error: string | null;
}

const initialState: CarsState = {
  available: [],
  current: null,
  loading: false,
  error: null,
};

const carsSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    fetchAvailableCars: (state, _action: PayloadAction<{ category?: string } | undefined>) => {
      state.loading = true;
    },
    fetchAvailableCarsSuccess: (state, action: PayloadAction<Car[]>) => {
      state.available = action.payload;
      state.loading = false;
    },
    fetchCarDetail: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.current = null;
    },
    fetchCarDetailSuccess: (state, action: PayloadAction<Car>) => {
      state.current = action.payload;
      state.loading = false;
    },
    carsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAvailableCars,
  fetchAvailableCarsSuccess,
  fetchCarDetail,
  fetchCarDetailSuccess,
  carsError,
} = carsSlice.actions;
export default carsSlice.reducer;
