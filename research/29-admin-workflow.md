# Admin Workflow

## Overview

Complete admin workflow for managing the car rental platform. All admin APIs use `/api/admin/*` prefix with JWT + admin role guard.

---

## 1. Admin Authentication

```mermaid
flowchart TD
    A[Admin Login Page] --> B[Enter Phone & Password]
    B --> C[POST /admin/auth/login]
    C --> D{Valid Admin?}
    D -->|Yes| E[Store JWT Token]
    D -->|No - Invalid| F[Error: Invalid admin credentials]
    D -->|No - Not admin role| F
    E --> G[Admin Dashboard]
    F --> A
```

> Admin accounts created via seed script or direct DB. No public registration.

---

## 2. Dashboard Overview

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[GET /admin/dashboard/stats]
    B --> C["Stats Cards:<br/>Total Users | Total Drivers<br/>Total Cars | Total Bookings<br/>Today's Bookings | Active Bookings<br/>Completed | Revenue"]

    A --> D[GET /admin/dashboard/revenue-chart<br/>?days=30]
    D --> E[Revenue Line Chart<br/>Daily revenue for last 30 days]

    A --> F[GET /admin/dashboard/booking-stats<br/>?days=30]
    F --> G[Booking Pie Chart<br/>By status: pending, confirmed,<br/>completed, cancelled]

    A --> H[Quick Actions]
    H --> H1[Add Car]
    H --> H2[Add Driver]
    H --> H3[View Bookings]
    H --> H4[Settings]
```

### Dashboard Stats Response
```json
{
  "totalUsers": 150,
  "totalDrivers": 12,
  "totalCars": 8,
  "totalBookings": 340,
  "todayBookings": 5,
  "activeBookings": 3,
  "completedBookings": 285,
  "totalRevenue": 1250000,
  "todayRevenue": 15000
}
```

---

## 3. Car Management

```mermaid
flowchart TD
    A[Cars Page] --> B[GET /admin/cars<br/>?page=1&limit=20&category=sedan]
    B --> C[Cars List Table<br/>Reg No, Make, Model, Category,<br/>Driver, Status]

    C --> D[Add New Car]
    D --> D1["POST /admin/cars<br/>registrationNumber, make, model,<br/>year, color, category, seats, photos"]
    D1 --> D2{Success?}
    D2 -->|Yes| D3[Car Created<br/>isActive: true]
    D2 -->|No - Duplicate reg| D4[Error: Already exists]

    C --> E[Edit Car]
    E --> E1[PUT /admin/cars/:id<br/>Update any field]

    C --> F[Assign Driver]
    F --> F1[PUT /admin/cars/:id/assign-driver/:driverId]
    F1 --> F2[Driver linked to car]

    C --> G[Deactivate]
    G --> G1[PUT /admin/cars/:id/deactivate]
    G1 --> G2[Car hidden from<br/>customer search]

    C --> H[Activate]
    H --> H1[PUT /admin/cars/:id/activate]
```

```mermaid
flowchart LR
    A[Add Car] --> B[Upload Photos]
    B --> C[Upload Documents<br/>RC, Insurance, PUC, Fitness]
    C --> D[Assign Driver]
    D --> E[Car Active &<br/>Bookable]
```

---

## 4. Driver Management

```mermaid
flowchart TD
    A[Drivers Page] --> B[GET /admin/drivers<br/>?isVerified=false]
    B --> C[Drivers List Table<br/>Name, Phone, License, Verified,<br/>Available, Rating, Rides]

    C --> D[Create Driver Profile]
    D --> D1["POST /admin/drivers<br/>userId, licenseNumber,<br/>licensePhoto, licenseExpiry,<br/>aadhaarNumber, aadhaarPhoto, photo"]
    D1 --> D2[Profile Created<br/>isVerified: false]

    C --> E[Review & Verify]
    E --> E1[View Documents]
    E1 --> E2{Docs Valid?}
    E2 -->|Yes| E3[PUT /admin/drivers/:id/verify]
    E2 -->|No| E4[Contact Driver<br/>Request correct docs]
    E3 --> E5[isVerified: true<br/>Can be assigned rides]

    C --> F[Update Driver]
    F --> F1[PUT /admin/drivers/:id<br/>Update license, photo, etc.]

    C --> G[View Performance]
    G --> G1[avgRating, totalRides]
