// Auth
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'driver' | 'admin';
  profilePhoto?: string;
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, '_id' | 'name' | 'phone' | 'email' | 'role'>;
}

// Driver
export interface Driver {
  _id: string;
  userId: User | string;
  licenseNumber: string;
  licensePhoto?: string;
  licenseExpiry?: string;
  aadhaarNumber?: string;
  aadhaarPhoto?: string;
  photo?: string;
  isVerified: boolean;
  isAvailable: boolean;
  avgRating: number;
  totalRides: number;
  currentLocation?: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
}

// Car
export interface Car {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  category: string;
  seats: number;
  photos: string[];
  documents?: {
    rc?: { url: string; expiry: string };
    insurance?: { url: string; expiry: string };
    puc?: { url: string; expiry: string };
    fitness?: { url: string; expiry: string };
  };
  assignedDriver?: Driver | string | null;
  isActive: boolean;
  createdAt: string;
}

// Booking
export interface Booking {
  _id: string;
  bookingId: string;
  user: User | string;
  driver?: Driver | string;
  car: Car | string;
  pickup: {
    address: string;
    coordinates?: { type: string; coordinates: number[] };
    landmark?: string;
  };
  drop: {
    address: string;
    coordinates?: { type: string; coordinates: number[] };
    landmark?: string;
  };
  stops: Array<{
    order: number;
    address: string;
    status: string;
    reachedAt?: string;
  }>;
  schedule: {
    startDate: string;
    startTime: string;
    endDate?: string;
    endTime?: string;
  };
  distance: { estimated: number; actual: number };
  pricing: {
    pricePerKm: number;
    baseFare: number;
    distanceCharge: number;
    tollEstimate: number;
    stopChargePerStop?: number;
    stopCount?: number;
    totalStopCharge?: number;
    cgst: number;
    sgst: number;
    gstAmount: number;
    totalAmount: number;
  };
  status: string;
  cancellation?: {
    cancelledBy: string;
    reason: string;
    cancelledAt: string;
    refundPolicy: string;
    refundPercentage: number;
    refundAmount: number;
  };
  actualTimes?: {
    driverStarted?: string;
    pickedUp?: string;
    completed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Payment
export interface Payment {
  _id: string;
  booking: Booking | string;
  user: User | string;
  razorpay: { orderId: string; paymentId?: string; signature?: string };
  amount: number;
  currency: string;
  method: string;
  upiId?: string;
  status: string;
  refund?: { refundId: string; amount: number; status: string; processedAt?: string };
  paidAt?: string;
  createdAt: string;
}

// Rating
export interface Rating {
  _id: string;
  booking: Booking | string;
  fromUser: User | string;
  toUser: User | string;
  raterRole: string;
  rating: number;
  review?: string;
  createdAt: string;
}

// Route Pricing
export interface RoutePricing {
  _id: string;
  name: string;
  fromCity?: { name: string; state: string; coordinates: number[] };
  toCity?: { name: string; state: string; coordinates: number[] };
  distanceKm: number;
  pricePerKm: number;
  baseFare: number;
  tollEstimate: number;
  refundPolicy: string;
  isActive: boolean;
  createdAt: string;
}

// Company Settings
export interface CompanySettings {
  _id: string;
  companyName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  defaultPricePerKm: number;
  razorpayKeyId?: string;
  upiMerchantId?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalCars: number;
  totalBookings: number;
  todayBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  [key: string]: T[] | number;
  total: number;
  page: number;
  totalPages: number;
}
