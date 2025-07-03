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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  UserPlus,
  Download,
  Edit,
  Activity,
  Heart,
  Phone,
  MapPin,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import PatientModal from "@/components/admin/patients/PatientModal";

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([
    {
      id: "PT001",
      name: "Bé Nguyễn Văn A",
      dateOfBirth: "2020-05-15",
      age: "4 tuổi",
      gender: "Nam",
      guardian: "Nguyễn Thị B",
      guardianPhone: "0123456789",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      bloodType: "A+",
      allergies: "Không",
      medicalHistory: "Tiền sử hen suyễn nhẹ",
      weight: "16.5",
      height: "105",
      lastVisit: "2024-06-01",
      totalVisits: 3,
      hisLinked: true,
    },
    {
      id: "PT002",
      name: "Bé Trần Thị C",
      dateOfBirth: "2023-03-20",
      age: "1 tuổi",
      gender: "Nữ",
      guardian: "Trần Văn D",
      guardianPhone: "0987654321",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      bloodType: "O+",
      allergies: "Dị ứng với đậu phộng",
      medicalHistory: "Không có tiền sử bệnh lý đặc biệt",
      weight: "12.0",
      height: "85",
      lastVisit: "2024-06-10",
      totalVisits: 7,
      hisLinked: false,
    },
    {
      id: "PT003",
      name: "Bé Lê Minh E",
      dateOfBirth: "2018-11-08",
      age: "5 tuổi",
      gender: "Nam",
      guardian: "Lê Thị F",
      guardianPhone: "0345678912",
      phone: "0345678912",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      bloodType: "B+",
      allergies: "Không",
      medicalHistory: "Đã phẫu thuật amidan năm 2023",
      weight: "18.2",
      height: "115",
      lastVisit: "2024-05-28",
      totalVisits: 12,
      hisLinked: true,
    },
  ]);

  const getAgeGroup = (age: string) => {
    const ageNum = parseInt(age);
    if (ageNum < 1) return "<1 tuổi";
    if (ageNum <= 3) return "1-3 tuổi";
    if (ageNum <= 6) return "4-6 tuổi";
    return ">6 tuổi";
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.guardian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge =
      ageFilter === "all" || getAgeGroup(patient.age) === ageFilter;
    return matchesSearch && matchesAge;
  });

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSavePatient = (patientData: any) => {
    if (modalMode === "add") {
      setPatients((prev) => [...prev, patientData]);
    } else {
      setPatients((prev) =>
        prev.map((p) => (p.id === patientData.id ? patientData : p))
      );
    }
    setIsModalOpen(false);
  };

  const PatientDetailDialog = ({ patient }: { patient: any }) => (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {patient.name.split(" ").pop()?.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {patient.age}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {patient.gender}
            </span>
            <Badge
              className={`${
                patient.hisLinked
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {patient.hisLinked ? "Đã liên kết HIS" : "Chưa liên kết HIS"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">
              {patient.totalVisits}
            </div>
            <p className="text-sm text-emerald-600">Lần khám</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-red-700">
              {patient.bloodType}
            </div>
            <p className="text-sm text-red-600">Nhóm máu</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-purple-700">
              {patient.lastVisit}
            </div>
            <p className="text-sm text-purple-600">Khám cuối</p>
          </CardContent>
        </Card>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="w-5 h-5" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mã bệnh nhi
                </label>
                <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                  {patient.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <p className="text-sm text-gray-900">{patient.dateOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cân nặng
                </label>
                <p className="text-sm text-gray-900">{patient.weight} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Chiều cao
                </label>
                <p className="text-sm text-gray-900">{patient.height} cm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Phone className="w-5 h-5" />
              Thông tin liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Người giám hộ
              </label>
              <p className="text-sm text-gray-900">{patient.guardian}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <p className="text-sm text-gray-900">{patient.guardianPhone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Địa chỉ
              </label>
              <p className="text-sm text-gray-900 leading-relaxed">
                {patient.address}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <FileText className="w-5 h-5" />
            Thông tin y tế
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Dị ứng
              </label>
              <div className="bg-white p-3 rounded-lg border border-orange-200 min-h-[60px]">
                <p className="text-sm text-gray-900">
                  {patient.allergies || "Không có thông tin"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tiền sử bệnh án
              </label>
              <div className="bg-white p-3 rounded-lg border border-orange-200 min-h-[60px]">
                <p className="text-sm text-gray-900">
                  {patient.medicalHistory || "Không có thông tin"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bệnh nhi</h1>
          <p className="text-gray-600 mt-1">
            Quản lý hồ sơ bệnh nhi và thông tin y tế
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Xuất danh sách
          </Button>
          <Button
            onClick={handleAddPatient}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm bệnh nhi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {patients.length}
                </div>
                <p className="text-sm text-emerald-700 font-medium">
                  Tổng bệnh nhi
                </p>
              </div>
              <User className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {patients.filter((p) => p.hisLinked).length}
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  Đã liên kết HIS
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600">
                  {patients.filter((p) => !p.hisLinked).length}
                </div>
                <p className="text-sm text-amber-700 font-medium">
                  Chưa liên kết HIS
                </p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    patients.reduce((sum, p) => sum + p.totalVisits, 0) /
                      patients.length
                  )}
                </div>
                <p className="text-sm text-purple-700 font-medium">
                  TB lần khám
                </p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã, tên bệnh nhi hoặc người giám hộ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11">
                <SelectValue placeholder="Lọc theo độ tuổi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ tuổi</SelectItem>
                <SelectItem value="<1 tuổi">Dưới 1 tuổi</SelectItem>
                <SelectItem value="1-3 tuổi">1-3 tuổi</SelectItem>
                <SelectItem value="4-6 tuổi">4-6 tuổi</SelectItem>
                <SelectItem value=">6 tuổi">Trên 6 tuổi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Danh sách bệnh nhi ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã BN</TableHead>
                  <TableHead>Tên bệnh nhi</TableHead>
                  <TableHead>Tuổi</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Người giám hộ</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Lần khám cuối</TableHead>
                  <TableHead>HIS</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">
                      {patient.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {patient.age}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.guardian}</TableCell>
                    <TableCell>{patient.guardianPhone}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          patient.hisLinked
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {patient.hisLinked ? "Có" : "Không"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Eye className="w-3 h-3 mr-1" />
                              Xem
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Hồ sơ bệnh nhi - {patient.name}
                              </DialogTitle>
                            </DialogHeader>
                            <PatientDetailDialog patient={patient} />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 ml-1"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Sửa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
};

export default PatientManagement;
