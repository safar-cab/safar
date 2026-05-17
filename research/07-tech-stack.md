# Technology Stack

## Stack Overview

| Layer | Technology | Why | Cost |
|-------|-----------|-----|------|
| **Frontend** | React 19 + Vite | Fast SPA/PWA, no SSR complexity | Free |
| **Backend** | NestJS 11 | Full DI, guards, WebSocket, cron, queues | Free |
| **Language** | TypeScript (both) | Type safety across entire stack | Free |
| **Styling** | Tailwind CSS 4 | Utility-first, fast development | Free |
| **UI Components** | shadcn/ui | Beautiful, accessible, zero lock-in | Free |
| **Routing** | React Router v7 | Client-side routing, nested layouts | Free |
| **State** | Redux Toolkit + Redux-Saga | Centralized state, complex async flows, WebSocket sagas | Free |
| **Forms** | React Hook Form + Zod | Performant forms + schema validation | Free |
| **Auth/Session** | httpOnly Cookies + Server Sessions (BFF) | Secure cookies, refresh token rotation (30-day auto-refresh), no JWT exposed to browser | Free |
| **Database** | MongoDB + Mongoose | Flexible schema, geospatial, free tier | Free (512MB) |
| **ORM** | @nestjs/mongoose | Official NestJS MongoDB integration | Free |
| **File Storage** | AWS S3 | Reliable, cheap, 5GB free | Free tier |
| **Real-time** | Socket.io + @nestjs/websockets | First-class NestJS WebSocket gateway | Free |
| **Job Queue** | BullMQ + @nestjs/bull | Background jobs, retries, cron | Free |
| **Maps** | Google Maps API (India) | Best India coverage, directions | Free tier |
| **Payments** | Razorpay | Best Indian UPI, 2% + GST | Pay per use |
| **Push Notifications** | Firebase Cloud Messaging | Unlimited free push | Free |
| **SMS** | MSG91 | Cheapest India SMS, DLT compliant | ~₹0.20/SMS |
| **Email** | Resend | 100 emails/day free, great API | Free tier |
| **GPS Tracker Server** | Traccar (open source) | 200+ protocols, 2000+ devices, REST API | Free |
| **Hosting** | AWS EC2 (Docker) | Full control, free tier 12 months | Free tier |
| **CI/CD** | GitHub Actions | 2000 min/month free | Free |
| **Containerization** | Docker + Docker Compose | Consistent deployments, white-label | Free |
| **Reverse Proxy** | Nginx | SSL, load balancing, static serving | Free |
| **SSL** | Let's Encrypt (Certbot) | Free SSL certificates | Free |
| **PWA** | vite-plugin-pwa | Service worker, offline, install prompt | Free |
| **Web APIs** | 12 modern browser APIs | Geolocation, Wake Lock, Web Share, Payment Request, etc. | Free (native) |
| **Error Tracking** | Built-in (NestJS → MongoDB → Admin) | Global exception filter, stack traces, admin dashboard | Free |

---

## Detailed Decisions

### Frontend: React 19 + Vite (NOT Next.js)

**Why React + Vite over Next.js:**

| Concern | Next.js | React + Vite |
|---------|---------|-------------|
| SSR complexity | Server/Client component confusion | No SSR — pure SPA |
| Backend coupling | API routes = split logic | NestJS handles ALL backend |
| Dev speed | Slower HMR | Vite HMR is instant |
| Build output | Node.js server needed | Static files — served by Nginx |
| PWA support | Serwist (workarounds for App Router) | vite-plugin-pwa (seamless) |
| Docker image | ~200MB+ (Node runtime) | ~10MB (Nginx + static files) |
| SEO | Built-in SSR | Pre-render landing page at build time |
| Learning curve | App Router + RSC patterns | Standard React patterns |

**When you need SEO**: Landing page, route search, pricing — pre-render these at build time using `vite-plugin-ssr` or `react-snap`. App pages (dashboard, booking, tracking) don't need SEO.

### Backend: NestJS 11

