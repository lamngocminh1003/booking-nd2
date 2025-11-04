import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";
import { getSecureItem, setSecureItem } from "@/lib/storage";
import { getFcmToken } from "@/lib/firebase-messaging";
import { postJSONAuth, postJSON } from "@/lib/utils"; // ✅ Import utils functions

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

export async function getPlatform(): Promise<string> {
  let platform = "web";

  if (Capacitor.isNativePlatform()) {
    const info = await Device.getInfo();
    platform = info.platform || "Web";
  }

  // ✅ Viết hoa chữ cái đầu
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

// 3. Lấy tên thiết bị
export async function getDeviceName(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const info = await Device.getInfo();
    return `${info.model} - ${info.operatingSystem}`;
  }
  return navigator.userAgent;
}

// 4. Gửi API đăng ký thiết bị - ✅ SỬ DỤNG AXIOS
export async function registerDevice() {
  const [deviceId, deviceToken, platform, deviceName] = await Promise.all([
    getOrCreateDeviceId(),
    getFcmToken(), // từ firebase-messaging.ts
    getPlatform(),
    getDeviceName(),
  ]);

  try {
    const [deviceId, deviceToken, platform, deviceName] = await Promise.all([
      getOrCreateDeviceId(),
      getFcmToken(), // từ firebase-messaging.ts
      getPlatform(),
      getDeviceName(),
    ]);

    const payload = {
      deviceId,
      deviceToken: deviceToken || null, // ✅ Empty string nếu không có FCM token
      platform,
      deviceName,
      isActive: true,
    };

    // ✅ SỬ DỤNG postJSONAuth (với Bearer token)
    const response = await postJSONAuth(
      "/api/user-device/create-or-update",
      payload
    );

    return response;
  } catch (error) {
    console.error("❌ Device registration failed:", error);

    // ✅ Enhanced error handling
    if (error?.message) {
      console.error("Error message:", error.message);
    }

    if (error?.code) {
      console.error("Error code:", error.code);
    }

    // ✅ Handle specific errors
    if (error?.status === 401) {
      console.error("🔒 Authentication failed - user needs to login");
    } else if (error?.status === 403) {
      console.error("🚫 Permission denied");
    } else if (error?.status >= 500) {
      console.error("🔥 Server error - try again later");
    }

    throw error;
  }
}
