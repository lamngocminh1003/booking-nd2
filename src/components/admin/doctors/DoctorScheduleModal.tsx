import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";

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

interface DoctorScheduleModalProps {
  doctor: Doctor;
}

const DoctorScheduleModal = ({ doctor }: DoctorScheduleModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lịch làm việc - {doctor.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Thông tin bác sĩ</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Chuyên khoa:</strong> {doctor.specialty}
              </p>
              <p>
                <strong>Trạng thái:</strong>
                {doctor.status === "active" && (
                  <Badge className="ml-1 bg-green-100 text-green-800">
                    Đang hoạt động
                  </Badge>
                )}
                {doctor.status === "inactive" && (
                  <Badge className="ml-1 bg-gray-100 text-gray-800">
                    Không hoạt động
                  </Badge>
                )}
                {doctor.status === "on_leave" && (
                  <Badge className="ml-1 bg-orange-100 text-orange-800">
                    Nghỉ phép
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Ngày làm việc trong tuần</h4>
            <div className="flex flex-wrap gap-2">
              {doctor.schedule.map((day) => (
                <Badge key={day} className="bg-emerald-100 text-emerald-800">
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Chọn ngày xem lịch</h4>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">
                Lịch làm việc ngày {selectedDate.toLocaleDateString("vi-VN")}
              </h5>
              <div className="text-sm text-blue-700">
                <div className="space-y-1">
                  <p>• 08:00 - 12:00: Khám bệnh tổng quát</p>
                  <p>• 14:00 - 17:00: Khám chuyên khoa</p>
                  <p>• 19:00 - 21:00: Tư vấn trực tuyến</p>
                </div>
                <p className="mt-2 text-xs">
                  <strong>Ghi chú:</strong> Lịch có thể thay đổi tùy theo tình
                  hình thực tế
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorScheduleModal;
