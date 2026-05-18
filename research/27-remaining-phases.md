# Remaining Implementation Phases

What's already built (Phases complete):
- Auth (cookie sessions, login/signup, protected routes)
- User management (admin CRUD, profiles)
- Cars (CRUD, image upload to S3)
- Drivers (onboarding form, 4-tab detail, assign to car)
- Bookings (creation, list, detail, admin view)
- Payments (Razorpay integration, webhooks, refunds)
- Route pricing (form, inter-state GST, auto-pricing)
- Ratings (bidirectional, star rating)
- Email (Resend integration)
- S3 upload (presigned URLs, local preview)
- Admin dashboard (stats, overview)
- Driver panel (dashboard, rides, ratings)
- Customer flow (home, booking form, my bookings)

---

## Phase 1: PWA Setup (2-3 days)

Quick win — makes app installable, adds offline shell.

### Tasks

#### 1.1 PWA Core Setup
- [ ] Install `vite-plugin-pwa`
- [ ] Configure `manifest.json` (name, icons, theme color, display: standalone)
- [ ] Generate app icons (all sizes: 72, 96, 128, 144, 152, 192, 384, 512)
- [ ] Configure service worker (Workbox — precache app shell)

#### 1.2 Offline Support
- [ ] Offline fallback page (friendly "no connection" UI)
- [ ] Cache-first strategy for static assets (JS, CSS, images)
- [ ] Network-first strategy for API calls
- [ ] Show cached data when offline (last known bookings, profile)

#### 1.3 Install Experience
- [ ] Custom install prompt banner (beforeinstallprompt event)
- [ ] "Add to Home Screen" button in header/settings
- [ ] Dismiss + remind later logic

#### 1.4 Web APIs
- [ ] Screen Orientation API — lock portrait on tracking pages
- [ ] Web Share API — share ride tracking link

---

## Phase 2: Notifications (3-4 days)

Push + SMS for all booking lifecycle events.

### Tasks

#### 2.1 FCM Push Setup
- [ ] Create Firebase project + web app config
- [ ] Install `firebase` SDK in frontend
- [ ] FCM service worker (`firebase-messaging-sw.js`)
- [ ] Permission request flow (ask at right moment, not on load)
- [ ] Store FCM token in user document (backend API)
- [ ] Handle token refresh

#### 2.2 Backend Notification Service
- [ ] `NotificationModule` in NestJS
- [ ] `NotificationService` — send push via FCM Admin SDK
- [ ] `SmsService` — send SMS via MSG91 API
- [ ] Notification schema (MongoDB) — type, userId, title, body, read, createdAt
- [ ] BullMQ queue for async notification dispatch
- [ ] Notification preferences per user (push on/off, SMS on/off)

#### 2.3 Notification Triggers
- [ ] Booking confirmed → push + SMS to customer
- [ ] Driver assigned → push to driver + customer
- [ ] Driver en route → push to customer
- [ ] Driver arrived → push + vibration to customer
- [ ] Ride started → push to customer
- [ ] Ride completed → push + SMS to customer
- [ ] Payment received → push to customer
- [ ] Booking cancelled → push + SMS to affected parties
- [ ] Admin: manual notification broadcast

#### 2.4 Notification UI
- [ ] Notification bell icon with unread count (header)
- [ ] Notification dropdown/page — list all notifications
- [ ] Mark as read (single + all)
- [ ] Vibration API on key events (driver arrived, booking confirmed)
- [ ] Admin: notification log/center

---

## Phase 3: Document Management (2-3 days)

Upload, verify, track expiry for driver/car documents.

### Tasks

#### 3.1 Document Schema + API
- [ ] `Document` schema — type, entityType (car/driver), entityId, fileUrl, status (pending/verified/rejected), expiryDate, verifiedBy, notes
- [ ] Document types: driving license, Aadhaar, PAN, car RC, insurance, permit, fitness certificate, pollution certificate
- [ ] CRUD API for documents
- [ ] Upload endpoint (reuse S3 upload)

#### 3.2 Verification Workflow
- [ ] Admin: document review page (pending documents queue)
- [ ] Approve/reject with notes
- [ ] Auto-flag expired documents (NestJS @Cron daily check)
- [ ] Block driver/car if required document missing or expired
- [ ] Email/push notification on document status change

