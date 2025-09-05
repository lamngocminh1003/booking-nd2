import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  X,
  Search,
  Clock,
  Users,
  Stethoscope,
  Info,
  Calendar,
  MapPin,
  AlertTriangle,
  Copy,
  CheckSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoomConfigPopover } from "./RoomConfigPopover";

interface RoomCellProps {
  deptId: string;
  slotId: string;
  rooms: any[];
  isEditing: boolean;
  hasChanges: boolean;
  roomSearchTerm: string;
  setRoomSearchTerm: (value: string) => void;
  filteredRooms: any[];
  availableSpecialties: string[];
  availableDoctors: any[];
  roomClassifications: any;
  shiftDefaults: any;
  setEditingCell: (value: string | null) => void;
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
  timeSlots: any[];
  usedRooms: Set<string>;
  allRooms: any[];
  getDoctorsBySpecialty?: (specialtyName: string) => any[];
  getDoctorsByDepartment?: (departmentId: string) => any[];
  // ✅ Thêm props mới cho cấu trúc phân cấp
  departmentsByZone?: any; // Dữ liệu khoa phòng với examTypes và specialties
  selectedZone?: string; // Zone hiện tại
  // ✅ Thêm callback để nhận thông tin room swap từ RoomConfigPopover
  onRoomSwapped?: (oldRoomId: string, newRoomId: string) => void;
  // ✅ Thêm props cho clinic schedules
  clinicSchedules?: any[];
  selectedWeek?: string;
  // ✅ Thêm props cho chức năng clone rooms
  onCloneRooms?: (
    rooms: any[],
    targetSlots?: string[],
    targetDepartmentIds?: string[],
    cloneOptions?: any,
    sourceSlotId?: string
  ) => void;
  allTimeSlots?: any[]; // Danh sách tất cả slots để chọn target clone
  // ✅ Thêm danh sách tất cả departments để clone cross-department
  allDepartments?: Array<{ id: string; name: string }>;
}

