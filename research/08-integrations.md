# 3rd Party Integrations

## Integration Summary

| Service | Provider | Free Tier | Paid Pricing | Priority |
|---------|----------|-----------|-------------|----------|
| **Auth/Session** | Built-in (httpOnly cookies + MongoDB sessions) | Free | Free | P0 |
| **Payments** | Razorpay | No monthly fee | 2% + GST per txn | P0 |
| **Push Notifications** | Firebase (FCM) | Unlimited | Free | P0 |
| **SMS** | MSG91 | No free tier | ₹0.16-0.30/SMS | P0 |
| **Maps & Directions** | Google Maps | Monthly free threshold | Pay per use | P0 |
| **File Storage** | AWS S3 | 5GB, 20K GET/month | ~$0.023/GB | P0 |
| **Email** | Resend | 100/day, 3000/month | $20/mo for 50K | P1 |
| **GPS Tracker** | Traccar | Open source | Free (self-hosted) | P1 |
| **Error Tracking** | Built-in (NestJS → MongoDB → Admin Panel) | Free | Free | P0 |
| **Analytics** | Built-in (Event tracking → MongoDB → Admin Dashboard) | Free | Free | P1 |
| **Uptime Monitoring** | Built-in (NestJS @Cron health checks → alerts) | Free | Free | P0 |

---

## 1. Razorpay (Payments)

### Why Razorpay
- Best documentation in India
- Official Node.js SDK
- UPI, cards, net banking, wallets
- QR code generation for UPI
- Refund API (full + partial)
- Webhook support for payment verification
- Fast KYC (hours, not days)
- RBI-authorized Payment Aggregator

### Pricing
- **Setup fee**: ₹0
- **Monthly fee**: ₹0
- **Transaction fee**: 2% + 18% GST = **2.36% effective**
- **UPI specifically**: 2% + GST (may be lower for small merchants)
- **Refund fee**: No fee on refund, original transaction fee NOT returned

### Requirements
- PAN card
- Bank account (business or individual)
- GST certificate (optional but recommended)
- Business address proof
- Names must match: PAN name = Bank account name = GST legal name

### Key APIs
- Create Order → Checkout → Verify Payment (webhook)
- Create Refund (full/partial)
- Fetch Payment details
- Generate QR code

### Important Note (2026)
> UPI Collect flow deprecated from Feb 28, 2026 (NPCI guidelines). Users can't enter VPA manually. Use QR code or UPI intent instead.

---

## 2. Google Maps Platform (Maps & Directions)

### Why Google Maps
- Best India road data and coverage
- Accurate distance + time estimation
- Multi-stop directions
- Place autocomplete for address input
- Geocoding (address ↔ coordinates)
- India-specific pricing (INR billing)

### APIs Needed
| API | Use Case |
|-----|----------|
| Maps JavaScript API | Display maps, markers, routes |
| Directions API | Route between points, multi-stop |
| Distance Matrix API | Calculate distance + duration |
| Places Autocomplete | Address search suggestions |
| Geocoding API | Address to coordinates |

### Pricing (India, 2026)
- Billing in INR with free monthly thresholds
- Each API has its own free tier
- Typically sufficient for 100-500 bookings/month on free tier
- Credit card required for billing account

### Alternative: Leaflet + OpenStreetMap
- Free, no API key needed
- Good for map display
- Use Google only for Directions/Distance (paid APIs)
- Reduces cost significantly

---

## 3. Firebase Cloud Messaging (Push Notifications)

### Why FCM
- **Completely free** — no per-message cost
- Works with PWA (Web Push API)
- Works on Android, iOS, Desktop browsers
- VAPID key based authentication
- Message targeting: individual, topic, or all

### Capabilities
- Notification messages (show when app closed)
- Data messages (handle in service worker)
- Topic messaging (all drivers, all users)
- Scheduled messages (via Cloud Functions or custom server)

### Limits
- Free tier: Unlimited messages
- Max payload: 4KB
- TTL: Up to 28 days

---

## 4. MSG91 (SMS)

