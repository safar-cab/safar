# Books Car Rental -- Page Layouts & Wireframes

Version 1.0 | Mobile-First (375px) | All Pages

---

## CUSTOMER PAGES (PWA — Mobile-First, Installable)

> Customer app is a Progressive Web App. Installable from browser via "Add to Home Screen". Runs in standalone mode. Supports offline caching, push notifications, and Web 3.0 PWA features. See `07-pwa-platform-strategy.md` for details.

---

### 1. Landing / Home Page

**Route:** `/customer` or `/`

```
+------------------------------------------+  <- safe area top
| Books Car Rental              [bell] [av]|  <- top bar
+------------------------------------------+
|                                          |
| Good morning, Sourabh                    |  <- h3, greeting
| Where are you heading?                   |  <- body, muted
|                                          |
| +--------------------------------------+ |
| | [O] Search pickup location...        | |  <- search bar
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [pin] From: Mumbai                   | |
| | [pin] To:   Pune                     | |
| | [calendar] Date: Select date         | |
| |                                      | |
| | [        Search Cars        ]        | |  <- primary btn
| +--------------------------------------+ |  <- main search card
|                                          |
| Popular Routes                    See All|  <- section header
| +--------+ +--------+ +--------+        |
| |Mumbai  | |Delhi   | |Bangal- |        |
| |to Pune | |to Agra | |ore to  |        |
| |3h 150km| |3h 200km| |Mysore  |        |
| |Rs 2500 | |Rs 3000 | |2h 150km|        |
| +--------+ +--------+ +--------+        |  <- horizontal scroll
|                                          |
| Recent Bookings                   See All|
| +--------------------------------------+ |
| | [car] Mumbai to Pune                 | |
| | 15 Jan | Confirmed | Rs 3,500       | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [car] Delhi to Agra                  | |
| | 10 Jan | Completed | Rs 4,000       | |
| +--------------------------------------+ |
|                                          |
| Special Offers                           |
| +--------------------------------------+ |
| |  [Banner: 20% off first ride]        | |
| |  Use code: FIRST20                   | |
| +--------------------------------------+ |  <- horizontal carousel
|                                          |
|          [80px bottom spacer]            |  <- for bottom nav
+------------------------------------------+
| [Home*] [Bookings] [Track] [Profile]     |  <- bottom nav
+------------------------------------------+
```

**Layout Notes:**
- Page background: `#F8FAFC`
- Search card: white, shadow-md, radius-lg, 16px padding
- Popular routes: horizontal scroll with snap, 16px gap
- Recent bookings: vertical list, 12px gap
- Greeting uses time-of-day logic (morning/afternoon/evening)

---

### 2. Route Search Results

**Route:** `/customer/search?from=X&to=Y&date=Z`

```
+------------------------------------------+
| [<-]  Search Results          [filter]   |
+------------------------------------------+
| Mumbai to Pune | 15 Jan 2026             |  <- summary bar
| [Edit Search]                            |
+------------------------------------------+
|                                          |
| 12 cars available                        |  <- result count
|                                          |
| Sort: [Price v] [Rating] [Seats]         |  <- chip filters
|                                          |
| +--------------------------------------+ |
| | +----------------------------------+ | |
| | |      [Car Image]                 | | |
| | +----------------------------------+ | |
| | [AC] [4 Seater] [Petrol]           | | |
| | Swift Dzire                        | | |
| | or similar sedan                   | | |
| |                                    | | |
| | Rs 2,500          [Select ->]      | | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | +----------------------------------+ | |
| | |      [Car Image]                 | | |
| | +----------------------------------+ | |
| | [AC] [6 Seater] [Diesel]          | | |
| | Toyota Innova                      | | |
| | or similar MUV                     | | |
| |                                    | | |
| | Rs 4,500          [Select ->]      | | |
| +--------------------------------------+ |
|                                          |
|  ... more cards, infinite scroll ...     |
|                                          |
+------------------------------------------+
| [Home] [Bookings] [Track] [Profile]      |
+------------------------------------------+
```

**Layout Notes:**
- Sticky summary bar below top bar
- Cars in single-column list on mobile, 2-column grid on tablet+
- Filter chips horizontally scrollable
- Infinite scroll with skeleton loading

---

### 3. Car Selection Page

**Route:** `/customer/cars?route=X`

