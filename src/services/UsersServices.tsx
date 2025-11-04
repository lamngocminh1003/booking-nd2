import { postJSON, postJSONAuth, fetchData } from "@/lib/utils";
const loginWithFirebaseToken = (idToken: string) =>
  postJSON("/api/auth/firebase-login", { idToken });
const loginLocal = (account: string, password: string) =>
  postJSON("/api/auth/login-local", { account, password });
const registerLocal = (
  username: string,
  phoneNumber: string,
  email: string,
  password: string
) =>
  postJSON("/api/auth/register-local", {
    username,
    phoneNumber,
    email,
    password,
  });
const refreshAccessToken = (refreshToken: string) =>
  postJSON("/api/auth/refresh-token", { refreshToken });

const logoutService = (deviceId: string, refreshToken: string) =>
  postJSONAuth("/api/auth/logout", { deviceId, refreshToken });
const createOrUpdateUserInfo = (data) =>
  postJSONAuth("/api/user-info/create-or-update", data);

const parseCCCDQR = (cccdQrData: string) =>
  fetchData(`/api/parse-cccd-qr?cccdQrData=${encodeURIComponent(cccdQrData)}`);
const userInfo = () => fetchData(`/api/user-info/user-login`);
const fetchDoctorsList = () => fetchData("/api/Doctor/list");
export {
  loginWithFirebaseToken,
  refreshAccessToken,
  logoutService,
  createOrUpdateUserInfo,
  parseCCCDQR,
  registerLocal,
  userInfo,
  loginLocal,
  fetchDoctorsList,
};
