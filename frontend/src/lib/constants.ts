export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Safar';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const ROLES = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_EN_ROUTE: 'driver_en_route',
  PICKED_UP: 'picked_up',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-warning-50', text: 'text-warning-600' },
  confirmed: { label: 'Confirmed', bg: 'bg-primary-50', text: 'text-primary-600' },
  driver_assigned: { label: 'Driver Assigned', bg: 'bg-success-50', text: 'text-success-600' },
  driver_en_route: { label: 'En Route', bg: 'bg-primary-100', text: 'text-primary-700' },
  picked_up: { label: 'Picked Up', bg: 'bg-success-100', text: 'text-success-700' },
  in_progress: { label: 'In Progress', bg: 'bg-success-50', text: 'text-success-600' },
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-600' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-50', text: 'text-error-600' },
  refunded: { label: 'Refunded', bg: 'bg-primary-50', text: 'text-primary-600' },
  created: { label: 'Created', bg: 'bg-neutral-100', text: 'text-neutral-600' },
  captured: { label: 'Paid', bg: 'bg-success-50', text: 'text-success-600' },
  failed: { label: 'Failed', bg: 'bg-error-50', text: 'text-error-600' },
};

export const ROLE_HOME: Record<string, string> = {
  customer: '/customer',
  driver: '/driver',
  admin: '/admin',
};