#### 3.3 Driver/Car Integration
- [ ] Driver detail page — documents tab (existing 4-tab form, add 5th)
- [ ] Car detail page — documents section
- [ ] Document status badges (pending/verified/expired/rejected)
- [ ] Bulk document status overview for admin

#### 3.4 Document Expiry Tracking
- [ ] Dashboard widget: expiring documents (next 30 days)
- [ ] Admin alert: documents expiring soon
- [ ] Driver notification: "Your license expires in X days"

---

## Phase 4: GPS Tracking (4-5 days)

Real-time driver location during active rides.

### Tasks

#### 4.1 WebSocket Gateway
- [ ] Install `@nestjs/websockets` + `socket.io`
- [ ] `TrackingGateway` — WebSocket gateway in NestJS
- [ ] Room-based architecture: each active booking = 1 room
- [ ] Auth middleware for WebSocket (validate session cookie)
- [ ] Connection/disconnection handling

#### 4.2 Driver Location Sending
- [ ] `useGeolocation` hook — watch position with high accuracy
- [ ] Send location via WebSocket every 5-10 seconds (configurable)
- [ ] Battery-aware frequency (reduce when battery low)
- [ ] Wake Lock API — keep screen on during active ride
- [ ] Fallback: periodic HTTP POST if WebSocket disconnects
- [ ] Background location (limited on web — document limitations)

#### 4.3 Location Broadcasting
- [ ] NestJS receives driver location → broadcast to booking room
- [ ] Store location history in MongoDB (for route replay)
- [ ] Calculate ETA based on current location + destination
- [ ] Update booking with last known location

#### 4.4 Customer Live Map
- [ ] Google Maps component with driver marker (real-time)
- [ ] Smooth marker animation between position updates
- [ ] Show route line (pickup → stops → drop)
- [ ] ETA display (updating in real-time)
- [ ] Driver status overlay (en route / arrived / trip in progress)

#### 4.5 Ride Status Flow
- [ ] Driver status buttons: Accept → En Route → Arrived → Picked Up → [Stops] → Completed
- [ ] Each status change → notification to customer
- [ ] Each status change → update booking status
- [ ] Navigation link: open Google Maps with directions
- [ ] Admin: live view of all active rides on map

#### 4.6 Traccar Integration (Post-MVP)
- [ ] Traccar server setup (Docker)
- [ ] Fusion service: pick best source (phone GPS vs car GPS)
- [ ] Fallback logic when phone GPS unavailable

---

## Phase 5: Multi-Stop Routes (2-3 days)

Enhance booking flow with waypoints.

### Tasks

#### 5.1 Route Builder UI
- [ ] Multi-stop input (add/remove/reorder stops via drag)
- [ ] Google Places autocomplete for each stop
- [ ] Visual route preview on map (all waypoints)
- [ ] Distance + duration calculation with stops

#### 5.2 Pricing with Stops
- [ ] Calculate total distance including all stops
- [ ] Per-stop waiting charge (configurable)
- [ ] Price breakdown: base + per-km + stop charges + tolls + GST
- [ ] Update route pricing API to handle waypoints

#### 5.3 Booking Flow Updates
- [ ] Store stops array in booking document
- [ ] Driver view: ordered stop list with navigation
- [ ] Driver: mark each stop as reached
- [ ] Customer: see progress through stops
- [ ] Admin: view stops in booking detail

#### 5.4 Navigation Integration
- [ ] Generate Google Maps navigation URL with all waypoints
- [ ] Open native navigation with all stops pre-loaded
- [ ] Re-route handling (stop order changes)

---

## Summary Timeline

| Phase | Scope | Est. Days | Dependency |
|-------|-------|-----------|------------|
| 1 | PWA Setup | 2-3 | None |
| 2 | Notifications | 3-4 | None (parallel with Phase 1) |
| 3 | Document Management | 2-3 | Phase 1 done |
| 4 | GPS Tracking | 4-5 | Phase 2 done (needs notifications) |
| 5 | Multi-Stop Routes | 2-3 | Phase 4 done (needs map/tracking) |

Total: ~14-18 days

## Ready to Start

Phase 1 (PWA Setup) is first. No dependencies, quick win.
