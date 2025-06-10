import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, signOut } from "firebase/auth";
import { Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import AuthModal from "@/components/AuthModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setAuthUser } from "@/store/slices/authSlice";
import { clearAuthUser } from "@/store/slices/authSlice";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary
const Navigation = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user); // Lấy từ Redux
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearAuthUser()); // Cập nhật Redux
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất.",
        variant: "destructive",
      });
    }
  };

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  const handleLogin = (user: User, token: string) => {
    dispatch(setAuthUser({ user, token }));
  };
  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={handleLogin}
      />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8  flex items-center justify-center">
                <img
                  alt="Logo Bệnh Viện Nhi Đồng 2"
                  src={logo}
                  className="w-8 h-8 text-white absolute"
                />
              </div>
              <span className="text-xl font-bold text-emerald-900">
                Bệnh Viện Nhi Đồng 2
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Trang chủ
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Bác sĩ
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Chuyên khoa
              </a>{" "}
              <a
                href="#"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Bảng giá khám chữa bệnh
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  {" "}
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleAuthClick("login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleAuthClick("register")}
                  >
                    Đăng ký
                  </Button>{" "}
                </>
              ) : (
                <>
                  {" "}
                  <span className="text-gray-600 hover:text-emerald-600 transition-colors">
                    Xin chào {user?.displayName}
                  </span>
                  <Button
                    className="text-emerald-600 hover:bg-emerald-500"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 " />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-emerald-100 py-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Trang chủ
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Bác sĩ
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Chuyên khoa
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Bảng giá khám chữa bệnh
                </a>{" "}
                <a
                  href="#"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Liên hệ
                </a>
                <div className="px-4 pt-4 border-t border-emerald-100 space-y-2">
                  {!user ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600"
                        onClick={() => handleAuthClick("login")}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAuthClick("register")}
                      >
                        Đăng ký
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-600 hover:text-emerald-600  py-2">
                        Xin chào {user?.displayName}
                      </div>
                      <Button
                        variant="outline"
                        className=" border-emerald-600 text-emerald-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 " />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
