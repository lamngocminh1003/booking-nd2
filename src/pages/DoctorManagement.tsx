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
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Filter,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "on_leave";
  experience: number;
  patients: number;
  schedule: string[];
}

const DoctorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors] = useState<Doctor[]>([
    {
      id: "1",
      name: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      phone: "0123456789",
      email: "tranvannam@hospital.com",
      status: "active",
      experience: 15,
      patients: 1250,
      schedule: ["Thứ 2", "Thứ 4", "Thứ 6"],
    },
    {
      id: "2",
      name: "BS. Lê Thị Hoa",
      specialty: "Tim mạch nhi",
      phone: "0987654321",
      email: "lethihoa@hospital.com",
      status: "active",
      experience: 12,
      patients: 890,
      schedule: ["Thứ 3", "Thứ 5", "Thứ 7"],
    },
    {
      id: "3",
      name: "BS. Nguyễn Minh Tuấn",
      specialty: "Hô hấp nhi",
      phone: "0456789123",
      email: "nguyenminhtuan@hospital.com",
      status: "on_leave",
      experience: 8,
      patients: 567,
      schedule: ["Thứ 2", "Thứ 3", "Thứ 5"],
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
        );
      case "on_leave":
        return (
          <Badge className="bg-orange-100 text-orange-800">Nghỉ phép</Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Quản lý Bác sĩ
                </h1>
                <p className="text-gray-600">
                  Quản lý thông tin bác sĩ và lịch làm việc
                </p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm bác sĩ mới
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách bác sĩ</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm bác sĩ..."
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Chuyên khoa</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Kinh nghiệm</TableHead>
                    <TableHead>Số bệnh nhân</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {doctor.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {doctor.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1" />
                            {doctor.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.experience} năm</TableCell>
                      <TableCell>{doctor.patients.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Doctor Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng bác sĩ:</span>
                    <span className="font-medium">{doctors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Đang hoạt động:
                    </span>
                    <span className="font-medium text-green-600">
                      {doctors.filter((d) => d.status === "active").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nghỉ phép:</span>
                    <span className="font-medium text-orange-600">
                      {doctors.filter((d) => d.status === "on_leave").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chuyên khoa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Nhi khoa tổng quát</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tim mạch nhi</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hô hấp nhi</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiệu suất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Trung bình bệnh nhân/bác sĩ</span>
                      <span className="font-medium">902</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Kinh nghiệm trung bình</span>
                      <span className="font-medium">11.7 năm</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
