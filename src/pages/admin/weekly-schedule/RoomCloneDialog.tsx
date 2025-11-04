import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, X, Calendar } from "lucide-react";

interface RoomCloneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRooms: Set<number>;
  deptId: string;
  allTimeSlots: any[];
  slotId: string;
  onConfirmClone: (
    targetSlots: string[],
    targetDepartments: string[],
    cloneOptions: any
  ) => void;
}

// ✅ Helper function để check future date - CHỈ CHO ROOM CLONE
function isFutureDateForRoom(dateKey: string): boolean {
  try {
    // Tách theo dòng, lấy phần ngày tháng (VD: "23/09")
    const lines = dateKey.split("\n");
    const datePart = lines[lines.length - 1]?.trim();

    if (!datePart || !datePart.includes("/")) {
      return false;
    }

    const [day, month] = datePart.split("/").map(Number);

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
    console.warn("Error parsing future date for room:", error, dateKey);
    return false;
  }
}

// ✅ Helper function để parse date từ slot ID
function parseSlotDate(slot: any): { date: Date; dateKey: string } {
  const daysOfWeek = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  let dateKey = "Khác";
  let date = new Date(0);

  try {
    // Extract date from slot ID (format: YYYY-MM-DD-examinationId)
    if (slot.id && slot.id.includes("-")) {
      const parts = slot.id.split("-");
      if (parts.length >= 3) {
        const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const parsedDate = new Date(dateStr + "T00:00:00");

        if (!isNaN(parsedDate.getTime())) {
          const dayOfWeek = parsedDate.getDay();
          const dayName = daysOfWeek[dayOfWeek];
          const dateDisplay = `${parts[2].padStart(2, "0")}/${parts[1].padStart(
            2,
            "0"
          )}`;
          dateKey = `${dayName}\n${dateDisplay}`;
          date = parsedDate;
        }
      }
    }
    // Fallback: parse từ slot.date hoặc slot.fullDate
    else if (slot.date || slot.fullDate) {
      const slotDate = new Date(slot.date || slot.fullDate);
      if (!isNaN(slotDate.getTime())) {
        const dayIndex = slotDate.getDay();
        const dayName = daysOfWeek[dayIndex];
        const day = slotDate.getDate().toString().padStart(2, "0");
        const month = (slotDate.getMonth() + 1).toString().padStart(2, "0");
        dateKey = `${dayName}\n${day}/${month}`;
        date = slotDate;
      }
    }
  } catch (error) {
    console.warn("Error parsing slot date:", error, slot);
  }

  return { date, dateKey };
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

  allTimeSlots
    .filter((slot) => slot.id !== currentSlotId) // Loại bỏ slot hiện tại
    .filter((slot) => slot.enabled !== false) // CHỈ LẤY CA ĐANG HOẠT ĐỘNG
    .forEach((slot) => {
      const { dateKey } = parseSlotDate(slot);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    });

  // Sắp xếp slots trong mỗi nhóm theo thời gian
  Object.keys(groups).forEach((dateKey) => {
    groups[dateKey] = sortSlotsByTime(groups[dateKey]);
  });

  return groups;
}

// ✅ Helper function để sort date keys theo thứ tự
function sortDateKeys(slotsByDate: { [key: string]: any[] }): string[] {
  return Object.keys(slotsByDate).sort((a, b) => {
    // Đặt "Khác" cuối cùng
    if (a === "Khác" && b !== "Khác") return 1;
    if (b === "Khác" && a !== "Khác") return -1;
    if (a === "Khác" && b === "Khác") return 0;

    // Ưu tiên sắp xếp theo ngày trong tuần
    const daysOrder = [
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
      "Chủ nhật",
    ];

    const dayA = a.split("\n")[0];
    const dayB = b.split("\n")[0];

    const indexA = daysOrder.indexOf(dayA);
    const indexB = daysOrder.indexOf(dayB);

    if (indexA !== -1 && indexB !== -1) {
      if (indexA !== indexB) {
        return indexA - indexB;
      }

      // Nếu cùng thứ, sort theo ngày/tháng
      try {
        const datePartA = a.split("\n")[1];
        const datePartB = b.split("\n")[1];

        if (datePartA && datePartB) {
          const [dayA, monthA] = datePartA.split("/").map(Number);
          const [dayB, monthB] = datePartB.split("/").map(Number);

          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        }
      } catch (error) {
        console.warn("Error sorting dates:", error);
      }
    }

    return a.localeCompare(b);
  });
}

