// firebase-messaging.ts
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import app from "./firebase"; // Cái file bạn gửi ở trên

const VAPID_KEY = "lb8cRnwgSw9d3KLfk9kGeiadMZmvS8e7_n6hnCOwm9s"; // lấy từ Firebase Console > Cloud Messaging > Web Push certificates

export const getFcmToken = async (): Promise<string | null> => {
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Không có quyền thông báo. Bỏ qua FCM.");
      return;
    }
  }
  const supported = await isSupported();
  if (!supported) return null;

  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    console.log("FCM token:", token);
    return token;
  } catch (err) {
    console.error("Lỗi lấy FCM token:", err);
    return null;
  }
};
