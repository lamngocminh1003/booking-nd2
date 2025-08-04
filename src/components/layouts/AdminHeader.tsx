import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { signOut } from "firebase/auth";
import { getOrCreateDeviceId } from "@/hooks/getOrCreateDeviceId";
import { logoutService } from "@/services/UsersServices";
import { clearAuthUser } from "@/store/slices/authSlice";
import { auth } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { removeAuthStorage, getAuthStorage } from "@/utils/authStorage";
import { useState, useEffect } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state?.auth?.user);

  // Thêm userLocal lấy từ local storage
  const [userLocal, setUserLocal] = useState<string | null>(null);
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getAuthStorage();
      setUserLocal(user);
    };
    checkUser();
  }, []);

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
      navigate("/"); // Chuyển đến trang profile
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất.",
        variant: "destructive",
      });
    }
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userLocal || user?.displayName}
                  </p>
                  <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Hồ sơ cá nhân</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
