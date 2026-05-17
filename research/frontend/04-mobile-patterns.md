# Books Car Rental -- Mobile-First UX Patterns

Version 1.0 | Target: iOS & Android PWA | Min viewport: 375px

---

## 1. Touch Targets

All interactive elements must meet minimum touch target requirements.

| Element              | Min Size  | Recommended | Notes                          |
|----------------------|-----------|-------------|--------------------------------|
| Buttons              | 44px      | 48px        | Height and width               |
| Icon buttons         | 44px      | 44px        | Padding around 24px icon       |
| List items           | 48px      | 56px        | Full row is tappable           |
| Tab bar items        | 48px      | 64px        | Full tab width tappable        |
| Chips/tags           | 32px      | 36px        | With adequate spacing          |
| Checkboxes           | 44px      | 44px        | Visual size 20px, hit area 44px|
| Toggle switches      | 44px      | 48px        | Track + thumb area             |
| Links in text        | 44px      | --          | Vertical padding for hit area  |

### Spacing Between Touch Targets

- Minimum 8px gap between adjacent tappable elements
- Recommended 12px gap in dense layouts (admin tables, filter chips)

```css
/* Example: ensuring touch target with padding */
.icon-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px; /* (44 - 24) / 2 = 10px padding around 24px icon */
  border-radius: 50%;
  -webkit-tap-highlight-color: transparent;
}
```

---

## 2. Gesture Navigation

### Swipe Back (iOS-style)

```
  <-- swipe from left edge
+--[current page slides right]--+
|  [previous page peeks from left]
+-------------------------------+
```

| Property             | Value                               |
|----------------------|--------------------------------------|
| Trigger zone         | 20px from left edge                  |
| Threshold            | 30% of screen width to complete      |
| Animation            | Spring easing, 350ms                 |
| Velocity threshold   | 500px/s for quick swipe              |
| Visual feedback      | Current page slides right with shadow on left edge |
| Cancel behavior      | If below threshold, snap back        |

```typescript
// React implementation concept
const SWIPE_THRESHOLD = window.innerWidth * 0.3;
const EDGE_ZONE = 20; // px from left edge
```

### Pull-to-Refresh

| Property             | Value                               |
|----------------------|--------------------------------------|
| Trigger distance     | 80px pull down                       |
| Max pull distance    | 120px (rubber band after 80)         |
| Indicator            | RefreshCw icon, rotates              |
| Text states          | "Pull to refresh" -> "Release to refresh" -> "Updating..." |
| Rubber band physics  | Resistance increases past threshold  |
| Used on pages        | My Bookings, Search Results, Driver Dashboard, Admin lists |

```css
.pull-indicator {
  transition: transform 0.2s var(--ease-spring);
}

.pull-indicator.refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Swipe to Dismiss / Cancel

| Property             | Value                               |
|----------------------|--------------------------------------|
| Direction            | Swipe left on booking cards          |
| Reveal distance      | 144px (two action buttons at 72px)   |
| Snap points          | 0 (closed), 72px (one action), 144px (both) |
| Background actions   | Edit (blue), Cancel/Delete (red)     |
| Haptic feedback      | Light impact when action is revealed |
| Full swipe           | 80% width triggers primary action    |

### Swipe to Close Bottom Sheet

| Property             | Value                               |
|----------------------|--------------------------------------|
| Direction            | Swipe down on drag handle            |
| Threshold            | 30% of sheet height                  |
| Velocity close       | 800px/s downward                     |
| Snap points          | Configurable (40%, 70%, 90%)         |

---

## 3. Bottom Sheet Patterns

Use bottom sheets instead of dropdowns and modals on mobile.

### When to Use Bottom Sheets

| Instead of...        | Use bottom sheet for...              |
|----------------------|--------------------------------------|
| Select dropdown      | City selection, car type filter      |
| Alert dialog         | Confirmation (cancel booking, logout)|
| Modal form           | Quick edit (date change, coupon)     |
| Options menu         | Action menu (share, report, edit)    |
| Date picker          | Custom date range selection          |

### Bottom Sheet Sizes

| Size       | Height    | Use Case                              |
|------------|-----------|---------------------------------------|
| `small`    | 40% vh    | Simple confirmations, quick selects   |
| `medium`   | 70% vh    | Forms, detailed selections            |
| `large`    | 90% vh    | Complex content, search with results  |

### Implementation Pattern

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-radius: 16px 16px 0 0;
  z-index: 400;
  transform: translateY(100%);
  transition: transform 350ms var(--ease-spring);
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bottom-sheet.open {
  transform: translateY(0);
}

.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 399;
  opacity: 0;
  transition: opacity 250ms ease;
}

.bottom-sheet-overlay.visible {
  opacity: 1;
}

.bottom-sheet-handle {
  width: 36px;
  height: 4px;
  background: #CBD5E1;
  border-radius: 9999px;
  margin: 8px auto 16px;
}
```

