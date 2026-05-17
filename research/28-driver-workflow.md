# Driver Workflow

## Overview

Complete driver journey from registration to ride execution. All driver APIs use `/api/driver/*` prefix. Admin creates driver profiles; drivers manage rides and location.

---

## 1. Driver Onboarding

```mermaid
flowchart TD
    A[Admin Creates User<br/>role: driver] --> B[Admin Creates Driver Profile<br/>POST /admin/drivers]
    B --> B1["License Number<br/>License Photo<br/>License Expiry<br/>Aadhaar Number<br/>Aadhaar Photo<br/>Photo"]
    B1 --> C[Driver Profile Created<br/>isVerified: false]
    C --> D[Admin Reviews Documents]
    D --> E{Documents Valid?}
    E -->|Yes| F[PUT /admin/drivers/:id/verify<br/>isVerified: true]
    E -->|No| G[Contact Driver for<br/>correct documents]
    G --> B1
    F --> H[Driver Can Login<br/>& Accept Rides]
```

---

## 2. Driver Authentication

```mermaid
flowchart TD
    A[Driver Opens App] --> B{Has Account?}
    B -->|No| C[Register<br/>POST /driver/auth/register]
    B -->|Yes| D[Login<br/>POST /driver/auth/login]

    C --> C1[Enter Name, Phone, Password]
    C1 --> C2{Success?}
    C2 -->|Yes| C3[Store JWT]
    C2 -->|No| C4[Show Error]

    D --> D1[Enter Phone & Password]
    D1 --> D2{Success?}
    D2 -->|Yes| D3[Store JWT]
    D2 -->|No - Invalid| D4[Invalid credentials]
    D2 -->|No - Blocked| D5[Account blocked]

    C3 --> E[Driver Dashboard]
    D3 --> E
```

---

## 3. Driver Dashboard

```mermaid
flowchart TD
    A[Driver Dashboard] --> B[Today's Rides]
    A --> C[My Profile]
    A --> D[My Ratings]
    A --> E[Availability Toggle]

    B --> B1[GET /driver/bookings<br/>?status=driver_assigned]
    B1 --> B2[Show Ride Cards<br/>Customer, Pickup, Drop, Time]

    C --> C1[GET /driver/me]
    C1 --> C2[Show Driver Profile<br/>License, Rating, Total Rides]

    D --> D1[GET /driver/ratings/my]
    D1 --> D2[Show Rating History<br/>Stars, Reviews from Customers]

    E --> E1[PUT /driver/availability<br/>isAvailable: true/false]
    E1 --> E2[Toggle On/Off]
```

---

## 4. Ride Execution Flow

```mermaid
stateDiagram-v2
    [*] --> DriverAssigned: Admin assigns ride
    DriverAssigned --> EnRoute: Driver starts navigation
    EnRoute --> PickedUp: Arrived at pickup
    PickedUp --> InProgress: Customer aboard
    InProgress --> StopReached: Intermediate stop
    StopReached --> InProgress: Continue ride
    InProgress --> Completed: Destination reached
    Completed --> [*]
```

```mermaid
sequenceDiagram
    participant D as Driver App
    participant API as Backend
    participant C as Customer App

    Note over D: Ride assigned by admin
    D->>API: GET /driver/bookings
    API-->>D: Show assigned rides

    D->>D: Tap "Start Ride"
    D->>API: PUT /driver/bookings/:id/status<br/>{status: "driver_en_route"}
    API-->>C: Notification: Driver on the way

    Note over D: GPS location updates
    loop Every 5 seconds
        D->>API: PUT /driver/location<br/>{latitude, longitude}
        API-->>C: WebSocket: driver position
    end

    D->>D: Arrived at pickup
    D->>API: PUT /driver/bookings/:id/status<br/>{status: "picked_up"}
    API-->>C: Notification: Driver arrived

    D->>D: Customer aboard
    D->>API: PUT /driver/bookings/:id/status<br/>{status: "in_progress"}

    Note over D: Drive to destination

    D->>D: Reached destination
    D->>API: PUT /driver/bookings/:id/status<br/>{status: "completed"}
    API-->>C: Notification: Ride completed
    API-->>C: Show rating prompt

    D->>API: POST /driver/ratings<br/>{bookingId, rating, review}
    Note over D: Rate customer
```

---

## 5. Location Update Flow

```mermaid
flowchart TD
    A[Ride Status: en_route / in_progress] --> B[Start Location Tracking]
    B --> C[navigator.geolocation.watchPosition]
    C --> D{Moved > 20m?}
    D -->|Yes| E[PUT /driver/location<br/>latitude, longitude]
    D -->|No| C
    E --> F[Backend updates<br/>driver.currentLocation]
    F --> G[Broadcast to<br/>booking WebSocket room]
    G --> H[Customer sees<br/>marker move on map]
    H --> C

    I[Screen Wake Lock<br/>navigator.wakeLock] --> C
```

### Location API
```
PUT /api/driver/location
{
  latitude: 22.7196,
  longitude: 75.8577
}
```

---

## 6. Availability Management

```mermaid
flowchart TD
    A[Driver Dashboard] --> B[Availability Toggle]
    B --> C{Current State?}
    C -->|Available| D[Toggle OFF]
    C -->|Unavailable| E[Toggle ON]

    D --> D1[PUT /driver/availability<br/>isAvailable: false]
    D1 --> D2[Won't be assigned<br/>new rides]

    E --> E1[PUT /driver/availability<br/>isAvailable: true]
    E1 --> E2[Can be assigned rides]
```

---

## 7. Rating Customers

```mermaid
flowchart TD
    A[Ride Completed] --> B[Rate Customer Prompt]
    B --> C[Select Stars 1-5]
    C --> D[Write Review optional]
    D --> E[POST /driver/ratings]
    E --> F{Success?}
    F -->|Yes| G[Rating Saved]
    F -->|No - Already rated| H[Already rated this booking]
    F -->|No - Not completed| I[Ride not finished yet]
```

---

## 8. Complete Driver Day Flow

```mermaid
flowchart LR
    A[Login] --> B[Set Available]
    B --> C[Check Assigned Rides]
    C --> D[Start Ride]
    D --> E[Navigate to Pickup]
    E --> F[Pick Up Customer]
    F --> G[Drive to Stops]
    G --> H[Complete Ride]
    H --> I[Rate Customer]
    I --> J[Check Next Ride]
    J --> C
    J --> K[Set Unavailable<br/>End Day]
```

---

## Driver API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /driver/auth/register | Register driver account |
| POST | /driver/auth/login | Driver login |
| GET | /driver/profile | Get user profile |
| PUT | /driver/profile | Update user profile |
| GET | /driver/me | Get driver profile (license, rating) |
| PUT | /driver/availability | Toggle availability |
| PUT | /driver/location | Update GPS coordinates |
| GET | /driver/bookings | List assigned bookings |
| GET | /driver/bookings/:id | Get booking detail |
| PUT | /driver/bookings/:id/status | Update ride status |
| POST | /driver/ratings | Rate customer |
| GET | /driver/ratings/my | View received ratings |
