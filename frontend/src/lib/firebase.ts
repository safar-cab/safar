import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;

function getFirebaseMessaging(): Messaging | null {
  if (messaging) return messaging;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase not configured');
    return null;
  }

  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Firebase init failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  const m = getFirebaseMessaging();
  if (!m) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(m, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
    });

    return token;
  } catch (error) {
    console.error('FCM token error:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void) {
  const m = getFirebaseMessaging();
  if (!m) return () => {};
  return onMessage(m, callback);
}