### Why MSG91
- Cheapest India SMS provider
- DLT compliance built-in
- OTP widget (free, no extra charge)
- Template management
- Node.js SDK
- Delivery reports

### Pricing
- **Transactional SMS**: ₹0.16-0.30/SMS
- **OTP Widget**: No additional charge
- **DLT registration**: Handled through platform

### DLT Registration (Mandatory in India)
1. Register as "Entity" on telecom DLT portal (Jio/Airtel/Vodafone)
2. Submit business documents
3. Register sender ID (e.g., "CABAPP")
4. Get message templates approved
5. Templates must match exactly when sending

### SMS Templates Needed
- OTP: "Your OTP for {app_name} is {otp}. Valid for 10 minutes."
- Booking confirmed: "Booking #{id} confirmed. {car} on {date}. Driver: {driver}."
- Ride started: "Your ride has started. Track live: {link}"
- Ride completed: "Ride completed. Amount: ₹{amount}. Rate your ride: {link}"
- Cancellation: "Booking #{id} cancelled. Refund ₹{amount} in 3-5 days."
- Payment received: "Payment ₹{amount} received for booking #{id}."

---

## 5. AWS S3 (File Storage)

### Why S3
- 5GB free (12 months)
- Highly reliable (99.999999999% durability)
- Direct upload from browser (presigned URLs)
- CloudFront CDN integration
- Image resizing with Lambda (future)

### Use Cases
- Car photos (multiple per car)
- Car documents (RC, insurance, PUC, fitness)
- Driver documents (license, Aadhaar, photo)
- User profile photos
- Payment screenshots

### Free Tier (12 months)
- 5GB storage
- 20,000 GET requests/month
- 2,000 PUT requests/month
- 100GB data transfer out

---

## 6. Resend (Email)

### Why Resend
- Modern API, great DX
- React Email for templates
- 100 emails/day free
- 3,000/month free
- Simple Node.js SDK

### Use Cases
- Booking confirmation email
- Payment receipt
- Cancellation confirmation
- Password reset (if email auth)
- Admin alerts

### Alternative: AWS SES
- ~₹0.08/email (cheaper at scale)
- Requires email verification
- More setup but cheaper

---

## 7. Traccar (GPS Tracker Server)

### What It Is
- Open-source GPS tracking server
- Supports 2000+ GPS device models
- REST API for integration
- Real-time tracking + history
- Geofencing support
- Free (self-hosted)

### How to Use
1. Buy GPS tracker device (₹2,000-5,000)
2. Install in car
3. Configure device to send data to Traccar server
4. Self-host Traccar on same EC2 instance
5. Use Traccar API to get location in your app

### Popular GPS Devices in India
- WorldTrack (budget-friendly)
- Onelap (good API)
- Letstrack (consumer-friendly)
- Price range: ₹1,500-5,000

---

## 8. Error Tracking — Built-In (No Sentry)

No third-party service. Build directly into NestJS + Admin Panel.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Error Sources                       │
│                                                     │
│  NestJS Global Exception Filter (all API errors)    │
│  React Error Boundary (all frontend crashes)        │
│  Socket.io error handler (WebSocket errors)         │
│  BullMQ failed job handler (background job errors)  │
│  Unhandled rejections + uncaught exceptions         │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│              ErrorLogService (NestJS)                │
│                                                     │
│  Captures:                                           │
│  - Error message + stack trace                      │
│  - HTTP method, URL, status code                    │
│  - User ID + role (from session)                    │
│  - Request body (sanitized — no passwords/tokens)   │
│  - User agent, IP                                    │
│  - Timestamp                                         │
│  - Source: api | frontend | websocket | job          │
│  - Severity: error | warn | fatal                   │
│                                                     │
│  Actions:                                            │
│  1. Store in MongoDB (error_logs collection)        │
│  2. If severity=fatal → push notification to admin  │
│  3. TTL index: auto-delete after 90 days            │
│  4. Rate limit: max 100 logs/minute (prevent flood) │
└─────────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│           Admin Panel → Error Dashboard              │
│                                                     │
│  - Error list with filters (severity, source, date) │
│  - Error count chart (errors/hour, errors/day)      │
│  - Stack trace viewer                                │
│  - Group by error message (similar errors collapsed) │
│  - Mark as resolved / ignored                        │
│  - Top 10 most frequent errors                       │
└─────────────────────────────────────────────────────┘
```

### MongoDB Schema: error_logs

```typescript
@Schema({ timestamps: true })
export class ErrorLog {
  @Prop({ required: true })
  message: string;

