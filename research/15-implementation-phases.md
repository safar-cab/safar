# Implementation Phases (4-Week MVP)

## Week 1: Foundation

### Day 1-2: Project Setup
- [ ] Initialize React + Vite project with TypeScript (react-app/)
- [ ] Initialize NestJS project with TypeScript (nestjs-api/)
- [ ] Setup Tailwind CSS 4 + shadcn/ui in React app
- [ ] Configure ESLint + Prettier (both projects)
- [ ] Setup MongoDB connection (@nestjs/mongoose)
- [ ] Create all Mongoose schemas (User, Driver, Car, Booking, Payment, Rating, Session, Notification)
- [ ] Setup cookie-based session auth (SessionMiddleware, SessionAuthGuard, RolesGuard)
- [ ] Docker + docker-compose.yml (react-app + nestjs-api + redis + nginx)
- [ ] GitHub repo + branch strategy (main + dev)
- [ ] Environment variables setup (.env files)
- [ ] Setup Redux Toolkit + Redux-Saga store structure

### Day 3-4: Auth + User Management
- [ ] Phone OTP login (MSG91 integration in NestJS)
- [ ] Email + password registration/login
- [ ] Session middleware (cookie read → MongoDB lookup → attach user)
- [ ] 30-day sliding window auto-refresh
- [ ] Force logout (delete all user sessions)
- [ ] User profile page (view + edit) in React
- [ ] Admin: User list with search, block/unblock
- [ ] Protected route guard in React (redirect to login if 401)
- [ ] Landing page (hero, features, search preview)

### Day 5-7: Admin Panel - Cars & Drivers
- [ ] AWS S3 setup + presigned URL upload API (NestJS UploadController)
- [ ] Admin: Add car form (details + photos + documents)
- [ ] Admin: Car list, edit, deactivate
- [ ] Admin: Add driver form (details + documents)
- [ ] Admin: Driver list, verify, deactivate
- [ ] Admin: Assign driver to car
- [ ] Admin: Company settings (name, logo, contact, pricing)
- [ ] Admin: Route/pricing configuration

## Week 2: Booking System

### Day 8-9: Search & Availability
- [ ] Google Maps integration (API key, SDK — @vis.gl/react-google-maps)
- [ ] Place autocomplete for pickup/drop
- [ ] Multi-stop route builder (add/remove/reorder stops)
- [ ] Distance + duration calculation (Directions API via NestJS)
- [ ] Calendar availability query (which cars free on date)
- [ ] Available cars display with details and ratings

### Day 10-11: Booking Flow
- [ ] Price calculator in NestJS (per-km × distance + base + tolls)
- [ ] Booking creation API (NestJS BookingController)
- [ ] Booking saga in Redux (create → pay → confirm orchestration)
- [ ] Booking confirmation page
- [ ] User: My bookings list with status filters
- [ ] User: Booking detail page
- [ ] Admin: All bookings view with filters

### Day 12-14: Payments
- [ ] Razorpay merchant account setup
- [ ] Create Razorpay order API (NestJS PaymentController)
- [ ] Razorpay checkout integration (UPI focus) — payment saga
- [ ] Payment verification API
- [ ] Razorpay webhook handler (NestJS WebhookController — payment.captured, payment.failed)
- [ ] Cancellation API with refund policy logic
- [ ] Refund initiation via Razorpay API
- [ ] Payment history page
- [ ] Admin: Payment/transaction log

## Week 3: Tracking & Notifications

### Day 15-17: Real-Time GPS Tracking
- [ ] NestJS WebSocket gateway setup (@nestjs/websockets + Socket.io)
- [ ] Driver: Geolocation API integration (useGeolocation hook)
- [ ] Driver: Send location via WebSocket (tracking saga with eventChannel)
- [ ] NestJS: Broadcast to booking room
- [ ] User: Live map with driver marker
- [ ] Driver: Status update buttons (en route, arrived, picked up, completed)
- [ ] Wake Lock API — keep screen on during active ride
- [ ] Status change triggers notification (BullMQ queue)
- [ ] Location history logging to MongoDB

