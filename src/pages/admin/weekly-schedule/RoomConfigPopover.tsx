import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Clock,
  Users,
  Stethoscope,
  Settings,
  MapPin,
  RotateCcw,
} from "lucide-react";

interface RoomConfigPopoverProps {
  room: any;
  roomIndex: number;
  deptId: string;
  slotId: string;
  availableSpecialties: string[];
  availableDoctors: any[];
  roomClassifications: any;
  shiftDefaults: any;
  timeSlots: any[]; // ✅ Thêm timeSlots prop
  updateRoomConfig: (
    deptId: string,
    slotId: string,
    roomIndex: number,
    updates: any
  ) => void;
  removeRoomFromShift: (
    deptId: string,
    slotId: string,
    roomIndex: number
  ) => void;
  getRoomStyle: (type: string) => string;
  hasChanges: boolean;
  getDoctorsBySpecialty: (specialty: string) => any[]; // Thêm prop để lấy bác sĩ theo chuyên khoa
}

export const RoomConfigPopover: React.FC<RoomConfigPopoverProps> = ({
  room,
  roomIndex,
  deptId,
  slotId,
  availableSpecialties,
  availableDoctors,
  roomClassifications,
  shiftDefaults,
  timeSlots, // ✅ Nhận timeSlots prop
  updateRoomConfig,
  removeRoomFromShift,
  getRoomStyle,
  hasChanges,
  getDoctorsBySpecialty,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Lấy thông tin slot và giờ mặc định từ shiftDefaults
  const slotInfo = useMemo(() => {
    const slot = timeSlots?.find((s) => s.id === slotId);
    if (!slot) return null;

    const shiftConfig = shiftDefaults[slot.workSession];
    return {
      slot,
      workSession: slot.workSession,
      periodName: slot.periodName || slot.period,
      defaultStartTime:
        shiftConfig?.startTime || slot.startTime?.slice(0, 5) || "07:30",
      defaultEndTime:
        shiftConfig?.endTime || slot.endTime?.slice(0, 5) || "11:00",
      defaultMaxAppointments: shiftConfig?.maxAppointments || 10,
    };
  }, [slotId, timeSlots, shiftDefaults]);

  // ✅ Kiểm tra xem room có giờ khác với mặc định không
  const isCustomTime = useMemo(() => {
    if (!slotInfo) return false;

    const roomStartTime = room.customStartTime || room.startTime;
    const roomEndTime = room.customEndTime || room.endTime;
    const roomMaxAppointments = room.appointmentCount || room.maxAppointments;

    // ✅ So sánh với giờ hiện tại từ shiftDefaults (không phải giờ gốc)
    const currentDefaultStart = slotInfo.defaultStartTime; // Đã được tính từ shiftDefaults
    const currentDefaultEnd = slotInfo.defaultEndTime;
    const currentDefaultMax = slotInfo.defaultMaxAppointments;

    return (
      (roomStartTime && roomStartTime !== currentDefaultStart) ||
      (roomEndTime && roomEndTime !== currentDefaultEnd) ||
      (roomMaxAppointments && roomMaxAppointments !== currentDefaultMax)
    );
  }, [room, slotInfo]);

  const handleUpdate = (field: string, value: any) => {
    updateRoomConfig(deptId, slotId, roomIndex, {
      [field]: value,
    });
  };

  const handleRemove = () => {
    removeRoomFromShift(deptId, slotId, roomIndex);
    setIsOpen(false);
  };

  // ✅ Reset về giờ mặc định từ shiftDefaults
  const handleResetToDefault = () => {
    if (slotInfo) {
      handleUpdate("customStartTime", slotInfo.defaultStartTime);
      handleUpdate("customEndTime", slotInfo.defaultEndTime);
      handleUpdate("appointmentCount", slotInfo.defaultMaxAppointments);
    }
  };

  // ✅ Lấy giờ hiện tại của room
  const getCurrentTime = () => {
    return {
      startTime:
        room.customStartTime ||
        room.startTime ||
        slotInfo?.defaultStartTime ||
        "07:30",
      endTime:
        room.customEndTime ||
        room.endTime ||
        slotInfo?.defaultEndTime ||
        "11:00",
      maxAppointments:
        room.appointmentCount ||
        room.maxAppointments ||
        slotInfo?.defaultMaxAppointments ||
        10,
    };
  };

  const currentTime = getCurrentTime();

  // ✅ Filtered doctors dựa trên specialty đã chọn
  const filteredDoctors = useMemo(() => {
    if (!room.selectedSpecialty || !getDoctorsBySpecialty) {
      return availableDoctors;
    }
    return getDoctorsBySpecialty(room.selectedSpecialty);
  }, [room.selectedSpecialty, availableDoctors, getDoctorsBySpecialty]);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`w-full h-auto p-2 text-xs justify-start relative ${
              hasChanges ? "ring-2 ring-blue-400" : ""
            } ${isCustomTime ? "border-orange-300 bg-orange-50" : ""}`}
          >
            <div className="flex flex-col items-start gap-1 w-full">
              {/* Room info */}
              <div className="flex items-center gap-1 w-full">
                <div
                  className={`w-2 h-2 rounded-full ${getRoomStyle(
                    room.classification
                  )}`}
                />
                <span className="font-medium truncate">
                  {room.code || room.name}
                </span>
                {hasChanges && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto" />
                )}
                {isCustomTime && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-1" />
                )}
              </div>

              {/* Quick info */}
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                {(room.selectedDoctor || room.doctor) && (
                  <div className="flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[60px]">
                      {room.selectedDoctor || room.doctor}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" />
                  <span>{currentTime.maxAppointments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span
                    className={
                      isCustomTime ? "text-orange-600 font-medium" : ""
                    }
                  >
                    {currentTime.startTime}-{currentTime.endTime}
                  </span>
                </div>
              </div>

              {/* Specialty */}
              {(room.selectedSpecialty || room.specialty) && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4 max-w-full"
                >
                  <span className="truncate">
                    {room.selectedSpecialty || room.specialty}
                  </span>
                </Badge>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <h4 className="font-medium">Cấu hình phòng</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={handleRemove}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* ✅ Thông tin ca khám và giờ mặc định */}
            {slotInfo && (
              <div className="text-xs bg-blue-50 p-3 rounded-lg border-l-2 border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-blue-800">
                    {slotInfo.periodName} - {slotInfo.workSession}
                  </div>
                  {isCustomTime && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs text-orange-600 hover:text-orange-800"
                      onClick={handleResetToDefault}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
                <div className="text-blue-600 space-y-1">
                  <div>
                    Giờ ca khám: {slotInfo.defaultStartTime} -{" "}
                    {slotInfo.defaultEndTime}({slotInfo.defaultMaxAppointments}{" "}
                    lượt)
                  </div>
                  {/* ✅ CHỈ hiển thị phần custom khi phòng có giờ khác */}
                  {isCustomTime && (
                    <div className="text-orange-600 font-medium">
                      Giờ phòng này: {currentTime.startTime} -{" "}
                      {currentTime.endTime}({currentTime.maxAppointments} lượt)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Room Name (readonly) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Phòng</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${getRoomStyle(
                    room.classification
                  )}`}
                />
                <span className="font-medium">{room.code}</span>
                <span className="text-gray-500">- {room.name}</span>
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Bác sĩ</Label>
              <Select
                value={room.selectedDoctor || room.doctor || "none"}
                onValueChange={(value) =>
                  handleUpdate("selectedDoctor", value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {availableDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Chuyên khoa</Label>
              <Select
                value={room.selectedSpecialty || room.specialty || "none"}
                onValueChange={(value) =>
                  handleUpdate(
                    "selectedSpecialty",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Chọn chuyên khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {availableSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Time Configuration - Cho phép thay đổi riêng */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  Cấu hình thời gian riêng
                  {isCustomTime && (
                    <span className="text-orange-500 ml-1">*</span>
                  )}
                </Label>
                {isCustomTime && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-orange-600 hover:text-orange-800 p-1"
                    onClick={handleResetToDefault}
                  >
                    Về mặc định
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Giờ bắt đầu
                    {isCustomTime && (
                      <span className="text-orange-500"> *</span>
                    )}
                  </Label>
                  <Input
                    type="time"
                    value={currentTime.startTime}
                    onChange={(e) =>
                      handleUpdate("customStartTime", e.target.value)
                    }
                    className={`h-8 text-xs ${
                      isCustomTime ? "border-orange-300" : ""
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Giờ kết thúc
                    {isCustomTime && (
                      <span className="text-orange-500"> *</span>
                    )}
                  </Label>
                  <Input
                    type="time"
                    value={currentTime.endTime}
                    onChange={(e) =>
                      handleUpdate("customEndTime", e.target.value)
                    }
                    className={`h-8 text-xs ${
                      isCustomTime ? "border-orange-300" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Max Appointments - Cho phép thay đổi riêng */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Số lượt khám tối đa
                {isCustomTime && <span className="text-orange-500"> *</span>}
              </Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={currentTime.maxAppointments}
                onChange={(e) =>
                  handleUpdate(
                    "appointmentCount",
                    parseInt(e.target.value) || 10
                  )
                }
                className={`h-8 ${isCustomTime ? "border-orange-300" : ""}`}
              />
              {slotInfo && (
                <div className="text-xs text-gray-500">
                  Mặc định cho ca này: {slotInfo.defaultMaxAppointments} lượt
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Ghi chú</Label>
              <Input
                value={room.notes || ""}
                onChange={(e) => handleUpdate("notes", e.target.value)}
                placeholder="Thêm ghi chú..."
                className="h-8 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8"
                onClick={() => setIsOpen(false)}
              >
                Đóng
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8"
                onClick={handleRemove}
              >
                <X className="w-3 h-3 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
