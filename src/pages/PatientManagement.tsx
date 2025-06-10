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
  Eye,
  Edit,
  FileText,
  Phone,
  Calendar,
  User,
} from "lucide-react";

interface Patient {
  id: string;
  childName: string;
  parentName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  bhyt: string;
  lastVisit: string;
  totalVisits: number;
  status: "active" | "inactive";
}

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [patients] = useState<Patient[]>([
    {
      id: "PT001",
      childName: "Nguyễn Hoàng An",
      parentName: "Nguyễn Thị Mai",
      dateOfBirth: "2020-03-15",
      gender: "Nam",
      phone: "0123456789",
      bhyt: "HS4030123456789",
      lastVisit: "2024-06-10",
      totalVisits: 8,
      status: "active",
    },
    {
      id: "PT002",
      childName: "Lê Thị Ngọc",
      parentName: "Lê Văn Thọ",
      dateOfBirth: "2019-08-22",
      gender: "Nữ",
      phone: "0987654321",
      bhyt: "HS4030987654321",
      lastVisit: "2024-06-05",
      totalVisits: 12,
      status: "active",
    },
    {
      id: "PT003",
      childName: "Phạm Minh Tuấn",
      parentName: "Phạm Thị Lan",
      dateOfBirth: "2021-01-10",
      gender: "Nam",
      phone: "0456789123",
      bhyt: "HS4030456789123",
      lastVisit: "2024-05-28",
      totalVisits: 5,
      status: "active",
    },
    {
      id: "PT004",
      childName: "Võ Minh Khang",
      parentName: "Võ Thị Hương",
      dateOfBirth: "2018-11-03",
      gender: "Nam",
      phone: "0789123456",
      bhyt: "HS4030789123456",
      lastVisit: "2024-04-15",
      totalVisits: 15,
      status: "inactive",
    },
  ]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">Đang theo dõi</Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bhyt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePatients = patients.filter((p) => p.status === "active").length;
  const totalVisits = patients.reduce((sum, p) => sum + p.totalVisits, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản lý Hồ sơ Bệnh nhân
            </h1>
            <p className="text-gray-600">
              Tìm kiếm và quản lý thông tin bệnh nhi
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng bệnh nhi</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {patients.length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đang theo dõi</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activePatients}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng lượt khám</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalVisits}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">TB lượt khám/bé</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(totalVisits / patients.length)}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách bệnh nhi</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm bệnh nhi..."
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
                    <TableHead>Mã BN</TableHead>
                    <TableHead>Thông tin bệnh nhi</TableHead>
                    <TableHead>Phụ huynh</TableHead>
                    <TableHead>Tuổi/Giới tính</TableHead>
                    <TableHead>BHYT</TableHead>
                    <TableHead>Lần khám cuối</TableHead>
                    <TableHead>Số lượt khám</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{patient.childName}</div>
                          <div className="text-sm text-gray-600">
                            Sinh: {patient.dateOfBirth}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {patient.parentName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {patient.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {calculateAge(patient.dateOfBirth)} tuổi
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.gender}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {patient.bhyt}
                        </span>
                      </TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {patient.totalVisits} lượt
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