export const RoomCell: React.FC<RoomCellProps> = ({
  deptId,
  slotId,
  rooms,
  isEditing,
  hasChanges,
  roomSearchTerm,
  setRoomSearchTerm,
  filteredRooms,
  availableSpecialties,
  availableDoctors,
  roomClassifications,
  shiftDefaults,
  setEditingCell,
  addRoomToShift,
  removeRoomFromShift,
  updateRoomConfig,
  getRoomStyle,
  timeSlots,
  usedRooms,
  allRooms,
  getDoctorsBySpecialty,
  getDoctorsByDepartment,
  // ✅ Nhận props mới
  departmentsByZone,
  selectedZone,
  // ✅ Nhận callback cho room swap
  onRoomSwapped,
  // ✅ Nhận clinic schedules data
  clinicSchedules = [],
  selectedWeek,
  // ✅ Nhận props cho chức năng clone rooms
  onCloneRooms,
  allTimeSlots = [],
  allDepartments = [],
}) => {
  const cellKey = `${deptId}-${slotId}`;

  // ✅ Local state để tracking used rooms (đồng bộ với RoomConfigPopover)
  const [localUsedRooms, setLocalUsedRooms] = React.useState<Set<string>>(
    new Set()
  );

  // ✅ State cho chức năng clone rooms
  const [selectedRooms, setSelectedRooms] = React.useState<Set<number>>(
    new Set()
  );
  const [isRoomCloneMode, setIsRoomCloneMode] = React.useState(false);
  const [showRoomCloneDialog, setShowRoomCloneDialog] = React.useState(false);

  // ✅ State để track các slot đã được nhân bản phòng và hiển thị chúng
  const [recentClonedRoomSlots, setRecentClonedRoomSlots] = React.useState<{
    targetSlots: string[];
    timestamp: number;
    sourceSlot: string;
    roomsCount: number;
  } | null>(null);

  // ✅ Toast hook cho feedback
  const { toast } = useToast();

  // ✅ Helper function để chuẩn hóa room ID (giống với RoomConfigPopover)
  const normalizeRoomId = (roomData: any): string => {
    const id =
      roomData?.id?.toString() ||
      roomData?.roomId?.toString() ||
      roomData?.code?.toString() ||
      roomData?.roomCode?.toString() ||
      "";
    return id.trim();
  };

  // ✅ Enhanced isUsed check để dùng cả usedRooms và localUsedRooms
  const isRoomUsed = (roomData: any): boolean => {
    const roomId = normalizeRoomId(roomData);
    if (!roomId) return false;

    const inUsedRooms = usedRooms && usedRooms.has(roomId);
    const inLocalUsedRooms = localUsedRooms.has(roomId);

    return inUsedRooms || inLocalUsedRooms;
  };

  // ✅ Handle room swap notification từ RoomConfigPopover
  const handleRoomSwapped = (oldRoomId: string, newRoomId: string) => {
    // ✅ Cập nhật local used rooms ngay lập tức
    setLocalUsedRooms((prev) => {
      const newSet = new Set(prev);
      newSet.delete(oldRoomId); // Bỏ phòng cũ
      newSet.add(newRoomId); // Thêm phòng mới

      return newSet;
    });

    // ✅ Notify parent component nếu có callback
    if (onRoomSwapped) {
      onRoomSwapped(oldRoomId, newRoomId);
    }
  };

  // ✅ Helper functions cho chức năng clone rooms
  const toggleRoomSelection = (roomIndex: number) => {
    setSelectedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomIndex)) {
        newSet.delete(roomIndex);
      } else {
        newSet.add(roomIndex);
      }
      return newSet;
    });
  };

  const selectAllRooms = () => {
    const allIndices = new Set(rooms.map((_, index) => index));
    setSelectedRooms(allIndices);
  };

  const clearRoomSelection = () => {
    setSelectedRooms(new Set());
    setIsRoomCloneMode(false);
  };

  const enterRoomCloneMode = () => {
    setIsRoomCloneMode(true);
    setSelectedRooms(new Set());
  };

  // ✅ Helper function để hiển thị từng slot phòng một cách tuần tự với animation đẹp
  const showClonedRoomSlotsSequentially = (targetSlots: string[]) => {
    console.log("🎬 Bắt đầu hiển thị tuần tự nhân bản phòng:", targetSlots);
    console.log("🏥 Khoa hiện tại:", deptId);

    // ✅ Debug DOM elements hiện có
    const allSlotElements = document.querySelectorAll("[data-slot-id]");
    console.log("🔍 Tất cả DOM elements với data-slot-id:", {
      totalElements: allSlotElements.length,
      slotIds: Array.from(allSlotElements).map((el) =>
        el.getAttribute("data-slot-id")
      ),
    });

    if (allSlotElements.length === 0) {
      console.error("❌ Không tìm thấy DOM elements nào với data-slot-id!");
      toast({
        title: "Lỗi hiển thị animation",
        description:
          "Không tìm thấy các ô ca khám để highlight. Có thể trang chưa tải xong.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Cleanup các badge cũ trước khi bắt đầu
    document
      .querySelectorAll('[id^="room-clone-badge-"]')
      .forEach((badge) => badge.remove());

    targetSlots.forEach((targetSlotId, index) => {
      setTimeout(() => {
        console.log(
          `🔍 [${index + 1}/${targetSlots.length}] Tìm slot: ${targetSlotId}`
        );

        // ✅ Parse để lấy actualSlotId cho việc tìm DOM element
        let actualSlotId = targetSlotId;
        let targetDeptId = "";

        if (targetSlotId.includes("-")) {
          const slotParts = targetSlotId.split("-");
          if (slotParts.length >= 5) {
            // Format: deptId-YYYY-MM-DD-examinationId
            targetDeptId = slotParts[0];
            actualSlotId = slotParts.slice(1).join("-");
            console.log(
              `📋 Cross-dept animation: dept=${targetDeptId}, actualSlot=${actualSlotId}`
            );
          } else {
            // Format: YYYY-MM-DD-examinationId
            actualSlotId = targetSlotId;
            console.log(`📋 Same-dept animation: actualSlot=${actualSlotId}`);
          }
        }

        // ✅ Tìm element với actualSlotId
        let element = document.querySelector(
          `[data-slot-id="${actualSlotId}"]`
        );

        // ✅ Fallback 1: tìm theo table cell
        if (!element) {
          console.log(`⚠️ Fallback 1: Tìm td[data-slot-id="${actualSlotId}"]`);
          element = document.querySelector(
            `td[data-slot-id="${actualSlotId}"]`
          );
        }

        // ✅ Fallback 2: tìm theo tất cả elements có data-slot-id
        if (!element) {
          console.log(
            `⚠️ Fallback 2: Tìm trong tất cả elements với data-slot-id`
          );
          const allCells = document.querySelectorAll("[data-slot-id]");
          for (const cell of allCells) {
            if (cell.getAttribute("data-slot-id") === actualSlotId) {
              element = cell;
              console.log(`✅ Tìm thấy (fallback 2): ${actualSlotId}`);
              break;
            }
          }
        }

        if (element) {
          console.log(
            `✅ [${index + 1}/${
              targetSlots.length
            }] Tìm thấy element cho slot: ${actualSlotId}`,
            element
          );

          // ✅ Scroll đến slot đầu tiên
          if (index === 0) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
            console.log(`📍 Scroll đến slot đầu tiên: ${targetSlotId}`);
          }

          // ✅ Thêm class preparation trước khi highlight
          element.classList.add("transition-all", "duration-500");

          // ✅ Hiệu ứng highlighting với pulse animation
          setTimeout(() => {
            element.classList.add(
              "ring-4",
              "ring-purple-400",
              "ring-opacity-90",
              "animate-pulse",
              "bg-purple-50",
              "border-purple-300",
              "shadow-lg"
            );

            // ✅ Thêm badge hiển thị số thứ tự với animation
            const badge = document.createElement("div");
            badge.className =
              "absolute top-1 right-1 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-50 animate-bounce";
            badge.textContent = `${index + 1}`;
            badge.id = `room-clone-badge-${actualSlotId}`;

            // ✅ Ensure element has relative positioning
            if (element instanceof HTMLElement) {
              element.style.position = "relative";
              element.appendChild(badge);
              console.log(
                `🏷️ Thêm badge ${
                  index + 1
                } cho slot: ${actualSlotId} (original: ${targetSlotId})`
              );
            }

            // ✅ Thêm progress indicator cho tổng tiến trình
            if (index === 0) {
              // Tạo progress toast cho sequence
              toast({
                title: "🎬 Đang hiển thị từng vị trí phòng...",
                description: `Hiển thị ${targetSlots.length} vị trí được nhân bản phòng`,
                duration: targetSlots.length * 800 + 2000,
              });
              console.log(
                `📱 Hiển thị progress toast cho ${targetSlots.length} slots`
              );
            }

            // ✅ Hiệu ứng âm thanh hoặc visual cue với detailed logging
            console.log(
              `✅ [${index + 1}/${
                targetSlots.length
              }] Hiển thị slot: ${targetSlotId}`
            );

            // ✅ Tự động remove các effect sau một thời gian
            setTimeout(() => {
              element.classList.remove(
                "ring-4",
                "ring-purple-400",
                "ring-opacity-90",
                "animate-pulse",
                "bg-purple-50",
                "border-purple-300",
                "shadow-lg"
              );

              // ✅ Remove badge với fade effect
              const existingBadge = document.getElementById(
                `room-clone-badge-${actualSlotId}`
              );
              if (existingBadge) {
                existingBadge.classList.add("animate-fade-out");
                setTimeout(() => {
                  existingBadge.remove();
                  console.log(`🗑️ Đã xóa badge cho slot: ${actualSlotId}`);
                }, 300);
              }

              // ✅ Hiển thị completion toast cho item cuối
              if (index === targetSlots.length - 1) {
                setTimeout(() => {
                  toast({
                    title: "🎉 Hoàn thành nhân bản phòng!",
                    description: `Đã hiển thị tất cả ${targetSlots.length} vị trí được nhân bản phòng`,
                    duration: 3000,
                  });
                  console.log(
                    `🎉 Hoàn thành hiển thị ${targetSlots.length} slots`
                  );
                }, 500);
              }
            }, 3000 + index * 200); // Thời gian hiển thị tăng dần
          }, 100);
        } else {
          console.error(
            `❌ Không tìm thấy element cho slot: ${actualSlotId} (original: ${targetSlotId})`
          );
          console.log(
            "🔍 Available data-slot-id elements:",
            Array.from(document.querySelectorAll("[data-slot-id]")).map((el) =>
              el.getAttribute("data-slot-id")
            )
          );

          // ✅ Fallback: hiển thị toast thông báo cho slot không tìm thấy
          toast({
            title: `Slot ${actualSlotId} không tìm thấy`,
            description: "Có thể slot này chưa được render hoặc đã bị ẩn.",
            duration: 2000,
          });
        }
      }, index * 800); // Tăng delay để user có thể theo dõi từng slot rõ ràng hơn
    });
  };

  const handleCloneRooms = (
    targetSlots: string[],
    targetDepartmentIds?: string[],
    cloneOptions?: any
  ) => {
    console.log("🚀 handleCloneRooms được gọi với:", {
      targetSlots,
      targetDepartmentIds,
      cloneOptions,
      selectedRoomsSize: selectedRooms.size,
      onCloneRooms: !!onCloneRooms,
      allTimeSlots: allTimeSlots?.length || 0,
    });

    if (!onCloneRooms) {
      console.error("❌ onCloneRooms prop không được truyền từ component cha!");
      toast({
        title: "Lỗi nhân bản phòng",
        description:
          "Chức năng nhân bản chưa được kết nối. Vui lòng liên hệ dev.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRooms.size === 0) {
      console.error("❌ Không có phòng nào được chọn!");
      toast({
        title: "Không có phòng được chọn",
        description: "Vui lòng chọn ít nhất một phòng để nhân bản.",
        variant: "destructive",
      });
      return;
    }

    const roomsToClone = rooms.filter((_, index) => selectedRooms.has(index));

    onCloneRooms(
      roomsToClone,
      targetSlots,
      targetDepartmentIds,
      cloneOptions,
      slotId
    );

    // ✅ Lưu thông tin các slot được nhân bản để hiển thị
    setRecentClonedRoomSlots({
      targetSlots: targetSlots,
      timestamp: Date.now(),
      sourceSlot: slotId,
      roomsCount: selectedRooms.size,
    });

    // ✅ Hiển thị thông báo thành công với thông tin chi tiết
    const targetSlotNames = targetSlots
      .map((slotId) => {
        const slot = allTimeSlots.find((s) => s.id === slotId);
        return slot
          ? `${slot.slotName} (${slot.timeStart}-${slot.timeEnd})`
          : slotId;
      })
      .join(", ");

    const roomDetails = roomsToClone
      .map((room) => {
        return room.name || room.roomName || `Phòng ${room.id}`;
      })
      .join(", ");

    toast({
      title: "Nhân bản phòng thành công! ✅",
      description: `Đã nhân bản ${selectedRooms.size} phòng [${roomDetails}] sang ${targetSlots.length} ca`,
      action: (
        <button
          onClick={() => {
            // ✅ Sử dụng hàm helper mới để hiển thị từng slot tuần tự
            showClonedRoomSlotsSequentially(targetSlots);
          }}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
        >
          <span>🎯</span>
          Xem lại
        </button>
      ),
    });

    // ✅ Hiển thị animation ngay lập tức
    console.log("⏰ Chuẩn bị hiển thị animation sau 300ms...");
    setTimeout(() => {
      console.log("▶️ Bắt đầu hiển thị animation cho slots:", targetSlots);
      showClonedRoomSlotsSequentially(targetSlots);
    }, 300); // Giảm delay xuống 300ms để hiển thị nhanh hơn

    // ✅ Debug: Log thông tin về targetSlots
    console.log("📋 Target slots for room clone:", targetSlots);
    console.log(
      "📋 All available time slots:",
      allTimeSlots.map((slot) => ({ id: slot.id, name: slot.slotName }))
    );

    // ✅ Auto clear thông tin clone sau 10 giây
    setTimeout(() => {
      setRecentClonedRoomSlots(null);
    }, 10000);

    setShowRoomCloneDialog(false);
    clearRoomSelection();
  };

  // ✅ Lấy examTypes và specialties từ departmentsByZone
  const departmentData = React.useMemo(() => {
    if (!departmentsByZone || !selectedZone || selectedZone === "all") {
      return { examTypes: [], specialties: [] };
    }

    try {
      const zoneDepartments = departmentsByZone[selectedZone] || [];

      // Tìm department hiện tại theo deptId
      const currentDepartment = zoneDepartments.find(
        (dept: any) => dept.departmentHospitalId.toString() === deptId
      );

      if (!currentDepartment) {
        console.warn(`Department ${deptId} not found in zone ${selectedZone}`);
        return { examTypes: [], specialties: [] };
      }

      const examTypes = currentDepartment.examTypes || [];

      // Lấy tất cả specialties từ tất cả examTypes
      const allSpecialties = new Set<string>();
      examTypes.forEach((examType: any) => {
        if (examType.sepicalties && Array.isArray(examType.sepicalties)) {
          examType.sepicalties.forEach((specialty: any) => {
            if (specialty.enable && specialty.name) {
              allSpecialties.add(specialty.name);
            }
          });
        }
      });

      return {
        examTypes: examTypes.filter((et: any) => et.enable),
        specialties: Array.from(allSpecialties),
        department: currentDepartment,
      };
    } catch (error) {
      console.error("Error processing department data:", error);
      return { examTypes: [], specialties: [] };
    }
  }, [departmentsByZone, selectedZone, deptId]);

  // ✅ Lấy ALL clinic schedules cho conflict detection (tất cả khoa)
  const allCellClinicSchedules = React.useMemo(() => {
    if (!clinicSchedules || clinicSchedules.length === 0) {
      return [];
    }

    // Parse slotId để lấy thông tin ngày và examination
    let targetDate = "";
    let targetExaminationId = "";

    if (slotId.includes("-")) {
      const parts = slotId.split("-");
      if (parts.length >= 4) {
        targetDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
        targetExaminationId = parts[3];
      }
    }

    // Filter theo ngày và ca khám TRÊN TẤT CẢ CÁC KHOA (cho conflict detection)
    const allRelevantSchedules = clinicSchedules.filter((schedule) => {
      const scheduleDate = schedule.dateInWeek?.slice(0, 10);
      const dateMatch = scheduleDate === targetDate;
      const examinationMatch =
        schedule.examinationId?.toString() === targetExaminationId;
      return dateMatch && examinationMatch;
    });

    return allRelevantSchedules;
  }, [clinicSchedules, slotId]);

  // ✅ Lấy clinic schedules CHỈ CỦA KHOA HIỆN TẠI (cho hiển thị UI)
  const cellClinicSchedules = React.useMemo(() => {
    // Lọc từ allCellClinicSchedules để chỉ lấy khoa hiện tại
    const currentDeptSchedules = allCellClinicSchedules.filter((schedule) => {
      return schedule.departmentHospitalId?.toString() === deptId;
    });

    return currentDeptSchedules;
  }, [allCellClinicSchedules, deptId, slotId]);

  // ✅ Lấy thông tin slot và thời gian từ timeSlots
  const currentSlotInfo = React.useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) {
      return null;
    }

    // Parse slotId để lấy examination ID
    let targetExaminationId = "";
    if (slotId.includes("-")) {
      const parts = slotId.split("-");
      if (parts.length >= 4) {
        targetExaminationId = parts[3];
      }
    }

    // Tìm slot tương ứng
    const currentSlot = timeSlots.find((slot) => slot.id === slotId);
    if (!currentSlot) {
      return null;
    }

    return {
      slotName: currentSlot.periodName || currentSlot.period || "Ca khám",
      workSession: currentSlot.workSession || "",
      startTime: currentSlot.startTime?.slice(0, 5) || "",
      endTime: currentSlot.endTime?.slice(0, 5) || "",
      examinationId: targetExaminationId,
      fullSlot: currentSlot,
    };
  }, [timeSlots, slotId]);

  const clinicScheduleStats = React.useMemo(() => {
    if (
      cellClinicSchedules.length === 0 &&
      allCellClinicSchedules.length === 0
    ) {
      return null;
    }

    const totalSchedules = cellClinicSchedules.length;
    const uniqueRooms = new Set(cellClinicSchedules.map((s) => s.roomId)).size;
    const uniqueDoctors = new Set(cellClinicSchedules.map((s) => s.doctorId))
      .size;
    const uniqueSpecialties = new Set(
      cellClinicSchedules.map((s) => s.specialtyName)
    ).size;

    // ✅ Phân loại theo khoa sử dụng allCellClinicSchedules
    const sameDepSchedules = allCellClinicSchedules.filter(
      (s) => s.departmentHospitalId?.toString() === deptId
    );
    const otherDepSchedules = allCellClinicSchedules.filter(
      (s) => s.departmentHospitalId?.toString() !== deptId
    );

    // ✅ Lấy danh sách các khoa khác
    const otherDepartments = [
      ...new Set(
        otherDepSchedules.map((s) => ({
          id: s.departmentHospitalId,
          name: s.departmentName || `Khoa ${s.departmentHospitalId}`,
        }))
      ),
    ];

    const totalAppointments = cellClinicSchedules.reduce((total, schedule) => {
      if (
        schedule.appointmentSlots &&
        Array.isArray(schedule.appointmentSlots)
      ) {
        return (
          total + schedule.appointmentSlots.filter((slot) => slot.enable).length
        );
      }
      return total + (schedule.total || 0);
    }, 0);

    return {
      totalSchedules,
      uniqueRooms,
      uniqueDoctors,
      uniqueSpecialties,
      totalAppointments,
      schedules: cellClinicSchedules, // Hiển thị chỉ khoa hiện tại
      // ✅ Thống kê theo khoa dựa trên tất cả khoa
      sameDepSchedules,
      otherDepSchedules,
      otherDepartments,
      hasCrossDepartmentConflicts: otherDepSchedules.length > 0,
    };
  }, [cellClinicSchedules, allCellClinicSchedules, deptId]);

  // ✅ Component hiển thị chi tiết clinic schedule
  const ClinicScheduleDetailPopover: React.FC<{
    schedule: any;
    trigger: React.ReactNode;
  }> = ({ schedule, trigger }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="flex flex-col max-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Chi tiết lịch khám
                  </h4>
                  <p className="text-xs text-gray-500">
                    {schedule.roomName} - {schedule.examinationName}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                ID: {schedule.id}
              </Badge>
            </div>

            {/* Content */}
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
                              {slot.startSlot?.slice(0, 5)} -{" "}
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
                <h5 className="font-medium text-purple-700 mb-2">
                  Thông tin khoa phòng
                </h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-purple-600">Khoa:</span>
                    <span className="ml-2 font-medium">
                      {schedule.departmentHospitalName}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-600">Mã khoa:</span>
                    <span className="ml-2 font-medium">
                      {schedule.departmentHospitalId}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-600">Mã phòng:</span>
                    <span className="ml-2 font-medium">{schedule.roomId}</span>
                  </div>
                  <div>
                    <span className="text-purple-600">Mã bác sĩ:</span>
                    <span className="ml-2 font-medium">
                      {schedule.doctorId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50/50 p-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID lịch khám: {schedule.id}</span>
                <span>Ngày tạo: {schedule.dateInWeek?.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // ✅ Helper function để kiểm tra conflicts cho từng phòng (tránh hook trong loop)
  const getConflictInfo = React.useCallback(
    (room: any, roomId: string) => {
      // ✅ Safe doctors retrieval
      let roomDoctors: any[] = [];
      try {
        if (getDoctorsByDepartment && room?.departmentId) {
          roomDoctors =
            getDoctorsByDepartment(room.departmentId.toString()) || [];
        }
      } catch (error) {
        console.warn("Error getting room doctors:", error);
        roomDoctors = [];
      }

      // ✅ Kiểm tra xung đột bác sĩ trong clinic schedules (TRÊN TẤT CẢ CÁC KHOA)
      const doctorConflictInfo = (() => {
        if (!allCellClinicSchedules || allCellClinicSchedules.length === 0) {
          return { hasConflict: false, conflictDetails: [] };
        }

        const conflictDetails: any[] = [];

        // Kiểm tra xem có bác sĩ nào trong phòng này đã có lịch khám không (chỉ so sánh mã bác sĩ)
        roomDoctors.forEach((doctor) => {
          const doctorCode =
            doctor.doctor_IdEmployee_Postgresql || doctor.code || doctor.id;
          const doctorSchedules = allCellClinicSchedules.filter((schedule) => {
            const scheduleCode =
              schedule.doctor_IdEmployee_Postgresql ||
              schedule.doctorCode ||
              schedule.doctorId;
            return scheduleCode === doctorCode;
          });

          if (doctorSchedules.length > 0) {
            // Phân loại conflicts theo khoa
            const sameDepConflicts = doctorSchedules.filter(
              (s) => s.departmentHospitalId?.toString() === deptId
            );
            const otherDepConflicts = doctorSchedules.filter(
              (s) => s.departmentHospitalId?.toString() !== deptId
            );

            conflictDetails.push({
              doctor,
              sameDepConflicts,
              otherDepConflicts,
              totalConflicts: doctorSchedules.length,
            });
          }
        });

        return {
          hasConflict: conflictDetails.length > 0,
          conflictDetails,
        };
      })();

      // ✅ Kiểm tra xung đột phòng trong clinic schedules (TRÊN TẤT CẢ CÁC KHOA)
      const roomConflictInfo = (() => {
        if (!allCellClinicSchedules || allCellClinicSchedules.length === 0) {
          return {
            hasConflict: false,
            conflictDetails: {
              sameDepConflicts: [],
              otherDepConflicts: [],
              totalConflicts: 0,
            },
          };
        }

        const roomSchedules = allCellClinicSchedules.filter((schedule) => {
          return schedule.roomId?.toString() === roomId;
        });

        if (roomSchedules.length === 0) {
          return {
            hasConflict: false,
            conflictDetails: {
              sameDepConflicts: [],
              otherDepConflicts: [],
              totalConflicts: 0,
            },
          };
        }

        // Phân loại conflicts theo khoa
        const sameDepConflicts = roomSchedules.filter(
          (s) => s.departmentHospitalId?.toString() === deptId
        );
        const otherDepConflicts = roomSchedules.filter(
          (s) => s.departmentHospitalId?.toString() !== deptId
        );

        return {
          hasConflict: true,
          conflictDetails: {
            sameDepConflicts,
            otherDepConflicts,
            totalConflicts: roomSchedules.length,
          },
        };
      })();

      // ✅ Tạo thông báo tooltip chi tiết với phân loại conflict
      const getDisabledReason = () => {
        const reasons = [];
        const isUsed = isRoomUsed(room);

        if (isUsed) {
          reasons.push("Phòng đã được sử dụng trong ca này");
        }

        if (roomConflictInfo.hasConflict) {
          const { sameDepConflicts, otherDepConflicts } =
            roomConflictInfo.conflictDetails;

          if (sameDepConflicts.length > 0) {
            reasons.push(
              `Phòng đã có lịch khám trong khoa này (${sameDepConflicts.length} lịch)`
            );
          }

          if (otherDepConflicts.length > 0) {
            const deptNames = [
              ...new Set(
                otherDepConflicts.map(
                  (s) => s.departmentName || `Khoa ${s.departmentHospitalId}`
                )
              ),
            ];
            reasons.push(
              `Phòng đã có lịch khám ở khoa khác: ${deptNames.join(", ")} (${
                otherDepConflicts.length
              } lịch)`
            );
          }
        }

        if (doctorConflictInfo.hasConflict) {
          doctorConflictInfo.conflictDetails.forEach(
            ({ doctor, sameDepConflicts, otherDepConflicts }) => {
              if (sameDepConflicts.length > 0) {
                reasons.push(
                  `BS ${doctor.name} đã có lịch khám trong khoa này (${sameDepConflicts.length} lịch)`
                );
              }

              if (otherDepConflicts.length > 0) {
                const deptNames = [
                  ...new Set(
                    otherDepConflicts.map(
                      (s) =>
                        s.departmentName || `Khoa ${s.departmentHospitalId}`
                    )
                  ),
                ];
                reasons.push(
                  `BS ${
                    doctor.name
                  } đã có lịch khám ở khoa khác: ${deptNames.join(", ")} (${
                    otherDepConflicts.length
                  } lịch)`
                );
              }
            }
          );
        }

        return reasons.join(" • ");
      };

      return {
        roomDoctors,
        hasDoctorConflict: doctorConflictInfo.hasConflict,
        hasRoomConflict: roomConflictInfo.hasConflict,
        doctorConflictInfo,
        roomConflictInfo,
        getDisabledReason,
      };
    },
    [allCellClinicSchedules, getDoctorsByDepartment, isRoomUsed]
  );

  // ✅ Enhanced search logic với tốt hơn performance
  const searchableRooms = React.useMemo(() => {
    // Ưu tiên sử dụng filteredRooms (đã filter theo zone), fallback về allRooms
    const roomsToSearch =
      filteredRooms && filteredRooms.length > 0
        ? filteredRooms
        : allRooms || [];

    if (!roomSearchTerm || roomSearchTerm.trim().length === 0) {
      return roomsToSearch;
    }

    const searchTerm = roomSearchTerm.toLowerCase().trim();

    return roomsToSearch.filter((room) => {
      try {
        // ✅ Tìm kiếm theo thông tin cơ bản
        const basicFields = [
          room.name,
          room.code,
          room.roomNumber,
          room.roomName,
          room.zoneName,
          room.classification,
          room.departmentName,
        ].filter(Boolean);

        const basicMatch = basicFields.some((field) =>
          field?.toString().toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo specialties của phòng
        const specialtyMatch = room.specialties?.some((specialty: string) =>
          specialty?.toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo available specialties (từ dropdown)
        const availableSpecialtyMatch = availableSpecialties?.some(
          (specialty) => specialty?.toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo doctors - cải thiện performance
        let doctorMatch = false;

        // Tìm theo doctors trong department của phòng
        if (getDoctorsByDepartment && room.departmentId) {
          try {
            const deptDoctors = getDoctorsByDepartment(
              room.departmentId.toString()
            );
            doctorMatch = deptDoctors?.some(
              (doctor) =>
                doctor?.name?.toLowerCase().includes(searchTerm) ||
                doctor?.code?.toLowerCase().includes(searchTerm) ||
                doctor?.specialty?.toLowerCase().includes(searchTerm)
            );
          } catch (error) {
            console.warn("Error getting doctors by department:", error);
          }
        }

        // Fallback: tìm trong tất cả doctors nếu chưa tìm thấy
        if (!doctorMatch && availableDoctors?.length > 0) {
          doctorMatch = availableDoctors.some(
            (doctor) =>
              doctor?.name?.toLowerCase().includes(searchTerm) ||
              doctor?.code?.toLowerCase().includes(searchTerm) ||
              doctor?.specialty?.toLowerCase().includes(searchTerm)
          );
        }

        return (
          basicMatch || specialtyMatch || availableSpecialtyMatch || doctorMatch
        );
      } catch (error) {
        console.warn("Error in room search filter:", error);
        return false;
      }
    });
  }, [
    filteredRooms,
    allRooms,
    roomSearchTerm,
    availableSpecialties,
    availableDoctors,
    getDoctorsByDepartment,
  ]);

  // ✅ Rendering logic cho editing mode
  if (isEditing) {
    return (
      <div className="space-y-2 ">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <Input
            placeholder="Tìm phòng, chuyên khoa, bác sĩ..."
            value={roomSearchTerm}
            onChange={(e) => setRoomSearchTerm(e.target.value)}
            className="pl-7 h-7 text-xs"
            autoFocus
          />
        </div>

        {/* Room List */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {searchableRooms && searchableRooms.length > 0 ? (
            searchableRooms.map((room) => {
              // ✅ Safe room ID extraction với normalize function
              const roomId = normalizeRoomId(room);

              // ✅ Sử dụng enhanced isUsed check
              const isUsed = isRoomUsed(room);
              const roomIdentifier =
                room?.code ||
                room?.name ||
                room?.roomNumber ||
                `Room-${roomId}`;

              // ✅ Sử dụng helper function để tránh hooks trong loop
              const conflictInfo = getConflictInfo(room, roomId);
              const {
                roomDoctors,
                hasDoctorConflict,
                hasRoomConflict,
                getDisabledReason,
              } = conflictInfo;

              // ✅ Tổng hợp các lý do disable
              const isDisabled = isUsed || hasDoctorConflict || hasRoomConflict;

              return (
                <button
                  key={roomId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!isDisabled && roomId && addRoomToShift) {
                      try {
                        addRoomToShift(deptId, slotId, roomId);
                        setEditingCell(null);
                        setRoomSearchTerm("");

                        // ✅ Cập nhật local used rooms ngay lập tức
                        setLocalUsedRooms((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(roomId);

                          return newSet;
                        });
                      } catch (error) {
                        console.error("❌ Error adding room:", error);
                      }
                    } else {
                      console.warn("⚠️ Cannot add room:", {
                        isUsed,
                        hasDoctorConflict,
                        hasRoomConflict,
                        isDisabled,
                        roomId,
                        hasFunction: !!addRoomToShift,
                        reason: getDisabledReason(),
                      });
                    }
                  }}
                  disabled={isDisabled}
                  className={`flex flex-col gap-1 text-left p-2 text-xs rounded border transition-colors ${
                    isDisabled
                      ? "bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                  }`}
                  title={
                    isDisabled
                      ? getDisabledReason()
                      : `Thêm phòng ${roomIdentifier}`
                  }
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDisabled
                            ? hasRoomConflict || hasDoctorConflict
                              ? "bg-red-500"
                              : "bg-orange-400"
                            : "bg-green-400"
                        }`}
                      />
                      <span className="font-medium">{roomIdentifier}</span>
                      {room?.name && room?.code && room.name !== room.code && (
                        <span className="text-gray-400">({room.name})</span>
                      )}
                    </div>

                    {/* ✅ Visual indicators cho các loại xung đột */}
                    <div className="flex items-center gap-1">
                      {isUsed && !hasRoomConflict && !hasDoctorConflict && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                          Đã dùng
                        </span>
                      )}
                      {hasRoomConflict && (
                        <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                          Phòng trùng
                        </span>
                      )}
                      {hasDoctorConflict && (
                        <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
                          BS trùng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="text-gray-500 mt-1 space-y-1">
                    {/* Zone và Department */}
                    <div className="flex gap-1 flex-wrap">
                      {room?.zoneName && (
                        <span className="text-xs bg-gray-100 px-1 rounded">
                          📍 {room.zoneName}
                        </span>
                      )}
                      {room?.departmentName && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                          🏥 {room.departmentName}
                        </span>
                      )}
                    </div>

                    {/* ✅ ExamTypes và Specialties từ departmentData */}
                    {departmentData.examTypes.length > 0 && (
                      <div className="space-y-1">
                        {/* Loại khám */}
                        <div className="flex gap-1 flex-wrap">
                          {departmentData.examTypes
                            .slice(0, 2)
                            .map((examType: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-green-100 text-green-600 px-1 rounded"
                              >
                                🩺 {examType.name}
                              </span>
                            ))}
                          {departmentData.examTypes.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{departmentData.examTypes.length - 2} loại khám
                            </span>
                          )}
                        </div>

                        {/* Chuyên khoa */}
                        {departmentData.specialties.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {departmentData.specialties
                              .slice(0, 3)
                              .map((specialty: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-purple-100 text-purple-600 px-1 rounded"
                                >
                                  🔬 {specialty}
                                </span>
                              ))}
                            {departmentData.specialties.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{departmentData.specialties.length - 3} chuyên
                                khoa
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Available Doctors */}
                    {roomDoctors.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {roomDoctors.slice(0, 2).map((doctor, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-600 px-1 rounded"
                          >
                            👨‍⚕️ {doctor?.name || "N/A"}
                          </span>
                        ))}
                        {roomDoctors.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{roomDoctors.length - 2} BS
                          </span>
                        )}
                      </div>
                    )}

                    {/* Search match highlights */}
                    {roomSearchTerm && (
                      <div className="text-xs text-blue-500">
                        {room?.specialties?.some((s: string) =>
                          s
                            ?.toLowerCase()
                            .includes(roomSearchTerm.toLowerCase())
                        ) && "🔍 Khớp chuyên khoa"}

                        {roomDoctors.some((d) =>
                          d?.name
                            ?.toLowerCase()
                            .includes(roomSearchTerm.toLowerCase())
                        ) && " 🔍 Khớp bác sĩ"}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            // Empty state
            <div className="text-center p-4 text-gray-500 text-xs">
              {roomSearchTerm ? (
                <>
                  <Search className="w-4 h-4 mx-auto mb-1 opacity-50" />
                  <p>
                    Không tìm thấy phòng, chuyên khoa, hoặc bác sĩ "
                    {roomSearchTerm}"
                  </p>
                  <p className="text-xs mt-1">
                    Thử tìm theo: tên phòng, mã phòng, chuyên khoa, tên bác sĩ
                  </p>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 mx-auto mb-1 opacity-50">🏠</div>
                  <p>Không có phòng nào trong khu vực này</p>
                  <p className="text-xs mt-1">
                    Có {allRooms?.length || 0} phòng,{" "}
                    {availableSpecialties?.length || 0} chuyên khoa,{" "}
                    {availableDoctors?.length || 0} bác sĩ
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-6 text-xs"
            onClick={() => {
              setEditingCell(null);
              setRoomSearchTerm("");
            }}
          >
            Hủy
          </Button>
          {roomSearchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setRoomSearchTerm("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ✅ Component Room Clone Dialog
  const RoomCloneDialog: React.FC = () => {
    const [targetSlots, setTargetSlots] = React.useState<Set<string>>(
      new Set()
    );
    const [targetDepartments, setTargetDepartments] = React.useState<
      Set<string>
    >(
      new Set([deptId]) // Mặc định chọn khoa hiện tại
    );

    // ✅ Thêm state cho clone options
    const [cloneOptions, setCloneOptions] = React.useState({
      includeDoctors: true, // Mặc định copy bác sĩ
      includeSpecialties: true, // Copy chuyên khoa
      includeExamTypes: true, // Copy loại khám
      includeTimeSettings: true, // Copy cài đặt thời gian
      includeAppointmentCounts: true, // ✅ Copy số lượt khám và giữ chỗ
      includeNotes: false, // Không copy ghi chú (có thể có thông tin cụ thể cho slot cũ)
    });

    const toggleSlotSelection = (slotId: string) => {
      setTargetSlots((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(slotId)) {
          newSet.delete(slotId);
        } else {
          newSet.add(slotId);
        }
        return newSet;
      });
    };

    const handleConfirmClone = () => {
      if (targetSlots.size > 0) {
        // ✅ Chỉ clone trong cùng khoa hiện tại
        const properTargetSlots: string[] = [];

        console.log("🎯 Clone trong cùng khoa:", {
          targetSlots: Array.from(targetSlots),
          currentDepartment: deptId,
        });

        // ✅ Chỉ sử dụng khoa hiện tại, không clone cross-department
        targetSlots.forEach((baseSlotId) => {
          properTargetSlots.push(baseSlotId);
          console.log(`📋 Same-dept clone: ${baseSlotId} (dept: ${deptId})`);
        });

        console.log(
          "🎯 Final target slots (same department only):",
          properTargetSlots
        );

        console.log(
          "🎯 Clone phòng từ slot:",
          slotId,
          "sang slots:",
          properTargetSlots
        );
        console.log("🏥 Trong cùng khoa:", deptId);

        // ✅ Chỉ clone trong cùng khoa (chỉ truyền khoa hiện tại)
        handleCloneRooms(
          properTargetSlots,
          [deptId], // Chỉ khoa hiện tại
          cloneOptions
        );

        // ✅ Backup: Hiển thị animation ngay cả khi onCloneRooms có vấn đề
        setTimeout(() => {
          showClonedRoomSlotsSequentially(properTargetSlots);
        }, 500);
      }
    };

    // ✅ Nhóm slots theo ngày để hiển thị organized hơn - CHỈ CA ĐANG HOẠT ĐỘNG
    const slotsByDate = React.useMemo(() => {
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
        .filter((slot) => slot.id !== slotId) // Loại bỏ slot hiện tại
        .filter((slot) => slot.enabled !== false) // ✅ CHỈ LẤY CA ĐANG HOẠT ĐỘNG
        .forEach((slot) => {
          // Extract date from slot ID (format: YYYY-MM-DD-examinationId)
          let dateKey = "Khác";
          let dayName = "";

          if (slot.id && slot.id.includes("-")) {
            const parts = slot.id.split("-");
            if (parts.length >= 3) {
              const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
              const date = new Date(dateStr + "T00:00:00");

              if (!isNaN(date.getTime())) {
                const dayOfWeek = date.getDay();
                dayName = daysOfWeek[dayOfWeek];
                const dateDisplay = `${parts[2].padStart(
                  2,
                  "0"
                )}/${parts[1].padStart(2, "0")}`;
                dateKey = `${dayName}\n${dateDisplay}`;
              }
            }
          }

          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(slot);
        });

      // Sắp xếp slots trong mỗi nhóm theo thời gian
      Object.keys(groups).forEach((dateKey) => {
        groups[dateKey].sort((a, b) => {
          const timeA = a.startTime || "";
          const timeB = b.startTime || "";
          return timeA.localeCompare(timeB);
        });
      });

      return groups;
    }, [allTimeSlots, slotId]);

    // ✅ Sắp xếp các ngày theo thứ tự
    const sortedDateKeys = React.useMemo(() => {
      return Object.keys(slotsByDate).sort((a, b) => {
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
          return indexA - indexB;
        }

        return a.localeCompare(b);
      });
    }, [slotsByDate]);

    const totalAvailableSlots = Object.values(slotsByDate).flat().length;

    return (
      <Popover open={showRoomCloneDialog} onOpenChange={setShowRoomCloneDialog}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px]" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Nhân bản phòng</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRoomCloneDialog(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-gray-600">
              Đã chọn {selectedRooms.size} phòng • {totalAvailableSlots} ca khám
              đang hoạt động có thể chọn
            </div>

            {/* ✅ Clone Options */}
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
                    onClick={() => {
                      setCloneOptions({
                        includeDoctors: true,
                        includeSpecialties: true,
                        includeExamTypes: true,
                        includeTimeSettings: true,
                        includeAppointmentCounts: true,
                        includeNotes: false,
                      });
                    }}
                  >
                    Copy toàn bộ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      setCloneOptions({
                        includeDoctors: false,
                        includeSpecialties: false,
                        includeExamTypes: false,
                        includeTimeSettings: false,
                        includeAppointmentCounts: true, // Vẫn copy số lượt
                        includeNotes: false,
                      });
                    }}
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
                      setCloneOptions((prev) => ({
                        ...prev,
                        includeDoctors: e.target.checked,
                      }))
                    }
                    className="w-3 h-3"
                  />
                  <span>🩺 Copy bác sĩ</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeSpecialties}
                    onChange={(e) =>
                      setCloneOptions((prev) => ({
                        ...prev,
                        includeSpecialties: e.target.checked,
                      }))
                    }
                    className="w-3 h-3"
                  />
                  <span>🏥 Copy chuyên khoa</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeExamTypes}
                    onChange={(e) =>
                      setCloneOptions((prev) => ({
                        ...prev,
                        includeExamTypes: e.target.checked,
                      }))
                    }
                    className="w-3 h-3"
                  />
                  <span>📋 Copy loại khám</span>
                </label>{" "}
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeAppointmentCounts}
                    onChange={(e) =>
                      setCloneOptions((prev) => ({
                        ...prev,
                        includeAppointmentCounts: e.target.checked,
                      }))
                    }
                    className="w-3 h-3"
                  />
                  <span>🔢 Copy số lượt khám & giữ chỗ</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneOptions.includeTimeSettings}
                    onChange={(e) =>
                      setCloneOptions((prev) => ({
                        ...prev,
                        includeTimeSettings: e.target.checked,
                      }))
                    }
                    className="w-3 h-3"
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

            {/* Chọn khoa đích */}
            {/* ✅ DISABLED: Chỉ cho phép clone trong cùng khoa */}
            {/*
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Chọn khoa đích:
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {allDepartments.map((dept) => (
                  <label
                    key={dept.id}
                    className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={targetDepartments.has(dept.id)}
                      onChange={() => toggleDepartmentSelection(dept.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs">{dept.name}</span>
                    {dept.id === deptId && (
                      <Badge variant="secondary" className="text-xs">
                        Hiện tại
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
            */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  Chọn ca khám đích:
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const allSlotIds = new Set(
                        Object.values(slotsByDate)
                          .flat()
                          .map((slot) => slot.id)
                      );
                      setTargetSlots(allSlotIds);
                    }}
                    className="h-6 text-xs px-2"
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTargetSlots(new Set())}
                    className="h-6 text-xs px-2"
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3">
                {sortedDateKeys.length > 0 ? (
                  sortedDateKeys.map((dateKey) => (
                    <div key={dateKey} className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 border-b pb-1">
                        {dateKey}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {slotsByDate[dateKey].map((slot) => (
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
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {slot.slotName || slot.periodName || "Ca khám"}
                              </span>
                              <span className="text-gray-500">
                                {slot.startTime?.slice(0, 5)}-
                                {slot.endTime?.slice(0, 5)}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-xs">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Không có ca khám nào khả dụng</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoomCloneDialog(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmClone}
                disabled={
                  targetSlots.size === 0 || targetDepartments.size === 0
                }
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

  // ✅ Normal display mode
  return (
    <div className="space-y-1 relative">
      {/* Room header với chức năng clone khi có phòng */}
      {rooms && rooms.length > 0 && (
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Phòng ({rooms.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {isRoomCloneMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={selectAllRooms}
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={clearRoomSelection}
                >
                  Hủy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setShowRoomCloneDialog(true)}
                  disabled={selectedRooms.size === 0}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Clone ({selectedRooms.size})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => {
                    // ✅ Tự động chọn tất cả phòng và mở dialog clone ngay
                    const allIndices = new Set(rooms.map((_, index) => index));
                    setSelectedRooms(allIndices);
                    setIsRoomCloneMode(true);
                    setShowRoomCloneDialog(true);
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Nhân bản tất cả ({rooms.length})
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Existing rooms */}
      {rooms?.map((room, index) => (
        <div className="relative group">
          {/* ✅ Checkbox cho room clone mode */}
          {isRoomCloneMode && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleRoomSelection(index);
              }}
            >
              <CheckSquare
                className={`w-4 h-4 cursor-pointer ${
                  selectedRooms.has(index)
                    ? "text-purple-500"
                    : "text-gray-300 hover:text-gray-500"
                }`}
              />
            </div>
          )}

          {/* ✅ Quick clone button cho từng phòng riêng lẻ */}
          {!isRoomCloneMode && (
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white shadow-sm border border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // ✅ Chọn chỉ phòng này và mở dialog
                  setSelectedRooms(new Set([index]));
                  setIsRoomCloneMode(true);
                  setShowRoomCloneDialog(true);
                }}
                title={`Nhân bản phòng ${
                  room.name || room.roomName || `Phòng ${room.id}`
                }`}
              >
                <Copy className="w-3 h-3 text-purple-600" />
              </Button>
            </div>
          )}

          <RoomConfigPopover
            key={`${room?.id || index}-${index}`}
            room={room}
            roomIndex={index}
            deptId={deptId}
            slotId={slotId}
            availableSpecialties={departmentData.specialties} // ✅ Sử dụng specialties từ departmentData
            availableDoctors={availableDoctors}
            getDoctorsBySpecialty={getDoctorsBySpecialty}
            roomClassifications={roomClassifications}
            shiftDefaults={shiftDefaults}
            timeSlots={timeSlots}
            updateRoomConfig={updateRoomConfig}
            removeRoomFromShift={removeRoomFromShift}
            getRoomStyle={getRoomStyle}
            hasChanges={hasChanges}
            // ✅ Thêm departmentData để truyền xuống
            departmentData={departmentData}
            // ✅ Thêm props cho đổi phòng
            allRooms={allRooms}
            usedRooms={usedRooms}
            // ✅ Thêm callback để handle room swap
            onRoomSwapped={handleRoomSwapped}
            // ✅ Thêm clinic schedules để check doctor conflicts
            allCellClinicSchedules={allCellClinicSchedules}
            cellClinicSchedules={cellClinicSchedules}
          />
        </div>
      ))}

      {/* Add room button - empty state */}
      {(!rooms || rooms.length === 0) && (
        <div className="space-y-2">
          {/* ✅ Cross-department conflict warning */}

          {/* ✅ CHỈ hiển thị clinic schedules khi có dữ liệu thực sự phù hợp */}
          {clinicScheduleStats && (
            <div className="flex flex-col gap-1">
              {cellClinicSchedules.map((schedule, idx) => (
                <ClinicScheduleDetailPopover
                  key={schedule.id || idx}
                  schedule={schedule}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-auto p-2 text-xs justify-start relative border-2 hover:shadow-md transition-all cursor-pointer ${
                        schedule.examTypeId &&
                        roomClassifications[`exam_${schedule.examTypeId}`]
                          ? roomClassifications[`exam_${schedule.examTypeId}`]
                              .color ||
                            "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                      }`}
                      title="Click để xem chi tiết lịch khám"
                    >
                      <div className="flex flex-col items-start gap-1 w-full">
                        {/* Schedule header với exam type và time */}
                        <div className="flex items-center gap-1 w-full">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              schedule.departmentHospitalId?.toString() ===
                              deptId
                                ? "bg-current opacity-80"
                                : "bg-orange-500"
                            }`}
                          />

                          {/* Exam Type name */}
                          {schedule.examTypeName && (
                            <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-current/10 text-current">
                              {schedule.examTypeName}
                            </span>
                          )}

                          <span className="font-medium truncate text-current">
                            {schedule.roomName}
                          </span>

                          {/* ✅ Badge hiển thị khoa nếu khác khoa hiện tại */}
                          {schedule.departmentHospitalId?.toString() !==
                            deptId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3 bg-orange-50 text-orange-600 border-orange-300"
                            >
                              {schedule.departmentName ||
                                `Khoa ${schedule.departmentHospitalId}`}
                            </Badge>
                          )}

                          <div className="ml-auto">
                            <Info className="w-3 h-3 text-current/60 ml-1" />
                          </div>
                        </div>
                        {/* Doctor info */}
                        <div className="flex items-center gap-2 text-[10px] text-current/80">
                          <div className="flex items-center gap-1">
                            <Stethoscope className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[150px]">
                              {schedule.doctorName}
                            </span>
                          </div>
                        </div>

                        {/* Time and patient info */}
                        <div className="flex items-center gap-2 text-[10px] text-current/80">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span className="font-medium">
                              {schedule.timeStart?.slice(0, 5) ||
                                currentSlotInfo?.startTime}{" "}
                              -{" "}
                              {schedule.timeEnd?.slice(0, 5) ||
                                currentSlotInfo?.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            <span className="font-medium">
                              {schedule.total || 0}
                            </span>
                            {schedule.holdSlot > 0 && (
                              <span className="text-amber-600 font-medium">
                                +{schedule.holdSlot}🔒
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specialty badge */}
                        {schedule.specialtyName && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 max-w-full bg-current/10 text-current"
                          >
                            <span className="truncate">
                              🔬 {schedule.specialtyName}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </Button>
                  }
                />
              ))}
            </div>
          )}

          {/* Nút thêm phòng */}
          <div
            className="w-full h-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 cursor-pointer flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
            onClick={() => setEditingCell(cellKey)}
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="text-xs">Thêm mới</span>
          </div>
        </div>
      )}

      {/* Add room button - when rooms exist */}
      {rooms && rooms.length > 0 && (
        <div className="space-y-1">
          {/* Nút thêm phòng trước */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-6 text-xs border-dashed border-2 border-gray-300 hover:border-blue-400"
            onClick={() => setEditingCell(cellKey)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Thêm phòng mới
          </Button>

          {/* ✅ CHỈ hiển thị clinic schedules sau nút thêm phòng */}
          {clinicScheduleStats && (
            <div className="flex flex-col gap-1 mt-2">
              {cellClinicSchedules.map((schedule, idx) => (
                <ClinicScheduleDetailPopover
                  key={schedule.id || idx}
                  schedule={schedule}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full h-auto min-h-[85px] p-2 text-xs justify-start relative border-2 hover:shadow-md transition-all cursor-pointer ${
                        schedule.examTypeId &&
                        roomClassifications[`exam_${schedule.examTypeId}`]
                          ? roomClassifications[`exam_${schedule.examTypeId}`]
                              .color ||
                            "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                      }`}
                      title="Click để xem chi tiết lịch khám"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        {/* Header row with exam type and time */}
                        <div className="flex items-center gap-2 w-full">
                          {/* Status dot */}
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              schedule.departmentHospitalId?.toString() ===
                              deptId
                                ? "bg-current opacity-80"
                                : "bg-orange-500"
                            }`}
                          />

                          {/* Exam Type and time info */}
                          <div className="flex items-center gap-1 flex-1">
                            {schedule.examTypeName && (
                              <>
                                <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-current/10 text-current">
                                  {schedule.examTypeName}
                                </span>
                                <span className="text-current/60 text-[10px]">
                                  •
                                </span>
                              </>
                            )}
                            <Clock className="w-3 h-3 text-current/70" />
                            <span className="text-current/80 text-[10px] font-medium">
                              {schedule.timeStart?.slice(0, 5) ||
                                currentSlotInfo?.startTime}{" "}
                              -{" "}
                              {schedule.timeEnd?.slice(0, 5) ||
                                currentSlotInfo?.endTime}
                            </span>
                          </div>

                          {/* Patient count */}
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-current/70" />
                            <span className="text-xs font-medium text-current">
                              {schedule.total || 0}
                            </span>
                          </div>
                        </div>

                        {/* Room row */}
                        <div className="flex items-center gap-2 w-full">
                          <MapPin className="w-3 h-3 text-current/70 flex-shrink-0" />
                          <span className="font-semibold text-current text-xs">
                            {schedule.roomName}
                          </span>

                          {/* Cross-department badge */}
                          {schedule.departmentHospitalId?.toString() !==
                            deptId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0.5 h-4 bg-orange-50 text-orange-600 border-orange-300 ml-auto"
                            >
                              {schedule.departmentName ||
                                `Khoa ${schedule.departmentHospitalId}`}
                            </Badge>
                          )}
                        </div>

                        {/* Doctor row */}
                        <div className="flex items-center gap-2 w-full">
                          <Stethoscope className="w-3 h-3 text-current/70 flex-shrink-0" />
                          <span className="text-current font-medium text-xs">
                            {schedule.doctorName}
                          </span>
                        </div>

                        {/* Specialty row (if available) */}
                        {schedule.specialtyName && (
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-current/60 rounded-full"></div>
                            </div>
                            <span className="text-current/80 text-xs">
                              {schedule.specialtyName}
                            </span>
                          </div>
                        )}

                        {/* Info icon in bottom right */}
                        <div className="absolute bottom-1 right-1">
                          <Info className="w-2.5 h-2.5 text-current/60" />
                        </div>
                      </div>
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Hiển thị thông tin các ô được nhân bản phòng gần đây */}
      {recentClonedRoomSlots && (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-purple-800">
                  Nhân bản phòng thành công!
                </div>
                <div className="text-xs text-purple-600">
                  {recentClonedRoomSlots.roomsCount} phòng →{" "}
                  {recentClonedRoomSlots.targetSlots.length} ca đích
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
              onClick={() => setRecentClonedRoomSlots(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Danh sách các slot được nhân bản với grid layout */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-purple-700 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Các vị trí đã nhân bản phòng:
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {recentClonedRoomSlots.targetSlots.map((targetSlotId, index) => {
                const slot = allTimeSlots.find((s) => s.id === targetSlotId);
                return (
                  <button
                    key={targetSlotId}
                    onClick={() => {
                      // ✅ Sử dụng hàm helper để hiển thị từng slot tuần tự
                      showClonedRoomSlotsSequentially([targetSlotId]);
                    }}
                    className="group p-2 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-md transition-all duration-200 hover:shadow-sm text-left relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-purple-800">
                          {slot
                            ? slot.slotName || slot.periodName || "Ca khám"
                            : targetSlotId}
                        </div>
                        {slot && (
                          <div className="text-xs text-purple-600">
                            {slot.startTime?.slice(0, 5)}-
                            {slot.endTime?.slice(0, 5)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action để xem tất cả các slot với improved styling */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs mt-3 border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200"
              onClick={() => {
                // ✅ Sử dụng hàm helper để hiển thị tuần tự
                showClonedRoomSlotsSequentially(
                  recentClonedRoomSlots.targetSlots
                );
              }}
            >
              <div className="flex items-center gap-1">
                <span>🎬</span>
                <span>
                  Xem tuần tự {recentClonedRoomSlots.targetSlots.length} vị trí
                </span>
                <div className="ml-1 text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                  {Math.floor(
                    (Date.now() - recentClonedRoomSlots.timestamp) / 1000
                  )}
                  s trước
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* ✅ Room Clone Dialog */}
      <RoomCloneDialog />
    </div>
  );
};