**Why NestJS handles everything:**
- `@nestjs/websockets` + `@nestjs/platform-socket.io` — first-class WebSocket gateway with decorators
- `@nestjs/schedule` — `@Cron()` decorators for scheduled tasks (reminders, doc expiry alerts)
- `@nestjs/bull` — BullMQ integration for notification queues with retry logic
- Custom session middleware — httpOnly cookie sessions with 30-day sliding refresh
- `@nestjs/mongoose` — MongoDB schemas with decorators
- Guards (`@UseGuards`), Pipes (`@UsePipes`), Interceptors — structured middleware
- Dependency Injection — testable, modular services
- Exception Filters — centralized error handling
- Swagger (`@nestjs/swagger`) — auto-generated API docs

### Auth: httpOnly Cookies + Server Sessions (BFF Pattern)

No JWT exposed to browser. No NextAuth. No Clerk. Pure server-side session with secure cookies.

**Why BFF (Backend-For-Frontend) Session over JWT in browser:**

| Concern | BFF Cookie Session | JWT in Browser (Bearer token) |
|---------|-------------------|-------------------------------|
| **XSS safety** | Token never in JS — httpOnly cookie | Token in localStorage/memory — stealable via XSS |
| **CSRF** | Mitigated with SameSite + CSRF token | Not applicable (no cookie) |
| **Token theft** | Cannot be read by JS at all | Any XSS reads/exfiltrates token |
| **Refresh flow** | Server auto-refreshes via cookie — transparent | Client must handle refresh logic |
| **Revocation** | Server invalidates session instantly | JWT valid until expiry (no server check) |
| **WebSocket auth** | Session cookie sent on handshake automatically | Must manually pass token |
| **Simplicity** | Browser handles cookies automatically | Manual Authorization header on every request |
| **Multi-tab** | Cookies shared across tabs automatically | Must sync token across tabs |

