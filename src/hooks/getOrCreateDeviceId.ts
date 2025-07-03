import { v4 as uuidv4 } from "uuid";
import { Capacitor } from "@capacitor/core";
import { getSecureItem, setSecureItem } from "@/lib/storage";

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
