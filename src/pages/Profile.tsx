import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { refreshAccessToken } from "@/services/UsersServices";
import { auth } from "@/lib/firebase";
import {
  User as UserIcon,
  IdCard,
  Camera,
  CheckCircle,
  Edit,
  Phone,
  Clock,
  MapPin,
  Calendar,
  Mail,
} from "lucide-react";
import { Clipboard } from "@capacitor/clipboard";
import UserInfoForm, {
  UserInfoFormValues,
} from "@/components/users/UserInfoForm";
import { useToast } from "@/hooks/use-toast";
import { createOrUpdateUserInfo, parseCCCDQR } from "@/services/UsersServices";
import { setAuth, setAuthUser } from "@/store/slices/authSlice";
import { setAuthStorage, getAuthStorage } from "@/utils/authStorage";
import { getUserInfo } from "@/store/slices/locationSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { User } from "firebase/auth";
import { getProvinces, getWards } from "@/store/slices/locationSlice";
import { getFullAddressFromCodes } from "@/lib/locationUtils";
const Profile = () => {
  const [userStatus, setUserStatus] = useState<string>("Pending");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    userInfo,
    provinces,
    wards,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);

  const dispatch = useAppDispatch();
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Thị Mai",
    phone: "0123456789",
    email: "mai.nguyen@email.com",
    address: "123 Đường ABC, Phường DEF, Quận GHI, TP.HCM",
    citizenId: "012345678901",
    avatar: "",
  });
  const { toast } = useToast();
  // ✅ Hàm chuẩn hóa dữ liệu User thành serializable
  const serializeUser = (user: User) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  });
  useEffect(() => {
    const checkUserStatus = async () => {
      const { status } = await getAuthStorage();
      setUserStatus(status);
    };
    checkUserStatus();
  }, []);
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Load location data if needed
  useEffect(() => {
    if (provinces?.length === 0) {
      dispatch(getProvinces());
    }

    if (userInfo?.districtCode && wards?.length === 0) {
      dispatch(getWards(userInfo?.districtCode));
    }
  }, [
    dispatch,
    provinces?.length,
    wards?.length,
    userInfo?.provinceCode,
    userInfo?.districtCode,
  ]);

  const fullAddress = getFullAddressFromCodes(
    provinces,
    wards,
    userInfo?.address,
    userInfo?.provinceCode,
    userInfo?.districtCode,
    userInfo?.wardCode
  );

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 0:
        return "Nam";
      case 1:
        return "Nữ";
      case 2:
        return "Khác";
      default:
        return "Không xác định";
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleFormSubmit = async (values: UserInfoFormValues) => {
    setLoading(true);
    try {
      await createOrUpdateUserInfo(values);

      // ✅ Gọi lại refreshAccessToken thủ công
      if (refreshToken) {
        const result = await refreshAccessToken(refreshToken);
        if (result) {
          const {
            accessToken,
            refreshToken: newRefreshToken,
            expiration,
            status,
          } = result.data;

          dispatch(
            setAuth({
              accessToken,
              refreshToken: newRefreshToken,
              expiration,
              status,
            })
          );

          const currentUser = auth.currentUser;
          if (currentUser) {
            const idToken = await currentUser.getIdToken(true);
            dispatch(
              setAuthUser({ user: serializeUser(currentUser), token: idToken })
            );
          }

          await setAuthStorage({
            accessToken,
            refreshToken: newRefreshToken,
            expiration,
            status,
            user: currentUser?.displayName || userInfo?.fullName || "",
          });
        }
      }

      const { status } = await getAuthStorage();
      toast({
        title: "Thành công!",
        description:
          userStatus === "Pending"
            ? "Đăng ký thông tin thành công!"
            : "Cập nhật thông tin thành công!",
      });

      setProfile((prev) => ({
        ...prev,
        fullName: values.fullName,
        phone: values.phoneNumber,
        email: values.email || "",
        citizenId: values.cccd || "",
      }));

      setUserStatus(status);
      setIsEditing(false);
      dispatch(getUserInfo());
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
  const getInitials = (fullName: string) => {
    const words = fullName?.trim()?.split(" ") || [];
    if (words?.length >= 2) {
      return words[0]?.charAt(0) + words[words?.length - 1]?.charAt(0);
    }
    return words[0]?.charAt(0) || "";
  };

  // If user status is pending, show the form
  if (userStatus === "Pending") {
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
  } // Get full address from codes const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          {isEditing ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="mb-4"
                >
                  ← Quay lại
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                  Chỉnh sửa thông tin
                </h1>
              </div>
              <UserInfoForm
                defaultValues={{
                  fullName: userInfo?.fullName,
                  phoneNumber: userInfo?.phoneNumber,
                  email: userInfo?.email,
                  cccd: userInfo?.cccd,
                  dateOfBirth: userInfo?.dateOfBirth.split("T")[0],
                  gender: userInfo?.gender,
                  address: userInfo?.address,
                  provinceCode: userInfo?.provinceCode,
                  districtCode: userInfo?.districtCode,
                  wardCode: userInfo?.wardCode,
                }}
                onSubmit={handleFormSubmit}
                loading={loading}
                isEditMode={true}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card - Avatar và thông tin chính */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                          {getInitials(userInfo?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {userInfo?.fullName}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                        <Badge
                          variant={userInfo?.isActive ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {userInfo?.isActive
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <UserIcon className="w-3 h-3" />
                          Phụ huynh
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        ID: #{userInfo?.id} • Tham gia:{" "}
                        {formatDate(userInfo?.dateCreate)}
                      </p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa hồ sơ
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Thông tin liên lạc
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </div>
                      <p className="font-medium">{userInfo?.phoneNumber}</p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                      <p className="font-medium">
                        {userInfo?.email || "Chưa cập nhật"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IdCard className="w-5 h-5 text-primary" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        Ngày sinh
                      </div>
                      <p className="font-medium">
                        {formatDate(userInfo?.dateOfBirth)}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <UserIcon className="w-4 h-4" />
                        Giới tính
                      </div>
                      <p className="font-medium">
                        {getGenderText(userInfo?.gender)}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <IdCard className="w-4 h-4" />
                        CCCD/CMND
                      </div>
                      <p className="font-medium">
                        {userInfo?.cccd || "Chưa cập nhật"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address & System Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Địa chỉ & Hệ thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-4 h-4" />
                        Địa chỉ
                      </div>
                      <p className="font-medium whitespace-pre-line">
                        {fullAddress}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        Cập nhật cuối
                      </div>
                      <p className="font-medium text-sm">
                        {formatDateTime(userInfo?.dateUpdate)}
                      </p>
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
