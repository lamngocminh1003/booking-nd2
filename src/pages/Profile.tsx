import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Heart,
  Baby,
  Users,
  Settings,
  Loader2,
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
import { Link } from "react-router-dom";
import {
  fetchPatientInfoByUserLogin,
  createOrUpdatePatientThunk,
  PatientInfo,
  type YouMed_PatientCreateDto,
} from "@/store/slices/bookingCatalogSlice";
import ChildProfileModal from "@/components/modals/ChildProfileModal";

// ✅ Updated Child interface - chỉ các trường có trong API response
interface Child extends PatientInfo {
  avatar?: string; // UI only field
}

const Profile = () => {
  const [userStatus, setUserStatus] = useState<string>("Pending");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // ✅ Replace mock data with Redux state
  const [children, setChildren] = useState<Child[]>([]);

  // ✅ Get Redux state
  const {
    userInfo,
    provinces,
    wards,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);

  const {
    patientList,
    loadingPatient,
    error: patientError,
  } = useAppSelector((state) => state.bookingCatalog);

  const dispatch = useAppDispatch();
  const refreshToken = useSelector((state: any) => state.auth.refreshToken);
  const { toast } = useToast();

  // ✅ Fetch children data when component mounts
  useEffect(() => {
    const loadChildrenData = async () => {
      if (userInfo?.id) {
        setIsLoadingChildren(true);
        try {
          const result = await dispatch(fetchPatientInfoByUserLogin()).unwrap();

          // ✅ Handle array response from API
          if (result && Array.isArray(result) && result.length > 0) {
            // ✅ Convert API response to Children array
            const childrenData: Child[] = result.map(
              (patient: PatientInfo) => ({
                ...patient, // Spread all API fields as-is
                avatar: "", // Only add UI field
              })
            );

            setChildren(childrenData);
          } else {
            setChildren([]);
          }
        } catch (error) {
          console.error("❌ Failed to load children:", error);

          // ✅ Set children to empty array on error
          setChildren([]);

          // ✅ Only show toast for actual errors, not "no data" cases
          if (error?.message && !error.message.includes("404")) {
            toast({
              title: "Lỗi",
              description: "Không thể tải danh sách hồ sơ bệnh nhi",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoadingChildren(false);
        }
      }
    };

    loadChildrenData();
  }, [dispatch, userInfo?.id, toast]);

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // ✅ Hàm chuẩn hóa dữ liệu User thành serializable
  const serializeUser = (user: User) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  });

  // ✅ Helper functions
  const getGenderText = (genderId?: number, genderName?: string) => {
    // First try to use genderName if available
    if (genderName) {
      return genderName;
    }

    // Fallback to genderId mapping
    switch (genderId) {
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

  const calculateAge = (dateOfBirth: string, age?: number) => {
    // Use API age if available
    if (age !== undefined && age > 0) {
      return age;
    }

    // Calculate from dateOfBirth
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  }; // ✅ Enhanced loadChildrenData function
  useEffect(() => {
    const loadChildrenData = async () => {
      if (userInfo?.id) {
        setIsLoadingChildren(true);
        try {
          const result = await dispatch(fetchPatientInfoByUserLogin()).unwrap();

          // ✅ Handle array response from API
          if (result && Array.isArray(result) && result.length > 0) {
            // ✅ Convert API response to Children array
            const childrenData: Child[] = result.map(
              (patient: PatientInfo) => ({
                ...patient, // Spread all API fields as-is
                avatar: "", // Only add UI field
              })
            );

            setChildren(childrenData);
          } else {
            setChildren([]);
          }
        } catch (error) {
          console.error("❌ Failed to load children:", error);

          // ✅ Set children to empty array on error
          setChildren([]);

          // ✅ Only show toast for actual errors, not "no data" cases
          if (error?.message && !error.message.includes("404")) {
            toast({
              title: "Lỗi",
              description: "Không thể tải danh sách hồ sơ bệnh nhi",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoadingChildren(false);
        }
      }
    };

    loadChildrenData();
  }, [
    dispatch,
    userInfo?.id,
    userInfo?.fullName,
    userInfo?.phoneNumber,
    toast,
  ]);

  // ✅ Load specific child details
  const handleLoadChildDetails = async (childId: number) => {
    try {
      setSelectedChildId(childId);

      // ✅ Find the specific child from children array
      const targetChild = children.find((child) => child.id === childId);

      if (targetChild) {
        // Set the loaded data as editing child and open modal
        setEditingChild(targetChild);
        setIsChildModalOpen(true);
      } else {
        throw new Error("Không tìm thấy thông tin bệnh nhi");
      }
    } catch (error) {
      console.error("Load child details error:", error);
      toast({
        title: "Lỗi!",
        description: "Không thể tải thông tin chi tiết bệnh nhi",
        variant: "destructive",
      });
    } finally {
      setSelectedChildId(null);
    }
  };

  // ✅ Add modal states
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // ✅ Handle add new child
  const handleAddNewChild = () => {
    // Clear all editing states
    setEditingChild(null);
    setSelectedChildId(null);

    // Open modal in create mode
    setIsChildModalOpen(true);
  };

  const handleChildModalSubmit = async (data: any) => {
    try {
      setLoading(true);

      // ✅ Create proper API payload
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0,
        patientId: null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01",
        jobId: data.jobId || "001",
        provinceCode: data.provinceCode || "",
        wardCode: data.wardCode || "",
        address: data.address || userInfo?.address || "",
        bhytId: data.bhytId || "",
        licenseDate: data.licenseDate
          ? new Date(data.licenseDate).toISOString()
          : undefined,
        noiDKKCBId: data.noiDKKCBId || "",
        cccd: data.cccd || "",
        motherName: data.motherName || "",
        motherPhone: data.motherPhone || "",
        motherCCCD: data.motherCCCD || "",
        fatherName: data.fatherName || "",
        fatherPhone: data.fatherPhone || "",
        fatherCCCD: data.fatherCCCD || "",
        isGuardian: data.isGuardian || false,
      };

      const response = await dispatch(
        createOrUpdatePatientThunk(patientDto)
      ).unwrap();

      // ✅ Refresh the entire list after create/update
      try {
        const refreshedList = await dispatch(
          fetchPatientInfoByUserLogin()
        ).unwrap();

        if (refreshedList && Array.isArray(refreshedList)) {
          const updatedChildren: Child[] = refreshedList.map(
            (patient: PatientInfo) => ({
              ...patient,
              avatar: "",
            })
          );

          setChildren(updatedChildren);

          if (editingChild) {
            toast({
              title: "Thành công! ✅",
              description: `Cập nhật hồ sơ ${data.fullName} thành công`,
            });
          } else {
            toast({
              title: "Thành công! ✅",
              description: `Thêm hồ sơ ${data.fullName} thành công`,
            });
          }
        }
      } catch (refreshError) {
        console.error("Failed to refresh patient list:", refreshError);
        // Still show success message even if refresh fails
        toast({
          title: "Thành công! ✅",
          description: editingChild
            ? `Cập nhật hồ sơ ${data.fullName} thành công`
            : `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // Close modal and clear states
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);
    } catch (error: any) {
      console.error("Child modal submit error:", error);

      let errorMessage = editingChild
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

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

    if (userInfo?.provinceCode && wards?.length === 0) {
      dispatch(getWards(userInfo?.provinceCode));
    }
  }, [dispatch, provinces?.length, wards?.length, userInfo?.provinceCode]);

  const fullAddress = getFullAddressFromCodes(
    provinces,
    wards,
    userInfo?.address,
    userInfo?.provinceCode,
    userInfo?.wardCode
  );

  const handleFormSubmit = async (values: UserInfoFormValues) => {
    setLoading(true);
    try {
      await createOrUpdateUserInfo(values);

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
  }

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
                  wardCode: userInfo?.wardCode,
                }}
                onSubmit={handleFormSubmit}
                loading={loading}
                isEditMode={true}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* ✅ Header Card - Avatar và thông tin chính */}
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
                        {/* ✅ Show children count with loading state */}
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <Baby className="w-3 h-3" />
                          {isLoadingChildren ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : children.length === 0 ? (
                            <span className="text-orange-600">
                              Chưa có hồ sơ
                            </span>
                          ) : (
                            <span>{children.length} bệnh nhi</span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        ID: #{userInfo?.id} • Tham gia:{" "}
                        {formatDateTime(userInfo?.dateCreate)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ✅ Main Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Thông tin cá nhân</span>
                    <span className="sm:hidden">Cá nhân</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="children"
                    className="flex items-center gap-2"
                  >
                    <Baby className="w-4 h-4" />
                    <span className="hidden sm:inline">Hồ sơ bệnh nhi</span>
                    <span className="sm:hidden">Bệnh nhi</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Cài đặt</span>
                    <span className="sm:hidden">Cài đặt</span>
                  </TabsTrigger>
                </TabsList>

                {/* ✅ Profile Tab */}
                <TabsContent value="profile" className="space-y-6 mt-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa hồ sơ
                    </Button>
                  </div>

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
                            {formatDateTime(userInfo?.dateOfBirth)}
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
                </TabsContent>

                {/* ✅ Children Tab with Redux integration */}
                <TabsContent value="children" className="space-y-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Hồ sơ bệnh nhi</h2>
                      <p className="text-muted-foreground text-sm">
                        Quản lý thông tin sức khỏe của các bé trong gia đình
                      </p>
                    </div>
                    <Button
                      onClick={handleAddNewChild}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                      disabled={loading || isLoadingChildren}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {loading ? "Đang xử lý..." : "Thêm hồ sơ bé"}
                    </Button>
                  </div>

                  {/* ✅ Show loading state */}
                  {isLoadingChildren ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
                      <p className="text-gray-600">
                        Đang tải danh sách bệnh nhi...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* ✅ Stats Cards - accurate and helpful */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <Baby className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div className="ml-4">
                                <p className="text-2xl font-bold">
                                  {children.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Tổng bệnh nhi
                                </p>
                                {/* ✅ Show helpful message when no children */}
                                {children.length === 0 && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Chưa có hồ sơ
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* ✅ Accurate gender count with fallback */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <p className="text-2xl font-bold">
                                  {
                                    children.filter(
                                      (c) =>
                                        +c.genderId === 1 ||
                                        c.genderName === "Nam"
                                    ).length
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Bé trai
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-pink-100 rounded-lg">
                                <Heart className="w-6 h-6 text-pink-600" />
                              </div>
                              <div className="ml-4">
                                <p className="text-2xl font-bold">
                                  {
                                    children.filter(
                                      (c) =>
                                        +c.genderId === 0 ||
                                        c.genderName === "Nữ"
                                    ).length
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Bé gái
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Heart className="w-6 h-6 text-orange-600" />
                              </div>
                              <div className="ml-4">
                                <p className="text-2xl font-bold">
                                  {children.filter((c) => c.age <= 6).length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Trẻ dưới 6 tuổi
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* ✅ Children List - hiển thị tất cả children */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {children.map((child) => (
                          <Card
                            key={child.id}
                            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          >
                            <CardHeader>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={child.avatar} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                    {child.fullName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <CardTitle className="text-lg">
                                    {child.fullName}
                                  </CardTitle>
                                  <CardDescription>
                                    {calculateAge(child.dateOfBirth, child.age)}{" "}
                                    tuổi •{" "}
                                    {getGenderText(
                                      child.genderId,
                                      child.genderName
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    Sinh:{" "}
                                    {child.dateOfBirth
                                      ? formatDateTime(child.dateOfBirth)
                                      : "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Heart className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    BHYT: {child.bhytId || "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    SĐT:{" "}
                                    {child.motherPhone ||
                                      child.fatherPhone ||
                                      "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <IdCard className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    CCCD: {child.cccd || "Chưa cập nhật"}
                                  </span>
                                </div>
                                {/* ✅ Add patient ID display */}
                                <div className="flex items-center text-sm">
                                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    Mã BN: #{child.id}
                                  </span>
                                </div>
                                {/* ✅ Simplified guardian display */}
                                <div className="flex items-center text-sm">
                                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">
                                    Người giám hộ:{" "}
                                    {child.isGuardian
                                      ? "Chính mình"
                                      : "Phụ huynh"}
                                  </span>
                                </div>
                                {/* ✅ Province/Address info */}
                                {child.address && (
                                  <div className="flex items-center text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                      Địa chỉ: {child.address}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* ✅ Family Info - chỉ hiển thị khi có data */}
                              {(child.motherName || child.fatherName) && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    Thông tin gia đình:
                                  </p>
                                  <div className="space-y-1">
                                    {child.motherName && (
                                      <div className="flex items-center text-xs">
                                        <span className="text-gray-500 w-8">
                                          Mẹ:
                                        </span>
                                        <span className="text-gray-700">
                                          {child.motherName}
                                          {child.motherPhone &&
                                            ` - ${child.motherPhone}`}
                                        </span>
                                      </div>
                                    )}
                                    {child.fatherName && (
                                      <div className="flex items-center text-xs">
                                        <span className="text-gray-500 w-8">
                                          Bố:
                                        </span>
                                        <span className="text-gray-700">
                                          {child.fatherName}
                                          {child.fatherPhone &&
                                            ` - ${child.fatherPhone}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* ✅ Info badges - chỉ dùng API fields */}
                              <div className="flex flex-wrap gap-1">
                                {child.jobName && (
                                  <Badge variant="outline" className="text-xs">
                                    {child.jobName}
                                  </Badge>
                                )}
                                {child.nationalName && (
                                  <Badge variant="outline" className="text-xs">
                                    {child.nationalName}
                                  </Badge>
                                )}
                                {child.age <= 6 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700"
                                  >
                                    Trẻ nhỏ
                                  </Badge>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-between items-center pt-4 border-t">
                                <Link to={`/booking-flow?childId=${child.id}`}>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    Đặt lịch khám
                                  </Button>
                                </Link>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleLoadChildDetails(child.id)
                                    }
                                    disabled={
                                      loadingPatient &&
                                      selectedChildId === child.id
                                    }
                                  >
                                    {loadingPatient &&
                                    selectedChildId === child.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Edit className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {/* ✅ Empty State for Children */}
                        {children.length === 0 && (
                          <div className="col-span-full">
                            <Card className="text-center py-16 border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                              <CardContent>
                                <div className="max-w-md mx-auto">
                                  <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Baby className="w-10 h-10 text-emerald-600" />
                                  </div>

                                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Chưa có hồ sơ bệnh nhi
                                  </h3>

                                  <p className="text-gray-600 mb-6 leading-relaxed">
                                    Thêm hồ sơ của bé để bắt đầu đặt lịch khám
                                    và quản lý sức khỏe. Hồ sơ bệnh nhi giúp bạn
                                    theo dõi lịch sử khám bệnh và thông tin y tế
                                    của bé.
                                  </p>

                                  {/* ✅ Enhanced CTA buttons */}
                                  <div className="space-y-3">
                                    <Button
                                      onClick={handleAddNewChild}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-auto"
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <>
                                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                          Đang xử lý...
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-5 h-5 mr-2" />
                                          Tạo hồ sơ bệnh nhi đầu tiên
                                        </>
                                      )}
                                    </Button>

                                    <div className="text-sm text-gray-500">
                                      <p>
                                        💡 Mẹo: Chuẩn bị sẵn giấy khai sinh và
                                        sổ BHYT của bé để tạo hồ sơ nhanh chóng
                                      </p>
                                    </div>
                                  </div>

                                  {/* ✅ Benefits list */}
                                  <div className="mt-8 text-left">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                      Lợi ích khi tạo hồ sơ bệnh nhi:
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                        <span>Đặt lịch khám nhanh chóng</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                        <span>Lưu trữ lịch sử khám bệnh</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                        <span>Theo dõi lịch tiêm chủng</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                        <span>Quản lý thông tin BHYT</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ✅ Show error state */}
                  {patientError && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                          <p className="font-medium">Có lỗi xảy ra</p>
                          <p className="text-sm">{patientError}</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                          >
                            Thử lại
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ✅ Settings Tab */}
                <TabsContent value="settings" className="space-y-6 mt-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Cài đặt</h2>
                    <p className="text-muted-foreground text-sm">
                      Quản lý tùy chọn tài khoản và ứng dụng
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cài đặt tài khoản</CardTitle>
                        <CardDescription>
                          Quản lý thông tin đăng nhập và bảo mật
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Đổi mật khẩu</p>
                            <p className="text-sm text-muted-foreground">
                              Cập nhật mật khẩu để bảo mật tài khoản
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Đổi mật khẩu
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Xác thực 2 bước</p>
                            <p className="text-sm text-muted-foreground">
                              Tăng cường bảo mật với xác thực 2 bước
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Kích hoạt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cài đặt thông báo</CardTitle>
                        <CardDescription>
                          Quản lý các thông báo bạn muốn nhận
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Thông báo lịch khám</p>
                            <p className="text-sm text-muted-foreground">
                              Nhắc nhở về lịch khám sắp tới
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Đang bật
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Thông báo khuyến mãi</p>
                            <p className="text-sm text-muted-foreground">
                              Nhận thông báo về các chương trình ưu đãi
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Đang tắt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* ✅ Debug Panel for Development */}
                    {process.env.NODE_ENV === "development" && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="text-yellow-800">
                            🐛 Debug Panel
                          </CardTitle>
                          <CardDescription className="text-yellow-700">
                            Thông tin debug cho development
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-yellow-800">
                          <div>Children count: {children.length}</div>
                          <div>
                            Loading children: {isLoadingChildren.toString()}
                          </div>
                          <div>
                            Loading patient: {loadingPatient.toString()}
                          </div>
                          <div>Selected child ID: {selectedChildId}</div>
                          <div>Patient error: {patientError || "None"}</div>
                          <div>User status: {userStatus}</div>
                          {patientList && (
                            <div className="mt-4 p-2 bg-yellow-100 rounded border">
                              <p className="font-medium">
                                Current Patient Info:
                              </p>
                              <pre className="text-xs mt-1 overflow-auto">
                                {JSON.stringify(patientList, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Child Profile Modal */}
      <ChildProfileModal
        isOpen={isChildModalOpen}
        onClose={() => {
          setIsChildModalOpen(false);
          setEditingChild(null);
          setSelectedChildId(null);
        }}
        onSubmit={handleChildModalSubmit}
        initialData={editingChild || undefined}
        isEditing={!!editingChild}
        loading={loading}
        userInfo={userInfo}
      />
    </div>
  );
};

export default Profile;
