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
  const [userLocal, setUserLocal] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getAuthStorage();
      setUserLocal(user);
    };
    checkUser();
  }, [userLocal]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      try {
        const deviceId = await getOrCreateDeviceId();
        await logoutService(deviceId);
      } finally {
        dispatch(clearAuthUser()); // Cập nhật Redux
        await removeAuthStorage();
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
              <Link
                to="/"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Trang chủ
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                  <span>Dịch vụ</span>
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
                    <Link to="/services/general" className="w-full">
                      Khám Tổng Quát
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/services/laboratory" className="w-full">
                      Xét Nghiệm Y Học
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/services/mental" className="w-full">
                      Sức Khỏe Tinh Thần
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/services/dental" className="w-full">
                      Khám Nha Khoa
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/services/surgery" className="w-full">
                      Gói Phẫu Thuật
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Doctors Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                  <span>Bác sĩ</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/doctors" className="w-full">
                      Tất cả bác sĩ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/doctors?specialty=pediatrics" className="w-full">
                      Nhi khoa
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/doctors?specialty=cardiology" className="w-full">
                      Tim mạch
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/doctors?specialty=neurology" className="w-full">
                      Thần kinh
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/doctors?specialty=dermatology"
                      className="w-full"
                    >
                      Da liễu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/doctors?specialty=orthopedics"
                      className="w-full"
                    >
                      Chấn thương chỉnh hình
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
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                      <span> Xin chào {userLocal}</span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white">
                      {" "}
                      <DropdownMenuItem asChild>
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
                        <Link to="/children" className="w-full">
                          Hồ sơ bệnh nhi
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/insurance" className="w-full">
                          Bảo hiểm y tế
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/history" className="w-full">
                          Lịch sử khám bệnh
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">
                          Thông tin tài khoản
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
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/services"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Dịch vụ
                </Link>
                <Link
                  to="/doctors"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Bác sĩ
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2"
                >
                  Liên hệ
                </Link>
                <div className="px-4 pt-4 border-t border-emerald-100 space-y-2">
                  {!userLocal ? (
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
                        Xin chào {userLocal}
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