```
+------------------------------------------+
| [<-]  Choose Your Car                    |
+------------------------------------------+
|                                          |
| [Sedan] [SUV] [Hatchback] [MUV] [Luxury]|  <- category tabs
|                                          |
| +------------------+ +------------------+|
| |   [Car Image]    | |   [Car Image]    ||
| | [AC][4S][Petrol]  | | [AC][7S][Diesel] ||
| | Swift Dzire       | | Innova Crysta    ||
| | Rs 2,500/day      | | Rs 5,500/day     ||
| | [**** 4.5]        | | [**** 4.8]       ||
| | [Select]          | | [Select]         ||
| +------------------+ +------------------+|
|                                          |
| +------------------+ +------------------+|
| |   [Car Image]    | |   [Car Image]    ||
| | [AC][5S][Petrol]  | | [AC][5S][Diesel] ||
| | Honda City        | | Hyundai Creta    ||
| | Rs 3,500/day      | | Rs 4,000/day     ||
| | [**** 4.6]        | | [**** 4.7]       ||
| | [Select]          | | [Select]         ||
| +------------------+ +------------------+|
|                                          |
+------------------------------------------+
| [Home] [Bookings] [Track] [Profile]      |
+------------------------------------------+
```

**Layout Notes:**
- 2-column grid on mobile, 3 on tablet, 4 on desktop
- Category tabs: horizontally scrollable
- Card tap opens car detail bottom sheet

---

### 4. Booking Form (Multi-Step)

**Route:** `/customer/book`

#### Step 1: Pickup Location

```
+------------------------------------------+
| [<-]  Book a Ride                        |
+------------------------------------------+
| (1)=====(2)------(3)------(4)------(5)  |  <- step indicator
| Pickup   Drop    Details   Review   Pay  |
+------------------------------------------+
|                                          |
| Pickup Location                          |
|                                          |
| +--------------------------------------+ |
| | [O] Enter pickup address...          | |
| +--------------------------------------+ |
|                                          |
| [pin] Use current location              |  <- quick action
|                                          |
| Saved Locations                          |
| +--------------------------------------+ |
| | [home] Home                          | |
| | 123 MG Road, Andheri West, Mumbai    | |
| +--------------------------------------+ |
| | [work] Office                        | |
| | Tech Park, Whitefield, Bangalore     | |
| +--------------------------------------+ |
|                                          |
| Recent Locations                         |
| +--------------------------------------+ |
| | [clock] Mumbai Airport T2            | |
| +--------------------------------------+ |
| | [clock] Pune Station                 | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [        Continue        ]               |  <- sticky CTA
+------------------------------------------+
```

#### Step 2: Drop-off + Stops

```
+------------------------------------------+
| [<-]  Book a Ride                        |
+------------------------------------------+
| (1)=====(2)=====(3)------(4)------(5)   |
| Pickup   Drop   Details   Review   Pay   |
+------------------------------------------+
|                                          |
| Drop-off Location                        |
|                                          |
| +--------------------------------------+ |
| | [pin] Enter drop-off address...      | |
| +--------------------------------------+ |
|                                          |
| Add Stops (Optional)                     |
|                                          |
| +--------------------------------------+ |
| | [1] Stop: Lonavala               [x] | |
| +--------------------------------------+ |
| [+ Add another stop]                    |
|                                          |
| Trip Type                                |
| +------------------+ +------------------+|
| | [  One Way   ]   | | [ Round Trip ]   ||
| |   selected       | |                  ||
| +------------------+ +------------------+|
|                                          |
+------------------------------------------+
| [        Continue        ]               |
+------------------------------------------+
```

#### Step 3: Date & Time

```
+------------------------------------------+
| [<-]  Book a Ride                        |
+------------------------------------------+
| (1)=====(2)=====(3)=====(4)------(5)    |
| Pickup   Drop   Details  Review   Pay    |
+------------------------------------------+
|                                          |
| Pickup Date                              |
| +--------------------------------------+ |
| | [cal] Mon, 15 Jan 2026              | |
| +--------------------------------------+ |
|                                          |
| Pickup Time                              |
| +--------------------------------------+ |
| | [clock] 09:00 AM                     | |
| +--------------------------------------+ |
|                                          |
| Return Date (if round trip)              |
| +--------------------------------------+ |
| | [cal] Wed, 17 Jan 2026              | |
| +--------------------------------------+ |
|                                          |
| Select Car                               |
| +--------------------------------------+ |
| | [img] Swift Dzire  |  Rs 2,500/day  | |
| |       [Change Car]                   | |
| +--------------------------------------+ |
|                                          |
| Special Requests                         |
| +--------------------------------------+ |
| | [textarea: Any special requests...]  | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [        Continue        ]               |
+------------------------------------------+
```

