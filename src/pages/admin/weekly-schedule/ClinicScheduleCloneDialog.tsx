import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Copy, X } from "lucide-react";
import { format } from "date-fns";

interface ClinicScheduleCloneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClinicSchedules: Set<number>;
  cellClinicSchedules: any[];
  allTimeSlots: any[];
  slotId: string;
  onConfirmBulkCopy: (targetSlots: string[], cloneOptions: any) => void;
}

// ✅ Helper function để check future date - SỬA LỖI REGEX
function isFutureDate(dateKey: string): boolean {
  try {
    const match = dateKey.match(/\((\d{2})\/(\d{2})\)/);
    if (!match || match.length < 3) return false;

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);

    if (
      isNaN(day) ||
      isNaN(month) ||
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12
    ) {
      return false;
    }

    const currentYear = new Date().getFullYear();
    const slotDate = new Date(currentYear, month - 1, day);
    const today = new Date();

    slotDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return slotDate.getTime() > today.getTime();
  } catch (error) {
    console.warn("Error parsing future date:", error, dateKey);
    return false;
  }
}

// ✅ Helper function để parse date từ dateKey
function parseDateFromKey(dateKey: string): Date {
  try {
    // Format: "Thứ hai (09/09)" hoặc "Chủ nhật (09/09)"
    const match = dateKey.match(/\((\d{2})\/(\d{2})\)/);
    if (match && match.length >= 3) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);

      if (!isNaN(day) && !isNaN(month)) {
        const year = new Date().getFullYear();
        return new Date(year, month - 1, day);
      }
    }
    return new Date(0); // fallback
  } catch (error) {
    console.warn("Error parsing date from key:", error, dateKey);
    return new Date(0);
  }
}

// ✅ Helper function để format ngày
function formatDateDisplay(date: Date): string {
  try {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "00/00";
  }
}

// ✅ Helper function để lấy tên thứ
function getDayName(dayIndex: number): string {
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];
  return daysOfWeek[dayIndex] || "Không xác định";
}

// ✅ Helper function để sort slots theo thời gian
function sortSlotsByTime(slots: any[]): any[] {
  return [...slots].sort((a, b) => {
    const timeA = a.startTime || a.timeStart || "00:00";
    const timeB = b.startTime || b.timeStart || "00:00";
    return timeA.localeCompare(timeB);
  });
}

// ✅ Helper function để group slots theo date
function groupSlotsByDate(
  allTimeSlots: any[],
  currentSlotId: string
): { [key: string]: any[] } {
  if (!allTimeSlots || allTimeSlots.length === 0) {
    return {};
  }

  const groups: { [key: string]: any[] } = {};
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  allTimeSlots
    .filter((slot) => slot.id !== currentSlotId) // Exclude current slot
    .filter((slot) => slot.enabled !== false) // Only enabled slots
    .forEach((slot) => {
      let dateKey = "Khác";

      try {
        // Cố gắng parse từ slot.id (format: YYYY-MM-DD-examinationId)
        if (slot.id && slot.id.includes("-")) {
          const parts = slot.id.split("-");
          if (parts.length >= 3) {
            const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
            const date = new Date(dateStr + "T00:00:00");

            if (!isNaN(date.getTime())) {
              const dayOfWeek = date.getDay();
              const dayName = getDayName(dayOfWeek);
              const dateDisplay = formatDateDisplay(date);
              dateKey = `${dayName} (${dateDisplay})`;
            }
          }
        }
        // Fallback: parse từ slot.date hoặc slot.fullDate
        else if (slot.date || slot.fullDate) {
          const slotDate = new Date(slot.date || slot.fullDate);
          if (!isNaN(slotDate.getTime())) {
            const dayIndex = slotDate.getDay();
            const dayName = getDayName(dayIndex);
            const dateDisplay = format(slotDate, "dd/MM");
            dateKey = `${dayName} (${dateDisplay})`;
          }
        }

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(slot);
      } catch (error) {
        console.warn("Error parsing slot date:", error, slot);
        // Fallback - add to "Khác" group
        if (!groups["Khác"]) {
          groups["Khác"] = [];
        }
        groups["Khác"].push(slot);
      }
    });

  // Sort slots trong mỗi nhóm theo thời gian
  Object.keys(groups).forEach((dateKey) => {
    groups[dateKey] = sortSlotsByTime(groups[dateKey]);
  });

  return groups;
}

