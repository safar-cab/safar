# User Flow & UX

## Role-Based Views (Same Web App)

| Role | Access |
|------|--------|
| **Guest** | Landing page, search routes, view pricing |
| **User** | Book rides, track, pay, rate, profile |
| **Driver** | View assigned rides, navigate, update status |
| **Admin** | Full dashboard: cars, drivers, users, bookings, settings |

## User Journey Map

### Discovery → First Booking
```
Visit website → See pricing/routes → Register (phone OTP) →
Search route (from/to/date) → See available cars →
Select car + view docs → Add stops (optional) →
Review pricing → Pay via UPI → Booking confirmed →
Get SMS + push notification → Track driver on ride day
```

## Core User Flows

### Flow 1: User Registration
```
Phone number → OTP verification → Name + Email →
Profile photo (optional) → Dashboard
```

### Flow 2: Booking a Ride
```
1. Enter pickup location
2. Enter drop location
3. Add intermediate stops (optional, drag to reorder)
4. Select date + time (calendar shows availability)
5. See available cars (with photos, type, driver rating)
6. Select car
7. View price breakdown (base + per-km + tolls)
8. Choose refund policy type (shown per route config)
9. Pay via UPI (Razorpay checkout)
10. Booking confirmed → Notification sent
```

### Flow 3: Ride Day
```
User gets reminder notification (1 day before, 2 hours before) →
Driver starts ride → User sees live GPS on map →
Driver reaches pickup → User notified →
Ride in progress (live tracking) →
Intermediate stop reached → Both notified →
Destination reached → Ride completed →
Rating prompt → Both rate each other →
Receipt sent via email + SMS
```

### Flow 4: Cancellation
```
User opens booking → Cancel ride →
See refund policy (full/partial/none based on timing) →
Confirm cancellation → Refund initiated →
Notification: "Booking cancelled, refund of ₹X in 3-5 days"
```

### Flow 5: Ride Extension
```
During ride → User requests extension →
Enter new destination or extra hours →
See additional charges →
Pay extra via UPI → Ride extended →
Driver notified of new route
```

### Flow 6: Driver Workflow
```
Login → See assigned rides (today/upcoming) →
Accept/acknowledge ride → Navigate to pickup →
Update status: "On the way" → "Reached pickup" →
"Ride started" → "At stop 1" → "Ride completed" →
Rate user
```

### Flow 7: Admin Workflow
```
Dashboard overview (today's bookings, revenue, active rides) →
Manage cars (add/edit/deactivate with documents) →
Manage drivers (add/edit/block with documents) →
Manage users (view/block/deactivate) →
Manage bookings (view all, resolve disputes) →
Settings (pricing per km, refund policies, company branding)
```

## Key Screens/Pages

### Public Pages
1. **Landing page** — Hero, search, features, testimonials
2. **Route search results** — Available dates, cars, pricing
3. **About / Contact** — Company info, phone number

### User Pages
4. **Dashboard** — Upcoming rides, past rides, quick book
5. **Book a ride** — Multi-step booking form
6. **Ride tracking** — Live map, driver info, ETA
7. **My bookings** — List with status filters
8. **Booking detail** — Full info, cancel/extend options
9. **Profile** — Edit info, payment history
10. **Ratings** — Given and received ratings

### Driver Pages
11. **Driver dashboard** — Today's rides, upcoming
12. **Ride detail** — Pickup/drop, route, user info
13. **Navigation view** — Map with route
14. **Ride status updater** — Status toggle buttons

### Admin Pages
15. **Admin dashboard** — Stats, charts, alerts
16. **Cars management** — CRUD + document upload
17. **Drivers management** — CRUD + document upload + assignment
18. **Users management** — List, search, block/unblock
19. **Bookings management** — All bookings, filters, dispute resolution
20. **Payments** — Transaction log, refunds
21. **Notifications center** — Send manual notifications
22. **Settings** — Pricing, refund policies, branding, company info
23. **Reports** — Revenue, rides, driver performance

## Onboarding Flow (First-Time User)
1. Welcome screen with app features
2. Phone verification (OTP)
3. Basic profile (name, email)
4. Quick tutorial (3 slides: search → book → track)
5. First booking CTA

## PWA Install Prompt
- Show after 2nd visit or after first booking
- "Add to Home Screen" banner
- Custom install button in header