#### Step 4: Review

```
+------------------------------------------+
| [<-]  Review Booking                     |
+------------------------------------------+
| (1)=====(2)=====(3)=====(4)=====(5)     |
| Pickup   Drop   Details  Review*  Pay    |
+------------------------------------------+
|                                          |
| Route                            [edit]  |
| +--------------------------------------+ |
| | [O] Mumbai, MG Road                 | |
| | |                                    | |
| | [+] Lonavala (stop)                  | |
| | |                                    | |
| | [V] Pune, Shivaji Nagar             | |
| +--------------------------------------+ |
|                                          |
| Schedule                         [edit]  |
| +--------------------------------------+ |
| | Pickup: Mon, 15 Jan, 09:00 AM       | |
| | Return: Wed, 17 Jan                  | |
| | Duration: 3 days                     | |
| +--------------------------------------+ |
|                                          |
| Vehicle                          [edit]  |
| +--------------------------------------+ |
| | Swift Dzire | Sedan | AC | 4 Seater | |
| +--------------------------------------+ |
|                                          |
| Fare Breakdown                           |
| +--------------------------------------+ |
| | Base fare (3 days x Rs 2,500)  7,500 | |
| | Extra stops (1)                  200 | |
| | GST (5%)                         385 | |
| | ------------------------------------ | |
| | Total                       Rs 8,085 | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [checkbox] I agree to the Terms &    | |
| | Conditions and Cancellation Policy   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [     Proceed to Pay Rs 8,085     ]      |
+------------------------------------------+
```

#### Step 5: Payment

```
+------------------------------------------+
| [<-]  Payment                            |
+------------------------------------------+
| (1)=====(2)=====(3)=====(4)=====(5)     |
| Pickup   Drop   Details  Review  Pay*    |
+------------------------------------------+
|                                          |
| Pay Rs 8,085                             |  <- h2
|                                          |
| Payment Method                           |
|                                          |
| +--------------------------------------+ |
| | (o) UPI                      [icon]  | |
| +--------------------------------------+ |
| | ( ) Credit/Debit Card        [icon]  | |
| +--------------------------------------+ |
| | ( ) Net Banking              [icon]  | |
| +--------------------------------------+ |
| | ( ) Pay Later                [icon]  | |
| +--------------------------------------+ |
|                                          |
| [Razorpay secure badge]                 |
|                                          |
| You will be redirected to Razorpay       |
| secure checkout                          |
|                                          |
+------------------------------------------+
| [       Pay Rs 8,085       ]             |
+------------------------------------------+
```

---

### 5. Booking Detail

**Route:** `/customer/bookings/:id`

```
+------------------------------------------+
| [<-]  Booking #BCR-1234      [share]     |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| |  [Confirmed]  Booking confirmed       | |
| +--------------------------------------+ |
|                                          |
| Status Timeline                          |
| +--------------------------------------+ |
| | [*] Booking placed     10:00 AM      | |
| | |                      15 Jan        | |
| | [*] Confirmed          10:05 AM      | |
| | |                                    | |
| | [ ] Driver assigned    --            | |
| | |                                    | |
| | [ ] Ride started       --            | |
| | |                                    | |
| | [ ] Ride completed     --            | |
| +--------------------------------------+ |
|                                          |
| Route                                    |
| +--------------------------------------+ |
| | [O] Mumbai, MG Road                 | |
| | |                                    | |
| | [+] Lonavala                         | |
| | |                                    | |
| | [V] Pune, Shivaji Nagar             | |
| |                                      | |
| | [View on Map]                        | |
| +--------------------------------------+ |
|                                          |
| Schedule                                 |
| +--------------------------------------+ |
| | Mon, 15 Jan 2026 | 09:00 AM         | |
| | 3 days trip | Return: 17 Jan         | |
| +--------------------------------------+ |
|                                          |
| Vehicle                                  |
| +--------------------------------------+ |
| | [img] Swift Dzire                    | |
| |       White | MH 12 AB 1234         | |
| |       Sedan | AC | 4 Seater         | |
| +--------------------------------------+ |
|                                          |
| Driver (shown when assigned)             |
| +--------------------------------------+ |
| | [avatar] Rajesh Kumar                | |
| |          4.8 [star] | 234 rides      | |
| |          [Call]  [Message]           | |
| +--------------------------------------+ |
|                                          |
| Payment                                  |
| +--------------------------------------+ |
| | Total: Rs 8,085                      | |
| | Paid via UPI | Txn: RZP123456       | |
| | [Download Invoice]                   | |
| +--------------------------------------+ |
|                                          |
| [Cancel Booking]                         |  <- danger ghost btn
|                                          |
+------------------------------------------+
| [Home] [Bookings] [Track] [Profile]      |
+------------------------------------------+
```

