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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Filter,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Sample data for charts
  const monthlyData = [
    { name: "T1", appointments: 245, revenue: 123000000, patients: 189 },
    { name: "T2", appointments: 298, revenue: 149000000, patients: 234 },
    { name: "T3", appointments: 312, revenue: 156000000, patients: 267 },
    { name: "T4", appointments: 287, revenue: 143500000, patients: 223 },
    { name: "T5", appointments: 324, revenue: 162000000, patients: 289 },
    { name: "T6", appointments: 356, revenue: 178000000, patients: 312 },
  ];

  const specialtyData = [
    { name: "Nhi khoa tổng quát", value: 45, color: "#10B981" },
    { name: "Tim mạch nhi", value: 25, color: "#3B82F6" },
    { name: "Hô hấp nhi", value: 20, color: "#F59E0B" },
    { name: "Tiêu hóa nhi", value: 10, color: "#EF4444" },
  ];

  const doctorPerformance = [
    {
      name: "BS. Trần Văn Nam",
      patients: 156,
      revenue: 78000000,
      satisfaction: 4.8,
    },
    {
      name: "BS. Lê Thị Hoa",
      patients: 142,
      revenue: 71000000,
      satisfaction: 4.9,
    },
    {
      name: "BS. Nguyễn Minh Tuấn",
      patients: 128,
      revenue: 64000000,
      satisfaction: 4.7,
    },
    {
      name: "BS. Phạm Thị Lan",
      patients: 134,
      revenue: 67000000,
      satisfaction: 4.6,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 animate-fade-in">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Báo cáo & Thống kê
                </h1>
                <p className="text-gray-600">
                  Phân tích dữ liệu hoạt động và hiệu suất bệnh viện
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất báo cáo
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
              <TabsTrigger value="patients">Bệnh nhân</TabsTrigger>
              <TabsTrigger value="doctors">Bác sĩ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Appointments Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lượt khám theo tháng</CardTitle>
                    <CardDescription>
                      Thống kê số lượt khám trong 6 tháng gần đây
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="appointments"
                          fill="#10B981"
                          name="Lượt khám"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Specialty Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Phân bổ theo chuyên khoa</CardTitle>
                    <CardDescription>
                      Tỷ lệ bệnh nhân theo các chuyên khoa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={specialtyData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {specialtyData.map((entry, index) => (
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

            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng doanh thu</CardTitle>
                  <CardDescription>
                    Doanh thu theo tháng trong 6 tháng gần đây
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="doctors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất bác sĩ</CardTitle>
                  <CardDescription>
                    Thống kê hiệu suất làm việc của các bác sĩ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctorPerformance.map((doctor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{doctor.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              ⭐ {doctor.satisfaction}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Bệnh nhân:</span>
                            <span className="font-medium ml-2">
                              {doctor.patients}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Doanh thu:</span>
                            <span className="font-medium ml-2">
                              {formatCurrency(doctor.revenue)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Đánh giá:</span>
                            <span className="font-medium ml-2">
                              {doctor.satisfaction}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reports;
