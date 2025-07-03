import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Legend,
} from "recharts";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  // Mock data for reports
  const appointmentsByDepartment = [
    { name: "Nhi khoa", value: 150, color: "#059669" },
    { name: "TMH", value: 80, color: "#10b981" },
    { name: "Khoa nội", value: 120, color: "#34d399" },
    { name: "Da liễu", value: 45, color: "#6ee7b7" },
  ];

  const monthlyTrends = [
    { month: "T1", appointments: 245, patients: 189 },
    { month: "T2", appointments: 298, patients: 234 },
    { month: "T3", appointments: 276, patients: 198 },
    { month: "T4", appointments: 321, patients: 267 },
    { month: "T5", appointments: 387, patients: 298 },
    { month: "T6", appointments: 425, patients: 334 },
  ];
  // Sample data for charts
  const monthlyData = [
    { name: "T1", appointments: 245, revenue: 123000000, patients: 189 },
    { name: "T2", appointments: 298, revenue: 149000000, patients: 234 },
    { name: "T3", appointments: 312, revenue: 156000000, patients: 267 },
    { name: "T4", appointments: 287, revenue: 143500000, patients: 223 },
    { name: "T5", appointments: 324, revenue: 162000000, patients: 289 },
    { name: "T6", appointments: 356, revenue: 178000000, patients: 312 },
  ];
  const systemStatus = [
    { metric: "Tỷ lệ hoàn thành phiếu khám", value: "94.2%", status: "good" },
    { metric: "Thời gian phản hồi trung bình", value: "2.3s", status: "good" },
    { metric: "Tỷ lệ lỗi đồng bộ HIS", value: "0.8%", status: "warning" },
    { metric: "Số bản ghi chờ đồng bộ", value: "23", status: "warning" },
  ];

  const topPatients = [
    { name: "Bé Nguyễn Văn A", visits: 12, lastVisit: "2024-06-15" },
    { name: "Bé Trần Thị B", visits: 9, lastVisit: "2024-06-14" },
    { name: "Bé Lê Minh C", visits: 8, lastVisit: "2024-06-10" },
    { name: "Bé Phạm Thị D", visits: 7, lastVisit: "2024-06-12" },
    { name: "Bé Hoàng Văn E", visits: 6, lastVisit: "2024-06-08" },
  ];
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };
  const handleExportReport = (type: string) => {
    toast.success(`Đang xuất báo cáo ${type}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-emerald-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-600">
            Tổng quan và phân tích dữ liệu hệ thống
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport("Excel")}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("PDF")}>
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="accounts">Tài khoản</TabsTrigger>
          <TabsTrigger value="appointments">Phiếu khám</TabsTrigger>
          <TabsTrigger value="patients">Bệnh nhi</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">1,248</div>
                <p className="text-sm text-gray-600">Tổng tài khoản</p>
                <p className="text-xs text-emerald-600 mt-1">+12% tháng này</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">856</div>
                <p className="text-sm text-gray-600">Tổng bệnh nhi</p>
                <p className="text-xs text-blue-600 mt-1">+8% tháng này</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">425</div>
                <p className="text-sm text-gray-600">Phiếu khám tháng này</p>
                <p className="text-xs text-purple-600 mt-1">
                  +15% so tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">89</div>
                <p className="text-sm text-gray-600">Phiếu từ HIS</p>
                <p className="text-xs text-orange-600 mt-1">21% tổng phiếu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Tổng lượt khám (tháng)
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">1,847</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% so với tháng trước
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu (tháng)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(487500000)}
                    </p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% so với tháng trước
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bệnh nhi mới</p>
                    <p className="text-2xl font-bold text-purple-600">234</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% so với tháng trước
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá TB</p>
                    <p className="text-2xl font-bold text-orange-600">4.8/5</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +0.2 so với tháng trước
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#059669"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân bố theo khoa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentsByDepartment}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {appointmentsByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">45</div>
                <p className="text-sm text-gray-600">Bác sĩ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">89</div>
                <p className="text-sm text-gray-600">Y tá</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">23</div>
                <p className="text-sm text-gray-600">Tiếp nhận</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản mới tạo theo tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { week: "Tuần 21", count: 5 },
                    { week: "Tuần 22", count: 8 },
                    { week: "Tuần 23", count: 3 },
                    { week: "Tuần 24", count: 12 },
                    { week: "Tuần 25", count: 7 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {" "}
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng bệnh nhân mới</CardTitle>
                <CardDescription>
                  Số lượng bệnh nhân mới theo tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="patients"
                      fill="#10B981"
                      name="Bệnh nhân mới"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 bệnh nhi tái khám nhiều nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPatients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lần khám cuối: {patient.lastVisit}
                        </p>
                      </div>
                      <Badge variant="secondary">{patient.visits} lần</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Liên kết HIS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Đã liên kết HIS</span>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-emerald-600">
                        634
                      </div>
                      <span className="text-sm text-gray-500">(74%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Chưa liên kết HIS</span>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-red-600">222</div>
                      <span className="text-sm text-gray-500">(26%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: "74%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">42</div>
                <p className="text-sm text-gray-600">Phiếu khám hôm nay</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">336</div>
                <p className="text-sm text-gray-600">Từ hệ thống nội bộ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">89</div>
                <p className="text-sm text-gray-600">Từ HIS</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">94.2%</div>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <span className="text-gray-700">{item.metric}</span>
                    </div>
                    <div
                      className={`text-lg font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đồng bộ dữ liệu HIS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Lần đồng bộ gần nhất</span>
                  <span className="text-gray-900 font-medium">
                    16/06/2024 - 14:30
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    Số bản ghi đồng bộ thành công
                  </span>
                  <span className="text-emerald-600 font-medium">1,245</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Số bản ghi lỗi</span>
                  <span className="text-red-600 font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Số bản ghi chờ đồng bộ</span>
                  <span className="text-yellow-600 font-medium">23</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
