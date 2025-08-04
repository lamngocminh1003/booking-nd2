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
import { Search, Edit, Trash2, Phone, Mail, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditDoctorModal from "@/components/admin/doctors/EditDoctorModal";
import AddDoctorModal from "@/components/admin/doctors/AddDoctorModal";
import DoctorScheduleModal from "@/components/admin/doctors/DoctorScheduleModal";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "@/store/slices/doctorSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { RootState } from "@/store";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: "Active" | "inactive" | "on_leave";
  experience: number;
  patients: number;
  schedule: string[];
  doctor_IdEmployee_Postgresql: string;
}

const DoctorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { doctors, loading, error } = useAppSelector((state) => state.doctor);

  const filteredDoctors = doctors?.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.doctor_IdEmployee_Postgresql || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDoctorUpdate = (updatedDoctor: Doctor) => {
    // This function will need to be updated to interact with Redux state
    console.log("Cập nhật thông tin bác sĩ:", updatedDoctor);
  };

  const handleDoctorAdd = (newDoctor: Doctor) => {
    // This function will need to be updated to interact with Redux state
    console.log("Thêm bác sĩ mới:", newDoctor);
  };

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

  return (
    <div className="min-h-screen animate-fade-in">
      <div className=" pb-10 ">
        <div className="">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Quản lý Bác sĩ
                </h1>
                <p className="text-gray-600">
                  Quản lý thông tin bác sĩ và lịch làm việc
                </p>
              </div>
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
                    <TableHead>Mã bác sĩ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {doctor.doctor_IdEmployee_Postgresql}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {/* Pagination UI dưới bảng */}
            <div className="flex justify-center mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trang trước
              </Button>
              <span className="px-2 text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
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
                    <span className="font-medium">{doctors?.length}</span>
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
