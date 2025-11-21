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
import OnlineRegistrationModal from "@/components/modals/OnlineRegistrationModal";
import { auth } from "@/lib/firebase";
import {
  User as UserIcon,
  IdCard,
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
  CalendarCheck,
  Activity,
} from "lucide-react";
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

interface Child extends PatientInfo {
  avatar?: string;
}

const Profile = () => {
  const [userStatus, setUserStatus] = useState<string>("Pending");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const { appointments } = useAppSelector((state) => state.appointments);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number>();
  const [selectedPatientName, setSelectedPatientName] = useState<string>();

  const [children, setChildren] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("profileActiveTab");
    return savedTab && ["profile", "children", "settings"].includes(savedTab)
      ? savedTab
      : "profile";
  });

  // ✅ Save to localStorage when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    localStorage.setItem("profileActiveTab", newTab);
  };
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

  useEffect(() => {
    const loadChildrenData = async () => {
      if (userInfo?.id) {
        setIsLoadingChildren(true);
        try {
          const result = await dispatch(fetchPatientInfoByUserLogin()).unwrap();

          if (result && Array.isArray(result) && result.length > 0) {
            const childrenData: Child[] = result.map(
              (patient: PatientInfo) => ({
                ...patient,
                avatar: "",
              })
            );

            setChildren(childrenData);
          } else {
            setChildren([]);
          }
        } catch (error) {
          console.error("❌ Failed to load children:", error);

          setChildren([]);

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

  const serializeUser = (user: User) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  });

  const getGenderText = (genderId?: number, genderName?: string) => {
    if (genderName) {
      return genderName;
    }

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
    if (age !== undefined && age > 0) {
      return age;
    }

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
  };
  useEffect(() => {
    const loadChildrenData = async () => {
      if (userInfo?.id) {
        setIsLoadingChildren(true);
        try {
          const result = await dispatch(fetchPatientInfoByUserLogin()).unwrap();

          if (result && Array.isArray(result) && result.length > 0) {
            const childrenData: Child[] = result.map(
              (patient: PatientInfo) => ({
                ...patient,
                avatar: "",
              })
            );

            setChildren(childrenData);
          } else {
            setChildren([]);
          }
        } catch (error) {
          console.error("❌ Failed to load children:", error);

          setChildren([]);

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
  const handleViewRegistrations = (children) => {
    setSelectedPatientId(children.id);
    setSelectedPatientName(children.fullName);
    setShowModal(true);
  };

  const handleLoadChildDetails = async (childId: number) => {
    try {
      setSelectedChildId(childId);

      const targetChild = children.find((child) => child.id === childId);

      if (targetChild) {
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

  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const handleAddNewChild = () => {
    setEditingChild(null);
    setSelectedChildId(null);

    setIsChildModalOpen(true);
  };

  const handleChildModalSubmit = async (data: any) => {
    try {
      setLoading(true);

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
        toast({
          title: "Thành công! ✅",
          description: editingChild
            ? `Cập nhật hồ sơ ${data.fullName} thành công`
            : `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

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

  const getInitials = (fullName: string) => {
    const words = fullName?.trim()?.split(" ") || [];
    if (words?.length >= 2) {
      return words[0]?.charAt(0) + words[words?.length - 1]?.charAt(0);
    }
    return words[0]?.charAt(0) || "";
  };

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
              <Card className="overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
                    <div className="relative">
                      <Avatar className="w-16 h-16 sm:w-24 sm:h-24 border-2 sm:border-4 border-background shadow-lg">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-lg sm:text-2xl font-bold bg-primary/20 text-primary">
                          {getInitials(userInfo?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                        {userInfo?.fullName}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                        <Badge
                          variant={userInfo?.isActive ? "default" : "secondary"}
                          className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">
                            {userInfo?.isActive
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </span>
                          <span className="sm:hidden">
                            {userInfo?.isActive ? "Hoạt động" : "Tạm dừng"}
                          </span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Phụ huynh
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-0.5 sm:gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          <Baby className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {isLoadingChildren ? (
                            <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                          ) : children.length === 0 ? (
                            <span className="text-orange-600">
                              <span className="hidden sm:inline">
                                Chưa có hồ sơ
                              </span>
                              <span className="sm:hidden">0 hồ sơ</span>
                            </span>
                          ) : (
                            <span>
                              <span className="hidden sm:inline">
                                {children.length} bệnh nhi
                              </span>
                              <span className="sm:hidden">
                                {children.length} bé
                              </span>
                            </span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4">
                        <span className="hidden sm:inline">
                          ID: #{userInfo?.id} • Tham gia:{" "}
                          {formatDateTime(userInfo?.dateCreate)}
                        </span>
                        <span className="sm:hidden">
                          #{userInfo?.id} •{" "}
                          {new Date(userInfo?.dateCreate).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Thông tin cá nhân</span>
                    <span className="sm:hidden">Cá nhân</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="children"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <Baby className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Hồ sơ bệnh nhi</span>
                    <span className="sm:hidden">Bệnh nhi</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Cài đặt</span>
                    <span className="sm:hidden">Cài đặt</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="profile"
                  className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Thông tin cá nhân
                    </h2>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                      <span className="sm:hidden">Chỉnh sửa</span>
                    </Button>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 sm:pb-6">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          <span className="text-sm sm:text-base">
                            Thông tin liên lạc
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                            Số điện thoại
                          </div>
                          <p className="font-medium text-sm sm:text-base">
                            {userInfo?.phoneNumber}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                            Email
                          </div>
                          <p className="font-medium text-sm sm:text-base">
                            {userInfo?.email || "Chưa cập nhật"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 sm:pb-6">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                          <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          <span className="text-sm sm:text-base">
                            Thông tin cá nhân
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            Ngày sinh
                          </div>
                          <p className="font-medium text-sm sm:text-base">
                            {formatDateTime(userInfo?.dateOfBirth)}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            Giới tính
                          </div>
                          <p className="font-medium text-sm sm:text-base">
                            {getGenderText(userInfo?.gender)}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <IdCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            CCCD/CMND
                          </div>
                          <p className="font-medium text-sm sm:text-base">
                            {userInfo?.cccd || "Chưa cập nhật"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2 sm:pb-6">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          <span className="text-sm sm:text-base">
                            Địa chỉ & Hệ thống
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            Địa chỉ
                          </div>
                          <p className="font-medium whitespace-pre-line text-sm sm:text-base">
                            {fullAddress}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            Cập nhật cuối
                          </div>
                          <p className="font-medium text-xs sm:text-sm">
                            {formatDateTime(userInfo?.dateUpdate)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent
                  value="children"
                  className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Hồ sơ bệnh nhi
                      </h2>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Quản lý thông tin sức khỏe của các bé trong gia đình
                      </p>
                    </div>
                    <Button
                      onClick={handleAddNewChild}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                      disabled={loading || isLoadingChildren}
                    >
                      {loading ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {loading ? "Đang xử lý..." : "Thêm hồ sơ bé"}
                      </span>
                      <span className="sm:hidden">
                        {loading ? "Xử lý..." : "Thêm bé"}
                      </span>
                    </Button>
                  </div>

                  {isLoadingChildren ? (
                    <div className="text-center py-8 sm:py-12">
                      <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin mx-auto mb-3 sm:mb-4 text-emerald-600" />
                      <p className="text-gray-600 text-sm sm:text-base">
                        Đang tải danh sách bệnh nhi...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="shadow-sm">
                          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center">
                              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                                <Baby className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <p className="text-lg sm:text-2xl font-bold">
                                  {children.length}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Tổng bệnh nhi
                                </p>
                                {children.length === 0 && (
                                  <p className="text-xs text-orange-600 mt-0.5 sm:mt-1">
                                    Chưa có hồ sơ
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center">
                              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <p className="text-lg sm:text-2xl font-bold">
                                  {
                                    children.filter(
                                      (c) =>
                                        +c.genderId === 1 ||
                                        c.genderName === "Nam"
                                    ).length
                                  }
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Bé trai
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center">
                              <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg">
                                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-pink-600" />
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <p className="text-lg sm:text-2xl font-bold">
                                  {
                                    children.filter(
                                      (c) =>
                                        +c.genderId === 0 ||
                                        c.genderName === "Nữ"
                                    ).length
                                  }
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Bé gái
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                            <div className="flex items-center">
                              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                              </div>
                              <div className="ml-2 sm:ml-4">
                                <p className="text-lg sm:text-2xl font-bold">
                                  {children.filter((c) => c.age <= 6).length}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  <span className="hidden sm:inline">
                                    Trẻ dưới 6 tuổi
                                  </span>
                                  <span className="sm:hidden">Dưới 6T</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {children.map((child) => (
                          <Card
                            key={child.id}
                            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-sm"
                          >
                            <CardHeader className="pb-2 sm:pb-6">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                  <AvatarImage src={child.avatar} />
                                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm sm:text-base">
                                    {child.fullName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <CardTitle className="text-base sm:text-lg">
                                    {child.fullName}
                                  </CardTitle>
                                  <CardDescription className="text-xs sm:text-sm">
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
                            <CardContent className="space-y-3 sm:space-y-4 pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                              <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    <span className="hidden sm:inline">
                                      Sinh:{" "}
                                      {child.dateOfBirth
                                        ? formatDateTime(child.dateOfBirth)
                                        : "Chưa cập nhật"}
                                    </span>
                                    <span className="sm:hidden">
                                      {child.dateOfBirth
                                        ? new Date(
                                            child.dateOfBirth
                                          ).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                          })
                                        : "Chưa cập nhật"}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    BHYT: {child.bhytId || "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    SĐT:{" "}
                                    {child.motherPhone ||
                                      child.fatherPhone ||
                                      "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <IdCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    CCCD: {child.cccd || "Chưa cập nhật"}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    Mã BN: #{child.id}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                  <span className="text-gray-600">
                                    <span className="hidden sm:inline">
                                      Người giám hộ:{" "}
                                      {child.isGuardian
                                        ? "Chính mình"
                                        : "Phụ huynh"}
                                    </span>
                                    <span className="sm:hidden">
                                      {child.isGuardian
                                        ? "Tự giám hộ"
                                        : "Phụ huynh"}
                                    </span>
                                  </span>
                                </div>
                                {child.address && (
                                  <div className="flex items-center text-xs sm:text-sm">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2" />
                                    <span className="text-gray-600 truncate">
                                      <span className="hidden sm:inline">
                                        Địa chỉ: {child.address}
                                      </span>
                                      <span className="sm:hidden">
                                        {child.address}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>

                              {(child.motherName || child.fatherName) && (
                                <div className="space-y-1.5 sm:space-y-2">
                                  <p className="text-xs sm:text-sm font-medium text-gray-700">
                                    Thông tin gia đình:
                                  </p>
                                  <div className="space-y-0.5 sm:space-y-1">
                                    {child.motherName && (
                                      <div className="flex items-center text-xs">
                                        <span className="text-gray-500 w-6 sm:w-8">
                                          Mẹ:
                                        </span>
                                        <span className="text-gray-700 truncate">
                                          {child.motherName}
                                          {child.motherPhone &&
                                            ` - ${child.motherPhone}`}
                                        </span>
                                      </div>
                                    )}
                                    {child.fatherName && (
                                      <div className="flex items-center text-xs">
                                        <span className="text-gray-500 w-6 sm:w-8">
                                          Bố:
                                        </span>
                                        <span className="text-gray-700 truncate">
                                          {child.fatherName}
                                          {child.fatherPhone &&
                                            ` - ${child.fatherPhone}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1">
                                {child.jobName && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {child.jobName}
                                  </Badge>
                                )}
                                {child.nationalName && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {child.nationalName}
                                  </Badge>
                                )}
                                {child.age <= 6 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5"
                                  >
                                    Trẻ nhỏ
                                  </Badge>
                                )}
                              </div>

                              <div className="flex justify-between items-center pt-3 sm:pt-4 border-t">
                                <Link to={`/booking-flow`}>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                                  >
                                    <span className="hidden sm:inline">
                                      Đặt lịch khám
                                    </span>
                                    <span className="sm:hidden">Đặt lịch</span>
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  className="bg-emerald-50 hover:bg-emerald-500 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-500"
                                  onClick={() => handleViewRegistrations(child)}
                                >
                                  <span className="hidden sm:inline">
                                    Xem lịch khám
                                  </span>
                                  <span className="sm:hidden">
                                    Xem lịch khám
                                  </span>
                                </Button>
                                <div className="flex space-x-1 sm:space-x-2">
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
                                    className="h-7 sm:h-8 px-2 sm:px-3"
                                  >
                                    {loadingPatient &&
                                    selectedChildId === child.id ? (
                                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    ) : (
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {children.length === 0 && (
                          <div className="col-span-full">
                            <Card className="text-center py-12 sm:py-16 border-2 border-dashed border-emerald-200 bg-emerald-50/30 shadow-sm">
                              <CardContent className="px-4 sm:px-6">
                                <div className="max-w-md mx-auto">
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Baby className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                                  </div>

                                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                                    Chưa có hồ sơ bệnh nhi
                                  </h3>

                                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                                    Thêm hồ sơ của bé để bắt đầu đặt lịch khám
                                    và quản lý sức khỏe. Hồ sơ bệnh nhi giúp bạn
                                    theo dõi lịch sử khám bệnh và thông tin y tế
                                    của bé.
                                  </p>

                                  <div className="space-y-2 sm:space-y-3">
                                    <Button
                                      onClick={handleAddNewChild}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 h-auto text-sm sm:text-base"
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <>
                                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                                          <span className="hidden sm:inline">
                                            Đang xử lý...
                                          </span>
                                          <span className="sm:hidden">
                                            Xử lý...
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                          <span className="hidden sm:inline">
                                            Tạo hồ sơ bệnh nhi đầu tiên
                                          </span>
                                          <span className="sm:hidden">
                                            Tạo hồ sơ đầu tiên
                                          </span>
                                        </>
                                      )}
                                    </Button>

                                    <div className="text-xs sm:text-sm text-gray-500">
                                      <p>
                                        💡 Mẹo: Chuẩn bị sẵn giấy khai sinh và
                                        sổ BHYT của bé để tạo hồ sơ nhanh chóng
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-6 sm:mt-8 text-left">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                      Lợi ích khi tạo hồ sơ bệnh nhi:
                                    </p>
                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                                        <span>Đặt lịch khám nhanh chóng</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                                        <span>Lưu trữ lịch sử khám bệnh</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                                        <span>Theo dõi lịch tiêm chủng</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mr-1.5 sm:mr-2 flex-shrink-0" />
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

                  {patientError && (
                    <Card className="border-red-200 bg-red-50 shadow-sm">
                      <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                        <div className="text-center text-red-600">
                          <p className="font-medium text-sm sm:text-base">
                            Có lỗi xảy ra
                          </p>
                          <p className="text-xs sm:text-sm">{patientError}</p>
                          <Button
                            variant="outline"
                            className="mt-3 sm:mt-4 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                            onClick={() => window.location.reload()}
                          >
                            Thử lại
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent
                  value="settings"
                  className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
                >
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                      Cài đặt
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Quản lý tùy chọn tài khoản và ứng dụng
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <Card className="shadow-sm">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">
                              {
                                appointments.filter(
                                  (apt) =>
                                    apt.status === "confirmed" ||
                                    apt.status === "pending"
                                ).length
                              }
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Lịch sắp tới
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">
                              {
                                appointments.filter(
                                  (apt) => apt.status === "completed"
                                ).length
                              }
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Đã hoàn thành
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">
                              {appointments.length}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Tổng lịch hẹn
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {appointments.length > 0 && (
                    <Card className="mb-4 sm:mb-6 shadow-sm">
                      <CardHeader className="pb-2 sm:pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            Lịch hẹn gần đây
                          </CardTitle>
                          <Link to="/appointments">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              Xem tất cả
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div className="space-y-3 sm:space-y-4">
                          {appointments.slice(0, 3).map((apt) => (
                            <div
                              key={apt.id}
                              className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm sm:text-base">
                                  {apt.childName}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {apt.doctorName} • {apt.specialty}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {apt.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {apt.time}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  apt.status === "confirmed"
                                    ? "default"
                                    : apt.status === "pending"
                                    ? "secondary"
                                    : apt.status === "completed"
                                    ? "outline"
                                    : "destructive"
                                }
                                className="text-xs px-1.5 py-0.5"
                              >
                                {apt.status === "confirmed"
                                  ? "Đã xác nhận"
                                  : apt.status === "pending"
                                  ? "Chờ xác nhận"
                                  : apt.status === "completed"
                                  ? "Đã khám"
                                  : "Đã hủy"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
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
      />{" "}
      <OnlineRegistrationModal
        open={showModal}
        onOpenChange={setShowModal}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
      />
    </div>
  );
};

export default Profile;
