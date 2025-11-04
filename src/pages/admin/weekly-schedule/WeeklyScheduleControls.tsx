import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

// Import các component đã tách
import { CloneWeekDialog, type CloneOptions } from "./dialogs/CloneWeekDialog";
import { WeekNavigationControls } from "./controls/WeekNavigationControls";
import { ZoneSelector, type ZoneOption } from "./controls/ZoneSelector";
import { DepartmentFilter } from "./controls/DepartmentFilter";
import { SearchControls } from "./controls/SearchControls";
import { ActionButtons } from "./controls/ActionButtons";

interface WeeklyScheduleControlsProps {
  selectedZone: string;
  setSelectedZone: (value: string) => void;
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: "week" | "day";
  setViewMode: (value: "week" | "day") => void;
  selectedDay: string;
  setSelectedDay: (value: string) => void;
  zoneOptions: ZoneOption[];
  weeks: Array<any>;
  departments: Array<{ id: string; name: string }>;
  timeSlots: Array<any>;
  shiftDefaults: any;
  filteredRoomsByZone: Array<any>;
  scheduleData: Record<string, Record<string, any>>;
  allRooms: Array<any>;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  triggerFileUpload: () => void;
  handleDownloadExcel: () => void;
  setShowShiftConfigDialog: (value: boolean) => void;
  setShowRoomClassificationDialog: (value: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleSaveAll: () => void;
  undoStack: any[];
  redoStack: any[];
  scheduleChanges: Record<string, any>;
  onCloneWeek: (targetWeeks: string[], options: CloneOptions) => void;
  onWeekCloned?: (
    targetWeeks: string[],
    sourceWeek: string,
    roomCount: number
  ) => void;
  onCloneFromDB?: (targetWeeks: string[], options: CloneOptions) => void;
  clinicSchedules?: any[];
}

export const WeeklyScheduleControls: React.FC<WeeklyScheduleControlsProps> = ({
  selectedZone,
  setSelectedZone,
  selectedWeek,
  setSelectedWeek,
  selectedDepartment,
  setSelectedDepartment,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  selectedDay,
  setSelectedDay,
  zoneOptions,
  weeks,
  departments,
  timeSlots,
  shiftDefaults,
  scheduleData,
  allRooms,
  handlePreviousWeek,
  handleNextWeek,
  triggerFileUpload,
  handleDownloadExcel,
  setShowShiftConfigDialog,
  setShowRoomClassificationDialog,
  handleUndo,
  handleRedo,
  handleSaveAll,
  undoStack,
  redoStack,
  scheduleChanges,
  onCloneWeek,
  onWeekCloned,
  onCloneFromDB,
  clinicSchedules = [],
}) => {
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  // ✅ Tính số phòng chính xác cho zone hiện tại
  const getCurrentZoneRoomCount = () => {
    try {
      if (selectedZone === "all") {
        return allRooms?.length || 0;
      }
      return (
        allRooms?.filter((room) => room.zoneId?.toString() === selectedZone)
          .length || 0
      );
    } catch (error) {
      console.error("Error calculating zone room count:", error);
      return 0;
    }
  };

  // ✅ Cải thiện hàm tính số phòng đã sử dụng
  const getTotalUsedRooms = () => {
    if (!scheduleData || typeof scheduleData !== "object") {
      return 0;
    }

    const usedRoomIds = new Set<string>();

    try {
      Object.values(scheduleData).forEach((deptSchedule) => {
        if (deptSchedule && typeof deptSchedule === "object") {
          Object.values(deptSchedule).forEach((slot: any) => {
            if (slot?.rooms && Array.isArray(slot.rooms)) {
              slot.rooms.forEach((room: any) => {
                const roomId =
                  room.id || room.roomId || room.name || String(room);

                if (selectedZone === "all") {
                  usedRoomIds.add(roomId);
                } else {
                  const roomData = allRooms?.find(
                    (r) =>
                      r.id === roomId ||
                      r.roomId === roomId ||
                      r.name === roomId
                  );
                  if (roomData?.zoneId?.toString() === selectedZone) {
                    usedRoomIds.add(roomId);
                  }
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Error calculating used rooms:", error);
      return 0;
    }

    return usedRoomIds.size;
  };

  // ✅ Sửa lỗi getWeekDays function
  const getWeekDays = () => {
    if (!Array.isArray(timeSlots)) {
      return [];
    }

    try {
      const enabledTimeSlots = timeSlots.filter(
        (slot) => slot?.enabled !== false
      );

      const uniqueDays = enabledTimeSlots.reduce((acc, slot) => {
        if (!slot?.fullDate) return acc;

        const existingDay = acc.find((d) => d.fullDate === slot.fullDate);
        if (!existingDay) {
          const shiftsInDay = enabledTimeSlots.filter(
            (s) => s?.fullDate === slot.fullDate
          );

          acc.push({
            value: slot.fullDate,
            label: `${slot.day || "N/A"} (${slot.date || "N/A"})`,
            dayName: slot.day || "N/A",
            date: slot.date || "N/A",
            fullDate: slot.fullDate,
            shiftsCount: shiftsInDay.length,
            shifts: shiftsInDay.map((s) => {
              const shiftConfig = shiftDefaults?.[s.workSession];
              const originalStartTime = s.startTime?.slice(0, 5) || "07:30";
              const originalEndTime = s.endTime?.slice(0, 5) || "11:00";
              const currentStartTime =
                shiftConfig?.startTime || originalStartTime;
              const currentEndTime = shiftConfig?.endTime || originalEndTime;

              const hasTimeChange =
                currentStartTime !== originalStartTime ||
                currentEndTime !== originalEndTime;

              return {
                period: s.period || s.workSession || "N/A",
                name: s.periodName || s.name || "Ca làm việc",
                time: `${currentStartTime}-${currentEndTime}`,
                originalTime: `${originalStartTime}-${originalEndTime}`,
                enabled: s.enabled ?? true,
                isCustom: hasTimeChange,
              };
            }),
          });
        }
        return acc;
      }, [] as any[]);

      return uniqueDays;
    } catch (error) {
      console.error("Error calculating week days:", error);
      return [];
    }
  };

  const currentZoneRoomCount = getCurrentZoneRoomCount();
  const weekDays = getWeekDays();

  return (
    <Card className="shadow-md">
      <CardContent className="pt-4 md:pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            {/* Zone Selection */}
            <ZoneSelector
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              zoneOptions={zoneOptions}
              allRooms={allRooms}
            />

            {/* Week Navigation */}
            <WeekNavigationControls
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              weeks={weeks}
              handlePreviousWeek={handlePreviousWeek}
              handleNextWeek={handleNextWeek}
            />

            {/* Search & View Mode */}
            <SearchControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Department Filter */}
            <DepartmentFilter
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              departments={departments}
            />

            {/* Day Filter */}
            {viewMode === "day" && weekDays.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Chọn ngày:
                </Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-80 h-9">
                    <SelectValue placeholder="Chọn ngày cụ thể" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>Tất cả ngày trong tuần</span>
                      </div>
                    </SelectItem>
                    {weekDays.map((day) => {
                      const today = new Date().toISOString().split("T")[0];
                      const isToday = day.fullDate === today;
                      const isPast = day.fullDate < today;

                      return (
                        <SelectItem key={day.value} value={day.value}>
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isToday
                                  ? "bg-green-500"
                                  : isPast
                                  ? "bg-gray-400"
                                  : "bg-blue-500"
                              }`}
                            ></div>
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium ${
                                    isToday
                                      ? "text-green-600"
                                      : isPast
                                      ? "text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {day.dayName} ({day.date})
                                  {isToday && "(Hôm nay)"}
                                </span>
                                {day.shifts?.some((s: any) => s.isCustom) && (
                                  <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                                    Đã sửa
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {day.shifts?.map((shift: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      shift.isCustom
                                        ? "bg-orange-100 text-orange-800 font-medium"
                                        : shift.period === "sáng"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : shift.period === "chiều"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                    }`}
                                    title={
                                      shift.isCustom
                                        ? `Gốc: ${shift.originalTime}`
                                        : undefined
                                    }
                                  >
                                    {shift.period?.toUpperCase() || "CA"}:
                                    {shift.time}
                                    {shift.isCustom && " *"}
                                  </span>
                                )) || []}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <ActionButtons
            triggerFileUpload={triggerFileUpload}
            handleDownloadExcel={handleDownloadExcel}
            setShowShiftConfigDialog={setShowShiftConfigDialog}
            setShowRoomClassificationDialog={setShowRoomClassificationDialog}
            setShowCloneDialog={setShowCloneDialog}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleSaveAll={handleSaveAll}
            undoStack={undoStack}
            redoStack={redoStack}
            scheduleChanges={scheduleChanges}
          />
        </div>

        {/* Week Info Display */}
        {viewMode === "day" && selectedDay !== "all" && weekDays.length > 0 && (
          <div className="text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-md border-l-4 border-blue-400 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {weekDays.find((d) => d.value === selectedDay)?.label}
              </span>
            </div>
            <div className="flex gap-4 text-xs">
              {weekDays
                .find((d) => d.value === selectedDay)
                ?.shifts?.map((shift: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        shift.period === "sáng"
                          ? "bg-yellow-400"
                          : shift.period === "chiều"
                          ? "bg-blue-400"
                          : "bg-purple-400"
                      }`}
                    ></div>
                    <span>
                      {shift.name}: {shift.time}
                    </span>
                  </div>
                )) || []}
            </div>
          </div>
        )}

        {/* Info card với số liệu chính xác */}
        <Card className="w-full mt-4">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-600 mb-2">
                📍
                {zoneOptions?.find((z) => z.id === selectedZone)?.name || "N/A"}
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Tổng phòng:</span>
                  <span className="font-medium ml-1">
                    {currentZoneRoomCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clone Week Dialog */}
        <CloneWeekDialog
          isOpen={showCloneDialog}
          setIsOpen={setShowCloneDialog}
          currentWeek={selectedWeek}
          weeks={weeks}
          scheduleData={scheduleData}
          onClone={onCloneWeek}
          onWeekCloned={onWeekCloned}
          onCloneFromDB={onCloneFromDB}
          clinicSchedules={clinicSchedules}
          selectedZone={selectedZone}
        />
      </CardContent>
    </Card>
  );
};

export type { CloneOptions, ZoneOption };
