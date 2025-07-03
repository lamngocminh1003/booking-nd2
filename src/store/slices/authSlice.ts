// store/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiration: string | null;
  status: string | null;
  user: User | null; // ✅ ĐÚNG
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

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(
      state,
      action: PayloadAction<{ user: User | null; token: string | null }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuthUser(state) {
      state.user = null;
      state.token = "";
    },
    setAuthLoading(state, action) {
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
    },
  },
});

export const { setAuth, logout, setAuthUser, clearAuthUser, setAuthLoading } =
  authSlice.actions;
export default authSlice.reducer;
