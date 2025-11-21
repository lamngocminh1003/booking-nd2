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
export const AppointmentTable = ({
  appointments,
  getStatusColor,
}: {
  appointments: any[];
  getStatusColor;
}) => {
  return (
    <div className="space-y-3 ">
      {/* ✅ Compact Stats Bar cho HIS */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-purple-700 font-medium">
            🏥 {appointments.length} phiếu khám
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">HIS System</span>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1 bg-purple-50 text-purple-700 border-purple-200"
          >
            HIS
          </Badge>
          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
            <RefreshCw className="w-2 h-2 mr-1" />
            Đồng bộ
          </Button>
        </div>
      </div>

      {/* ✅ Compact Table */}
      {appointments.length > 0 ? (
        <div className="border rounded-lg overflow-hidden ">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 h-8">
                <TableHead className="w-20 text-[10px] font-medium p-2">
                  Mã phiếu
                </TableHead>
                <TableHead className="w-28 text-[10px] font-medium p-2">
                  Bệnh nhi
                </TableHead>
                <TableHead className="w-24 text-[10px] font-medium p-2">
                  Bác sĩ
                </TableHead>
                <TableHead className="w-24 text-[10px] font-medium p-2">
                  Khoa phòng
                </TableHead>
                <TableHead className="w-28 text-[10px] font-medium p-2">
                  Ngày giờ khám
                </TableHead>
                <TableHead className="w-20 text-[10px] font-medium p-2">
                  Loại khám
                </TableHead>
                <TableHead className="w-18 text-[10px] font-medium p-2">
                  Trạng thái
                </TableHead>
                <TableHead className="text-[10px] font-medium p-2">
                  Triệu chứng
                </TableHead>
                <TableHead className="w-12 text-[10px] font-medium text-right p-2">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment, index) => (
                <TableRow
                  key={appointment.id}
                  className={`hover:bg-purple-50/50 transition-colors h-12 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* ✅ Compact Mã phiếu */}
                  <TableCell className="p-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-purple-700 text-[10px] font-mono">
                        {appointment.id}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[8px] h-2 px-0.5 bg-purple-50 text-purple-600 border-purple-200"
                      >
                        HIS
                      </Badge>
                    </div>
                  </TableCell>

                  {/* ✅ Compact Bệnh nhi */}
                  <TableCell className="p-2">
                    <div className="space-y-0.5">
                      <div className="font-medium text-gray-900 text-[10px] truncate">
                        {appointment.patientName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={`text-[8px] h-2 px-0.5 ${
                            appointment.patientGender === "Nam"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-pink-50 text-pink-600 border-pink-200"
                          }`}
                        >
                          {appointment.patientGender === "Nam" ? "♂" : "♀"}
                        </Badge>
                        <span className="text-gray-500 text-[8px]">
                          {appointment.patientAge}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* ✅ Compact Bác sĩ */}
                  <TableCell className="p-2">
                    <div className="font-medium text-gray-900 text-[10px] flex items-center gap-0.5 truncate">
                      <Stethoscope className="w-2 h-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{appointment.doctorName}</span>
                    </div>
                  </TableCell>

                  {/* ✅ Compact Khoa phòng */}
                  <TableCell className="p-2">
                    <div className="space-y-0.5">
                      <div className="font-medium text-gray-900 text-[10px] flex items-center gap-0.5 truncate">
                        <MapPin className="w-2 h-2 text-green-500 flex-shrink-0" />
                        <span className="truncate">
                          {appointment.department}
                        </span>
                      </div>
                      {appointment.room && (
                        <div className="text-[8px] text-gray-500 truncate">
                          {appointment.room}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* ✅ Compact Ngày giờ khám */}
                  <TableCell className="p-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-medium text-blue-700 flex items-center gap-0.5">
                        <Calendar className="w-2 h-2" />
                        <span>{appointment.appointmentDate}</span>
                      </div>
                      <div className="text-[8px] text-gray-600 flex items-center gap-0.5">
                        <Clock className="w-2 h-2" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* ✅ Compact Loại khám */}
                  <TableCell className="p-2">
                    <Badge
                      variant="outline"
                      className={`text-[8px] font-medium h-4 px-1 ${
                        appointment.type === "Phẫu thuật nhỏ"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : appointment.type === "Khám chuyên khoa"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : appointment.type === "Khám tổng quát"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {appointment.type === "Phẫu thuật nhỏ" && "🔪"}
                      {appointment.type === "Khám chuyên khoa" && "🔬"}
                      {appointment.type === "Khám tổng quát" && "🩺"}
                      {appointment.type === "Phẫu thuật nhỏ"
                        ? "PT"
                        : appointment.type === "Khám chuyên khoa"
                        ? "CK"
                        : appointment.type === "Khám tổng quát"
                        ? "TQ"
                        : appointment.type}
                    </Badge>
                  </TableCell>

                  {/* ✅ Compact Trạng thái */}
                  <TableCell className="p-2">
                    <Badge
                      className={`${getStatusColor(
                        appointment.status
                      )} border font-medium text-[8px] h-4 px-1`}
                    >
                      {appointment.status === "Đã hoàn thành" && "✅"}
                      {appointment.status === "Đã chuyển đi" && "↗️"}
                      {appointment.status === "Đang khám" && "🔄"}
                      {appointment.status === "Chờ khám" && "⏳"}
                      <span className="ml-0.5">
                        {appointment.status === "Đã hoàn thành"
                          ? "Xong"
                          : appointment.status === "Đã chuyển đi"
                          ? "Chuyển"
                          : appointment.status === "Đang khám"
                          ? "Khám"
                          : appointment.status === "Chờ khám"
                          ? "Chờ"
                          : appointment.status}
                      </span>
                    </Badge>
                  </TableCell>

                  {/* ✅ Compact Triệu chứng */}
                  <TableCell className="p-2">
                    <div className="max-w-32 space-y-0.5">
                      <div
                        className="text-[9px] p-1 bg-blue-50 rounded text-gray-700 line-clamp-1"
                        title={appointment.symptoms}
                      >
                        {appointment.symptoms || "Không có thông tin"}
                      </div>
                      {appointment.notes && (
                        <div
                          className="text-[8px] p-1 bg-amber-50 rounded text-gray-700 line-clamp-1"
                          title={appointment.notes}
                        >
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* ✅ Compact Thao tác */}
                  <TableCell className="p-2 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-purple-100"
                        >
                          <Eye className="w-2 h-2" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs">
                              🏥
                            </div>
                            Phiếu HIS - {appointment.id}
                          </DialogTitle>
                        </DialogHeader>
                        <CompactHISAppointmentDetail
                          appointment={appointment}
                          getStatusColor={getStatusColor}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        // ✅ Compact Empty State
        <div className="text-center py-8 bg-gradient-to-b from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="text-3xl mb-2">🏥</div>
          <div className="text-purple-700 text-sm font-medium mb-1">
            Không có dữ liệu HIS
          </div>
          <div className="text-purple-600 text-xs mb-3">
            Chưa có phiếu khám từ HIS
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 h-6 text-xs"
          >
            <RefreshCw className="w-2 h-2 mr-1" />
            Đồng bộ
          </Button>
        </div>
      )}
    </div>
  );
};
// ✅ Compact HIS Appointment Detail Component
const CompactHISAppointmentDetail = ({
  appointment,
  getStatusColor,
}: {
  appointment: any;
  getStatusColor;
}) => (
  <div className="space-y-3">
    {/* ✅ Compact Patient Info Card */}
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-3 h-3 text-purple-600" />
        <h3 className="font-medium text-purple-900 text-sm">
          Thông tin bệnh nhi
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-medium text-gray-700">Tên bệnh nhi:</label>
          <p className="text-gray-900">{appointment.patientName}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Tuổi:</label>
          <p className="text-gray-900">{appointment.patientAge}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Giới tính:</label>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                appointment.patientGender === "Nam"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-pink-50 text-pink-700 border-pink-200"
              }`}
            >
              {appointment.patientGender === "Nam" ? "👦" : "👧"}{" "}
              {appointment.patientGender}
            </Badge>
          </div>
        </div>
        <div>
          <label className="font-medium text-gray-700">SĐT:</label>
          <p className="text-gray-900">{appointment.phone || "N/A"}</p>
        </div>
      </div>
    </div>

    {/* ✅ Compact Appointment Info Card */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-3 h-3 text-blue-600" />
        <h3 className="font-medium text-blue-900 text-sm">
          Thông tin phiếu khám
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-medium text-gray-700">Mã phiếu:</label>
          <p className="text-gray-900 font-mono bg-white px-1 py-0.5 rounded text-[10px]">
            {appointment.id}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Loại khám:</label>
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            {appointment.type}
          </Badge>
        </div>
        <div>
          <label className="font-medium text-gray-700">Ngày khám:</label>
          <p className="text-gray-900">{appointment.appointmentDate}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Giờ khám:</label>
          <p className="text-gray-900">{appointment.appointmentTime}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Trạng thái:</label>
          <Badge
            className={`${getStatusColor(appointment.status)} border text-xs`}
          >
            {appointment.status}
          </Badge>
        </div>
        <div>
          <label className="font-medium text-gray-700">Nguồn:</label>
          <Badge
            variant="outline"
            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
          >
            🏥 {appointment.source}
          </Badge>
        </div>
      </div>
    </div>

    {/* ✅ Compact Medical Info Card */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
      <div className="flex items-center gap-2 mb-2">
        <Stethoscope className="w-3 h-3 text-green-600" />
        <h3 className="font-medium text-green-900 text-sm">Thông tin y tế</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
        <div>
          <label className="font-medium text-gray-700">Bác sĩ:</label>
          <p className="text-gray-900">{appointment.doctorName}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">Khoa phòng:</label>
          <p className="text-gray-900">{appointment.department}</p>
        </div>
        {appointment.room && (
          <div>
            <label className="font-medium text-gray-700">Phòng khám:</label>
            <p className="text-gray-900">{appointment.room}</p>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="font-medium text-gray-700 block mb-1">
            Triệu chứng:
          </label>
          <p className="text-gray-900 bg-white p-2 rounded border">
            {appointment.symptoms || "Không có thông tin"}
          </p>
        </div>

        {appointment.notes && (
          <div>
            <label className="font-medium text-gray-700 block mb-1">
              Ghi chú:
            </label>
            <p className="text-gray-900 bg-white p-2 rounded border">
              {appointment.notes}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* ✅ Compact System Info */}
    <div className="bg-gray-50 p-2 rounded border text-[10px]">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-medium text-gray-700">Hệ thống:</span>
          <span className="text-gray-900 ml-1">HIS</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Đồng bộ:</span>
          <span className="text-gray-900 ml-1">
            {new Date().toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  </div>
);
