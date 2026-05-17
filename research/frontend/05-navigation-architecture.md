# Books Car Rental -- Navigation & Information Architecture

Version 1.0 | React Router v6 | Role-Based Routing

---

## 1. App Navigation Tree

```
Books Car Rental
|
+-- / (Landing / Role redirect)
|
+-- /auth
|   +-- /login              Phone + OTP login
|   +-- /signup             Registration form
|   +-- /forgot-password    Password reset
|   +-- /verify-otp         OTP verification screen
|
+-- /customer               (Protected: role=customer)
|   +-- /                   Home / Dashboard
|   +-- /search             Route search results
|   +-- /cars               Car selection grid
|   +-- /book               Multi-step booking form
|   |   +-- ?step=pickup
|   |   +-- ?step=dropoff
|   |   +-- ?step=details
|   |   +-- ?step=review
|   |   +-- ?step=payment
|   +-- /bookings           My Bookings list
|   |   +-- /:id            Booking detail
|   +-- /track/:bookingId   Live tracking
|   +-- /payment/:bookingId Payment page
|   +-- /rate/:bookingId    Rating & review
|   +-- /profile            Profile page
|   |   +-- /edit           Edit profile
|   |   +-- /addresses      Saved addresses
|   |   +-- /payments       Payment methods
|   +-- /notifications      Notification list
|
+-- /driver                 (Protected: role=driver)
|   +-- /                   Driver dashboard
|   +-- /rides              Ride list
|   |   +-- /:id            Ride detail
|   +-- /navigate/:rideId   Navigation view
|   +-- /earnings           Earnings history
|   +-- /profile            Driver profile
|   |   +-- /edit           Edit profile
|   |   +-- /documents      Document upload
|   |   +-- /vehicle        Vehicle details
|   +-- /notifications      Notification list
|
+-- /admin                  (Protected: role=admin)
|   +-- /                   Admin dashboard
|   +-- /bookings           Bookings management
|   |   +-- /:id            Booking detail
|   +-- /cars               Cars management
|   |   +-- /new            Add car form
|   |   +-- /:id/edit       Edit car form
|   +-- /drivers            Drivers management
|   |   +-- /:id            Driver detail
|   |   +-- /new            Add driver form
|   |   +-- /:id/edit       Edit driver form
|   +-- /users              Users management
|   |   +-- /:id            User detail
|   +-- /payments           Payments list
|   |   +-- /:id            Payment detail
|   +-- /routes             Routes management
|   |   +-- /new            Add route form
|   |   +-- /:id/edit       Edit route form
|   +-- /settings           App settings
|   +-- /reports            Reports & analytics
|
+-- /404                    Not found page
```

---

## 2. Tab Bar Structure

### Customer Tab Bar (Bottom Navigation)

```
+--------+--------+--------+--------+
|  Home  |Bookings| Track  |Profile |
+--------+--------+--------+--------+
```

| Tab      | Icon            | Route              | Badge                    |
|----------|-----------------|--------------------|-----------------------------|
| Home     | `Home`          | `/customer`        | --                          |
| Bookings | `CalendarCheck` | `/customer/bookings`| Count of upcoming bookings |
| Track    | `MapPin`        | `/customer/track`  | Active ride indicator (dot) |
| Profile  | `User`          | `/customer/profile`| --                          |

**Tab visibility rules:**
- Show on: Home, Bookings list, Profile
- Hide on: Booking form, Payment, Live tracking (full screen), Rating
- Transition: Slide down to hide, slide up to show (150ms)

### Driver Tab Bar (Bottom Navigation)

```
+----------+--------+--------+--------+
| Dashboard| Rides  |  Nav   |Profile |
+----------+--------+--------+--------+
```

| Tab       | Icon          | Route             | Badge                    |
|-----------|---------------|-------------------|--------------------------|
| Dashboard | `LayoutDashboard` | `/driver`    | --                       |
| Rides     | `Car`         | `/driver/rides`   | Pending ride count       |
| Nav       | `Navigation`  | `/driver/navigate`| Active if navigating     |
| Profile   | `User`        | `/driver/profile` | Pending docs indicator   |

