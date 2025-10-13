import React, { useState, useMemo, useCallback } from "react";
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
  AlertCircle,
  Building,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchDoctors } from "@/store/slices/doctorSlice";

interface RoomConfigPopoverProps {
  room: any;
  roomIndex: number;
  deptId: string;
  slotId: string;
  availableSpecialties: string[];
  availableDoctors: any[];
  roomClassifications: any;
  shiftDefaults: any;
  timeSlots: any[];
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
  getConflictInfo?: (
    room: any,
    roomId: string
  ) => {
    roomDoctors: any[];
    hasDoctorConflict: boolean;
    hasRoomConflict: boolean;
    getDisabledReason: () => string;
  };
  hasChanges: boolean;
  getDoctorsBySpecialty: (specialty: string) => any[];
  departmentData?: {
    examTypes: any[];
    specialties: string[];
    department?: any;
  };
  allRooms?: any[];
  usedRooms?: Set<string>;
  onRoomSwapped?: (oldRoomId: string, newRoomId: string) => void;
  allCellClinicSchedules?: any[];
  cellClinicSchedules?: any[];
  onRoomRemoved?: (roomId: string) => void;
}

export const RoomConfigPopover: React.FC<RoomConfigPopoverProps> = React.memo(
  ({
    room,
    roomIndex,
    deptId,
    slotId,
    getConflictInfo,
    roomClassifications,
    shiftDefaults,
    timeSlots,
    updateRoomConfig,
    removeRoomFromShift,
    getRoomStyle,
    hasChanges,
    departmentData,
    allRooms,
    usedRooms,
    onRoomSwapped,
    allCellClinicSchedules = [],
    onRoomRemoved,
  }) => {
    // ✅ Redux hooks
    const dispatch = useAppDispatch();
    const { list: doctorsFromRedux, loading: doctorsLoading } = useAppSelector(
      (state) => state.doctor
    );

    // ✅ States
    const [isOpen, setIsOpen] = useState(false);
    const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
    const [showRoomSelector, setShowRoomSelector] = useState(false);
    const [justSwapped, setJustSwapped] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [duplicateWarning, setDuplicateWarning] = useState("");
    const [localUsedRooms, setLocalUsedRooms] = useState<Set<string>>(
      new Set()
    );
    const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showValidationWarning, setShowValidationWarning] = useState(false);
    const [lastSyncedUsedRooms, setLastSyncedUsedRooms] = useState<string>("");

    // ✅ Effects
    React.useEffect(() => {
      if (doctorsFromRedux.length === 0 && !doctorsLoading) {
        dispatch(fetchDoctors());
      }
    }, [dispatch, doctorsFromRedux.length, doctorsLoading]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest("[data-doctor-search]")) {
          setShowDoctorDropdown(false);
        }
      };

      if (showDoctorDropdown) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [showDoctorDropdown]);

    React.useEffect(() => {
      if (usedRooms) {
        const usedRoomsString = Array.from(usedRooms).sort().join(",");
        if (
          !lastSyncedUsedRooms ||
          (usedRoomsString !== lastSyncedUsedRooms && !isSwapping)
        ) {
          setLocalUsedRooms(new Set(usedRooms));
          setLastSyncedUsedRooms(usedRoomsString);
        }
      }
    }, [usedRooms, lastSyncedUsedRooms, isSwapping]);

    React.useEffect(() => {
      setShowRoomSelector(false);
      setSearchQuery("");
      setDuplicateWarning("");

      if (justSwapped) {
        const timer = setTimeout(() => {
          setJustSwapped(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [room.id, room.code, room.name, justSwapped]);

    // ✅ Computed values
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

    const isCustomTime = useMemo(() => {
      if (!slotInfo) return false;

      const hasCustomStart =
        room.customStartTime &&
        room.customStartTime !== "" &&
        room.customStartTime !== slotInfo.defaultStartTime;
      const hasCustomEnd =
        room.customEndTime &&
        room.customEndTime !== "" &&
        room.customEndTime !== slotInfo.defaultEndTime;
      const hasCustomMax =
        room.appointmentCount &&
        room.appointmentCount !== slotInfo.defaultMaxAppointments;

      return hasCustomStart || hasCustomEnd || hasCustomMax;
    }, [room, slotInfo]);

    const getCurrentTime = () => {
      const startTime =
        room.customStartTime && room.customStartTime !== ""
          ? room.customStartTime
          : slotInfo?.defaultStartTime || "07:30";

      const endTime =
        room.customEndTime && room.customEndTime !== ""
          ? room.customEndTime
          : slotInfo?.defaultEndTime || "11:00";

      const maxAppointments =
        room.appointmentCount ||
        room.maxAppointments ||
        slotInfo?.defaultMaxAppointments ||
        10;

      return { startTime, endTime, maxAppointments };
    };

    const currentTime = getCurrentTime();

    const availableSpecialtiesForSelectedExamType = useMemo(() => {
      if (!room.selectedExamType || !departmentData?.examTypes) {
        return [];
      }

      const selectedExamType = departmentData.examTypes.find(
        (et) => et.name === room.selectedExamType
      );

      if (!selectedExamType?.sepicalties) {
        return [];
      }

      return selectedExamType.sepicalties
        .filter((s: any) => s.enable)
        .map((s: any) => s.name);
    }, [room.selectedExamType, departmentData]);

    // ✅ Helper functions
    const getHoldSlots = (roomData: any) =>
      roomData.holdSlot || roomData.holdSlots || 0;

    const normalizeRoomId = (roomData: any): string => {
      const id =
        roomData?.id?.toString() ||
        roomData?.roomId?.toString() ||
        roomData?.code?.toString() ||
        roomData?.roomCode?.toString() ||
        "";
      return id.trim();
    };

    const isValidTimeSlot = (timeString: string): boolean => {
      if (!timeString) return false;
      const [hours, minutes] = timeString.split(":").map(Number);
      return minutes === 0 || minutes === 30;
    };

    const roundToNearestHalfHour = (timeString: string): string => {
      if (!timeString) return timeString;

      const [hours, minutes] = timeString.split(":").map(Number);
      const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
      const adjustedHours = minutes >= 45 ? hours + 1 : hours;
      const finalHours = adjustedHours >= 24 ? 0 : adjustedHours;

      return `${finalHours.toString().padStart(2, "0")}:${roundedMinutes
        .toString()
        .padStart(2, "0")}`;
    };

    const checkDuplicateRoom = (newRoomId: string) => {
      if (!newRoomId) return false;

      const currentRoomId = normalizeRoomId(room);
      const normalizedNewRoomId = newRoomId.trim();

      if (normalizedNewRoomId === currentRoomId) return false;

      const inUsedRooms = usedRooms && usedRooms.has(normalizedNewRoomId);
      const inLocalUsedRooms = localUsedRooms.has(normalizedNewRoomId);

      return inUsedRooms || inLocalUsedRooms;
    };

    const getClassificationStyle = () => {
      if (
        room.classification &&
        roomClassifications &&
        roomClassifications[room.classification]
      ) {
        const classification = roomClassifications[room.classification];
        return classification.color;
      }

      return getRoomStyle(roomClassifications[room.classification].color);
    };

    const getClassificationName = () => {
      if (
        room.classification &&
        roomClassifications &&
        roomClassifications[room.classification]
      ) {
        const classification = roomClassifications[room.classification];
        return classification.name || classification.originalName;
      }
      return null;
    };

    // ✅ Doctor conflict checking
    const getDoctorConflictInfo = useCallback(
      (doctor: any) => {
        if (!allCellClinicSchedules || allCellClinicSchedules.length === 0) {
          return {
            hasConflict: false,
            isCurrentDoctor: false,
            conflictDetails: {
              sameDepConflicts: [],
              otherDepConflicts: [],
              totalConflicts: 0,
            },
          };
        }

        const doctorCode =
          doctor.doctor_IdEmployee_Postgresql || doctor.code || doctor.id;
        const isCurrentDoctor =
          room.selectedDoctor === doctorCode || room.doctor === doctorCode;

        const doctorSchedules = allCellClinicSchedules.filter((schedule) => {
          const scheduleCode =
            schedule.doctor_IdEmployee_Postgresql ||
            schedule.doctorCode ||
            schedule.doctorId;
          return scheduleCode === doctorCode;
        });

        if (doctorSchedules.length === 0) {
          return {
            hasConflict: false,
            isCurrentDoctor,
            conflictDetails: {
              sameDepConflicts: [],
              otherDepConflicts: [],
              totalConflicts: 0,
            },
          };
        }

        const sameDepConflicts = doctorSchedules.filter(
          (s) => s.departmentHospitalId?.toString() === deptId
        );
        const otherDepConflicts = doctorSchedules.filter(
          (s) => s.departmentHospitalId?.toString() !== deptId
        );

        return {
          hasConflict: doctorSchedules.length > 0,
          isCurrentDoctor,
          conflictDetails: {
            sameDepConflicts,
            otherDepConflicts,
            totalConflicts: doctorSchedules.length,
            schedules: doctorSchedules,
          },
        };
      },
      [allCellClinicSchedules, deptId, room.selectedDoctor, room.doctor]
    );

    // ✅ Filtered doctors
    const filteredDoctors = useMemo(() => {
      let doctors = doctorsFromRedux || [];

      if (doctorSearchQuery.trim()) {
        const query = doctorSearchQuery.toLowerCase().trim();
        doctors = doctors.filter((doctor) => {
          const doctorName = (
            doctor.name ||
            doctor.fullName ||
            ""
          ).toLowerCase();
          const doctorCode = (
            doctor.doctor_IdEmployee_Postgresql ||
            doctor.code ||
            ""
          ).toLowerCase();
          return doctorName.includes(query) || doctorCode.includes(query);
        });
      }

      return doctors.map((doctor) => {
        const conflictInfo = getDoctorConflictInfo(doctor);
        return {
          ...doctor,
          conflictInfo,
        };
      });
    }, [doctorsFromRedux, doctorSearchQuery, getDoctorConflictInfo]);

    // ✅ Room processing for swap
    const availableRoomsForSwap = useMemo(() => {
      if (!allRooms) return [];

      const currentRoomId = normalizeRoomId(room);

      return allRooms.filter((r) => {
        const candidateRoomId = normalizeRoomId(r);
        if (candidateRoomId === currentRoomId || !candidateRoomId) return false;

        const inUsedRooms = usedRooms && usedRooms.has(candidateRoomId);
        const inLocalUsedRooms = localUsedRooms.has(candidateRoomId);

        return !(inUsedRooms || inLocalUsedRooms);
      });
    }, [allRooms, room, usedRooms, localUsedRooms]);

    const processedRoomsForSwap = useMemo(() => {
      return availableRoomsForSwap.map((r) => {
        const roomId = normalizeRoomId(r);

        let conflictInfo = null;
        let hasAdvancedConflict = false;
        let disabledReason = "";

        if (getConflictInfo) {
          try {
            conflictInfo = getConflictInfo(r, roomId);
            hasAdvancedConflict =
              conflictInfo.hasRoomConflict || conflictInfo.hasDoctorConflict;
            disabledReason = conflictInfo.getDisabledReason();
          } catch (error) {
            console.error(
              "Error getting conflict info for room:",
              roomId,
              error
            );
          }
        }

        const isDuplicate = checkDuplicateRoom(roomId);

        return {
          ...r,
          roomId,
          conflictInfo,
          hasAdvancedConflict,
          disabledReason,
          isDuplicate,
          isDisabled: isDuplicate || hasAdvancedConflict,
          canSelect: !isDuplicate && !hasAdvancedConflict,
        };
      });
    }, [availableRoomsForSwap, getConflictInfo, checkDuplicateRoom]);

    const filteredRoomsForSwap = useMemo(() => {
      let rooms = processedRoomsForSwap;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        rooms = rooms.filter((r) => {
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
      }

      return rooms;
    }, [processedRoomsForSwap, searchQuery]);

    // ✅ Handlers
    const handleUpdate = useCallback(
      (field: string, value: any) => {
        updateRoomConfig(deptId, slotId, roomIndex, {
          [field]: value,
        });
      },
      [updateRoomConfig, deptId, slotId, roomIndex, showValidationWarning]
    );

    const handleRemove = useCallback(() => {
      if (removeRoomFromShift && room) {
        const roomId = normalizeRoomId(room);

        removeRoomFromShift(deptId, slotId, roomIndex);

        if (onRoomRemoved && roomId) {
          onRoomRemoved(roomId);
        }

        setIsOpen(false);
      }
    }, [removeRoomFromShift, room, deptId, slotId, roomIndex, onRoomRemoved]);

    const handleResetToDefault = useCallback(() => {
      if (slotInfo) {
        handleUpdate("customStartTime", slotInfo.defaultStartTime);
        handleUpdate("customEndTime", slotInfo.defaultEndTime);
        handleUpdate("appointmentCount", slotInfo.defaultMaxAppointments);
      }
    }, [slotInfo, handleUpdate]);

    const validateRoomConfig = useCallback(() => {
      const errors: string[] = [];

      if (!room.selectedExamType && !room.examType) {
        errors.push("Vui lòng chọn loại khám");
      }

      if (
        room.selectedExamType &&
        availableSpecialtiesForSelectedExamType.length > 0
      ) {
        if (!room.selectedSpecialty && !room.specialty) {
          errors.push("Vui lòng chọn chuyên khoa");
        }
      }

      const selectedDoctorValue =
        room.selectedDoctor && room.selectedDoctor.trim();
      const doctorValue = room.doctor && room.doctor.trim();
      const doctorFromOtherFields =
        room.doctorName || room.doctorCode || room.doctorId;

      if (!selectedDoctorValue && !doctorValue && !doctorFromOtherFields) {
        errors.push("Vui lòng chọn bác sĩ phụ trách");
      }

      const startTime = currentTime.startTime;
      const endTime = currentTime.endTime;

      if (startTime && endTime) {
        if (startTime >= endTime) {
          errors.push("Giờ kết thúc phải sau giờ bắt đầu");
        }

        if (!isValidTimeSlot(startTime)) {
          errors.push(
            "Thời gian bắt đầu phải là bội số của 30 phút (ví dụ: 07:00, 07:30, 08:00...)"
          );
        }

        if (!isValidTimeSlot(endTime)) {
          errors.push(
            "Thời gian kết thúc phải là bội số của 30 phút (ví dụ: 11:00, 11:30, 12:00...)"
          );
        }
      }

      if (currentTime.maxAppointments < 1) {
        errors.push("Số lượt khám phải lớn hơn 0");
      }

      const holdSlots = getHoldSlots(room);
      if (holdSlots >= currentTime.maxAppointments) {
        errors.push("Số giữ chỗ phải nhỏ hơn số lượt khám");
      }

      return errors;
    }, [
      room,
      currentTime,
      availableSpecialtiesForSelectedExamType,
      getHoldSlots,
    ]);

    const handleClose = useCallback(() => {
      const errors = validateRoomConfig();

      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationWarning(true);
        setTimeout(() => {
          setShowValidationWarning(false);
        }, 5000);
        return false;
      }

      setIsOpen(false);
      return true;
    }, [validateRoomConfig]);

    const handleRoomSwap = async (newRoom: any) => {
      if (!newRoom || isSwapping) return;

      const newRoomId = newRoom.roomId || normalizeRoomId(newRoom);
      const oldRoomId = normalizeRoomId(room);

      if (newRoomId === oldRoomId) {
        setShowRoomSelector(false);
        return;
      }

      if (newRoom.isDisabled) {
        setDuplicateWarning(
          newRoom.disabledReason || "Phòng này không thể chọn"
        );
        return;
      }

      setIsSwapping(true);
      setDuplicateWarning("");

      try {
        const updates = {
          id: newRoom.id || newRoom.roomId,
          name: newRoom.name || newRoom.roomName,
          code: newRoom.code || newRoom.roomCode,
          classification: newRoom.classification || room.classification,
          specialties: newRoom.specialties || room.specialties,
          zoneId: newRoom.zoneId || room.zoneId,
          zoneName: newRoom.zoneName || room.zoneName,
          selectedExamType: room.selectedExamType,
          selectedSpecialty: room.selectedSpecialty,
          selectedDoctor: room.selectedDoctor,
          customStartTime: room.customStartTime,
          customEndTime: room.customEndTime,
          appointmentCount: room.appointmentCount,
          appointmentDuration: room.appointmentDuration,
          holdSlot: getHoldSlots(room),
          notes: room.notes,
        };

        updateRoomConfig(deptId, slotId, roomIndex, updates);

        setLocalUsedRooms((prev) => {
          const newSet = new Set(prev);
          newSet.delete(oldRoomId);
          newSet.add(newRoomId);
          return newSet;
        });

        if (onRoomSwapped) {
          onRoomSwapped(oldRoomId, newRoomId);
        }

        setShowRoomSelector(false);
        setJustSwapped(true);
        setSearchQuery("");

        setTimeout(() => {
          if (usedRooms) {
            const newUsedRoomsString = Array.from(usedRooms).sort().join(",");
            setLastSyncedUsedRooms(newUsedRoomsString);
          }
        }, 100);
      } catch (error) {
        console.error("Error swapping room:", error);
        setDuplicateWarning("Có lỗi xảy ra khi chuyển phòng");
      } finally {
        setIsSwapping(false);
      }
    };

    // ✅ Auto-effects
    React.useEffect(() => {
      if (
        departmentData?.examTypes?.length === 1 &&
        !room.selectedExamType &&
        !room.examType
      ) {
        const singleExamType = departmentData.examTypes[0];
        handleUpdate("selectedExamType", singleExamType.name);
      }
    }, [
      departmentData?.examTypes,
      room.selectedExamType,
      room.examType,
      handleUpdate,
    ]);

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
      handleUpdate,
    ]);

    React.useEffect(() => {
      if (
        room.selectedExamType &&
        departmentData?.examTypes &&
        roomClassifications
      ) {
        const selectedExamType = departmentData.examTypes.find(
          (et) => et.name === room.selectedExamType
        );

        if (selectedExamType?.id) {
          const classificationKey = `exam_${selectedExamType.id}`;
          const classification = roomClassifications[classificationKey];

          if (classification) {
            handleUpdate("classification", classificationKey);
          }
        }
      }
    }, [
      room.selectedExamType,
      departmentData?.examTypes,
      roomClassifications,
      handleUpdate,
    ]);

    return (
      <>
        <div className="relative">
          {isSavedSuccessfully ? (
            <Button
              variant="outline"
              size="sm"
              className={`w-full h-auto p-2 text-xs justify-start relative bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer ${
                hasChanges ? "ring-2 ring-green-400" : ""
              } ${isCustomTime ? "border-orange-300 bg-orange-50" : ""} ${
                room.classification &&
                roomClassifications?.[room.classification]
                  ? `${roomClassifications[room.classification].color} border`
                  : ""
              }`}
              onClick={() => {
                setIsSavedSuccessfully(false);
                setIsOpen(true);
              }}
              title="Click để chỉnh sửa lại"
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-1 w-full">
                  <div
                    className={`w-2 h-2 rounded-full ${getClassificationStyle()}`}
                  />
                  <span className="font-medium truncate text-green-700">
                    {room.code} - {room.name}
                  </span>
                  <div className="ml-auto">
                    <div className="text-[9px] bg-green-100 text-green-600 px-1 py-0 rounded">
                      ✓ Đã lưu
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Stethoscope className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[150px]">
                      {room.selectedDoctor || room.doctor || "Chưa chọn BS"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    <span className="font-medium">
                      {currentTime.maxAppointments}/
                      {room.appointmentDuration || 60}p
                    </span>
                  </div>
                  {isCustomTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>
                        {currentTime.startTime}-{currentTime.endTime}
                      </span>
                    </div>
                  )}
                </div>

                {(room.selectedExamType || room.examType) && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 h-4 max-w-full bg-purple-50 text-purple-600"
                  >
                    <span className="truncate">
                      🩺 {room.selectedExamType || room.examType}
                    </span>
                  </Badge>
                )}
              </div>
            </Button>
          ) : (
            <Popover
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleClose();
                } else {
                  setIsOpen(true);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={` group  h-auto p-2 text-xs justify-start relative border-2 hover:shadow-md transition-all cursor-pointer w-full ${
                    hasChanges ? "ring-2 ring-green-400" : ""
                  } ${isCustomTime ? "border-orange-300 bg-orange-50" : ""} ${
                    room.classification &&
                    roomClassifications?.[room.classification]
                      ? `${
                          roomClassifications[room.classification].color
                        } border`
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center gap-1 w-full">
                      <div
                        className={`w-2 h-2 rounded-full bg-green-500 group-hover:bg-current opacity-80`}
                      />
                      <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-current/10 text-current">
                        {getClassificationName()}
                      </span>
                      <span className="font-medium truncate text-current">
                        {room.code || room.name}
                      </span>
                      {hasChanges && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto" />
                      )}
                      {isCustomTime && (
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-1" />
                      )}
                    </div>

                    {(room.selectedDoctor || room.doctor) && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 group-hover:text-current">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[150px]">
                            {room.selectedDoctor ||
                              room.doctor ||
                              "Chưa chọn BS"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-gray-500 group-hover:text-current">
                      <div className="flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        <span className="font-medium ">
                          {currentTime.maxAppointments}/
                          {room.appointmentDuration || 60}p
                        </span>
                        {getHoldSlots(room) > 0 && (
                          <span className="text-amber-600 font-medium">
                            +{getHoldSlots(room)}🔒
                          </span>
                        )}
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

                    {(room.selectedSpecialty || room.specialty) && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 h-4 max-w-full"
                      >
                        <span className="truncate">
                          🔬 {room.selectedSpecialty || room.specialty}
                        </span>
                      </Badge>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-96 p-0" align="start">
                <div className="flex flex-col max-h-[600px]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Cấu hình phòng
                        </h4>
                        <p className="text-xs text-gray-500">{room.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      onClick={handleClose}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Validation Warning */}
                  {showValidationWarning && validationErrors.length > 0 && (
                    <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-red-800 text-sm mb-2">
                            Vui lòng hoàn thành thông tin bắt buộc
                          </h4>
                          <ul className="space-y-1 text-sm text-red-700">
                            {validationErrors.map((error, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                          onClick={() => setShowValidationWarning(false)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Main content with scroll */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Slot Info */}
                    {slotInfo && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-semibold text-blue-900 text-sm">
                              {slotInfo.periodName} - {slotInfo.workSession}
                            </span>
                          </div>
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
                              {slotInfo.defaultMaxAppointments}/60p
                            </Badge>
                          </div>

                          {isCustomTime && (
                            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-lg">
                              <Settings className="w-4 h-4" />
                              <span>
                                Giờ riêng:{" "}
                                <strong>
                                  {currentTime.startTime} -{" "}
                                  {currentTime.endTime}
                                </strong>
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-300"
                              >
                                {currentTime.maxAppointments}/
                                {room.appointmentDuration || 60}p
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Room Management Section - Database Version */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Thông tin phòng khám
                        </Label>
                        <div className="flex items-center gap-2">
                          {allRooms && (
                            <Badge variant="secondary" className="text-xs">
                              {filteredRoomsForSwap.length}/
                              {processedRoomsForSwap.length} phòng
                              {searchQuery.trim() && " (đã lọc)"}
                            </Badge>
                          )}
                          {/* ✅ Hiển thị số phòng bị conflict */}
                          {(() => {
                            const conflictedRooms =
                              processedRoomsForSwap.filter(
                                (r) => r.hasAdvancedConflict
                              );
                            return conflictedRooms.length > 0 && <></>;
                          })()}
                        </div>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
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
                                  {room.name}
                                </h3>
                                {room.code && room.code !== room.name && (
                                  <Badge variant="outline" className="text-xs">
                                    {room.code}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                {room.zoneName && (
                                  <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span>{room.zoneName}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {currentTime.maxAppointments}/
                                    {room.appointmentDuration || 60}p
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {currentTime.startTime}-
                                    {currentTime.endTime}
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
                                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-blue-500"
                                      : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-500"
                                  } ${
                                    isSwapping
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
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
                                  {usedRooms ? usedRooms.size - 1 : 0} phòng
                                  đang sử dụng
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
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
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

                              {/* Conflict summary */}
                              {(() => {
                                const totalRooms = processedRoomsForSwap.length;
                                const conflictedRooms =
                                  processedRoomsForSwap.filter(
                                    (r) => r.hasAdvancedConflict
                                  );
                                const duplicatedRooms =
                                  processedRoomsForSwap.filter(
                                    (r) => r.isDuplicate
                                  );

                                return (
                                  totalRooms > 0 &&
                                  (conflictedRooms.length > 0 ||
                                    duplicatedRooms.length > 0) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2 text-sm text-amber-800">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-medium">
                                          Có{" "}
                                          {conflictedRooms.length +
                                            duplicatedRooms.length}
                                          /{totalRooms} phòng không thể chọn
                                        </span>
                                      </div>
                                      <div className="mt-2 text-xs text-amber-700">
                                        {conflictedRooms.length > 0 && (
                                          <div>
                                            • {conflictedRooms.length} phòng bị
                                            trùng lịch khám hoặc bác sĩ
                                          </div>
                                        )}
                                        {duplicatedRooms.length > 0 && (
                                          <div>
                                            • {duplicatedRooms.length} phòng đã
                                            được sử dụng trong ca này
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                );
                              })()}

                              {/* Room Grid với conflict indicators */}
                              <div className="grid gap-3 max-h-60 overflow-y-auto">
                                {filteredRoomsForSwap.length > 0 ? (
                                  filteredRoomsForSwap.map((r) => {
                                    const isCurrentlySwapping =
                                      isSwapping && r.roomId;

                                    return (
                                      <button
                                        key={r.id || r.code}
                                        onClick={() => {
                                          if (!r.isDisabled && !isSwapping) {
                                            handleRoomSwap(r);
                                          }
                                        }}
                                        disabled={r.isDisabled || isSwapping}
                                        className={`group relative border-2 rounded-xl p-4 transition-all duration-200 text-left ${
                                          r.isDisabled
                                            ? "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
                                            : isSwapping
                                            ? "border-gray-200 cursor-not-allowed opacity-50"
                                            : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                                        } ${
                                          isCurrentlySwapping
                                            ? "ring-2 ring-indigo-500 border-indigo-300"
                                            : ""
                                        }`}
                                        title={
                                          r.isDisabled
                                            ? r.disabledReason
                                            : `Chọn phòng ${r.code}`
                                        }
                                      >
                                        <div className="flex items-center gap-3">
                                          {/* ✅ Room Type Indicator với conflict status */}
                                          <div
                                            className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 relative ${
                                              r.isDisabled
                                                ? "bg-red-400"
                                                : getRoomStyle(r.classification)
                                            }`}
                                          >
                                            {isCurrentlySwapping ? (
                                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : r.isDisabled ? (
                                              <AlertTriangle className="w-5 h-5 text-white" />
                                            ) : (
                                              <Building className="w-5 h-5 text-white" />
                                            )}
                                          </div>

                                          {/* Room Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span
                                                className={`font-semibold text-sm truncate ${
                                                  r.isDisabled
                                                    ? "text-red-700"
                                                    : "text-gray-900"
                                                }`}
                                              >
                                                {r.code}
                                              </span>

                                              {/* ✅ Conflict badges */}
                                              {r.hasAdvancedConflict && (
                                                <Badge className="text-xs shrink-0 bg-red-500 text-white">
                                                  Trùng lịch
                                                </Badge>
                                              )}
                                              {r.isDuplicate && (
                                                <Badge className="text-xs shrink-0 bg-orange-500 text-white">
                                                  Đã dùng
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
                                                r.isDisabled
                                                  ? "text-red-600"
                                                  : "text-gray-600"
                                              }`}
                                            >
                                              {r.name || "Đang cập nhật..."}
                                            </p>

                                            {/* ✅ Conflict details */}
                                            {r.conflictInfo &&
                                              r.hasAdvancedConflict && (
                                                <div className="mt-1 text-xs text-red-600">
                                                  {r.conflictInfo
                                                    .hasRoomConflict && (
                                                    <div>
                                                      📍 Phòng đã có lịch khám
                                                    </div>
                                                  )}
                                                  {r.conflictInfo
                                                    .hasDoctorConflict && (
                                                    <div>
                                                      👨‍⚕️ Bác sĩ đã có lịch khác
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                            {r.zoneName && (
                                              <p
                                                className={`text-xs mt-1 ${
                                                  r.isDisabled
                                                    ? "text-red-500"
                                                    : "text-purple-600"
                                                }`}
                                              >
                                                📍 {r.zoneName}
                                              </p>
                                            )}
                                          </div>

                                          {/* Selection Indicator */}
                                          <div
                                            className={`transition-opacity ${
                                              r.isDisabled || isSwapping
                                                ? "opacity-50"
                                                : "opacity-0 group-hover:opacity-100"
                                            }`}
                                          >
                                            <div
                                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                r.isDisabled
                                                  ? "bg-red-500"
                                                  : "bg-indigo-500"
                                              }`}
                                            >
                                              {isCurrentlySwapping ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              ) : r.isDisabled ? (
                                                <X className="w-4 h-4 text-white" />
                                              ) : (
                                                <ArrowUpDown className="w-4 h-4 text-white" />
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* ✅ Detailed conflict reason */}
                                        {r.isDisabled && r.disabledReason && (
                                          <div className="mt-3 pt-3 border-t border-red-200">
                                            <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                                              <strong>
                                                Lý do không thể chọn:
                                              </strong>{" "}
                                              {r.disabledReason}
                                            </div>
                                          </div>
                                        )}
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

                              {/* ✅ Tip với conflict info */}
                              {getConflictInfo && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="text-xs text-blue-800">
                                    <div className="font-medium mb-1">
                                      💡 Hệ thống kiểm tra tự động:
                                    </div>
                                    <div>
                                      ✓ Trùng lặp phòng trong ca làm việc
                                    </div>
                                    <div>✓ Trùng lịch khám từ database</div>
                                    <div>
                                      ✓ Trùng lịch bác sĩ theo chuyên khoa
                                    </div>
                                  </div>
                                </div>
                              )}
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
                                Tất cả phòng khác đã được sử dụng hoặc bị trùng
                                lịch
                              </p>
                              <div className="flex flex-col gap-2 text-xs text-amber-600">
                                <div className="flex items-center justify-center gap-2">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    Tổng {allRooms?.length || 0} phòng
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                  <span>
                                    {usedRooms ? usedRooms.size : 0} phòng đang
                                    sử dụng
                                  </span>
                                </div>
                                {(() => {
                                  const conflictedCount = (
                                    allRooms || []
                                  ).filter((r) => {
                                    if (!getConflictInfo) return false;
                                    try {
                                      const info = getConflictInfo(
                                        r,
                                        normalizeRoomId(r)
                                      );
                                      return (
                                        info.hasRoomConflict ||
                                        info.hasDoctorConflict
                                      );
                                    } catch {
                                      return false;
                                    }
                                  }).length;
                                  return (
                                    conflictedCount > 0 && (
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>
                                          {conflictedCount} phòng bị trùng lịch
                                        </span>
                                      </div>
                                    )
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Doctor Selection với thiết kế mới */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Bác sĩ phụ trách
                          </Label>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                              <Users className="w-3 h-3" />
                              <span>{filteredDoctors.length}</span>
                            </div>
                            {doctorsLoading && (
                              <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <div className="relative" data-doctor-search>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                              {room.selectedDoctor && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                            <Input
                              type="text"
                              placeholder={
                                room.selectedDoctor
                                  ? `Đã chọn: ${room.selectedDoctor}`
                                  : "Tìm kiếm bác sĩ theo tên hoặc mã..."
                              }
                              value={doctorSearchQuery}
                              onChange={(e) =>
                                setDoctorSearchQuery(e.target.value)
                              }
                              onFocus={() => setShowDoctorDropdown(true)}
                              onClick={() => setShowDoctorDropdown(true)}
                              className={`pl-10 pr-10 h-11 transition-all duration-200 ${
                                room.selectedDoctor
                                  ? "bg-green-50 border-green-300 text-green-800"
                                  : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              }`}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                              {doctorSearchQuery.trim() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                  onClick={() => setDoctorSearchQuery("")}
                                >
                                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                                </Button>
                              )}
                              {room.selectedDoctor && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-100"
                                  onClick={() => {
                                    handleUpdate("selectedDoctor", "");
                                    setShowDoctorDropdown(false);
                                  }}
                                >
                                  <X className="w-3 h-3 text-green-600 hover:text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Results dropdown */}
                          {showDoctorDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                              <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-600">
                                <div className="flex items-center justify-between">
                                  <span>
                                    Chọn bác sĩ ({filteredDoctors.length} bác
                                    sĩ)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {/* ✅ Hiển thị số lượng bác sĩ bị conflict */}
                                    {(() => {
                                      const conflictedDoctors =
                                        filteredDoctors.filter(
                                          (d) =>
                                            d.conflictInfo?.hasConflict &&
                                            !d.conflictInfo?.isCurrentDoctor
                                        );
                                      return (
                                        conflictedDoctors.length > 0 && (
                                          <span className="text-red-600 font-medium">
                                            ⚠ {conflictedDoctors.length} bị
                                            trùng lịch
                                          </span>
                                        )
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doctor) => {
                                  const doctorName =
                                    doctor.name || doctor.fullName;
                                  const doctorCode =
                                    doctor.doctor_IdEmployee_Postgresql ||
                                    doctor.code;
                                  const doctorSpecialty =
                                    doctor.specialtyName ||
                                    doctor.departmentName;

                                  const isSelected = (() => {
                                    if (!room.selectedDoctor) return false;
                                    const selectedValue =
                                      room.selectedDoctor.trim();
                                    const currentName = (
                                      doctorName || ""
                                    ).trim();
                                    const currentCode = (
                                      doctorCode || ""
                                    ).trim();
                                    const currentId = (doctor.id || "")
                                      .toString()
                                      .trim();

                                    // So sánh với nhiều tiêu chí
                                    const nameMatch =
                                      currentName === selectedValue;
                                    const codeMatch =
                                      currentCode === selectedValue;
                                    const idMatch = currentId === selectedValue;

                                    return nameMatch || codeMatch || idMatch;
                                  })();

                                  const conflictInfo = doctor.conflictInfo;
                                  const hasConflict =
                                    conflictInfo?.hasConflict &&
                                    !conflictInfo?.isCurrentDoctor;
                                  const isDisabled = hasConflict;

                                  // ✅ Tạo tooltip chi tiết cho conflict
                                  const getConflictTooltip = () => {
                                    if (
                                      !conflictInfo ||
                                      !conflictInfo.hasConflict
                                    )
                                      return "";

                                    const { conflictDetails } = conflictInfo;
                                    const reasons = [];

                                    if (
                                      conflictDetails.sameDepConflicts?.length >
                                      0
                                    ) {
                                      reasons.push(
                                        `Đã có lịch khám trong khoa này (${conflictDetails.sameDepConflicts.length} lịch)`
                                      );
                                    }

                                    if (
                                      conflictDetails.otherDepConflicts
                                        ?.length > 0
                                    ) {
                                      const deptNames = [
                                        ...new Set(
                                          conflictDetails.otherDepConflicts.map(
                                            (s: any) =>
                                              s.departmentName ||
                                              `Khoa ${s.departmentHospitalId}`
                                          )
                                        ),
                                      ];
                                      reasons.push(
                                        `Đã có lịch khám ở khoa khác: ${deptNames.join(
                                          ", "
                                        )} (${
                                          conflictDetails.otherDepConflicts
                                            .length
                                        } lịch)`
                                      );
                                    }

                                    return reasons.join(" • ");
                                  };

                                  return (
                                    <button
                                      key={doctor.id}
                                      className={`w-full px-3 py-3 text-left transition-colors relative ${
                                        isDisabled
                                          ? "bg-red-50 cursor-not-allowed opacity-60 border border-red-200"
                                          : isSelected
                                          ? "bg-blue-100 border-l-4 border-blue-500 hover:bg-blue-200"
                                          : "hover:bg-blue-50"
                                      }`}
                                      onClick={(e) => {
                                        if (isDisabled) {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          return;
                                        }

                                        handleUpdate(
                                          "selectedDoctor",
                                          doctorName
                                        );
                                        setShowDoctorDropdown(false);
                                        setDoctorSearchQuery("");
                                      }}
                                      disabled={isDisabled}
                                      style={{
                                        pointerEvents: isDisabled
                                          ? "none"
                                          : "auto",
                                      }}
                                      title={
                                        isDisabled
                                          ? getConflictTooltip()
                                          : `Chọn bác sĩ ${doctorName}`
                                      }
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                                            isDisabled
                                              ? "bg-red-500"
                                              : isSelected
                                              ? "bg-blue-500"
                                              : "bg-green-500"
                                          }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div
                                            className={`font-medium text-sm truncate ${
                                              isDisabled
                                                ? "text-red-700"
                                                : isSelected
                                                ? "text-blue-900"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {doctorName}
                                          </div>

                                          {/* ✅ Thông tin bác sĩ và conflict info */}
                                          <div className="text-xs mt-1 space-y-1">
                                            {/* Conflict warning */}
                                            {isDisabled &&
                                              conflictInfo?.hasConflict && (
                                                <div className="text-red-600">
                                                  <div className="flex items-center gap-1 mb-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span className="font-medium text-red-700">
                                                      ⚠ KHÔNG THỂ CHỌN - Đã có
                                                      lịch khám (
                                                      {
                                                        conflictInfo
                                                          .conflictDetails
                                                          .totalConflicts
                                                      }
                                                      )
                                                    </span>
                                                  </div>

                                                  {/* Conflict departments */}
                                                  {conflictInfo.conflictDetails
                                                    .otherDepConflicts?.length >
                                                    0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                      {[
                                                        ...new Set(
                                                          conflictInfo.conflictDetails.otherDepConflicts.map(
                                                            (s: any) =>
                                                              s.departmentName ||
                                                              `K${s.departmentHospitalId}`
                                                          )
                                                        ),
                                                      ]
                                                        .slice(0, 2)
                                                        .map(
                                                          (
                                                            deptName: string,
                                                            idx: number
                                                          ) => (
                                                            <span
                                                              key={idx}
                                                              className="text-[10px] bg-red-200 text-red-700 px-1 rounded"
                                                            >
                                                              {deptName}
                                                            </span>
                                                          )
                                                        )}
                                                      {conflictInfo
                                                        .conflictDetails
                                                        .otherDepConflicts
                                                        .length > 2 && (
                                                        <span className="text-[10px] text-red-500">
                                                          +
                                                          {conflictInfo
                                                            .conflictDetails
                                                            .otherDepConflicts
                                                            .length - 2}
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                            {/* Normal doctor info */}
                                            <div
                                              className={
                                                isDisabled
                                                  ? "text-red-500"
                                                  : "text-gray-500"
                                              }
                                            >
                                              {doctorSpecialty && (
                                                <span className="inline-flex items-center gap-1">
                                                  <span>⚕️</span>
                                                  <span>{doctorSpecialty}</span>
                                                </span>
                                              )}
                                              {doctorCode &&
                                                doctorSpecialty &&
                                                " • "}
                                              {doctorCode && (
                                                <span className="inline-flex items-center gap-1">
                                                  <span>🆔</span>
                                                  <span>{doctorCode}</span>
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* ✅ FIX: Move status indicators outside of the content div */}
                                          <div className="flex justify-end mt-2">
                                            {isSelected && (
                                              <div className="text-blue-600 text-xs font-medium">
                                                ✓ Đã chọn
                                              </div>
                                            )}
                                            {isDisabled && !isSelected && (
                                              <div className="text-red-600 text-xs font-medium">
                                                ⚠ Trùng lịch
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })
                              ) : doctorSearchQuery.trim() ? (
                                /* No Search Results */
                                <div className="px-3 py-6 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                      Không tìm thấy bác sĩ nào
                                    </span>

                                    {doctorSearchQuery.trim() && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => setDoctorSearchQuery("")}
                                      >
                                        Xóa bộ lọc
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* ✅ FIX: Add fallback for when no doctors and no search */
                                <div className="px-3 py-6 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    <Stethoscope className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                      Không có bác sĩ khả dụng
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {doctorsLoading && (
                            <>
                              <div className="px-3 py-4 text-center border-t">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                  <span>Đang tải danh sách bác sĩ...</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {room.selectedDoctor && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-800">
                              Đã chọn bác sĩ: {room.selectedDoctor}
                            </span>
                          </div>
                        </div>
                      )}
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
                          </div>
                        </div>

                        <Select
                          value={
                            room.selectedExamType || room.examType || "none"
                          }
                          onValueChange={(value) => {
                            const selectedExamType =
                              value === "none" ? "" : value;
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
                                <span className="text-sm">
                                  Không chọn loại khám
                                </span>
                              </div>
                            </SelectItem>
                            {departmentData.examTypes.map((examType) => {
                              const classificationKey = `exam_${examType.id}`;
                              const classification =
                                roomClassifications?.[classificationKey];
                              const colorClass =
                                classification?.color || "bg-green-500";

                              return (
                                <SelectItem
                                  key={examType.id}
                                  value={examType.name}
                                >
                                  <div className="flex items-start gap-2 w-full py-1">
                                    <div
                                      className={`w-3 h-3 ${colorClass} rounded flex-shrink-0 mt-0.5 border`}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-900 truncate">
                                        {examType.name}
                                      </div>
                                      {examType.description &&
                                        examType.description !==
                                          examType.name && (
                                          <div className="text-xs text-gray-500 truncate">
                                            {examType.description}
                                          </div>
                                        )}
                                      {classification && (
                                        <div className="text-xs text-blue-600 truncate">
                                          Màu: {classification.name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
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
                              {availableSpecialtiesForSelectedExamType.length}{" "}
                              khoa
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Chọn loại khám trước
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Select
                        value={
                          room.selectedSpecialty || room.specialty || "none"
                        }
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
                                : availableSpecialtiesForSelectedExamType.length ===
                                  0
                                ? "Loại khám này không có chuyên khoa"
                                : availableSpecialtiesForSelectedExamType.length ===
                                  1
                                ? "Đã tự động chọn chuyên khoa duy nhất"
                                : "Chọn chuyên khoa..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-w-sm min-w-[250px]">
                          <SelectItem value="none">
                            <div className="flex items-center gap-2 text-gray-500 w-full py-1">
                              <div className="w-3 h-3 border border-gray-300 rounded flex-shrink-0"></div>
                              <span className="text-sm">
                                Không chọn chuyên khoa
                              </span>
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

                      {/* Status messages */}
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
                                Vui lòng chọn loại khám để xem danh sách chuyên
                                khoa tương ứng
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {room.selectedExamType &&
                        availableSpecialtiesForSelectedExamType.length ===
                          0 && (
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
                                  Loại khám{" "}
                                  <strong>{room.selectedExamType}</strong> hiện
                                  không có chuyên khoa nào
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* ✅ Time Configuration với custom step control */}
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
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-blue-800">
                              ⏰ Quy tắc thời gian
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Thời gian chỉ có thể là bội số của 30 phút (VD:
                              07:00, 07:30, 08:00, 08:30...)
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Start Time */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Giờ bắt đầu
                          </Label>
                          <div className="relative">
                            <Input
                              type="time"
                              list="time-options-start"
                              value={currentTime.startTime}
                              onChange={(e) => {
                                const value = e.target.value;
                                const correctedTime =
                                  roundToNearestHalfHour(value);
                                handleUpdate("customStartTime", correctedTime);
                              }}
                              className={`h-10 ${
                                isCustomTime
                                  ? "border-orange-300 bg-orange-50"
                                  : "bg-white"
                              }`}
                            />
                            <datalist id="time-options-start">
                              {Array.from({ length: 48 }, (_, i) => {
                                const hours = Math.floor(i / 2);
                                const minutes = (i % 2) * 30;
                                const timeString = `${hours
                                  .toString()
                                  .padStart(2, "0")}:${minutes
                                  .toString()
                                  .padStart(2, "0")}`;
                                return (
                                  <option key={timeString} value={timeString} />
                                );
                              })}
                            </datalist>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => {
                                  const [hours, minutes] = currentTime.startTime
                                    .split(":")
                                    .map(Number);
                                  const newMinutes = minutes === 0 ? 30 : 0;
                                  const newHours =
                                    minutes === 30 ? hours + 1 : hours;
                                  const adjustedHours =
                                    newHours >= 24 ? 0 : newHours;
                                  const newTime = `${adjustedHours
                                    .toString()
                                    .padStart(2, "0")}:${newMinutes
                                    .toString()
                                    .padStart(2, "0")}`;
                                  handleUpdate("customStartTime", newTime);
                                }}
                                title="Tăng 30 phút"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-600">
                            Giờ kết thúc
                          </Label>
                          <div className="relative">
                            <Input
                              type="time"
                              list="time-options-end"
                              value={currentTime.endTime}
                              onChange={(e) => {
                                const value = e.target.value;
                                const correctedTime =
                                  roundToNearestHalfHour(value);
                                handleUpdate("customEndTime", correctedTime);
                              }}
                              className={`h-10 ${
                                isCustomTime
                                  ? "border-orange-300 bg-orange-50"
                                  : "bg-white"
                              }`}
                            />
                            <datalist id="time-options-end">
                              {Array.from({ length: 48 }, (_, i) => {
                                const hours = Math.floor(i / 2);
                                const minutes = (i % 2) * 30;
                                const timeString = `${hours
                                  .toString()
                                  .padStart(2, "0")}:${minutes
                                  .toString()
                                  .padStart(2, "0")}`;
                                return (
                                  <option key={timeString} value={timeString} />
                                );
                              })}
                            </datalist>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => {
                                  const [hours, minutes] = currentTime.endTime
                                    .split(":")
                                    .map(Number);
                                  const newMinutes = minutes === 0 ? 30 : 0;
                                  const newHours =
                                    minutes === 30 ? hours + 1 : hours;
                                  const adjustedHours =
                                    newHours >= 24 ? 0 : newHours;
                                  const newTime = `${adjustedHours
                                    .toString()
                                    .padStart(2, "0")}:${newMinutes
                                    .toString()
                                    .padStart(2, "0")}`;
                                  handleUpdate("customEndTime", newTime);
                                }}
                                title="Tăng 30 phút"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Time difference display */}
                      {currentTime.startTime && currentTime.endTime && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Thời gian làm việc:
                            </span>
                            <span className="font-medium text-gray-900">
                              {(() => {
                                const start = currentTime.startTime
                                  .split(":")
                                  .map(Number);
                                const end = currentTime.endTime
                                  .split(":")
                                  .map(Number);
                                const startMinutes = start[0] * 60 + start[1];
                                const endMinutes = end[0] * 60 + end[1];
                                const diffMinutes = endMinutes - startMinutes;
                                const hours = Math.floor(diffMinutes / 60);
                                const minutes = diffMinutes % 60;
                                return `${hours}h${
                                  minutes > 0 ? ` ${minutes}p` : ""
                                }`;
                              })()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Appointment configuration */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Cấu hình lượt khám theo thời gian
                        </Label>

                        <div className="grid grid-cols-3 gap-3">
                          {/* Số lượt khám */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-500">
                              Số lượt khám
                            </Label>
                            <div className="relative">
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
                                className={`h-10 pr-12 ${
                                  isCustomTime
                                    ? "border-orange-300 bg-orange-50"
                                    : "bg-white"
                                }`}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                lượt
                              </div>
                            </div>
                          </div>

                          {/* Số lượng giữ chỗ */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-500">
                              Số giữ chỗ
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={getHoldSlots(room)}
                                onChange={(e) =>
                                  handleUpdate(
                                    "holdSlot",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className={`h-10 pr-12 ${
                                  isCustomTime
                                    ? "border-orange-300 bg-orange-50"
                                    : "bg-white"
                                }`}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                slot
                              </div>
                            </div>
                          </div>

                          {/* Thời gian (phút) */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-500">
                              Trong thời gian
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="5"
                                max="120"
                                value={room.appointmentDuration || 60}
                                onChange={(e) =>
                                  handleUpdate(
                                    "appointmentDuration",
                                    parseInt(e.target.value) || 60
                                  )
                                }
                                className={`h-10 pr-12 ${
                                  isCustomTime
                                    ? "border-orange-300 bg-orange-50"
                                    : "bg-white"
                                }`}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
                                phút
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reset button */}
                      {isCustomTime && (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={handleResetToDefault}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset về mặc định
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary info */}
                  <div
                    className={`text-sm p-3 rounded-lg border ${
                      isCustomTime
                        ? "bg-orange-50 border-orange-200 text-orange-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCustomTime ? "bg-orange-500" : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="font-medium">
                        📅 {currentTime.maxAppointments} lượt trong{" "}
                        {room.appointmentDuration || 60} phút
                      </span>
                    </div>

                    {getHoldSlots(room) > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCustomTime ? "bg-orange-400" : "bg-blue-400"
                          }`}
                        ></div>
                        <span className="font-medium">
                          🔒 {getHoldSlots(room)} slot giữ chỗ
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs opacity-80">
                      <span>
                        Trung bình{" "}
                        {Math.round(
                          (room.appointmentDuration || 60) /
                            currentTime.maxAppointments
                        )}{" "}
                        phút/lượt khám
                      </span>
                    </div>
                  </div>

                  {slotInfo && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                      💡 Mặc định cho ca này:{" "}
                      <strong>{slotInfo.defaultMaxAppointments}/60p</strong>
                      {" • "}
                      <span>Giữ chỗ: {getHoldSlots(room)} slot</span>
                    </div>
                  )}

                  {/* Action Buttons - Sticky footer */}
                  <div className="border-t bg-gray-50/50 p-4">
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-9 bg-white hover:bg-gray-50 hover:text-dark"
                        onClick={handleClose}
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
          )}
        </div>
      </>
    );
  }
);

RoomConfigPopover.displayName = "RoomConfigPopover";