// ✅ Helper function để sort date keys
function sortDateKeys(slotsByDate: { [key: string]: any[] }): string[] {
  return Object.keys(slotsByDate).sort((a, b) => {
    // Đặt "Khác" cuối cùng
    if (a === "Khác" && b !== "Khác") return 1;
    if (b === "Khác" && a !== "Khác") return -1;
    if (a === "Khác" && b === "Khác") return 0;

    // Parse ngày từ dateKey để sắp xếp
    try {
      const dateA = parseDateFromKey(a);
      const dateB = parseDateFromKey(b);
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      // Fallback: sắp xếp alphabetically
      return a.localeCompare(b);
    }
  });
}

// ✅ Helper function để đếm available slots
function countAvailableSlots(slotsByDate: { [key: string]: any[] }): number {
  return Object.values(slotsByDate)
    .flat()
    .filter((slot) => {
      const dateKey = Object.keys(slotsByDate).find((key) =>
        slotsByDate[key].includes(slot)
      );
      return dateKey && isFutureDate(dateKey);
    }).length;
}

// ✅ Helper function để tạo default clone options
function getDefaultCloneOptions() {
  return {
    includeDoctors: true,
    includeSpecialties: true,
    includeTimeSettings: false, // Mặc định reset giờ theo ca đích
    includeAppointmentCounts: true,
  };
}

// ✅ Helper function để reset clone options
function getEmptyCloneOptions() {
  return {
    includeDoctors: false,
    includeSpecialties: false,
    includeTimeSettings: false,
    includeAppointmentCounts: false,
  };
}

// ✅ Component chính
export const ClinicScheduleCloneDialog: React.FC<
  ClinicScheduleCloneDialogProps
