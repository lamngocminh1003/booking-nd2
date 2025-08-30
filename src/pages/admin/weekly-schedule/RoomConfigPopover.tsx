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
  ArrowUpDown,
  Search,
  AlertTriangle,
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
  // ✅ Thêm departmentData prop
  departmentData?: {
    examTypes: any[];
    specialties: string[];
    department?: any;
  };
  // ✅ Thêm props cho đổi phòng
  allRooms?: any[]; // Danh sách tất cả phòng có thể chọn
  usedRooms?: Set<string>; // Danh sách phòng đã được sử dụng trong slot này
  // ✅ Thêm callback để thông báo room change
  onRoomSwapped?: (oldRoomId: string, newRoomId: string) => void;
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
  departmentData, // ✅ Nhận departmentData prop
  allRooms, // ✅ Nhận allRooms prop
  usedRooms, // ✅ Nhận usedRooms prop
  onRoomSwapped, // ✅ Nhận callback prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false); // ✅ State cho việc đổi phòng
  const [justSwapped, setJustSwapped] = useState(false); // ✅ State để hiển thị thông báo đổi phòng thành công
  const [isSwapping, setIsSwapping] = useState(false); // ✅ State cho loading khi đang đổi phòng
  const [searchQuery, setSearchQuery] = useState(""); // ✅ State cho search phòng
  const [duplicateWarning, setDuplicateWarning] = useState(""); // ✅ State cho cảnh báo trùng phòng
  const [localUsedRooms, setLocalUsedRooms] = useState<Set<string>>(new Set()); // ✅ Local tracking của used rooms

  // ✅ Sync local used rooms với prop (chỉ khi khởi tạo hoặc khi có thay đổi từ bên ngoài)
  const [lastSyncedUsedRooms, setLastSyncedUsedRooms] = useState<string>("");

  React.useEffect(() => {
    if (usedRooms) {
      const usedRoomsString = Array.from(usedRooms).sort().join(",");

      // ✅ Chỉ sync khi:
      // 1. Lần đầu khởi tạo (lastSyncedUsedRooms rỗng)
      // 2. UsedRooms thay đổi từ bên ngoài (không phải do swap của component này)
      if (
        !lastSyncedUsedRooms ||
        (usedRoomsString !== lastSyncedUsedRooms && !isSwapping)
      ) {
        console.log("🔄 Syncing localUsedRooms with usedRooms prop:", {
          usedRoomsArray: Array.from(usedRooms),
          localUsedRoomsArray: Array.from(localUsedRooms),
          lastSynced: lastSyncedUsedRooms,
          isSwapping,
        });

        setLocalUsedRooms(new Set(usedRooms));
        setLastSyncedUsedRooms(usedRoomsString);
      }
    }
  }, [usedRooms, lastSyncedUsedRooms, isSwapping]);

  // ✅ Reset room selector khi room thay đổi (sau khi đổi phòng thành công)
  React.useEffect(() => {
    console.log("🔄 Room change detected, resetting states:", {
      roomId: normalizeRoomId(room),
      roomCode: room.code,
      roomName: room.name,
      justSwapped,
    });

    setShowRoomSelector(false);
    setSearchQuery(""); // ✅ Reset search query
    setDuplicateWarning(""); // ✅ Reset duplicate warning

    // ✅ Hiển thị thông báo đổi phòng thành công trong 3 giây (tăng thời gian)
    if (justSwapped) {
      console.log("✅ Showing swap success notification for 3 seconds");
      const timer = setTimeout(() => {
        console.log("⏰ Hiding swap success notification");
        setJustSwapped(false);
      }, 3000); // Tăng từ 2000 lên 3000ms
      return () => clearTimeout(timer);
    }
  }, [room.id, room.code, room.name, justSwapped]);

  // ✅ Debug hook để theo dõi room data changes
  React.useEffect(() => {
    console.log("🏠 Room data changed:", {
      roomId: normalizeRoomId(room),
      roomCode: room.code,
      roomName: room.name,
      roomData: room,
      justSwapped,
      isSwapping,
    });
  }, [room, justSwapped, isSwapping]);

  // ✅ Debug hook để theo dõi usedRooms và localUsedRooms changes
  React.useEffect(() => {
    console.log("🔍 State changes:", {
      roomId: normalizeRoomId(room),
      roomCode: room.code,
      usedRoomsSize: usedRooms?.size || 0,
      usedRoomsArray: usedRooms ? Array.from(usedRooms) : [],
      localUsedRoomsSize: localUsedRooms.size,
      localUsedRoomsArray: Array.from(localUsedRooms),
      isSwapping,
      showRoomSelector,
    });
  }, [usedRooms, localUsedRooms, room, isSwapping, showRoomSelector]);

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

  // ✅ Auto-chọn examType nếu chỉ có 1 loại khám
  React.useEffect(() => {
    if (
      departmentData?.examTypes?.length === 1 &&
      !room.selectedExamType &&
      !room.examType
    ) {
      const singleExamType = departmentData.examTypes[0];
      handleUpdate("selectedExamType", singleExamType.name);
    }
  }, [departmentData?.examTypes, room.selectedExamType, room.examType]);

  // ✅ Lấy specialties của examType được chọn
  const availableSpecialtiesForSelectedExamType = useMemo(() => {
    if (!room.selectedExamType || !departmentData?.examTypes) {
      return []; // Không có specialty nào nếu chưa chọn examType
    }

    const selectedExamType = departmentData.examTypes.find(
      (et) => et.name === room.selectedExamType
    );

    if (!selectedExamType?.sepicalties) {
      return [];
    }

    // Trả về danh sách specialties đang enable của examType được chọn
    return selectedExamType.sepicalties
      .filter((s: any) => s.enable)
      .map((s: any) => s.name);
  }, [room.selectedExamType, departmentData]);

  // ✅ Auto-chọn specialty nếu chỉ có 1 chuyên khoa trong examType đã chọn
  React.useEffect(() => {
    if (
      room.selectedExamType &&
      availableSpecialtiesForSelectedExamType.length === 1 &&
      !room.selectedSpecialty &&
      !room.specialty
    ) {
      const singleSpecialty = availableSpecialtiesForSelectedExamType[0];
      handleUpdate("selectedSpecialty", singleSpecialty);
    }
  }, [
    availableSpecialtiesForSelectedExamType,
    room.selectedSpecialty,
    room.specialty,
    room.selectedExamType,
  ]);

  // ✅ Filtered doctors dựa trên specialty đã chọn
  const filteredDoctors = useMemo(() => {
    if (!room.selectedSpecialty || !getDoctorsBySpecialty) {
      return availableDoctors;
    }
    return getDoctorsBySpecialty(room.selectedSpecialty);
  }, [room.selectedSpecialty, availableDoctors, getDoctorsBySpecialty]);

  // ✅ Helper function để chuẩn hóa room ID
  const normalizeRoomId = (roomData: any): string => {
    // Ưu tiên id, sau đó code, cuối cùng fallback
    const id =
      roomData?.id?.toString() ||
      roomData?.roomId?.toString() ||
      roomData?.code?.toString() ||
      roomData?.roomCode?.toString() ||
      "";
    return id.trim();
  };

  // ✅ Danh sách phòng có thể đổi (không bao gồm phòng đang được sử dụng, NGOẠI TRỪ phòng hiện tại)
  const availableRoomsForSwap = useMemo(() => {
    if (!allRooms) return [];

    const currentRoomId = normalizeRoomId(room);

    return allRooms.filter((r) => {
      const candidateRoomId = normalizeRoomId(r);

      // Loại trừ phòng hiện tại (không thể đổi về chính nó)
      if (candidateRoomId === currentRoomId || !candidateRoomId) return false;

      // ✅ Kiểm tra trong cả usedRooms và localUsedRooms, NHƯNG bỏ qua phòng hiện tại
      const inUsedRooms = usedRooms && usedRooms.has(candidateRoomId);
      const inLocalUsedRooms = localUsedRooms.has(candidateRoomId);

      // ✅ Phòng này có thể chọn nếu nó không được sử dụng ở nơi khác
      if (inUsedRooms || inLocalUsedRooms) {
        return false; // Phòng này đang được sử dụng ở slot khác
      }

      return true;
    });
  }, [allRooms, room, usedRooms, localUsedRooms]);

  // ✅ Debug hook cho availableRoomsForSwap
  React.useEffect(() => {
    console.log("🏠 Available rooms for swap:", {
      roomId: normalizeRoomId(room),
      availableCount: availableRoomsForSwap.length,
      availableRooms: availableRoomsForSwap.map((r) => ({
        id: normalizeRoomId(r),
        code: r.code,
        name: r.name,
      })),
      usedRoomsSize: usedRooms?.size || 0,
      localUsedRoomsSize: localUsedRooms.size,
    });
  }, [availableRoomsForSwap, room, usedRooms, localUsedRooms]);

  // ✅ Filtered rooms dựa trên search query
  const filteredRoomsForSwap = useMemo(() => {
    if (!searchQuery.trim()) return availableRoomsForSwap;

    const query = searchQuery.toLowerCase().trim();
    return availableRoomsForSwap.filter((r) => {
      const roomCode = (r.code || "").toLowerCase();
      const roomName = (r.name || "").toLowerCase();
      const roomZone = (r.zoneName || "").toLowerCase();
      const roomClassification = (r.classification || "").toLowerCase();

      return (
        roomCode.includes(query) ||
        roomName.includes(query) ||
        roomZone.includes(query) ||
        roomClassification.includes(query)
      );
    });
  }, [availableRoomsForSwap, searchQuery]);

  // ✅ Kiểm tra phòng trùng lặp (bỏ qua phòng hiện tại vì nó sẽ được thay thế)
  const checkDuplicateRoom = (newRoomId: string) => {
    if (!newRoomId) return false;

    const currentRoomId = normalizeRoomId(room);
    const normalizedNewRoomId = newRoomId.trim();

    // ✅ Nếu đây là phòng hiện tại, không coi là trùng (mặc dù logic này đã được xử lý ở trên)
    if (normalizedNewRoomId === currentRoomId) return false;

    // ✅ Kiểm tra trong cả usedRooms và localUsedRooms
    const inUsedRooms = usedRooms && usedRooms.has(normalizedNewRoomId);
    const inLocalUsedRooms = localUsedRooms.has(normalizedNewRoomId);

    return inUsedRooms || inLocalUsedRooms;
  }; // ✅ Lấy thông tin phòng trùng (để hiển thị warning)
  const getDuplicateRoomInfo = (roomId: string) => {
    const duplicateRoom = allRooms?.find(
      (r) => (r.id?.toString() || r.code?.toString()) === roomId
    );
    return duplicateRoom
      ? `${duplicateRoom.code} - ${duplicateRoom.name}`
      : roomId;
  };

  // ✅ Handle đổi phòng với animation, feedback và kiểm tra trùng phòng
  const handleRoomSwap = async (newRoomId: string) => {
    // Clear previous warnings
    setDuplicateWarning("");

    // Tránh đổi về chính phòng hiện tại
    const currentRoomId = normalizeRoomId(room);
    const normalizedNewRoomId = newRoomId.trim();

    console.log("🔄 Attempting room swap:", {
      from: currentRoomId,
      to: normalizedNewRoomId,
      usedRoomsSize: usedRooms?.size || 0,
      localUsedRoomsSize: localUsedRooms.size,
      usedRoomsArray: usedRooms ? Array.from(usedRooms) : [],
      localUsedRoomsArray: Array.from(localUsedRooms),
    });

    if (
      normalizedNewRoomId === currentRoomId ||
      normalizedNewRoomId === "current"
    ) {
      console.log("⚠️ Trying to swap to same room, cancelling");
      setShowRoomSelector(false);
      return;
    }

    // ✅ Kiểm tra phòng trùng lặp TRƯỚC KHI thực hiện swap
    const duplicateCheck = checkDuplicateRoom(normalizedNewRoomId);
    console.log("🔍 Duplicate check result:", {
      newRoomId: normalizedNewRoomId,
      isDuplicate: duplicateCheck,
      inUsedRooms: usedRooms?.has(normalizedNewRoomId),
      inLocalUsedRooms: localUsedRooms.has(normalizedNewRoomId),
    });

    if (duplicateCheck) {
      const duplicateInfo = getDuplicateRoomInfo(normalizedNewRoomId);
      const warningMessage = `Phòng ${duplicateInfo} đã được sử dụng trong ca này!`;
      console.log("❌ Duplicate room detected:", warningMessage);
      setDuplicateWarning(warningMessage);
      return;
    }

    // Bắt đầu quá trình đổi phòng
    setIsSwapping(true);

    try {
      // Tìm phòng mới (cải thiện logic tìm kiếm)
      const newRoom = allRooms?.find((r) => {
        const candidateId = normalizeRoomId(r);
        return candidateId === normalizedNewRoomId;
      });

      if (!newRoom) {
        console.warn("Không tìm thấy phòng với ID:", normalizedNewRoomId);
        setShowRoomSelector(false);
        setIsSwapping(false);
        return;
      }

      console.log("Đổi từ phòng:", room.code, "→", newRoom.code);

      // Delay nhỏ để có animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // ✅ Lưu lại room ID cũ và mới để debug
      const oldRoomId = currentRoomId;

      // Update room với thông tin phòng mới, giữ lại các cấu hình khác
      updateRoomConfig(deptId, slotId, roomIndex, {
        id: newRoom.id,
        name: newRoom.name,
        code: newRoom.code,
        classification: newRoom.classification || room.classification,
        zoneId: newRoom.zoneId || room.zoneId,
        zoneName: newRoom.zoneName || room.zoneName,
        // Giữ lại các cấu hình đã chọn
        selectedExamType: room.selectedExamType,
        selectedSpecialty: room.selectedSpecialty,
        selectedDoctor: room.selectedDoctor,
        customStartTime: room.customStartTime,
        customEndTime: room.customEndTime,
        appointmentCount: room.appointmentCount,
        notes: room.notes,
      });

      // ✅ Cập nhật local used rooms ngay lập tức TRƯỚC KHI notify parent
      setLocalUsedRooms((prev) => {
        const newSet = new Set(prev);
        console.log("🔄 Updating localUsedRooms:", {
          before: Array.from(prev),
          removing: oldRoomId,
          adding: normalizedNewRoomId,
        });

        newSet.delete(oldRoomId); // Bỏ phòng cũ
        newSet.add(normalizedNewRoomId); // Thêm phòng mới

        console.log("✅ LocalUsedRooms updated:", {
          after: Array.from(newSet),
          size: newSet.size,
        });

        return newSet;
      });

      // ✅ Thông báo về việc swap room để component cha cập nhật usedRooms
      if (onRoomSwapped) {
        console.log("📞 Calling onRoomSwapped callback");
        onRoomSwapped(oldRoomId, normalizedNewRoomId);
      }

      // ✅ Reset state để quay về hiển thị thông tin phòng mới
      setShowRoomSelector(false);
      setJustSwapped(true);
      setSearchQuery(""); // Reset search

      // ✅ Cập nhật lastSyncedUsedRooms để tránh bị ghi đè
      setTimeout(() => {
        if (usedRooms) {
          const newUsedRoomsString = Array.from(usedRooms).sort().join(",");
          setLastSyncedUsedRooms(newUsedRoomsString);
          console.log(
            "📝 Updated lastSyncedUsedRooms after swap:",
            newUsedRoomsString
          );
        }
      }, 100);

      // ✅ Debug logging
      console.log("✅ Room swap completed:", {
        from: oldRoomId,
        to: normalizedNewRoomId,
        usedRoomsSize: usedRooms?.size || 0,
        localUsedRoomsSize: localUsedRooms.size,
        usedRoomsContainsOld: usedRooms?.has(oldRoomId),
        usedRoomsContainsNew: usedRooms?.has(normalizedNewRoomId),
      });
    } catch (error) {
      console.error("Lỗi khi đổi phòng:", error);
    } finally {
      setIsSwapping(false);
    }
  };

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

        <PopoverContent className="w-96 p-0" align="start">
          <div className="flex flex-col max-h-[600px]">
            {/* Header với gradient background */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Cấu hình phòng
                  </h4>
                  <p className="text-xs text-gray-500">
                    {room.code} - {room.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Main content với scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* ✅ Thông tin ca khám với card design */}
              {slotInfo && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900 text-sm">
                        {slotInfo.periodName} - {slotInfo.workSession}
                      </span>
                    </div>
                    {isCustomTime && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg font-medium"
                        onClick={handleResetToDefault}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock className="w-4 h-4" />
                      <span>
                        Giờ ca khám:{" "}
                        <strong>
                          {slotInfo.defaultStartTime} -{" "}
                          {slotInfo.defaultEndTime}
                        </strong>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {slotInfo.defaultMaxAppointments} lượt
                      </Badge>
                    </div>

                    {isCustomTime && (
                      <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-lg">
                        <Settings className="w-4 h-4" />
                        <span>
                          Giờ riêng:{" "}
                          <strong>
                            {currentTime.startTime} - {currentTime.endTime}
                          </strong>
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-orange-300"
                        >
                          {currentTime.maxAppointments} lượt
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Room Management Section - Redesigned */}
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Quản lý phòng khám
                  </Label>
                  <div className="flex items-center gap-2">
                    {allRooms && (
                      <Badge variant="secondary" className="text-xs">
                        {filteredRoomsForSwap.length}/
                        {availableRoomsForSwap.length} phòng
                        {searchQuery.trim() && " (đã lọc)"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Current Room Display */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
                    {/* Room Status Indicator */}
                    <div className="absolute top-3 right-3">
                      {justSwapped ? (
                        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Đã chuyển
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Đang sử dụng
                        </div>
                      )}
                    </div>

                    {/* Room Info */}
                    <div className="flex items-start gap-4 pr-20">
                      {/* Room Icon */}
                      <div className="relative">
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      </div>

                      {/* Room Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-gray-900 truncate">
                            {room.code} - {room.name}
                          </h3>
                        </div>

                        {/* Room Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {room.zoneName && (
                            <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span> {room.zoneName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                            <Users className="w-3 h-3" />
                            <span>{currentTime.maxAppointments} lượt/ca</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span>
                              {currentTime.startTime}-{currentTime.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-200">
                      {allRooms && allRooms.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSwapping}
                            className={`h-9 px-4 text-xs font-medium transition-all duration-200 ${
                              showRoomSelector
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                            } ${
                              isSwapping ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() =>
                              setShowRoomSelector(!showRoomSelector)
                            }
                          >
                            {isSwapping ? (
                              <>
                                <div className="w-3.5 h-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Đang chuyển...
                              </>
                            ) : (
                              <>
                                <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                                {showRoomSelector
                                  ? "Đang chọn phòng"
                                  : "Chuyển phòng"}
                              </>
                            )}
                          </Button>

                          {showRoomSelector && !isSwapping && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 text-xs text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                  setShowRoomSelector(false);
                                  setSearchQuery("");
                                  setDuplicateWarning("");
                                }}
                              >
                                Hủy
                              </Button>
                              {searchQuery.trim() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 px-3 text-xs text-blue-500 hover:text-blue-700"
                                  onClick={() => setSearchQuery("")}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Xóa lọc
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {!allRooms && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                          Không có danh sách phòng để chuyển
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Selector - Enhanced Design */}
                {showRoomSelector && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Selector Header */}
                    <div
                      className={`rounded-xl p-4 text-white transition-all duration-300 ${
                        isSwapping
                          ? "bg-gradient-to-r from-indigo-400 to-purple-500"
                          : "bg-gradient-to-r from-indigo-500 to-purple-600"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {isSwapping ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {isSwapping
                              ? "Đang chuyển phòng..."
                              : "Chọn phòng mới"}
                          </h4>
                          <p className="text-xs text-indigo-100">
                            {isSwapping
                              ? "Vui lòng chờ trong giây lát..."
                              : "Tìm và chọn phòng phù hợp từ danh sách bên dưới"}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>
                            {searchQuery.trim()
                              ? `${filteredRoomsForSwap.length}/${availableRoomsForSwap.length} phòng`
                              : `${availableRoomsForSwap.length} phòng khả dụng`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>
                            {usedRooms ? usedRooms.size - 1 : 0} phòng đang sử
                            dụng
                          </span>
                        </div>
                        {searchQuery.trim() && (
                          <div className="flex items-center gap-1">
                            <Search className="w-2 h-2 text-blue-300" />
                            <span>Đang lọc</span>
                          </div>
                        )}
                        {isSwapping && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span>Đang xử lý...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room List or Selector */}
                    {availableRoomsForSwap.length > 0 ? (
                      <div className="space-y-3">
                        {/* Search Box */}
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Search className="w-4 h-4 text-gray-400" />
                          </div>
                          <Input
                            type="text"
                            placeholder="Tìm kiếm phòng (mã phòng, tên, khu vực...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          {searchQuery.trim() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => setSearchQuery("")}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Duplicate Warning */}
                        {duplicateWarning && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in slide-in-from-top-1 duration-200">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-red-800">
                                  Phòng đã được sử dụng!
                                </div>
                                <div className="text-xs text-red-600 mt-1">
                                  {duplicateWarning}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-red-400 hover:text-red-600 ml-auto"
                                onClick={() => setDuplicateWarning("")}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Search Results Info */}
                        {searchQuery.trim() && (
                          <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <span>
                              {filteredRoomsForSwap.length > 0
                                ? `Tìm thấy ${filteredRoomsForSwap.length} phòng phù hợp`
                                : "Không tìm thấy phòng phù hợp"}
                            </span>
                            {searchQuery.trim() && (
                              <Badge variant="outline" className="text-xs">
                                "{searchQuery.trim()}"
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Room Grid */}
                        <div className="grid gap-3 max-h-60 overflow-y-auto">
                          {filteredRoomsForSwap.length > 0 ? (
                            filteredRoomsForSwap.map((r) => {
                              const roomId = normalizeRoomId(r);
                              const isCurrentlySwapping = isSwapping && roomId;
                              const isDuplicate = checkDuplicateRoom(roomId);

                              // ✅ Debug logging để xem tại sao vẫn có duplicate
                              if (isDuplicate) {
                                console.log(
                                  "⚠️ Room marked as duplicate in render:",
                                  {
                                    roomId,
                                    roomCode: r.code,
                                    inUsedRooms: usedRooms?.has(roomId),
                                    inLocalUsedRooms:
                                      localUsedRooms.has(roomId),
                                    currentRoomId: normalizeRoomId(room),
                                    usedRoomsArray: usedRooms
                                      ? Array.from(usedRooms)
                                      : [],
                                    localUsedRoomsArray:
                                      Array.from(localUsedRooms),
                                  }
                                );
                              }

                              return (
                                <button
                                  key={r.id || r.code}
                                  onClick={() => handleRoomSwap(roomId)}
                                  disabled={isSwapping || isDuplicate}
                                  className={`group relative bg-white border-2 rounded-xl p-4 transition-all duration-200 text-left ${
                                    isDuplicate
                                      ? "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
                                      : isSwapping
                                      ? "border-gray-200 cursor-not-allowed opacity-50"
                                      : "border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                                  } ${
                                    isCurrentlySwapping
                                      ? "ring-2 ring-indigo-500 border-indigo-300"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Room Type Indicator */}
                                    <div
                                      className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 relative ${
                                        isDuplicate
                                          ? "bg-red-400"
                                          : getRoomStyle(r.classification)
                                      }`}
                                    >
                                      {isCurrentlySwapping ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      ) : isDuplicate ? (
                                        <AlertTriangle className="w-5 h-5 text-white" />
                                      ) : (
                                        <MapPin className="w-5 h-5 text-white" />
                                      )}
                                    </div>

                                    {/* Room Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={`font-semibold text-sm truncate ${
                                            isDuplicate
                                              ? "text-red-700"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {r.code}
                                        </span>
                                        {r.classification && (
                                          <Badge
                                            variant="secondary"
                                            className={`text-xs shrink-0 ${
                                              isDuplicate
                                                ? "bg-red-100 text-red-700"
                                                : ""
                                            }`}
                                          >
                                            {r.classification}
                                          </Badge>
                                        )}
                                        {isDuplicate && (
                                          <Badge className="text-xs shrink-0 bg-red-500 text-white">
                                            Đã sử dụng
                                          </Badge>
                                        )}
                                        {isCurrentlySwapping && (
                                          <Badge className="text-xs shrink-0 bg-indigo-500">
                                            Đang chuyển...
                                          </Badge>
                                        )}
                                      </div>
                                      <p
                                        className={`text-xs truncate ${
                                          isDuplicate
                                            ? "text-red-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {r.name || "Đang cập nhật..."}
                                      </p>
                                      {r.zoneName && (
                                        <p
                                          className={`text-xs mt-1 ${
                                            isDuplicate
                                              ? "text-red-500"
                                              : "text-purple-600"
                                          }`}
                                        >
                                          Khu {r.zoneName}
                                        </p>
                                      )}
                                    </div>

                                    {/* Selection Indicator */}
                                    <div
                                      className={`transition-opacity ${
                                        isDuplicate || isSwapping
                                          ? "opacity-50"
                                          : "opacity-0 group-hover:opacity-100"
                                      }`}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          isDuplicate
                                            ? "bg-red-500"
                                            : "bg-indigo-500"
                                        }`}
                                      >
                                        {isCurrentlySwapping ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : isDuplicate ? (
                                          <X className="w-4 h-4 text-white" />
                                        ) : (
                                          <ArrowUpDown className="w-4 h-4 text-white" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          ) : searchQuery.trim() ? (
                            /* No Search Results */
                            <div className="text-center py-6 px-4 text-gray-500">
                              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <h4 className="font-medium text-sm mb-1">
                                Không tìm thấy phòng
                              </h4>
                              <p className="text-xs">
                                Không có phòng nào phù hợp với từ khóa "
                                {searchQuery.trim()}"
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-3 h-8 text-xs"
                                onClick={() => setSearchQuery("")}
                              >
                                Xóa bộ lọc
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MapPin className="w-8 h-8 text-amber-600" />
                        </div>
                        <h4 className="font-semibold text-amber-800 mb-2">
                          Không có phòng khả dụng
                        </h4>
                        <p className="text-sm text-amber-700 mb-4">
                          Tất cả phòng khác đã được sử dụng trong ca làm việc
                          này
                        </p>
                        <div className="flex flex-col gap-2 text-xs text-amber-600">
                          <div className="flex items-center justify-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>Tổng {allRooms?.length || 0} phòng</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>
                              {usedRooms ? usedRooms.size : 0} phòng đang được
                              sử dụng
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Selection với card design */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Bác sĩ phụ trách
                </Label>
                <Select
                  value={room.selectedDoctor || room.doctor || "none"}
                  onValueChange={(value) =>
                    handleUpdate(
                      "selectedDoctor",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Chọn bác sĩ..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-sm min-w-[280px]">
                    <SelectItem value="none">
                      <div className="flex items-center gap-2 text-gray-500 w-full py-1">
                        <div className="w-3 h-3 border border-gray-300 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">Không chọn bác sĩ</span>
                      </div>
                    </SelectItem>
                    {availableDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        <div className="flex items-start gap-2 w-full py-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {doctor.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {doctor.specialty}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ ExamType Selection với card design */}
              {departmentData && departmentData.examTypes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded text-white flex items-center justify-center text-xs">
                        🩺
                      </div>
                      Loại khám
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {departmentData.examTypes.length} loại
                      </Badge>
                      {departmentData.examTypes.length === 1 &&
                        room.selectedExamType && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                          >
                            Auto
                          </Badge>
                        )}
                    </div>
                  </div>

                  <Select
                    value={room.selectedExamType || room.examType || "none"}
                    onValueChange={(value) => {
                      const selectedExamType = value === "none" ? "" : value;
                      handleUpdate("selectedExamType", selectedExamType);
                      // ✅ Clear specialty khi thay đổi examType
                      handleUpdate("selectedSpecialty", "");
                    }}
                    disabled={departmentData.examTypes.length === 1} // ✅ Disable nếu chỉ có 1 loại
                  >
                    <SelectTrigger
                      className={`h-10 ${
                        departmentData.examTypes.length === 1
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white"
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          departmentData.examTypes.length === 1
                            ? "Đã tự động chọn loại khám duy nhất"
                            : "Chọn loại khám..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-w-sm min-w-[280px]">
                      <SelectItem value="none">
                        <div className="flex items-center gap-2 text-gray-500 w-full py-1">
                          <div className="w-3 h-3 border border-gray-300 rounded flex-shrink-0"></div>
                          <span className="text-sm">Không chọn loại khám</span>
                        </div>
                      </SelectItem>
                      {departmentData.examTypes.map((examType) => (
                        <SelectItem key={examType.id} value={examType.name}>
                          <div className="flex items-start gap-2 w-full py-1">
                            <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0 mt-0.5"></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {examType.name}
                              </div>
                              {examType.description &&
                                examType.description !== examType.name && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {examType.description}
                                  </div>
                                )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Hiển thị thông tin specialties với design đẹp */}
                  {room.selectedExamType && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          Loại khám này có{" "}
                          {availableSpecialtiesForSelectedExamType.length}{" "}
                          chuyên khoa
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specialty Selection với card design */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded text-white flex items-center justify-center text-xs">
                      ⚕️
                    </div>
                    Chuyên khoa
                  </Label>
                  <div className="flex items-center gap-2">
                    {room.selectedExamType ? (
                      <Badge variant="outline" className="text-xs">
                        {availableSpecialtiesForSelectedExamType.length} khoa
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Chọn loại khám trước
                      </Badge>
                    )}
                    {availableSpecialtiesForSelectedExamType.length === 1 &&
                      room.selectedSpecialty && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-50 text-purple-600 border-purple-200"
                        >
                          Auto
                        </Badge>
                      )}
                  </div>
                </div>

                <Select
                  value={room.selectedSpecialty || room.specialty || "none"}
                  onValueChange={(value) =>
                    handleUpdate(
                      "selectedSpecialty",
                      value === "none" ? "" : value
                    )
                  }
                  disabled={
                    !room.selectedExamType ||
                    availableSpecialtiesForSelectedExamType.length === 1
                  } // ✅ Disable nếu chưa chọn examType hoặc chỉ có 1 specialty
                >
                  <SelectTrigger
                    className={`h-10 ${
                      availableSpecialtiesForSelectedExamType.length === 1
                        ? "bg-purple-50 border-purple-200"
                        : !room.selectedExamType
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white"
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        !room.selectedExamType
                          ? "Vui lòng chọn loại khám trước"
                          : availableSpecialtiesForSelectedExamType.length === 0
                          ? "Loại khám này không có chuyên khoa"
                          : availableSpecialtiesForSelectedExamType.length === 1
                          ? "Đã tự động chọn chuyên khoa duy nhất"
                          : "Chọn chuyên khoa..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-sm min-w-[250px]">
                    <SelectItem value="none">
                      <div className="flex items-center gap-2 text-gray-500 w-full py-1">
                        <div className="w-3 h-3 border border-gray-300 rounded flex-shrink-0"></div>
                        <span className="text-sm">Không chọn chuyên khoa</span>
                      </div>
                    </SelectItem>
                    {/* ✅ Chỉ hiển thị specialties của examType đã chọn */}
                    {availableSpecialtiesForSelectedExamType.map(
                      (specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          <div className="flex items-center gap-2 w-full py-1">
                            <div className="w-3 h-3 bg-purple-500 rounded flex-shrink-0"></div>
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {specialty}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                {/* Thông báo trạng thái với design đẹp */}
                {!room.selectedExamType && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-amber-800">
                          Cần chọn loại khám trước
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          Vui lòng chọn loại khám để xem danh sách chuyên khoa
                          tương ứng
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {room.selectedExamType &&
                  availableSpecialtiesForSelectedExamType.length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Không có chuyên khoa
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Loại khám <strong>{room.selectedExamType}</strong>{" "}
                            hiện không có chuyên khoa nào
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* ✅ Time Configuration với card design */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Cấu hình thời gian
                    {isCustomTime && (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-300 text-orange-600"
                      >
                        Tùy chỉnh
                      </Badge>
                    )}
                  </Label>
                  {isCustomTime && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg font-medium"
                      onClick={handleResetToDefault}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      Giờ bắt đầu
                    </Label>
                    <Input
                      type="time"
                      value={currentTime.startTime}
                      onChange={(e) =>
                        handleUpdate("customStartTime", e.target.value)
                      }
                      className={`h-10 ${
                        isCustomTime
                          ? "border-orange-300 bg-orange-50"
                          : "bg-white"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      Giờ kết thúc
                    </Label>
                    <Input
                      type="time"
                      value={currentTime.endTime}
                      onChange={(e) =>
                        handleUpdate("customEndTime", e.target.value)
                      }
                      className={`h-10 ${
                        isCustomTime
                          ? "border-orange-300 bg-orange-50"
                          : "bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Số lượt khám */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Số lượt khám tối đa
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
                    className={`h-10 ${
                      isCustomTime
                        ? "border-orange-300 bg-orange-50"
                        : "bg-white"
                    }`}
                  />
                  {slotInfo && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                      💡 Mặc định cho ca này:{" "}
                      <strong>{slotInfo.defaultMaxAppointments} lượt</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes với card design */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Ghi chú thêm
                </Label>
                <Input
                  value={room.notes || ""}
                  onChange={(e) => handleUpdate("notes", e.target.value)}
                  placeholder="Thêm ghi chú cho phòng này..."
                  className="h-10 bg-white"
                />
              </div>
            </div>

            {/* Action Buttons - Sticky footer */}
            <div className="border-t bg-gray-50/50 p-4">
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 bg-white hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-9 px-4 hover:bg-red-600"
                  onClick={handleRemove}
                >
                  <X className="w-3 h-3 mr-2" />
                  Xóa phòng
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