// ✅ Helper function để filter future dates
function filterFutureDateKeys(sortedDateKeys: string[]): string[] {
  return sortedDateKeys.filter(isFutureDateForRoom);
}

// ✅ Helper function để count available slots
function countAvailableSlots(slotsByDate: { [key: string]: any[] }): number {
  return Object.values(slotsByDate).flat().length;
}

// ✅ Helper function để count future slots
function countFutureSlots(
  sortedDateKeys: string[],
  slotsByDate: { [key: string]: any[] }
): number {
  return filterFutureDateKeys(sortedDateKeys).reduce(
    (total, dateKey) => total + (slotsByDate[dateKey]?.length || 0),
    0
  );
}

// ✅ Helper function để tạo default clone options
function getDefaultCloneOptions() {
  return {
    includeDoctors: true,
    includeSpecialties: true,
    includeExamTypes: true,
    includeTimeSettings: true,
    includeAppointmentCounts: true,
    includeNotes: false,
  };
}

// ✅ Helper function để tạo minimal clone options
function getMinimalCloneOptions() {
  return {
    includeDoctors: false,
    includeSpecialties: false,
    includeExamTypes: false,
    includeTimeSettings: false,
    includeAppointmentCounts: true, // Vẫn copy số lượt
    includeNotes: false,
  };
}