```

```mermaid
flowchart LR
    A[Register Driver User] --> B[Create Driver Profile]
    B --> C[Upload Documents]
    C --> D[Admin Verifies]
    D --> E[Assign to Car]
    E --> F[Driver Ready]
```

---

## 5. User Management

```mermaid
flowchart TD
    A[Users Page] --> B["GET /admin/users<br/>?role=customer"]
    B --> C["Users Table<br/>Name, Phone, Email,<br/>Role, Active, Blocked"]

    C --> D[View User Detail]
    D --> D1[GET /admin/users/:id]
    D1 --> D2[Full Profile + Booking History]

    C --> E[Block User]
    E --> E1["PUT /admin/users/:id/block<br/>reason: Fraudulent activity"]
    E1 --> E2["User cannot login<br/>JWT validation fails"]

    C --> F[Unblock User]
    F --> F1[PUT /admin/users/:id/unblock]
    F1 --> F2[User can login again]

    C --> G["Filter + Search"]
    G --> G1["By Role: customer, driver, admin"]
    G --> G2["By Name, Phone, Email"]
```

---

## 6. Booking Management

```mermaid
flowchart TD
    A[Bookings Page] --> B["GET /admin/bookings<br/>?status=confirmed"]
    B --> C["Bookings Table<br/>BookingID, Customer, Car,<br/>Route, Date, Status, Amount"]

    C --> D[View Detail]
    D --> D1[GET /admin/bookings/:id]
    D1 --> D2["Full Booking Info<br/>Customer, Car, Driver,<br/>Pricing, Status Timeline"]

    C --> E[Assign Driver]
    E --> E1["PUT /admin/bookings/:id/assign-driver"]
    E1 --> E2["Status: driver_assigned<br/>Driver notified"]

    C --> F[Update Status]
    F --> F1["PUT /admin/bookings/:id/status"]

    C --> G[Cancel Booking]
    G --> G1["PUT /admin/bookings/:id/cancel"]
    G1 --> G2["Status: cancelled<br/>Refund initiated"]
```

### Booking Assignment Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as Backend
    participant D as Driver
    participant C as Customer

    Note over A: New confirmed booking
    A->>API: GET /admin/bookings?status=confirmed
    API-->>A: List unassigned bookings

    A->>A: Check available drivers<br/>GET /admin/drivers?isAvailable=true

    A->>API: PUT /admin/bookings/:id/assign-driver<br/>{driverId}
    API->>API: Update booking status<br/>→ driver_assigned
    API-->>D: Notification: New ride assigned
    API-->>C: Notification: Driver assigned
    API-->>A: Booking updated
```

---

## 7. Payment Management

```mermaid
flowchart TD
    A[Payments Page] --> B[GET /admin/payments<br/>?status=captured]
    B --> C[Payments Table<br/>BookingID, Customer, Amount,<br/>Method, Status, Date]

    C --> D[View Payment Detail]
    D --> D1[Razorpay Order ID<br/>Payment ID, UPI ID,<br/>Paid At, Refund Status]

    C --> E[Initiate Refund]
    E --> E1{Full or Partial?}
    E1 -->|Full| E2[POST /admin/payments/:id/refund]
    E1 -->|Partial| E3[POST /admin/payments/:id/refund<br/>amount: 5000 paise]
    E2 --> E4[Razorpay refund created<br/>Status: refunded]
    E3 --> E5[Razorpay partial refund<br/>Status: partial_refund]
```

---

