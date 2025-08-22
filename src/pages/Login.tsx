import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  User,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { useCapacitor } from "@/hooks/useCapacitor"; // hoặc đường dẫn đúng
import { useDispatch } from "react-redux";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { setAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginWithFirebaseToken, loginLocal } from "@/services/UsersServices";
import { auth, googleProvider } from "@/lib/firebase";
import AuthLayout from "@/components/layouts/AuthLayout";
import { setAuthUser, serializeUser } from "@/store/slices/authSlice";
import { setAuthStorage, getAuthStorage } from "@/utils/authStorage";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getIdToken = async (user: User): Promise<boolean> => {
    try {
      const token = await user.getIdToken();
      dispatch(setAuthUser({ user: serializeUser(user), token }));
      const response = await loginWithFirebaseToken(token);

      const { accessToken, refreshToken, expiration, status } = response.data;

      dispatch(setAuth({ accessToken, refreshToken, expiration, status }));

      await setAuthStorage({
        accessToken,
        refreshToken,
        expiration,
        status,
        user: user?.displayName || "",
      });

      if (status === "Pending") {
        navigate("/profile");

        toast({
          title: "Chưa có thông tin tài khoản.",
          description: "Vui lòng đăng ký thông tin.",
          variant: "destructive",
        });
      } else if (status === "Active") {

        navigate("/");
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn trở lại hệ thống.",
        });
      }

      return true;
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xác thực với máy chủ.",
        variant: "destructive",
      });
      return false;
    }
  };
  const handleEmailLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await loginLocal(formData.email, formData.password);

      const { accessToken, refreshToken, expiration, status } =
        response?.data || {};

      dispatch(setAuth({ accessToken, refreshToken, expiration, status }));

      await setAuthStorage({
        accessToken,
        refreshToken,
        expiration,
        status,
        user: formData.email || "",
      });

      if (status === "Pending") {
        navigate("/profile");

        toast({
          title: "Chưa có thông tin tài khoản.",
          description: "Vui lòng đăng ký thông tin.",
          variant: "destructive",
        });
      } else if (status === "Active") {
        navigate("/");
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn trở lại hệ thống.",
        });
      }

      return true;
    } catch (error: any) {
      console.error("Email login error:", error);
      toast({
        title: "Lỗi đăng nhập",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const { isNative } = useCapacitor();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isNative) {
        // Native login
        console.error("isNative");

        const result = await GoogleAuth.signIn();
        console.error("result:", result);

        const credential = GoogleAuthProvider.credential(
          result.authentication.idToken
        );
        console.error("credential:", credential);

        const res = await signInWithCredential(auth, credential);
        console.error("Native Google login result:", res);
        await getIdToken(res.user);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        await getIdToken(result.user);
      }
    } catch (error: any) {
      console.error("Google login error:", error.message);
      console.error("stack:", error.stack);
      toast({
        title: "Lỗi đăng nhập Google",
        description: error.message || "Không thể đăng nhập.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Đăng nhập để quản lý lịch khám của bé"
    >
      <div className="space-y-6">
        {/* Form đăng nhập */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email hoặc số điện thoại</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="email"
                placeholder="Nhập email hoặc số điện thoại"
                className="pl-10 border-emerald-200 focus:border-emerald-500"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className="pl-10 pr-10 border-emerald-200 focus:border-emerald-500"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-4 w-4 text-emerald-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-emerald-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold rounded-xl"
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Đăng nhập bằng mạng xã hội */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full py-6 text-base border-emerald-200 hover:bg-emerald-50 rounded-xl hover:text-emerald-600"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập với Google
          </Button>

          <Button
            variant="outline"
            className="w-full py-6  text-base border-emerald-200 hover:bg-emerald-50 rounded-xl  hover:text-emerald-600"
          >
            <div className="w-5 h-5 mr-2 bg-blue-600 rounded text-white flex items-center justify-center  text-xs font-bold">
              f
            </div>
            Đăng nhập với Facebook
          </Button>
        </div>

        {/* Link đến trang đăng ký */}
        <div className="text-center pt-4">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <Link
            to="/register"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