---

## 4. Sticky Bottom CTA Buttons

All primary actions on form pages use a sticky bottom CTA.

```
+------------------------------------------+
|           [scrollable content]            |
|                                          |
+------------------------------------------+  <- border-top
|  16px padding                            |
|  [========= Full Width CTA =========]   |  <- 56px height
|  safe-area-bottom padding                |
+------------------------------------------+
```

### Implementation

```css
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  z-index: 200;
}

/* Add bottom padding to page content so CTA doesn't cover last items */
.page-with-cta {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* On pages with both CTA and bottom nav */
.page-with-cta-and-nav {
  padding-bottom: calc(80px + 64px + env(safe-area-inset-bottom));
}
```

### CTA Variants

| Page                  | CTA Text                    | Secondary Action |
|-----------------------|-----------------------------|------------------|
| Search results        | "Select This Car"           | --               |
| Booking step 1-3      | "Continue"                  | --               |
| Booking review        | "Proceed to Pay Rs X,XXX"   | --               |
| Payment               | "Pay Rs X,XXX"              | --               |
| Rate ride             | "Submit Review"             | "Skip"           |
| Driver ride detail    | "Start Ride" / "Complete"   | --               |
| Admin assign driver   | "Assign Driver"             | "Cancel"         |

---

## 5. Thumb-Zone Optimization

Designing for one-handed use on mobile (right-handed majority).

```
+------------------------------------------+
|          Hard to reach zone              |  <- navigation, info
|              (top 1/3)                   |
|                                          |
|                                          |
|         Moderate zone                    |  <- content, secondary
|             (middle 1/3)                 |
|                                          |
|                                          |
|         Easy / Natural zone              |  <- primary actions,
|             (bottom 1/3)                 |     CTA buttons, tabs
+------------------------------------------+
```

### Placement Rules

| Element              | Zone       | Rationale                        |
|----------------------|------------|----------------------------------|
| Primary CTA          | Bottom     | Easy thumb reach                 |
| Bottom navigation    | Bottom     | Constant access                  |
| Search bar           | Top-mid    | Finger travels naturally         |
| Action menu          | Bottom     | Sheet from bottom, not top       |
| Back button          | Top-left   | System convention (unavoidable)  |
| Filters              | Top        | Set-and-forget, not frequent     |
| FAB (if used)        | Bottom-right| Natural thumb rest position     |

---

## 6. Native-Feeling Transitions

### Page Transitions

| Transition Type      | Duration | Easing                        | Usage                      |
|----------------------|----------|-------------------------------|----------------------------|
| Push (forward)       | 350ms    | `cubic-bezier(0.4, 0, 0.2, 1)` | Navigate deeper            |
| Pop (back)           | 300ms    | `cubic-bezier(0.4, 0, 0.2, 1)` | Navigate back              |
| Fade                 | 250ms    | `ease`                        | Tab switches               |
| Scale up             | 300ms    | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Modal opening       |
| Slide up             | 350ms    | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bottom sheet opening |

### Push Transition CSS

```css
/* Page entering (pushing forward) */
@keyframes page-enter {
  from {
    transform: translateX(100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Page leaving (being pushed back) */
@keyframes page-leave {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-30%);
    opacity: 0.6;
  }
}

.page-transition-enter {
  animation: page-enter 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.page-transition-exit {
  animation: page-leave 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

---

## 7. Haptic Feedback Cues

Use the Vibration API where supported for tactile confirmation.

| Action                    | Pattern           | Type           |
|---------------------------|-------------------|----------------|
| Button tap                | 10ms              | Light impact   |
| Toggle switch             | 15ms              | Medium impact  |
| Swipe action revealed     | 10ms              | Light impact   |
| Pull-to-refresh threshold | 15ms              | Medium impact  |
| Booking confirmed         | 10ms, 50ms, 10ms | Success        |
| Error / validation fail   | 20ms, 30ms, 20ms | Error          |
| Long press (context menu) | 25ms              | Heavy impact   |

```typescript
// Haptic feedback utility
const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(15),
  heavy: () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([10, 50, 10]),
  error: () => navigator.vibrate?.([20, 30, 20]),
};
```

---

## 8. Offline-First Patterns

### Offline Capability Matrix

| Feature              | Offline Behavior                       |
|----------------------|----------------------------------------|
| View past bookings   | Cached locally, show stale data        |
| View booking detail  | Cached if previously viewed            |
| Search cars          | Show "No connection" with retry        |
| Create booking       | Queue action, sync when online         |
| Live tracking        | Show last known position + "Offline"   |
| Profile view         | Full offline support (cached)          |
| Admin pages          | "Requires connection" overlay          |

### Offline UI Patterns

**Connection Status Bar:**
```
+------------------------------------------+
| [wifi-off] You're offline. Data may be   |
| outdated. [Retry]                        |
+------------------------------------------+
```
- Background: `#FEF3C7`
- Text: `#B45309`
- Position: sticky below top bar
- Height: 40px
- Auto-dismiss on reconnection with "Back online!" toast (green)

