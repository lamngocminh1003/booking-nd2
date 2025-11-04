import { useState, useEffect } from "react";
import { useAppSelector } from "@/hooks/redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Edit,
  X,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  childName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  location: string;
  notes?: string;
}

const Appointments = () => {
  const { appointments: reduxAppointments } = useAppSelector(
    (state) => state.appointments
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const { toast } = useToast();
  useEffect(() => {
    if (reduxAppointments.length > 0) {
      setAppointments(
        reduxAppointments.map((apt) => ({
          id: apt.id,
          childName: apt.childName,
          doctorName: apt.doctorName,
          specialty: apt.specialty,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          location: apt.location || "Phòng khám",
          notes: apt.notes,
        }))
      );
    } else {
      // Fallback to mock data if no appointments in store
      setAppointments([
        {
          id: "1",
          childName: "Nguyễn Hoàng An",
          doctorName: "BS. Trần Văn Nam",
          specialty: "Nhi khoa tổng quát",
          date: "2024-06-15",
          time: "09:00",
          status: "confirmed",
          location: "Phòng 201, Tầng 2",
          notes: "Khám định kỳ",
        },
      ]);
    }
  }, [reduxAppointments]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Đã khám";
      default:
        return "Không xác định";
    }
  };

  const handleCancelAppointment = (
    appointmentId: string,
    childName: string
  ) => {
    toast({
      title: "Hủy lịch hẹn thành công!",
      description: `Lịch khám của ${childName} đã được hủy.`,
    });
  };

  const filterAppointmentsByStatus = (status: string) => {
    if (status === "upcoming") {
      return appointments.filter(
        (apt) => apt.status === "confirmed" || apt.status === "pending"
      );
    }
    if (status === "completed") {
      return appointments.filter((apt) => apt.status === "completed");
    }
    if (status === "cancelled") {
      return appointments.filter((apt) => apt.status === "cancelled");
    }
    return appointments;
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{appointment.childName}</CardTitle>
              <CardDescription>{appointment.specialty}</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" />
            {appointment.doctorName}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {appointment.date}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {appointment.time}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {appointment.location}
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Ghi chú:</strong> {appointment.notes}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            {appointment.status === "completed" && (
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Xem kết quả
              </Button>
            )}
            {(appointment.status === "confirmed" ||
              appointment.status === "pending") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Chi tiết
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Bệnh nhi</p>
                        <p className="font-medium">{appointment.childName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bác sĩ</p>
                        <p className="font-medium">{appointment.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày khám</p>
                        <p className="font-medium">{appointment.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giờ khám</p>
                        <p className="font-medium">{appointment.time}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa điểm</p>
                      <p className="font-medium">{appointment.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chuyên khoa</p>
                      <p className="font-medium">{appointment.specialty}</p>
                    </div>
                    {appointment.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Ghi chú</p>
                        <p className="font-medium">{appointment.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-center pt-4">
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Liên hệ bệnh viện
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {(appointment.status === "confirmed" ||
            appointment.status === "pending") && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCancelAppointment(appointment.id, appointment.childName)
                }
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Quản lý lịch hẹn
                </h1>
                <p className="text-gray-600">
                  Theo dõi và quản lý các lịch khám của bé
                </p>
              </div>
              <Link to="/book-appointment">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Đặt lịch mới
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
              <TabsTrigger value="completed">Đã khám</TabsTrigger>
              <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {filterAppointmentsByStatus("upcoming").map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {filterAppointmentsByStatus("completed").map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {filterAppointmentsByStatus("cancelled").map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
              {filterAppointmentsByStatus("cancelled").length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có lịch hẹn đã hủy
                    </h3>
                    <p className="text-gray-600">
                      Tất cả các lịch hẹn của bạn đều còn hiệu lực
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {filterAppointmentsByStatus("upcoming").length}
                </div>
                <p className="text-sm text-gray-600">Lịch sắp tới</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filterAppointmentsByStatus("completed").length}
                </div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {appointments.length}
                </div>
                <p className="text-sm text-gray-600">Tổng lịch hẹn</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
