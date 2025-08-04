import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";
import { getSecureItem, setSecureItem } from "@/lib/storage";
import { getFcmToken } from "@/lib/firebase-messaging";

// 1. Lấy hoặc tạo deviceId
export async function getOrCreateDeviceId(): Promise<string> {
  const key = "deviceId";
  let deviceId: string | null;

  if (Capacitor.isNativePlatform()) {
    deviceId = await getSecureItem(key);
  } else {
    deviceId = localStorage.getItem(key);
  }

  if (!deviceId) {
    deviceId = uuidv4();
    if (Capacitor.isNativePlatform()) {
      await setSecureItem(key, deviceId);
    } else {
      localStorage.setItem(key, deviceId);
    }
  }

  return deviceId;
}

// 2. Lấy platform
export async function getPlatform(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const info = await Device.getInfo();
    return info.platform;
  }
  return "web";
}

// 3. Lấy tên thiết bị
export async function getDeviceName(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const info = await Device.getInfo();
    return `${info.model} - ${info.operatingSystem}`;
  }
  return navigator.userAgent;
}

// 4. Gửi API đăng ký thiết bị
export async function registerDevice() {
  const [deviceId, deviceToken, platform, deviceName] = await Promise.all([
    getOrCreateDeviceId(),
    getFcmToken(), // từ firebase-messaging.ts
    getPlatform(),
    getDeviceName(),
  ]);

  if (!deviceToken) {
    console.warn("FCM token không khả dụng. Bỏ qua gửi thiết bị.");
    return;
  }

  const payload = {
    deviceId,
    deviceToken,
    platform,
    deviceName,
    isActive: true,
  };

  try {
    await fetch("/api/user-device/create-or-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Đăng ký thiết bị thành công:", payload);
  } catch (error) {
    console.error("Lỗi gọi API registerDevice:", error);
  }
}
