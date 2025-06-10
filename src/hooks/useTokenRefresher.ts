import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "@/services/UsersServices";
import { setAuth, clearAuthUser } from "@/store/slices/authSlice";
import { setSecureItem } from "@/lib/storage"; // wrapper from previous step
import { Capacitor } from "@capacitor/core";

export const useTokenRefresher = () => {
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const refresh = async () => {
      if (!refreshToken) return;

      try {
        const result = await refreshAccessToken(refreshToken);

        if (result) {
          let { accessToken, refreshToken, expiration } = result;
          dispatch(
            setAuth({
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiration: expiration,
            })
          ); // Lưu vào localStorage (web)
          if (Capacitor.isNativePlatform()) {
            await setSecureItem("accessToken", accessToken);
            await setSecureItem("refreshToken", refreshToken);
            await setSecureItem("expiration", expiration);
          } else {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("expiration", expiration);
          }
        }
      } catch (err) {
        console.warn("⚠️ Failed to refresh token. Logging out...");
        dispatch(clearAuthUser());
      }
    };

    // Initial call
    refresh();

    // Set interval every 15 minutes
    intervalRef.current = setInterval(refresh, 15 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshToken, dispatch]);
};
