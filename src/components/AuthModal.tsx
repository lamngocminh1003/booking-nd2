import { useState } from "react";
import { setAuthStorage } from "@/utils/authStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAuthStorage } from "@/utils/authStorage";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { registerDevice } from "@/hooks/getOrCreateDeviceId";

import { Capacitor } from "@capacitor/core";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setSecureItem } from "@/lib/storage";
import { loginWithFirebaseToken } from "@/services/UsersServices";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onLogin: (user: User, token: string) => void;
}

const AuthModal = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  onLogin,
}: AuthModalProps) => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    sodienthoai: "",
    iddevice: "",
    firebasetoken: "",
    password: "",
    fullName: "",
    phone: "",
    ngaysinh: "",
    phai: 0,
    diachi: "",
    matinhthanh: "",
    maquanhuyen: "",
    maphuongxa: "",
    email: "",
    sothebhyt: "",
    mabn: "",
    masothue: "",
    donvi: "",
    manghenghiep: "",
    madantoc: "",
    hide: 0,
    confirmPassword: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // Mock login logic
    toast({
      title: "Đăng nhập thành công!",
    });
    onClose();
  };
  const getIdToken = async (user: User) => {
    try {
      const token = await user.getIdToken();
      onLogin(user, token);
      const response = await loginWithFirebaseToken(token);
      if (response) {
        let { accessToken, refreshToken, expiration, status } = response?.data;
        dispatch(
          setAuth({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiration: expiration,
            status: status,
          })
        ); // Lưu vào localStorage (web)
        // Lưu token
        await setAuthStorage({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiration: expiration,
          status: status,
          user: user?.displayName || "",
        });
        if (accessToken) {
          await registerDevice();
        }
      }
      toast({
        title: "Đăng nhập thành công!",
      });
      onClose();
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy ID token.",
        variant: "destructive",
      });
    }
  };
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await getIdToken(result.user);
      const { status } = await getAuthStorage();

      if (status === "pending") {
        navigate("/profile"); // Chuyển đến trang profile
        toast({
          title:
            "Hiện tại chưa có thông tin tài khoản. Vui lòng đăng ký thông tin.",
          description:
            "Hiện tại chưa có thông tin tài khoản. Vui lòng đăng ký thông tin.",
          variant: "destructive",
        });
      } else if (status === "Active") {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Lỗi đăng nhập Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    // Mock register logic
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi xác nhận mật khẩu",
        description: "Mật khẩu và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Đăng ký thành công!",
      description: "Tài khoản của bạn đã được tạo thành công.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-emerald-900">
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(value) => onModeChange(value as "login" | "register")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chào mừng trở lại</CardTitle>
                <CardDescription>
                  Đăng nhập để quản lý lịch khám của bé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email hoặc số điện thoại</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      placeholder="Nhập email hoặc số điện thoại"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleLogin}
                >
                  Đăng nhập
                </Button>

                <div className="text-center">
                  <a
                    href="#"
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
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
                  <Button variant="outline" className="w-full">
                    <div className="w-5 h-5 mr-2 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                      f
                    </div>
                    Đăng nhập với Facebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tạo tài khoản mới</CardTitle>
                <CardDescription>
                  Đăng ký để bắt đầu chăm sóc sức khỏe bé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Họ và tên</Label>
                  <div className="relative">
                    {/* <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <Input
                      id="register-name"
                      placeholder="Nhập họ và tên đầy đủ"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-phone"
                      placeholder="Nhập số điện thoại"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleRegister}
                >
                  Đăng ký
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Bằng việc đăng ký, bạn đồng ý với
                  <a href="#" className="text-emerald-600 hover:underline">
                    Điều khoản sử dụng
                  </a>
                  và
                  <a href="#" className="text-emerald-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
