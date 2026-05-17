import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoutePricing } from '@/types';

interface RoutesState {
  list: RoutePricing[];
  current: RoutePricing | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoutesState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    fetchRoutes: (state) => {
      state.loading = true;
    },
    fetchRoutesSuccess: (state, action: PayloadAction<RoutePricing[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    fetchRouteDetail: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.current = null;
    },
    fetchRouteDetailSuccess: (state, action: PayloadAction<RoutePricing>) => {
      state.current = action.payload;
      state.loading = false;
    },
    routesError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchRoutes,
  fetchRoutesSuccess,
  fetchRouteDetail,
  fetchRouteDetailSuccess,
  routesError,
} = routesSlice.actions;
export default routesSlice.reducer;
