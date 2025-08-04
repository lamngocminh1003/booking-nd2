import { Capacitor } from "@capacitor/core";
import { getSecureItem, setSecureItem, removeSecureItem } from "@/lib/storage"; // Đường dẫn tuỳ vào project bạn

type AuthStorageKeys =
  | "accessToken"
  | "refreshToken"
  | "expiration"
  | "status"
  | "user";

const AUTH_KEYS: AuthStorageKeys[] = [
  "accessToken",
  "refreshToken",
  "expiration",
  "status",
  "user", //
];

// Lấy giá trị từ bộ nhớ
export const getAuthStorage = async (): Promise<
  Record<AuthStorageKeys, string | null>
> => {
  const isNative = Capacitor.isNativePlatform();
  const result: Record<AuthStorageKeys, string | null> = {
    accessToken: null,
    refreshToken: null,
    expiration: null,
    status: null,
    user: null,
  };

  for (const key of AUTH_KEYS) {
    result[key] = isNative
      ? await getSecureItem(key)
      : localStorage.getItem(key);
  }

  return result;
};

// Gán giá trị vào bộ nhớ
export const setAuthStorage = async (data: Record<AuthStorageKeys, string>) => {
  const isNative = Capacitor.isNativePlatform();

  for (const key of AUTH_KEYS) {
    const value = data[key];
    if (isNative) {
      await setSecureItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }
};

// Xoá bộ nhớ
export const removeAuthStorage = async () => {
  const isNative = Capacitor.isNativePlatform();

  for (const key of AUTH_KEYS) {
    if (isNative) {
      await removeSecureItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }
};
