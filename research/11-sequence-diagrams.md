# Sequence Diagrams

## 1. User Registration (Phone OTP)

```mermaid
sequenceDiagram
    actor User
    participant App as React PWA
    participant API as NestJS API
    participant MSG91
    participant DB as MongoDB

    User->>App: Enter phone number
    App->>API: POST /api/auth/send-otp
    API->>MSG91: Send OTP to phone
    MSG91-->>User: SMS with OTP
    User->>App: Enter OTP
    App->>API: POST /api/auth/verify-otp
    API->>MSG91: Verify OTP
    MSG91-->>API: OTP valid
    API->>DB: Find or create user
    DB-->>API: User document
    API->>DB: Create session (30-day expiry)
    API-->>App: Set-Cookie: sid (httpOnly, Secure, SameSite=Strict)
    App-->>User: Redirect to dashboard
```

## 2. Booking Flow

```mermaid
sequenceDiagram
    actor User
    participant App as React PWA
    participant API as NestJS API
    participant Maps as Google Maps
    participant DB as MongoDB
    participant RZP as Razorpay
    participant Notify as FCM + SMS

    User->>App: Enter pickup, drop, date
    App->>Maps: Get directions + distance
    Maps-->>App: Route, distance, duration

    User->>App: Add intermediate stops
    App->>Maps: Recalculate with stops
    Maps-->>App: Updated route + distance

    App->>API: GET /api/cars/available?date=X
    Note right of App: Cookie sent automatically
    API->>DB: Query cars not booked on date
    DB-->>API: Available cars
    API-->>App: Car list with driver info

    User->>App: Select car
    App->>API: POST /api/bookings/calculate-price
    API-->>App: Price breakdown

    User->>App: Confirm booking
    App->>API: POST /api/bookings
    API->>DB: Create booking (status: pending)
    API->>RZP: Create Razorpay order
    RZP-->>API: Order ID
    API-->>App: Order ID + booking ID

    App->>RZP: Open Razorpay checkout (UPI)
    User->>RZP: Pay via UPI
    RZP-->>App: Payment success

    App->>API: POST /api/payments/verify
    API->>RZP: Verify signature
    RZP-->>API: Valid
    API->>DB: Update booking (confirmed) + save payment
    API->>Notify: Queue booking confirmation (BullMQ)
    Notify-->>User: Push + SMS notification
    Notify-->>Admin: Push notification
    API-->>App: Booking confirmed
```

## 3. Ride Day Flow

```mermaid
sequenceDiagram
    actor Driver
    actor User
    participant App as React PWA
    participant WS as NestJS WebSocket Gateway
    participant DB as MongoDB
    participant Notify as FCM + SMS

    Note over Notify: 1 day before: Reminder sent to User + Driver
    Note over Notify: 2 hours before: Reminder sent

    Driver->>App: Start ride
    App->>WS: Connect (cookie auth) + join booking room
    WS->>DB: Update status: driver_en_route
    WS->>Notify: Notify user: "Driver on the way"
    Notify-->>User: Push notification + vibration

    loop Every 5 seconds
        Driver->>WS: emit location:update (phone GPS)
        WS->>DB: Store location log
        WS-->>User: Broadcast fused position
        User->>App: See live map update
    end

    Driver->>App: Reached pickup
    App->>WS: Status: picked_up
    WS->>Notify: "Driver arrived at pickup"
    Notify-->>User: Push notification + vibration

    Driver->>App: Start trip (Wake Lock activates)
    App->>WS: Status: in_progress

    Note over Driver,User: Intermediate stops
    Driver->>App: Reached Stop 1
    App->>WS: Update stop status
    WS->>Notify: "Reached stop: Ujjain"
    Notify-->>User: Push notification

    Driver->>App: Complete ride (Wake Lock released)
    App->>WS: Status: completed
    WS->>DB: Update booking, calculate actual distance
    WS->>Notify: "Ride completed. Amount: 2,500"
    Notify-->>User: Push + SMS + Email
    Notify-->>Admin: Push notification

    User->>App: Rate driver (1-5 stars + review)
    App->>API: POST /api/ratings
    API->>DB: Save rating, update driver avgRating

    Driver->>App: Rate user (1-5 stars)
    App->>API: POST /api/ratings
    API->>DB: Save rating
```

## 4. Cancellation + Refund Flow

```mermaid
sequenceDiagram
    actor User
    participant App as React PWA
    participant API as NestJS API
    participant DB as MongoDB
    participant RZP as Razorpay
    participant Notify as FCM + SMS

    User->>App: Cancel booking
    App->>API: POST /api/bookings/:id/cancel
    API->>DB: Get booking + refund policy

    alt Full refund (>24h before ride)
        API->>RZP: Create full refund
        RZP-->>API: Refund initiated
        API->>DB: Update booking (cancelled, refund: full)
    else Partial refund (12-24h before)
        API->>RZP: Create partial refund (50%)
        RZP-->>API: Refund initiated
        API->>DB: Update booking (cancelled, refund: partial)
    else No refund (<12h before)
        API->>DB: Update booking (cancelled, refund: none)
    end

    API->>Notify: Queue cancellation notification (BullMQ)
    Notify-->>User: "Booking cancelled. Refund: X in 5-7 days"
    Notify-->>Driver: "Booking cancelled by user"
    Notify-->>Admin: "Booking #123 cancelled"
    API-->>App: Cancellation confirmed
```

