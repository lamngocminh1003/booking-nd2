import { Card, CardContent } from "@/components/ui/card";
import { Clock, Check, Calendar, User } from "lucide-react";
import { Appointment } from "@/types/appointment";

interface AppointmentStatsCardsProps {
  appointments: Appointment[];
}

const AppointmentStatsCards = ({
  appointments,
}: AppointmentStatsCardsProps) => {
  const pendingCount = appointments.filter(
    (apt) => apt.status === "pending"
  ).length;
  const confirmedCount = appointments.filter(
    (apt) => apt.status === "confirmed"
  ).length;
  const completedCount = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingCount}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã xác nhận</p>
              <p className="text-2xl font-bold text-blue-600">
                {confirmedCount}
              </p>
            </div>
            <Check className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
            <User className="w-8 h-8 text-gray-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStatsCards;
