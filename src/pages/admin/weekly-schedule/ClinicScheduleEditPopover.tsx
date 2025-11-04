import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
// ✅ Bỏ import Popover vì không dùng nữa
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Clock,
  Users,
  Stethoscope,
  Search,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  MapPin,
  ArrowLeftRight, // ✅ Thêm icon cho chuyển phòng
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchDoctors } from "@/store/slices/doctorSlice";
import { fetchRooms } from "@/store/slices/roomSlice"; // ✅ Thêm import
import {
  addClinicSchedules,
  fetchClinicSchedules,
  deleteClinicScheduleThunk,
} from "@/store/slices/clinicScheduleSlice";
interface ClinicScheduleEditButtonProps {
  schedule: any;
  scheduleIndex: number;
  timeSlots: any[];
  availableSpecialties: string[];
  roomClassifications: any;
  shiftDefaults: any;
  onScheduleUpdated: (scheduleIndex: number, updates: any) => void;
  onScheduleRemoved: (scheduleIndex: number) => void;
  onCancel: () => void;
  getConflictInfo?: (
    room: any,
    roomId: string
  ) => {
    roomDoctors: any[];
    hasDoctorConflict: boolean;
    hasRoomConflict: boolean;
    getDisabledReason: () => string;
  };
  departmentData?: {
    examTypes: any[];
    specialties: string[];
    department?: any;
  };
  usedRooms?: Set<string>;
  allCellClinicSchedules?: any[];
  cellClinicSchedules?: any[];
  className?: string;
  onRoomSwapped?: (
    scheduleIndex: number,
    oldRoomId: string,
    newRoomId: string
  ) => void;
  // ✅ Thêm props cần thiết cho conflict checking
  getDoctorsBySpecialty?: (specialty: string) => any[];
  isRoomUsed?: (room: any) => boolean;
  isInlineMode?: boolean;
  setIsEditMode?: (isEdit: boolean) => void; // ✅ Thêm prop setIsEditMode
  selectedZone?: string; // ✅ Thêm prop selectedZone
  selectedWeek?: string; // ✅ Thêm prop selectedWeek
}

export const ClinicScheduleEditButton: React.FC<
  ClinicScheduleEditButtonProps
