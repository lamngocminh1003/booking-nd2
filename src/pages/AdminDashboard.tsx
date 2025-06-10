import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  UserCheck,
  FileText,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats] = useState({
    totalPatients: 1247,
    todayAppointments: 38,
    monthlyRevenue: 487500000,
    activeDoctors: 24,
    pendingAppointments: 15,
    completedToday: 23,
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: "appointment",
      message: "Lịch hẹn mới từ Nguyễn Thị Mai cho bé An",
      time: "10 phút trước",
      status: "pending",
    },
    {
      id: 2,
      type: "payment",
      message: "Thanh toán thành công 350,000 VNĐ - Khám tổng quát",
      time: "25 phút trước",
      status: "success",
    },
    {
      id: 3,
      type: "doctor",
      message: "BS. Trần Văn Nam cập nhật lịch làm việc",
      time: "1 giờ trước",
      status: "info",
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Quản Trị
            </h1>
            <p className="text-gray-600">
              Tổng quan hoạt động bệnh viện và quản lý hệ thống
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng bệnh nhi
                </CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalPatients.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lịch hẹn hôm nay
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.todayAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedToday} đã hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Doanh thu tháng
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bác sĩ đang hoạt động
                </CardTitle>
                <UserCheck className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDoctors}</div>
                <p className="text-xs text-muted-foreground">
                  Trên tổng 28 bác sĩ
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button className="h-auto p-4 bg-emerald-600 hover:bg-emerald-700">
                      <div className="text-center">
                        <Users className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">
                          Quản lý bác sĩ
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">Lịch hẹn</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">
                          Hồ sơ bệnh nhân
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium text-sm">Báo cáo</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-600" />
                      Lịch hẹn chờ duyệt
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700"
                    >
                      {stats.pendingAppointments} chờ duyệt
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">Bé Nguyễn Hoàng Minh</h4>
                          <p className="text-sm text-gray-600">
                            BS. Lê Thị Hoa - Tim mạch nhi
                          </p>
                          <p className="text-sm text-gray-500">
                            16/06/2024 - 14:30
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Duyệt
                          </Button>
                          <Button variant="outline" size="sm">
                            Từ chối
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
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.status === "success"
                              ? "bg-green-500"
                              : activity.status === "pending"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái hệ thống</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Server</span>
                    <Badge className="bg-green-100 text-green-800">
                      Hoạt động
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">
                      Hoạt động
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">
                      Hoạt động
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Service</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Bảo trì
                    </Badge>
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

export default AdminDashboard;