// ✅ Helper function để format slot time
function formatSlotTime(slot: any): string {
  const startTime = slot.startTime || slot.timeStart || "00:00";
  const endTime = slot.endTime || slot.timeEnd || "00:00";
  return `${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
}

// ✅ Helper function để get slot display name
function getSlotDisplayName(slot: any): string {
  return slot.slotName || slot.periodName || "Ca khám";
}

// ✅ Component chính
export const RoomCloneDialog: React.FC<RoomCloneDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedRooms,
  deptId,
  allTimeSlots,
  slotId,
  onConfirmClone,
}) => {
  // ✅ States
  const [targetSlots, setTargetSlots] = React.useState<Set<string>>(new Set());
  const [targetDepartments, setTargetDepartments] = React.useState<Set<string>>(
    new Set([deptId]) // Mặc định chọn khoa hiện tại
  );
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

  const handleConfirmClone = React.useCallback(() => {
    if (targetSlots.size > 0) {
      const properTargetSlots: string[] = Array.from(targetSlots);

      // Chỉ clone trong cùng khoa (chỉ truyền khoa hiện tại)
      onConfirmClone(
        properTargetSlots,
        [deptId], // Chỉ khoa hiện tại
        cloneOptions
      );

      // Reset state sau khi clone
      setTargetSlots(new Set());
      onOpenChange(false);
    }
  }, [targetSlots, deptId, cloneOptions, onConfirmClone, onOpenChange]);

  const handleSelectAllSlots = React.useCallback(() => {
    const slotsByDate = groupSlotsByDate(allTimeSlots, slotId);
    const sortedDateKeys = sortDateKeys(slotsByDate);
    const futureDateKeys = filterFutureDateKeys(sortedDateKeys);

    const allSlotIds = new Set<string>();
    futureDateKeys.forEach((dateKey) => {
      slotsByDate[dateKey]?.forEach((slot) => {
        allSlotIds.add(slot.id);
      });
    });

    setTargetSlots(allSlotIds);
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

  const handleSetMinimalOptions = React.useCallback(() => {
    setCloneOptions(getMinimalCloneOptions());
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

  const futureDateKeys = React.useMemo(() => {
    return filterFutureDateKeys(sortedDateKeys);
  }, [sortedDateKeys]);

  const totalAvailableSlots = React.useMemo(() => {
    return countAvailableSlots(slotsByDate);
  }, [slotsByDate]);

  const totalFutureSlots = React.useMemo(() => {
    return countFutureSlots(sortedDateKeys, slotsByDate);
  }, [sortedDateKeys, slotsByDate]);

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
      <PopoverContent className="w-[500px]" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Nhân bản phòng</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="text-xs text-gray-600">
            Đã chọn {selectedRooms.size} phòng • {totalFutureSlots}/
            {totalAvailableSlots} ca khám tương lai có thể chọn
          </div>

          {/* Clone Options */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Tùy chọn nhân bản:
              </label>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={handleSetDefaultOptions}
                >
                  Copy toàn bộ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={handleSetMinimalOptions}
                >
                  Chỉ phòng + giờ ca
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneOptions.includeDoctors}
                  onChange={(e) =>
                    handleUpdateCloneOption("includeDoctors", e.target.checked)
                  }
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>🩺 Copy bác sĩ</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneOptions.includeSpecialties}
                  onChange={(e) =>
                    handleUpdateCloneOption(
                      "includeSpecialties",
                      e.target.checked
                    )
                  }
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>🏥 Copy chuyên khoa</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneOptions.includeExamTypes}
                  onChange={(e) =>
                    handleUpdateCloneOption(
                      "includeExamTypes",
                      e.target.checked
                    )
                  }
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>📋 Copy loại khám</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneOptions.includeAppointmentCounts}
                  onChange={(e) =>
                    handleUpdateCloneOption(
                      "includeAppointmentCounts",
                      e.target.checked
                    )
                  }
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>🔢 Copy số lượt khám & giữ chỗ</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneOptions.includeTimeSettings}
                  onChange={(e) =>
                    handleUpdateCloneOption(
                      "includeTimeSettings",
                      e.target.checked
                    )
                  }
                  className="w-3 h-3 rounded border-gray-300"
                />
                <span>⏰ Copy giờ tùy chỉnh</span>
              </label>
            </div>

            <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
              💡 <strong>Giờ khám:</strong> Luôn theo ca đích. Tích "Copy giờ
              tùy chỉnh" để giữ giờ đã chỉnh sửa riêng của phòng gốc.
            </div>

            <div className="text-xs text-gray-500 mt-1 p-2 bg-amber-50 rounded border-l-2 border-amber-200">
              ⚠️ <strong>Ví dụ:</strong> Nhân bản từ Ca 1 (7:00-11:30) → Ca 3
              (13:30-16:00) sẽ lấy giờ 13:30-16:00
            </div>
          </div>

          {/* Target Slots Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Chọn ca khám đích ({totalFutureSlots} ca tương lai):
              </label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllSlots}
                  className="h-6 text-xs px-2"
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAllSlots}
                  className="h-6 text-xs px-2"
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {futureDateKeys.length > 0 ? (
                futureDateKeys.map((dateKey) => (
                  <div key={dateKey} className="space-y-2">
                    {/* Date header with select/deselect buttons */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-gray-600 border-b pb-1">
                        {dateKey}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] px-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleSelectDaySlots(dateKey)}
                          title={`Chọn tất cả ${
                            slotsByDate[dateKey]?.length || 0
                          } ca trong ngày`}
                        >
                          ✅ Chọn ngày
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] px-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          onClick={() => handleDeselectDaySlots(dateKey)}
                          title="Bỏ chọn tất cả ca trong ngày"
                        >
                          ❌ Bỏ chọn
                        </Button>
                      </div>
                    </div>

                    {/* Slots grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {slotsByDate[dateKey]?.map((slot) => (
                        <label
                          key={slot.id}
                          className={`flex items-center gap-2 p-2 text-xs rounded border cursor-pointer transition-colors ${
                            targetSlots.has(slot.id)
                              ? "bg-purple-50 border-purple-300 text-purple-700"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={targetSlots.has(slot.id)}
                            onChange={() => toggleSlotSelection(slot.id)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium truncate">
                              {getSlotDisplayName(slot)}
                            </span>
                            <span className="text-gray-500">
                              {formatSlotTime(slot)}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Không có ca khám tương lai nào khả dụng</p>
                  <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                    💡 Chỉ có thể nhân bản sang các ngày sau hôm nay để tránh
                    xung đột lịch khám
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmClone}
              disabled={targetSlots.size === 0 || targetDepartments.size === 0}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              Nhân bản ({targetSlots.size} ca, {targetDepartments.size} khoa)
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