**Queued Actions Indicator:**
```
+------------------------------------------+
| [clock] 1 action pending sync            |
+------------------------------------------+
```

### Caching Strategy

```typescript
// Service Worker cache priority
const CACHE_STRATEGIES = {
  'api/bookings': 'stale-while-revalidate',  // show cached, refresh in bg
  'api/cars': 'network-first',                // need fresh, fallback to cache
  'api/tracking': 'network-only',             // real-time only
  'static/*': 'cache-first',                  // assets rarely change
  'api/profile': 'stale-while-revalidate',    // cached with bg refresh
};
```

---

## 9. Progressive Loading

### Loading Priority (per page)

**Home Page:**
1. App shell (header, nav, search card) -- instant from cache
2. Greeting + search form -- immediate
3. Popular routes -- load first API call
4. Recent bookings -- second API call
5. Special offers -- lazy load on scroll

**Search Results:**
1. Header + search summary -- immediate
2. Filter chips -- immediate
3. First 3 car cards -- first batch
4. Remaining cards -- infinite scroll, 6 per batch

### Skeleton Loading Sequence

```
Time 0ms:    Shell renders (header, nav, empty containers)
Time 50ms:   Skeleton placeholders appear with shimmer
Time 200ms:  Above-the-fold content replaces skeletons
Time 400ms:  Below-fold content appears as user scrolls
```

### Image Loading

```css
/* Lazy load images with blur-up technique */
.car-image {
  background-color: #F1F5F9;  /* placeholder color */
  transition: filter 300ms ease;
}

.car-image.loading {
  filter: blur(10px);
}

.car-image.loaded {
  filter: blur(0);
}
```

```typescript
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  },
  { rootMargin: '100px' } // start loading 100px before visible
);
```

---

## 10. Keyboard Behavior

### Auto-Focus Rules

| Page / Component         | Auto-Focus Target                    |
|--------------------------|--------------------------------------|
| Search (home)            | Pickup location input                |
| Route search results     | None (show results immediately)      |
| Booking step 1           | Location input                       |
| Login/Signup             | Phone number input                   |
| Search (admin)           | Search input                         |
| Add coupon               | Coupon code input                    |

### Next-Field Navigation

```html
<!-- Use enterkeyhint for mobile keyboard behavior -->
<input enterkeyhint="next" />   <!-- Shows "Next" on keyboard -->
<input enterkeyhint="search" /> <!-- Shows "Search" on keyboard -->
<input enterkeyhint="done" />   <!-- Shows "Done" on keyboard -->
<input enterkeyhint="go" />     <!-- Shows "Go" on keyboard -->
```

### Form Flow (Booking)

```
Phone number  [Next ->]
Name          [Next ->]
Email         [Next ->]
Date          [opens picker]
Time          [opens picker]
Notes         [Done]
```

### Keyboard Avoidance

```css
/* Ensure input is visible when keyboard opens */
.form-page {
  min-height: 100vh;
  min-height: 100dvh; /* dynamic viewport height */
  padding-bottom: 200px; /* room for keyboard push */
}

/* Scroll input into view on focus */
input:focus {
  scroll-margin-bottom: 120px;
}
```

```typescript
// Scroll focused input into view
const handleFocus = (e: FocusEvent) => {
  setTimeout(() => {
    (e.target as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 300); // wait for keyboard animation
};
```

---

## 11. Phone Number Input

```
+----+------------------------------------------+
| +91| [  9 8 7 6 5  4 3 2 1 0  ]              |
| [v] |                                         |
+----+------------------------------------------+
  ^          ^
  country    auto-formatted with spaces
  selector
```

### Specifications

| Property              | Value                               |
|-----------------------|--------------------------------------|
| Country code width    | 64px                                 |
| Country selector      | Opens bottom sheet with search       |
| Default country       | India (+91)                          |
| Input mode            | `tel`                                |
| Max length            | 10 digits (India)                    |
| Auto-format           | `XXX XXX XXXX`                       |
| Validation            | Real-time, show check on valid       |
| Keyboard              | Numeric pad                          |

```typescript
// Phone formatting
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};
```

---

## 12. Date Picker

### Mobile: Native Date Picker

```html
<input
  type="date"
  min="2026-01-15"
  max="2026-12-31"
  class="date-input-native"
/>
```

