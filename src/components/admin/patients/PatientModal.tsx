import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  Heart,
  FileText,
  Save,
  X,
} from "lucide-react";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  patient?: any;
  onSave: (patientData: any) => void;
}

const PatientModal = ({
  isOpen,
  onClose,
  mode,
  patient,
  onSave,
}: PatientModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    allergies: "",
    medicalHistory: "",
    bloodType: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    if (patient && mode === "edit") {
      setFormData({
        name: patient.name || "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        address: patient.address || "",
        guardianName: patient.guardian || "",
        guardianPhone: patient.guardianPhone || "",
        allergies: patient.allergies || "",
        medicalHistory: patient.medicalHistory || "",
        bloodType: patient.bloodType || "",
        weight: patient.weight || "",
        height: patient.height || "",
      });
    } else {
      setFormData({
        name: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        allergies: "",
        medicalHistory: "",
        bloodType: "",
        weight: "",
        height: "",
      });
    }
  }, [patient, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dateOfBirth || !formData.gender) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const patientData = {
      ...formData,
      id: patient?.id || `PT${String(Date.now()).slice(-3).padStart(3, "0")}`,
      guardian: formData.guardianName,
      totalVisits: patient?.totalVisits || 0,
      lastVisit: patient?.lastVisit || new Date().toISOString().split("T")[0],
      hisLinked: patient?.hisLinked || false,
      age: calculateAge(formData.dateOfBirth),
    };

    onSave(patientData);
    toast.success(
      mode === "add"
        ? "Đã thêm bệnh nhi thành công!"
        : "Đã cập nhật thông tin bệnh nhi!"
    );
    onClose();
  };

  const calculateAge = (dateOfBirth: string) => {
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

    return `${age} tuổi`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {mode === "add"
                    ? "Thêm bệnh nhi mới"
                    : "Chỉnh sửa thông tin bệnh nhi"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  {mode === "add"
                    ? "Nhập đầy đủ thông tin cho bệnh nhi mới"
                    : "Cập nhật thông tin bệnh nhi "}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                Thông tin cơ bản
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Tên bệnh nhi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên đầy đủ của bệnh nhi"
                  className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-semibold text-gray-700"
                >
                  Ngày sinh <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="h-12 pl-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="gender"
                  className="text-sm font-semibold text-gray-700"
                >
                  Giới tính <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="bloodType"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nhóm máu
                </Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) =>
                    handleInputChange("bloodType", value)
                  }
                >
                  <SelectTrigger className="h-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Chọn nhóm máu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">
                Thông tin liên hệ
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="guardianName"
                  className="text-sm font-semibold text-gray-700"
                >
                  Tên người giám hộ
                </Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) =>
                    handleInputChange("guardianName", e.target.value)
                  }
                  placeholder="Tên cha/mẹ hoặc người giám hộ"
                  className="h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="guardianPhone"
                  className="text-sm font-semibold text-gray-700"
                >
                  SĐT người giám hộ
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={(e) =>
                      handleInputChange("guardianPhone", e.target.value)
                    }
                    placeholder="Số điện thoại người giám hộ"
                    className="h-12 pl-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-700"
                >
                  Số điện thoại bệnh nhi
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Số điện thoại bệnh nhi (nếu có)"
                    className="h-12 pl-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="space-y-3 md:col-span-1">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-gray-700"
                >
                  Địa chỉ
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Địa chỉ chi tiết của gia đình"
                    className="pl-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 min-h-[48px]"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physical Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">
                Thông tin thể chất
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="weight"
                  className="text-sm font-semibold text-gray-700"
                >
                  Cân nặng (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Nhập cân nặng hiện tại"
                  className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="height"
                  className="text-sm font-semibold text-gray-700"
                >
                  Chiều cao (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Nhập chiều cao hiện tại"
                  className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-orange-900">
                Thông tin y tế
              </h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="allergies"
                  className="text-sm font-semibold text-gray-700"
                >
                  Dị ứng
                </Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) =>
                    handleInputChange("allergies", e.target.value)
                  }
                  placeholder="Các loại dị ứng (thuốc, thức ăn, môi trường...)"
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  rows={3}
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="medicalHistory"
                  className="text-sm font-semibold text-gray-700"
                >
                  Tiền sử bệnh án
                </Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) =>
                    handleInputChange("medicalHistory", e.target.value)
                  }
                  placeholder="Tiền sử bệnh lý, phẫu thuật, điều trị đặc biệt..."
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-12 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === "add" ? "Thêm bệnh nhi" : "Cập nhật thông tin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;
