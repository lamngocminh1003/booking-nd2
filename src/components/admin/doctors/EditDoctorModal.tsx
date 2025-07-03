import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: "Active" | "inactive" | "on_leave";
  experience: number;
  patients: number;
  schedule: string[];
}

interface EditDoctorModalProps {
  doctor: Doctor;
  onSave: (doctor: Doctor) => void;
}

const EditDoctorModal = ({ doctor, onSave }: EditDoctorModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(doctor);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  const handleScheduleToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter((d) => d !== day)
        : [...prev.schedule, day],
    }));
  };

  const weekDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin bác sĩ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="specialty">Chuyên khoa</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, specialty: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="experience">Kinh nghiệm (năm)</Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  experience: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive" | "on_leave") =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="on_leave">Nghỉ phép</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lịch làm việc</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {weekDays.map((day) => (
                <Badge
                  key={day}
                  variant={
                    formData.schedule.includes(day) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleScheduleToggle(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDoctorModal;
