import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, IdCard, Camera, Edit } from "lucide-react";
import { Clipboard } from "@capacitor/clipboard";
import UserInfoForm, {
  UserInfoFormValues,
} from "@/components/users/UserInfoForm";
import { useToast } from "@/hooks/use-toast";
import {
  createOrUpdateUserInfo,
  parseCCCDQR,
  refreshAccessToken,
} from "@/services/UsersServices";
import { setAuth, clearAuthUser } from "@/store/slices/authSlice";
import { setAuthStorage } from "@/utils/authStorage";
const Profile = () => {
  const [userStatus, setUserStatus] = useState<string>("pending"); // Mock status
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Nguyễn Thị Mai",
    phone: "0123456789",
    email: "mai.nguyen@email.com",
    address: "123 Đường ABC, Phường DEF, Quận GHI, TP.HCM",
    citizenId: "012345678901",
    avatar: "",
  });
  const { toast } = useToast();

  // Mock function to get auth storage
  const getAuthStorage = async () => {
    return { status: "pending" }; // Mock implementation
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const { status } = await getAuthStorage();
      setUserStatus(status);
    };
    checkUserStatus();
  }, []);
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const dispatch = useDispatch();

  const handleFormSubmit = async (values: UserInfoFormValues) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      await createOrUpdateUserInfo(values);
      try {
        const result = await refreshAccessToken(refreshToken);

        if (result.success) {
          const { accessToken, refreshToken, expiration, status } = result.data;

          dispatch(setAuth({ accessToken, refreshToken, expiration, status }));
          // Lưu token
          await setAuthStorage({
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiration: expiration,
            status: status,
          });

          if (!refreshToken || !expiration) return;
        }
      } catch (err) {
        console.error("❌ Token refresh failed", err);
        dispatch(clearAuthUser());
      }
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Thành công!",
        description:
          userStatus === "pending"
            ? "Đăng ký thông tin thành công!"
            : "Cập nhật thông tin thành công!",
      });

      // Update local profile state
      setProfile((prev) => ({
        ...prev,
        fullName: values.fullName,
        phone: values.phoneNumber,
        email: values.email || "",
        citizenId: values.cccd || "",
      }));

      setUserStatus("completed");
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleReadCCCDFromClipboard = async () => {
    try {
      const { value } = await Clipboard.read();
      if (!value) {
        alert("Không có dữ liệu trong clipboard.");
        return;
      }
      console.log("Đã đọc dữ liệu từ clipboard:", value);

      const parsedData = await parseCCCDQR(value);

      alert("Đã quét và điền dữ liệu CCCD thành công!");
    } catch (error) {
      console.error("Lỗi quét CCCD:", error);
      alert("Không thể xử lý mã QR CCCD. Hãy thử lại.");
    }
  };
  // If user status is pending, show the form
  if (userStatus === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hoàn thiện thông tin cá nhân
              </h1>
              <p className="text-gray-600">
                Vui lòng cung cấp thông tin cá nhân để hoàn tất đăng ký
              </p>
            </div>

            <UserInfoForm
              onSubmit={handleFormSubmit}
              loading={loading}
              isEditMode={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // If user status is completed, show profile view with edit option
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thông tin cá nhân
            </h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>

          {isEditing ? (
            <div>
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="mb-4"
                >
                  ← Quay lại
                </Button>
              </div>
              <UserInfoForm
                defaultValues={{
                  fullName: profile.fullName,
                  phoneNumber: profile.phone,
                  email: profile.email,
                  cccd: profile.citizenId,
                  dateOfBirth: "1990-01-01", // Mock date
                  gender: 1, // Mock gender
                  address: profile.address,
                  provinceCode: "79", // Mock province code
                  districtCode: "001", // Mock district code
                  wardCode: "00001", // Mock ward code
                }}
                onSubmit={handleFormSubmit}
                loading={loading}
                isEditMode={true}
              />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profile.avatar} />
                          <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                            {profile.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{profile.fullName}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge
                        variant="outline"
                        className="w-full justify-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Phụ huynh
                      </Badge>
                      <Badge
                        variant="outline"
                        className="w-full justify-center text-emerald-600 border-emerald-200"
                      >
                        <IdCard className="w-4 h-4 mr-2" />
                        Đã xác thực
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Information Display */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Thông tin chi tiết</CardTitle>
                        <CardDescription>
                          Thông tin cá nhân của bạn
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Họ và tên
                        </Label>
                        <p className="mt-1">{profile.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Số điện thoại
                        </Label>
                        <p className="mt-1">{profile.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Email
                        </Label>
                        <p className="mt-1">{profile.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Số CCCD/CMND
                        </Label>
                        <p className="mt-1">{profile.citizenId}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Địa chỉ
                      </Label>
                      <p className="mt-1">{profile.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
