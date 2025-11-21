import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
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
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Phone,
  Building2,
  UserCheck,
} from "lucide-react";
import OnlineRegistrationTable from "./OnlineRegistrationTable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchAllOnlineRegistrations,
  fetchRegistrationsByStatus,
  fetchRegistrationsByPatient,
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
  const { allRegistrationsPagination, loadingAllRegistrations, error } =
    useAppSelector((state) => state.bookingCatalog);

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

  // ✅ Enhanced Online Registration Detail Component với đầy đủ thông tin
  const OnlineRegistrationDetail = ({
    registration,
  }: {
    registration: any;
  }) => (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <DialogDescription className="text-gray-600">
        Thông tin chi tiết về đăng ký khám online với đầy đủ các thông số
      </DialogDescription>

      {/* ✅ Patient Info - Enhanced */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Thông tin bệnh nhân</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên đầy đủ
            </label>
            <p className="text-sm text-gray-900 font-medium">
              {registration.patient?.fullName || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mã bệnh nhân
            </label>
            <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
              #{registration.patientId}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <p className="text-sm text-gray-900">
              {registration.patient?.dateOfBirth
                ? formatDate(registration.patient.dateOfBirth)
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tuổi</label>
            <p className="text-sm text-gray-900">
              {registration.patient?.dateOfBirth
                ? calculateAge(registration.patient.dateOfBirth)
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Giới tính
            </label>
            <Badge
              variant="outline"
              className={`${
                registration.patient?.genderId === 1
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-pink-50 text-pink-700 border-pink-200"
              }`}
            >
              {registration.patient?.genderId === 1 ? "👦 Nam" : "👧 Nữ"}
            </Badge>
          </div>
          {registration.patient?.bhytId && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mã BHYT
              </label>
              <p className="text-sm text-gray-900 font-mono">
                {registration.patient.bhytId}
              </p>
            </div>
          )}
        </div>

        {/* ✅ Patient Guardian Info */}
        {registration.patientEscortName && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">
              👨‍👩‍👧‍👦 Thông tin người hộ tống
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tên người hộ tống
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {registration.patientEscortName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <p className="text-sm text-gray-900">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {registration.patientEscortPhone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Quan hệ
                </label>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {registration.patientEscortRelationship}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Registration Info - Enhanced */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-900">Thông tin đăng ký</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mã đăng ký
            </label>
            <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
              #{registration.id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mã HIS</label>
            <p className="text-sm text-gray-900 font-mono">
              {registration.onlineRegistrationIdHis || "Chưa đồng bộ"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mã đơn hàng
            </label>
            <p className="text-sm text-gray-900 font-mono">
              {registration.orderId || "Chưa có"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mã đăng ký HIS
            </label>
            <p className="text-sm text-gray-900 font-mono">
              {registration.registrationId || "Chưa có"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <Badge
              className={`${getStatusColor(
                getOnlineStatusDisplay(registration)
              )} border`}
            >
              {getOnlineStatusDisplay(registration)}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Thanh toán
            </label>
            <Badge
              className={`${getPaymentStatusColor(
                registration.statusPayment
              )} border`}
            >
              {getPaymentStatusDisplay(registration.statusPayment)}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Ngày khám
            </label>
            <p className="text-sm text-gray-900 font-medium">
              📅 {registration.registrationDate}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nguồn tạo
            </label>
            <Badge
              variant="outline"
              className={`${
                registration.type === 1
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : registration.type === 2
                  ? "bg-green-50 text-green-700 border-green-200"
                  : registration.type === 4
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {registration.typeName}
            </Badge>
          </div>
        </div>

        {/* ✅ Status Flags */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex flex-wrap gap-2">
            {registration.cancel && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                ❌ Đã hủy
              </Badge>
            )}
            {registration.confirm && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                ✅ Đã xác nhận
              </Badge>
            )}
            {registration.isCertificate !== null && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {registration.isCertificate
                  ? "📋 Có giấy tờ"
                  : "📋 Chưa có giấy tờ"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ✅ TimeSlot Info - New */}
      {registration.timeSlot && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">
              Thông tin lịch khám
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Thời gian khám
              </label>
              <p className="text-sm text-gray-900 font-medium">
                🕒 {registration.timeSlot.startSlot} -{" "}
                {registration.timeSlot.endSlot}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                STT khám
              </label>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                #{registration.timeSlot.stt}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Bác sĩ
              </label>
              <p className="text-sm text-gray-900 font-medium">
                <Stethoscope className="w-3 h-3 inline mr-1" />
                {registration.timeSlot.doctorName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phòng khám
              </label>
              <p className="text-sm text-gray-900">
                <Building2 className="w-3 h-3 inline mr-1" />
                {registration.timeSlot.roomName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Khoa</label>
              <p className="text-sm text-gray-900">
                {registration.timeSlot.departmentName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Chuyên khoa
              </label>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {registration.timeSlot.specialtyName}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Khu khám
              </label>
              <p className="text-sm text-gray-900">
                <MapPin className="w-3 h-3 inline mr-1" />
                {registration.timeSlot.zoneName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Loại khám
              </label>
              <Badge
                variant="outline"
                className="bg-cyan-50 text-cyan-700 border-cyan-200"
              >
                {registration.timeSlot.examTypeName}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Medical Info - Enhanced */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-orange-900">Thông tin y tế</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Triệu chứng
            </label>
            <div className="bg-white p-3 rounded border border-orange-200">
              <p className="text-sm text-gray-900">
                {registration.symptom || "Không có thông tin"}
              </p>
            </div>
          </div>

          {registration.requiredInformation && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Thông tin bổ sung
              </label>
              <div className="bg-white p-3 rounded border border-orange-200">
                <p className="text-sm text-gray-900">
                  {registration.requiredInformation}
                </p>
              </div>
            </div>
          )}

          {/* ✅ Biometric Info */}
          {(registration.weight > 0 || registration.height > 0) && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Chỉ số sinh học
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registration.weight > 0 && (
                  <div className="bg-white p-3 rounded border border-orange-200 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      ⚖️ {registration.weight}kg
                    </div>
                    <div className="text-xs text-gray-500">Cân nặng</div>
                  </div>
                )}
                {registration.height > 0 && (
                  <div className="bg-white p-3 rounded border border-orange-200 text-center">
                    <div className="text-lg font-bold text-purple-600">
                      📐 {registration.height}cm
                    </div>
                    <div className="text-xs text-gray-500">Chiều cao</div>
                  </div>
                )}
                {registration.weight > 0 && registration.height > 0 && (
                  <div className="bg-white p-3 rounded border border-orange-200 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {(
                        registration.weight /
                        Math.pow(registration.height / 100, 2)
                      ).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">BMI</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ System Info - Enhanced */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-800">Thông tin hệ thống</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Ngày tạo:</label>
            <p className="text-gray-900">
              {formatDate(registration.dateCreate)}
            </p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Ngày cập nhật:</label>
            <p className="text-gray-900">
              {formatDate(registration.dateUpdate)}
            </p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Người tạo:</label>
            <p className="text-gray-900">User #{registration.createBy}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Time Slot ID:</label>
            <p className="text-gray-900">{registration.timeSlotId || "N/A"}</p>
          </div>
          {registration.cancelApprovalStatus !== null && (
            <div className="col-span-2">
              <label className="font-medium text-gray-700">
                Trạng thái phê duyệt hủy:
              </label>
              <Badge
                variant="outline"
                className="ml-2 bg-red-50 text-red-700 border-red-200"
              >
                {registration.cancelApprovalStatusName ||
                  `Status: ${registration.cancelApprovalStatus}`}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