### Admin Navigation (Sidebar -- Desktop)

```
+-----------------------------+
|  [logo] Books Admin         |
+-----------------------------+
|  Dashboard        [chart]   |
|  Bookings         [calendar]|
|  Cars             [car]     |
|  Drivers          [users]   |
|  Users            [user]    |
|  Payments         [rupee]   |
|  Routes           [map]     |
|  ________________________   |
|  Settings         [gear]    |
|  Logout           [logout]  |
+-----------------------------+
```

| Item       | Icon               | Route              | Badge              |
|------------|--------------------|--------------------|---------------------|
| Dashboard  | `LayoutDashboard`  | `/admin`           | --                  |
| Bookings   | `CalendarCheck`    | `/admin/bookings`  | Pending count       |
| Cars       | `Car`              | `/admin/cars`      | --                  |
| Drivers    | `UserCheck`        | `/admin/drivers`   | Unverified count    |
| Users      | `Users`            | `/admin/users`     | --                  |
| Payments   | `IndianRupee`      | `/admin/payments`  | Pending refund count|
| Routes     | `Map`              | `/admin/routes`    | --                  |
| Settings   | `Settings`         | `/admin/settings`  | --                  |

**Admin sidebar behavior:**
- Desktop (1024px+): Always visible, 240px wide
- Tablet (768-1023px): Collapsible, icon-only (64px) by default
- Mobile (<768px): Show "Desktop Recommended" warning, allow continue with hamburger menu

**Admin is web-only (no PWA):**
- No service worker, no manifest, no install prompt
- Desktop-first responsive design
- No offline support — requires active network
- Accessed via browser on laptop/desktop

---

## 3. Route Hierarchy

### Route Configuration

```typescript
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <RootRedirect />,  // redirects based on auth + role
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'verify-otp', element: <VerifyOtp /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },

  // Customer routes
  {
    path: '/customer',
    element: <ProtectedRoute role="customer"><CustomerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <CustomerHome /> },
      { path: 'search', element: <SearchResults /> },
      { path: 'cars', element: <CarSelection /> },
      { path: 'book', element: <BookingForm /> },
      { path: 'bookings', element: <MyBookings /> },
      { path: 'bookings/:id', element: <BookingDetail /> },
      { path: 'track/:bookingId', element: <LiveTracking /> },
      { path: 'payment/:bookingId', element: <Payment /> },
      { path: 'rate/:bookingId', element: <RateRide /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/edit', element: <EditProfile /> },
      { path: 'profile/addresses', element: <SavedAddresses /> },
      { path: 'notifications', element: <Notifications /> },
    ],
  },

  // Driver routes
  {
    path: '/driver',
    element: <ProtectedRoute role="driver"><DriverLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DriverDashboard /> },
      { path: 'rides', element: <RideList /> },
      { path: 'rides/:id', element: <RideDetail /> },
      { path: 'navigate/:rideId', element: <NavigationView /> },
      { path: 'earnings', element: <Earnings /> },
      { path: 'profile', element: <DriverProfile /> },
      { path: 'profile/edit', element: <EditDriverProfile /> },
      { path: 'profile/documents', element: <Documents /> },
      { path: 'notifications', element: <Notifications /> },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'bookings/:id', element: <AdminBookingDetail /> },
      { path: 'cars', element: <AdminCars /> },
      { path: 'cars/new', element: <AddCar /> },
      { path: 'cars/:id/edit', element: <EditCar /> },
      { path: 'drivers', element: <AdminDrivers /> },
      { path: 'drivers/:id', element: <DriverDetail /> },
      { path: 'drivers/new', element: <AddDriver /> },
      { path: 'drivers/:id/edit', element: <EditDriver /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'users/:id', element: <UserDetail /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'payments/:id', element: <PaymentDetail /> },
      { path: 'routes', element: <AdminRoutes /> },
      { path: 'routes/new', element: <AddRoute /> },
      { path: 'routes/:id/edit', element: <EditRoute /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'reports', element: <Reports /> },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
]);
```