---

### 6. My Bookings

**Route:** `/customer/bookings`

```
+------------------------------------------+
| Bookings                                 |
+------------------------------------------+
| [Upcoming*] [Past] [Cancelled]           |  <- tab bar
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | #BCR-1234          [Confirmed]       | |
| | [O] Mumbai --> [V] Pune              | |
| | Mon 15 Jan | 09:00 | Swift Dzire     | |
| | ------------------------------------ | |
| | Rs 8,085            [View ->]        | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | #BCR-1235          [Pending]         | |
| | [O] Delhi --> [V] Agra              | |
| | Wed 17 Jan | 10:00 | Honda City      | |
| | ------------------------------------ | |
| | Rs 5,200            [View ->]        | |
| +--------------------------------------+ |
|                                          |
|  ... more bookings ...                   |
|                                          |
| [empty state if no bookings in tab]      |
|                                          |
+------------------------------------------+
| [Home] [Bookings*] [Track] [Profile]     |
+------------------------------------------+
```

**Layout Notes:**
- Tabs: full-width, underline active indicator
- Each booking card has left border color by status
- Swipe left to cancel (upcoming only)
- Pull-to-refresh enabled

---

### 7. Live Tracking

**Route:** `/customer/track/:bookingId`

```
+------------------------------------------+
| [<-]  Live Tracking                      |
+------------------------------------------+
|                                          |
|                                          |
|                                          |
|           [FULL SCREEN MAP]              |
|      [car marker moving on route]        |
|     [pickup pin] .... [drop pin]         |
|                                          |
|                                          |
|                                          |
|              [Recenter]                  |  <- FAB
|                                          |
+------------------------------------------+  <- bottom sheet
|            [drag handle]                 |
| +--------------------------------------+ |
| | [avatar] Rajesh Kumar    [Call][Msg]  | |
| | Swift Dzire | MH 12 AB 1234          | |
| +--------------------------------------+ |
| | ETA: 15 min | 5.2 km away            | |
| +--------------------------------------+ |
| | [O] Mumbai, MG Road     10:00 AM     | |
| | |   (driver on the way)              | |
| | [V] Pune, Shivaji Nagar  --:--       | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Layout Notes:**
- Map takes full viewport behind top bar
- Bottom sheet with 2 snap points: collapsed (driver info) and expanded (full detail)
- Car marker animates along route path
- ETA updates in real time
- Recenter FAB: 56px circle, white, shadow-md, bottom-right above sheet

---

### 8. Payment (Razorpay UPI)

**Route:** `/customer/payment/:bookingId`

```
+------------------------------------------+
| [<-]  Payment                            |
+------------------------------------------+
|                                          |
| Booking #BCR-1234                        |
|                                          |
| +--------------------------------------+ |
| | Mumbai to Pune                       | |
| | Mon, 15 Jan | Swift Dzire            | |
| +--------------------------------------+ |
|                                          |
| Amount: Rs 8,085                         |  <- h2, bold
|                                          |
| +--------------------------------------+ |
| | Fare Breakdown               [v/^]   | |  <- collapsible
| | Base fare               Rs 7,500     | |
| | Extra stops                  200     | |
| | GST (5%)                     385     | |
| +--------------------------------------+ |
|                                          |
| Apply Coupon                             |
| +-----------------------------------+-+ |
| | [Enter coupon code]               |Go| |
| +-----------------------------------+-+ |
| [FIRST20 applied! -Rs 1,617]            |
|                                          |
| +--------------------------------------+ |
| | You Pay                   Rs 6,468   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [       Pay with Razorpay       ]        |  <- opens Razorpay
+------------------------------------------+
```

**After payment success:**
```
+------------------------------------------+
|                                          |
|           [check animation]              |
|                                          |
|       Payment Successful!                |
|                                          |
|       Rs 6,468 paid via UPI              |
|       Txn: RZP123456789                  |
|                                          |
|  Your booking #BCR-1234 is confirmed     |
|                                          |
|  [View Booking]     [Back to Home]       |
|                                          |
+------------------------------------------+
```

---

### 9. Rating & Review

**Route:** `/customer/rate/:bookingId`

```
+------------------------------------------+
| [<-]  Rate Your Ride                     |
+------------------------------------------+
|                                          |
|    +--------+                            |
|    | [avatar]|                            |
|    +--------+                            |
|    Rajesh Kumar                          |
|    Swift Dzire | Mumbai to Pune           |
|                                          |
|    How was your ride?                    |
|                                          |
|    [*] [*] [*] [*] [.]                  |  <- tap stars
|         Tap to rate                      |
|                                          |
| Write a review (optional)                |
| +--------------------------------------+ |
| | [textarea: Share your experience...] | |
| |                                      | |
| |                           0/500      | |
| +--------------------------------------+ |
|                                          |
| Quick feedback                           |
| [Clean car] [On time] [Good driver]     |
| [Comfortable] [Safe driving]            |  <- toggle chips
|                                          |
+------------------------------------------+
| [        Submit Review        ]          |
+------------------------------------------+
```

---

### 10. Profile

**Route:** `/customer/profile`

```
+------------------------------------------+
| Profile                          [edit]  |
+------------------------------------------+
|                                          |
|        +----------+                      |
|        |  [avatar] |                     |
|        | [camera]  |                     |
|        +----------+                      |
|        Sourabh Sen                       |
|        +91 98765 43210                   |
|        sourabh@email.com                 |
|                                          |
| +--------------------------------------+ |
| | [user]    Personal Info          [>] | |
| +--------------------------------------+ |
| | [mappin]  Saved Addresses        [>] | |
| +--------------------------------------+ |
| | [credit]  Payment Methods        [>] | |
| +--------------------------------------+ |
| | [bell]    Notifications          [>] | |
| +--------------------------------------+ |
| | [shield]  Privacy & Security     [>] | |
| +--------------------------------------+ |
| | [help]    Help & Support         [>] | |
| +--------------------------------------+ |
| | [file]    Terms & Conditions     [>] | |
| +--------------------------------------+ |
| | [info]    About                   [>] | |
| +--------------------------------------+ |
|                                          |
| [Logout]                                 |  <- ghost danger
|                                          |
| Version 1.0.0                            |
|                                          |
+------------------------------------------+
| [Home] [Bookings] [Track] [Profile*]     |
+------------------------------------------+
```

---

## DRIVER PAGES (PWA — Mobile-First, Installable)

> Driver app is a PWA with separate manifest (Books Driver). Uses Wake Lock API for screen-on during rides, Geolocation API for GPS tracking. Installable from browser.

---

### 11. Driver Dashboard

**Route:** `/driver`

```
+------------------------------------------+
| Books Driver              [bell] [avatar]|
+------------------------------------------+
|                                          |
| Good morning, Rajesh                     |
|                                          |
| +------------------+ +------------------+|
| | Today's Rides    | | Earnings         ||
| |     3            | |   Rs 4,500       ||
| | +1 from yest.    | |   +12% this week ||
| +------------------+ +------------------+|
| +------------------+ +------------------+|
| | Rating           | | Total Rides      ||
| |     4.8          | |     234          ||
| | [*****]          | |   this month     ||
| +------------------+ +------------------+|
|                                          |
| Today's Schedule                         |
|                                          |
| +--------------------------------------+ |
| | 09:00 AM                 [In 30 min] | |
| | Mumbai to Pune                       | |
| | Sourabh Sen | Swift Dzire            | |
| | [Start Ride]                         | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | 02:00 PM                             | |
| | Pune to Mumbai (return)              | |
| | Amit Kumar | Swift Dzire             | |
| | [View Details]                       | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | 06:00 PM                             | |
| | Mumbai to Lonavala                   | |
| | Priya Sharma | Honda City            | |
| | [View Details]                       | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [Dashboard*] [Rides] [Nav] [Profile]     |
+------------------------------------------+
```

---

### 12. Driver Ride Detail

**Route:** `/driver/rides/:id`

```
+------------------------------------------+
| [<-]  Ride #BCR-1234                     |
+------------------------------------------+
|                                          |
| [Confirmed]                              |
|                                          |
| Customer                                 |
| +--------------------------------------+ |
| | [avatar] Sourabh Sen                 | |
| |          +91 98765 43210             | |
| |          [Call]  [Message]           | |
| +--------------------------------------+ |
|                                          |
| Route                                    |
| +--------------------------------------+ |
| | [O] Mumbai, MG Road                 | |
| | |                                    | |
| | [+] Lonavala (stop)                  | |
| | |                                    | |
| | [V] Pune, Shivaji Nagar             | |
| |                                      | |
| | 150 km | ~3h 30m                     | |
| +--------------------------------------+ |
|                                          |
| Schedule                                 |
| +--------------------------------------+ |
| | Pickup: Mon, 15 Jan, 09:00 AM       | |
| | Duration: 3 days                     | |
| +--------------------------------------+ |
|                                          |
| Vehicle: Swift Dzire | MH 12 AB 1234    |
|                                          |
| Earnings: Rs 1,800                       |
|                                          |
+------------------------------------------+
| [        Start Ride        ]             |  <- status CTA
+------------------------------------------+
```

**Status CTA changes:**
- Before pickup: `Start Ride` (primary)
- During ride: `Complete Ride` (success green)
- At stop: `Resume Ride` (primary)

---

### 13. Driver Navigation View

**Route:** `/driver/navigate/:rideId`

```
+------------------------------------------+
|                                          |
|                                          |
|           [FULL SCREEN MAP]              |
|      [turn-by-turn directions]           |
|      [route line highlighted]            |
|                                          |
|                                          |
| +--------------------------------------+ |
| | Turn right on MG Road     | 200m     | |
| +--------------------------------------+ |  <- direction banner
|                                          |
+------------------------------------------+
|            [drag handle]                 |
| Next stop: Lonavala         45 min      |
| Total remaining: 120 km    2h 15m       |
| ----------------------------------------|
| [O] Mumbai (started)        09:00 AM   |
| [+] Lonavala                10:15 AM   |
| [V] Pune                    12:30 PM   |
| ----------------------------------------|
| [     End Navigation     ]              |
+------------------------------------------+
```

---

### 14. Driver Profile & Documents

**Route:** `/driver/profile`

```
+------------------------------------------+
| Profile                                  |
+------------------------------------------+
|                                          |
|        +----------+                      |
|        |  [avatar] |                     |
|        +----------+                      |
|        Rajesh Kumar                      |
|        Driver ID: DRV-0042              |
|        4.8 [star] | 234 rides            |
|                                          |
| +--------------------------------------+ |
| | [user]    Personal Info          [>] | |
| +--------------------------------------+ |
| | [car]     Vehicle Details        [>] | |
| +--------------------------------------+ |
| | [file]    Documents              [>] | |
| |           DL, RC, Insurance          | |
| |           [Verified] / [Pending]     | |
| +--------------------------------------+ |
| | [dollar]  Earnings History       [>] | |
| +--------------------------------------+ |
| | [star]    Ratings & Reviews      [>] | |
| +--------------------------------------+ |
| | [settings] Settings              [>] | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | Availability                         | |
| | [=====O        ] Online              | |  <- toggle
| +--------------------------------------+ |
|                                          |
| [Logout]                                 |
|                                          |
+------------------------------------------+
| [Dashboard] [Rides] [Nav] [Profile*]     |
+------------------------------------------+
```

---

## ADMIN PAGES (Web-Only — Desktop-First)

> Admin dashboard is a standard web application, NOT a PWA. Desktop-first design with responsive support down to tablet (768px). No service worker, no install prompt, no offline mode. Shows "Desktop Recommended" warning on mobile screens.

---

### 15. Admin Dashboard

**Route:** `/admin`

```
+------------------------------------------+
| [=] Books Admin        [bell] [avatar]   |  <- hamburger menu
+------------------------------------------+
| +------+ +------+ +------+ +------+     |
| |Total | |Active| |Revenue| |Drivers|   |
| |Books | |Rides | |Today | |Online|     |
| | 1,234| |  28  | |Rs 45k| |  12  |    |
| |+12%  | |+5%   | |+8%   | |-2    |    |
| +------+ +------+ +------+ +------+     |
|                                          |
| Revenue (Last 7 Days)                    |
| +--------------------------------------+ |
| |  [LINE CHART]                        | |
| |  ^                                   | |
| |  |    /\      /\                     | |
| |  |   /  \    /  \   /               | |
| |  |  /    \  /    \ /                 | |
| |  | /      \/      \                  | |
| |  +--+--+--+--+--+--+-->             | |
| |  M  T  W  T  F  S  S               | |
| +--------------------------------------+ |
|                                          |
| Bookings by Status                       |
| +--------------------------------------+ |
| |  [DONUT CHART]                       | |
| |  Confirmed: 45%  In Progress: 20%   | |
| |  Completed: 25%  Cancelled: 10%     | |
| +--------------------------------------+ |
|                                          |
| Recent Bookings                   See All|
| +--------------------------------------+ |
| | BCR-1234 | Mumbai>Pune | Confirmed   | |
| | BCR-1235 | Delhi>Agra  | Pending     | |
| | BCR-1236 | BLR>Mysore  | In Progress | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

