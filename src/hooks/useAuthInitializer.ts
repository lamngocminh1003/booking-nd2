// src/hooks/useAuthInitializer.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";
import {
  setAuthUser,
  clearAuthUser,
  setAuthLoading,
  setAuth,
} from "@/store/slices/authSlice";
import { getAuthStorage } from "@/utils/authStorage";

export const useAuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setAuthLoading(true));

      const { accessToken, refreshToken, expiration, status } =
        await getAuthStorage();

      if (accessToken && refreshToken && expiration) {
        dispatch(setAuth({ accessToken, refreshToken, expiration, status }));
      }

      // 2. Firebase Auth state observer
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const idToken = await user.getIdToken();
            dispatch(setAuthUser({ user, token: idToken }));
          } catch (error) {
            console.error("Error getting Firebase ID token:", error);
            dispatch(clearAuthUser());
          }
        } else {
          dispatch(clearAuthUser());
        }
        dispatch(setAuthLoading(false));
      });

      return () => unsubscribe();
    };

    initAuth();
  }, [dispatch]);
};