---

## 4. Deep Linking Strategy

### Supported Deep Links

| Deep Link                              | Opens                          | Behavior                          |
|----------------------------------------|--------------------------------|-----------------------------------|
| `books://booking/{id}`                 | Booking detail                 | Auth check -> redirect if needed  |
| `books://track/{bookingId}`            | Live tracking                  | Only if ride is active            |
| `books://rate/{bookingId}`             | Rating page                    | Only if ride completed, unrated   |
| `books://payment/{bookingId}`          | Payment page                   | Only if payment pending           |
| `books://profile`                      | Profile page                   | Auth required                     |
| `books://search?from=X&to=Y&date=Z`   | Search results                 | Pre-fill search                   |

### Web URL Mapping

| Web URL                                | Maps to Deep Link              |
|----------------------------------------|--------------------------------|
| `https://books.app/customer/bookings/123` | `books://booking/123`       |
| `https://books.app/customer/track/123`    | `books://track/123`         |

### Deep Link Handling

```typescript
// Handle deep link on app open
const handleDeepLink = (url: string) => {
  const parsed = new URL(url);
  const path = parsed.pathname;

  // Check authentication
  if (!isAuthenticated()) {
    // Store intended destination
    sessionStorage.setItem('redirectAfterLogin', path);
    navigate('/auth/login');
    return;
  }

  // Route to destination
  navigate(path);
};
```

### Share Links

Booking confirmations and receipts generate shareable links:
```
https://books.app/s/BCR-1234  ->  resolves to /customer/bookings/BCR-1234
```

---

## 5. Back Button Behavior

### Back Button Rules

| Current Page              | Back Goes To                    | Method               |
|---------------------------|---------------------------------|----------------------|
| Home                      | Exit app (or do nothing)        | System back          |
| Search results            | Home                            | Router back          |
| Car selection             | Search results                  | Router back          |
| Booking step 1            | Car selection or Home           | Router back          |
| Booking step 2+           | Previous step                   | Step state back      |
| Booking detail            | My Bookings                     | Router back          |
| Live tracking             | Booking detail                  | Router back          |
| Payment                   | Booking review (with confirm)   | Confirm dialog       |
| Rating                    | Booking detail                  | Router back          |
| Profile sub-pages         | Profile                         | Router back          |
| Admin sub-pages           | Parent list page                | Router back          |

### Special Back Button Cases

**During booking flow:**
- Show confirmation dialog: "Are you sure? Your progress will be saved."
- Save form state to session storage for recovery

**During payment:**
- Show warning: "Payment is in progress. Are you sure you want to go back?"
- Cancel payment flow if confirmed

**Bottom sheet open:**
- First back press closes bottom sheet
- Second back press navigates back

### Implementation

```typescript
// Custom back handler for booking flow
const useBookingBackHandler = (currentStep: number, setStep: Function) => {
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      if (currentStep > 1) {
        // Go to previous step instead of leaving
        setStep(currentStep - 1);
        // Push state to maintain history
        window.history.pushState(null, '', `?step=${currentStep - 1}`);
      } else {
        // Actually navigate back
        navigate(-1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep]);
};
```

---

## 6. Protected Routes & Redirect Logic

### Authentication Flow

```
User visits any protected route
        |
        v
   Authenticated?
    /        \
  Yes         No
   |           |
   v           v
 Has role?   Store intended route
  /    \     in sessionStorage
Yes    No       |
 |      |       v
 v      v    /auth/login
Page   Redirect     |
       to role      v
       home      Login success
                    |
                    v
                 Redirect to
                 stored route
                 or role home
```

### Role-Based Redirects

```typescript
const ProtectedRoute = ({
  role,
  children,
}: {
  role: 'customer' | 'driver' | 'admin';
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    // Store current path for redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== role) {
    // Redirect to correct role's home
    const roleHomeMap = {
      customer: '/customer',
      driver: '/driver',
      admin: '/admin',
    };
    return <Navigate to={roleHomeMap[user.role]} replace />;
  }

  return <>{children}</>;
};
```