> = ({
  schedule,
  scheduleIndex,
  timeSlots,
  roomClassifications,
  selectedZone,
  setIsEditMode,
  selectedWeek,
  shiftDefaults,
  onScheduleUpdated,
  onScheduleRemoved,
  departmentData,
  getConflictInfo, // ✅ Nhận getConflictInfo prop
  usedRooms,
  allCellClinicSchedules = [],
  className = "",
  onRoomSwapped,
}) => {
  // ✅ Redux hooks
  const dispatch = useAppDispatch();
  const { list: doctorsFromRedux, loading: doctorsLoading } = useAppSelector(
    (state) => state.doctor
  );

  // ✅ Lấy rooms từ Redux store
  const { list: allRooms = [], loading: roomsLoading } = useAppSelector(
    (state) => state.room
  );

  // ✅ States
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [justSwapped, setJustSwapped] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState("");

  // ✅ 1. DI CHUYỂN normalizeRoomId LÊN TRƯỚC useMemo
  const normalizeRoomId = useCallback((roomData: any): string => {
    const id =
      roomData?.id?.toString() ||
      roomData?.roomId?.toString() ||
      roomData?.code?.toString() ||
      roomData?.roomCode?.toString() ||
      "";
    return id.trim();
  }, []);

  // ✅ 2. Helper functions khác
  const getHoldSlots = useCallback(
    (scheduleData: any) => scheduleData.holdSlot || 0,
    []
  );

  const formatTimeForInput = useCallback((timeString: string): string => {
    if (!timeString) return "";
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.slice(0, 5);
    }
    return timeString;
  }, []);

  const parseTimeFromDatabase = useCallback((timeString: string): string => {
    if (!timeString) return "";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, "0");
        const minutes = parts[1].padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }
    return timeString;
  }, []);

  const roundToNearestHalfHour = useCallback((timeString: string): string => {
    if (!timeString) return timeString;
    const [hours, minutes] = timeString.split(":").map(Number);
    const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
    const adjustedHours = minutes >= 45 ? hours + 1 : hours;
    const finalHours = adjustedHours >= 24 ? 0 : adjustedHours;
    return `${finalHours.toString().padStart(2, "0")}:${roundedMinutes
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // ✅ 3. Effects
  React.useEffect(() => {
    if (doctorsFromRedux.length === 0 && !doctorsLoading) {
      dispatch(fetchDoctors());
    }
    if (allRooms.length === 0 && !roomsLoading) {
      dispatch(fetchRooms());
    }
  }, [
    dispatch,
    doctorsFromRedux.length,
    doctorsLoading,
    allRooms.length,
    roomsLoading,
  ]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // ✅ Kiểm tra click outside cho doctor dropdown
      if (!target.closest("[data-doctor-search]")) {
        setShowDoctorDropdown(false);
      }

      // ✅ Kiểm tra click outside cho room dropdown - QUAN TRỌNG
      if (
        !target.closest("[data-room-search]") &&
        !target.closest("[data-room-dropdown]")
      ) {
        setShowRoomSelector(false);
      }
    };

    if (showDoctorDropdown || showRoomSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDoctorDropdown, showRoomSelector]);

  React.useEffect(() => {
    setLocalSchedule({ ...schedule });
  }, [schedule]);

  // ✅ 4. Computed values - BÂY GIỜ normalizeRoomId ĐÃ ĐƯỢC ĐỊNH NGHĨA
  const slotInfo = useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) return null;
    const currentSlot = timeSlots.find(
      (slot) =>
        slot.examinationId?.toString() === schedule.examinationId?.toString()
    );
    if (!currentSlot) return null;
    const shiftConfig = shiftDefaults[currentSlot.workSession];
    return {
      slot: currentSlot,
      workSession: currentSlot.workSession,
      periodName: currentSlot.periodName || currentSlot.period,
      defaultStartTime:
        shiftConfig?.startTime || currentSlot.startTime?.slice(0, 5) || "07:30",
      defaultEndTime:
        shiftConfig?.endTime || currentSlot.endTime?.slice(0, 5) || "11:00",
      defaultMaxAppointments: shiftConfig?.maxAppointments || 10,
    };
  }, [timeSlots, schedule.examinationId, shiftDefaults]);

  const isCustomTime = useMemo(() => {
    if (!slotInfo) return false;
    const hasCustomStart =
      localSchedule.timeStart &&
      localSchedule.timeStart.slice(0, 5) !== slotInfo.defaultStartTime;
    const hasCustomEnd =
      localSchedule.timeEnd &&
      localSchedule.timeEnd.slice(0, 5) !== slotInfo.defaultEndTime;
    const hasCustomMax =
      localSchedule.total &&
      localSchedule.total !== slotInfo.defaultMaxAppointments;
    return hasCustomStart || hasCustomEnd || hasCustomMax;
  }, [localSchedule, slotInfo]);

  const getCurrentTime = useCallback(() => {
    const startTime = formatTimeForInput(
      localSchedule.timeStart || slotInfo?.defaultStartTime || "07:30"
    );
    const endTime = formatTimeForInput(
      localSchedule.timeEnd || slotInfo?.defaultEndTime || "11:00"
    );
    const maxAppointments =
      localSchedule.total || slotInfo?.defaultMaxAppointments || 10;
    return { startTime, endTime, maxAppointments };
  }, [localSchedule, slotInfo, formatTimeForInput]);

  const currentTime = getCurrentTime();

  useMemo(() => {
    return !!(
      localSchedule.doctorName &&
      localSchedule.examTypeName &&
      localSchedule.timeStart &&
      localSchedule.timeEnd &&
      localSchedule.total > 0
    );
  }, [localSchedule]);

  // ✅ 8. Handlers
  const handleUpdate = useCallback(
    (field: string, value: any) => {
      setLocalSchedule((prev) => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
    },
    [showValidationWarning]
  );
  function normalizeToHHMMSS(time) {
    if (!time) return "00:00:00";

    // Cắt dư, thêm thiếu
    const parts = time.split(":").slice(0, 3);

    while (parts.length < 3) {
      parts.push("00");
    }

    // Giới hạn đúng 3 phần (HH:mm:ss)
    const [hh, mm, ss] = parts;

    // Đảm bảo đủ 2 chữ số mỗi phần
    const padded = [hh, mm, ss].map((p) => p.toString().padStart(2, "0"));

    return padded.join(":");
  }
  const handleResetToDefault = useCallback(() => {
    if (slotInfo) {
      // ✅ Đảm bảo format đúng HH:mm
      const defaultStart = formatTimeForInput(slotInfo.defaultStartTime);
      const defaultEnd = formatTimeForInput(slotInfo.defaultEndTime);

      handleUpdate("timeStart", defaultStart);
      handleUpdate("timeEnd", defaultEnd);
      handleUpdate("total", slotInfo.defaultMaxAppointments);
    }
  }, [slotInfo, handleUpdate]);

  // 9. Thêm validation cho time
  const validateTimeFormat = (timeString: string): boolean => {
    if (!timeString) return false;
    return /^\d{2}:\d{2}$/.test(timeString);
  };

  const validateScheduleConfig = useCallback(() => {
    const errors: string[] = [];

    if (!localSchedule.examTypeName) {
      errors.push("Vui lòng chọn loại khám");
    }

    if (!localSchedule.doctorName) {
      errors.push("Vui lòng chọn bác sĩ phụ trách");
    }

    const startTime = currentTime.startTime;
    const endTime = currentTime.endTime;

    // ✅ Validate time format
    if (startTime && !validateTimeFormat(startTime)) {
      errors.push("Định dạng giờ bắt đầu không hợp lệ");
    }

    if (endTime && !validateTimeFormat(endTime)) {
      errors.push("Định dạng giờ kết thúc không hợp lệ");
    }

    if (startTime && endTime && startTime >= endTime) {
      errors.push("Giờ kết thúc phải sau giờ bắt đầu");
    }

    if (currentTime.maxAppointments < 1) {
      errors.push("Số lượt khám phải lớn hơn 0");
    }

    const holdSlots = getHoldSlots(localSchedule);
    if (holdSlots >= currentTime.maxAppointments) {
      errors.push("Số giữ chỗ phải nhỏ hơn số lượt khám");
    }

    return errors;
  }, [localSchedule, currentTime]);

  const handleSave = useCallback(async () => {
    const errors = validateScheduleConfig();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationWarning(true);
      setTimeout(() => setShowValidationWarning(false), 5000);
      return;
    }

    // ✅ Chuẩn bị dữ liệu theo format API
    const apiPayload = [
      {
        id: localSchedule.id,
        dateInWeek: localSchedule.dateInWeek,
        total: localSchedule.total,
        spaceMinutes: localSchedule.spaceMinutes,
        specialtyId: localSchedule.specialtyId,
        roomId: localSchedule.roomId,
        examinationId: localSchedule.examinationId,
        doctorId: localSchedule.doctorId,
        departmentHospitalId: localSchedule.departmentHospitalId,
        examTypeId: localSchedule.examTypeId,
        startSlot: normalizeToHHMMSS(localSchedule.timeStart),
        endSlot: normalizeToHHMMSS(localSchedule.timeEnd),
        holdSlot: getHoldSlots(localSchedule),
      },
    ];

    await dispatch(addClinicSchedules(apiPayload)).unwrap();
    // ✅ Parse current week để lấy parameters
    const [currentYear, currentWeekStr] = selectedWeek.split("-W");
    const currentWeekNum = parseInt(currentWeekStr);
    const currentYearNum = parseInt(currentYear);

    await dispatch(
      fetchClinicSchedules({
        Week: currentWeekNum,
        Year: currentYearNum,
        ZoneId: parseInt(selectedZone),
      })
    );

    setIsEditMode(false);
  }, [
    validateScheduleConfig,
    onScheduleUpdated,
    scheduleIndex,
    localSchedule,
    currentTime,
    getHoldSlots,
  ]);

  // ✅ Cập nhật handleClose để không đóng popover nữa
  const handleClose = useCallback(() => {
    // Reset form về trạng thái ban đầu thay vì đóng
    setLocalSchedule({ ...schedule });
    setDoctorSearchQuery("");
    setShowDoctorDropdown(false);
    setValidationErrors([]);
    setShowValidationWarning(false);
  }, [schedule]);

  const handleRemove = useCallback(async () => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa lịch khám cho phòng "${schedule.roomName}"?`
      )
    ) {
      if (onScheduleRemoved) {
        onScheduleRemoved(scheduleIndex);
        await dispatch(deleteClinicScheduleThunk(localSchedule.id)).unwrap();
        // ✅ Parse current week để lấy parameters
        const [currentYear, currentWeekStr] = selectedWeek.split("-W");
        const currentWeekNum = parseInt(currentWeekStr);
        const currentYearNum = parseInt(currentYear);

        await dispatch(
          fetchClinicSchedules({
            Week: currentWeekNum,
            Year: currentYearNum,
            ZoneId: parseInt(selectedZone),
          })
        );

        setIsEditMode(false);
      }
    }
  }, [onScheduleRemoved, scheduleIndex, schedule.roomName]);

  // ✅ Doctor filtering
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
        localSchedule.doctorName === doctor.name ||
        localSchedule.doctorCode === doctorCode;

      const doctorSchedules = allCellClinicSchedules.filter((s) => {
        const scheduleCode =
          s.doctor_IdEmployee_Postgresql || s.doctorCode || s.doctorId;
        return scheduleCode === doctorCode && s.id !== localSchedule.id;
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
        (s) =>
          s.departmentHospitalId?.toString() ===
          localSchedule.departmentHospitalId?.toString()
      );
      const otherDepConflicts = doctorSchedules.filter(
        (s) =>
          s.departmentHospitalId?.toString() !==
          localSchedule.departmentHospitalId?.toString()
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
    [allCellClinicSchedules, localSchedule]
  );

  const filteredDoctors = useMemo(() => {
    let doctors = doctorsFromRedux || [];

    if (doctorSearchQuery.trim()) {
      const query = doctorSearchQuery.toLowerCase().trim();
      doctors = doctors.filter((doctor) => {
        const doctorName = (doctor.name || doctor.fullName || "").toLowerCase();
        const doctorCode = (
          doctor.doctor_IdEmployee_Postgresql ||
          doctor.code ||
          ""
        ).toLowerCase();
        return doctorName.includes(query) || doctorCode.includes(query);
      });
    }

    // ✅ Add conflict info to each doctor
    return doctors.map((doctor) => {
      const conflictInfo = getDoctorConflictInfo(doctor);
      return {
        ...doctor,
        conflictInfo,
      };
    });
  }, [doctorsFromRedux, doctorSearchQuery, getDoctorConflictInfo]);

  // ✅ Specialty filtering
  const availableSpecialtiesForSelectedExamType = useMemo(() => {
    if (!localSchedule.examTypeName || !departmentData?.examTypes) {
      return [];
    }

    const selectedExamType = departmentData.examTypes.find(
      (et) => et.name === localSchedule.examTypeName
    );

    if (!selectedExamType?.sepicalties) {
      return [];
    }

    return selectedExamType.sepicalties
      .filter((s: any) => s.enable)
      .map((s: any) => s.name);
  }, [localSchedule.examTypeName, departmentData]);

  // ✅ Thêm computed values cho room selection
  const availableRoomsForSwap = useMemo(() => {
    if (!allRooms || allRooms.length === 0) {
      return [];
    }

    // ✅ Lấy ID phòng hiện tại
    const currentRoomId = normalizeRoomId(localSchedule);

    // ✅ Lọc phòng theo tìm kiếm
    let rooms = allRooms.filter((room) => {
      if (!roomSearchQuery.trim()) return true;

      const query = roomSearchQuery.toLowerCase();
      const roomName = (room.name || "").toLowerCase();
      const roomCode = (room.code || room.id || "").toString();

      return roomName.includes(query) || roomCode.includes(query);
    });

    // ✅ Process rooms giống RoomConfigPopover
    const processedRooms = rooms.map((room) => {
      const roomId = normalizeRoomId(room);
      const isCurrentRoom = roomId === currentRoomId;

      // ✅ Check if room is used by other schedules
      const isUsed = usedRooms?.has(roomId) && !isCurrentRoom;

      // ✅ Sử dụng getConflictInfo để kiểm tra conflicts
      let conflictInfo = null;
      let hasAdvancedConflict = false;
      let disabledReason = "";

      if (getConflictInfo && !isCurrentRoom) {
        try {
          conflictInfo = getConflictInfo(room, roomId);
          hasAdvancedConflict =
            conflictInfo.hasRoomConflict || conflictInfo.hasDoctorConflict;
          disabledReason = conflictInfo.getDisabledReason();
        } catch (error) {
          console.error("Error getting conflict info for room:", roomId, error);
        }
      }

      // ✅ Check duplicate - giống RoomConfigPopover
      const isDuplicate = usedRooms && usedRooms.has(roomId) && !isCurrentRoom;

      // ✅ Quyết định có thể chọn room hay không
      const canSelect = !isDuplicate && !hasAdvancedConflict;
      const shouldDisable = isDuplicate || hasAdvancedConflict;

      return {
        ...room,
        roomId,
        isCurrentRoom,
        isUsed,
        canSelect: canSelect || isCurrentRoom,
        // ✅ Thêm thông tin conflict chi tiết giống RoomConfigPopover
        conflictInfo,
        hasAdvancedConflict,
        disabledReason,
        isDuplicate,
        shouldDisable: shouldDisable && !isCurrentRoom,
        // ✅ Thêm flag để dễ dàng kiểm tra
        isDisabled: shouldDisable && !isCurrentRoom,
      };
    });

    return processedRooms;
  }, [allRooms, roomSearchQuery, usedRooms, localSchedule, getConflictInfo]);

  // ✅ Thêm handlers cho room selection
  const handleRoomSwap = useCallback(
    async (newRoom: any) => {
      if (!newRoom || isSwapping) {
        return;
      }

      const newRoomId = newRoom.roomId || normalizeRoomId(newRoom);
      const oldRoomId = normalizeRoomId(localSchedule);

      if (newRoomId === oldRoomId) {
        setShowRoomSelector(false);
        return;
      }

      if (newRoom.isDisabled || newRoom.shouldDisable) {
        setDuplicateWarning(
          newRoom.disabledReason || "Phòng này không thể chọn"
        );
        return;
      }

      setIsSwapping(true);
      setDuplicateWarning("");

      try {
        // ✅ Tạo updates giống RoomConfigPopover
        const updates = {
          // ✅ Room information
          id: newRoom.id || newRoom.roomId,
          roomId: newRoom.id || newRoom.roomId,
          roomName: newRoom.name || newRoom.roomName,
          name: newRoom.name || newRoom.roomName,
          code: newRoom.code || newRoom.roomCode,

          // ✅ Preserve room properties
          classification:
            newRoom.classification || localSchedule.classification,
          specialties: newRoom.specialties || localSchedule.specialties,
          zoneId: newRoom.zoneId || localSchedule.zoneId,
          zoneName: newRoom.zoneName || localSchedule.zoneName,

          // ✅ Preserve schedule configuration
          examTypeName: localSchedule.examTypeName,
          examTypeId: localSchedule.examTypeId,
          specialtyName: localSchedule.specialtyName,
          doctorName: localSchedule.doctorName,
          doctorCode: localSchedule.doctorCode,
          doctorId: localSchedule.doctorId,

          // ✅ Preserve time configuration
          timeStart: localSchedule.timeStart,
          timeEnd: localSchedule.timeEnd,
          total: localSchedule.total,
          holdSlot: getHoldSlots(localSchedule),
          spaceMinutes: localSchedule.spaceMinutes,

          // ✅ Preserve other schedule data
          examinationId: localSchedule.examinationId,
          departmentHospitalId: localSchedule.departmentHospitalId,
          notes: localSchedule.notes,

          // ✅ Add timestamp for tracking
          lastSwapTimestamp: Date.now(),
        };

        // ✅ Update local schedule state
        setLocalSchedule((prev) => {
          const updatedSchedule = { ...prev, ...updates };

          return updatedSchedule;
        });

        // ✅ Call parent callback để update main state
        if (onRoomSwapped) {
          onRoomSwapped(scheduleIndex, oldRoomId, newRoomId);
        } else {
        }

        // ✅ Show success indicators
        setJustSwapped(true);
        setTimeout(() => {
          setJustSwapped(false);
        }, 3000);

        setShowRoomSelector(false);
        setRoomSearchQuery("");
      } catch (error) {
        console.error("❌ ERROR in handleRoomSwap:", error);
        setDuplicateWarning("Có lỗi xảy ra khi chuyển phòng: " + error.message);
        setTimeout(() => setDuplicateWarning(""), 3000);
      } finally {
        setIsSwapping(false);
      }
    },
    [localSchedule, scheduleIndex, onRoomSwapped, isSwapping]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Bỏ Popover wrapper, hiển thị content trực tiếp */}
      <div className="w-96 p-0 shadow-xl border rounded-lg bg-white">
        <div className="flex flex-col max-h-[600px]">
          {/* Header với gradient background */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Chỉnh sửa lịch khám
                </h4>
                <p className="text-xs text-gray-500">
                  {localSchedule.roomName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
              onClick={handleClose}
              title="Reset form"
            >
              <RotateCcw className="w-4 h-4" />
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
                      <li key={index} className="flex items-start gap-2">
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

          {/* Success message cho room swap */}
          {justSwapped && (
            <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowLeftRight className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-800">
                  Đã chuyển phòng thành công!
                </span>
              </div>
            </div>
          )}

          {/* Duplicate warning */}
          {duplicateWarning && (
            <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {duplicateWarning}
                </span>
              </div>
            </div>
          )}

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
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span>
                      Giờ ca khám:
                      <strong>
                        {slotInfo.defaultStartTime} - {slotInfo.defaultEndTime}
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
                        Giờ riêng:
                        <strong>
                          {currentTime.startTime} - {currentTime.endTime}
                        </strong>
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-300"
                      >
                        {currentTime.maxAppointments}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Room Management Section - Cập nhật với chức năng chuyển phòng */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Thông tin phòng khám
                </Label>
                {allRooms && allRooms.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowRoomSelector(!showRoomSelector)}
                    disabled={isSwapping || roomsLoading}
                  >
                    <ArrowLeftRight className="w-3 h-3 mr-1" />
                    {isSwapping
                      ? "Đang chuyển..."
                      : roomsLoading
                      ? "Loading..."
                      : "Chuyển phòng"}
                  </Button>
                )}

                {/* ✅ Thêm loading indicator cho rooms */}
                {roomsLoading && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-xs text-gray-500">
                      Đang tải phòng...
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4 pr-20">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                          {localSchedule.roomName}
                        </h3>
                        {justSwapped && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-300"
                          >
                            Mới đổi
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg">
                          <Users className="w-3 h-3" />
                          <span>{currentTime.maxAppointments}</span>
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
                </div>

                {/* ✅ Room Selector Dropdown với conflict checking */}
                {showRoomSelector && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
                    data-room-dropdown // ✅ Thêm data attribute này
                  >
                    <div className="p-3 border-b bg-gray-50">
                      <div className="relative" data-room-search>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Tìm kiếm phòng theo tên..."
                          value={roomSearchQuery}
                          onChange={(e) => setRoomSearchQuery(e.target.value)}
                          className="pl-10 h-9 text-sm"
                        />
                        {roomSearchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
                            onClick={() => setRoomSearchQuery("")}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-2">
                      {/* ✅ Thống kê conflict */}
                      <div className="text-xs text-gray-500 mb-2 px-2 flex items-center justify-between">
                        <span>
                          Chọn phòng mới ({availableRoomsForSwap.length} phòng)
                        </span>
                        {(() => {
                          const conflictedRooms = availableRoomsForSwap.filter(
                            (room) =>
                              room.hasAdvancedConflict && !room.isCurrentRoom
                          );
                          return (
                            conflictedRooms.length > 0 && (
                              <span className="text-red-600 font-medium">
                                ⚠ {conflictedRooms.length} bị trùng
                              </span>
                            )
                          );
                        })()}
                      </div>

                      {roomsLoading ? (
                        <div className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span>Đang tải danh sách phòng...</span>
                          </div>
                        </div>
                      ) : availableRoomsForSwap.length > 0 ? (
                        availableRoomsForSwap.map((room) => {
                          const roomId = (room.id || room.code)?.toString();
                          const roomName = room.name || room.code;

                          return (
                            <button
                              key={roomId || `room-${Math.random()}`}
                              className={`w-full p-3 text-left rounded-lg transition-colors mb-1 ${
                                room.isCurrentRoom
                                  ? "bg-blue-100 border border-blue-300 cursor-default"
                                  : room.shouldDisable
                                  ? "bg-red-50 border border-red-200 cursor-not-allowed opacity-60"
                                  : "hover:bg-blue-50 border border-transparent"
                              }`}
                              onClick={(e) => {
                                // ✅ Prevent event bubbling và default
                                e.preventDefault();
                                e.stopPropagation();

                                // ✅ Đơn giản hóa condition
                                if (!room.isCurrentRoom && !isSwapping) {
                                  handleRoomSwap(room);
                                }
                              }}
                              disabled={room.isCurrentRoom || isSwapping}
                              title={
                                room.shouldDisable
                                  ? room.disabledReason
                                  : undefined
                              }
                            >
                              {/* ... existing button content ... */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      room.isCurrentRoom
                                        ? "bg-blue-500"
                                        : room.shouldDisable
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900">
                                      {roomName}
                                    </div>

                                    {room.zoneName && (
                                      <div className="text-xs text-purple-600">
                                        📍 {room.zoneName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs">
                                  {room.isCurrentRoom ? (
                                    <span className="text-blue-600 font-medium">
                                      ✓ Hiện tại
                                    </span>
                                  ) : room.shouldDisable ? (
                                    <span className="text-red-600 font-medium">
                                      ⚠ Không thể chọn
                                    </span>
                                  ) : (
                                    <span className="text-green-600 font-medium">
                                      👆 Click để chọn
                                    </span>
                                  )}
                                </div>
                              </div>

                              {room.shouldDisable && room.disabledReason && (
                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border-l-2 border-red-200">
                                  <strong>Lý do:</strong> {room.disabledReason}
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {roomSearchQuery.trim()
                            ? "Không tìm thấy phòng nào"
                            : allRooms.length === 0
                            ? "Chưa có dữ liệu phòng"
                            : "Không có phòng khả dụng"}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
                      💡 Tip: Chọn phòng khác để chuyển lịch khám này sang phòng
                      mới
                      {getConflictInfo && (
                        <div className="mt-1 text-amber-600">
                          ⚠ Hệ thống sẽ kiểm tra trùng lịch bác sĩ và phòng khám
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Selection */}
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
                    {localSchedule.doctorName && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder={
                      localSchedule.doctorName
                        ? `Đã chọn: ${localSchedule.doctorName}`
                        : "Tìm kiếm bác sĩ theo tên hoặc mã..."
                    }
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    onFocus={() => setShowDoctorDropdown(true)}
                    onClick={() => setShowDoctorDropdown(true)}
                    className={`pl-10 pr-10 h-11 transition-all duration-200 ${
                      localSchedule.doctorName
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
                    {localSchedule.doctorName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={() => {
                          handleUpdate("doctorName", "");
                          handleUpdate("doctorCode", "");
                          handleUpdate("doctorId", "");
                          setShowDoctorDropdown(false);
                        }}
                      >
                        <X className="w-3 h-3 text-green-600 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Doctor dropdown */}
                {showDoctorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const conflictedDoctors = filteredDoctors.filter(
                              (d) =>
                                d.conflictInfo?.hasConflict &&
                                !d.conflictInfo?.isCurrentDoctor
                            );
                            return (
                              conflictedDoctors.length > 0 && (
                                <span className="text-red-600 font-medium">
                                  • {conflictedDoctors.length} bị trùng lịch
                                </span>
                              )
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => {
                        const doctorName = doctor.name || doctor.fullName;
                        const doctorCode =
                          doctor.doctor_IdEmployee_Postgresql || doctor.code;
                        const doctorSpecialty =
                          doctor.specialtyName || doctor.departmentName;

                        const isSelected =
                          localSchedule.doctorName === doctorName;
                        const conflictInfo = doctor.conflictInfo;
                        const hasConflict =
                          conflictInfo?.hasConflict &&
                          !conflictInfo?.isCurrentDoctor;
                        const isDisabled = hasConflict;

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

                              handleUpdate("doctorName", doctorName);
                              handleUpdate("doctorCode", doctorCode);
                              handleUpdate("doctorId", doctor.id);
                              setShowDoctorDropdown(false);
                              setDoctorSearchQuery("");
                            }}
                            disabled={isDisabled}
                            style={{
                              pointerEvents: isDisabled ? "none" : "auto",
                            }}
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
                              ></div>
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
                                <div className="text-xs truncate mt-1">
                                  {isDisabled && conflictInfo?.hasConflict && (
                                    <div className="text-red-600 mb-1">
                                      <div className="flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span className="font-medium text-red-700">
                                          ⚠ KHÔNG THỂ CHỌN - Đã có lịch khám (
                                          {
                                            conflictInfo.conflictDetails
                                              .totalConflicts
                                          }
                                          )
                                        </span>
                                      </div>
                                    </div>
                                  )}
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
                                    {doctorCode && doctorSpecialty && " • "}
                                    {doctorCode && (
                                      <span className="inline-flex items-center gap-1">
                                        <span>🆔</span>
                                        <span>{doctorCode}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
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
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {doctorSearchQuery.trim()
                              ? "Không tìm thấy bác sĩ nào"
                              : "Không có bác sĩ khả dụng"}
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
                    )}

                    {doctorsLoading && (
                      <div className="px-3 py-4 text-center border-t">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span>Đang tải danh sách bác sĩ...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {localSchedule.doctorName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">
                      Đã chọn bác sĩ: {localSchedule.doctorName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ExamType Selection */}
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
                  value={localSchedule.examTypeName || "none"}
                  onValueChange={(value) => {
                    const selectedExamType = value === "none" ? "" : value;
                    const examType = departmentData.examTypes.find(
                      (et) => et.name === selectedExamType
                    );
                    handleUpdate("examTypeName", selectedExamType);
                    handleUpdate("examTypeId", examType?.id || null);
                    handleUpdate("specialtyName", ""); // Clear specialty
                  }}
                  disabled={departmentData.examTypes.length === 1}
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
                    {departmentData.examTypes.map((examType) => {
                      const classificationKey = `exam_${examType.id}`;
                      const classification =
                        roomClassifications?.[classificationKey];
                      const colorClass =
                        classification?.color || "bg-green-500";

                      return (
                        <SelectItem key={examType.id} value={examType.name}>
                          <div className="flex items-start gap-2 w-full py-1">
                            <div
                              className={`w-3 h-3 ${colorClass} rounded flex-shrink-0 mt-0.5 border`}
                            ></div>
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

            {/* Specialty Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded text-white flex items-center justify-center text-xs">
                    ⚕️
                  </div>
                  Chuyên khoa
                </Label>
                <div className="flex items-center gap-2">
                  {localSchedule.examTypeName ? (
                    <Badge variant="outline" className="text-xs">
                      {availableSpecialtiesForSelectedExamType.length} khoa
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Chọn loại khám trước
                    </Badge>
                  )}
                </div>
              </div>

              <Select
                value={localSchedule.specialtyName || "none"}
                onValueChange={(value) => {
                  handleUpdate("specialtyName", value === "none" ? "" : value);
                }}
                disabled={
                  !localSchedule.examTypeName ||
                  availableSpecialtiesForSelectedExamType.length === 1
                }
              >
                <SelectTrigger
                  className={`h-10 ${
                    availableSpecialtiesForSelectedExamType.length === 1
                      ? "bg-purple-50 border-purple-200"
                      : !localSchedule.examTypeName
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white"
                  }`}
                >
                  <SelectValue
                    placeholder={
                      !localSchedule.examTypeName
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
                  {availableSpecialtiesForSelectedExamType.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      <div className="flex items-center gap-2 w-full py-1">
                        <div className="w-3 h-3 bg-purple-500 rounded flex-shrink-0"></div>
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {specialty}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status messages */}
              {!localSchedule.examTypeName && (
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

              {localSchedule.examTypeName &&
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
                          Loại khám
                          <strong>{localSchedule.examTypeName}</strong> hiện
                          không có chuyên khoa nào
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Time Configuration */}
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
                      Thời gian chỉ có thể là bội số của 30 phút (VD: 07:00,
                      07:30, 08:00, 08:30...)
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
                        const correctedTime = roundToNearestHalfHour(value);

                        // ✅ Chỉ lưu HH:mm, không thêm ":00"
                        handleUpdate("timeStart", correctedTime);
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
                        return <option key={timeString} value={timeString} />;
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
                          const newMinutes = minutes === 30 ? 0 : 30;
                          const newHours = minutes === 30 ? hours + 1 : hours;
                          const adjustedHours = newHours >= 24 ? 0 : newHours;
                          const newTime = `${adjustedHours
                            .toString()
                            .padStart(2, "0")}:${newMinutes
                            .toString()
                            .padStart(2, "0")}`;

                          // ✅ Không thêm ":00"
                          handleUpdate("timeStart", newTime);
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
                        const correctedTime = roundToNearestHalfHour(value);

                        // ✅ Chỉ lưu HH:mm, không thêm ":00"
                        handleUpdate("timeEnd", correctedTime);
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
                        return <option key={timeString} value={timeString} />;
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
                          const newMinutes = minutes === 30 ? 0 : 30;
                          const newHours = minutes === 30 ? hours + 1 : hours;
                          const adjustedHours = newHours >= 24 ? 0 : newHours;
                          const newTime = `${adjustedHours
                            .toString()
                            .padStart(2, "0")}:${newMinutes
                            .toString()
                            .padStart(2, "0")}`;

                          // ✅ Không thêm ":00"
                          handleUpdate("timeEnd", newTime);
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
                    <span className="text-gray-600">Thời gian làm việc:</span>
                    <span className="font-medium text-gray-900">
                      {(() => {
                        const start = currentTime.startTime
                          .split(":")
                          .map(Number);
                        const end = currentTime.endTime.split(":").map(Number);
                        const startMinutes = start[0] * 60 + start[1];
                        const endMinutes = end[0] * 60 + end[1];
                        const diffMinutes = endMinutes - startMinutes;
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {/* Appointment configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cấu hình lượt khám
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
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 10;
                          handleUpdate("total", value);
                        }}
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
                    <Label className="text-xs text-gray-500">Số giữ chỗ</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={getHoldSlots(localSchedule)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleUpdate("holdSlot", value);
                        }}
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
                        value={localSchedule.spaceMinutes || 30}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 30;
                          handleUpdate("spaceMinutes", value);
                        }}
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
                  📅 {currentTime.maxAppointments} lượt trong
                  {localSchedule.spaceMinutes || 30} phút/lượt
                </span>
              </div>

              {getHoldSlots(localSchedule) > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCustomTime ? "bg-orange-400" : "bg-blue-400"
                    }`}
                  ></div>
                  <span className="font-medium">
                    🔒 {getHoldSlots(localSchedule)} slot giữ chỗ
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs opacity-80">
                <span>
                  Thời gian: {currentTime.startTime}-{currentTime.endTime}
                </span>
              </div>
            </div>

            {slotInfo && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                💡 Mặc định cho ca này:
                <strong>{slotInfo.defaultMaxAppointments} lượt</strong>
                {" • "}
                <span>
                  {slotInfo.defaultStartTime}-{slotInfo.defaultEndTime}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons - Sticky footer */}
          <div className="border-t bg-gray-50/50 p-4">
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 bg-white hover:bg-gray-50"
                onClick={handleClose}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-9 px-4 hover:bg-red-600"
                onClick={handleRemove}
              >
                <X className="w-3 h-3 mr-2" />
                Xóa lịch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Export cho ClinicScheduleDetailPopover sử dụng
export { ClinicScheduleEditButton as ClinicScheduleEditPopover };

export default ClinicScheduleEditButton;
