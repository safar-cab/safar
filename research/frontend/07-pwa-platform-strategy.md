# PWA & Platform Strategy

## Platform Architecture

```
Books Car Rental — Three Portals, Two Platforms

┌─────────────────────────────────────────────────────┐
│  CUSTOMER APP (PWA)          DRIVER APP (PWA)       │
│  ─────────────────           ─────────────────      │
│  Mobile-first                Mobile-first           │
│  Installable via browser     Installable via browser│
│  Offline support             Offline support        │
│  Push notifications (FCM)    Push notifications     │
│  Service worker caching      GPS background         │
│  Add to Home Screen          Add to Home Screen     │
│  Full screen (standalone)    Full screen (standalone)│
│  Web 3.0 PWA features       Web 3.0 PWA features   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD (Web App — Desktop-First)          │
│  ─────────────────────────────────────────          │
│  Desktop-first, responsive                          │
│  Browser-only (no PWA install)                      │
│  No service worker needed                           │
│  No offline support needed                          │
│  Sidebar navigation                                 │
│  Data tables, charts, forms                         │
│  Accessed via laptop/desktop browser                │
└─────────────────────────────────────────────────────┘
```

---

## PWA Configuration (Customer + Driver)

### manifest.json

```json
{
  "name": "Books Car Rental",
  "short_name": "Books",
  "description": "Book intercity car rides with ease",
  "start_url": "/customer",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#2563EB",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Home screen"
    },
    {
      "src": "/screenshots/booking.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Booking flow"
    }
  ],
  "categories": ["travel", "transportation"],
  "shortcuts": [
    {
      "name": "Book a Ride",
      "url": "/customer/book",
      "icons": [{ "src": "/icons/shortcut-book.png", "sizes": "96x96" }]
    },
    {
      "name": "My Bookings",
      "url": "/customer/bookings",
      "icons": [{ "src": "/icons/shortcut-bookings.png", "sizes": "96x96" }]
    }
  ]
}
```

### Driver manifest.json differences

```json
{
  "name": "Books Driver",
  "short_name": "Books Driver",
  "start_url": "/driver",
  "theme_color": "#059669",
  "shortcuts": [
    {
      "name": "My Rides",
      "url": "/driver/rides"
    },
    {
      "name": "Go Online",
      "url": "/driver?online=true"
    }
  ]
}
```

---

## Service Worker Strategy

### Vite PWA Plugin Config

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // API calls - Network First
            urlPattern: /^https:\/\/api\.books\.in\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Static assets - Cache First
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Google Fonts - Stale While Revalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'font-cache',
            },
          },
        ],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        // ... manifest.json contents above
      },
    }),
  ],
});
```

### What Gets Cached Offline

| Resource | Strategy | Cache Duration |
|----------|----------|---------------|
| App shell (HTML/JS/CSS) | Precache | Until next deploy |
| Static images | Cache First | 30 days |
| API responses | Network First | 1 hour fallback |
| Google Fonts | Stale While Revalidate | Until new version |
| Car photos | Cache First | 7 days |
| User profile data | Network First | Cached fallback |

### Offline Behavior

| Feature | Offline Behavior |
|---------|-----------------|
| Browse routes | Show cached routes |
| View my bookings | Show cached booking list |
| Booking detail | Show cached detail |
| Create booking | Queue and sync when online |
| Live tracking | Show "Offline" banner, last known position |
| Payment | Block — requires network |
| Profile | Show cached profile |
| Admin dashboard | Not applicable (web-only) |

---

## Install Prompt Strategy

### When to Show Install Prompt

```typescript
// Custom install prompt timing
const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Show prompt conditions:
  // 1. After 2nd visit (tracked in localStorage)
  // 2. After first booking confirmation
  // 3. Never if already installed
  // 4. Max once per 7 days
  const shouldShow = () => {
    if (!deferredPrompt) return false;
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return false;

    const lastPrompt = localStorage.getItem('installPromptDate');
    if (lastPrompt) {
      const daysSince = (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return false;
    }

    const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    return visitCount >= 2;
  };

  return { deferredPrompt, shouldShow, showPrompt, setShowPrompt };
};
```

### Install Prompt UI

```
┌──────────────────────────────────────┐
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 📱 Install Books App            │ │
│  │                                 │ │
│  │ Get quick access to bookings,   │ │
│  │ live tracking, and instant      │ │
│  │ notifications.                  │ │
│  │                                 │ │
│  │ [  Install  ]  [  Not Now  ]    │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘

Style: bottom sheet on mobile, banner on desktop
Animation: slide up, 300ms spring
Dismissible: swipe down or "Not Now"
```

---

## Push Notifications (FCM + Service Worker)

### Registration Flow

```
1. User logs in
2. Check notification permission
3. If not granted → show custom prompt explaining benefits
4. If granted → get FCM token via getToken()
5. Send token to backend → stored in user.fcmTokens[]
6. Service worker handles incoming push messages
```

### Notification Types

| Event | Title | Body | Action |
|-------|-------|------|--------|
| Booking confirmed | Booking Confirmed | Your ride BK-001 is confirmed | Open booking detail |
| Driver assigned | Driver Assigned | Ramesh is your driver for tomorrow | Open booking detail |
| Driver en route | Driver On The Way | Your driver is heading to pickup | Open live tracking |
| Ride completed | Ride Completed | Rate your ride with Ramesh | Open rating page |
| Payment received | Payment Received | Rs 3,192 received for BK-001 | Open payment history |
| Cancellation | Booking Cancelled | BK-001 cancelled. Refund in 3-5 days | Open booking detail |

### Service Worker Push Handler

```typescript
// sw.js (service worker)
self.addEventListener('push', (event) => {
  const data = event.data?.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    renotify: true,
    data: {
      url: data.actionUrl || '/customer/bookings',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

---

## Web 3.0 PWA Features Used

| Feature | API | Usage |
|---------|-----|-------|
| Install prompt | `beforeinstallprompt` | Custom install UI |
| Standalone display | `display: standalone` | Full screen app feel |
| Push notifications | Push API + FCM | Booking updates |
| Background sync | Background Sync API | Queue offline bookings |
| Screen wake lock | Wake Lock API | Keep screen on during tracking (driver) |
| Geolocation | Geolocation API | Driver location updates |
| Share | Web Share API | Share booking/receipt |
| Vibration | Vibration API | Haptic feedback on actions |
| Persistent storage | Storage API | Keep cached data |
| App shortcuts | Manifest shortcuts | Quick book, my bookings |
| App badges | Badging API | Unread notification count |

---

## Admin — Web-Only (No PWA)

### Why No PWA for Admin

- Admin accesses on desktop/laptop — no need for home screen install
- Admin needs reliable network for real-time data — offline mode not useful
- Complex tables and charts optimized for large screens
- No push notifications needed — admin checks dashboard periodically
- No geolocation or camera features needed

### Admin Technical Stack

| Aspect | Choice |
|--------|--------|
| Layout | Desktop-first, responsive down to tablet |
| Min width | 768px (show mobile warning below this) |
| Navigation | Fixed sidebar (240px) |
| Data display | Tables with sort/filter/pagination |
| Charts | Recharts or Chart.js |
| Forms | React Hook Form |
| No service worker | Direct API calls only |
| No manifest | Standard web page |

### Mobile Warning for Admin

```
┌──────────────────────────────────┐
│                                  │
│  💻 Desktop Recommended         │
│                                  │
│  Admin dashboard works best on   │
│  a laptop or desktop browser.    │
│                                  │
│  [  Continue Anyway  ]           │
│                                  │
└──────────────────────────────────┘

Show when: viewport < 768px
Dismissible: yes, remember choice in localStorage
```