## 8. Route Pricing Management

```mermaid
flowchart TD
    A[Routes Page] --> B[GET /admin/routes]
    B --> C[Routes Table<br/>Name, Distance, Price/km,<br/>Base Fare, Tolls, Status]

    C --> D[Add Route]
    D --> D1["POST /admin/routes<br/>name: 'Indore to Bhopal'<br/>distanceKm: 195<br/>pricePerKm: 12<br/>baseFare: 500<br/>tollEstimate: 200"]
    D1 --> D2[Route Created<br/>isActive: true]

    C --> E[Update Route]
    E --> E1[PUT /admin/routes/:id<br/>Update pricing, distance]

    C --> F[Deactivate Route]
    F --> F1[PUT /admin/routes/:id/deactivate]
    F1 --> F2[Route hidden from<br/>customer search]
```

---

## 9. Company Settings

```mermaid
flowchart TD
    A[Settings Page] --> B[GET /admin/dashboard/settings]
    B --> C["Company Settings Form:<br/>Company Name<br/>Phone<br/>Email<br/>Default Price/km<br/>Default Refund Policy<br/>Razorpay Key ID<br/>UPI Merchant ID<br/>Social Links"]
    C --> D[Edit & Save]
    D --> E[PUT /admin/dashboard/settings]
    E --> F[Settings Updated]
```

---

## 10. Admin Daily Workflow

```mermaid
flowchart TD
    A[Morning: Check Dashboard] --> B[Review overnight bookings]
    B --> C[Assign drivers to<br/>confirmed bookings]
    C --> D[Check driver availability]
    D --> E[Monitor active rides]
    E --> F{Issues?}
    F -->|Cancellation request| G[Process cancellation<br/>& refund]
    F -->|Customer complaint| H[Review booking<br/>Contact driver]
    F -->|Document expiry| I[Notify driver to<br/>update documents]
    F -->|No issues| J[Continue monitoring]
    G --> J
    H --> J
    I --> J
    J --> K[End of day:<br/>Review stats & revenue]
```

---

## Admin API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/auth/login | Admin login |
| GET | /admin/dashboard/stats | Dashboard statistics |
| GET | /admin/dashboard/revenue-chart | Revenue chart data |
| GET | /admin/dashboard/booking-stats | Booking stats by status |
| GET | /admin/dashboard/settings | Company settings |
| PUT | /admin/dashboard/settings | Update settings |
| GET | /admin/users | List users (paginated, filterable) |
| GET | /admin/users/:id | Get user detail |
| PUT | /admin/users/:id/block | Block user |
| PUT | /admin/users/:id/unblock | Unblock user |
| POST | /admin/cars | Add car |
| GET | /admin/cars | List cars |
| GET | /admin/cars/:id | Get car detail |
| PUT | /admin/cars/:id | Update car |
| PUT | /admin/cars/:id/activate | Activate car |
| PUT | /admin/cars/:id/deactivate | Deactivate car |
| PUT | /admin/cars/:id/assign-driver/:driverId | Assign driver |
| POST | /admin/drivers | Create driver profile |
| GET | /admin/drivers | List drivers |
| GET | /admin/drivers/:id | Get driver detail |
| PUT | /admin/drivers/:id | Update driver |
| PUT | /admin/drivers/:id/verify | Verify driver |
| GET | /admin/bookings | List bookings |
| GET | /admin/bookings/:id | Get booking detail |
| PUT | /admin/bookings/:id/assign-driver | Assign driver |
| PUT | /admin/bookings/:id/status | Update status |
| PUT | /admin/bookings/:id/cancel | Cancel booking |
| GET | /admin/payments | List payments |
| POST | /admin/payments/:id/refund | Initiate refund |
| POST | /admin/routes | Create route pricing |
| GET | /admin/routes | List routes |
| PUT | /admin/routes/:id | Update route |
| PUT | /admin/routes/:id/deactivate | Deactivate route |
