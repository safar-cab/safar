import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Booking } from '@/types';

export interface PricingConfig {
  pricePerKm: number;
  baseFare: number;
  stopWaitingChargePerInterval: number;
  stopWaitingIntervalMinutes: number;
}

interface BookingsState {
  list: Booking[];
  current: Booking | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  creating: boolean;
  cancelling: boolean;
  error: string | null;
  pricingConfig: PricingConfig | null;
}

const initialState: BookingsState = {
  list: [],
  current: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  creating: false,
  cancelling: false,
  error: null,
  pricingConfig: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookings: (
      state,
      _action: PayloadAction<{ page?: number; status?: string; limit?: number }>,
    ) => {
      state.loading = true;
    },
    fetchBookingsSuccess: (
      state,
      action: PayloadAction<{
        bookings: Booking[];
        total: number;
        page: number;
        totalPages: number;
      }>,
    ) => {
      state.list = action.payload.bookings;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.loading = false;
    },
    fetchBookingDetail: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.current = null;
    },
    fetchBookingDetailSuccess: (state, action: PayloadAction<Booking>) => {
      state.current = action.payload;
      state.loading = false;
    },
    createBooking: (state, _action: PayloadAction<Record<string, unknown>>) => {
      state.creating = true;
      state.error = null;
    },
    createBookingSuccess: (state, action: PayloadAction<Booking>) => {
      state.creating = false;
      state.current = action.payload;
    },
    cancelBooking: (state, _action: PayloadAction<{ id: string; reason: string }>) => {
      state.cancelling = true;
    },
    cancelBookingSuccess: (state, action: PayloadAction<Booking>) => {
      state.cancelling = false;
      state.current = action.payload;
    },
    rateBooking: (
      state,
      _action: PayloadAction<{ bookingId: string; rating: number; review?: string }>,
    ) => {
      state.loading = true;
    },
    rateBookingSuccess: (state) => {
      state.loading = false;
    },
    bookingsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.creating = false;
      state.cancelling = false;
      state.error = action.payload;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    fetchPricingConfig() {},
    fetchPricingConfigSuccess(state, action: PayloadAction<PricingConfig>) {
      state.pricingConfig = action.payload;
    },
  },
});

export const {
  fetchBookings,
  fetchBookingsSuccess,
  fetchBookingDetail,
  fetchBookingDetailSuccess,
  createBooking,
  createBookingSuccess,
  cancelBooking,
  cancelBookingSuccess,
  rateBooking,
  rateBookingSuccess,
  bookingsError,
  clearBookingError,
  fetchPricingConfig,
  fetchPricingConfigSuccess,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;
