# Post-MVP Fixes & Enhancements

Applied after all 5 MVP phases were completed.

## Changes Made

### 1. Document Queue Filter UI Fix
- Replaced plain `<select>` with app's `<Select>` component for consistency
- Matches dropdown style used across admin panel

### 2. Seed Data — Documents (30 records)
- 18 driver documents (6 drivers x 3 doc types)
- 12 car documents (4 cars x 3 doc types)
- Mix of statuses: pending, verified, rejected, expired
- Realistic doc numbers and expiry dates

### 3. Seed Data — Notifications (40 records)
- 15 customer notifications (booking confirmations, ride updates, cancellations)
- 15 driver notifications (ride assignments, document status, ratings)
- 10 admin notifications (new bookings, payments, document alerts, revenue)
- Mix of read/unread states

### 4. Admin Live Rides — Google Maps Integration
- Click on ride card opens side panel with map + full details
- Google Maps Static API integration (with `VITE_GOOGLE_MAPS_KEY`)
- Fallback: coordinate display + "Open in Google Maps" link
- Split layout: ride list (left) + map panel (right)
- Driver + customer contact info with phone links

### 5. States & Cities Management (New Feature)

#### Backend
- **Schema:** `geo.schema.ts` — State (name, code, isActive) + City (name, state ref, isActive)
- **Module:** `locations/` — LocationsService, Controllers (public + admin)
- **API Endpoints:**
  - `GET /api/locations/states` — public active states
  - `GET /api/locations/states/:id/cities` — public active cities
  - `GET /admin/locations/states` — all states (admin)
  - `POST /admin/locations/states` — create state
  - `PUT /admin/locations/states/:id/toggle` — enable/disable (cascades to cities)
  - `DELETE /admin/locations/states/:id` — delete (only if no cities)
  - `GET /admin/locations/cities` — all cities
  - `POST /admin/locations/cities` — create city
  - `PUT /admin/locations/cities/:id/toggle` — enable/disable
  - `DELETE /admin/locations/cities/:id` — delete
  - `PUT /admin/locations/routes/:id/toggle` — enable/disable route

#### Frontend
- **Page:** `StatesAndCities.tsx` — expandable state cards with nested city list
- **Features:**
  - Add/delete states with code
  - Add/delete cities per state
  - Toggle enable/disable for states (cascades to cities) and individual cities
  - Stats cards (total/active counts)
  - Admin sidebar nav item "States & Cities"

#### Seed Data
- 5 states: MP, RJ, GJ, MH, UP (UP disabled)
- 27 cities across states
- UP cities auto-disabled with state

### Files Changed
- `frontend/src/pages/admin/documents/DocumentQueue.tsx` — Select component
- `frontend/src/pages/admin/tracking/LiveRides.tsx` — map + details panel
- `frontend/src/pages/admin/locations/StatesAndCities.tsx` — new
- `frontend/src/layouts/AdminLayout.tsx` — nav items
- `frontend/src/router.tsx` — routes
- `backend/src/schemas/geo.schema.ts` — new
- `backend/src/locations/` — new module
- `backend/src/seed.ts` — documents, notifications, states, cities
- `backend/src/app.module.ts` — LocationsModule
