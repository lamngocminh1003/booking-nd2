import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  Users,
  Stethoscope,
  Calendar,
  MapPin,
  Settings,
  Edit3,
  Save,
  X,
  Eye,
} from "lucide-react";
import { ClinicScheduleEditButton } from "./ClinicScheduleEditPopover";

interface ClinicScheduleDetailPopoverProps {
  schedule: any;
  trigger: React.ReactNode;
  scheduleIndex?: number;
  onEditClick?: (schedule: any, scheduleIndex: number) => void;
  // ✅ Thêm props cho chức năng edit
  onScheduleUpdated?: (scheduleIndex: number, updates: any) => void;
  onScheduleRemoved?: (scheduleIndex: number) => void;
  getConflictInfo?: (
    room: any,
    roomId: string
  ) => {
    roomDoctors: any[];
    hasDoctorConflict: boolean;
    hasRoomConflict: boolean;
    getDisabledReason: () => string;
  };
  timeSlots?: any[];
  availableSpecialties?: string[];
  roomClassifications?: any;
  shiftDefaults?: any;
  departmentData?: {
    examTypes: any[];
    specialties: string[];
    department?: any;
  };
  allRooms?: any[];
  usedRooms?: Set<string>;
  allCellClinicSchedules?: any[];
  cellClinicSchedules?: any[];
  // ✅ Thêm prop để control edit mode
  allowEdit?: boolean;
  selectedZone?: string; // ✅ Thêm prop selectedZone
  selectedWeek?: string; // ✅ Thêm prop selectedWeek
}

export const ClinicScheduleDetailPopover: React.FC<
  ClinicScheduleDetailPopoverProps
