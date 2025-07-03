import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
} from "lucide-react";

const AppointmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for internal system
  const internalAppointments = [
    {
      id: "AP001",
      patientName: "Bé Nguyễn Văn A",
      patientAge: "5 tuổi",
      patientGender: "Nam",
      doctorName: "BS. Trần Thị B",
      department: "Nhi khoa",
      room: "Phòng 101",
      appointmentDate: "2024-06-16",
      appointmentTime: "09:00",
      status: "Đã xác nhận",
      type: "Khám định kỳ",
      symptoms: "Sốt, ho khan",
      notes: "Bệnh nhi có tiền sử dị ứng thuốc",
      phone: "0123456789",
    },
    {
      id: "AP002",
      patientName: "Bé Lê Thị C",
      patientAge: "3 tuổi",
      patientGender: "Nữ",
      doctorName: "BS. Phạm Văn D",
      department: "Tai mũi họng",
      room: "Phòng 201",
      appointmentDate: "2024-06-16",
      appointmentTime: "10:30",
      status: "Chờ xác nhận",
      type: "Khám cấp cứu",
      symptoms: "Đau tai, sốt cao",
      notes: "Cần xét nghiệm máu",
      phone: "0987654321",
    },
  ];

  // Mock data for HIS system
  const hisAppointments = [
    {
      id: "HIS001",
      patientName: "Bé Hoàng Văn E",
      patientAge: "7 tuổi",
      patientGender: "Nam",
      doctorName: "BS. Nguyễn Thị F",
      department: "Khoa ngoại",
      room: "Phòng 301",
      appointmentDate: "2024-06-16",
      appointmentTime: "14:00",
      status: "Đã hoàn thành",
      type: "Phẫu thuật nhỏ",
      source: "HIS",
      symptoms: "Vết thương nhỏ ở tay",
      notes: "Đã khâu 3 mũi",
      phone: "0333444555",
    },
    {
      id: "HIS002",
      patientName: "Bé Vũ Thị G",
      patientAge: "4 tuổi",
      patientGender: "Nữ",
      doctorName: "BS. Đỗ Văn H",
      department: "Da liễu",
      room: "Phòng 102",
      appointmentDate: "2024-06-15",
      appointmentTime: "15:30",
      status: "Đã chuyển đi",
      type: "Khám chuyên khoa",
      source: "HIS",
      symptoms: "Phát ban da",
      notes: "Cần theo dõi thêm",
      phone: "0666777888",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Đã hoàn thành":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Đã chuyển đi":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const AppointmentDetail = ({ appointment }: { appointment: any }) => (
    <div className="space-y-6">
      <DialogDescription className="text-gray-600">
        Thông tin chi tiết về phiếu khám bệnh
      </DialogDescription>

      {/* Patient Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Thông tin bệnh nhi</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên bệnh nhi
            </label>
            <p className="text-sm text-gray-900 font-medium">
              {appointment.patientName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tuổi</label>
            <p className="text-sm text-gray-900">{appointment.patientAge}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Giới tính
            </label>
            <p className="text-sm text-gray-900">{appointment.patientGender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <p className="text-sm text-gray-900">{appointment.phone}</p>
          </div>
        </div>
      </div>

      {/* Appointment Info Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-900">Thông tin lịch khám</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mã phiếu khám
            </label>
            <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
              {appointment.id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <Badge className={`${getStatusColor(appointment.status)} border`}>
              {appointment.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Ngày khám
              </label>
              <p className="text-sm text-gray-900">
                {appointment.appointmentDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Giờ khám
              </label>
              <p className="text-sm text-gray-900">
                {appointment.appointmentTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Thông tin y tế</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Bác sĩ phụ trách
            </label>
            <p className="text-sm text-gray-900 font-medium">
              {appointment.doctorName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Khoa phòng
            </label>
            <p className="text-sm text-gray-900">{appointment.department}</p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phòng khám
              </label>
              <p className="text-sm text-gray-900">{appointment.room}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Loại khám
            </label>
            <p className="text-sm text-gray-900">{appointment.type}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Triệu chứng
            </label>
            <p className="text-sm text-gray-900 bg-white p-3 rounded border">
              {appointment.symptoms}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Ghi chú</label>
            <p className="text-sm text-gray-900 bg-white p-3 rounded border">
              {appointment.notes}
            </p>
          </div>
        </div>
      </div>

      {appointment.source && (
        <div className="bg-gray-50 p-3 rounded-lg border">
          <label className="text-sm font-medium text-gray-700">
            Nguồn dữ liệu
          </label>
          <p className="text-sm text-gray-900 font-mono">
            {appointment.source}
          </p>
        </div>
      )}
    </div>
  );

  const AppointmentTable = ({ appointments }: { appointments: any[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã phiếu</TableHead>
            <TableHead>Tên bệnh nhi</TableHead>
            <TableHead>Bác sĩ</TableHead>
            <TableHead>Khoa phòng</TableHead>
            <TableHead>Ngày giờ khám</TableHead>
            <TableHead>Loại khám</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium font-mono">
                {appointment.id}
              </TableCell>
              <TableCell className="font-medium">
                {appointment.patientName}
              </TableCell>
              <TableCell>{appointment.doctorName}</TableCell>
              <TableCell>{appointment.department}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{appointment.appointmentDate}</div>
                  <div className="text-xs text-gray-500">
                    {appointment.appointmentTime}
                  </div>
                </div>
              </TableCell>
              <TableCell>{appointment.type}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(appointment.status)} border`}
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Xem</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        Chi tiết phiếu khám - {appointment.id}
                      </DialogTitle>
                    </DialogHeader>
                    <AppointmentDetail appointment={appointment} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý phiếu khám
          </h1>
          <p className="text-gray-600">
            Quản lý phiếu khám từ hệ thống nội bộ và HIS
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã phiếu, tên bệnh nhi, bác sĩ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Đã xác nhận">Đã xác nhận</SelectItem>
                <SelectItem value="Chờ xác nhận">Chờ xác nhận</SelectItem>
                <SelectItem value="Đã hoàn thành">Đã hoàn thành</SelectItem>
                <SelectItem value="Đã chuyển đi">Đã chuyển đi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different data sources */}
      <Tabs defaultValue="internal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal">
            Dữ liệu nội bộ ({internalAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="his">
            Dữ liệu HIS ({hisAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu khám từ hệ thống nội bộ</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentTable appointments={internalAppointments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="his">
          <Card>
            <CardHeader>
              <CardTitle>
                Phiếu khám từ HIS (Hospital Information System)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentTable appointments={hisAppointments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentManagement;