### Root Redirect Logic

```typescript
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  if (!user) return <Navigate to="/auth/login" replace />;

  const redirectMap = {
    customer: '/customer',
    driver: '/driver',
    admin: '/admin',
  };

  return <Navigate to={redirectMap[user.role]} replace />;
};
```

### After Login Redirect

```typescript
const handleLoginSuccess = (user: User) => {
  const intendedRoute = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');

  if (intendedRoute && intendedRoute.startsWith(`/${user.role}`)) {
    navigate(intendedRoute);
  } else {
    const defaultRoutes = {
      customer: '/customer',
      driver: '/driver',
      admin: '/admin',
    };
    navigate(defaultRoutes[user.role]);
  }
};
```

---

## 7. Breadcrumb Pattern (Admin)

### Desktop Breadcrumbs

```
Dashboard > Bookings > #BCR-1234
```

| Property          | Value                           |
|-------------------|---------------------------------|
| Font size         | 14px                            |
| Color (links)     | `#2563EB`                       |
| Color (current)   | `#475569`                       |
| Separator         | `ChevronRight` icon, 14px       |
| Separator color   | `#94A3B8`                       |
| Position          | Below top bar, above page title |
| Padding           | 8px 0                           |

### Breadcrumb Map

| Page                    | Breadcrumb                              |
|-------------------------|-----------------------------------------|
| Admin Dashboard         | Dashboard                               |
| Bookings list           | Dashboard > Bookings                    |
| Booking detail          | Dashboard > Bookings > #BCR-1234        |
| Cars list               | Dashboard > Cars                        |
| Add car                 | Dashboard > Cars > Add New              |
| Edit car                | Dashboard > Cars > Swift Dzire > Edit   |
| Drivers list            | Dashboard > Drivers                     |
| Driver detail           | Dashboard > Drivers > Rajesh Kumar      |
| Settings                | Dashboard > Settings                    |

### Implementation

```typescript
// Auto-generate breadcrumbs from route
const useBreadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = formatSegmentLabel(segment); // 'bookings' -> 'Bookings'
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  return breadcrumbs;
};
```

### Mobile Behavior

- No breadcrumbs on mobile (< 768px)
- Use back button + page title instead
- Page title indicates current context

---

## 8. Navigation Transitions

| Navigation Type          | Transition                            | Duration |
|--------------------------|---------------------------------------|----------|
| Tab switch               | Fade                                  | 200ms    |
| Push forward             | New page slides in from right         | 350ms    |
| Pop back                 | Current page slides out to right      | 300ms    |
| Modal open               | Fade in + scale from 0.95             | 250ms    |
| Modal close              | Fade out + scale to 0.95              | 200ms    |
| Bottom sheet open        | Slide up from bottom                  | 350ms    |
| Bottom sheet close       | Slide down                            | 300ms    |
| Admin sidebar toggle     | Slide + width animation               | 250ms    |

---

## 9. URL State Management

### Query Parameters for State

| Page              | Query Params                               |
|-------------------|--------------------------------------------|
| Search results    | `?from=mumbai&to=pune&date=2026-01-15`     |
| Car selection     | `?type=sedan&sort=price`                   |
| Booking form      | `?step=pickup&routeId=123`                 |
| My Bookings       | `?tab=upcoming`                            |
| Admin bookings    | `?status=pending&page=2&search=BCR`        |
| Admin cars        | `?type=suv&status=active`                  |

### Benefits
- Shareable URLs
- Browser back/forward preserves filters
- Bookmark-able search results
- Analytics tracking per view state

```typescript
// Hook for syncing state with URL params
const useQueryState = (key: string, defaultValue: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) || defaultValue;

  const setValue = (newValue: string) => {
    setSearchParams(prev => {
      prev.set(key, newValue);
      return prev;
    });
  };

  return [value, setValue] as const;
};
```
