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
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

const OnlineRegistrationDetail = (props) => {(
    const { registration } = props;
    return ( <div className="space-y-6 max-h-[80vh] overflow-y-auto">
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
          <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
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
          <label className="text-sm font-medium text-gray-700">Giới tính</label>
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
            <label className="text-sm font-medium text-gray-700">Mã BHYT</label>
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
          <label className="text-sm font-medium text-gray-700">Ngày khám</label>
          <p className="text-sm text-gray-900 font-medium">
            📅 {registration.registrationDate}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Nguồn tạo</label>
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
          <h3 className="font-semibold text-purple-900">Thông tin lịch khám</h3>
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
            <label className="text-sm font-medium text-gray-700">Bác sĩ</label>
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
          <p className="text-gray-900">{formatDate(registration.dateCreate)}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Ngày cập nhật:</label>
          <p className="text-gray-900">{formatDate(registration.dateUpdate)}</p>
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
  </div>);
 
);};
export default OnlineRegistrationDetail;
