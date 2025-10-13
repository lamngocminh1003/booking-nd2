import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  addClinicSchedules,
  fetchClinicSchedules,
} from "@/store/slices/clinicScheduleSlice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Copy, CalendarCog } from "lucide-react";

// Cập nhật CloneOptions interface và prop types

// ✅ Cập nhật CloneOptions interface
interface CloneOptions {
  includeRooms: boolean;
  includeSpecialties: boolean;
  includeDoctors: boolean;
  includeTimeSettings: boolean;
  overwriteExisting: boolean;
  // ✅ Thêm properties mới
  transformedSchedules?: any[];
  sourceSchedules?: any[];
  cleanFormatSchedules?: any[];
  selectedZone?: string;
}

// ✅ Cập nhật CloneWeekDialogProps interface
interface CloneWeekDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentWeek: string;
  weeks: Array<any>;
  scheduleData: Record<string, Record<string, any>>;
  onClone: (targetWeeks: string[], options: CloneOptions) => void;
  onWeekCloned?: (
    targetWeeks: string[],
    sourceWeek: string,
    roomCount: number
  ) => void;
  // ✅ Sửa callback để clone từ DB - đảm bảo optional và type đúng
  onCloneFromDB?: (targetWeeks: string[], options: CloneOptions) => void;
  // ✅ Thêm thông tin clinic schedules từ DB
  clinicSchedules?: any[];
  // ✅ Thêm selectedZone
  selectedZone?: string;
}