**Admin uses sidebar navigation on desktop:**
```
+--------+------------------------------------------+
|        |                                          |
| [logo] |  Main content area                      |
|        |                                          |
| Dash   |                                          |
| Books* |                                          |
| Cars   |                                          |
| Drivers|                                          |
| Users  |                                          |
| Pay    |                                          |
| Routes |                                          |
| Settngs|                                          |
|        |                                          |
|        |                                          |
| [out]  |                                          |
+--------+------------------------------------------+
```

Sidebar: 240px wide, white background, collapsible to 64px (icons only).

---

### 16. Admin -- Cars Management

**Route:** `/admin/cars`

```
+------------------------------------------+
| [=]  Cars                     [+ Add Car]|
+------------------------------------------+
| [Search cars...]  [Filter v] [Sort v]    |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | Model        | Type | Status | Action| |
| |--------------|------|--------|-------| |
| | Swift Dzire  |Sedan |Active  | [...] | |
| | Honda City   |Sedan |Active  | [...] | |
| | Innova       |MUV   |Maint.  | [...] | |
| | Creta        |SUV   |Active  | [...] | |
| +--------------------------------------+ |
|                                          |
| Showing 1-10 of 45    [< 1 2 3 4 5 >]  |
+------------------------------------------+
```

**Add/Edit Car Form (modal or separate page):**
```
+------------------------------------------+
| [<-]  Add New Car                        |
+------------------------------------------+
|                                          |
| Car Photos                               |
| +------+ +------+ +------+ +------+     |
| | [+]  | | [img] | | [img] |             |
| | Add  | |       | |       |             |
| +------+ +------+ +------+              |
|                                          |
| Model Name *                             |
| [Swift Dzire                           ] |
|                                          |
| Type *                                   |
| [Sedan v]                                |
|                                          |
| Seats *          | Fuel Type *           |
| [4           ]   | [Petrol v]           |
|                                          |
| AC    [toggle: on]                       |
|                                          |
| Registration Number *                    |
| [MH 12 AB 1234                         ] |
|                                          |
| Daily Rate (Rs) *                        |
| [2500                                  ] |
|                                          |
| Per KM Rate (Rs) *                       |
| [12                                    ] |
|                                          |
| Status *                                 |
| [Active v]                               |
|                                          |
+------------------------------------------+
| [Save Car]                               |
+------------------------------------------+
```

