import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import OnlineRegistrationTable from "./OnlineRegistrationTable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchAllOnlineRegistrations,
  fetchRegistrationsByStatus,
  fetchRegistrationsByPaymentStatus,
  fetchCancelledRegistrations,
  searchRegistrationsThunk,
  clearAllRegistrationsPagination,
} from "@/store/slices/bookingCatalogSlice";
import { OnlineRegistrationQueryParams } from "@/services/BookingCatalogService";
import AppointmentTable from "@/components/admin/appointment/AppointmentTable";
const AppointmentManagement = () => {
  const dispatch = useAppDispatch();

  // ✅ Redux state
  const { allRegistrationsPagination } = useAppSelector(
    (state) => state.bookingCatalog
  );

  // ✅ Local state cho filters và pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState("online");

  // ✅ Mock data for HIS system (giữ nguyên)
  const hisAppointments = [
    {
      id: "HIS001",
      patientName: "Bé Hoàng Văn E",
      patientAge: "7 tuổi",
      patientGender: "Nam",
      doctorName: "BS. Nguyễn Thị F",
      department: "Khoa ngoại",
      room: "Phòng 301",
      appointmentDate: "2024-06-16",
      appointmentTime: "14:00",
      status: "Đã hoàn thành",
      type: "Phẫu thuật nhỏ",
      source: "HIS",
      symptoms: "Vết thương nhỏ ở tay",
      notes: "Đã khâu 3 mũi",
      phone: "0333444555",
    },
    {
      id: "HIS002",
      patientName: "Bé Vũ Thị G",
      patientAge: "4 tuổi",
      patientGender: "Nữ",
      doctorName: "BS. Đỗ Văn H",
      department: "Da liễu",
      room: "Phòng 102",
      appointmentDate: "2024-06-15",
      appointmentTime: "15:30",
      status: "Đã chuyển đi",
      type: "Khám chuyên khoa",
      source: "HIS",
      symptoms: "Phát ban da",
      notes: "Cần theo dõi thêm",
      phone: "0666777888",
    },
  ];

  // ✅ Load data khi component mount
  useEffect(() => {
    if (activeTab === "online") {
      handleSearch();
    }
  }, [activeTab, currentPage, pageSize]);

  // ✅ Handle search với debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "online") {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // ✅ Function để thực hiện search
  const handleSearch = () => {
    const queryParams: OnlineRegistrationQueryParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
    };

    // Add filters
    if (statusFilter !== "all") {
      const statusMap: { [key: string]: number } = {
        "chờ xác nhận": 0,
        "chờ khám": 0,
        "đã khám": 1,
        "hoàn thành": 2,
        "đã hủy": 3,
      };
      queryParams.Status = statusMap[statusFilter];
    }

    if (paymentStatusFilter !== "all") {
      queryParams.StatusPayment = parseInt(paymentStatusFilter);
    }

    if (dateFromFilter) {
      queryParams.DateCreate = dateFromFilter;
    }

    if (dateToFilter) {
      queryParams.DateUpdate = dateToFilter;
    }

    // Advanced search với searchTerm
    if (searchTerm.trim()) {
      dispatch(
        searchRegistrationsThunk({
          patientId: isNaN(parseInt(searchTerm))
            ? undefined
            : parseInt(searchTerm),
          orderId: searchTerm,
          page: currentPage,
          pageSize: pageSize,
          status: statusFilter !== "all" ? [queryParams.Status!] : undefined,
          paymentStatus:
            paymentStatusFilter !== "all"
              ? [parseInt(paymentStatusFilter)]
              : undefined,
          dateFrom: dateFromFilter || undefined,
          dateTo: dateToFilter || undefined,
        })
      );
    } else {
      dispatch(fetchAllOnlineRegistrations(queryParams));
    }
  };

  // ✅ Handle quick filter buttons
  const handleQuickFilter = (filterType: string, value: any) => {
    setCurrentPage(1); // Reset to first page

    switch (filterType) {
      case "status":
        dispatch(
          fetchRegistrationsByStatus({
            status: value,
            page: 1,
            pageSize,
          })
        );
        break;
      case "payment":
        dispatch(
          fetchRegistrationsByPaymentStatus({
            statusPayment: value,
            page: 1,
            pageSize,
          })
        );
        break;
      case "cancelled":
        dispatch(
          fetchCancelledRegistrations({
            page: 1,
            pageSize,
          })
        );
        break;
      default:
        handleSearch();
    }
  };

  // ✅ Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  // ✅ Handle refresh
  const handleRefresh = () => {
    dispatch(clearAllRegistrationsPagination());
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);

    // Load fresh data
    setTimeout(() => {
      dispatch(
        fetchAllOnlineRegistrations({
          PageNumber: 1,
          PageSize: pageSize,
        })
      );
    }, 100);
  };

  // ✅ Status mapping cho online registrations
  const getOnlineStatusDisplay = (item: any) => {
    if (item.cancel) return "Đã hủy";
    if (item.confirm && item.status === 1) return "Đã khám";
    if (item.confirm) return "Đã xác nhận";

    switch (item.status) {
      case 0:
        return "Chờ khám";
      case 1:
        return "Đã khám";
      case 2:
        return "Hoàn thành";
      case 3:
        return "Đã hủy";
      default:
        return "Chờ xác nhận";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "đã xác nhận":
      case "chờ khám":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "chờ xác nhận":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "đã khám":
        return "bg-green-100 text-green-800 border-green-200";
      case "hoàn thành":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "đã hủy":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ✅ Payment status display
  const getPaymentStatusDisplay = (statusPayment: number) => {
    switch (statusPayment) {
      case 0:
        return "Chưa thanh toán";
      case 1:
        return "Đã thanh toán";
      case 2:
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (statusPayment: number) => {
    switch (statusPayment) {
      case 0:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ✅ Format date display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Calculate patient age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age > 0 ? `${age} tuổi` : "< 1 tuổi";
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý phiếu khám
          </h1>
          <p className="text-gray-600">
            Quản lý phiếu khám từ hệ thống online và HIS
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã đăng ký, mã đơn hàng, ID bệnh nhân..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="chờ xác nhận">Chờ xác nhận</SelectItem>
                  <SelectItem value="chờ khám">Chờ khám</SelectItem>
                  <SelectItem value="đã khám">Đã khám</SelectItem>
                  <SelectItem value="hoàn thành">Hoàn thành</SelectItem>
                  <SelectItem value="đã hủy">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thanh toán</SelectItem>
                  <SelectItem value="0">Chưa thanh toán</SelectItem>
                  <SelectItem value="1">Đã thanh toán</SelectItem>
                  <SelectItem value="2">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Từ ngày"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />

              <Input
                type="date"
                placeholder="Đến ngày"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>

            {/* Row 3: Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter("status", 0)}
              >
                Chờ khám
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter("status", 1)}
              >
                Đã khám
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter("cancelled", true)}
              >
                Đã hủy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter("payment", 0)}
              >
                Chưa thanh toán
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter("payment", 1)}
              >
                Đã thanh toán
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different data sources */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="online">
            Đăng ký Online ({allRegistrationsPagination?.totalCount || 0})
          </TabsTrigger>
          <TabsTrigger value="his">
            Dữ liệu HIS ({hisAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="online">
          <Card>
            <CardContent>
              <OnlineRegistrationTable
                currentPage={currentPage}
                pageSize={pageSize}
                handlePageChange={handlePageChange}
                handlePageSizeChange={handlePageSizeChange}
                getStatusColor={getStatusColor}
                getOnlineStatusDisplay={getOnlineStatusDisplay}
                formatDate={formatDate}
                calculateAge={calculateAge}
                getPaymentStatusDisplay={getPaymentStatusDisplay}
                getPaymentStatusColor={getPaymentStatusColor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="his">
          <Card>
            <CardHeader>
              <CardTitle>
                Phiếu khám từ HIS (Hospital Information System)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto overflow-y-auto h-[70vh] border rounded-lg">
                <AppointmentTable
                  appointments={hisAppointments}
                  getStatusColor={getStatusColor}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentManagement;