> = ({
  isOpen,
  onOpenChange,
  selectedClinicSchedules,
  cellClinicSchedules,
  allTimeSlots,
  slotId,
  onConfirmBulkCopy,
}) => {
  // ✅ States
  const [targetSlots, setTargetSlots] = React.useState<Set<string>>(new Set());
  const [cloneOptions, setCloneOptions] = React.useState(
    getDefaultCloneOptions()
  );

  // ✅ Handlers
  const toggleSlotSelection = React.useCallback((targetSlotId: string) => {
    setTargetSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(targetSlotId)) {
        newSet.delete(targetSlotId);
      } else {
        newSet.add(targetSlotId);
      }
      return newSet;
    });
  }, []);

  const handleConfirmBulkCopy = React.useCallback(() => {
    if (targetSlots.size > 0) {
      onConfirmBulkCopy(Array.from(targetSlots), cloneOptions);
      // Reset state sau khi copy
      setTargetSlots(new Set());
      onOpenChange(false);
    }
  }, [targetSlots, cloneOptions, onConfirmBulkCopy, onOpenChange]);

  const handleSelectAllFutureSlots = React.useCallback(() => {
    const slotsByDate = groupSlotsByDate(allTimeSlots, slotId);
    const sortedDateKeys = sortDateKeys(slotsByDate);

    const allFutureSlots = new Set<string>();
    sortedDateKeys.filter(isFutureDate).forEach((dateKey) => {
      slotsByDate[dateKey].forEach((slot) => {
        allFutureSlots.add(slot.id);
      });
    });
    setTargetSlots(allFutureSlots);
  }, [allTimeSlots, slotId]);

  const handleDeselectAllSlots = React.useCallback(() => {
    setTargetSlots(new Set());
  }, []);

  const handleSelectDaySlots = React.useCallback(
    (dateKey: string) => {
      const slotsByDate = groupSlotsByDate(allTimeSlots, slotId);
      const newTargetSlots = new Set(targetSlots);

      slotsByDate[dateKey]?.forEach((slot) => {
        newTargetSlots.add(slot.id);
      });

      setTargetSlots(newTargetSlots);
    },
    [allTimeSlots, slotId, targetSlots]
  );

  const handleDeselectDaySlots = React.useCallback(
    (dateKey: string) => {
      const slotsByDate = groupSlotsByDate(allTimeSlots, slotId);
      const newTargetSlots = new Set(targetSlots);

      slotsByDate[dateKey]?.forEach((slot) => {
        newTargetSlots.delete(slot.id);
      });

      setTargetSlots(newTargetSlots);
    },
    [allTimeSlots, slotId, targetSlots]
  );

  const handleSetDefaultOptions = React.useCallback(() => {
    setCloneOptions(getDefaultCloneOptions());
  }, []);

  const handleSetEmptyOptions = React.useCallback(() => {
    setCloneOptions(getEmptyCloneOptions());
  }, []);

  const handleUpdateCloneOption = React.useCallback(
    (key: string, value: boolean) => {
      setCloneOptions((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // ✅ Memoized values
  const slotsByDate = React.useMemo(() => {
    return groupSlotsByDate(allTimeSlots, slotId);
  }, [allTimeSlots, slotId]);

  const sortedDateKeys = React.useMemo(() => {
    return sortDateKeys(slotsByDate);
  }, [slotsByDate]);

  const availableSlotsCount = React.useMemo(() => {
    return countAvailableSlots(slotsByDate);
  }, [slotsByDate]);

  const selectedSchedules = React.useMemo(() => {
    return cellClinicSchedules.filter((_, idx) =>
      selectedClinicSchedules.has(idx)
    );
  }, [cellClinicSchedules, selectedClinicSchedules]);

  const previewSchedules = React.useMemo(() => {
    return selectedSchedules.slice(0, 2);
  }, [selectedSchedules]);

  // ✅ Reset state khi dialog đóng
  React.useEffect(() => {
    if (!isOpen) {
      setTargetSlots(new Set());
      setCloneOptions(getDefaultCloneOptions());
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div></div>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <div className="flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                📋 Copy phòng có sẵn sang ca khác
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {targetSlots.size} ca đích
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">
                  Đã chọn {selectedClinicSchedules.size} phòng:
                </span>
              </div>

              <div className="max-h-16 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {selectedSchedules.map((schedule, idx) => (
                    <Badge
                      key={schedule.id || idx}
                      variant="outline"
                      className="text-xs bg-white/50"
                    >
                      {schedule.roomName || `Phòng ${idx + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Clone Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">
                  ⚙️ Tùy chọn copy thông tin
                </h5>
                <div className="flex gap-2">
                  <button
                    onClick={handleSetDefaultOptions}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    ✅ Chọn tất cả
                  </button>
                  <button
                    onClick={handleSetEmptyOptions}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    ❌ Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                💡 <strong>Khuyến nghị:</strong> Copy tất cả thông tin để tạo
                lịch khám hoàn chỉnh
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeDoctors}
                    onChange={(e) =>
                      handleUpdateCloneOption(
                        "includeDoctors",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="flex-1">
                    👨‍⚕️ Copy bác sĩ phụ trách
                    <div className="text-xs text-gray-500">
                      Giữ nguyên bác sĩ từ lịch khám gốc
                    </div>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeSpecialties}
                    onChange={(e) =>
                      handleUpdateCloneOption(
                        "includeSpecialties",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="flex-1">
                    🔬 Copy chuyên khoa
                    <div className="text-xs text-gray-500">
                      Áp dụng chuyên khoa từ lịch khám gốc
                    </div>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeTimeSettings}
                    onChange={(e) =>
                      handleUpdateCloneOption(
                        "includeTimeSettings",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="flex-1">
                    🕐 Copy giờ tùy chỉnh
                    <div className="text-xs text-gray-500">
                      Nếu tắt, sẽ dùng giờ mặc định của ca đích
                    </div>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeAppointmentCounts}
                    onChange={(e) =>
                      handleUpdateCloneOption(
                        "includeAppointmentCounts",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="flex-1">
                    🔢 Copy số lượt khám & giữ chỗ
                    <div className="text-xs text-gray-500">
                      Giữ nguyên số lượt từ lịch khám gốc
                    </div>
                  </span>
                </label>
              </div>

              {/* Preview thông tin sẽ copy */}
              {selectedClinicSchedules.size > 0 && (
                <div className="bg-green-50 p-3 rounded text-xs">
                  <div className="font-medium text-green-800 mb-2">
                    📋 Preview thông tin sẽ copy:
                  </div>

                  {previewSchedules.map((schedule, idx) => (
                    <div
                      key={schedule.id || idx}
                      className="bg-white p-2 rounded mb-2 last:mb-0"
                    >
                      <div className="font-medium">
                        🏥 {schedule.roomName || `Phòng ${idx + 1}`}
                      </div>
                      {cloneOptions.includeDoctors && schedule.doctorName && (
                        <div>👨‍⚕️ {schedule.doctorName}</div>
                      )}
                      {cloneOptions.includeSpecialties &&
                        schedule.specialtyName && (
                          <div>🔬 {schedule.specialtyName}</div>
                        )}
                      {cloneOptions.includeAppointmentCounts && (
                        <div>🔢 {schedule.total || 0} lượt khám</div>
                      )}
                      {cloneOptions.includeTimeSettings && (
                        <div>
                          🕐 {schedule.timeStart?.slice(0, 5) || "00:00"}-
                          {schedule.timeEnd?.slice(0, 5) || "00:00"}
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedClinicSchedules.size > 2 && (
                    <div className="text-green-600">
                      ... và {selectedClinicSchedules.size - 2} phòng khác
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Target Slots Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-700">
                  📅 Chọn ca khám đích ({availableSlotsCount} ca khả dụng)
                </h5>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={handleSelectAllFutureSlots}
                  >
                    ✅ Chọn tất cả
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={handleDeselectAllSlots}
                  >
                    ❌ Bỏ chọn tất cả
                  </Button>
                </div>
              </div>

              {sortedDateKeys.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {sortedDateKeys.filter(isFutureDate).map((dateKey) => (
                    <div key={dateKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h6 className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          {dateKey}
                        </h6>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] px-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleSelectDaySlots(dateKey)}
                            title={`Chọn tất cả ${
                              slotsByDate[dateKey]?.length || 0
                            } ca trong ngày ${dateKey}`}
                          >
                            ✅ Chọn ngày
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] px-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            onClick={() => handleDeselectDaySlots(dateKey)}
                            title={`Bỏ chọn tất cả ca trong ngày ${dateKey}`}
                          >
                            ❌ Bỏ chọn
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 pl-2">
                        {slotsByDate[dateKey]?.map((slot) => (
                          <label
                            key={slot.id}
                            className={`flex items-center gap-3 text-xs cursor-pointer p-2 rounded border transition-all ${
                              targetSlots.has(slot.id)
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={targetSlots.has(slot.id)}
                              onChange={() => toggleSlotSelection(slot.id)}
                              className="rounded border-gray-300"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900 truncate">
                                  {slot.slotName ||
                                    slot.periodName ||
                                    "Ca khám"}
                                </div>
                                <div className="text-gray-500 text-xs ml-2 shrink-0">
                                  {slot.timeStart?.slice(0, 5) ||
                                    slot.startTime?.slice(0, 5) ||
                                    "00:00"}
                                  -
                                  {slot.timeEnd?.slice(0, 5) ||
                                    slot.endTime?.slice(0, 5) ||
                                    "00:00"}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Không có ca khám tương lai nào khả dụng</p>
                  <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                    💡 Chỉ có thể copy sang các ngày sau hôm nay để tránh xung
                    đột lịch khám
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Sẽ copy {selectedClinicSchedules.size} phòng sang
                {targetSlots.size} ca
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmBulkCopy}
                  disabled={
                    targetSlots.size === 0 || selectedClinicSchedules.size === 0
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy sang {targetSlots.size} ca
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