  @Prop()
  stack: string;

  @Prop({ enum: ['error', 'warn', 'fatal'], default: 'error' })
  severity: string;

  @Prop({ enum: ['api', 'frontend', 'websocket', 'job'] })
  source: string;

  @Prop()
  method: string;           // GET, POST, etc.

  @Prop()
  url: string;              // /api/bookings/123

  @Prop()
  statusCode: number;       // 500, 400, etc.

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  userRole: string;

  @Prop()
  userAgent: string;

  @Prop()
  ip: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;  // extra context

  @Prop({ default: false })
  resolved: boolean;

  @Prop()
  resolvedAt: Date;
}

// TTL: auto-delete after 90 days
ErrorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });
// Query indexes
ErrorLogSchema.index({ severity: 1, createdAt: -1 });
ErrorLogSchema.index({ source: 1, createdAt: -1 });
ErrorLogSchema.index({ message: 1 }); // group by error
```

### NestJS Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private errorLogService: ErrorLogService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const status = exception?.getStatus?.() || 500;
    const message = exception?.message || 'Internal server error';

    // Log to MongoDB
    await this.errorLogService.log({
      message,
      stack: exception?.stack,
      severity: status >= 500 ? 'error' : 'warn',
      source: 'api',
      method: req.method,
      url: req.url,
      statusCode: status,
      userId: req.user?._id,
      userRole: req.user?.role,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    // Alert admin on fatal errors
    if (status >= 500) {
      await this.errorLogService.alertAdmin(message, req.url);
    }

    res.status(status).json({
      statusCode: status,
      message: status >= 500 ? 'Something went wrong' : message,
    });
  }
}
```

### React Error Boundary → Report to Backend

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    api.post('/api/errors/frontend', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }
}

// Also catch unhandled errors globally:
window.addEventListener('unhandledrejection', (event) => {
  api.post('/api/errors/frontend', {
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    source: 'unhandled_rejection',
    url: window.location.href,
  });
});
```

**Cost: ₹0** — MongoDB storage, built-in admin dashboard.

---

## 9. Uptime Monitoring — Built-In (No UptimeRobot)

Self-monitoring via NestJS cron + push alerts.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│         NestJS HealthCheckService (@Cron)            │
│                                                     │
│  Every 5 minutes:                                    │
│  1. Check MongoDB connection                         │
│  2. Check Redis connection                           │
│  3. Check Traccar server                             │
│  4. Check S3 accessibility                           │
│  5. Check Razorpay API reachable                     │
│  6. Check available disk space                       │
│  7. Check memory usage                               │
│  8. Record result in MongoDB (health_logs)           │
│                                                     │
│  If ANY check fails:                                 │
│  → Push notification to admin (FCM)                  │
│  → SMS to admin phone (MSG91)                        │
│  → Log to error_logs (severity: fatal)               │
│                                                     │
│  External ping (backup):                             │
│  → NestJS exposes GET /api/health (public endpoint)  │
│  → Set up free cron-job.org to ping every 5 min     │
│  → If no response → cron-job.org emails you          │
└─────────────────────────────────────────────────────┘
```

### Health Check Implementation

