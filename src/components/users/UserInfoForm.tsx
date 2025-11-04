import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useCapacitor } from "../../hooks/useCapacitor";
import { Clipboard } from "@capacitor/clipboard";
import { parseCCCDQR } from "@/services/UsersServices";
import {
  getProvinces,
  getWards,
  resetLocation,
} from "@/store/slices/locationSlice";
import { User, Phone, Mail, MapPin, IdCard, Calendar } from "lucide-react";

export interface UserInfoFormValues {
  fullName: string;
  phoneNumber: string;
  email?: string;
  cccd?: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  provinceCode: string;
  wardCode: string;
}

interface UserInfoFormProps {
  defaultValues?: Partial<UserInfoFormValues>;
  onSubmit: (values: UserInfoFormValues) => void;
  loading?: boolean;
  isEditMode?: boolean;
}

const UserInfoForm = ({
  defaultValues,
  onSubmit,
  loading = false,
  isEditMode = false,
}: UserInfoFormProps) => {
  const dispatch = useAppDispatch();
  const {
    provinces,
    wards,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserInfoFormValues>({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      cccd: "",
      dateOfBirth: "",
      gender: 0,
      address: "",
      provinceCode: "",
      wardCode: "",
      ...defaultValues,
    },
  });
  const { isNative } = useCapacitor();

  const watchedProvinceCode = watch("provinceCode");

  // Load danh sách tỉnh/thành phố
  useEffect(() => {
    dispatch(getProvinces());
  }, [dispatch]);

  // Nếu có sẵn provinceCode (chế độ edit) → gọi load wards trực tiếp
  useEffect(() => {
    if (isEditMode && defaultValues?.provinceCode) {
      dispatch(getWards(defaultValues.provinceCode));
      setValue("provinceCode", defaultValues.provinceCode);
    }
  }, [isEditMode, defaultValues?.provinceCode, dispatch, setValue]);

  // Khi đã có danh sách wards, kiểm tra để set wardCode
  useEffect(() => {
    if (isEditMode && defaultValues?.wardCode && wards.length > 0) {
      setValue("wardCode", defaultValues.wardCode);
    }
  }, [isEditMode, defaultValues?.wardCode, wards, setValue]);

  // Khi chọn lại tỉnh mới: reset xã và load lại xã trực tiếp
  useEffect(() => {
    if (watchedProvinceCode) {
      dispatch(resetLocation("wards"));
      setValue("wardCode", "");
      dispatch(getWards(watchedProvinceCode));
    }
  }, [watchedProvinceCode, dispatch, setValue]);

  const handleFormSubmit = (data: UserInfoFormValues) => {
    onSubmit({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    });
  };

  const handleReadCCCDFromClipboard = async () => {
    try {
      const { value } = await Clipboard.read();
      if (!value) {
        alert("Không có dữ liệu trong clipboard.");
        return;
      }
      const parsedData = await parseCCCDQR(value);

      setValue("fullName", parsedData.fullName);
      setValue("dateOfBirth", parsedData.dateOfBirth);
      setValue("gender", parsedData.gender);
      setValue("cccd", parsedData.cccd);

      alert("Đã quét và điền dữ liệu CCCD thành công!");
    } catch (error) {
      console.error("Lỗi quét CCCD:", error);
      alert("Không thể xử lý mã QR CCCD. Hãy thử lại.");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="text-base sm:text-xl">
          {isEditMode
            ? "Cập nhật thông tin cá nhân"
            : "Đăng ký thông tin cá nhân"}
          {isNative && (
            <div className="mt-2 sm:mt-0 sm:ml-2 sm:inline-block">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleReadCCCDFromClipboard()}
                className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                📋{" "}
                <span className="hidden sm:inline">Quét CCCD từ Clipboard</span>
                <span className="sm:hidden">Quét CCCD</span>
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="fullName" className="text-xs sm:text-sm">
                Họ và tên *
              </Label>
              <div className="relative">
                <User className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  id="fullName"
                  {...register("fullName", { required: "Họ tên là bắt buộc" })}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-sm"
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="phoneNumber" className="text-xs sm:text-sm">
                Số điện thoại *
              </Label>
              <div className="relative">
                <Phone className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber", {
                    required: "Số điện thoại là bắt buộc",
                  })}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-sm"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-sm"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="cccd" className="text-xs sm:text-sm">
                Số CCCD/CMND
              </Label>
              <div className="relative">
                <IdCard className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  id="cccd"
                  {...register("cccd")}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-sm"
                  placeholder="Nhập số CCCD/CMND"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm">
                Ngày sinh *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth", {
                    required: "Ngày sinh là bắt buộc",
                  })}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-sm"
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-xs sm:text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Giới tính *</Label>
              <RadioGroup
                value={watch("gender")?.toString() || "0"}
                onValueChange={(value) => setValue("gender", parseInt(value))}
                className="flex space-x-4 sm:space-x-6 mt-1 sm:mt-2"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <RadioGroupItem
                    value="0"
                    id="male"
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="male" className="text-xs sm:text-sm">
                    Nam
                  </Label>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <RadioGroupItem
                    value="1"
                    id="female"
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="female" className="text-xs sm:text-sm">
                    Nữ
                  </Label>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <RadioGroupItem
                    value="2"
                    id="other"
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="other" className="text-xs sm:text-sm">
                    Khác
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* ✅ Phần địa chỉ: 2 cấp - Mobile optimized */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Tỉnh/Thành phố *</Label>
              <Select
                value={watch("provinceCode")}
                onValueChange={(value) => setValue("provinceCode", value)}
                disabled={locationLoading.provinces}
              >
                <SelectTrigger className="h-8 sm:h-10">
                  <SelectValue
                    placeholder="Chọn tỉnh/thành phố"
                    className="text-sm"
                  />
                </SelectTrigger>
                <SelectContent>
                  {provinces &&
                    provinces.length > 0 &&
                    provinces?.map((province) => (
                      <SelectItem
                        key={province.provinceCode}
                        value={province.provinceCode}
                        className="text-sm"
                      >
                        {province.provinceName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Phường/Xã *</Label>
              <Select
                value={watch("wardCode")}
                onValueChange={(value) => setValue("wardCode", value)}
                disabled={!watchedProvinceCode || locationLoading.wards}
              >
                <SelectTrigger className="h-8 sm:h-10">
                  <SelectValue
                    placeholder="Chọn phường/xã"
                    className="text-sm"
                  />
                </SelectTrigger>
                <SelectContent>
                  {wards &&
                    wards?.length > 0 &&
                    wards?.map((ward) => (
                      <SelectItem
                        key={ward.wardCode}
                        value={ward.wardCode}
                        className="text-sm"
                      >
                        {ward.wardName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="address" className="text-xs sm:text-sm">
              Địa chỉ chi tiết *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Textarea
                id="address"
                {...register("address", { required: "Địa chỉ là bắt buộc" })}
                className="pl-8 sm:pl-10 resize-none text-sm min-h-[60px] sm:min-h-[80px]"
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
                rows={2}
              />
            </div>
            {errors.address && (
              <p className="text-xs sm:text-sm text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 h-8 sm:h-10 text-xs sm:text-sm px-4 sm:px-6"
            >
              {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Lưu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserInfoForm;
