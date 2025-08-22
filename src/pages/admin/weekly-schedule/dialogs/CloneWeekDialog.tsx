import React, { useState } from "react";
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

interface CloneOptions {
  includeRooms: boolean;
  includeSpecialties: boolean;
  includeDoctors: boolean;
  includeTimeSettings: boolean;
  overwriteExisting: boolean;
}

interface CloneWeekDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentWeek: string;
  weeks: Array<any>;
  scheduleData: Record<string, Record<string, any>>;
  onClone: (targetWeeks: string[], options: CloneOptions) => void;
}

export const CloneWeekDialog: React.FC<CloneWeekDialogProps> = ({
  isOpen,
  setIsOpen,
  currentWeek,
  weeks,
  scheduleData,
  onClone,
}) => {
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

  const handleWeekToggle = (weekValue: string, checked: boolean) => {
    if (checked) {
      setSelectedWeeks((prev) => [...prev, weekValue]);
    } else {
      setSelectedWeeks((prev) => prev.filter((w) => w !== weekValue));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWeeks(availableWeeks.map((w) => w.value));
    } else {
      setSelectedWeeks([]);
    }
  };

  const handleClone = () => {
    if (selectedWeeks.length === 0) {
      return;
    }
    onClone(selectedWeeks, cloneOptions);
    setIsOpen(false);
    setSelectedWeeks([]);
  };

  const currentWeekRoomCount = getCurrentWeekRoomCount();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCog className="w-5 h-5" />
            Nhân bản lịch khám theo tuần
          </DialogTitle>
          <DialogDescription>
            Sao chép lịch khám từ tuần hiện tại sang các tuần khác. Hiện tại có{" "}
            <span className="font-medium text-blue-600">
              {currentWeekRoomCount} phòng
            </span>{" "}
            được lên lịch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                ({currentWeekRoomCount} phòng đã lên lịch)
              </span>
            </div>
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

          {/* Tùy chọn nhân bản */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Tùy chọn nhân bản
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-rooms"
                  checked={cloneOptions.includeRooms}
                  onCheckedChange={(checked) =>
                    setCloneOptions((prev) => ({
                      ...prev,
                      includeRooms: checked as boolean,
                    }))
                  }
                />
                <label
                  htmlFor="include-rooms"
                  className="text-sm cursor-pointer"
                >
                  Sao chép danh sách phòng
                </label>
              </div>

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

          {/* Thông tin xem trước */}
          {selectedWeeks.length > 0 && currentWeekRoomCount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Copy className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Xem trước kết quả
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">Sẽ nhân bản:</span>
                  <span className="font-medium ml-1">
                    {currentWeekRoomCount} phòng
                  </span>
                  <span className="text-gray-600 ml-1">sang</span>
                  <span className="font-medium ml-1 text-blue-600">
                    {selectedWeeks.length} tuần
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Tổng cộng:{" "}
                  <span className="font-medium">
                    {currentWeekRoomCount * selectedWeeks.length}
                  </span>{" "}
                  lượt phòng sẽ được tạo
                </div>
              </div>
            </div>
          )}

          {/* Warning khi chưa có phòng */}
          {currentWeekRoomCount === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Chưa có dữ liệu để nhân bản
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                Tuần hiện tại chưa có phòng nào được lên lịch. Vui lòng thêm
                phòng vào lịch trước khi nhân bản.
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
            disabled={selectedWeeks.length === 0 || currentWeekRoomCount === 0}
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

export type { CloneOptions };