**How it works — BFF Session Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    React App (Browser)                        │
│                                                              │
│  No tokens in JS. No localStorage. No Authorization header. │
│  Browser sends httpOnly cookies automatically with every     │
│  request to same-origin /api/* endpoints.                    │
└──────────────────────────┬───────────────────────────────────┘
                           │ Every request includes cookies
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Backend                             │
│                                                              │
│  Session Middleware:                                          │
│  1. Read session cookie from request                         │
│  2. Look up session in MongoDB (sessions collection)         │
│  3. Attach user + role to request object                     │
│  4. If session expired but refresh window active:            │
│     → Auto-refresh: issue new session, set new cookie        │
│  5. If fully expired (>30 days):                             │
│     → 401 → redirect to login                                │
│                                                              │
│  On login success:                                           │
│  → Create session document in MongoDB                        │
│  → Set httpOnly cookie: session_id                           │
│  → Set cookie maxAge: 30 days (auto-refresh window)          │
└─────────────────────────────────────────────────────────────┘
```

**Session Flow — Login to Auto-Refresh:**

```
1. LOGIN:
   POST /api/auth/send-otp   → MSG91 sends OTP to phone
   POST /api/auth/verify-otp → Verify OTP
     → Create session in MongoDB:
       {
         _id: ObjectId,
         userId: ObjectId,
         role: 'user',
         userAgent: req.headers['user-agent'],
         ip: req.ip,
         createdAt: Date,
         expiresAt: Date (now + 30 days),
         lastActiveAt: Date,
       }
     → Set response cookie:
       Set-Cookie: sid=<sessionId>;
         HttpOnly;
         Secure;
         SameSite=Strict;
         Path=/;
         Max-Age=2592000 (30 days)
     → Return: { user: { name, phone, role } }
       (NO tokens in response body)

2. EVERY API CALL:
   Browser auto-sends cookie → NestJS middleware reads sid
   → MongoDB lookup: sessions.findById(sid)
   → If valid + not expired:
     → Update lastActiveAt (sliding window)
     → Attach user to req
     → Continue to controller
   → If expired:
     → Delete session
     → 401 response
     → React redirects to login

3. AUTO-REFRESH (30-day sliding window):
   Every successful request resets lastActiveAt.
   Session stays alive as long as user is active
   within any 30-day window.
   30 days of ZERO activity → session expires → re-login.

4. LOGOUT:
   POST /api/auth/logout
   → Delete session from MongoDB
   → Clear cookie: Set-Cookie: sid=; Max-Age=0
   → All tabs lose auth immediately (shared cookie)

5. WEBSOCKET AUTH:
   Socket.io handshake sends cookies automatically
   → NestJS gateway reads sid from handshake cookies
   → MongoDB session lookup → attach user
   → No manual token passing needed

6. FORCE LOGOUT (admin blocks user):
   → Delete all sessions for userId from MongoDB
   → Next request from any device → 401 → login page
   → Instant revocation (unlike JWT which stays valid)
```

**NestJS Implementation:**

```typescript
// auth/session.middleware.ts
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sid = req.cookies?.sid;
    if (!sid) return next(); // No session — public route or guard will reject

    const session = await this.sessionModel.findById(sid);
    if (!session || session.expiresAt < new Date()) {
      if (session) await session.deleteOne();
      res.clearCookie('sid');
      return next();
    }

    // Sliding window: refresh lastActiveAt
    session.lastActiveAt = new Date();
    await session.save();

    // Attach user to request
    const user = await this.userModel.findById(session.userId).lean();
    req['user'] = user;
    req['session'] = session;
    next();
  }
}

// auth/auth.service.ts
@Injectable()
export class AuthService {
  async createSession(userId: ObjectId, role: string, req: Request, res: Response) {
    const session = await this.sessionModel.create({
      userId,
      role,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lastActiveAt: new Date(),
    });

    res.cookie('sid', session._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });

    return session;
  }

  async destroySession(sessionId: string, res: Response) {
    await this.sessionModel.findByIdAndDelete(sessionId);
    res.clearCookie('sid');
  }

  async destroyAllUserSessions(userId: ObjectId) {
    // Force logout from all devices
    await this.sessionModel.deleteMany({ userId });
  }
}

// auth/guards/auth.guard.ts
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.user) throw new UnauthorizedException('Not authenticated');
    return true;
  }
}

// auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const req = context.switchToHttp().getRequest();
    return roles.includes(req.user?.role);
  }
}

// Usage in controllers:
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
@Get('/admin/users')
getUsers() { ... }
```

**WebSocket Session Auth:**

```typescript
// tracking/tracking.gateway.ts
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class TrackingGateway implements OnGatewayConnection {
  constructor(private authService: AuthService) {}

  async handleConnection(client: Socket) {
    // Socket.io sends cookies automatically with credentials: true
    const cookieHeader = client.handshake.headers.cookie;
    const sid = parseCookie(cookieHeader)?.sid;

    if (!sid) {
      client.disconnect();
      return;
    }

    const session = await this.authService.validateSession(sid);
    if (!session) {
      client.disconnect();
      return;
    }

    // Attach user to socket for later use
    client.data.user = session.user;
    client.data.role = session.role;
  }
}
```

**React Side — Zero Token Management:**

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // This sends cookies automatically
});

// Interceptor: redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Usage — no token, no header, just call:
const bookings = await api.get('/bookings');
const user = await api.get('/auth/me');
await api.post('/bookings', bookingData);
// Cookies handle everything.
```

**MongoDB Session Schema:**

```typescript
// schemas/session.schema.ts
@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: string;

  @Prop()
  userAgent: string;

  @Prop()
  ip: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  lastActiveAt: Date;
}

// TTL index: MongoDB auto-deletes expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

**Security Hardening:**

| Protection | How |
|-----------|-----|
| **XSS** | httpOnly — JS can't access cookie at all |
| **CSRF** | SameSite=Strict — cookie not sent on cross-origin requests |
| **Session fixation** | New session ID on login (delete old, create new) |
| **Brute force** | Rate limit on /auth/send-otp (3 per 10 min per phone) |
| **Session hijacking** | Validate userAgent + IP on each request (optional strict mode) |
| **Force logout** | Delete session from MongoDB → instant revocation across all devices |
| **Session listing** | Admin can see all active sessions for a user → revoke any |
| **Concurrent limit** | Max 5 sessions per user (reject new login or evict oldest) |

### Database: MongoDB + @nestjs/mongoose

**Why MongoDB + Mongoose:**
- Geospatial indexes (`2dsphere`) — find available cars near a location
- Flexible document model — bookings with nested stops, pricing, status history
- Aggregation pipelines — revenue reports, driver performance analytics
- `@nestjs/mongoose` — decorator-based schemas, full TypeScript types
- Free tier (Atlas M0, 512MB, Mumbai region)
- TTL indexes — auto-delete old location logs

### UI: Tailwind CSS 4 + shadcn/ui

**Why shadcn/ui:**
- Components copied into your codebase (zero dependency)
- Built on Radix UI (accessible, ARIA-compliant)
- 50+ components: Button, Dialog, Calendar, DatePicker, DataTable, Form, etc.
- Full customization — override anything for white-label branding
- Works perfectly with React + Vite (no Next.js dependency)

### State: Redux Toolkit + Redux-Saga

**Redux Toolkit (RTK)** — centralized, predictable state for entire app:
- Auth state (user, token, role, login status)
- Booking state (wizard steps, selected car, route, pricing)
- Tracking state (driver position, map center, GPS source)
- UI state (sidebar, modals, notifications drawer)
- Cars, drivers, users — cached in store slices
- Admin dashboard data

**Redux-Saga** — powerful side-effect management:
- Complex async flows: booking → payment → confirmation → notifications
- WebSocket channel handling (Socket.io events as sagas)
- Retry logic for failed API calls
- Debounce/throttle GPS updates
- Cancellable operations (cancel booking mid-payment)
- Fork parallel tasks (fetch cars + routes simultaneously)
- `takeLatest`, `takeEvery`, `race`, `all` — fine-grained control

**Why Redux + Saga over Zustand + TanStack Query:**

| Concern | Redux + Saga | Zustand + TanStack Query |
|---------|-------------|-------------------------|
| Complex async flows | Saga generators — readable, testable | Scattered across hooks |
| WebSocket events | `eventChannel` — first-class saga pattern | Manual useEffect cleanup |
| Booking wizard (multi-step) | Single slice with saga orchestrating steps | Multiple stores/hooks |
| Cancel in-flight requests | `race()` / `cancelled()` built-in | Manual AbortController |
| Debugging | Redux DevTools — time-travel, action log | Limited |
| Testing | Saga generators are pure, easy to test | Hook testing is complex |
| Team scalability | Standard patterns everyone knows | Custom patterns per developer |
| Middleware | Saga IS middleware — intercept any action | No middleware concept |
| White-label resale | Predictable architecture for other devs | Harder to hand off |

**Redux Toolkit eliminates old Redux boilerplate:**
- `createSlice` — reducer + actions in one
- `createAsyncThunk` — for simple async (use Saga for complex)
- Immer built-in — mutate state directly
- RTK Query available if needed later (but Saga handles API calls)

**Store Structure:**
```typescript
// store/
├── store.ts              // configureStore + sagaMiddleware
├── rootSaga.ts           // all sagas combined
├── slices/
│   ├── authSlice.ts      // user, token, role, isAuthenticated
│   ├── bookingSlice.ts   // current booking, wizard step, bookings list
│   ├── carsSlice.ts      // available cars, car details
│   ├── driversSlice.ts   // driver info, assignments
│   ├── trackingSlice.ts  // driver position, car position, fused position
│   ├── notificationSlice.ts // notifications list, unread count
│   ├── adminSlice.ts     // dashboard stats, user management
│   └── uiSlice.ts        // sidebar, modals, loading states
└── sagas/
    ├── authSaga.ts       // login, OTP, token refresh
    ├── bookingSaga.ts    // create → pay → confirm flow
    ├── paymentSaga.ts    // Razorpay checkout orchestration
    ├── trackingSaga.ts   // WebSocket eventChannel for GPS
    ├── notificationSaga.ts // push permission, FCM token
    └── adminSaga.ts      // CRUD operations
```

**Saga Example — WebSocket GPS Tracking:**
```typescript
function createSocketChannel(socket, bookingId) {
  return eventChannel((emit) => {
    socket.on('driver:location', (data) => emit(data));
    socket.emit('join:booking', bookingId);
    return () => socket.emit('leave:booking', bookingId);
  });
}

function* watchTracking(action) {
  const socket = yield call(connectSocket);
  const channel = yield call(createSocketChannel, socket, action.payload.bookingId);

  try {
    while (true) {
      const position = yield take(channel);
      yield put(trackingActions.updateDriverPosition(position));
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

function* trackingSaga() {
  yield takeLatest('tracking/startTracking', watchTracking);
}
```

**Saga Example — Booking Flow Orchestration:**
```typescript
function* createBookingSaga(action) {
  try {
    yield put(bookingActions.setLoading(true));

    // 1. Create booking
    const booking = yield call(api.createBooking, action.payload);
    yield put(bookingActions.setCurrentBooking(booking));

    // 2. Create Razorpay order
    const order = yield call(api.createPaymentOrder, booking._id);

    // 3. Open Razorpay checkout (returns promise)
    const paymentResult = yield call(openRazorpayCheckout, order);

    // 4. Verify payment
    yield call(api.verifyPayment, paymentResult);
    yield put(bookingActions.setStatus('confirmed'));

    // 5. Show success notification
    yield put(notificationActions.showSuccess('Booking confirmed!'));

  } catch (error) {
    yield put(bookingActions.setError(error.message));
    yield put(notificationActions.showError('Booking failed'));
  } finally {
    yield put(bookingActions.setLoading(false));
  }
}
```

### Real-time: Socket.io via @nestjs/websockets

NestJS WebSocket Gateway is first-class:
```typescript
@WebSocketGateway({ cors: true, namespace: '/tracking' })
export class TrackingGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('location:update')
  handleLocation(@ConnectedSocket() client, @MessageBody() data) {
    this.server.to(`booking:${data.bookingId}`).emit('driver:location', data);
  }
}
```

Socket.io rooms per booking — user joins room when viewing tracking page, driver broadcasts to room.

### Maps: Google Maps + @vis.gl/react-google-maps

Google Maps for India — best accuracy, traffic data, place autocomplete. $200/month free credit covers ~40,000 route calculations.

### PWA: vite-plugin-pwa

Simpler than Serwist for React apps:
- Auto-generates service worker (Workbox under hood)
- Manifest.json configured in vite.config.ts
- Install prompt handling
- Offline fallback
- Cache strategies per route

### Forms: React Hook Form + Zod

- Zod schemas shared between frontend validation and NestJS DTOs (`class-validator` on backend, or use Zod everywhere via `nestjs-zod`)
- React Hook Form: uncontrolled, minimal re-renders

---

## Modern Web APIs (Web 3.0 Features)

All browser-native, zero cost, zero dependencies. Grouped by implementation phase.

### MVP (Month 1) — Core APIs

#### 1. PWA (Progressive Web App)
- **What**: Installable app from browser, offline shell, cached assets
- **Where**: Entire app
- **Setup**: `vite-plugin-pwa` in vite.config.ts
- **Benefit**: Users "install" from browser — no app store needed

#### 2. Web Push API + Notifications API
- **What**: System-level notifications even when tab not focused
- **Where**: Booking confirm, driver arriving, ride complete, payment, cancel
- **Setup**: FCM + VAPID keys + service worker
- **Benefit**: 90%+ engagement vs email

#### 3. Geolocation API
- **What**: Real-time GPS from driver's phone
- **Where**: Driver PWA during active ride
- **Setup**: `navigator.geolocation.watchPosition()`
- **Benefit**: Live tracking without native app

```typescript
// hooks/useGeolocation.ts
export function useDriverTracking(bookingId: string) {
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit('location:update', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed,
          accuracy: pos.coords.accuracy,
          bookingId,
          source: 'phone',
        });
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [bookingId]);
}
```

#### 4. Wake Lock API
- **What**: Prevents screen from turning off
- **Where**: Driver app during active ride (GPS must keep running)
- **Setup**: `navigator.wakeLock.request('screen')`
- **Benefit**: No GPS interruption from screen timeout

```typescript
// hooks/useWakeLock.ts
export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (active && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLockRef.current = wl;
      });
    }
    return () => { wakeLockRef.current?.release(); };
  }, [active]);
}

// Usage: useWakeLock(rideStatus === 'in_progress');
```

#### 5. Web Notifications API
- **What**: System notifications from service worker (works when tab closed)
- **Where**: All notification types
- **Setup**: Part of FCM integration

```typescript
// In service worker
self.registration.showNotification('Driver Arriving!', {
  body: 'Ramesh is 2 min away in MP09AB1234',
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72.png',
  vibrate: [200, 100, 200],
  tag: 'driver-arriving',
  data: { bookingId, url: '/tracking/BK-123' },
  actions: [
    { action: 'track', title: 'Track Live' },
    { action: 'call', title: 'Call Driver' },
  ],
});
```

### MVP Polish (Week 4) — Quick Adds

#### 6. Vibration API
- **What**: Haptic feedback on phone
- **Where**: Booking confirmed, driver arrived, payment success, ride complete
- **Setup**: One line — `navigator.vibrate()`

```typescript
// utils/haptics.ts
export const haptics = {
  success: () => navigator.vibrate?.([100, 50, 200]),       // short-pause-long
  alert:   () => navigator.vibrate?.([200, 100, 200, 100, 200]), // urgent triple
  tap:     () => navigator.vibrate?.(50),                    // light tap
};

// Usage in saga:
yield put(bookingActions.setStatus('confirmed'));
haptics.success();
```

#### 7. Screen Orientation API
- **What**: Lock screen to portrait or landscape
- **Where**: Lock portrait on tracking map, allow landscape on admin dashboard
- **Setup**: `screen.orientation.lock()`

```typescript
// On tracking page mount:
screen.orientation?.lock?.('portrait').catch(() => {});

// On admin reports page:
screen.orientation?.lock?.('landscape').catch(() => {});

// Unlock on unmount:
screen.orientation?.unlock?.();
```

#### 8. Web Share API
- **What**: Native OS share dialog (WhatsApp, SMS, email, etc.)
- **Where**: Share ride tracking link with family for safety
- **Setup**: `navigator.share()`
- **Benefit**: Safety feature — family can track ride in real-time

```typescript
// components/booking/ShareRideButton.tsx
const shareRide = async (booking: Booking) => {
  if (!navigator.share) {
    // Fallback: copy link to clipboard
    await navigator.clipboard.writeText(trackingUrl);
    toast.success('Link copied!');
    return;
  }

  await navigator.share({
    title: 'Track my ride',
    text: `I'm traveling from ${booking.pickup.address} to ${booking.drop.address}. Track my live location:`,
    url: `${window.location.origin}/track/${booking.bookingId}`,
  });
};

// Share button shows native Android/iOS share sheet
// User picks WhatsApp → family member clicks link → sees live map
```

### Month 2 — High Value

#### 9. Payment Request API
- **What**: Native browser payment sheet — triggers UPI app directly
- **Where**: Alternative to Razorpay checkout for faster UPI flow
- **Benefit**: Fewer taps, native UPI intent, higher conversion

```typescript
// services/nativePayment.ts
export async function payWithNativeUPI(booking: Booking) {
  if (!window.PaymentRequest) {
    // Fall back to Razorpay checkout
    return openRazorpayCheckout(booking);
  }

  const supportedMethods = [{
    supportedMethods: 'https://tez.google.com/pay',
    data: {
      pa: 'merchant@upi',           // Your UPI VPA
      pn: 'CabBookingApp',
      tr: booking.bookingId,
      am: String(booking.pricing.totalAmount),
      cu: 'INR',
      tn: `Ride: ${booking.pickup.address} to ${booking.drop.address}`,
    },
  }];

  const details = {
    total: {
      label: `Ride to ${booking.drop.address}`,
      amount: { currency: 'INR', value: String(booking.pricing.totalAmount) },
    },
  };

  const request = new PaymentRequest(supportedMethods, details);
  const response = await request.show();

  // Verify on backend
  await api.verifyNativePayment(booking._id, response);
  await response.complete('success');
}
```

#### 10. Background Sync API
- **What**: Queue actions when offline, auto-sync when back online
- **Where**: Booking creation on spotty connection, driver status updates
- **Benefit**: No "network error" frustration in low-connectivity areas (highways)

```typescript
// service-worker.ts — register sync
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const bgSyncPlugin = new BackgroundSyncPlugin('booking-queue', {
  maxRetentionTime: 24 * 60, // Retry for 24 hours
});

registerRoute(
  '/api/bookings',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);

// When user books offline:
// 1. Request fails (no network)
// 2. BackgroundSyncPlugin queues it in IndexedDB
// 3. When online → browser fires 'sync' event
// 4. Plugin replays the POST request
// 5. Booking created successfully
```

### Future (v2) — Differentiators

#### 11. WebRTC
- **What**: Peer-to-peer audio/video calls in browser
- **Where**: In-app voice call between user and driver
- **Benefit**: No phone number exchange needed — privacy + safety

```typescript
// Future implementation sketch:
// User clicks "Call Driver" → WebRTC peer connection via NestJS signaling server
// Direct audio call in browser, no phone network needed
// Works on WiFi/data — useful when phone balance is low
// Call recording possible for dispute resolution
```

#### 12. Web Bluetooth API
- **What**: Connect to Bluetooth devices from browser
- **Where**: Read car OBD-II diagnostics via Bluetooth dongle
- **Benefit**: Real-time engine data, fuel level, speed in admin dashboard

```typescript
// Future: connect to ELM327 OBD-II Bluetooth adapter
// Read: speed, RPM, fuel level, engine temperature
// Use for: maintenance alerts, fuel expense tracking, driver behavior scoring
```

### Browser Support Matrix (India-Relevant)

| API | Chrome Android | Safari iOS | Desktop Chrome |
|-----|---------------|------------|---------------|
| PWA Install | Full | Home Screen | Full |
| Web Push | Full | iOS 16.4+ (PWA only) | Full |
| Geolocation | Full | Full | Full |
| Wake Lock | Full | Partial | Full |
| Vibration | Full | No | No |
| Screen Orientation | Full | No | Limited |
| Web Share | Full | Full | Full |
| Payment Request | Full (Google Pay) | Apple Pay only | Limited |
| Background Sync | Full | No | Full |
| WebRTC | Full | Full | Full |
| Web Bluetooth | Full | No | Full |

> **India context**: Android = ~95% market share. All APIs fully supported on Chrome Android. iOS gaps (vibration, background sync, screen lock) affect only ~5% users.

### Implementation Priority Summary

| Phase | APIs | Effort | Impact |
|-------|------|--------|--------|
| **MVP Week 1-2** | PWA, Geolocation, Web Push, Notifications | Built into architecture | Critical |
| **MVP Week 3** | Wake Lock | 10 lines | High (driver GPS reliability) |
| **MVP Week 4** | Vibration, Screen Orientation, Web Share | 5-20 lines each | Medium (UX polish) |
| **Month 2** | Payment Request, Background Sync | 50-100 lines each | High (conversion, reliability) |
| **v2** | WebRTC, Web Bluetooth | Full feature | Differentiator |

---

## Package Lists

### react-app/package.json
```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router": "^7.x",
    "typescript": "^5.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "redux-saga": "^1.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "axios": "^1.x",
    "socket.io-client": "^4.x",
    "@vis.gl/react-google-maps": "^1.x",
    "date-fns": "^4.x",
    "firebase": "^11.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "tailwindcss": "^4.x",
    "vite-plugin-pwa": "^0.21.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

### nestjs-api/package.json
```json
{
  "dependencies": {
    "@nestjs/core": "^11.x",
    "@nestjs/common": "^11.x",
    "@nestjs/platform-express": "^11.x",
    "@nestjs/mongoose": "^11.x",
    "cookie-parser": "^1.x",
    "@nestjs/websockets": "^11.x",
    "@nestjs/platform-socket.io": "^11.x",
    "@nestjs/schedule": "^5.x",
    "@nestjs/bull": "^11.x",
    "@nestjs/swagger": "^8.x",
    "mongoose": "^8.x",
    "bcrypt": "^5.x",
    "razorpay": "^2.x",
    "firebase-admin": "^13.x",
    "@aws-sdk/client-s3": "^3.x",
    "@aws-sdk/s3-request-presigner": "^3.x",
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x",
    "web-push": "^3.x",
    "socket.io": "^4.x",
    "helmet": "^8.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.x",
    "@nestjs/testing": "^11.x",
    "typescript": "^5.x",
    "jest": "^29.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```
