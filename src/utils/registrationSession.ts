export interface RegistrationSession {
  registrationId: number;
  orderId?: string;
  createdAt: string;
  expiresAt: string;
  patientData: any;
  appointmentData: any;
  scheduleData: any;
  slotData: any;
  serviceData: any;
  qrCodeBase64?: string;
  isExpired?: boolean;
}

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 phút tính bằng milliseconds
const SESSION_KEY = "pendingRegistration";

// ✅ Lưu session đăng ký
export const saveRegistrationSession = (
  data: Omit<RegistrationSession, "createdAt" | "expiresAt">
) => {
  const now = new Date();
  const session: RegistrationSession = {
    ...data,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TIMEOUT).toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  console.log("💾 Đã lưu session đăng ký:", session);
  return session;
};

// ✅ Lấy session đăng ký hiện tại
export const getRegistrationSession = (): RegistrationSession | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    const session: RegistrationSession = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    // Kiểm tra hết hạn
    if (now > expiresAt) {
      console.log("⏰ Session đã hết hạn, tự động xóa");
      clearRegistrationSession();
      return null;
    }

    session.isExpired = false;
    return session;
  } catch (error) {
    console.error("❌ Lỗi đọc session:", error);
    clearRegistrationSession();
    return null;
  }
};

// ✅ Xóa session đăng ký
export const clearRegistrationSession = () => {
  localStorage.removeItem(SESSION_KEY);
  console.log("🗑️ Đã xóa session đăng ký");
};

// ✅ Kiểm tra session có hết hạn không
export const isSessionExpired = (session: RegistrationSession): boolean => {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  return now > expiresAt;
};

// ✅ Tính thời gian còn lại
export const getTimeRemaining = (session: RegistrationSession): number => {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const remaining = expiresAt.getTime() - now.getTime();
  return Math.max(0, remaining);
};

// ✅ Format thời gian còn lại
export const formatTimeRemaining = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
