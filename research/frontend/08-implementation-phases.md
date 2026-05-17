# Frontend Implementation Phases

## Overview

Full frontend build plan: Admin (web) → Driver (PWA) → Customer (PWA).
Each phase builds on previous. Phase 0 is shared foundation.

---

## Phase 0: Foundation (Shared Infrastructure)

Everything shared across all 3 portals.

### 0A. Dependencies & Tooling
- Tailwind CSS v4 + PostCSS
- React Router v6 (`react-router-dom`)
- Framer Motion (animations)
- Lucide React (icons)
- Axios (HTTP client)
- React Hot Toast (notifications)
- Recharts (admin charts)
- React Hook Form (forms)
- date-fns (date formatting)
- clsx + tailwind-merge (class utilities)

### 0B. Design System Setup
- `tailwind.config.ts` — all tokens from `01-design-system.md`
  - Colors: primary (blue), secondary (amber), success, error, warning, neutral
  - Typography: Inter font, size scale
  - Spacing: 4px base
  - Border radius: sm/md/lg/xl/full
  - Shadows: sm/md/lg/xl
  - Breakpoints: 375/768/1024/1280
- `src/styles/globals.css` — CSS custom properties, base styles
- `src/lib/cn.ts` — clsx + tailwind-merge utility

### 0C. API Client
- `src/lib/api.ts` — Axios instance
  - Base URL: `http://localhost:3000/api`
  - JWT token from localStorage in Authorization header
  - Response interceptor: unwrap `data.data`
  - Error interceptor: 401 → redirect to login
  - Request/response types

### 0D. Auth System
- `src/contexts/AuthContext.tsx` — AuthProvider
  - State: user, token, isLoading
  - Methods: login, register, logout
  - Persist token in localStorage
  - Auto-validate on mount (fetch profile)
- `src/components/ProtectedRoute.tsx` — Role-based guard
  - No token → redirect `/auth/login`
  - Wrong role → redirect to role home
  - Loading → full-page skeleton
- `src/hooks/useAuth.ts` — useContext wrapper

### 0E. Router Setup
- `src/router.tsx` — createBrowserRouter
  - `/` → RootRedirect (role-based)
  - `/auth/*` → AuthLayout (login, signup)
  - `/admin/*` → ProtectedRoute(admin) → AdminLayout
  - `/driver/*` → ProtectedRoute(driver) → DriverLayout
  - `/customer/*` → ProtectedRoute(customer) → CustomerLayout
  - `/*` → NotFound

### 0F. Shared UI Components
- `Button` — primary, secondary, outline, ghost, danger variants + sizes
- `Input` — text, phone, password (with toggle), search
- `Card` — base card with shadow, hover
- `Badge` — status badges (pending, confirmed, completed, cancelled)
- `Skeleton` — shimmer loading placeholders
- `Avatar` — image + initials fallback
- `EmptyState` — icon + message + CTA
- `PageHeader` — title + back button + actions
- `Modal` — overlay + centered content
- `DataTable` — sortable, paginated table (admin)
- `StatCard` — icon + label + value + trend

### 0G. Layouts
- `AuthLayout` — centered card, logo, minimal
- `AdminLayout` — sidebar (240px) + top bar + content area
- `CustomerLayout` — top bar + content + bottom nav (4 tabs)
- `DriverLayout` — top bar + content + bottom nav (4 tabs)

### Files Created
```
src/
├── lib/
│   ├── api.ts
│   ├── cn.ts
│   └── constants.ts
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Modal.tsx
│   │   ├── DataTable.tsx
│   │   └── StatCard.tsx
│   ├── ProtectedRoute.tsx
│   └── RootRedirect.tsx
├── layouts/
│   ├── AuthLayout.tsx
│   ├── AdminLayout.tsx
│   ├── CustomerLayout.tsx
│   └── DriverLayout.tsx
├── styles/
│   └── globals.css
├── router.tsx
├── App.tsx
└── main.tsx
```

---

## Phase 1: Admin App (Web — Desktop-First)

Desktop-first web dashboard. No PWA. Sidebar navigation.

### 1A. Admin Login
- Login page with phone + password
- POST `/api/admin/auth/login`
- Redirect to `/admin` on success
- Error handling: invalid credentials, not admin

