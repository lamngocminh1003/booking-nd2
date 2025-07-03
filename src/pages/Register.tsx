import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setAuthStorage } from "@/utils/authStorage";
import { loginWithFirebaseToken } from "@/services/UsersServices";
import { auth } from "@/lib/firebase";
import AuthLayout from "@/components/layouts/AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getIdToken = async (user: User) => {
    try {
      const token = await user.getIdToken();
      const response = await loginWithFirebaseToken(token);

      if (response) {
        const { accessToken, refreshToken, expiration, status } = response.data;

        dispatch(
          setAuth({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiration: expiration,
            status: status,
          })
        );
        // Lưu token
        await setAuthStorage({
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiration: expiration,
          status: status,
        });
      }

      toast({
        title: "Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo thành công.",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo tài khoản.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async () => {
    // Validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi xác nhận mật khẩu",
        description: "Mật khẩu và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Lỗi mật khẩu",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await getIdToken(result.user);
    } catch (error: any) {
      console.error("Register error:", error);
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản mới để bắt đầu chăm sóc sức khỏe bé"
    >
      <div className="space-y-6">
        {/* Form đăng ký */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên *</Label>
            <Input
              id="fullName"
              placeholder="Nhập họ và tên đầy đủ"
              className="border-emerald-200 focus:border-emerald-500"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="phone"
                placeholder="Nhập số điện thoại"
                className="pl-10 border-emerald-200 focus:border-emerald-500"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                className="pl-10 border-emerald-200 focus:border-emerald-500"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="pl-10 border-emerald-200 focus:border-emerald-500"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold rounded-xl"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </div>

        {/* Điều khoản */}
        <div className="text-center text-sm text-gray-600">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Link to="/terms" className="text-emerald-600 hover:underline">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="text-emerald-600 hover:underline">
            Chính sách bảo mật
          </Link>
        </div>

        {/* Link đến trang đăng nhập */}
        <div className="text-center pt-4">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link
            to="/login"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
