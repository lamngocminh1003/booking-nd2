import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccessToken } from "@/services/UsersServices";
import { setAuth, clearAuthUser, setAuthUser } from "@/store/slices/authSlice";
import { setAuthStorage, getAuthStorage } from "@/utils/authStorage";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { getUserInfo } from "@/store/slices/locationSlice";

// ✅ Hàm chuẩn hóa dữ liệu User thành serializable
const serializeUser = (user: User) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  phoneNumber: user.phoneNumber,
});

export const useTokenRefresher = () => {
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const expiration = useSelector((state: any) => state.auth.expiration);

  const { userInfo, loading: locationLoading } = useAppSelector(
    (state) => state.location
  );

  const dispatch = useDispatch();
  const dispatch1 = useAppDispatch();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const scheduleRefresh = () => {
      if (!refreshToken || !expiration) return;

      const expiresAt = new Date(expiration).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const refreshThreshold = 2 * 60 * 1000;
      const refreshIn = timeUntilExpiry - refreshThreshold;

      dispatch1(getUserInfo());

      if (refreshIn <= 0) {
        refresh();
      } else {
        timeoutRef.current = setTimeout(refresh, refreshIn);
      }
    };

    const refresh = async () => {
      try {
        const result = await refreshAccessToken(refreshToken);
        if (result) {
          const { accessToken, refreshToken, expiration, status } = result.data;
          dispatch(setAuth({ accessToken, refreshToken, expiration, status }));

          const currentUser = auth.currentUser;
          if (currentUser) {
            const idToken = await currentUser.getIdToken(true);
            dispatch(
              setAuthUser({ user: serializeUser(currentUser), token: idToken })
            );
          }
          const { user } = await getAuthStorage();

          await setAuthStorage({
            accessToken,
            refreshToken,
            expiration,
            status,
            user: currentUser?.displayName || userInfo?.fullName || user || "",
          });
          scheduleRefresh();
        }
      } catch (err) {
        console.error("❌ Token refresh failed", err);
        dispatch(clearAuthUser());
      }
    };

    scheduleRefresh(); // 🔥 GỌI HÀM NÀY!

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refreshToken, expiration, dispatch]);
};
