import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
const storage = SecureStoragePlugin;

export async function setSecureItem(key: string, value: string) {
  try {
    await storage.set({ key, value });
    console.log("✅ Saved to secure storage");
  } catch (err) {
    console.error("❌ Error saving:", err);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const result = await storage.get({ key });
    return result.value;
  } catch (err) {
    console.warn("⚠️ Key not found:", key);
    return null;
  }
}

export async function removeSecureItem(key: string) {
  try {
    await storage.remove({ key });
    console.log("🗑️ Removed from secure storage");
  } catch (err) {
    console.error("❌ Error removing:", err);
  }
}
