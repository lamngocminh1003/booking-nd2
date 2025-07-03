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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  childName: string;
  parentPhone: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "regular" | "urgent" | "specialist";
  notes?: string;
}

interface EditAppointmentModalProps {
  appointment: Appointment;
  onSave: (appointment: Appointment) => void;
}

const EditAppointmentModal = ({
  appointment,
  onSave,
}: EditAppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(appointment);

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="childName">Tên bé</Label>
            <Input
              id="childName"
              value={formData.childName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, childName: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="patientName">Tên phụ huynh</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="parentPhone">Số điện thoại</Label>
            <Input
              id="parentPhone"
              value={formData.parentPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  parentPhone: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="doctor">Bác sĩ</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, doctor: e.target.value }))
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Ngày khám</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="time">Giờ khám</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(
                value: "pending" | "confirmed" | "completed" | "cancelled"
              ) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Loại khám</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "regular" | "urgent" | "specialist") =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Thường</SelectItem>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
                <SelectItem value="specialist">Chuyên khoa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Thêm ghi chú..."
            />
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

export default EditAppointmentModal;
