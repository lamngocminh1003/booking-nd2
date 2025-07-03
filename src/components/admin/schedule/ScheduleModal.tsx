import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Building,
} from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  schedule?: any;
  onSave: (scheduleData: any) => void;
}

const ScheduleModal = ({
  isOpen,
  onClose,
  mode,
  schedule,
  onSave,
}: ScheduleModalProps) => {
  const [formData, setFormData] = useState({
    year: schedule?.year || new Date().getFullYear(),
    week: schedule?.week || 25,
    date: schedule?.date || "",
    dayOfWeek: schedule?.dayOfWeek || "",
    area: schedule?.area || "",
    room: schedule?.room || "",
    shift: schedule?.shift || "",
    examType: schedule?.examType || "",
    specialty: schedule?.specialty || "",
    department: schedule?.department || "",
    doctor: schedule?.doctor || "",
    isActive: schedule?.isActive ?? true,
  });

  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const shifts = [
    "Ca sáng",
    "Ca chiều",
    "Ca tối",
    "Trực đêm",
    "Ca 0",
    "Ca 4",
    "Ca 5",
  ];

  const rooms = [
    "Phòng 101",
    "Phòng 102",
    "Phòng 201",
    "Phòng 202",
    "Phòng 301",
  ];

  const doctors = [
    "BS. Nguyễn Văn A",
    "BS. Trần Thị B",
    "BS. Lê Văn C",
    "BS. Phạm Thị D",
    "BS. Hoàng Văn E",
  ];

  const specialties = [
    "Nhi khoa",
    "Tai mũi họng",
    "Khoa ngoại",
    "Khoa nội",
    "Da liễu",
  ];

  const departments = [
    "Khoa Nhi",
    "Khoa TMH",
    "Khoa Ngoại",
    "Khoa Nội",
    "Khoa Da liễu",
  ];

  const areas = ["Khu A", "Khu B", "Khu C"];

  const examTypes = [
    "Khám thường",
    "Khám chuyên khoa",
    "Cấp cứu",
    "Phẫu thuật nhỏ",
    "Tái khám",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.dayOfWeek ||
      !formData.room ||
      !formData.shift ||
      !formData.doctor
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const scheduleData = {
      ...formData,
      id: schedule?.id || Date.now(),
    };

    onSave(scheduleData);
    toast.success(
      mode === "add"
        ? "Đã thêm lịch khám thành công!"
        : "Đã cập nhật lịch khám!"
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Thêm lịch khám mới" : "Chỉnh sửa lịch khám"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Tạo lịch phân công mới cho bác sĩ"
              : "Cập nhật thông tin lịch phân công"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Thông tin thời gian
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">
                  Năm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="week">
                  Tuần <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="week"
                  type="number"
                  value={formData.week}
                  onChange={(e) =>
                    handleInputChange("week", parseInt(e.target.value))
                  }
                  min="1"
                  max="53"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Ngày <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">
                  Thứ <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) =>
                    handleInputChange("dayOfWeek", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">
                  Ca khám <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => handleInputChange("shift", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca khám" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>
                        {shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Thông tin địa điểm
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Khu vực</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleInputChange("area", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">
                  Phòng khám <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => handleInputChange("room", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng khám" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Thông tin y tế</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examType">Loại khám</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) =>
                    handleInputChange("examType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại khám" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Chuyên khoa</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) =>
                    handleInputChange("specialty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Khoa phòng</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Chọn khoa phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">
                  Bác sĩ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Select
                    value={formData.doctor}
                    onValueChange={(value) =>
                      handleInputChange("doctor", value)
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="isActive"
                  className="text-base font-semibold text-yellow-900"
                >
                  Trạng thái hoạt động
                </Label>
                <p className="text-sm text-yellow-700 mt-1">
                  Bật để kích hoạt lịch khám này
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {mode === "add" ? "Thêm lịch khám" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