- Uses native OS date picker (iOS wheel, Android calendar)
- Display value formatted as "Mon, 15 Jan 2026" via a visible overlay
- Actual `<input type="date">` is visually hidden but functionally active

### Desktop: Custom Calendar Modal

```
+--------------------------------------+
|  < January 2026 >                    |
|  Mo Tu We Th Fr Sa Su                |
|               1  2  3  4             |
|   5  6  7  8  9 10 11               |
|  12 13 14 [15] 16 17 18             |  <- selected
|  19 20 21 22 23 24 25               |
|  26 27 28 29 30 31                   |
|                                      |
|  [Cancel]        [Confirm]           |
+--------------------------------------+
```

| Property              | Value                      |
|-----------------------|----------------------------|
| Cell size             | 40px x 40px                |
| Selected cell         | `#2563EB` bg, white text   |
| Today cell            | Blue outline               |
| Disabled dates        | `#CBD5E1` text, no pointer |
| Range selection       | `#DBEAFE` background fill  |
| Width                 | 320px                      |
| Border radius         | 12px                       |

---

## 13. Map Interaction Patterns

### Map Controls

```
+------------------------------------------+
|                                          |
|  [full screen map]                       |
|                                          |
|                     [+]                  |  <- zoom in
|                     [-]                  |  <- zoom out
|                     [O]                  |  <- recenter
|                                          |
+------------------------------------------+
```

| Property              | Value                               |
|-----------------------|--------------------------------------|
| Zoom buttons          | 40px circle, white, shadow-md       |
| Zoom button position  | 16px from right edge, centered vert |
| Recenter button       | 48px circle, white, shadow-md       |
| Recenter position     | 16px from right, above bottom sheet |
| Pinch zoom            | Native gesture support              |
| Double-tap zoom       | Zoom in one level, 300ms            |
| Pan                   | Free pan with inertia               |

### Map Markers

| Marker          | Style                                      |
|-----------------|---------------------------------------------|
| Pickup          | Green circle (24px), white dot center       |
| Drop-off        | Red pin (32px), standard map pin shape      |
| Stop            | Blue diamond (20px)                         |
| Car (tracking)  | Car icon (32px), rotates with heading       |
| Driver location | Pulsing blue dot (16px + 32px pulse ring)   |

### Map Marker CSS (Pulse Animation)

```css
.driver-marker {
  width: 16px;
  height: 16px;
  background: #2563EB;
  border-radius: 50%;
  border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  position: relative;
}

.driver-marker::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid #2563EB;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

---

## 14. PWA Install Prompt

### Timing Strategy

Do NOT show install prompt:
- On first visit
- During active booking flow
- On payment page
- When user is mid-task

Show install prompt:
- After 3rd visit OR
- After first completed booking OR
- On the profile page (subtle banner)
- After 60 seconds of engagement on 2nd visit

### Install Banner

```
+------------------------------------------+
| [app icon]  Get the Books app    [X]     |
|             Faster, offline access        |
|             [Install]                     |
+------------------------------------------+
```

| Property              | Value                            |
|-----------------------|----------------------------------|
| Position              | Bottom of page, above nav        |
| Background            | `#EFF6FF`                        |
| Border                | 1px solid `#BFDBFE`              |
| Border radius         | 12px                             |
| Padding               | 12px 16px                        |
| Dismiss               | X button, don't show for 7 days  |
| Install button        | primary, size sm                 |

```typescript
// PWA install prompt handler
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Check engagement criteria
  const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
  const hasCompletedBooking = localStorage.getItem('hasCompletedBooking');

  if (visitCount >= 3 || hasCompletedBooking) {
    showInstallBanner();
  }
});

const handleInstallClick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  // Track outcome for analytics
};
```

---

## 15. Scroll Behavior

### Infinite Scroll (Lists)

```typescript
// Load more when 200px from bottom
const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadNextPage();
  }
};
```

- Show 3 skeleton cards while loading next batch
- "No more results" message at end
- Batch size: 10 items

### Scroll Restoration

- Remember scroll position when navigating away from lists
- Restore position on back navigation
- Reset scroll on new navigation (forward)

### Scroll Snapping (Horizontal Carousels)

```css
.horizontal-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 16px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.horizontal-scroll > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

---

## 16. Accessibility on Mobile

| Requirement              | Implementation                         |
|--------------------------|----------------------------------------|
| Color contrast           | Min 4.5:1 for text, 3:1 for UI        |
| Focus indicators         | 3px blue ring on all interactive       |
| Screen reader labels     | aria-label on icon-only buttons        |
| Reduced motion           | `prefers-reduced-motion` media query   |
| Font scaling             | Support up to 200% zoom               |
| Touch target spacing     | Min 8px between targets                |
| Error announcements      | aria-live="polite" for form errors     |
| Skip navigation          | Hidden skip link for keyboard users    |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