---

### 17. Admin -- Drivers Management

**Route:** `/admin/drivers`

```
+------------------------------------------+
| [=]  Drivers                [+ Add Driver]|
+------------------------------------------+
| [Search...]  [Status: All v] [Verified v]|
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | [av] Rajesh Kumar                    | |
| |      4.8 star | 234 rides | Online   | |
| |      Swift Dzire | Verified [check]  | |
| |      [View] [Edit] [Disable]         | |
| +--------------------------------------+ |
| | [av] Amit Patel                      | |
| |      4.5 star | 120 rides | Offline  | |
| |      Honda City | Pending [clock]    | |
| |      [View] [Edit] [Verify]          | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

---

### 18. Admin -- Users List

**Route:** `/admin/users`

```
+------------------------------------------+
| [=]  Users                               |
+------------------------------------------+
| [Search by name, phone, email...]        |
| [Role: All v] [Status: All v]           |
+------------------------------------------+
|                                          |
| 1,234 users                             |
|                                          |
| +--------------------------------------+ |
| | Name     | Phone    | Bookings |  Act| |
| |----------|----------|----------|-----| |
| | Sourabh  | 98765... |    12    | [...] |
| | Priya S  | 87654... |     5    | [...] |
| | Amit K   | 76543... |     8    | [...] |
| +--------------------------------------+ |
|                                          |
| [< 1 2 3 ... 10 >]                      |
+------------------------------------------+
```

---

### 19. Admin -- Bookings Management

**Route:** `/admin/bookings`

```
+------------------------------------------+
| [=]  Bookings                            |
+------------------------------------------+
| [Search ID, customer...]                 |
| [Status: All v] [Date Range] [Sort v]   |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | #BCR-1234 | Sourabh | Mumbai>Pune   | |
| | 15 Jan    | [Confirmed] | Rs 8,085   | |
| | Driver: Rajesh K        [View] [->]  | |
| +--------------------------------------+ |
| | #BCR-1235 | Priya   | Delhi>Agra    | |
| | 17 Jan    | [Pending]   | Rs 5,200   | |
| | Driver: --              [Assign][->] | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

