import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "@/services/UsersServices";
import { setAuth, clearAuthUser } from "@/store/slices/authSlice";
import { setAuthStorage } from "@/utils/authStorage";

export const useTokenRefresher = () => {
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const expiration = useSelector((state: any) => state.auth.expiration);
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scheduleRefresh = () => {
      if (!refreshToken || !expiration) return;

      const expiresAt = new Date(expiration).getTime();
      const now = Date.now();

      const timeUntilExpiry = expiresAt - now;
      const refreshThreshold = 2 * 60 * 1000; // 2 phút trước khi hết hạn

      const refreshIn = timeUntilExpiry - refreshThreshold;

      if (refreshIn <= 0) {
        // Token gần hết hoặc đã hết => refresh ngay
        refresh();
      } else {
        // Đặt hẹn gọi refresh trước khi hết hạn
        timeoutRef.current = setTimeout(refresh, refreshIn);
      }
    };

    const refresh = async () => {
      try {
        const result = await refreshAccessToken(refreshToken);
        if (result) {
          const { accessToken, refreshToken, expiration, status } = result.data;

          dispatch(setAuth({ accessToken, refreshToken, expiration, status }));
          // Lưu token
          await setAuthStorage({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiration: expiration,
            status: status,
          });

          // Sau khi refresh xong, đặt lại timeout tiếp theo
          scheduleRefresh();
        }
      } catch (err) {
        console.error("❌ Token refresh failed", err);
        dispatch(clearAuthUser());
      }
    };

    scheduleRefresh();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refreshToken, expiration, dispatch]);
};
