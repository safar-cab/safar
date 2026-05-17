# Firebase Cloud Messaging (Push Notifications) Setup

## 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create project: "CabBookingApp"
3. Disable Google Analytics (optional, not needed)

## 2. Add Web App

1. Project Settings → Add App → Web
2. Register app name
3. Copy Firebase config object

## 3. Generate VAPID Key

1. Project Settings → Cloud Messaging tab
2. Under "Web Push certificates" → Generate key pair
3. Copy the public key (VAPID key)

## 4. Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxxxx
FIREBASE_SERVER_KEY=xxxxx  # For server-side sending
```

## 5. Install Firebase

```bash
npm install firebase firebase-admin
```

## 6. Client-Side Setup

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  // Save token to user profile in DB
  await fetch('/api/users/fcm-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  return token;
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = getMessaging(app);
  onMessage(messaging, callback);
}
```

## 7. Service Worker

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '...',
  projectId: '...',
  messagingSenderId: '...',
  appId: '...',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: payload.data,
  });
});
```

## 8. Server-Side Sending

```typescript
// lib/notifications.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
      webpush: {
        fcmOptions: { link: data?.url || '/' },
      },
    });
  } catch (error) {
    console.error('Push notification failed:', error);
    // Remove invalid token from DB
  }
}

// Send to multiple users
export async function sendToMultiple(
  tokens: string[],
  title: string,
  body: string
) {
  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
}
```

## 9. Notification Types

```typescript
// Booking confirmed
sendPushNotification(userToken,
  'Booking Confirmed!',
  `Your ride to ${destination} on ${date} is confirmed.`,
  { bookingId, url: `/bookings/${bookingId}` }
);

// Driver on the way
sendPushNotification(userToken,
  'Driver On The Way',
  `${driverName} is heading to your pickup location.`,
  { bookingId, url: `/tracking/${bookingId}` }
);

// Ride completed
sendPushNotification(userToken,
  'Ride Completed',
  `Total: ₹${amount}. Rate your ride!`,
  { bookingId, url: `/bookings/${bookingId}/rate` }
);
```

## 10. Testing
- Push works only on HTTPS (use ngrok for local testing)
- Test in Chrome DevTools → Application → Service Workers
- Firebase Console → Messaging → Send test message
