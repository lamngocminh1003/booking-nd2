import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  MapPin,
  FileText,
  X,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  Phone,
  Clock,
  Plus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchOnlineRegistrationsByPatient,
  cancelRegistrationThunk,
  clearPatientRegistrations,
} from "@/store/slices/bookingCatalogSlice";
import { OnlineRegistrationItem } from "@/services/BookingCatalogService";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface OnlineRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: number;
  patientName?: string;
}

// ✅ Create union type to handle both data structures
type RegistrationData = OnlineRegistrationItem | PatientRegistrationData;

// ✅ Add interface to match actual data structure
interface PatientRegistrationData {
  id: number;
  onlineRegistrationId: number | null;
  cancel: boolean;
  confirm: boolean;
  patientId: number;
  symptom: string;
  requiredInformation: string;
  statusPayment: number;
  registrationId: number | null;
  registrationDate: string;
  weight: number;
  height: number;
  status: number;
  type: number;
  dateCreate: string;
  dateUpdate: string;
  timeSlotId: number | null;
  logs: any;
  createBy: number;
  patientEscortName: string;
  patientEscortPhone: string;
  patientEscortRelationship: string;
}

const OnlineRegistrationModal: React.FC<OnlineRegistrationModalProps> = ({
  open,
  onOpenChange,
  patientId,
  patientName,
}) => {
  const dispatch = useAppDispatch();
  const {
    patientRegistrations,
    loadingPatientRegistrations,
    error,
    patientList,
  } = useAppSelector((state) => state.bookingCatalog);

  // ✅ Local state
  const [selectedPatientId, setSelectedPatientId] = useState<
    number | undefined
  >(patientId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationData | null>(null);
  const navigate = useNavigate();

  // ✅ Load registrations when modal opens or patient changes
  useEffect(() => {
    if (open && selectedPatientId) {
      dispatch(fetchOnlineRegistrationsByPatient(selectedPatientId));
    }
  }, [dispatch, open, selectedPatientId]);

  // ✅ Update selected patient when prop changes
  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  }, [patientId]);

  // ✅ Clear data when modal closes
  useEffect(() => {
    if (!open) {
      dispatch(clearPatientRegistrations());
      setSelectedRegistration(null);
      setSearchTerm("");
      setStatusFilter("all");
    }
  }, [dispatch, open]);

  // ✅ Handle patient selection change
  const handlePatientChange = (newPatientId: string) => {
    const id = parseInt(newPatientId);
    setSelectedPatientId(id);
    setSelectedRegistration(null);
  };

  // ✅ Handle cancel registration
  const handleCancelRegistration = async (registrationId: number) => {
    try {
      await dispatch(cancelRegistrationThunk(registrationId)).unwrap();
      if (selectedPatientId) {
        dispatch(fetchOnlineRegistrationsByPatient(selectedPatientId));
      }
    } catch (error) {
      console.error("Failed to cancel registration:", error);
    }
  };

  // ✅ Type guard to check if registration is PatientRegistrationData
  const isPatientRegistrationData = (
    registration: any
  ): registration is PatientRegistrationData => {
    return (
      registration &&
      typeof registration.cancel === "boolean" &&
      typeof registration.confirm === "boolean"
    );
  };

  // ✅ Get payment status text
  const getPaymentStatus = (statusPayment: number) => {
    switch (statusPayment) {
      case 0:
        return "Chưa thanh toán";
      case 1:
        return "Đã thanh toán";
      case 2:
        return "Thanh toán một phần";
      default:
        return "Không xác định";
    }
  };

  // ✅ Get registration type
  const getRegistrationType = (type: number) => {
    switch (type) {
      case 1:
        return "Khám online";
      case 2:
        return "Khám trực tiếp";
      default:
        return "Không xác định";
    }
  };

  const statusFilterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "chờ xác nhận", label: "Chờ XN" },
    { value: "chờ khám", label: "Chờ khám" },
    { value: "đã khám", label: "Đã khám" },
    { value: "hoàn thành", label: "Hoàn thành" },
    { value: "đã hủy", label: "Đã hủy" },
    { value: "hết hạn", label: "Hết hạn" }, // ✅ Added expired status
  ];

  // ✅ Format date for display
  const formatRegistrationDate = (dateStr: string) => {
    try {
      // Handle DD/MM/YYYY HH:mm format
      const [datePart, timePart] = dateStr.split(" ");
      const [day, month, year] = datePart.split("/");
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;

      if (timePart && timePart !== "00:00") {
        return format(
          parseISO(`${formattedDate}T${timePart}`),
          "dd/MM/yy HH:mm",
          { locale: vi }
        );
      }
      return format(parseISO(formattedDate), "dd/MM/yy", { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "đã xác nhận":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "chờ khám":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "đã khám":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
      case "chờ xác nhận":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
      case "đã hủy":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
      case "hoàn thành":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "hết hạn": // ✅ Add color for expired status
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ✅ Get selected patient name
  const selectedPatientName =
    patientName ||
    patientList.find((p) => p.id === selectedPatientId)?.fullName ||
    "Bệnh nhân";

  // ✅ Add helper function to check if registration is expired
  const isRegistrationExpired = (registration: PatientRegistrationData) => {
    // Cannot expire if already paid, examined, or completed
    if (registration.statusPayment !== 0) return false;
    if (registration.status === 1) return false; // Already examined
    if (registration.status === 2) return false; // Already completed
    if (registration.cancel) return false; // Already cancelled

    const createdTime = new Date(registration.dateUpdate);
    const currentTime = new Date();
    const diffInMinutes =
      (currentTime.getTime() - createdTime.getTime()) / (1000 * 60);

    return diffInMinutes > 15; // Expired after 15 minutes
  };
  // ✅ Convert status to readable text (works with both types)
  const getStatusFromData = (registration: any) => {
    if (isPatientRegistrationData(registration)) {
      // ✅ Check expired first
      if (isRegistrationExpired(registration)) {
        return "Hết hạn";
      }

      // Priority: Check cancel/confirm flags
      if (registration.cancel) return "Đã hủy";
      if (registration.confirm) {
        // If confirmed, check if examination is done
        if (registration.status === 1) return "Đã khám";
        return "Đã xác nhận";
      }

      // Check main status
      switch (registration.status) {
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
    } else {
      // Handle OnlineRegistrationItem
      return registration.status || "Chờ xác nhận";
    }
  };
  const filteredRegistrations = patientRegistrations.filter(
    (registration: any) => {
      let searchText = "";

      if (isPatientRegistrationData(registration)) {
        searchText = `${registration.symptom || ""} ${
          registration.requiredInformation || ""
        } ${registration.patientEscortName || ""}`.toLowerCase();
      } else {
        // Handle OnlineRegistrationItem structure
        searchText = `${registration.symptom || ""} ${
          registration.doctorName || ""
        } ${registration.specialtyName || ""}`.toLowerCase();
      }

      const matchesSearch = searchText.includes(searchTerm.toLowerCase());

      // ✅ Enhanced status matching with expired check
      const currentStatus = getStatusFromData(registration).toLowerCase();
      const matchesStatus =
        statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );
  // ✅ Add navigation function
  const handleRebook = (registration: PatientRegistrationData) => {
    console.log("registration", registration);

    // // Navigate to booking flow with pre-filled data
    // const searchParams = new URLSearchParams();

    // // Add patient ID to URL
    // searchParams.set("childId", registration.patientId.toString());

    // // Navigate to booking flow
    // navigate(`/booking?${searchParams.toString()}`);
  };
  // ✅ Update stats display to show expired count
  const getStatusCounts = () => {
    const counts = {
      total: patientRegistrations.length,
      expired: 0,
      pending: 0,
      waiting: 0,
      examined: 0,
      completed: 0,
      cancelled: 0,
    };

    patientRegistrations.forEach((registration: any) => {
      const status = getStatusFromData(registration).toLowerCase();
      switch (status) {
        case "hết hạn":
          counts.expired++;
          break;
        case "chờ xác nhận":
          counts.pending++;
          break;
        case "chờ khám":
          counts.waiting++;
          break;
        case "đã khám":
          counts.examined++;
          break;
        case "hoàn thành":
          counts.completed++;
          break;
        case "đã hủy":
          counts.cancelled++;
          break;
      }
    });

    return counts;
  };

  // ✅ Enhanced stats section with status breakdown
  const statusCounts = getStatusCounts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] min-h-[300px] h-auto p-0 gap-0">
        {/* ✅ Compact Header */}
        <DialogHeader className="px-3 py-2 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="truncate">Lịch sử đăng ký</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-600">
            Danh sách đăng ký khám của bệnh nhân
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* ✅ Compact Controls */}
          <div className="px-3 py-2 bg-gray-50 border-b space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {/* ✅ Patient Selection */}
              <div>
                <Label className="text-xs font-medium text-gray-700">
                  Bệnh nhân
                </Label>
                <Select
                  value={selectedPatientId?.toString()}
                  onValueChange={handlePatientChange}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn bệnh nhân" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientList.map((patient) => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">
                            {patient.fullName}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {format(
                              parseISO(patient.dateOfBirth),
                              "dd/MM/yyyy"
                            )}{" "}
                            - {patient.genderName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Search & Filter Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700">
                    Tìm kiếm
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Triệu chứng, ghi chú..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">
                    Trạng thái
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {/* ✅ Show count for each status */}
                            {option.value !== "all" && (
                              <span className="text-[9px] text-gray-400 ml-2">
                                {option.value === "hết hạn" &&
                                  statusCounts.expired > 0 &&
                                  `(${statusCounts.expired})`}
                                {option.value === "chờ xác nhận" &&
                                  statusCounts.pending > 0 &&
                                  `(${statusCounts.pending})`}
                                {option.value === "chờ khám" &&
                                  statusCounts.waiting > 0 &&
                                  `(${statusCounts.waiting})`}
                                {option.value === "đã khám" &&
                                  statusCounts.examined > 0 &&
                                  `(${statusCounts.examined})`}
                                {option.value === "hoàn thành" &&
                                  statusCounts.completed > 0 &&
                                  `(${statusCounts.completed})`}
                                {option.value === "đã hủy" &&
                                  statusCounts.cancelled > 0 &&
                                  `(${statusCounts.cancelled})`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ✅ Enhanced Stats with status breakdown */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Tổng: {statusCounts.total}</span>
                  <span>Hiển thị: {filteredRegistrations.length}</span>
                  {selectedPatientName && (
                    <span className="font-medium truncate max-w-[120px]">
                      {selectedPatientName}
                    </span>
                  )}
                </div>

                {/* ✅ Status breakdown badges */}
                {statusCounts.total > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {statusCounts.expired > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 bg-red-50 text-red-600 border-red-200 cursor-pointer"
                        onClick={() => setStatusFilter("hết hạn")}
                      >
                        Hết hạn: {statusCounts.expired}
                      </Badge>
                    )}
                    {statusCounts.pending > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 bg-yellow-50 text-yellow-600 border-yellow-200 cursor-pointer"
                        onClick={() => setStatusFilter("chờ xác nhận")}
                      >
                        Chờ XN: {statusCounts.pending}
                      </Badge>
                    )}
                    {statusCounts.waiting > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200 cursor-pointer"
                        onClick={() => setStatusFilter("chờ khám")}
                      >
                        Chờ khám: {statusCounts.waiting}
                      </Badge>
                    )}
                    {statusCounts.examined > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 bg-green-50 text-green-600 border-green-200 cursor-pointer"
                        onClick={() => setStatusFilter("đã khám")}
                      >
                        Đã khám: {statusCounts.examined}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Content Section */}
          <div className="flex-1 overflow-hidden">
            {loadingPatientRegistrations ? (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-xs text-gray-500">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedPatientId &&
                    dispatch(
                      fetchOnlineRegistrationsByPatient(selectedPatientId)
                    )
                  }
                  className="h-7 text-xs"
                >
                  Thử lại
                </Button>
              </div>
            ) : !selectedPatientId ? (
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <p className="text-xs">
                    Vui lòng chọn bệnh nhân để xem lịch sử
                  </p>
                </div>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <FileText className="h-4 w-4" />
                  <p className="text-xs">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy kết quả phù hợp"
                      : "Chưa có lịch sử đăng ký khám"}
                  </p>
                </div>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="h-7 text-xs"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[55vh] ">
                <div className="p-2 space-y-2">
                  {filteredRegistrations.map((registration: any) => {
                    const isPatientData =
                      isPatientRegistrationData(registration);

                    return (
                      <Card
                        key={registration.id}
                        className="border border-gray-200 shadow-sm"
                      >
                        {/* ✅ Header */}
                        <CardHeader className="pb-2 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  className={`${getStatusColor(
                                    getStatusFromData(registration)
                                  )} text-[10px] px-1 py-0 h-4`}
                                >
                                  {getStatusFromData(registration)}
                                </Badge>
                                <span className="text-[10px] text-gray-500">
                                  #{registration.id}
                                </span>
                                {isPatientData && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 h-3"
                                  >
                                    {getRegistrationType(registration.type)}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-medium text-xs text-gray-800">
                                {isPatientData
                                  ? `Đăng ký khám ngày ${formatRegistrationDate(
                                      registration.registrationDate
                                    )}`
                                  : registration.specialtyName ||
                                    "Khám tổng quát"}
                              </h3>
                              {isPatientData && registration.timeSlotId && (
                                <p className="text-[10px] text-blue-600">
                                  Slot: {registration.timeSlotId}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedRegistration(registration)
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {isPatientData
                                ? !registration.cancel &&
                                  !registration.confirm && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelRegistration(
                                          registration.id
                                        )
                                      }
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )
                                : registration.status !== "cancelled" &&
                                  registration.status !== "completed" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelRegistration(
                                          registration.id
                                        )
                                      }
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                            </div>
                          </div>
                        </CardHeader>

                        {/* ✅ Content - Conditional based on data type */}
                        <CardContent className="px-3 py-2 pt-0 space-y-2">
                          {isPatientData ? (
                            <>
                              {/* ✅ Check if registration is expired */}
                              {isRegistrationExpired(registration) ? (
                                // ✅ Expired Registration Display
                                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-red-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-red-800 text-sm">
                                          Đăng ký đã hết hạn
                                        </h4>
                                      </div>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-1">
                                      Hết hạn
                                    </Badge>
                                  </div>

                                  {/* ✅ Registration Info Summary */}
                                  <div className="space-y-2 mb-3">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        <span className="truncate">
                                          {formatRegistrationDate(
                                            registration.registrationDate
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-red-400" />
                                        <span className="truncate text-[10px] text-red-500">
                                          Tạo:{" "}
                                          {format(
                                            parseISO(registration.dateUpdate),
                                            "dd/MM HH:mm"
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    {registration.symptom && (
                                      <div className="bg-white border border-red-200 rounded p-2">
                                        <div className="flex items-start gap-1 text-xs">
                                          <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                          <div className="min-w-0 flex-1">
                                            <span className="font-medium text-gray-700">
                                              Triệu chứng:
                                            </span>
                                            <p className="text-gray-600 mt-0.5 text-xs leading-tight line-clamp-2">
                                              {registration.symptom}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* ✅ Rebook Button */}
                                  <div className="flex justify-between items-center pt-2 border-t border-red-200">
                                    <Button
                                      size="sm"
                                      onClick={() => handleRebook(registration)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Đặt lại
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // ✅ Normal Registration Display (existing content)
                                <>
                                  {/* ✅ Patient Registration Data Content */}
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="truncate">
                                        {formatRegistrationDate(
                                          registration.registrationDate
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-gray-400" />
                                      <span className="truncate text-[10px] text-gray-500">
                                        Tạo:{" "}
                                        {format(
                                          parseISO(registration.dateUpdate),
                                          "dd/MM HH:mm"
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Patient Physical Info */}
                                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                                    <div className="text-center">
                                      <div className="text-[10px] text-gray-500">
                                        Cân nặng
                                      </div>
                                      <div className="font-medium">
                                        {registration.weight} kg
                                      </div>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                      <div className="text-[10px] text-gray-500">
                                        Chiều cao
                                      </div>
                                      <div className="font-medium">
                                        {registration.height} cm
                                      </div>
                                    </div>
                                    <div className="text-center border-l border-gray-200">
                                      <div className="text-[10px] text-gray-500">
                                        Thanh toán
                                      </div>
                                      <div className="font-medium text-[10px]">
                                        {getPaymentStatus(
                                          registration.statusPayment
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Symptom */}
                                  {registration.symptom && (
                                    <div className="border-t pt-2 mt-2">
                                      <div className="flex items-start gap-1 text-xs">
                                        <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <span className="font-medium text-gray-700">
                                            Triệu chứng:
                                          </span>
                                          <p className="text-gray-600 mt-0.5 text-xs leading-tight">
                                            {registration.symptom}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Required Information */}
                                  {registration.requiredInformation && (
                                    <div className="border-t pt-2 mt-2">
                                      <div className="flex items-start gap-1 text-xs">
                                        <FileText className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <span className="font-medium text-gray-700">
                                            Ghi chú:
                                          </span>
                                          <p className="text-gray-600 mt-0.5 text-xs leading-tight">
                                            {registration.requiredInformation}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Patient Escort Info */}
                                  <div className="border-t pt-2 mt-2">
                                    <div className="text-xs space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700 flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          Người đưa:
                                        </span>
                                        <span className="text-gray-600 truncate max-w-[120px]">
                                          {registration.patientEscortName}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700 flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          SĐT:
                                        </span>
                                        <span className="text-gray-600">
                                          {registration.patientEscortPhone}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">
                                          Quan hệ:
                                        </span>
                                        <span className="text-gray-600 truncate max-w-[120px]">
                                          {
                                            registration.patientEscortRelationship
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {/* ✅ Online Registration Item Content */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="truncate">
                                    {registration.appointmentDate
                                      ? format(
                                          parseISO(
                                            registration.appointmentDate
                                          ),
                                          "dd/MM/yy"
                                        )
                                      : format(
                                          parseISO(registration.createdAt),
                                          "dd/MM/yy"
                                        )}
                                  </span>
                                </div>
                                {registration.totalAmount && (
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="font-semibold text-green-600 text-xs">
                                      {registration.totalAmount.toLocaleString(
                                        "vi-VN"
                                      )}
                                      đ
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Doctor & Room */}
                              {(registration.doctorName ||
                                registration.roomName) && (
                                <div className="grid grid-cols-1 gap-1">
                                  {registration.doctorName && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">
                                        {registration.doctorName}
                                      </span>
                                    </div>
                                  )}
                                  {registration.roomName && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">
                                        {registration.roomName}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Symptom */}
                              {registration.symptom && (
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex items-start gap-1 text-xs">
                                    <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <span className="font-medium text-gray-700">
                                        Triệu chứng:
                                      </span>
                                      <p className="text-gray-600 mt-0.5 text-xs leading-tight line-clamp-2">
                                        {registration.symptom}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnlineRegistrationModal;
