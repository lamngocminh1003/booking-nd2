import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
} from "lucide-react";
import { Appointment } from "@/types/appointment";
import { getStatusBadge, getTypeBadge } from "@/utils/appointmentBadges";

interface AppointmentDetailModalProps {
  appointment: Appointment;
}

const AppointmentDetailModal = ({
  appointment,
}: AppointmentDetailModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Chi tiết lịch hẹn #{appointment.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin bệnh nhân */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Thông tin bệnh nhân
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tên bé</p>
                <p className="font-medium">{appointment.childName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phụ huynh</p>
                <p className="font-medium">{appointment.patientName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  Số điện thoại
                </p>
                <p className="font-medium">{appointment.parentPhone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin khám */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2" />
              Thông tin khám
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Bác sĩ</p>
                <p className="font-medium">{appointment.doctor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chuyên khoa</p>
                <p className="font-medium">{appointment.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Ngày khám
                </p>
                <p className="font-medium">{appointment.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Giờ khám
                </p>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Trạng thái và loại */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Trạng thái & Loại khám
            </h3>
            <div className="flex space-x-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
                {getStatusBadge(appointment.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Loại khám</p>
                {getTypeBadge(appointment.type)}
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {appointment.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ghi chú</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailModal;