### 1B. Admin Dashboard
- GET `/api/admin/dashboard/stats` → stat cards (users, drivers, cars, bookings, revenue)
- GET `/api/admin/dashboard/revenue-chart?days=30` → line chart (Recharts)
- GET `/api/admin/dashboard/booking-stats` → pie chart by status
- Animated number counters on stat cards
- Quick action buttons

### 1C. Cars Management
- **List**: GET `/api/admin/cars` → DataTable with search, filter by category
- **Add**: POST `/api/admin/cars` → form (reg no, make, model, year, color, category, seats)
- **Edit**: PUT `/api/admin/cars/:id` → pre-filled form
- **Assign Driver**: PUT `/api/admin/cars/:id/assign-driver/:driverId` → driver select
- **Activate/Deactivate**: PUT `/api/admin/cars/:id/activate|deactivate`

### 1D. Drivers Management
- **List**: GET `/api/admin/drivers` → DataTable with verify filter
- **Add**: POST `/api/admin/drivers` → form (select user, license, docs)
- **Detail**: GET `/api/admin/drivers/:id` → full profile, docs, stats
- **Verify**: PUT `/api/admin/drivers/:id/verify` → confirm button
- **Edit**: PUT `/api/admin/drivers/:id` → update docs

### 1E. Users Management
- **List**: GET `/api/admin/users` → DataTable with role filter, search
- **Detail**: GET `/api/admin/users/:id` → profile, booking history
- **Block**: PUT `/api/admin/users/:id/block` → reason input
- **Unblock**: PUT `/api/admin/users/:id/unblock`

### 1F. Bookings Management
- **List**: GET `/api/admin/bookings` → DataTable with status filter, search by booking ID
- **Detail**: GET `/api/admin/bookings/:id` → full info, status timeline, pricing
- **Assign Driver**: PUT `/api/admin/bookings/:id/assign-driver` → driver select modal
- **Update Status**: PUT `/api/admin/bookings/:id/status` → status dropdown
- **Cancel**: PUT `/api/admin/bookings/:id/cancel` → reason input, confirm

### 1G. Payments
- **List**: GET `/api/admin/payments` → DataTable with status filter
- **Refund**: POST `/api/admin/payments/:id/refund` → amount input, confirm

### 1H. Routes Management
- **List**: GET `/api/admin/routes` → table
- **Add**: POST `/api/admin/routes` → form (name, distance, price/km, base fare, tolls)
- **Edit**: PUT `/api/admin/routes/:id` → pre-filled form
- **Deactivate**: PUT `/api/admin/routes/:id/deactivate`

### 1I. Company Settings
- GET `/api/admin/dashboard/settings` → form
- PUT `/api/admin/dashboard/settings` → save
- Fields: company name, phone, email, default price/km, refund policy

### Files Created
```
src/pages/admin/
├── AdminLogin.tsx
├── Dashboard.tsx
├── cars/
│   ├── CarsList.tsx
│   ├── AddCar.tsx
│   └── EditCar.tsx
├── drivers/
│   ├── DriversList.tsx
│   ├── AddDriver.tsx
│   └── DriverDetail.tsx
├── users/
│   ├── UsersList.tsx
│   └── UserDetail.tsx
├── bookings/
│   ├── BookingsList.tsx
│   └── BookingDetail.tsx
├── payments/
│   └── PaymentsList.tsx
├── routes/
│   ├── RoutesList.tsx
│   ├── AddRoute.tsx
│   └── EditRoute.tsx
└── settings/
    └── Settings.tsx
```

---

## Phase 2: Driver App (PWA — Mobile-First)

Mobile-first PWA. Bottom navigation. Installable.

### 2A. Driver Auth
- Login page (phone + password)
- Register page (name, phone, password)
- POST `/api/driver/auth/login` | `/api/driver/auth/register`

### 2B. Driver Dashboard
- Availability toggle (PUT `/api/driver/availability`)
- Today's stats (from driver profile: rating, total rides)
- Today's assigned rides list
- GET `/api/driver/bookings?status=driver_assigned`

### 2C. Ride List + Detail
- GET `/api/driver/bookings` → ride cards
- GET `/api/driver/bookings/:id` → full detail
- Customer info, route, pickup/drop, schedule

