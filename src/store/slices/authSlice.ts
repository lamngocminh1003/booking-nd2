import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";

// 👉 Chỉ giữ lại các thông tin đơn giản từ Firebase User
export interface SerializedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiration: string | null;
  status: string | null;
  user: SerializedUser | null; // ✅ Đã sửa
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiration: null,
  status: null,
  user: null,
  token: "",
  loading: true,
};

// ✅ Hàm serialize để đảm bảo user luôn đơn giản
export const serializeUser = (user: User): SerializedUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  phoneNumber: user.phoneNumber,
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(
      state,
      action: PayloadAction<{
        user: SerializedUser | null;
        token: string | null;
      }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuthUser(state) {
      state.user = null;
      state.token = "";
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiration: string;
        status: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiration = action.payload.expiration;
      state.status = action.payload.status;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiration = null;
      state.status = null;
      state.user = null;
      state.token = null;
      state.loading = false;
    },
  },
});

export const { setAuth, logout, setAuthUser, clearAuthUser, setAuthLoading } =
  authSlice.actions;

export default authSlice.reducer;