### Day 18-19: Notifications
- [ ] Firebase project setup
- [ ] FCM web push implementation (service worker via vite-plugin-pwa)
- [ ] Push notification for: booking, pickup, drop, stops, payment, cancel
- [ ] MSG91 SMS integration (NestJS SmsService)
- [ ] SMS for: OTP, booking confirmation, ride started, completed
- [ ] Vibration API on key events (booking confirm, driver arrived)
- [ ] Notification bell icon with unread count (Redux notificationSlice)
- [ ] Admin: Notification center (view all notifications)

### Day 20-21: Driver Panel + Rating
- [ ] Driver: Dashboard (today's rides, upcoming)
- [ ] Driver: Ride detail with route map
- [ ] Driver: Navigation link (open in Google Maps)
- [ ] Driver: Status flow (accept → en route → picked up → stops → completed)
- [ ] Rating: User rates driver after ride (1-5 stars + review)
- [ ] Rating: Driver rates user after ride
- [ ] Average rating calculation + display

## Week 4: Polish & Deploy

### Day 22-23: PWA + Web APIs + UX
- [ ] vite-plugin-pwa setup: manifest.json, service worker
- [ ] Offline fallback page
- [ ] Install prompt (custom banner)
- [ ] App icons (all sizes)
- [ ] Web Share API — share ride tracking link with family
- [ ] Screen Orientation API — lock portrait on tracking map
- [ ] Loading states and skeletons
- [ ] Error boundaries (React ErrorBoundary → report to backend)
- [ ] Empty states for lists
- [ ] Responsive design check (mobile + desktop)
- [ ] Form validation UX (Zod error messages)

### Day 24-25: Admin Dashboard + Built-In Monitoring
- [ ] Admin dashboard: today's stats (bookings, revenue, active rides)
- [ ] Charts: bookings per day/week/month
- [ ] Revenue summary
- [ ] Driver performance (rides, rating)
- [ ] Car utilization report
- [ ] Built-in error tracking: NestJS GlobalExceptionFilter → MongoDB error_logs → admin error dashboard
- [ ] Built-in health checks: NestJS @Cron every 5 min → push/SMS alert on failure
- [ ] Built-in analytics: event tracking → MongoDB analytics_events → admin charts
- [ ] Ride extension flow (user requests, admin/driver approves)

### Day 26-27: Testing + Security
- [ ] API endpoint testing (Jest + NestJS testing module)
- [ ] Booking flow end-to-end test
- [ ] Payment test (Razorpay test mode)
- [ ] Rate limiting on auth endpoints (NestJS ThrottlerGuard)
- [ ] Security headers (Nginx — X-Frame-Options, HSTS, CSP)
- [ ] Input validation audit (class-validator on all DTOs)
- [ ] CORS configuration (NestJS — allow only your domain)
- [ ] Cookie security audit (httpOnly, Secure, SameSite)
- [ ] Environment variable audit (no secrets in code)

### Day 28: Deployment
- [ ] Docker production build (react-app + nestjs-api)
- [ ] AWS EC2 instance launch
- [ ] Nginx configuration + SSL (Let's Encrypt)
- [ ] docker-compose up in production
- [ ] Domain DNS setup (Cloudflare)
- [ ] MongoDB Atlas IP whitelist
- [ ] Razorpay live mode activation
- [ ] MSG91 DLT templates approved
- [ ] Smoke test all flows
- [ ] Verify built-in health checks running
- [ ] Verify error tracking capturing
- [ ] First real booking!

## Post-MVP (Month 2+)

### v1.1 Enhancements
- Traccar GPS device integration (car hardware tracker)
- Email notifications (Resend)
- Ride extension during trip
- Web Share API — share ride link
- Payment Request API — native UPI payment sheet
- Background Sync API — offline booking queue
- Dark mode
- SEO pre-rendering for landing page

### v1.2 Growth
- Multiple car categories
- Corporate accounts
- Scheduled recurring rides
- Driver payroll tracking
- Vehicle maintenance reminders
- WhatsApp notifications

### v2.0 Scale
- Mobile app (React Native)
- Multi-company white-label
- WebRTC in-app voice calls (user ↔ driver)
- Dynamic pricing engine
- AI demand prediction
- Extract monitoring tools as standalone product
- Franchise model