### 2D. Ride Status Controls
- Sequential status buttons:
  - "Start - En Route" → PUT status=driver_en_route
  - "Arrived at Pickup" → PUT status=picked_up
  - "Complete Ride" → PUT status=completed
- Confirmation before each status change

### 2E. Location Updates
- Background GPS: `navigator.geolocation.watchPosition`
- PUT `/api/driver/location` every 5 seconds when active ride
- Screen wake lock during ride

### 2F. Rate Customer
- After ride completion → rating prompt
- POST `/api/driver/ratings` (1-5 stars + review)
- Star animation on tap

### 2G. Driver Profile
- GET `/api/driver/me` → license, rating, rides
- GET `/api/driver/profile` → user info
- PUT `/api/driver/profile` → edit name, email
- GET `/api/driver/ratings/my` → rating history

### Files Created
```
src/pages/driver/
├── DriverLogin.tsx
├── DriverRegister.tsx
├── Dashboard.tsx
├── rides/
│   ├── RideList.tsx
│   └── RideDetail.tsx
├── ratings/
│   └── MyRatings.tsx
└── profile/
    └── DriverProfile.tsx
```

---

## Phase 3: Customer App (PWA — Mobile-First)

Mobile-first PWA. Full booking flow. Live tracking. Installable.

### 3A. Customer Auth
- Login (phone + password)
- Register (name, phone, email, password)
- POST `/api/customer/auth/login` | `/api/customer/auth/register`

### 3B. Home Page
- Greeting with user name
- Search bar (pickup location)
- Popular routes → GET `/api/customer/routes` (horizontal scroll)
- Recent bookings → GET `/api/customer/bookings?limit=3`

### 3C. Browse Routes + Cars
- Route list → GET `/api/customer/routes`
- Route detail → GET `/api/customer/routes/:id`
- Available cars → GET `/api/customer/cars/available?category=`
- Car detail → GET `/api/customer/cars/:id`

### 3D. Booking Flow (Multi-Step)
- Step 1: Pickup location (address + landmark)
- Step 2: Drop location (address + landmark)
- Step 3: Intermediate stops (optional, add/remove)
- Step 4: Schedule (date picker + time)
- Step 5: Select car (grid with filters)
- Step 6: Review + price breakdown
- POST `/api/customer/bookings` → booking created

### 3E. Payment (Razorpay UPI)
- POST `/api/customer/payments/create-order` → get orderId
- Open Razorpay checkout (UPI only)
- POST `/api/customer/payments/verify` → confirm payment
- Success animation (confetti + checkmark)

### 3F. My Bookings
- Tabs: Upcoming | Past | Cancelled
- GET `/api/customer/bookings?status=`
- Booking cards with status badge
- Tap → booking detail

### 3G. Booking Detail
- Status timeline (animated steps)
- Driver info card (if assigned)
- Route info (pickup → drop)
- Pricing breakdown
- Actions: Track Live | Cancel

### 3H. Live Tracking
- Full screen map
- Driver marker with pulse animation
- Route line
- Driver info bottom sheet (draggable)
- ETA display
- WebSocket connection for real-time updates

### 3I. Rating
- After ride completion
- Star rating (1-5) with pop animation
- Optional text review
- POST `/api/customer/ratings`
- Thank you screen

### 3J. Profile
- Avatar + name + phone
- Menu: Edit Profile, Payment History, Ratings, Help, Logout
- Edit profile → PUT `/api/customer/profile`
- Payment history → GET `/api/customer/payments`

### 3K. PWA Setup
- manifest.json (icons, shortcuts, screenshots)
- Service worker via vite-plugin-pwa
- Install prompt (after 2nd visit)
- Offline caching strategy
- Push notification registration

### Files Created
```
src/pages/customer/
├── CustomerLogin.tsx
├── CustomerRegister.tsx
├── Home.tsx
├── search/
│   └── SearchResults.tsx
├── cars/
│   └── CarSelection.tsx
├── booking/
│   ├── BookingForm.tsx
│   ├── StepPickup.tsx
│   ├── StepDrop.tsx
│   ├── StepStops.tsx
│   ├── StepSchedule.tsx
│   ├── StepCar.tsx
│   └── StepReview.tsx
├── payment/
│   └── Payment.tsx
├── bookings/
│   ├── MyBookings.tsx
│   └── BookingDetail.tsx
├── tracking/
│   └── LiveTracking.tsx
├── rating/
│   └── RateRide.tsx
└── profile/
    ├── Profile.tsx
    └── EditProfile.tsx
```

