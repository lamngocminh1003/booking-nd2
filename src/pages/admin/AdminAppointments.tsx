import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentStatsCards from "@/components/admin/appointment/AppointmentStatsCards";
import AppointmentFilters from "@/components/admin/appointment/AppointmentFilters";
import AppointmentTable from "@/components/admin/appointment/AppointmentTable";
import { Appointment } from "@/types/appointment";
import { filterAppointments } from "@/utils/appointmentFilters";

const AdminAppointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "APT001",
      patientName: "Nguyễn Thị Mai",
      childName: "Bé Nguyễn Hoàng An",
      parentPhone: "0123456789",
      doctor: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      date: "2024-06-15",
      time: "09:00",
      status: "pending",
      type: "regular",
    },
    {
      id: "APT002",
      patientName: "Lê Văn Thọ",
      childName: "Bé Lê Thị Ngọc",
      parentPhone: "0987654321",
      doctor: "BS. Lê Thị Hoa",
      specialty: "Tim mạch nhi",
      date: "2024-06-15",
      time: "10:30",
      status: "confirmed",
      type: "specialist",
    },
    {
      id: "APT003",
      patientName: "Phạm Thị Lan",
      childName: "Bé Phạm Minh Tuấn",
      parentPhone: "0456789123",
      doctor: "BS. Nguyễn Minh Tuấn",
      specialty: "Hô hấp nhi",
      date: "2024-06-14",
      time: "14:00",
      status: "completed",
      type: "urgent",
    },
    {
      id: "APT004",
      patientName: "Võ Thị Hương",
      childName: "Bé Võ Minh Khang",
      parentPhone: "0789123456",
      doctor: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      date: "2024-06-16",
      time: "11:00",
      status: "pending",
      type: "regular",
    },
  ]);

  const handleApprove = (appointmentId: string) => {
    console.log("Duyệt lịch hẹn:", appointmentId);
  };

  const handleReject = (appointmentId: string) => {
    console.log("Từ chối lịch hẹn:", appointmentId);
  };

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === updatedAppointment.id
          ? updatedAppointment
          : appointment
      )
    );
  };

  const filteredAppointments = filterAppointments(
    appointments,
    selectedTab,
    searchTerm
  );

  return (
    <div className="min-h-screen animate-fade-in">
      <div className=" pb-10 ">
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý Lịch hẹn
            </h1>
            <p className="text-gray-600">
              Duyệt và quản lý các lịch hẹn từ phụ huynh
            </p>
          </div>

          <AppointmentStatsCards appointments={appointments} />

          <Card>
            <CardHeader>
              <AppointmentFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                  <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
                  <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                  <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="mt-6">
                  <AppointmentTable
                    appointments={filteredAppointments}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onUpdate={handleAppointmentUpdate}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