> = ({
  schedule,
  selectedWeek,
  selectedZone,
  trigger,
  scheduleIndex = 0,
  onEditClick,
  onScheduleUpdated,
  onScheduleRemoved,
  getConflictInfo,
  timeSlots = [],
  availableSpecialties = [],
  roomClassifications = {},
  shiftDefaults = {},
  departmentData,
  usedRooms,
  allCellClinicSchedules = [],
  cellClinicSchedules = [],
  allowEdit = true,
}) => {
  // ✅ State để control edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);

  // ✅ Handlers cho edit functionality
  const handleOpenEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCloseEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleScheduleUpdated = useCallback(
    (updatedScheduleIndex: number, updates: any) => {
      try {
        // Call parent handler
        if (onScheduleUpdated) {
          onScheduleUpdated(updatedScheduleIndex, updates);
        }

        // Close edit mode after successful update
        setIsEditMode(false);

        // Show success feedback
      } catch (error) {
        console.error("❌ Error updating schedule:", error);
      }
    },
    [onScheduleUpdated]
  );

  const handleScheduleRemoved = useCallback(
    (removedScheduleIndex: number) => {
      try {
        // Call parent handler
        if (onScheduleRemoved) {
          onScheduleRemoved(removedScheduleIndex);
        }

        // Close popover after removal
        setIsDetailPopoverOpen(false);
        setIsEditMode(false);
      } catch (error) {
        console.error("❌ Error removing schedule:", error);
      }
    },
    [onScheduleRemoved]
  );

  // ✅ Fallback cho legacy onEditClick
  const handleLegacyEditClick = useCallback(() => {
    if (onEditClick) {
      onEditClick(schedule, scheduleIndex);
    } else {
      // Fallback to inline edit mode
      handleOpenEditMode();
    }
  }, [onEditClick, schedule, scheduleIndex, handleOpenEditMode]);
  const isFutureDate = useCallback((dateString: string): boolean => {
    if (!dateString) return false;

    const scheduleDate = new Date(dateString);
    const today = new Date();

    // Reset time để chỉ so sánh ngày
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);

    return scheduleDate > today;
  }, []);

  // ✅ Hoặc có thể kiểm tra chi tiết hơn
  const canEditSchedule = useCallback((schedule: any): boolean => {
    // Kiểm tra ngày
    if (!schedule.dateInWeek) return false;

    const scheduleDate = new Date(schedule.dateInWeek);
    const today = new Date();

    // Reset time để chỉ so sánh ngày
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);

    // Chỉ cho phép edit nếu là ngày tương lai
    const isFuture = scheduleDate > today;

    return isFuture;
  }, []);
  return (
    <Popover open={isDetailPopoverOpen} onOpenChange={setIsDetailPopoverOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {isEditMode ? "Chỉnh sửa lịch " : "Chi tiết lịch khám"}
                </h4>
                <p className="text-xs text-gray-500">
                  {schedule.roomName} - {schedule.examinationName}
                </p>
              </div>
            </div>

            {/* ✅ Enhanced Action Buttons */}
            <div className="flex items-center gap-2">
              {/* ✅ Thêm điều kiện kiểm tra ngày */}
              {allowEdit && !isEditMode && canEditSchedule(schedule) && (
                <Badge variant="secondary" className="text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500"
                    onClick={handleLegacyEditClick}
                    title="Chỉnh sửa lịch khám"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Chỉnh sửa
                  </Button>
                </Badge>
              )}

              {/* ✅ Thêm thông báo khi không thể chỉnh sửa */}
              {allowEdit && !isEditMode && !canEditSchedule(schedule) && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs cursor-not-allowed opacity-60"
                    disabled
                    title="Không thể chỉnh sửa lịch khám trong quá khứ hoặc hiện tại"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Chỉ xem
                  </Button>
                </Badge>
              )}

              {isEditMode && (
                <Badge variant="secondary" className="text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500"
                    onClick={handleCloseEditMode}
                    title="Xem chi tiết lịch khám"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Xem
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          {/* ✅ Content - Conditional Rendering */}
          {isEditMode ? (
            /* Edit Mode - Embed ClinicScheduleEditPopover Content */
            <div className="flex-1 overflow-y-auto">
              <ClinicScheduleEditButton
                setIsEditMode={setIsEditMode}
                selectedZone={selectedZone}
                selectedWeek={selectedWeek}
                schedule={schedule}
                scheduleIndex={scheduleIndex}
                timeSlots={timeSlots}
                availableSpecialties={availableSpecialties}
                roomClassifications={roomClassifications}
                shiftDefaults={shiftDefaults}
                onScheduleUpdated={handleScheduleUpdated}
                onScheduleRemoved={handleScheduleRemoved}
                departmentData={departmentData}
                usedRooms={usedRooms}
                getConflictInfo={getConflictInfo}
                allCellClinicSchedules={allCellClinicSchedules}
                cellClinicSchedules={cellClinicSchedules}
                isInlineMode={true} // ✅ Special prop để render inline
                onCancel={handleCloseEditMode}
                onRoomSwapped={(scheduleIndex, oldRoomId, newRoomId) => {
                  // Handle room swap logic ở parent component
                }}
              />
            </div>
          ) : (
            /* View Mode - Original Detail Content */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Phòng khám
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {schedule.roomName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Ca khám
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {schedule.examinationName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Bác sĩ
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Stethoscope className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {schedule.doctorName}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Chuyên khoa
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4 h-4 bg-purple-500 rounded text-white flex items-center justify-center text-[8px]">
                        🔬
                      </div>
                      <span className="text-sm font-medium">
                        {schedule.specialtyName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Thông tin thời gian
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Giờ bắt đầu:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {schedule.timeStart?.slice(0, 5) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Giờ kết thúc:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {schedule.timeEnd?.slice(0, 5) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày:</span>
                    <span className="ml-2 font-medium">
                      {schedule.dateInWeek?.slice(0, 10)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Thứ:</span>
                    <span className="ml-2 font-medium">
                      {schedule.dayInWeek}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tuần:</span>
                    <span className="ml-2 font-medium">
                      Tuần {schedule.week}/{schedule.year}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Khoảng cách:</span>
                    <span className="ml-2 font-medium">
                      {schedule.spaceMinutes} phút
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin lượt khám */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Thông tin lượt khám
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-600">Tổng lượt:</span>
                    <span className="ml-2 font-medium">{schedule.total}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Giữ chỗ:</span>
                    <span className="ml-2 font-medium text-amber-600">
                      {schedule.holdSlot || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Khả dụng:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {(schedule.total || 0) - (schedule.holdSlot || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Trạng thái:</span>
                    <Badge
                      variant={schedule.status ? "default" : "destructive"}
                      className="ml-2 text-xs"
                    >
                      {schedule.status ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Loại khám */}
              {schedule.examTypeName && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Loại khám
                  </h5>
                  <div className="text-sm">
                    <Badge variant="outline" className="bg-white">
                      {schedule.examTypeName}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Khung giờ khám */}
              {schedule.appointmentSlots &&
                schedule.appointmentSlots.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Khung giờ khám ({schedule.appointmentSlots.length} slot)
                    </h5>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {schedule.appointmentSlots.map((slot, idx) => (
                        <div
                          key={slot.id || idx}
                          className={`p-2 rounded border text-xs ${
                            slot.enable
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {slot.startSlot?.slice(0, 5)} -
                              {slot.endSlot?.slice(0, 5)}
                            </span>
                            <Badge
                              variant={slot.enable ? "default" : "secondary"}
                              className="text-[10px] px-1"
                            >
                              {slot.totalSlot}
                            </Badge>
                          </div>
                          <div className="text-[10px] mt-1 text-gray-500">
                            {slot.enable ? "Hoạt động" : "Tạm dừng"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Thông tin khoa phòng */}
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-purple-600">Khoa:</span>
                    <span className="ml-2 font-medium">
                      {schedule.departmentHospitalName}
                    </span>
                  </div>
                  {schedule.roomClassification && (
                    <div>
                      <span className="text-purple-600">Phân loại:</span>
                      <span className="ml-2 font-medium">
                        {schedule.roomClassification}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t bg-gray-50/50 p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Ngày tạo: {schedule.dateInWeek?.slice(0, 10)}</span>
              {isEditMode && (
                <span className="text-orange-600 font-medium">
                  🔧 Đang chỉnh sửa...
                </span>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