**Booking Detail (Admin view) adds:**
- Assign driver button (opens driver selection sheet)
- Change status dropdown
- Issue refund button
- Internal notes section
- Activity log (all status changes with timestamps)

---

### 20. Admin -- Payments

**Route:** `/admin/payments`

```
+------------------------------------------+
| [=]  Payments                            |
+------------------------------------------+
| [Search txn ID...]  [Status v] [Date]   |
+------------------------------------------+
| Total collected: Rs 4,50,000 (this month)|
|                                          |
| +--------------------------------------+ |
| | Txn ID    | Booking | Amount | Status| |
| |-----------|---------|--------|-------| |
| | RZP123... | BCR-1234| 8,085  | Paid  | |
| | RZP124... | BCR-1235| 5,200  | Pend. | |
| | RZP125... | BCR-1230| 3,500  | Refund| |
| +--------------------------------------+ |
|                                          |
| [< 1 2 3 >]                             |
+------------------------------------------+
```

**Refund action:** Opens confirmation modal with amount field and reason textarea.

---

### 21. Admin -- Routes Management

**Route:** `/admin/routes`

```
+------------------------------------------+
| [=]  Routes                 [+ Add Route]|
+------------------------------------------+
| [Search routes...]                       |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | From     | To      | Dist | Rate |Act| |
| |----------|---------|------|------|---| |
| | Mumbai   | Pune    | 150km| 2500 |[.]| |
| | Delhi    | Agra    | 200km| 3000 |[.]| |
| | BLR      | Mysore  | 150km| 2500 |[.]| |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

**Add/Edit Route Form:**
- From city (searchable dropdown)
- To city (searchable dropdown)
- Distance (km)
- Estimated duration
- Base rate (Rs)
- Per km rate
- Popular toggle
- Active toggle

---

### 22. Admin -- Settings

**Route:** `/admin/settings`

```
+------------------------------------------+
| [=]  Settings                            |
+------------------------------------------+
|                                          |
| General                                  |
| +--------------------------------------+ |
| | App Name         | Books Car Rental  | |
| | Support Phone    | +91 1800 XXX XXX | |
| | Support Email    | help@books.com    | |
| +--------------------------------------+ |
|                                          |
| Pricing                                  |
| +--------------------------------------+ |
| | GST Rate (%)     | 5                 | |
| | Min Booking (Rs)  | 500              | |
| | Cancellation Fee  | 10%              | |
| +--------------------------------------+ |
|                                          |
| Notifications                            |
| +--------------------------------------+ |
| | Email notif.     [toggle: on]        | |
| | SMS notif.       [toggle: on]        | |
| | Push notif.      [toggle: on]        | |
| +--------------------------------------+ |
|                                          |
| Integrations                             |
| +--------------------------------------+ |
| | Razorpay         [Connected]         | |
| | Google Maps      [Connected]         | |
| | SMS Gateway      [Configure ->]      | |
| +--------------------------------------+ |
|                                          |
| [Save Changes]                           |
|                                          |
+------------------------------------------+
```

---

## Responsive Behavior Summary

| Page                | Mobile (375px)         | Tablet (768px)         | Desktop (1024px+)        |
|---------------------|------------------------|------------------------|--------------------------|
| Home                | Single column          | 2-col routes           | 3-col routes, wider search |
| Search results      | Single column cards    | 2-col grid             | 3-col grid               |
| Car selection       | 2-col grid             | 3-col grid             | 4-col grid               |
| Booking form        | Full width steps       | Centered 600px max     | Centered 600px max       |
| Booking detail      | Full width             | Centered 700px max     | 2-col (info + timeline)  |
| My Bookings         | Full width list        | Full width list        | Table view               |
| Live tracking       | Full map + sheet       | Map + side panel       | Map + side panel         |
| Admin dashboard     | 2-col stats, stacked   | 4-col stats            | 4-col stats + sidebar    |
| Admin tables        | Card layout (mobile)   | Table view             | Table with sidebar       |
