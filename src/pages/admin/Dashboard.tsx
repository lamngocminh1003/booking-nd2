import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Users,
  FileText,
  Calendar,
  Building,
  TrendingUp,
  Activity,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const Dashboard = () => {
  // Mock data for statistics
  const [stats] = useState({
    totalPatients: 1247,
    todayAppointments: 38,
    monthlyRevenue: 487500000,
    activeDoctors: 24,
    pendingAppointments: 15,
    completedToday: 23,
  });
  const monthlyData = [
    { month: "T1", appointments: 45, patients: 38, his: 15 },
    { month: "T2", appointments: 52, patients: 41, his: 18 },
    { month: "T3", appointments: 48, patients: 35, his: 12 },
    { month: "T4", appointments: 61, patients: 48, his: 22 },
    { month: "T5", appointments: 55, patients: 42, his: 20 },
    { month: "T6", appointments: 67, patients: 51, his: 25 },
  ];

  const weeklyData1 = [
    { week: "T2", appointments: 12, patients: 10 },
    { week: "T3", appointments: 15, patients: 12 },
    { week: "T4", appointments: 18, patients: 14 },
    { week: "T5", appointments: 14, patients: 11 },
    { week: "T6", appointments: 16, patients: 13 },
    { week: "T7", appointments: 20, patients: 16 },
    { week: "CN", appointments: 8, patients: 6 },
  ];
  const statsData = [
    {
      title: "Tổng tài khoản",
      value: "6",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng bệnh nhi",
      value: "3",
      change: "+15%",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Tổng phiếu khám",
      value: "3",
      change: "+8%",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Phiếu HIS",
      value: "1",
      change: "+5%",
      icon: Database,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Lịch hẹn hôm nay",
      value: "1",
      change: "+2",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Phiếu hoàn thành",
      value: "1",
      change: "+5%",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Khoa hoạt động",
      value: "3",
      change: "+0",
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Đồng bộ cuối",
      value: "08:30:00",
      change: "+Thành công",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Mock data for charts
  const statusData = [
    { name: "Đang xử lý", value: 50, color: "#fbbf24" },
    { name: "Hoàn thành", value: 45, color: "#10b981" },
    { name: "Đã chuyển", value: 3, color: "#8b5cf6" },
    { name: "Đã hủy", value: 2, color: "#ef4444" },
  ];

  const weeklyData = [
    { name: "T2", value: 12 },
    { name: "T3", value: 8 },
    { name: "T4", value: 15 },
    { name: "T5", value: 20 },
    { name: "T6", value: 18 },
    { name: "T7", value: 10 },
    { name: "CN", value: 6 },
  ];

  const departmentData = [
    { name: "Nhi khoa", value: 25 },
    { name: "Khoa ngoại", value: 20 },
    { name: "Tai mũi họng", value: 15 },
    { name: "Da liễu", value: 10 },
    { name: "Khoa nội", value: 8 },
  ];

  const topPatients = [
    { name: "Bé Nguyễn Văn A", visits: 5, lastVisit: "2024-06-15" },
    { name: "Bé Trần Thị B", visits: 4, lastVisit: "2024-06-14" },
    { name: "Bé Lê Văn C", visits: 4, lastVisit: "2024-06-13" },
    { name: "Bé Phạm Thị D", visits: 3, lastVisit: "2024-06-12" },
    { name: "Bé Hoàng Văn E", visits: 3, lastVisit: "2024-06-11" },
  ];

  const recentActivities = [
    {
      type: "patient",
      message: "Bé Nguyễn Văn A đăng ký khám",
      time: "5 phút trước",
      icon: Users,
    },
    {
      type: "appointment",
      message: "Phiếu khám #PK001 được tạo",
      time: "10 phút trước",
      icon: FileText,
    },
    {
      type: "schedule",
      message: "Phân lịch khám tuần 25/2024",
      time: "15 phút trước",
      icon: Calendar,
    },
    {
      type: "system",
      message: "Đồng bộ dữ liệu HIS thành công",
      time: "30 phút trước",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">
            Dashboard Quản Trị
          </h1>
          <p className="text-gray-600">
            Tổng quan hệ thống quản lý bệnh viện nhi
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        stat.change.includes("+")
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Tài khoản
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Phiếu khám
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Bệnh nhi
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Hệ thống
          </TabsTrigger>
        </TabsList>

        {/* Tổng quan Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {" "}
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
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-700 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Thống kê theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="month" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="week">Tuần</TabsTrigger>
                    <TabsTrigger value="month">Tháng</TabsTrigger>
                    <TabsTrigger value="year">Năm</TabsTrigger>
                  </TabsList>
                  <TabsContent value="month">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          dataKey="appointments"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                        <Area
                          dataKey="his"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="week">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData1}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Trạng thái phiếu khám
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Phiếu khám theo tuần
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Thống kê theo khoa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{dept.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${(dept.value / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {dept.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Top 5 bệnh nhi tái khám
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPatients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lần cuối: {patient.lastVisit}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-800"
                      >
                        {patient.visits} lần
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tài khoản Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Tài khoản theo vai trò
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quản trị viên</span>
                    <Badge className="bg-emerald-100 text-emerald-800">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bác sĩ</span>
                    <Badge className="bg-blue-100 text-blue-800">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiếp nhận</span>
                    <Badge className="bg-purple-100 text-purple-800">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Hoạt động đăng nhập gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Dr. Nguyễn Văn A</p>
                      <p className="text-xs text-gray-500">5 phút trước</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-gray-500">15 phút trước</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Phiếu khám Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Phiếu khám gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        PK001 - Bé Nguyễn Văn A
                      </p>
                      <p className="text-xs text-gray-500">Nhi khoa - 10:30</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Đang xử lý
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        PK002 - Bé Trần Thị B
                      </p>
                      <p className="text-xs text-gray-500">
                        Tai mũi họng - 09:45
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Hoàn thành
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Tỷ lệ hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hôm nay</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tuần này</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bệnh nhi Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Bệnh nhi mới
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Bé Lê Văn C</p>
                      <p className="text-xs text-gray-500">
                        3 tuổi - Đăng ký hôm nay
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Mới</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Bé Phạm Thị D</p>
                      <p className="text-xs text-gray-500">
                        5 tuổi - Đăng ký hôm qua
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Mới</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Thống kê độ tuổi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Dưới 1 tuổi</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">1-3 tuổi</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">4-6 tuổi</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Trên 6 tuổi</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hệ thống Tab */}
        <TabsContent value="system" className="space-y-6">
          {/* HIS Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Trạng thái HIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Trạng thái kết nối
                    </p>
                    <p className="text-xs text-emerald-600">
                      Hoạt động bình thường
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Đồng bộ dữ liệu
                    </p>
                    <p className="text-xs text-emerald-600">
                      Đã đồng bộ 08:30:00
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Cảnh báo
                    </p>
                    <p className="text-xs text-yellow-600">Không có cảnh báo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Trạng thái đồng bộ HIS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Bản ghi chờ đồng bộ
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Đồng bộ thành công
                    </span>
                    <Badge className="bg-green-100 text-green-800">1,234</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lỗi đồng bộ</span>
                    <Badge className="bg-red-100 text-red-800">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Xuất báo cáo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất báo cáo tổng hợp PDF
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất dữ liệu Excel
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Đồng bộ dữ liệu HIS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
