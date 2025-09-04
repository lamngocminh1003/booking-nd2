import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { RoomCell } from "./RoomCell";

interface WeeklyScheduleTableProps {
  searchFilteredDepartments: Array<{ id: string; name: string }>;
  timeSlots: Array<any>;
  viewMode: "week" | "day";
  selectedDay: string;
  selectedWeek: string;
  scheduleData: Record<string, Record<string, any>>;
  scheduleChanges: Record<string, any>;
  editingCell: string | null;
  setEditingCell: (value: string | null) => void;
  roomSearchTerm: string;
  setRoomSearchTerm: (value: string) => void;
  filteredRooms: any[];
  allRooms: any[]; // ✅ Thêm allRooms
  availableSpecialties: string[];
  availableDoctors: any[];
  getDoctorsBySpecialty?: (specialtyName: string) => any[]; // ✅ Thêm helper
  getDoctorsByDepartment?: (departmentId: string) => any[]; // ✅ Thêm helper
  roomClassifications: any;
  shiftDefaults: any;
  addRoomToShift: (deptId: string, slotId: string, roomId: string) => void;
  removeRoomFromShift: (
    deptId: string,
    slotId: string,
    roomIndex: number
  ) => void;
  updateRoomConfig: (
    deptId: string,
    slotId: string,
    roomIndex: number,
    updates: any
  ) => void;
  getRoomStyle: (type: string) => string;
  // ✅ Thêm props mới cho cấu trúc phân cấp
  departmentsByZone?: any;
  selectedZone?: string;
  // ✅ Thêm clinic schedules props
  clinicSchedules?: any[];
}

