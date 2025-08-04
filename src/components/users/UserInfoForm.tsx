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
import { useCapacitor } from "../../hooks/useCapacitor"; // hoặc đường dẫn đúng
import { Clipboard } from "@capacitor/clipboard";
import { parseCCCDQR } from "@/services/UsersServices";
import {
  getProvinces,
  getDistricts,
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
  districtCode: string;
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
    districts,
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
      districtCode: "",
      wardCode: "",
      ...defaultValues,
    },
  });
  const { isNative } = useCapacitor();

  const watchedProvinceCode = watch("provinceCode");
  const watchedDistrictCode = watch("districtCode");

  // Load danh sách tỉnh/thành phố
  useEffect(() => {
    dispatch(getProvinces());
  }, [dispatch]);

  // Nếu có sẵn provinceCode (chế độ edit) → gọi load districts
  useEffect(() => {
    if (isEditMode && defaultValues?.provinceCode) {
      dispatch(getDistricts(defaultValues.provinceCode));
      setValue("provinceCode", defaultValues.provinceCode);
    }
  }, [isEditMode, defaultValues?.provinceCode, dispatch, setValue]);

  // Khi đã có danh sách districts, kiểm tra để set districtCode và load wards
  useEffect(() => {
    if (isEditMode && defaultValues?.districtCode && districts.length > 0) {
      setValue("districtCode", defaultValues.districtCode);
      dispatch(getWards(defaultValues.districtCode));
    }
  }, [isEditMode, defaultValues?.districtCode, districts, dispatch, setValue]);

  // Khi đã có danh sách wards, kiểm tra để set wardCode
  useEffect(() => {
    if (isEditMode && defaultValues?.wardCode && wards.length > 0) {
      setValue("wardCode", defaultValues.wardCode);
    }
  }, [isEditMode, defaultValues?.wardCode, wards, setValue]);

  // Khi chọn lại tỉnh mới: reset huyện, xã và load lại huyện
  useEffect(() => {
    if (watch("provinceCode")) {
      dispatch(resetLocation("wards")); // chỉ reset xã
      setValue("districtCode", "");
      setValue("wardCode", "");
      dispatch(getDistricts(watch("provinceCode")));
    }
  }, [watch("provinceCode"), dispatch, setValue]);

  // Khi chọn lại huyện mới: reset xã và load lại xã
  useEffect(() => {
    if (watch("districtCode")) {
      setValue("wardCode", "");
      dispatch(getWards(watch("districtCode")));
    }
  }, [watch("districtCode"), dispatch, setValue]);
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
      console.log("Đã đọc dữ liệu từ clipboard:value", value);
      const parsedData = await parseCCCDQR(value);
      console.log("Parsed CCCD data:parsedData", parsedData);
      // Gán vào form nếu đúng cấu trúc:
      setValue("fullName", parsedData.fullName);
      setValue("dateOfBirth", parsedData.dateOfBirth); // bạn có thể cần xử lý định dạng
      setValue("gender", parsedData.gender);
      setValue("cccd", parsedData.cccd);
      // Các trường khác nếu API trả về

      alert("Đã quét và điền dữ liệu CCCD thành công!");
    } catch (error) {
      console.error("Lỗi quét CCCD:", error);
      alert("Không thể xử lý mã QR CCCD. Hãy thử lại.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode
            ? "Cập nhật thông tin cá nhân"
            : "Đăng ký thông tin cá nhân"}
          {isNative && (
            <span className="text-sm text-gray-500 ml-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleReadCCCDFromClipboard()}
              >
                📋 Quét CCCD từ Clipboard
              </Button>{" "}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  {...register("fullName", { required: "Họ tên là bắt buộc" })}
                  className="pl-10"
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber", {
                    required: "Số điện thoại là bắt buộc",
                  })}
                  className="pl-10"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="pl-10"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cccd">Số CCCD/CMND</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cccd"
                  {...register("cccd")}
                  className="pl-10"
                  placeholder="Nhập số CCCD/CMND"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth", {
                    required: "Ngày sinh là bắt buộc",
                  })}
                  className="pl-10"
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Giới tính *</Label>
              <RadioGroup
                value={watch("gender")?.toString() || "0"} // Đồng bộ với React Hook Form
                onValueChange={(value) => setValue("gender", parseInt(value))}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="male" />
                  <Label htmlFor="male">Nam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="female" />
                  <Label htmlFor="female">Nữ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="other" />
                  <Label htmlFor="other">Khác</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tỉnh/Thành phố *</Label>
              <Select
                value={watch("provinceCode")}
                onValueChange={(value) => setValue("provinceCode", value)}
                disabled={locationLoading.provinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces &&
                    provinces.length > 0 &&
                    provinces?.map((province) => (
                      <SelectItem
                        key={province.provinceCode}
                        value={province.provinceCode}
                      >
                        {province.provinceName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quận/Huyện *</Label>
              <Select
                value={watch("districtCode")}
                onValueChange={(value) => setValue("districtCode", value)}
                disabled={!watchedProvinceCode || locationLoading.districts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts &&
                    districts?.length > 0 &&
                    districts?.map((district) => (
                      <SelectItem
                        key={district.districtCode}
                        value={district.districtCode}
                      >
                        {district.districtName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Phường/Xã *</Label>
              <Select
                value={watch("wardCode")}
                onValueChange={(value) => setValue("wardCode", value)}
                disabled={!watchedDistrictCode || locationLoading.wards}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards &&
                    wards?.length > 0 &&
                    wards?.map((ward) => (
                      <SelectItem key={ward.wardCode} value={ward.wardCode}>
                        {ward.wardName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ chi tiết *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                {...register("address", { required: "Địa chỉ là bắt buộc" })}
                className="pl-10 resize-none"
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
                rows={3}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
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
