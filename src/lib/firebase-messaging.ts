// firebase-messaging.ts
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import app from "./firebase"; // Cái file bạn gửi ở trên

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const getFcmToken = async (): Promise<string | null> => {
  // ✅ 1. KIỂM TRA NOTIFICATION PERMISSION TRƯỚC

  if (Notification.permission === "denied") {
    console.warn("🚫 Notification permission is BLOCKED");

    return null; // ✅ Return null thay vì throw error
  }

  if (Notification.permission !== "granted") {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.warn("❌ Notification permission denied by user");
        return null; // ✅ Return null, không throw error
      }
    } catch (permissionError) {
      console.error("❌ Error requesting permission:", permissionError);
      return null;
    }
  }

  // ✅ 2. KIỂM TRA FCM SUPPORT
  try {
    const supported = await isSupported();

    if (!supported) {
      console.warn("❌ FCM not supported in this browser");
      return null;
    }
  } catch (supportError) {
    console.error("❌ Error checking FCM support:", supportError);
    return null;
  }

  // ✅ 3. LẤY FCM TOKEN
  try {
    const messaging = getMessaging(app);
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration, // ✅ Rất quan trọng
    });

    return token || null;
  } catch (err) {
    console.error("❌ Error getting FCM token:", err);

    // ✅ HANDLE SPECIFIC FIREBASE ERRORS
    if (err.code === "messaging/permission-blocked") {
      console.warn("🚫 Notification permission is blocked");
    } else if (err.code === "messaging/vapid-key-unavailable") {
      console.error("🔑 VAPID key error - check Firebase config");
    } else if (err.code === "messaging/token-unsubscribe-failed") {
      console.error("🔄 Token refresh failed");
    }

    return null; // ✅ ALWAYS RETURN NULL, không throw
  }
};
