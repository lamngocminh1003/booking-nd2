import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Heart,
  Plus,
  Bell,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const [user] = useState({
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@email.com",
    phone: "0123456789",
  });

  const [appointments] = useState([
    {
      id: 1,
      childName: "Bé An",
      doctor: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      date: "2024-06-15",
      time: "09:00",
      status: "confirmed",
    },
    {
      id: 2,
      childName: "Bé Minh",
      doctor: "BS. Lê Thị Hoa",
      specialty: "Tim mạch nhi",
      date: "2024-06-20",
      time: "14:30",
      status: "pending",
    },
  ]);

  const [children] = useState([
    {
      id: 1,
      name: "Nguyễn Hoàng An",
      dateOfBirth: "2020-03-15",
      gender: "Nam",
      bhyt: "HS4030123456789",
    },
    {
      id: 2,
      name: "Nguyễn Hoàng Minh",
      dateOfBirth: "2018-07-22",
      gender: "Nam",
      bhyt: "HS4030987654321",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chào mừng, {user.name}!
            </h1>
            <p className="text-gray-600">
              Quản lý lịch khám và hồ sơ sức khỏe của bé một cách dễ dàng
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-emerald-600" />
                    Thao tác nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button className="h-auto p-4 bg-emerald-600 hover:bg-emerald-700">
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Đặt lịch khám</div>
                        <div className="text-sm opacity-90">
                          Chọn bác sĩ và thời gian
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 border-emerald-600 text-emerald-600"
                    >
                      <div className="text-center">
                        <User className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Thêm hồ sơ bé</div>
                        <div className="text-sm opacity-70">
                          Quản lý thông tin
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                      Lịch hẹn sắp tới
                    </div>
                    <Button variant="outline" size="sm">
                      Xem tất cả
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {appointment.childName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.specialty}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {appointment.doctor}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time} - {appointment.date}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Đổi lịch
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Hủy lịch
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                    Thông tin tài khoản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Chỉnh sửa
                  </Button>
                </CardContent>
              </Card>

              {/* Children List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-emerald-600" />
                      Hồ sơ bé
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div key={child.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {child.name}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Sinh: {child.dateOfBirth}</p>
                          <p>Giới tính: {child.gender}</p>
                          <p>BHYT: {child.bhyt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-emerald-600" />
                    Thông báo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-600">
                      <p className="text-sm font-medium text-emerald-900">
                        Nhắc nhở khám
                      </p>
                      <p className="text-sm text-emerald-700">
                        Lịch khám của bé An vào 9h sáng mai
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                      <p className="text-sm font-medium text-blue-900">
                        Kết quả khám
                      </p>
                      <p className="text-sm text-blue-700">
                        Kết quả khám của bé Minh đã có
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
