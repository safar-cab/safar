# Customer Workflow

## Overview

Complete customer journey from registration to ride completion and rating. All customer APIs use `/api/customer/*` prefix.

---

## 1. Registration & Authentication

```mermaid
flowchart TD
    A[Open App] --> B{Has Account?}
    B -->|No| C[Register Screen]
    B -->|Yes| D[Login Screen]

    C --> C1[Enter Name]
    C1 --> C2[Enter Phone 10-digit]
    C2 --> C3[Enter Email optional]
    C3 --> C4[Create Password min 6 chars]
    C4 --> C5[POST /customer/auth/register]
    C5 --> C6{Success?}
    C6 -->|Yes| C7[Store JWT Token]
    C6 -->|No - Phone exists| C8[Show Error: Already registered]
    C6 -->|No - Validation| C9[Show Validation Errors]
    C8 --> D
    C9 --> C1
    C7 --> H[Customer Dashboard]

    D --> D1[Enter Phone]
    D1 --> D2[Enter Password]
    D2 --> D3[POST /customer/auth/login]
    D3 --> D4{Success?}
    D4 -->|Yes| D5[Store JWT Token]
    D4 -->|No - Invalid| D6[Show: Invalid credentials]
    D4 -->|No - Blocked| D7[Show: Account blocked]
    D5 --> H
    D6 --> D1
```

### API Endpoints
- `POST /api/customer/auth/register` — `{ name, phone, email?, password }`
- `POST /api/customer/auth/login` — `{ phone, password }`
- Response: `{ accessToken, user: { _id, name, phone, role } }`

---

## 2. Browse Routes & Cars

```mermaid
flowchart TD
    A[Customer Dashboard] --> B[Browse Routes]
    B --> B1[GET /customer/routes]
    B1 --> B2[Show Route Cards]
    B2 --> B3[Select Route]
    B3 --> B4[GET /customer/routes/:id]
    B4 --> B5[Show Route Details<br/>Distance, Price/km, Tolls]

    A --> C[Browse Cars]
    C --> C1[GET /customer/cars/available]
    C1 --> C2{Filter by category?}
    C2 -->|Yes| C3[?category=sedan/suv/hatchback]
    C2 -->|No| C4[Show All Cars]
    C3 --> C4
    C4 --> C5[Car Cards Grid<br/>Photo, Make, Model, Seats, Category]
    C5 --> C6[Select Car]
    C6 --> C7[GET /customer/cars/:id]
    C7 --> C8[Show Car Details<br/>Full Photos, Documents, Driver]
```

---

## 3. Booking Flow

```mermaid
flowchart TD
    A[Start Booking] --> B[Step 1: Pickup Location]
    B --> B1[Enter Address]
    B1 --> B2[Add Landmark optional]
    B2 --> C[Step 2: Drop Location]
    C --> C1[Enter Address]
    C1 --> C2[Add Landmark optional]
    C2 --> D{Add Stops?}
    D -->|Yes| D1[Step 3: Add Intermediate Stops]
    D1 --> D2[Enter Stop Address]
    D2 --> D3{More Stops?}
    D3 -->|Yes| D2
    D3 -->|No| E
    D -->|No| E[Step 4: Schedule]
    E --> E1[Select Start Date]
    E1 --> E2[Select Start Time]
    E2 --> E3[Select End Date optional]
    E3 --> F[Step 5: Select Car]
    F --> F1[Show Available Cars]
    F1 --> F2[Pick Car]
    F2 --> G[Step 6: Review & Price]
    G --> G1[Show Pricing Breakdown]

    G1 --> G2["Base Fare: ₹500<br/>Distance: 195km × ₹12/km = ₹2,340<br/>Tolls: ₹200<br/>GST 5%: ₹152<br/>Total: ₹3,192"]

    G2 --> H[Confirm Booking]
    H --> H1[POST /customer/bookings]
    H1 --> H2{Success?}
    H2 -->|Yes| I[Booking Created<br/>Status: PENDING<br/>BookingID: BK-20260601-001]
    H2 -->|No| H3[Show Error]
    I --> J[Proceed to Payment]
```

### Create Booking API
```
POST /api/customer/bookings
{
  carId: "...",
  pickup: { address, coordinates?, landmark? },
  drop: { address, coordinates?, landmark? },
  stops: [{ order, address, coordinates? }],
  schedule: { startDate, startTime, endDate?, endTime? },
  estimatedDistanceKm: 195
}
```

---

## 4. Payment Flow (UPI via Razorpay)