---

## API Endpoints Used Per Phase

### Phase 0 (Auth)
| Method | Endpoint | Used By |
|--------|----------|---------|
| POST | /customer/auth/register | Customer |
| POST | /customer/auth/login | Customer |
| POST | /driver/auth/register | Driver |
| POST | /driver/auth/login | Driver |
| POST | /admin/auth/login | Admin |

### Phase 1 (Admin)
| Method | Endpoint | Page |
|--------|----------|------|
| GET | /admin/dashboard/stats | Dashboard |
| GET | /admin/dashboard/revenue-chart | Dashboard |
| GET | /admin/dashboard/booking-stats | Dashboard |
| GET/PUT | /admin/dashboard/settings | Settings |
| GET/POST | /admin/cars | Cars |
| GET/PUT | /admin/cars/:id | Cars |
| PUT | /admin/cars/:id/activate | Cars |
| PUT | /admin/cars/:id/deactivate | Cars |
| PUT | /admin/cars/:id/assign-driver/:driverId | Cars |
| GET/POST | /admin/drivers | Drivers |
| GET/PUT | /admin/drivers/:id | Drivers |
| PUT | /admin/drivers/:id/verify | Drivers |
| GET | /admin/users | Users |
| GET | /admin/users/:id | Users |
| PUT | /admin/users/:id/block | Users |
| PUT | /admin/users/:id/unblock | Users |
| GET | /admin/bookings | Bookings |
| GET | /admin/bookings/:id | Bookings |
| PUT | /admin/bookings/:id/assign-driver | Bookings |
| PUT | /admin/bookings/:id/status | Bookings |
| PUT | /admin/bookings/:id/cancel | Bookings |
| GET | /admin/payments | Payments |
| POST | /admin/payments/:id/refund | Payments |
| GET/POST | /admin/routes | Routes |
| PUT | /admin/routes/:id | Routes |
| PUT | /admin/routes/:id/deactivate | Routes |

### Phase 2 (Driver)
| Method | Endpoint | Page |
|--------|----------|------|
| GET | /driver/me | Dashboard, Profile |
| GET/PUT | /driver/profile | Profile |
| PUT | /driver/availability | Dashboard |
| PUT | /driver/location | Ride (background) |
| GET | /driver/bookings | Rides |
| GET | /driver/bookings/:id | Ride Detail |
| PUT | /driver/bookings/:id/status | Ride Detail |
| POST | /driver/ratings | Rating |
| GET | /driver/ratings/my | Profile |

### Phase 3 (Customer)
| Method | Endpoint | Page |
|--------|----------|------|
| GET/PUT | /customer/profile | Profile |
| GET | /customer/routes | Home, Search |
| GET | /customer/routes/:id | Route Detail |
| GET | /customer/cars/available | Car Selection |
| GET | /customer/cars/:id | Car Detail |
| POST | /customer/bookings | Booking Form |
| GET | /customer/bookings | My Bookings |
| GET | /customer/bookings/:id | Booking Detail |
| PUT | /customer/bookings/:id/cancel | Booking Detail |
| POST | /customer/payments/create-order | Payment |
| POST | /customer/payments/verify | Payment |
| GET | /customer/payments | Profile |
| GET | /customer/payments/booking/:id | Booking Detail |
| POST | /customer/ratings | Rating |
| GET | /customer/ratings/booking/:id | Booking Detail |

---

## Estimated File Count Per Phase

| Phase | New Files | Total Pages |
|-------|-----------|-------------|
| Phase 0 | ~25 | 0 (infrastructure) |
| Phase 1 | ~15 | 12 admin pages |
| Phase 2 | ~10 | 7 driver pages |
| Phase 3 | ~18 | 14 customer pages |
| **Total** | **~68** | **33 pages** |

---

## Build Order Dependencies

```
Phase 0 (Foundation)
    ↓
Phase 1 (Admin) ← test all CRUD, verify APIs work
    ↓
Phase 2 (Driver) ← needs admin to create driver profile + assign rides
    ↓
Phase 3 (Customer) ← needs cars, routes, driver in system
    ↓
PWA Setup (manifest, SW, install prompt)
```