```typescript
@Injectable()
export class HealthCheckService {
  constructor(
    @InjectConnection() private mongoConnection: Connection,
    private redis: RedisService,
    private notificationService: NotificationService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async checkHealth() {
    const checks = {
      mongodb: await this.checkMongo(),
      redis: await this.checkRedis(),
      traccar: await this.checkTraccar(),
      memory: this.checkMemory(),
      disk: await this.checkDisk(),
    };

    const failed = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);

    if (failed.length > 0) {
      await this.notificationService.alertAdmin(
        'System Health Alert',
        `Services DOWN: ${failed.join(', ')}`,
      );
    }

    // Store health log
    await this.healthLogModel.create({
      checks,
      allHealthy: failed.length === 0,
      timestamp: new Date(),
    });
  }

  private async checkMongo(): Promise<boolean> {
    try {
      return this.mongoConnection.readyState === 1;
    } catch { return false; }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch { return false; }
  }

  private async checkTraccar(): Promise<boolean> {
    try {
      const res = await fetch('http://traccar:8082/api/server');
      return res.ok;
    } catch { return false; }
  }

  private checkMemory(): boolean {
    const used = process.memoryUsage();
    const heapUsedMB = used.heapUsed / 1024 / 1024;
    return heapUsedMB < 450; // Alert if > 450MB on 512MB container
  }
}
```

### Health API Endpoint

```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const mongoOk = mongoose.connection.readyState === 1;
    return {
      status: mongoOk ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date(),
      services: { mongodb: mongoOk },
    };
  }
}
```

### Admin Dashboard — Uptime View
- Uptime percentage (last 24h, 7d, 30d)
- Health check history timeline (green/red dots)
- Current service status (all green = healthy)
- Response time chart (API latency over time)
- Alert history (when was admin notified)

### External Backup (Free)
Use **cron-job.org** (free, no signup needed) to ping `https://yourdomain.in/api/health` every 5 minutes. If response fails → sends email notification. Backup to your own built-in monitoring.

**Cost: ₹0** — NestJS cron, MongoDB storage, FCM push (free).

---

## 10. Analytics & Event Tracking — Built-In (No PostHog)

No third-party analytics. Track user behavior directly in MongoDB.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Event Sources                       │
│                                                     │
│  React:                                              │
│  - Page views (React Router listener)               │
│  - Button clicks (booking, cancel, pay)             │
│  - Feature usage (share ride, install PWA)           │
│  - Funnel steps (search → select → pay → confirm)  │
│                                                     │
│  NestJS:                                             │
│  - API calls (auto-logged via interceptor)           │
│  - Booking created / completed / cancelled           │
│  - Payment success / failure                         │
│  - Driver ride completed                             │
│  - User registered / logged in                       │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│            AnalyticsService (NestJS)                 │
│                                                     │
│  POST /api/analytics/events (from React)             │
│  + server-side events (interceptor)                  │
│                                                     │
│  Stores in MongoDB: analytics_events collection      │
│  Fields:                                             │
│  - event: 'booking_created', 'page_view', etc.      │
│  - userId (optional — guest events allowed)          │
│  - properties: { page, bookingId, carType, ... }    │
│  - sessionId (from cookie)                           │
│  - userAgent, ip, referrer                           │
│  - timestamp                                         │
│                                                     │
│  TTL: auto-delete after 180 days                     │
│  Aggregation pipeline → dashboard charts             │
└─────────────────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│          Admin Panel → Analytics Dashboard           │
│                                                     │
│  Overview:                                           │
│  - Daily active users                                │
│  - Bookings today / this week / this month          │
│  - Revenue today / this week / this month           │
│  - Conversion funnel (visit → search → book → pay)  │
│                                                     │
│  Charts:                                             │
│  - Bookings per day (bar chart)                      │
│  - Revenue per day (line chart)                      │
│  - Popular routes (pie chart)                        │
│  - Peak booking hours (heatmap)                      │
│  - User registrations over time                      │
│  - Car utilization % per vehicle                     │
│  - Cancellation rate trend                           │
│  - Average rating trend                              │
│                                                     │
│  Tables:                                             │
│  - Top routes by bookings                            │
│  - Top users by spend                                │
│  - Driver performance (rides, rating, on-time %)    │
└─────────────────────────────────────────────────────┘
```

### MongoDB Schema: analytics_events

```typescript
@Schema({ timestamps: true })
export class AnalyticsEvent {
  @Prop({ required: true, index: true })
  event: string;              // 'page_view', 'booking_created', etc.

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  sessionId: string;

