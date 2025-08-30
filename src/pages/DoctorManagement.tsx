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
import { Search, Filter } from "lucide-react";
import { useEffect } from "react";
import { fetchDoctors } from "@/store/slices/doctorSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

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

  // ✅ Sửa selector để consistent với doctorSlice
  const {
    list: doctors,
    loading,
    error,
  } = useAppSelector((state) => state.doctor);
  const dispatch = useAppDispatch();

  // ✅ Debug log
  useEffect(() => {}, [doctors, loading, error]);

  const filteredDoctors =
    doctors?.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.doctor_IdEmployee_Postgresql || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ✅ Hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Đang tải danh sách bác sĩ...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Hiển thị error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchDoctors())}>Thử lại</Button>
        </div>
      </div>
    );
  }

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
                  {paginatedDoctors.length > 0 ? (
                    paginatedDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="font-medium">{doctor.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {doctor.doctor_IdEmployee_Postgresql ||
                              doctor.code ||
                              "N/A"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-gray-500">
                          {searchTerm
                            ? "Không tìm thấy bác sĩ nào"
                            : "Chưa có dữ liệu bác sĩ"}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
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