```mermaid
sequenceDiagram
    participant C as Customer App
    participant API as NestJS Backend
    participant RP as Razorpay
    participant UPI as UPI App

    C->>API: POST /customer/payments/create-order<br/>{bookingId}
    API->>API: Validate booking ownership<br/>Check status = pending
    API->>RP: razorpay.orders.create()<br/>{amount, currency: INR}
    RP-->>API: {orderId, amount}
    API->>API: Save Payment record<br/>status: created
    API-->>C: {orderId, amount, keyId}

    C->>C: Open Razorpay Checkout<br/>UPI payment method
    C->>UPI: User selects UPI app<br/>Enters PIN
    UPI-->>RP: Payment authorized
    RP-->>C: {razorpayPaymentId,<br/>razorpaySignature}

    C->>API: POST /customer/payments/verify<br/>{orderId, paymentId, signature}
    API->>API: HMAC SHA256 verify signature
    API->>API: Update Payment: captured
    API->>API: Update Booking: confirmed
    API-->>C: {verified: true}

    Note over RP,API: Webhook Backup
    RP->>API: POST /webhooks/razorpay<br/>event: payment.captured
    API->>API: Verify webhook signature<br/>Update if not already captured
```

---

## 5. Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Booking Created
    Pending --> Confirmed: Payment Captured
    Pending --> Cancelled: Customer Cancels
    Confirmed --> DriverAssigned: Admin Assigns Driver
    DriverAssigned --> DriverEnRoute: Driver Starts
    DriverEnRoute --> PickedUp: Customer Picked Up
    PickedUp --> InProgress: Ride Active
    InProgress --> Completed: Destination Reached
    Confirmed --> Cancelled: Customer/Admin Cancels
    DriverAssigned --> Cancelled: Customer/Admin Cancels
    Cancelled --> Refunded: Refund Processed
    Completed --> [*]
    Refunded --> [*]
```

---

## 6. Live Tracking Flow

```mermaid
flowchart TD
    A[Booking Status: driver_assigned] --> B[Open Tracking Page]
    B --> C[GET /customer/bookings/:id]
    C --> D[Show Map with Route]
    D --> E[Connect WebSocket]
    E --> F[Join booking room]
    F --> G{Driver Status?}

    G -->|driver_en_route| H[Show Driver Moving<br/>to Pickup Point]
    G -->|picked_up| I[Show Route to<br/>Destination]
    G -->|in_progress| J[Show Live Position<br/>on Route]
    G -->|completed| K[Show Ride Complete<br/>Prompt Rating]

    H --> L[Receive Location Updates<br/>via WebSocket]
    I --> L
    J --> L
    L --> M[Update Driver Marker<br/>on Map]
    M --> L
```

---

## 7. Cancellation & Refund Flow

```mermaid
flowchart TD
    A[My Bookings] --> B[Select Booking]
    B --> C[View Booking Detail]
    C --> D[Tap Cancel]
    D --> E[Enter Cancellation Reason]
    E --> F[PUT /customer/bookings/:id/cancel]
    F --> G{Cancellable?}

    G -->|Yes| H[Show Refund Policy]
    G -->|No - Already completed| I[Error: Cannot cancel]
    G -->|No - Already cancelled| I

    H --> H1["Refund Amount: ₹3,192<br/>Policy: Full Refund<br/>Timeline: 3-5 business days"]
    H1 --> H2[Confirm Cancel]
    H2 --> H3[Booking Status: cancelled]
    H3 --> H4[Refund Initiated via Razorpay]
    H4 --> H5[Customer Notified]
```

---

## 8. Rating Flow

```mermaid
flowchart TD
    A[Ride Completed] --> B[Rating Prompt]
    B --> C[Select Stars 1-5]
    C --> D[Write Review optional]
    D --> E[POST /customer/ratings]
    E --> F{Success?}
    F -->|Yes| G[Thank You!<br/>Driver avg rating updated]
    F -->|No - Already rated| H[Error: Already rated]
    F -->|No - Not completed| I[Error: Ride not finished]
```

### Rating API
```
POST /api/customer/ratings
{
  bookingId: "...",
  rating: 5,
  review: "Great ride!"
}
```

---

## 9. Profile Management

```mermaid
flowchart TD
    A[Profile Screen] --> B[GET /customer/profile]
    B --> C[Show Profile Info]
    C --> D{Edit?}
    D -->|Yes| E[Edit Name / Email / Photo / Address]
    E --> F[PUT /customer/profile]
    F --> G[Profile Updated]

    C --> H[Payment History]
    H --> H1[GET /customer/payments]
    H1 --> H2[List Transactions<br/>Amount, Status, Date]
```

---

## Complete Customer Journey

```mermaid
flowchart LR
    A[Register/Login] --> B[Browse Routes & Cars]
    B --> C[Create Booking]
    C --> D[Pay via UPI]
    D --> E[Wait for Driver Assignment]
    E --> F[Track Driver Live]
    F --> G[Ride in Progress]
    G --> H[Ride Completed]
    H --> I[Rate Driver]
    I --> J[View Receipt]
```