  @Prop({ type: Object })
  properties: Record<string, any>;

  @Prop()
  userAgent: string;

  @Prop()
  ip: string;

  @Prop()
  referrer: string;
}

// TTL: 180 days
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });
// Query indexes
AnalyticsEventSchema.index({ event: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
```

### React Event Tracker

```typescript
// services/analytics.ts
class Analytics {
  track(event: string, properties?: Record<string, any>) {
    // Fire and forget — don't block UI
    api.post('/api/analytics/events', {
      event,
      properties,
      referrer: document.referrer,
      url: window.location.pathname,
    }).catch(() => {}); // Silently fail — analytics should never break the app
  }

  pageView(page: string) {
    this.track('page_view', { page });
  }
}

export const analytics = new Analytics();

// Usage:
analytics.track('booking_created', { route: 'Indore→Bhopal', carType: 'sedan' });
analytics.track('payment_success', { amount: 2825, method: 'upi' });
analytics.track('ride_shared', { medium: 'whatsapp' });
analytics.pageView('/book');
```

### React Router Auto Page View

```typescript
// In App.tsx or router.tsx
const location = useLocation();
useEffect(() => {
  analytics.pageView(location.pathname);
}, [location.pathname]);
```

### NestJS API Interceptor (Auto-log API calls)

```typescript
@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  constructor(private analyticsService: AnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.analyticsService.trackServerEvent({
          event: 'api_call',
          properties: {
            method: req.method,
            url: req.url,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration,
          },
          userId: req.user?._id,
        });
      }),
    );
  }
}
```

### Admin Dashboard Aggregation Queries

```typescript
// Bookings per day (last 30 days)
await this.bookingModel.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  { $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    count: { $sum: 1 },
    revenue: { $sum: '$pricing.totalAmount' },
  }},
  { $sort: { _id: 1 } },
]);

// Conversion funnel
const pageViews = await this.analyticsModel.countDocuments({
  event: 'page_view', properties: { page: '/book' }, createdAt: { $gte: period }
});
const searches = await this.analyticsModel.countDocuments({
  event: 'route_searched', createdAt: { $gte: period }
});
const bookings = await this.bookingModel.countDocuments({ createdAt: { $gte: period } });
const payments = await this.paymentModel.countDocuments({
  status: 'captured', createdAt: { $gte: period }
});
// funnel: [pageViews, searches, bookings, payments]
```

**Cost: ₹0** — MongoDB storage, NestJS interceptor, admin dashboard.

---

## Summary: Zero Third-Party for Error/Monitoring/Analytics

| Feature | Old (3rd Party) | New (Built-In) | Savings |
|---------|----------------|----------------|---------|
| **Error Tracking** | Sentry ($26/mo) | NestJS ExceptionFilter → MongoDB → Admin Panel | $26/mo |
| **Uptime Monitoring** | UptimeRobot (free but external) | NestJS @Cron health checks → FCM/SMS alerts | Full control |
| **Analytics** | PostHog (self-hosted) | NestJS AnalyticsService → MongoDB → Admin Dashboard | No extra infra |

All three stored in MongoDB with TTL indexes (auto-cleanup). All three viewable in Admin Panel. All three generate alerts via existing FCM + MSG91 (already integrated for booking notifications).

### New MongoDB Collections

| Collection | TTL | Purpose |
|-----------|-----|---------|
| `error_logs` | 90 days | API errors, frontend crashes, job failures |
| `health_logs` | 30 days | Service health check results |
| `analytics_events` | 180 days | Page views, user actions, API metrics |

### Admin Panel — New Pages

| Page | Content |
|------|---------|
| `/admin/errors` | Error list, filters, stack traces, resolve button |
| `/admin/health` | Service status, uptime %, health history |
| `/admin/analytics` | Charts: bookings, revenue, users, funnels, routes |
