import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAuthStorage } from "@/utils/authStorage";
import { useLocation, Navigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(!!refreshToken);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkToken() {
      if (!refreshToken) {
        const storage = await getAuthStorage();
        setHasToken(!!storage.refreshToken);
        if (!storage.refreshToken) setShowModal(true);
      } else {
        setHasToken(true);
      }
      setChecked(true);
    }
    checkToken();
    // eslint-disable-next-line
  }, [refreshToken]);

  if (!checked) return null; // hoặc loading...

  if (!hasToken) {
    // Hiện modal, sau đó chuyển hướng
    return (
      <>
        <AuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode="login"
          onModeChange={() => {}}
          onLogin={() => {}}
        />
        <Navigate to="/login" state={{ from: location }} replace />
      </>
    );
  }

  return children;
}
