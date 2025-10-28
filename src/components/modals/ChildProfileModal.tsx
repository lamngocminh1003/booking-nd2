"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Upload, Heart, Users, Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PatientInfo } from "@/store/slices/bookingCatalogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  getProvinces,
  getWards,
  resetLocation,
} from "@/store/slices/locationSlice";
import {
  getListNation,
  getListJob,
  getListGender,
} from "@/store/slices/hospitalDirectorySlice";

const childProfileSchema = z
  .object({
    fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    dateOfBirth: z.string().min(1, "Vui lòng chọn ngày sinh"),
    genderId: z.number().min(0, "Vui lòng chọn giới tính"),
    nationalId: z.coerce.string().optional(),
    jobId: z.coerce.string().optional(),
    provinceCode: z.coerce.string().optional(),
    wardCode: z.coerce.string().optional(),
    address: z.coerce.string().optional(),
    bhytId: z.coerce.string().optional(),
    licenseDate: z.coerce.string().optional(),
    noiDKKCBId: z.coerce.string().optional(),
    cccd: z.coerce.string().optional(),
    motherName: z.coerce.string().optional(),
    motherPhone: z.coerce.string().optional(),
    motherCCCD: z.coerce.string().optional(),
    fatherName: z.coerce.string().optional(),
    fatherPhone: z.coerce.string().optional(),
    fatherCCCD: z.coerce.string().optional(),
    isGuardian: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // ✅ Require at least one parent/guardian contact
      const hasMotherInfo = data.motherName && data.motherPhone;
      const hasFatherInfo = data.fatherName && data.fatherPhone;
      return hasMotherInfo || hasFatherInfo;
    },
    {
      message:
        "Cần có ít nhất thông tin liên hệ của 1 người (bố/mẹ hoặc người đại diện)",
      path: ["motherName"], // Show error on motherName field
    }
  );

type ChildProfileFormData = z.infer<typeof childProfileSchema>;

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChildProfileFormData) => Promise<void>;
  initialData?: Partial<PatientInfo>;
  isEditing?: boolean;
  loading?: boolean;
  userInfo?: any; // ✅ Add userInfo prop
}

const ChildProfileModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  loading = false,
  userInfo, // ✅ Add userInfo prop
}: ChildProfileModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Get data from Redux store
  const {
      provinces,
      wards,
      loading: locationLoading,
    } = useSelector((state: RootState) => state.location),
    {
      nations,
      jobs,
      genders,
      loading: directoryLoading,
    } = useSelector((state: RootState) => state.hospitalDirectory);

  const [activeTab, setActiveTab] = useState<"basic" | "family">("basic");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ChildProfileFormData>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      genderId: 0,
      nationalId: "01", // Default to "Kinh"
      jobId: "001", // Default to "Trẻ Dưới 6 Tuổi"
      provinceCode: "",
      wardCode: "",
      address: "",
      bhytId: "",
      licenseDate: "",
      noiDKKCBId: "",
      cccd: "",
      motherName: "",
      motherPhone: "",
      motherCCCD: "",
      fatherName: "",
      fatherPhone: "",
      fatherCCCD: "",
      isGuardian: false,
      // ❌ Loại bỏ các trường không cần thiết
    },
  });

  // ✅ Load initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      form.reset({
        fullName: initialData.fullName || "",
        dateOfBirth: initialData.dateOfBirth?.split("T")[0] || "",
        genderId: initialData.genderId || 0,
        nationalId: initialData.nationalId || "01",
        jobId: initialData.jobId || "001",
        provinceCode: initialData.provinceCode || "",
        wardCode: initialData.wardCode || "",
        address: initialData.address || "",
        bhytId: initialData.bhytId || "",
        licenseDate: initialData.licenseDate?.split("T")[0] || "",
        noiDKKCBId:
          initialData.noiDKKCBId != null ? String(initialData.noiDKKCBId) : "",
        cccd: initialData.cccd || "",
        motherName: initialData.motherName || "",
        motherPhone: initialData.motherPhone || "",
        motherCCCD: initialData.motherCCCD || "",
        fatherName: initialData.fatherName || "",
        fatherPhone: initialData.fatherPhone || "",
        fatherCCCD: initialData.fatherCCCD || "",
        isGuardian: initialData.isGuardian || false,
      });
    }
  }, [initialData, isEditing, form]);

  // ✅ Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // ✅ CHỈ reset form về empty values khi đóng modal
      // KHÔNG điền auto-fill ở đây
      form.reset({
        fullName: "",
        dateOfBirth: "",
        genderId: 0,
        nationalId: "01",
        jobId: "001",
        provinceCode: "",
        wardCode: "",
        address: "",
        bhytId: "",
        licenseDate: "",
        noiDKKCBId: "",
        cccd: "",
        motherName: "",
        motherPhone: "",
        motherCCCD: "",
        fatherName: "",
        fatherPhone: "",
        fatherCCCD: "",
        isGuardian: false,
      });

      // Reset other states
      setActiveTab("basic");
      setAvatarPreview("");
      setSelectedProvince(""); // ✅ Reset selected province
    }
  }, [isOpen, form]);

  // ✅ Load dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Load all dropdown data
      dispatch(getListNation());
      dispatch(getListJob());
      dispatch(getListGender());
      dispatch(getProvinces());
    }
  }, [isOpen, dispatch]);

  // ✅ Load wards when province changes
  useEffect(() => {
    if (selectedProvince) {
      dispatch(getWards(selectedProvince));
    } else {
      // Reset wards when no province selected
      dispatch(resetLocation("wards"));
    }
  }, [selectedProvince, dispatch]);

  // ✅ Watch province field changes
  const watchedProvince = form.watch("provinceCode");
  useEffect(() => {
    if (watchedProvince && watchedProvince !== selectedProvince) {
      setSelectedProvince(watchedProvince);
    }
  }, [watchedProvince]);

  const handleSubmit = async (data: ChildProfileFormData) => {
    try {
      await onSubmit(data);

      toast({
        title: "Thành công!",
        description: isEditing
          ? "Cập nhật hồ sơ bệnh nhi thành công"
          : "Thêm hồ sơ bệnh nhi mới thành công",
      });

      onClose();
    } catch (error) {
      console.error("Form submit error:", error);
      toast({
        title: "Lỗi!",
        description: isEditing
          ? "Không thể cập nhật hồ sơ bệnh nhi"
          : "Không thể tạo hồ sơ bệnh nhi mới",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Add state để track age validation
  const [ageValidationError, setAgeValidationError] = useState<string | null>(
    null
  );
  const [isAgeValid, setIsAgeValid] = useState<boolean>(true);

  // ✅ Enhanced age calculation với validation
  const calculateAgeFromDate = (
    dateOfBirth: string
  ): { age: number; isValid: boolean; error?: string } => {
    if (!dateOfBirth) return { age: 0, isValid: true };

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // ✅ Validate age
    if (age >= 18) {
      return {
        age,
        isValid: false,
        error: `Không thể tạo hồ sơ bệnh nhi cho người ${age} tuổi. Hệ thống chỉ hỗ trợ trẻ em dưới 18 tuổi.`,
      };
    }

    if (age < 0) {
      return {
        age: 0,
        isValid: false,
        error: "Ngày sinh không hợp lệ (không thể là tương lai)",
      };
    }

    return { age, isValid: true };
  };

  // ✅ Update watched date of birth với validation
  const watchedDateOfBirth = form.watch("dateOfBirth");
  const ageValidation = calculateAgeFromDate(watchedDateOfBirth);
  const currentAge = ageValidation.age;

  // ✅ Update age validation effect
  useEffect(() => {
    if (watchedDateOfBirth) {
      const validation = calculateAgeFromDate(watchedDateOfBirth);
      setIsAgeValid(validation.isValid);
      setAgeValidationError(validation.error || null);

      // ✅ Clear job selection if age is invalid
      if (!validation.isValid) {
        // Don't auto-select job for invalid ages
        return;
      }

      // ✅ Only auto-select job if age is valid and jobs are loaded
      if (validation.isValid && jobs.length > 0) {
        let appropriateJobId = "";

        if (validation.age < 6) {
          const childJob = jobs.find(
            (job: any) =>
              job.jobName.toLowerCase().includes("trẻ dưới 6") ||
              job.jobName.toLowerCase().includes("trẻ em") ||
              job.jobId === "001"
          );
          appropriateJobId = childJob?.jobId || "001";
        } else if (validation.age >= 6 && validation.age <= 17) {
          const studentJob = jobs.find(
            (job: any) =>
              job.jobName.toLowerCase().includes("học sinh") ||
              job.jobName.toLowerCase().includes("sinh viên") ||
              job.jobId === "002"
          );
          appropriateJobId = studentJob?.jobId || "001";
        }

        if (appropriateJobId && appropriateJobId !== form.getValues("jobId")) {
          form.setValue("jobId", appropriateJobId);
        }
      }
    } else {
      setIsAgeValid(true);
      setAgeValidationError(null);
    }
  }, [watchedDateOfBirth, jobs, form]);

  const TabButton = ({
    tab,
    label,
    icon: Icon,
  }: {
    tab: typeof activeTab;
    label: string;
    icon: any;
  }) => (
    <Button
      type="button"
      variant={activeTab === tab ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(tab)}
      className="flex items-center gap-2"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );

  // ✅ Add helper function to determine if field should be auto-filled
  const isCurrentUserField = (fieldType: "mother" | "father" | "address") => {
    if (isEditing || !userInfo) return false;

    const isFemaleUser = userInfo.gender === 1; // 1 = Female
    const isMaleUser = userInfo.gender === 0; // 0 = Male

    return (
      (fieldType === "mother" && isFemaleUser) ||
      (fieldType === "father" && isMaleUser) ||
      fieldType === "address"
    );
  };

  // ✅ Tách riêng logic auto-fill khi modal MỞ - CHỈ điền theo gender
  useEffect(() => {
    // ✅ CHỈ chạy khi modal VỪA MỞ và không phải editing mode
    if (isOpen && !isEditing && userInfo) {
      const isFemaleUser = userInfo.gender === 1; // 1 = Female
      const isMaleUser = userInfo.gender === 0; // 0 = Male

      // ✅ Auto-fill form với dữ liệu user - CHỈ điền theo gender
      form.reset({
        fullName: "",
        dateOfBirth: "",
        genderId: 0,
        nationalId: "01",
        jobId: "001",

        // ✅ Auto-fill address
        provinceCode: userInfo.provinceCode || "",
        wardCode: userInfo.wardCode || "",
        address: userInfo.address || "",

        bhytId: "",
        licenseDate: "",
        noiDKKCBId: "",
        cccd: "",

        // ✅ CHỈ điền thông tin mẹ nếu user là nữ
        motherName: isFemaleUser ? userInfo.fullName || "" : "",
        motherPhone: isFemaleUser ? userInfo.phoneNumber || "" : "",
        motherCCCD: isFemaleUser ? userInfo.cccd || "" : "",

        // ✅ CHỈ điền thông tin bố nếu user là nam
        fatherName: isMaleUser ? userInfo.fullName || "" : "",
        fatherPhone: isMaleUser ? userInfo.phoneNumber || "" : "",
        fatherCCCD: isMaleUser ? userInfo.cccd || "" : "",

        isGuardian: false,
      });

      // ✅ Set selected province và load wards
      if (userInfo.provinceCode) {
        setSelectedProvince(userInfo.provinceCode);
        dispatch(getWards(userInfo.provinceCode));
      }
    }
  }, [isOpen, isEditing, userInfo, form, dispatch]); // ✅ Thêm isOpen vào dependency

  // ✅ Cập nhật summary section để chỉ hiển thị thông tin được auto-fill
  {
    !isEditing && userInfo && (
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4 text-gray-600" />
          Thông tin đã tự động điền từ tài khoản của bạn
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          {/* ✅ CHỈ hiển thị thông tin được auto-fill dựa trên gender */}
          {userInfo.gender === 1 && (
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-medium">✓</span>
              <div>
                <strong>Thông tin mẹ:</strong> {userInfo.fullName} -{" "}
                {userInfo.phoneNumber} - CCCD: {userInfo.cccd}
              </div>
            </div>
          )}
          {userInfo.gender === 0 && (
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-medium">✓</span>
              <div>
                <strong>Thông tin bố:</strong> {userInfo.fullName} -{" "}
                {userInfo.phoneNumber} - CCCD: {userInfo.cccd}
              </div>
            </div>
          )}
          {/* ✅ Luôn hiển thị thông tin địa chỉ */}
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-medium">✓</span>
            <div>
              <strong>Địa chỉ:</strong> {userInfo.address} (Mã tỉnh:{" "}
              {userInfo.provinceCode}, Mã phường: {userInfo.wardCode})
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600 font-medium">⚠</span>
            <div>
              <strong>Lưu ý:</strong> Bạn có thể chỉnh sửa tất cả thông tin đã
              tự động điền nếu cần thiết
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Cập nhật help section trong basic tab
  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
      <Heart className="w-4 h-4 text-gray-600" />
      Thông tin tự động điền
    </h4>
    <div className="space-y-2 text-sm text-gray-700">
      {!isEditing && userInfo && (
        <>
          {userInfo.gender === 1 && (
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-medium">✓</span>
              <div>
                <strong>Thông tin mẹ</strong> đã được tự động điền từ tài khoản
                của bạn (có thể chỉnh sửa)
              </div>
            </div>
          )}
          {userInfo.gender === 0 && (
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-medium">✓</span>
              <div>
                <strong>Thông tin bố</strong> đã được tự động điền từ tài khoản
                của bạn (có thể chỉnh sửa)
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-medium">✓</span>
            <div>
              <strong>Địa chỉ</strong> đã được tự động điền từ tài khoản của bạn
              (có thể chỉnh sửa)
            </div>
          </div>
        </>
      )}
      <div className="flex items-start gap-2">
        <span className="text-blue-600 font-medium">📝</span>
        <div>
          Cần điền thêm thông tin của bố/mẹ còn lại và thông tin bệnh nhi
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-orange-600 font-medium">⚠</span>
        <div>
          <strong>Lưu ý:</strong> Cần có ít nhất 1 thông tin liên hệ (số điện
          thoại) để hệ thống ghi nhận
        </div>
      </div>
    </div>
  </div>;

  // ✅ Check if editing patient over 18 (block editing)
  const isEditingAdult = useMemo(() => {
    if (!isEditing || !initialData?.dateOfBirth) return false;

    const validation = calculateAgeFromDate(
      initialData.dateOfBirth.split("T")[0]
    );
    return !validation.isValid && validation.age >= 18;
  }, [isEditing, initialData]);

  // ✅ Show blocking message for adult editing
  if (isEditingAdult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Không thể chỉnh sửa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-800 mb-1">
                    Hồ sơ người lớn
                  </h3>
                  <p className="text-sm text-red-700">
                    Bệnh nhân <strong>{initialData?.fullName}</strong> đã{" "}
                    <strong>
                      {
                        calculateAgeFromDate(
                          initialData?.dateOfBirth?.split("T")[0] || ""
                        ).age
                      }{" "}
                      tuổi
                    </strong>
                    .
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Hệ thống chỉ cho phép quản lý hồ sơ của trẻ em dưới 18 tuổi.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Lý do:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Đây là hệ thống quản lý bệnh nhi (pediatric)</li>
                <li>
                  Người trên 18 tuổi cần sử dụng hệ thống dành cho người lớn
                </li>
                <li>Tuân thủ quy định về phân loại bệnh nhân theo độ tuổi</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        // ❌ Prevent automatic closing
      }}
    >
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-emerald-600" />
              {isEditing
                ? "Chỉnh sửa hồ sơ bệnh nhi"
                : "Thêm hồ sơ bệnh nhi mới"}
              <Badge
                variant={isEditing ? "secondary" : "default"}
                className={
                  isEditing
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {isEditing ? "Chỉnh sửa" : "Tạo mới"}
              </Badge>
            </div>

            {/* ✅ Close button (X) in header - ONLY this one */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin cho bệnh nhi"
              : "Điền thông tin đầy đủ để tạo hồ sơ bệnh nhi mới"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              <TabButton tab="basic" label="Thông tin cơ bản" icon={Baby} />
            </div>

            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    {/* Avatar section - existing code */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={avatarPreview} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-lg">
                            {form.watch("fullName")?.charAt(0) || "B"}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-2 cursor-pointer hover:bg-emerald-700 transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {form.watch("fullName") || "Tên bệnh nhi"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {currentAge > 0
                            ? `${currentAge} tuổi`
                            : "Chưa có thông tin tuổi"}
                        </p>
                        {/* ✅ Only show patient ID badge if editing */}
                        {isEditing && initialData?.id && (
                          <Badge
                            variant="outline"
                            className="mt-1 bg-blue-50 text-blue-700"
                          >
                            Mã BN: #{initialData.id}
                          </Badge>
                        )}
                        {/* ✅ Show "Mới tạo" badge when adding new child */}
                        {!isEditing && (
                          <Badge
                            variant="outline"
                            className="mt-1 bg-green-50 text-green-700"
                          >
                            Hồ sơ mới
                          </Badge>
                        )}
                        {form.watch("genderId") !== undefined && (
                          <Badge variant="outline" className="mt-1">
                            {form.watch("genderId") === 1
                              ? "Nam" // genderId: 1 = Nam
                              : form.watch("genderId") === 0
                              ? "Nữ" // genderId: 0 = Nữ
                              : "Khác"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và tên *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập họ và tên" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date of Birth */}
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày sinh *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                max={new Date().toISOString().split("T")[0]}
                                className={
                                  !isAgeValid ? "border-red-500 bg-red-50" : ""
                                }
                                onChange={(e) => {
                                  field.onChange(e);
                                  const validation = calculateAgeFromDate(
                                    e.target.value
                                  );
                                }}
                              />
                            </FormControl>

                            {/* ✅ Show age validation results */}
                            {currentAge > 0 && (
                              <FormDescription
                                className={
                                  isAgeValid ? "text-blue-600" : "text-red-600"
                                }
                              >
                                🎂 Tuổi hiện tại: <strong>{currentAge}</strong>{" "}
                                tuổi
                                {isAgeValid ? (
                                  <>
                                    {currentAge < 6 && (
                                      <span className="text-green-600">
                                        {" "}
                                        → Tự động chọn "Trẻ dưới 6 tuổi"
                                      </span>
                                    )}
                                    {currentAge >= 6 && currentAge < 18 && (
                                      <span className="text-purple-600">
                                        {" "}
                                        → Tự động chọn "Học sinh"
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-red-600 block mt-1 font-medium">
                                    ❌ {ageValidationError}
                                  </span>
                                )}
                              </FormDescription>
                            )}

                            <FormMessage />

                            {/* ✅ Show age restriction info */}
                            {!ageValidationError && (
                              <FormDescription className="text-gray-500 text-xs">
                                💡 Chỉ được tạo hồ sơ cho trẻ em dưới 18 tuổi
                              </FormDescription>
                            )}
                          </FormItem>
                        )}
                      />

                      {/* ✅ Gender - Using API data */}
                      <FormField
                        control={form.control}
                        name="genderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới tính *</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field?.value?.toString()}
                              disabled={directoryLoading.gender}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      directoryLoading.gender
                                        ? "Đang tải..."
                                        : "Chọn giới tính"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genders.map((gender: any) => (
                                  <SelectItem
                                    key={gender.genderId}
                                    value={gender.genderId.toString()}
                                  >
                                    {gender.genderName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* CCCD */}
                      <FormField
                        control={form.control}
                        name="cccd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CCCD/CMND</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập số CCCD/CMND"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* ✅ Nation - Using API data */}
                      <FormField
                        control={form.control}
                        name="nationalId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dân tộc</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={directoryLoading.nation}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      directoryLoading.nation
                                        ? "Đang tải..."
                                        : "Chọn dân tộc"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nations.map((nation: any) => (
                                  <SelectItem
                                    key={nation.nationId}
                                    value={nation.nationId}
                                  >
                                    {nation.nationName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* ✅ Job - Using API data */}
                      <FormField
                        control={form.control}
                        name="jobId"
                        render={({ field }) => {
                          const selectedJob = jobs.find(
                            (job: any) => job.jobId === field.value
                          );
                          const isAutoSelected =
                            watchedDateOfBirth &&
                            isAgeValid && // ✅ Only show auto-selected if age is valid
                            ((currentAge < 6 &&
                              selectedJob?.jobName
                                ?.toLowerCase()
                                .includes("trẻ dưới 6")) ||
                              (currentAge >= 6 &&
                                currentAge < 18 && // ✅ Change to < 18
                                selectedJob?.jobName
                                  ?.toLowerCase()
                                  .includes("học sinh")));

                          return (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Nghề nghiệp
                                {isAutoSelected && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 text-xs"
                                  >
                                    Tự động chọn
                                  </Badge>
                                )}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={directoryLoading.job || !isAgeValid} // ✅ Disable if age invalid
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={
                                      !isAgeValid
                                        ? "border-red-200 bg-red-50" // ✅ Red styling for invalid age
                                        : isAutoSelected
                                        ? "border-green-200 bg-green-50"
                                        : ""
                                    }
                                  >
                                    <SelectValue
                                      placeholder={
                                        !isAgeValid
                                          ? "Độ tuổi không hợp lệ"
                                          : directoryLoading.job
                                          ? "Đang tải..."
                                          : "Chọn nghề nghiệp"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {jobs.map((job: any) => {
                                    // ✅ Only highlight appropriate jobs if age is valid
                                    const isRecommended =
                                      isAgeValid &&
                                      currentAge > 0 &&
                                      ((currentAge < 6 &&
                                        job.jobName
                                          .toLowerCase()
                                          .includes("trẻ dưới 6")) ||
                                        (currentAge >= 6 &&
                                          currentAge < 18 &&
                                          job.jobName
                                            .toLowerCase()
                                            .includes("học sinh")));

                                    return (
                                      <SelectItem
                                        key={job.jobId}
                                        value={job.jobId}
                                        className={
                                          isRecommended
                                            ? "bg-green-50 text-green-800"
                                            : ""
                                        }
                                        disabled={!isAgeValid} // ✅ Disable all options if age invalid
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>{job.jobName}</span>
                                          {isRecommended && (
                                            <Badge
                                              variant="outline"
                                              className="bg-green-100 text-green-700 text-xs"
                                            >
                                              Phù hợp
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>

                              {/* ✅ Show validation messages */}
                              {!isAgeValid && ageValidationError && (
                                <FormDescription className="text-red-600 text-xs">
                                  ❌ {ageValidationError}
                                </FormDescription>
                              )}

                              {/* ✅ Show auto-selection explanation only if valid */}
                              {isAutoSelected && isAgeValid && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✅ Đã tự động chọn dựa trên tuổi ({currentAge}{" "}
                                  tuổi). Bạn có thể thay đổi nếu cần.
                                </FormDescription>
                              )}

                              {/* ✅ Show age-based suggestions only if valid */}
                              {currentAge > 0 &&
                                !isAutoSelected &&
                                isAgeValid && (
                                  <FormDescription className="text-blue-600 text-xs">
                                    💡 Gợi ý:
                                    {currentAge < 6
                                      ? ' Chọn "Trẻ dưới 6 tuổi" cho bé ' +
                                        currentAge +
                                        " tuổi"
                                      : currentAge >= 6 && currentAge < 18
                                      ? ' Chọn "Học sinh" cho trẻ ' +
                                        currentAge +
                                        " tuổi"
                                      : " Chọn nghề nghiệp phù hợp với tuổi " +
                                        currentAge}
                                  </FormDescription>
                                )}

                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* BHYT */}
                      <FormField
                        control={form.control}
                        name="bhytId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã thẻ BHYT</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập mã thẻ BHYT"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* License Date */}
                      <FormField
                        control={form.control}
                        name="licenseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày cấp BHYT</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* NoiDKKCB */}
                      <FormField
                        control={form.control}
                        name="noiDKKCBId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nơi đăng ký KCB</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập mã nơi đăng ký KCB"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Mã cơ sở y tế đăng ký khám chữa bệnh ban đầu
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ✅ Province/Ward selection - with auto-fill indicators */}
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="provinceCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Tỉnh/Thành phố
                              {!isEditing &&
                                userInfo?.provinceCode &&
                                field.value === userInfo.provinceCode && (
                                  <span className="text-xs text-green-600">
                                    (Tự động từ địa chỉ của bạn)
                                  </span>
                                )}
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedProvince(value);
                                dispatch(getWards(value)); // Load wards when province changes
                              }}
                              value={field.value}
                              disabled={locationLoading.provinces}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={
                                    !isEditing &&
                                    userInfo?.provinceCode &&
                                    field.value === userInfo.provinceCode
                                      ? "border-green-200 bg-green-50"
                                      : ""
                                  }
                                >
                                  <SelectValue
                                    placeholder={
                                      locationLoading.provinces
                                        ? "Đang tải..."
                                        : "Chọn tỉnh/thành phố"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {provinces &&
                                  provinces.length > 0 &&
                                  provinces?.map((province: any) => (
                                    <SelectItem
                                      key={province.provinceCode}
                                      value={province.provinceCode}
                                    >
                                      {province.provinceName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {!isEditing &&
                              userInfo?.provinceCode &&
                              field.value === userInfo.provinceCode && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✓ Đã tự động chọn từ địa chỉ tài khoản của bạn
                                </FormDescription>
                              )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wardCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Phường/Xã
                              {!isEditing &&
                                userInfo?.wardCode &&
                                field.value === userInfo.wardCode && (
                                  <span className="text-xs text-green-600">
                                    (Tự động từ địa chỉ của bạn)
                                  </span>
                                )}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={
                                locationLoading.wards || !selectedProvince
                              }
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={
                                    !isEditing &&
                                    userInfo?.wardCode &&
                                    field.value === userInfo.wardCode
                                      ? "border-green-200 bg-green-50"
                                      : ""
                                  }
                                >
                                  <SelectValue
                                    placeholder={
                                      !selectedProvince
                                        ? "Chọn tỉnh/thành phố trước"
                                        : locationLoading.wards
                                        ? "Đang tải..."
                                        : "Chọn phường/xã"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {wards &&
                                  wards?.length > 0 &&
                                  wards?.map((ward: any) => (
                                    <SelectItem
                                      key={ward.wardCode}
                                      value={ward.wardCode}
                                    >
                                      {ward.wardName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {!isEditing &&
                              userInfo?.wardCode &&
                              field.value === userInfo.wardCode && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✓ Đã tự động chọn từ địa chỉ của bạn
                                </FormDescription>
                              )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address - with auto-fill indicator */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="flex items-center gap-2">
                            Địa chỉ
                            {!isEditing &&
                              userInfo?.address &&
                              field.value === userInfo.address && (
                                <span className="text-xs text-green-600">
                                  (Tự động từ địa chỉ của bạn)
                                </span>
                              )}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Nhập địa chỉ đầy đủ"
                              className={`min-h-[80px] ${
                                !isEditing &&
                                userInfo?.address &&
                                field.value === userInfo.address
                                  ? "border-green-200 bg-green-50"
                                  : ""
                              }`}
                              {...field}
                            />
                          </FormControl>
                          {!isEditing &&
                            userInfo?.address &&
                            field.value === userInfo.address && (
                              <FormDescription className="text-green-600 text-xs">
                                ✓ Đã tự động điền từ địa chỉ tài khoản của bạn
                              </FormDescription>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ✅ Update Family section with auto-fill indicators */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Mother/Female Guardian Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          {form.watch("isGuardian")
                            ? "Thông tin người đại diện nữ"
                            : "Thông tin mẹ"}
                          {/* ✅ Show indicator if this is current user's info */}
                          {isCurrentUserField("mother") && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 text-xs"
                            >
                              Thông tin của bạn
                            </Badge>
                          )}
                        </h3>

                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "Họ và tên người đại diện nữ"
                                  : "Họ và tên mẹ"}
                                {isCurrentUserField("mother") && (
                                  <span className="text-xs text-green-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập họ tên người đại diện nữ (bà, chị, cô, v.v.)"
                                      : "Nhập họ và tên mẹ"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("mother")
                                      ? "border-green-200 bg-green-50 focus:border-green-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("mother") && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.fullName}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="motherPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "Số điện thoại người đại diện nữ"
                                  : "Số điện thoại mẹ"}
                                {isCurrentUserField("mother") && (
                                  <span className="text-xs text-green-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập SĐT người đại diện nữ"
                                      : "Nhập số điện thoại mẹ"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("mother")
                                      ? "border-green-200 bg-green-50 focus:border-green-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("mother") && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.phoneNumber}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="motherCCCD"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "CCCD/CMND người đại diện nữ"
                                  : "CCCD/CMND mẹ"}
                                {isCurrentUserField("mother") && (
                                  <span className="text-xs text-green-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập CCCD người đại diện nữ"
                                      : "Nhập CCCD/CMND mẹ"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("mother")
                                      ? "border-green-200 bg-green-50 focus:border-green-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("mother") && (
                                <FormDescription className="text-green-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.cccd}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Father/Male Guardian Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          {form.watch("isGuardian")
                            ? "Thông tin người đại diện nam"
                            : "Thông tin bố"}
                          {/* ✅ Show indicator if this is current user's info */}
                          {isCurrentUserField("father") && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 text-xs"
                            >
                              Thông tin của bạn
                            </Badge>
                          )}
                        </h3>

                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "Họ và tên người đại diện nam"
                                  : "Họ và tên bố"}
                                {isCurrentUserField("father") && (
                                  <span className="text-xs text-blue-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập họ tên người đại diện nam (ông, anh, chú, v.v.)"
                                      : "Nhập họ và tên bố"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("father")
                                      ? "border-blue-200 bg-blue-50 focus:border-blue-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("father") && (
                                <FormDescription className="text-blue-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.fullName}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fatherPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "Số điện thoại người đại diện nam"
                                  : "Số điện thoại bố"}
                                {isCurrentUserField("father") && (
                                  <span className="text-xs text-blue-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập SĐT người đại diện nam"
                                      : "Nhập số điện thoại bố"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("father")
                                      ? "border-blue-200 bg-blue-50 focus:border-blue-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("father") && (
                                <FormDescription className="text-blue-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.phoneNumber}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fatherCCCD"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {form.watch("isGuardian")
                                  ? "CCCD/CMND người đại diện nam"
                                  : "CCCD/CMND bố"}
                                {isCurrentUserField("father") && (
                                  <span className="text-xs text-blue-600">
                                    (Có thể chỉnh sửa)
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập CCCD người đại diện nam"
                                      : "Nhập CCCD/CMND bố"
                                  }
                                  {...field}
                                  className={
                                    isCurrentUserField("father")
                                      ? "border-blue-200 bg-blue-50 focus:border-blue-400"
                                      : ""
                                  }
                                />
                              </FormControl>
                              {isCurrentUserField("father") && (
                                <FormDescription className="text-blue-600 text-xs">
                                  ✓ Đã tự động điền: {userInfo?.cccd}
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* ✅ Add help section */}
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-gray-600" />
                        Hướng dẫn điền thông tin
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-medium">✓</span>
                          <div>
                            <strong>Bố mẹ ruột:</strong> Không chọn "Người đại
                            diện hợp pháp", điền thông tin bố mẹ như bình thường
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium">✓</span>
                          <div>
                            <strong>Người đại diện:</strong> Chọn "Người đại
                            diện hợp pháp", điền thông tin người đại diện (ông
                            bà, anh chị, người thân, v.v.)
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-medium">⚠</span>
                          <div>
                            <strong>Lưu ý:</strong> Cần có ít nhất 1 thông tin
                            liên hệ (số điện thoại) để hệ thống ghi nhận
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Family Information Tab - Updated with correct isGuardian meaning */}
            {activeTab === "family" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    {/* ✅ Updated isGuardian explanation */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Loại quan hệ với bệnh nhi
                      </h3>
                      <FormField
                        control={form.control}
                        name="isGuardian"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-blue-800 font-medium">
                                Người đại diện hợp pháp *
                              </FormLabel>
                              <FormDescription className="text-blue-700 text-sm">
                                <strong>Chọn khi:</strong> Bệnh nhân không có
                                thông tin bố mẹ mà là thông tin người đại diện
                                (ông bà, anh chị, người thân khác, v.v.)
                              </FormDescription>
                              <FormDescription className="text-blue-600 text-xs mt-2">
                                💡 <strong>Hướng dẫn:</strong>
                                <br />• <strong>Không chọn:</strong> Điền thông
                                tin bố mẹ ruột
                                <br />• <strong>Có chọn:</strong> Điền thông tin
                                người đại diện hợp pháp
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-6" />

                    {/* ✅ Dynamic labels based on isGuardian value */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Mother/Female Guardian Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          {form.watch("isGuardian")
                            ? "Thông tin người đại diện nữ"
                            : "Thông tin mẹ"}
                        </h3>

                        <FormField
                          control={form.control}
                          name="motherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "Họ và tên người đại diện nữ"
                                  : "Họ và tên mẹ"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập họ tên người đại diện nữ (bà, chị, cô, v.v.)"
                                      : "Nhập họ và tên mẹ"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="motherPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "Số điện thoại người đại diện nữ"
                                  : "Số điện thoại mẹ"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập SĐT người đại diện nữ"
                                      : "Nhập số điện thoại mẹ"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="motherCCCD"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "CCCD/CMND người đại diện nữ"
                                  : "CCCD/CMND mẹ"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập CCCD người đại diện nữ"
                                      : "Nhập CCCD/CMND mẹ"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Father/Male Guardian Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          {form.watch("isGuardian")
                            ? "Thông tin người đại diện nam"
                            : "Thông tin bố"}
                        </h3>

                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "Họ và tên người đại diện nam"
                                  : "Họ và tên bố"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập họ tên người đại diện nam (ông, anh, chú, v.v.)"
                                      : "Nhập họ và tên bố"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fatherPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "Số điện thoại người đại diện nam"
                                  : "Số điện thoại bố"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập SĐT người đại diện nam"
                                      : "Nhập số điện thoại bố"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fatherCCCD"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("isGuardian")
                                  ? "CCCD/CMND người đại diện nam"
                                  : "CCCD/CMND bố"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    form.watch("isGuardian")
                                      ? "Nhập CCCD người đại diện nam"
                                      : "Nhập CCCD/CMND bố"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* ✅ Add summary section explaining auto-fill */}
                    {!isEditing && userInfo && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-gray-600" />
                          Thông tin đã tự động điền từ tài khoản của bạn
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {/* Show what was auto-filled based on gender */}
                          {userInfo.gender === 1 && (
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 font-medium">
                                ✓
                              </span>
                              <div>
                                <strong>Thông tin mẹ:</strong>{" "}
                                {userInfo.fullName} - {userInfo.phoneNumber} -
                                CCCD: {userInfo.cccd}
                              </div>
                            </div>
                          )}
                          {userInfo.gender === 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 font-medium">
                                ✓
                              </span>
                              <div>
                                <strong>Thông tin bố:</strong>{" "}
                                {userInfo.fullName} - {userInfo.phoneNumber} -
                                CCCD: {userInfo.cccd}
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 font-medium">
                              ✓
                            </span>
                            <div>
                              <strong>Địa chỉ:</strong> {userInfo.address} (Mã
                              tỉnh: {userInfo.provinceCode}, Mã phường:{" "}
                              {userInfo.wardCode})
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-orange-600 font-medium">
                              ⚠
                            </span>
                            <div>
                              <strong>Lưu ý:</strong> Bạn có thể chỉnh sửa tất
                              cả thông tin đã tự động điền nếu cần thiết
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="gap-2 pt-4 border-t">
              <div className="flex justify-between items-center w-full">
                {/* Loading states info */}
                <div className="text-sm text-gray-500">
                  {(locationLoading.provinces ||
                    locationLoading.wards ||
                    directoryLoading.nation ||
                    directoryLoading.job ||
                    directoryLoading.gender) && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Đang tải dữ liệu...
                    </span>
                  )}
                  {loading && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Đang xử lý...
                    </span>
                  )}
                  {!loading && form.formState.isDirty && (
                    <span className="text-orange-600">
                      * Có thay đổi chưa lưu
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="min-w-[100px]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || !form.formState.isValid || !isAgeValid} // ✅ Add age validation
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                    title={
                      !isAgeValid
                        ? "Không thể tạo hồ sơ cho người trên 18 tuổi"
                        : loading
                        ? "Đang xử lý..."
                        : "Thực hiện thao tác"
                    }
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {!isAgeValid
                      ? "Độ tuổi không hợp lệ"
                      : loading
                      ? isEditing
                        ? "Đang cập nhật..."
                        : "Đang tạo..."
                      : isEditing
                      ? "Cập nhật"
                      : "Thêm mới"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChildProfileModal;
