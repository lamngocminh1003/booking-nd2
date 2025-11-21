import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAllOnlineRegistrations } from "@/store/slices/bookingCatalogSlice";
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
  Eye,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import OnlineRegistrationDetail from "./OnlineRegistrationDetail";
const OnlineRegistrationTable = (props) => {
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getStatusColor,
    getOnlineStatusDisplay,
    formatDate,
    calculateAge,
    getPaymentStatusDisplay,
    getPaymentStatusColor,
  } = props;
  const dispatch = useAppDispatch();
  const { allRegistrationsPagination, loadingAllRegistrations, error } =
    useAppSelector((state) => state.bookingCatalog);
  const registrations = allRegistrationsPagination?.items || [];

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {loadingAllRegistrations && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <span className="font-medium">Lỗi:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loadingAllRegistrations && registrations.length > 0 && (
        <div className="space-y-4">
          {/* Enhanced Pagination Controls */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(
                  currentPage * pageSize,
                  allRegistrationsPagination?.totalCount || 0
                )}{" "}
                trong tổng {allRegistrationsPagination?.totalCount || 0} bản ghi
              </span>

              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!allRegistrationsPagination?.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </Button>

              <span className="text-sm px-2">
                Trang {allRegistrationsPagination?.pageNumber || 1} /{" "}
                {allRegistrationsPagination?.totalPages || 1}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!allRegistrationsPagination?.hasNextPage}
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ✅ Enhanced Table với đầy đủ columns theo data mới */}
          <div className="overflow-x-auto border rounded-lg ">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[140px] font-semibold">
                    Mã ĐK & ID
                  </TableHead>
                  <TableHead className="min-w-[180px] font-semibold">
                    Bệnh nhân
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold">
                    Nguồn tạo
                  </TableHead>
                  <TableHead className="min-w-[200px] font-semibold">
                    Lịch khám
                  </TableHead>
                  <TableHead className="min-w-[150px] font-semibold">
                    Bác sĩ & Phòng
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold">
                    Thanh toán
                  </TableHead>
                  <TableHead className="min-w-[200px] font-semibold">
                    Triệu chứng
                  </TableHead>
                  <TableHead className="min-w-[150px] font-semibold">
                    Người hộ tống
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold">
                    Chỉ số sinh học
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration, index) => (
                  <TableRow
                    key={registration.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    {/* ✅ Mã đăng ký với đầy đủ các ID */}
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-bold text-blue-700 text-sm">
                          #{registration.id}
                        </div>

                        {/* HIS Registration ID */}
                        {registration.onlineRegistrationIdHis && (
                          <div className="text-[10px] text-purple-600 font-mono bg-purple-50 px-1 py-0.5 rounded">
                            HIS: {registration.onlineRegistrationIdHis}
                          </div>
                        )}

                        {/* Registration ID */}
                        {registration.registrationId && (
                          <div className="text-[10px] text-green-600 font-mono bg-green-50 px-1 py-0.5 rounded">
                            REG: {registration.registrationId}
                          </div>
                        )}

                        {/* Order ID */}
                        {registration.orderId && (
                          <div className="text-[10px] text-orange-600 font-mono bg-orange-50 px-1 py-0.5 rounded">
                            ORDER: {registration.orderId}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* ✅ Bệnh nhân với thông tin từ patient object */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {registration.patient?.fullName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {registration.patientId} •{" "}
                          {registration.patient?.dateOfBirth
                            ? calculateAge(registration.patient.dateOfBirth)
                            : "N/A"}
                        </div>

                        {/* Gender Badge */}
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              registration.patient?.genderId === 1
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-pink-50 text-pink-700 border-pink-200"
                            }`}
                          >
                            {registration.patient?.genderId === 1 ? "♂" : "♀"}
                          </Badge>

                          {/* Certificate status */}
                          {registration.isCertificate !== null && (
                            <Badge variant="outline" className="text-[10px]">
                              {registration.isCertificate ? "📋" : "❌"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* ✅ Nguồn tạo */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
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
                        <div className="text-[10px] text-gray-500">
                          👤 Tạo bởi:{" "}
                          <span className="font-medium">
                            #{registration.createBy}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* ✅ Lịch khám và timestamps */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-blue-700">
                          📅 {registration.registrationDate}
                        </div>

                        {/* TimeSlot info */}
                        {registration.timeSlot && (
                          <div className="text-[10px] text-indigo-600 space-y-0.5">
                            <div>
                              🕒 {registration.timeSlot.startSlot} -{" "}
                              {registration.timeSlot.endSlot}
                            </div>
                            <div>STT: #{registration.timeSlot.stt}</div>
                          </div>
                        )}

                        <div className="text-[10px] text-gray-500 space-y-0.5">
                          <div>
                            🟢 Tạo: {formatDate(registration.dateCreate)}
                          </div>
                          {registration.dateUpdate !==
                            registration.dateCreate && (
                            <div className="text-amber-600">
                              🟡 Sửa: {formatDate(registration.dateUpdate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* ✅ Bác sĩ & Phòng khám */}
                    <TableCell>
                      {registration.timeSlot ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            <Stethoscope className="w-3 h-3 inline mr-1" />
                            {registration.timeSlot.doctorName}
                          </div>
                          <div className="text-xs text-gray-600">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            {registration.timeSlot.roomName}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-cyan-50 text-cyan-700 border-cyan-200"
                          >
                            {registration.timeSlot.specialtyName}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs">
                          ❌ Chưa có lịch
                        </div>
                      )}
                    </TableCell>

                    {/* ✅ Trạng thái với nhiều thông tin */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          className={`${getStatusColor(
                            getOnlineStatusDisplay(registration)
                          )} border font-medium`}
                        >
                          {getOnlineStatusDisplay(registration)}
                        </Badge>

                        {/* Sub-statuses */}
                        <div className="flex flex-wrap gap-1">
                          {registration.cancel && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-red-50 text-red-700 border-red-200"
                            >
                              ❌ Cancel
                            </Badge>
                          )}
                          {registration.confirm && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-green-50 text-green-700 border-green-200"
                            >
                              ✅ Confirm
                            </Badge>
                          )}
                        </div>

                        {/* Cancel approval status */}
                        {registration.cancelApprovalStatus !== null &&
                          registration.cancelApprovalStatusName && (
                            <div className="text-[10px] text-red-600 font-medium">
                              🔍 {registration.cancelApprovalStatusName}
                            </div>
                          )}
                      </div>
                    </TableCell>

                    {/* ✅ Thanh toán */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          className={`${getPaymentStatusColor(
                            registration.statusPayment
                          )} border font-medium`}
                        >
                          {getPaymentStatusDisplay(registration.statusPayment)}
                        </Badge>

                        {registration.orderId && (
                          <div className="text-[10px] text-blue-600 font-mono">
                            💳 Order: {registration.orderId}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* ✅ Triệu chứng và thông tin bổ sung */}
                    <TableCell>
                      <div className="max-w-48 space-y-1">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800 mb-1">
                            🩺 Triệu chứng:
                          </div>
                          <div
                            className="text-xs p-2 bg-blue-50 rounded border text-gray-700 line-clamp-2"
                            title={registration.symptom}
                          >
                            {registration.symptom || "Không có thông tin"}
                          </div>
                        </div>

                        {registration.requiredInformation && (
                          <div className="text-sm">
                            <div className="font-medium text-gray-800 mb-1">
                              ℹ️ Thông tin bổ sung:
                            </div>
                            <div
                              className="text-xs p-2 bg-amber-50 rounded border text-gray-700 line-clamp-2"
                              title={registration.requiredInformation}
                            >
                              {registration.requiredInformation}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* ✅ Người hộ tống */}
                    <TableCell>
                      {registration.patientEscortName ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-gray-800">
                            👤 {registration.patientEscortName}
                          </div>
                          <div className="text-xs text-blue-600">
                            📞 {registration.patientEscortPhone}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {registration.patientEscortRelationship}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">
                            ❌ Không có
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* ✅ Chỉ số sinh học */}
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="bg-green-50 p-2 rounded border">
                          <div className="font-medium text-green-800 mb-1">
                            📏 Thể trạng:
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <div className="text-blue-600">
                              ⚖️{" "}
                              <span className="font-medium">
                                {registration.weight || 0}kg
                              </span>
                            </div>
                            <div className="text-purple-600">
                              📐{" "}
                              <span className="font-medium">
                                {registration.height || 0}cm
                              </span>
                            </div>
                          </div>

                          {/* BMI calculation */}
                          {registration.weight > 0 &&
                            registration.height > 0 && (
                              <div className="mt-1 text-[10px] text-gray-600">
                                BMI:{" "}
                                {(
                                  registration.weight /
                                  Math.pow(registration.height / 100, 2)
                                ).toFixed(1)}
                              </div>
                            )}
                        </div>
                      </div>
                    </TableCell>

                    {/* ✅ Thao tác */}
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Xem</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                              <Stethoscope className="w-5 h-5 text-blue-600" />
                              Chi tiết đăng ký khám - #{registration.id}
                            </DialogTitle>
                          </DialogHeader>
                          <OnlineRegistrationDetail
                            registration={registration}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingAllRegistrations && registrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">
            📋 Không tìm thấy dữ liệu đăng ký khám
          </div>
          <div className="text-gray-400 text-sm mb-4">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </div>
          <Button
            variant="outline"
            onClick={() =>
              dispatch(
                fetchAllOnlineRegistrations({ PageNumber: 1, PageSize: 20 })
              )
            }
          >
            🔄 Tải lại dữ liệu
          </Button>
        </div>
      )}
    </div>
  );
};
export default OnlineRegistrationTable;