## 5. Admin: Add Car Flow

```mermaid
sequenceDiagram
    actor Admin
    participant App as React Admin Panel
    participant API as NestJS API
    participant S3 as AWS S3
    participant DB as MongoDB

    Admin->>App: Fill car details form
    Admin->>App: Upload photos + documents

    App->>API: GET /api/upload/presigned-url
    Note right of App: Session cookie validates admin role
    API->>S3: Generate presigned upload URLs
    S3-->>API: Signed URLs
    API-->>App: Upload URLs

    App->>S3: Upload files directly to S3
    S3-->>App: File URLs

    App->>API: POST /api/admin/cars
    API->>DB: Validate + save car
    DB-->>API: Car created
    API-->>App: Success

    Admin->>App: Assign driver to car
    App->>API: PATCH /api/admin/cars/:id/assign-driver
    API->>DB: Update car.assignedDriver
    API-->>App: Driver assigned
```

## 6. Payment Webhook Flow

```mermaid
sequenceDiagram
    participant RZP as Razorpay
    participant API as NestJS WebhookController
    participant DB as MongoDB
    participant Notify as BullMQ Notification Worker

    RZP->>API: POST /api/webhooks/razorpay
    API->>API: Verify webhook signature (HMAC SHA256)

    alt payment.captured
        API->>DB: Update payment status: captured
        API->>DB: Update booking status: confirmed
        API->>Notify: Queue confirmation notification
    else payment.failed
        API->>DB: Update payment status: failed
        API->>DB: Update booking status: payment_failed
        API->>Notify: Queue failure notification
        API->>DB: Log error to error_logs
    else refund.processed
        API->>DB: Update refund status: processed
        API->>Notify: Queue refund confirmation
    end

    API-->>RZP: 200 OK
```

## 7. Session Auth Flow (BFF Cookie)

```mermaid
sequenceDiagram
    actor User
    participant Browser as React PWA
    participant API as NestJS API
    participant MW as SessionMiddleware
    participant DB as MongoDB

    Note over User,DB: Login
    User->>Browser: Enter phone + OTP
    Browser->>API: POST /api/auth/verify-otp
    API->>DB: Create session (30-day expiry)
    API-->>Browser: Set-Cookie: sid=abc123 (httpOnly)

    Note over User,DB: Subsequent API Calls
    Browser->>API: GET /api/bookings (cookie auto-sent)
    API->>MW: Read sid from cookie
    MW->>DB: sessions.findById(sid)
    DB-->>MW: Session valid, userId
    MW->>DB: users.findById(userId)
    DB-->>MW: User document
    MW->>MW: Attach user to req
    MW->>MW: Update lastActiveAt (sliding window)
    API-->>Browser: Bookings data

    Note over User,DB: Session Auto-Refresh
    Note right of MW: Every request resets 30-day window
    Note right of MW: 30 days of zero activity = expired

    Note over User,DB: Logout
    Browser->>API: POST /api/auth/logout
    API->>DB: Delete session document
    API-->>Browser: Set-Cookie: sid= (clear cookie)

    Note over User,DB: Force Logout (Admin blocks user)
    API->>DB: Delete ALL sessions for userId
    Note right of DB: Next request from any device = 401
```

## 8. Dual GPS Tracking Flow

```mermaid
sequenceDiagram
    actor Driver
    participant Phone as Driver Phone (PWA)
    participant GPS as Car GPS Device
    participant TC as Traccar Server
    participant WS as NestJS WebSocket Gateway
    participant FS as FusionService
    participant DB as MongoDB
    participant User as User Browser

    Note over Driver,User: Ride starts - both trackers active

    par Phone GPS Stream
        loop Every 3-5 seconds
            Phone->>Phone: watchPosition() fix
            Phone->>WS: emit location:update (source: phone)
            WS->>FS: Phone position received
        end
    and Car GPS Stream
        loop Every 10-30 seconds
            GPS->>TC: TCP packet (GT06 protocol)
            TC->>WS: WebSocket position event
            WS->>FS: Car GPS position received
        end
    end

    FS->>FS: Compare both sources
    Note right of FS: Pick car GPS if both available (more accurate)
    Note right of FS: Fall back to phone if car GPS stale
    Note right of FS: Alert if sources 500m+ apart

    FS->>DB: Store in location_logs (both sources tagged)
    FS->>WS: Broadcast fused position to booking room
    WS-->>User: driver:location event
    User->>User: Update marker on map
```
