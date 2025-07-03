import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Phone } from "lucide-react";
import { Appointment } from "@/types/appointment";
import EditAppointmentModal from "@/components/admin/appointment/EditAppointmentModal";
import { getStatusBadge, getTypeBadge } from "@/utils/appointmentBadges";
import AppointmentDetailModal from "@/pages/admin/AppointmentDetailModal";
import AppointmentResultModal from "@/pages/admin/AppointmentResultModal";
interface AppointmentTableProps {
  appointments: Appointment[];
  onApprove: (appointmentId: string) => void;
  onReject: (appointmentId: string) => void;
  onUpdate: (appointment: Appointment) => void;
}

const AppointmentTable = ({
  appointments,
  onApprove,
  onReject,
  onUpdate,
}: AppointmentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã lịch hẹn</TableHead>
          <TableHead>Thông tin bệnh nhân</TableHead>
          <TableHead>Bác sĩ</TableHead>
          <TableHead>Ngày giờ</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell className="font-medium">{appointment.id}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{appointment.childName}</div>
                <div className="text-sm text-gray-600">
                  PH: {appointment.patientName}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-3 h-3 mr-1" />
                  {appointment.parentPhone}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{appointment.doctor}</div>
                <div className="text-sm text-gray-600">
                  {appointment.specialty}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{appointment.date}</div>
                <div className="text-sm text-gray-600">{appointment.time}</div>
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(appointment.type)}</TableCell>
            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {appointment.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => onApprove(appointment.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onReject(appointment.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Từ chối
                    </Button>
                  </>
                )}
                <EditAppointmentModal
                  appointment={appointment}
                  onSave={onUpdate}
                />
                {appointment.status === "confirmed" && (
                  <>
                    <AppointmentDetailModal appointment={appointment} />
                  </>
                )}
                {appointment.status === "completed" && (
                  <>
                    <AppointmentResultModal appointment={appointment} />
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppointmentTable;
