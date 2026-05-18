import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoutePricing } from '@/types';

interface StateOption {
  _id: string;
  name: string;
  code: string;
}

interface CityOption {
  _id: string;
  name: string;
}

interface GoogleRouteInfo {
  distanceKm: number;
  durationMinutes: number;
  tollEstimateINR: number;
  routes: Array<{
    distanceKm: number;
    durationMinutes: number;
    tollEstimateINR: number;
  }>;
}

interface RoutesState {
  list: RoutePricing[];
  current: RoutePricing | null;
  loading: boolean;
  error: string | null;
  states: StateOption[];
  cities: Record<string, CityOption[]>;
  googleRouteInfo: GoogleRouteInfo | null;
  googleRouteLoading: boolean;
}

const initialState: RoutesState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  states: [],
  cities: {},
  googleRouteInfo: null,
  googleRouteLoading: false,
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

    // States & Cities
    fetchStates() {},
    fetchStatesSuccess(state, action: PayloadAction<StateOption[]>) {
      state.states = action.payload;
    },
    fetchCities(_state, _action: PayloadAction<string>) {},
    fetchCitiesSuccess(state, action: PayloadAction<{ stateId: string; cities: CityOption[] }>) {
      state.cities[action.payload.stateId] = action.payload.cities;
    },

    // Google Route Info
    fetchRouteInfo(_state, _action: PayloadAction<{ origin: string; destination: string }>) {},
    setGoogleRouteLoading(state) {
      state.googleRouteLoading = true;
    },
    fetchRouteInfoSuccess(state, action: PayloadAction<GoogleRouteInfo>) {
      state.googleRouteInfo = action.payload;
      state.googleRouteLoading = false;
    },
    clearRouteInfo(state) {
      state.googleRouteInfo = null;
      state.googleRouteLoading = false;
    },
  },
});

export const {
  fetchRoutes,
  fetchRoutesSuccess,
  fetchRouteDetail,
  fetchRouteDetailSuccess,
  routesError,
  fetchStates,
  fetchStatesSuccess,
  fetchCities,
  fetchCitiesSuccess,
  fetchRouteInfo,
  setGoogleRouteLoading,
  fetchRouteInfoSuccess,
  clearRouteInfo,
} = routesSlice.actions;
export default routesSlice.reducer;