export const WeeklyScheduleTable: React.FC<WeeklyScheduleTableProps> = ({
  searchFilteredDepartments,
  timeSlots,
  viewMode,
  selectedDay,
  selectedWeek,
  scheduleData,
  scheduleChanges,
  editingCell,
  setEditingCell,
  roomSearchTerm,
  setRoomSearchTerm,
  filteredRooms,
  allRooms, // ✅ Nhận allRooms từ props
  availableSpecialties,
  availableDoctors,
  getDoctorsBySpecialty,
  getDoctorsByDepartment,
  roomClassifications,
  shiftDefaults,
  addRoomToShift,
  removeRoomFromShift,
  updateRoomConfig,
  getRoomStyle,
  // ✅ Nhận props mới
  departmentsByZone,
  selectedZone,
  // ✅ Nhận clinic schedules
  clinicSchedules = [],
}) => {
  // ✅ Debug clinic schedules
  React.useEffect(() => {
    if (clinicSchedules && clinicSchedules.length > 0) {
      console.log("📋 WeeklyScheduleTable received clinic schedules:", {
        count: clinicSchedules.length,
        data: clinicSchedules.slice(0, 3), // Log first 3 for debugging
      });
    } else {
      console.log("⚠️ WeeklyScheduleTable: No clinic schedules received");
    }
  }, [clinicSchedules]);

  const getWeekDateRange = (weekString: string) => {
    try {
      const [year, weekStr] = weekString.split("-W");
      const weekNum = parseInt(weekStr);
      const yearNum = parseInt(year);

      // ✅ Kiểm tra valid values
      if (isNaN(weekNum) || isNaN(yearNum)) {
        throw new Error("Invalid week format");
      }

      const startOfYear = new Date(yearNum, 0, 1);
      const daysToAdd = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
      const mondayOfWeek = new Date(yearNum, 0, 1 + daysToAdd);

      const fridayOfWeek = new Date(mondayOfWeek);
      fridayOfWeek.setDate(mondayOfWeek.getDate() + 4);

      return {
        startDate: format(mondayOfWeek, "dd/MM"),
        endDate: format(fridayOfWeek, "dd/MM"),
        weekNum,
        mondayDate: mondayOfWeek,
        fridayDate: fridayOfWeek,
      };
    } catch (error) {
      console.error("Error parsing week:", error);
      // ✅ Fallback to current week
      const now = new Date();
      return {
        startDate: format(now, "dd/MM"),
        endDate: format(now, "dd/MM"),
        weekNum: 1,
        mondayDate: now,
        fridayDate: now,
      };
    }
  };

  const weekRange = getWeekDateRange(selectedWeek);

  // ✅ Helper function để lấy giờ hiển thị với safety checks
  const getDisplayTime = (slot: any) => {
    if (!slot) {
      return {
        startTime: "07:30",
        endTime: "11:00",
        originalStartTime: "07:30",
        originalEndTime: "11:00",
        isCustom: false,
      };
    }

    const shiftConfig = shiftDefaults?.[slot.workSession];
    const originalStartTime = slot.startTime?.slice(0, 5) || "07:30";
    const originalEndTime = slot.endTime?.slice(0, 5) || "11:00";
    const currentStartTime = shiftConfig?.startTime || originalStartTime;
    const currentEndTime = shiftConfig?.endTime || originalEndTime;

    // ✅ Kiểm tra xem có thay đổi so với giờ gốc không
    const hasTimeChange =
      currentStartTime !== originalStartTime ||
      currentEndTime !== originalEndTime;

    return {
      startTime: currentStartTime,
      endTime: currentEndTime,
      originalStartTime,
      originalEndTime,
      isCustom: hasTimeChange,
    };
  };

  // ✅ Function để lấy phòng available cho slot
  const getAvailableRoomsForSlot = (slotId: string) => {
    // Trả về filteredRooms hoặc allRooms dựa vào logic filter
    return filteredRooms && filteredRooms.length > 0
      ? filteredRooms
      : allRooms || [];
  };

  // ✅ Helper function để chuẩn hóa room ID (đồng bộ với RoomConfigPopover và RoomCell)
  const normalizeRoomId = (roomData: any): string => {
    const id =
      roomData?.id?.toString() ||
      roomData?.roomId?.toString() ||
      roomData?.code?.toString() ||
      roomData?.roomCode?.toString() ||
      "";
    return id.trim();
  };

  // ✅ Function để lấy phòng đã được sử dụng trong slot
  const getUsedRoomsInSlot = (slotId: string) => {
    const usedRoomIds = new Set<string>();

    try {
      Object.values(scheduleData || {}).forEach((deptSchedule) => {
        if (deptSchedule && typeof deptSchedule === "object") {
          Object.entries(deptSchedule).forEach(
            ([deptSlotId, slot]: [string, any]) => {
              if (
                deptSlotId === slotId &&
                slot?.rooms &&
                Array.isArray(slot.rooms)
              ) {
                slot.rooms.forEach((room: any) => {
                  // ✅ Sử dụng normalizeRoomId để đồng bộ với logic khác
                  const roomId = normalizeRoomId(room);
                  if (roomId) {
                    usedRoomIds.add(roomId);
                  }
                });
              }
            }
          );
        }
      });
    } catch (error) {
      console.error("Error getting used rooms:", error);
    }

    return usedRoomIds;
  };

  // ✅ Filter time slots với safety checks
  const displayedSlots = useMemo(() => {
    if (!Array.isArray(timeSlots)) {
      return [];
    }

    let filteredSlots = timeSlots.filter((slot) => slot?.enabled);

    if (viewMode === "day" && selectedDay !== "all") {
      return filteredSlots.filter((slot) => slot?.fullDate === selectedDay);
    }
    return filteredSlots;
  }, [timeSlots, viewMode, selectedDay]);

  // ✅ Safety check cho departments
  const safeDepartments = useMemo(() => {
    return Array.isArray(searchFilteredDepartments)
      ? searchFilteredDepartments
      : [];
  }, [searchFilteredDepartments]);

  return (
    <Card className="shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 font-semibold text-left bg-gray-100 sticky left-0 z-20 min-w-[150px]">
                  Khoa phòng
                </th>
                {displayedSlots.map((slot) => {
                  const displayTime = getDisplayTime(slot);

                  return (
                    <th
                      key={slot?.id || Math.random()}
                      className={`border border-gray-300 p-2 text-center min-w-[120px] ${
                        displayTime.isCustom
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-600">
                          {slot?.day || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {slot?.date || "N/A"}
                        </span>

                        {/* Hiển thị tên ca */}
                        <span
                          className={`text-xs font-semibold mt-1 ${
                            displayTime.isCustom
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
                          {slot?.periodName ||
                            slot?.period?.toUpperCase() ||
                            "Ca làm việc"}
                          {displayTime.isCustom && " *"}
                        </span>

                        {/* Hiển thị giờ hiện tại */}
                        <span
                          className={`text-xs ${
                            displayTime.isCustom
                              ? "text-orange-500 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {displayTime.startTime}-{displayTime.endTime}
                        </span>

                        {/* ✅ CHỈ hiển thị giờ gốc khi có thay đổi */}
                        {displayTime.isCustom && (
                          <span className="text-xs text-gray-400 opacity-70">
                            (Gốc: {displayTime.originalStartTime}-
                            {displayTime.originalEndTime})
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {safeDepartments.map((dept, index) => (
                <tr
                  key={dept?.id || index}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  <td className="border border-gray-300 p-1 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 shadow-md">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-[10px]">{dept?.name || "N/A"}</span>
                    </div>
                  </td>
                  {displayedSlots.map((slot) => {
                    const deptId = dept?.id?.toString() || "";
                    const slotId = slot?.id || "";
                    const cellKey = `${deptId}-${slotId}`;
                    const rooms = scheduleData?.[deptId]?.[slotId]?.rooms || [];
                    const hasChanges = scheduleChanges?.[cellKey] !== undefined;
                    const isEditing = editingCell === cellKey;
                    const displayTime = getDisplayTime(slot);

                    // ✅ Lấy phòng có thể chọn cho slot này
                    const availableRooms = getAvailableRoomsForSlot(slotId);
                    const usedRooms = getUsedRoomsInSlot(slotId);

                    return (
                      <td
                        key={slotId || Math.random()}
                        className={`border border-gray-300 p-1 align-top min-w-[120px] relative ${
                          displayTime.isCustom
                            ? "bg-orange-50 border-orange-200"
                            : ""
                        }`}
                      >
                        <RoomCell
                          deptId={deptId}
                          slotId={slotId}
                          rooms={rooms}
                          isEditing={isEditing}
                          hasChanges={hasChanges}
                          roomSearchTerm={roomSearchTerm}
                          setRoomSearchTerm={setRoomSearchTerm}
                          filteredRooms={availableRooms}
                          allRooms={allRooms} // ✅ Truyền allRooms
                          usedRooms={usedRooms}
                          availableSpecialties={availableSpecialties}
                          availableDoctors={availableDoctors}
                          getDoctorsBySpecialty={getDoctorsBySpecialty} // ✅ Truyền helper
                          getDoctorsByDepartment={getDoctorsByDepartment} // ✅ Truyền helper
                          roomClassifications={roomClassifications}
                          shiftDefaults={shiftDefaults}
                          timeSlots={timeSlots}
                          setEditingCell={setEditingCell}
                          addRoomToShift={addRoomToShift}
                          removeRoomFromShift={removeRoomFromShift}
                          updateRoomConfig={updateRoomConfig}
                          getRoomStyle={getRoomStyle}
                          // ✅ Thêm props mới cho cấu trúc phân cấp
                          departmentsByZone={departmentsByZone}
                          selectedZone={selectedZone}
                          // ✅ Thêm clinic schedules data
                          clinicSchedules={clinicSchedules}
                          selectedWeek={selectedWeek}
                          // ✅ Thêm callback để handle room swap
                          onRoomSwapped={(oldRoomId, newRoomId) => {
                            // Data sẽ được cập nhật tự động thông qua updateRoomConfig
                            // usedRooms sẽ được recalculate trong getUsedRoomsInSlot
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Thông báo nếu không có department */}
          {safeDepartments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                🏥
              </div>
              <p className="font-medium">Không có khoa phòng nào</p>
              <p className="text-sm mt-2">
                Vui lòng thêm khoa phòng để hiển thị lịch khám.
              </p>
            </div>
          )}

          {/* ✅ Thông báo nếu không có ca nào enabled */}
          {displayedSlots.length === 0 && safeDepartments.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                🕐
              </div>
              <p className="font-medium">Không có ca khám nào đang hoạt động</p>
              <p className="text-sm mt-2">
                {viewMode === "day" && selectedDay !== "all"
                  ? "Ngày được chọn không có ca khám nào."
                  : "Vui lòng bật ca khám trong phần Cấu hình ca khám để hiển thị lịch."}
              </p>
            </div>
          )}

          {/* ✅ Legend cho custom times */}
          {displayedSlots.length > 0 &&
            displayedSlots.some((slot) => getDisplayTime(slot).isCustom) && (
              <div className="p-3 bg-orange-50 border-t border-orange-200">
                <div className="flex items-center gap-2 text-xs text-orange-700">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>* Giờ đã được tùy chỉnh từ giờ gốc của ca khám</span>
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
