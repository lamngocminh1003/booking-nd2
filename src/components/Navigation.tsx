import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { clearAuthUser } from "@/store/slices/authSlice";
import { logoutService } from "@/services/UsersServices";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary
import { getOrCreateDeviceId } from "@/hooks/getOrCreateDeviceId";
import { removeAuthStorage, getAuthStorage } from "@/utils/authStorage";
const Navigation = () => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userLocal, setUserLocal] = useState<string | null>(null);
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getAuthStorage();
      setUserLocal(user);
    };
    checkUser();
  }, []);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      try {
        const deviceId = await getOrCreateDeviceId();
        const { refreshToken } = await getAuthStorage();

        await logoutService(deviceId, refreshToken);
      } finally {
        dispatch(clearAuthUser()); // Cập nhật Redux
        await removeAuthStorage();
        setUserLocal(null);
      }
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
    if (mode === "login") {
      navigate("/login");
    } else if (mode === "register") {
      navigate("/register");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/">
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
                </span>{" "}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Trang chủ
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                  <span>Khám chữa bệnh</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/services" className="w-full">
                      Tất cả dịch vụ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/services/specialist" className="w-full">
                      Khám Chuyên Khoa
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/doctors" className="w-full">
                      Đội Ngũ Chuyên Gia
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/medical-procedure" className="w-full">
                      Thủ tục khám bệnh
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/price-list" className="w-full">
                      Bảng gía khám chữa bệnh
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Liên hệ
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!userLocal ? (
                <>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleAuthClick("login")}
                  >
                    Đăng nhập
                  </Button>
                  {/* <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleAuthClick("register")}
                  >
                    Đăng ký
                  </Button> */}
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                      <span> Xin chào {userLocal}</span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white">
                      {/* <DropdownMenuItem asChild>
                        <Link to="/notifications" className="w-full">
                          Thông báo
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/appointments" className="w-full">
                          Lịch hẹn khám
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/history" className="w-full">
                          Lịch sử khám bệnh
                        </Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">
                          Thông tin tài khoản
                        </Link>
                      </DropdownMenuItem>{" "}
                      <DropdownMenuItem asChild>
                        <Link to="/history" className="w-full">
                          Lịch đặt khám
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <Link
                  to="/"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Trang chủ
                </Link>

                {/* Mobile Dropdown for Khám chữa bệnh */}
                <div className="px-4">
                  <div className="text-gray-600 font-medium py-2 border-b border-gray-100">
                    Khám chữa bệnh
                  </div>
                  <div className="pl-4 space-y-2 mt-2">
                    <Link
                      to="/services"
                      className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tất cả dịch vụ
                    </Link>
                    <Link
                      to="/services/specialist"
                      className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Khám Chuyên Khoa
                    </Link>
                    <Link
                      to="/doctors"
                      className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đội Ngũ Chuyên Gia
                    </Link>
                    <Link
                      to="/medical-procedure"
                      className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Thủ tục khám bệnh
                    </Link>
                    <Link
                      to="/price-list"
                      className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Bảng giá khám chữa bệnh
                    </Link>
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Liên hệ
                </Link>

                {/* Mobile Auth Section */}
                <div className="px-4 pt-4 border-t border-emerald-100 space-y-2">
                  {!userLocal ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600"
                        onClick={() => {
                          handleAuthClick("login");
                          setIsMenuOpen(false);
                        }}
                      >
                        Đăng nhập
                      </Button>
                      {/* <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          handleAuthClick("register");
                          setIsMenuOpen(false);
                        }}
                      >
                        Đăng ký
                      </Button> */}
                    </>
                  ) : (
                    <>
                      <div className="text-gray-600 font-medium py-2 border-b border-gray-100">
                        Xin chào {userLocal}
                      </div>
                      <div className="pl-4 space-y-2 mt-2">
                        {/* <Link
                          to="/notifications"
                          className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Thông báo
                        </Link>
                        <Link
                          to="/appointments"
                          className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Lịch hẹn khám
                        </Link>
                        <Link
                          to="/history"
                          className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Lịch sử khám bệnh
                        </Link> */}
                        <Link
                          to="/profile"
                          className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Thông tin tài khoản
                        </Link>{" "}
                        <Link
                          to="/history"
                          className="block text-gray-600 hover:text-emerald-600 py-2 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Lịch đặt khám
                        </Link>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600 mt-2"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
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
