import { postJSON, postJSONAuth, fetchData } from "@/lib/utils";
const loginWithFirebaseToken = (idToken: string) =>
  postJSON("/api/auth/firebase-login", { idToken });

const refreshAccessToken = (refreshToken: string) =>
  postJSON("/api/auth/refresh-token", { refreshToken });

const logoutService = (deviceId: string) =>
  postJSONAuth("/api/auth/logout", { deviceId });
const createOrUpdateUserInfo = (data) =>
  postJSONAuth("/api/user-info/create-or-update", data);

const parseCCCDQR = (cccdQrData: string) =>
  fetchData(`/api/parse-cccd-qr?cccdQrData=${encodeURIComponent(cccdQrData)}`);
export {
  loginWithFirebaseToken,
  refreshAccessToken,
  logoutService,
  createOrUpdateUserInfo,
  parseCCCDQR,
};