export const CloneWeekDialog: React.FC<CloneWeekDialogProps> = ({
  isOpen,
  setIsOpen,
  currentWeek,
  weeks,
  scheduleData,
  onClone,
  onWeekCloned,
  onCloneFromDB, // ✅ Sử dụng prop này
  clinicSchedules = [],
  selectedZone,
}) => {
  // ✅ Thêm dispatch
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Thêm state để chọn nguồn dữ liệu
  const [cloneSource, setCloneSource] = useState<"database" | "memory">(
    "database"
  );
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [cloneOptions, setCloneOptions] = useState<CloneOptions>({
    includeRooms: true,
    includeSpecialties: true,
    includeDoctors: true,
    includeTimeSettings: true,
    overwriteExisting: false,
  });

  // ✅ Lọc tuần khả dụng (loại bỏ tuần hiện tại và tuần quá khứ)
  const availableWeeks = weeks.filter((week) => {
    if (!week) return false;
    return week.value !== currentWeek && !week.isPast;
  });

  // ✅ Tính số lượng phòng trong tuần hiện tại
  const getCurrentWeekRoomCount = () => {
    let totalRooms = 0;
    try {
      Object.values(scheduleData || {}).forEach((deptSchedule) => {
        if (deptSchedule && typeof deptSchedule === "object") {
          Object.values(deptSchedule).forEach((slot: any) => {
            if (slot?.rooms && Array.isArray(slot.rooms)) {
              totalRooms += slot.rooms.length;
            }
          });
        }
      });
    } catch (error) {
      console.error("Error calculating current week room count:", error);
    }
    return totalRooms;
  };

  // Thêm function để filter và transform clinic schedules

  // ✅ Function để lọc clinic schedules của tuần hiện tại
  const getCurrentWeekSchedules = () => {
    try {
      if (!clinicSchedules || !Array.isArray(clinicSchedules)) {
        return [];
      }

      // ✅ Parse current week để lấy thông tin
      const [currentYear, currentWeekStr] = currentWeek.split("-W");
      const currentWeekNum = parseInt(currentWeekStr);
      const currentYearNum = parseInt(currentYear);

      // ✅ Filter schedules theo week và year
      const currentWeekSchedules = clinicSchedules.filter((schedule: any) => {
        return (
          schedule.week === currentWeekNum && schedule.year === currentYearNum
        );
      });

      return currentWeekSchedules;
    } catch (error) {
      console.error("Error filtering current week schedules:", error);
      return [];
    }
  };

  // Cập nhật function createTargetWeekSchedules để tạo format mới

  // ✅ Function để tạo schedules mới cho tuần đích với format mới
  const createTargetWeekSchedules = (
    sourceSchedules: any[],
    targetWeek: string
  ) => {
    try {
      if (!sourceSchedules || sourceSchedules.length === 0) {
        console.warn(`⚠️ No source schedules provided for ${targetWeek}`);
        return [];
      }

      // ✅ Parse target week
      const [targetYear, targetWeekStr] = targetWeek.split("-W");
      const targetWeekNum = parseInt(targetWeekStr);
      const targetYearNum = parseInt(targetYear);

      // ✅ Sửa function tính toán ngày bắt đầu tuần theo chuẩn ISO 8601
      const getWeekStartDate = (year: number, week: number) => {
        // Tìm ngày 4 tháng 1 của năm (theo chuẩn ISO 8601)
        const jan4 = new Date(Date.UTC(year, 0, 4)); // Sử dụng UTC để tránh lệch múi giờ

        // Tìm thứ trong tuần của ngày 4/1 (1 = Monday, 7 = Sunday)
        let jan4DayOfWeek = jan4.getUTCDay();
        if (jan4DayOfWeek === 0) jan4DayOfWeek = 7; // Chuyển Sunday từ 0 thành 7

        // Tính toán thứ 2 của tuần 1
        const week1Monday = new Date(
          jan4.getTime() - (jan4DayOfWeek - 1) * 24 * 60 * 60 * 1000
        );

        // Tính toán thứ 2 của tuần mục tiêu
        const targetMonday = new Date(
          week1Monday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
        );

        return targetMonday;
      };

      const targetWeekStartDate = getWeekStartDate(
        targetYearNum,
        targetWeekNum
      );

      // ✅ Mapping ngày trong tuần
      const dayMapping: Record<string, number> = {
        Monday: 0,
        Tuesday: 1,
        Wednesday: 2,
        Thursday: 3,
        Friday: 4,
        Saturday: 5,
        Sunday: 6,
      };

      // ✅ Transform từng schedule thành format mới
      const targetSchedules: any[] = [];

      sourceSchedules.forEach((sourceSchedule: any, index) => {
        const dayOffset = dayMapping[sourceSchedule.dayInWeek] || 0;

        // ✅ Tạo ngày mục tiêu bằng cách cộng offset
        const targetDate = new Date(
          targetWeekStartDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
        );

        // ✅ Tạo schedule mới theo format yêu cầu
        const newSchedule = {
          dateInWeek: targetDate.toISOString(),
          total: sourceSchedule.total,
          spaceMinutes: sourceSchedule.spaceMinutes,
          specialtyId: sourceSchedule.specialtyId,
          roomId: sourceSchedule.roomId,
          examinationId: sourceSchedule.examinationId,
          doctorId: sourceSchedule.doctorId,
          departmentHospitalId: sourceSchedule.departmentHospitalId,
          examTypeId: sourceSchedule.examTypeId,
          startSlot: sourceSchedule.timeStart,
          endSlot: sourceSchedule.timeEnd,
          holdSlot: sourceSchedule.holdSlot || 0,

          // ✅ Metadata
          isCloned: true,
          clonedFrom: `week-${currentWeek}`,
          clonedAt: Date.now(),
          originalScheduleId: sourceSchedule.id,
          week: targetWeekNum,
          year: targetYearNum,
          dayInWeek: sourceSchedule.dayInWeek,
          status: sourceSchedule.status,
        };

        targetSchedules.push(newSchedule);
      });

      // ✅ Verification cuối cùng
      const dateVerification = targetSchedules.map((schedule) => {
        const date = new Date(schedule.dateInWeek);
        const dayName = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][date.getUTCDay()];
        return {
          dateInWeek: schedule.dateInWeek,
          expectedDay: schedule.dayInWeek,
          actualDay: dayName,
          localDate: date.toLocaleDateString("vi-VN"),
          isCorrect: dayName === schedule.dayInWeek,
        };
      });

      // ✅ Log clean format
      const cleanFormatSchedules = targetSchedules.map((schedule) => ({
        dateInWeek: schedule.dateInWeek,
        total: schedule.total,
        spaceMinutes: schedule.spaceMinutes,
        specialtyId: schedule.specialtyId,
        roomId: schedule.roomId,
        examinationId: schedule.examinationId,
        doctorId: schedule.doctorId,
        departmentHospitalId: schedule.departmentHospitalId,
        examTypeId: schedule.examTypeId,
        startSlot: schedule.startSlot,
        endSlot: schedule.endSlot,
        holdSlot: schedule.holdSlot,
      }));

      return targetSchedules;
    } catch (error) {
      console.error(
        `❌ Error creating target week schedules for ${targetWeek}:`,
        error
      );
      return [];
    }
  };

  // ✅ Thêm function để log khi chọn tuần đích
  const handleWeekToggle = (weekValue: string, checked: boolean) => {
    if (checked) {
      // ✅ Khi chọn tuần mới, tạo preview transformation
      const currentWeekSchedules = getCurrentWeekSchedules();

      if (currentWeekSchedules.length > 0 && cloneSource === "database") {
        const previewSchedules = createTargetWeekSchedules(
          currentWeekSchedules,
          weekValue
        );

        // ✅ Log preview với format mới
        const previewCleanFormat = previewSchedules.map((schedule) => ({
          dateInWeek: schedule.dateInWeek,
          total: schedule.total,
          spaceMinutes: schedule.spaceMinutes,
          specialtyId: schedule.specialtyId,
          roomId: schedule.roomId,
          examinationId: schedule.examinationId,
          doctorId: schedule.doctorId,
          departmentHospitalId: schedule.departmentHospitalId,
          examTypeId: schedule.examTypeId,
          startSlot: schedule.startSlot,
          endSlot: schedule.endSlot,
          holdSlot: schedule.holdSlot,
        }));
      }

      setSelectedWeeks((prev) => {
        const newSelection = [...prev, weekValue];
        return newSelection;
      });
    } else {
      setSelectedWeeks((prev) => {
        const newSelection = prev.filter((w) => w !== weekValue);
        return newSelection;
      });
    }
  };

  // ✅ Cập nhật handleClone để sử dụng Redux actions với parameters
  const handleClone = async () => {
    if (selectedWeeks.length === 0) {
      console.warn("⚠️ No weeks selected for cloning");
      return;
    }

    try {
      // ✅ Kiểm tra điều kiện chính xác
      if (cloneSource === "database") {
        const currentWeekSchedules = getCurrentWeekSchedules();

        if (currentWeekSchedules.length === 0) {
          console.error("❌ No schedules found in database for current week");
          return;
        }

        // ✅ Tạo schedules cho từng tuần đích
        const allTargetSchedules: any[] = [];
        const allCleanFormatSchedules: any[] = [];

        selectedWeeks.forEach((targetWeek, weekIndex) => {
          const targetSchedules = createTargetWeekSchedules(
            currentWeekSchedules,
            targetWeek
          );
          allTargetSchedules.push(...targetSchedules);

          // ✅ Tạo clean format cho từng tuần
          const cleanFormat = targetSchedules.map((schedule) => ({
            dateInWeek: schedule.dateInWeek,
            total: schedule.total,
            spaceMinutes: schedule.spaceMinutes,
            specialtyId: schedule.specialtyId,
            roomId: schedule.roomId,
            examinationId: schedule.examinationId,
            doctorId: schedule.doctorId,
            departmentHospitalId: schedule.departmentHospitalId,
            examTypeId: schedule.examTypeId,
            startSlot: schedule.startSlot,
            endSlot: schedule.endSlot,
            holdSlot: schedule.holdSlot,
          }));

          allCleanFormatSchedules.push(...cleanFormat);
        });

        await dispatch(addClinicSchedules(allCleanFormatSchedules)).unwrap();

        // ✅ Parse current week để lấy parameters
        const [currentYear, currentWeekStr] = currentWeek.split("-W");
        const currentWeekNum = parseInt(currentWeekStr);
        const currentYearNum = parseInt(currentYear);

        await dispatch(
          fetchClinicSchedules({
            Week: currentWeekNum,
            Year: currentYearNum,
            ...(selectedZone !== "all" && { ZoneId: parseInt(selectedZone) }),
          })
        );

        // ✅ Gọi callback nếu có (để update UI hoặc thông báo)
        if (onCloneFromDB) {
          const optionsWithData = {
            ...cloneOptions,
            transformedSchedules: allTargetSchedules,
            sourceSchedules: currentWeekSchedules,
            cleanFormatSchedules: allCleanFormatSchedules,
            selectedZone,
          };

          onCloneFromDB(selectedWeeks, optionsWithData);
        }

        // ✅ Gọi onWeekCloned callback nếu có
        if (onWeekCloned) {
          const roomCount = dbRoomCount;
          onWeekCloned(selectedWeeks, currentWeek, roomCount);
        }

        setIsOpen(false);
        setSelectedWeeks([]);
      } else {
        // ✅ Xử lý clone từ memory (giữ nguyên logic cũ)
        onClone(selectedWeeks, cloneOptions);

        if (onWeekCloned) {
          const roomCount = currentWeekRoomCount;
          onWeekCloned(selectedWeeks, currentWeek, roomCount);
        }

        setIsOpen(false);
        setSelectedWeeks([]);
      }
    } catch (error) {
      console.error("❌ Error during clone operation:", error);
    }
  };

  // Thêm các function bị thiếu

  // ✅ Function để tính toán DB counts
  const getDBScheduleCount = () => {
    try {
      const currentWeekSchedules = getCurrentWeekSchedules();
      return currentWeekSchedules.length;
    } catch (error) {
      console.error("❌ Error calculating DB schedule count:", error);
      return 0;
    }
  };

  const getDBRoomCount = () => {
    try {
      const currentWeekSchedules = getCurrentWeekSchedules();
      const uniqueRooms = new Set();

      currentWeekSchedules.forEach((schedule: any) => {
        if (schedule.roomId && schedule.roomName) {
          uniqueRooms.add(schedule.roomId);
        }
      });

      return uniqueRooms.size;
    } catch (error) {
      console.error("❌ Error calculating DB room count:", error);
      return 0;
    }
  };

  const getDBSchedulesByDay = () => {
    try {
      const currentWeekSchedules = getCurrentWeekSchedules();
      const schedulesByDay: Record<string, number> = {};

      currentWeekSchedules.forEach((schedule: any) => {
        const day = schedule.dayInWeek || "Unknown";
        schedulesByDay[day] = (schedulesByDay[day] || 0) + 1;
      });

      return schedulesByDay;
    } catch (error) {
      console.error("❌ Error calculating DB schedules by day:", error);
      return {};
    }
  };

  // ✅ Function để handle select all/none
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const allWeekValues = availableWeeks.map((week) => week.value);
      setSelectedWeeks(allWeekValues);
    } else {
      setSelectedWeeks([]);
    }
  };

  // ✅ Đặt các function counts sau khi đã định nghĩa
  const currentWeekRoomCount = getCurrentWeekRoomCount();
  const dbRoomCount = getDBRoomCount();
  const dbScheduleCount = getDBScheduleCount();
  const dbSchedulesByDay = getDBSchedulesByDay();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCog className="w-5 h-5" />
            Nhân bản lịch khám theo tuần
          </DialogTitle>
          <DialogDescription>
            Sao chép lịch khám từ tuần hiện tại sang các tuần khác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ Chọn nguồn dữ liệu */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <Label className="text-sm font-medium mb-3 block">
              Chọn nguồn dữ liệu để nhân bản
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="source-database"
                  checked={cloneSource === "database"}
                  onCheckedChange={(checked) =>
                    checked && setCloneSource("database")
                  }
                />
                <label
                  htmlFor="source-database"
                  className="text-sm cursor-pointer flex-1"
                >
                  <div className="font-medium">Từ cơ sở dữ liệu</div>
                  <div className="text-xs text-gray-600">
                    {dbScheduleCount} lịch khám có sẵn
                  </div>
                  {/* ✅ Hiển thị chi tiết theo ngày */}
                  {dbScheduleCount > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {Object.entries(dbSchedulesByDay).map(([day, count]) => (
                        <span key={day} className="mr-2">
                          {day}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Tuần nguồn */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Tuần nguồn</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">
                {weeks.find((w) => w.value === currentWeek)?.label ||
                  "Tuần hiện tại"}
              </span>
              <span className="text-gray-600 ml-2">
                (
                {cloneSource === "database"
                  ? `${dbScheduleCount} lịch khám`
                  : `${currentWeekRoomCount} phòng`}
                )
              </span>
            </div>
            {cloneSource === "database" && dbScheduleCount === 0 && (
              <div className="mt-2 text-xs text-orange-600">
                ⚠️ Tuần này chưa có dữ liệu trong cơ sở dữ liệu
              </div>
            )}
          </div>

          {/* Chọn tuần đích */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">
                Chọn tuần đích ({selectedWeeks.length} đã chọn)
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  disabled={selectedWeeks.length === availableWeeks.length}
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  disabled={selectedWeeks.length === 0}
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>

            {availableWeeks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Không có tuần nào khả dụng để nhân bản</p>
                <p className="text-xs mt-1">
                  (Chỉ có thể nhân bản sang tuần tương lai)
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                {availableWeeks.map((week) => {
                  const isSelected = selectedWeeks.includes(week.value);
                  const isCurrent = week.isCurrent;

                  return (
                    <div
                      key={week.value}
                      className={`flex items-center space-x-3 p-2 rounded ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        id={`week-${week.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleWeekToggle(week.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`week-${week.value}`}
                        className={`flex-1 text-sm cursor-pointer ${
                          isCurrent
                            ? "text-blue-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {week.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-blue-500">
                            (Hiện tại)
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tùy chọn nhân bản - cập nhật mô tả */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Tùy chọn nhân bản
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-specialties"
                  checked={cloneOptions.includeSpecialties}
                  onCheckedChange={(checked) =>
                    setCloneOptions((prev) => ({
                      ...prev,
                      includeSpecialties: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="include-specialties"
                  className="text-sm cursor-pointer"
                >
                  Sao chép chuyên khoa đã chọn
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-doctors"
                  checked={cloneOptions.includeDoctors}
                  onCheckedChange={(checked) =>
                    setCloneOptions((prev) => ({
                      ...prev,
                      includeDoctors: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="include-doctors"
                  className="text-sm cursor-pointer"
                >
                  Sao chép bác sĩ đã phân công
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-time-settings"
                  checked={cloneOptions.includeTimeSettings}
                  onCheckedChange={(checked) =>
                    setCloneOptions((prev) => ({
                      ...prev,
                      includeTimeSettings: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="include-time-settings"
                  className="text-sm cursor-pointer"
                >
                  Sao chép cài đặt thời gian và số lượng khám
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite-existing"
                  checked={cloneOptions.overwriteExisting}
                  onCheckedChange={(checked) =>
                    setCloneOptions((prev) => ({
                      ...prev,
                      overwriteExisting: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="overwrite-existing"
                  className="text-sm cursor-pointer"
                >
                  Ghi đè lịch đã có (nếu không chọn sẽ bổ sung thêm)
                </label>
              </div>
            </div>
          </div>

          {/* Xem trước kết quả - cập nhật theo nguồn */}
          {selectedWeeks.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Copy className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Xem trước kết quả
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">Sẽ nhân bản từ:</span>
                  <span className="font-medium ml-1 text-blue-600">
                    {cloneSource === "database" ? "Cơ sở dữ liệu" : "Bộ nhớ"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Số lịch khám:</span>
                  <span className="font-medium ml-1">
                    {cloneSource === "database"
                      ? dbScheduleCount
                      : currentWeekRoomCount}
                  </span>
                  <span className="text-gray-600 ml-1">sang</span>
                  <span className="font-medium ml-1 text-blue-600">
                    {selectedWeeks.length} tuần
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Tổng cộng:{" "}
                  <span className="font-medium">
                    {(cloneSource === "database"
                      ? dbScheduleCount
                      : currentWeekRoomCount) * selectedWeeks.length}
                  </span>{" "}
                  lượt sẽ được tạo
                </div>
              </div>
            </div>
          )}

          {/* Warning khi chưa có dữ liệu */}
          {((cloneSource === "memory" && currentWeekRoomCount === 0) ||
            (cloneSource === "database" && dbRoomCount === 0)) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Chưa có dữ liệu để nhân bản
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                {cloneSource === "database"
                  ? "Tuần hiện tại chưa có dữ liệu trong cơ sở dữ liệu."
                  : "Tuần hiện tại chưa có phòng nào được cấu hình trong giao diện."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleClone}
            disabled={
              selectedWeeks.length === 0 ||
              (cloneSource === "database"
                ? dbScheduleCount === 0
                : currentWeekRoomCount === 0)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Nhân bản ({selectedWeeks.length} tuần)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Export type để sử dụng ở component khác
export type { CloneOptions, CloneWeekDialogProps };
