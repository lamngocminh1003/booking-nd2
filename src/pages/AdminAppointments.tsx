import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Clock,
  Check,
  X,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

const AdminAppointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const [appointments] = useState<Appointment[]>([
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800">Chờ duyệt</Badge>
        );
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "regular":
        return <Badge variant="outline">Thường</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
      case "specialist":
        return (
          <Badge className="bg-purple-100 text-purple-800">Chuyên khoa</Badge>
        );
      default:
        return <Badge variant="outline">Khác</Badge>;
    }
  };

  const filterAppointments = (appointments: Appointment[]) => {
    let filtered = appointments;

    if (selectedTab !== "all") {
      filtered = filtered.filter((apt) => apt.status === selectedTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleApprove = (appointmentId: string) => {
    console.log("Duyệt lịch hẹn:", appointmentId);
  };

  const handleReject = (appointmentId: string) => {
    console.log("Từ chối lịch hẹn:", appointmentId);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý Lịch hẹn
            </h1>
            <p className="text-gray-600">
              Duyệt và quản lý các lịch hẹn từ phụ huynh
            </p>
          </div>

          {/* Stats Overview */}
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách lịch hẹn</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm lịch hẹn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Lọc
                  </Button>
                </div>
              </div>
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
                      {filterAppointments(appointments).map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {appointment.childName}
                              </div>
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
                              <div className="font-medium">
                                {appointment.doctor}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.specialty}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {appointment.date}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(appointment.type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {appointment.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() =>
                                      handleApprove(appointment.id)
                                    }
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Duyệt
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleReject(appointment.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Từ chối
                                  </Button>
                                </>
                              )}
                              {appointment.status === "confirmed" && (
                                <Button variant="outline" size="sm">
                                  Chi tiết
                                </Button>
                              )}
                              {appointment.status === "completed" && (
                                <Button variant="outline" size="sm">
                                  Xem kết quả
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
