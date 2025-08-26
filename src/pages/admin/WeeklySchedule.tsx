import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchZones } from "@/store/slices/zoneSlice";
import { fetchDepartments } from "@/store/slices/departmentSlice";
import { fetchExaminations } from "@/store/slices/examinationSlice";
import { fetchRooms } from "@/store/slices/roomSlice";
import { fetchSpecialties } from "@/store/slices/specialtySlice";
import { fetchDoctors } from "@/store/slices/doctorSlice";
// ✅ Thêm missing imports
import {
  fetchExamTypes,
  fetchDepartmentsByZone,
} from "@/store/slices/examTypeSlice";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { format, getISOWeek } from "date-fns";

// Import components
import { WeeklyScheduleHeader } from "@/pages/admin/weekly-schedule/WeeklyScheduleHeader";
import { WeeklyScheduleControls } from "@/pages/admin/weekly-schedule/WeeklyScheduleControls";
import { WeeklyScheduleTable } from "@/pages/admin/weekly-schedule/WeeklyScheduleTable";
import { WeeklyScheduleLegend } from "@/pages/admin/weekly-schedule/WeeklyScheduleLegend";
import { WeeklyScheduleStats } from "@/pages/admin/weekly-schedule/WeeklyScheduleStats";
import { ShiftConfigDialog } from "@/pages/admin/weekly-schedule/ShiftConfigDialog";
import { RoomClassificationDialog } from "@/pages/admin/weekly-schedule/RoomClassificationDialog";
import { getWeeksList } from "@/pages/admin/weekly-schedule/data";

// ✅ Add missing types
interface ShiftSlot {
  rooms: RoomSlot[];
}

interface RoomSlot {
  id: string;
  name: string;
  code?: string;
  classification: string;
  customStartTime?: string;
  customEndTime?: string;
  appointmentCount?: number;
  specialties: string[];
  selectedSpecialty?: string;
  selectedDoctor?: string;
  priorityOrder?: number;
  notes?: string;
  zoneId?: number;
  zoneName?: string;
}

export interface CloneOptions {
  includeRooms: boolean;
  includeSpecialties: boolean;
  includeDoctors: boolean;
  includeTimeSettings: boolean;
  overwriteExisting: boolean;
}

export interface CloneWeekAction {
  action: "clone_week";
  sourceWeek: string;
  targetWeeks: string[];
  options: CloneOptions;
  roomCount: number;
}

const WeeklySchedule = () => {
  const dispatch = useAppDispatch();

  // ✅ Add missing state declarations
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = getISOWeek(now);
    return `${year}-W${week.toString().padStart(2, "0")}`;
  });
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState("all");
  const [scheduleData, setScheduleData] = useState<
    Record<string, Record<string, ShiftSlot>>
  >({});
  const [scheduleChanges, setScheduleChanges] = useState<Record<string, any>>(
    {}
  );
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [showShiftConfigDialog, setShowShiftConfigDialog] = useState(false);
  const [showRoomClassificationDialog, setShowRoomClassificationDialog] =
    useState(false);
  const [shiftDefaults, setShiftDefaults] = useState({
    morning: { startTime: "07:30", endTime: "11:00", maxAppointments: 10 },
    afternoon: { startTime: "13:00", endTime: "17:00", maxAppointments: 10 },
    evening: { startTime: "17:30", endTime: "20:30", maxAppointments: 8 },
  });
  const [roomClassifications, setRoomClassifications] = useState({
    normal: {
      name: "Phòng thường",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      enabled: true,
    },
    vip: {
      name: "Phòng VIP",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      enabled: true,
    },
    emergency: {
      name: "Phòng cấp cứu",
      color: "bg-red-50 text-red-700 border-red-200",
      enabled: true,
    },
  });

  // ✅ Add missing ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Add missing weeks data
  const weeks = useMemo(() => getWeeksList(), []);

  // ✅ Redux selectors với fallback và error handling
  const { list: zones = [], loading: zonesLoading } = useAppSelector(
    (state) => state.zone
  );
  const { list: allDepartments = [], loading: departmentsLoading } =
    useAppSelector((state) => state.department);
  const { list: examinations = [], loading: examinationsLoading } =
    useAppSelector((state) => state.examination);
  const { list: allRooms = [], loading: roomsLoading } = useAppSelector(
    (state) => state.room
  );
  const { list: allSpecialties = [], loading: specialtiesLoading } =
    useAppSelector((state) => state.specialty);
  const {
    list: allDoctors = [],
    loading: doctorsLoading,
    error: doctorsError,
  } = useAppSelector((state) => state.doctor);

  // ✅ Thêm examType selectors
  const {
    list: examTypes = [],
    examsByZone = {},
    departmentsByZone = {},
    zoneDataLoading = {},
    zoneDataErrors = {},
    loading: examTypesLoading,
  } = useAppSelector((state) => state.examType);

  // ✅ Fetch all required data với error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchZones()),
          dispatch(fetchDepartments()),
          dispatch(fetchExaminations()),
          dispatch(fetchRooms()),
          dispatch(fetchSpecialties()),
          dispatch(fetchDoctors()),
          dispatch(fetchExamTypes(true)), // ✅ Thêm
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
      }
    };

    fetchData();
  }, [dispatch]);

  // ✅ Fetch zone-specific data khi selectedZone thay đổi
  useEffect(() => {
    const fetchZoneData = async () => {
      if (selectedZone && selectedZone !== "all" && zones.length > 0) {
        try {
          // ✅ Gọi 2 API riêng lẻ
          const [departmentsResult] = await Promise.all([
            dispatch(fetchDepartmentsByZone(selectedZone)),
          ]);
        } catch (error) {
          console.error(`❌ Error fetching zone ${selectedZone} data:`, error);
          toast.error(`Lỗi khi tải dữ liệu cho khu khám ${selectedZone}`);
        }
      }
    };

    const timeoutId = setTimeout(fetchZoneData, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedZone, zones, dispatch]);

  useEffect(() => {
    if (selectedZone && selectedZone !== "all") {
      const zoneDepartments = departmentsByZone[selectedZone] || [];
      const isLoading = zoneDataLoading[selectedZone] || false;
      const error = zoneDataErrors[selectedZone] || null;
    }
  }, [
    selectedZone,
    examsByZone,
    departmentsByZone,
    zoneDataLoading,
    zoneDataErrors,
    zones,
  ]);

  // ✅ Debug trong useEffect

  // ✅ Convert specialties from Redux state with fallback
  const availableSpecialties = useMemo(() => {
    if (!allSpecialties || allSpecialties.length === 0) {
      return ["Khám chuyên khoa", "Khám nội tổng quát"];
    }

    return allSpecialties
      .filter((specialty) => specialty.enable)
      .map((specialty) => specialty.name);
  }, [allSpecialties]);

  // ✅ Convert doctors from Redux state with fallback
  const availableDoctors = useMemo(() => {
    try {
      if (allDoctors && Array.isArray(allDoctors) && allDoctors.length > 0) {
        const processedDoctors = allDoctors
          .filter((doctor) => {
            // ✅ Kiểm tra doctor có valid không
            const isValid =
              doctor &&
              (doctor.id || doctor.id === 0) &&
              (doctor.name || doctor.fullName);

            if (!isValid) {
              console.warn("⚠️ Invalid doctor:", doctor);
            }

            return isValid && doctor.enable !== false; // Default to enabled if not specified
          })
          .map((doctor) => {
            const processed = {
              id: doctor.id?.toString() || Math.random().toString(),
              code:
                doctor.code ||
                doctor.doctor_IdEmployee_Postgresql ||
                doctor.id?.toString() ||
                "",
              name: doctor.fullName || doctor.name || "Bác sĩ",
              specialty: doctor.specialtyName || "Chưa xác định",
              specialtyId: doctor.specialtyId,
              departmentId: doctor.departmentId,
              departmentName: doctor.departmentName,
              email: doctor.email,
              phone: doctor.phone,
              originalData: doctor, // ✅ Keep original for debugging
            };

            return processed;
          })
          .filter((doctor) => doctor.name && doctor.id);

        if (processedDoctors.length > 0) {
          return processedDoctors;
        }
      }
    } catch (error) {
      console.error("❌ Error processing doctors:", error);
    }

    // ✅ Enhanced fallback data
    return [
      {
        id: "BS001",
        code: "BS001",
        name: "BS. Nguyễn Thị Mai",
        specialty: "Nhi khoa tổng quát",
        specialtyId: 1,
        departmentId: 1,
        departmentName: "Khoa Nhi",
      },
      {
        id: "BS002",
        code: "BS002",
        name: "BS. Trần Văn Nam",
        specialty: "Tim mạch nhi",
        specialtyId: 2,
        departmentId: 1,
        departmentName: "Khoa Nhi",
      },
    ];
  }, [allDoctors]);

  // ✅ Available rooms with real data
  const availableRooms = useMemo(() => {
    if (!allRooms) return [];

    return allRooms
      .filter((room) => room.enable)
      .map((room) => {
        const roomSpecialties = availableSpecialties.filter(() => true); // All specialties available for now

        return {
          id: room.id.toString(),
          name: room.name,
          code: room.code || room.name,
          classification: "normal",
          specialties:
            roomSpecialties.length > 0 ? roomSpecialties : ["Khám chuyên khoa"],
          zoneId: room.zoneId,
          zoneName: room.zoneName,
        };
      });
  }, [allRooms, availableSpecialties]);

  // ✅ Helper functions
  const getDoctorsBySpecialty = useCallback(
    (specialtyName: string) => {
      return availableDoctors.filter(
        (doctor) => doctor.specialty === specialtyName
      );
    },
    [availableDoctors]
  );

  const getDoctorsByDepartment = useCallback(
    (departmentId: string) => {
      return availableDoctors.filter(
        (doctor) => doctor.departmentId?.toString() === departmentId
      );
    },
    [availableDoctors]
  );

  // ✅ Get week date range
  const getWeekDateRange = (weekString: string) => {
    const [year, weekStr] = weekString.split("-W");
    const weekNum = parseInt(weekStr);
    const yearNum = parseInt(year);

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
  };

  // ✅ timeSlots calculation
  const timeSlots = useMemo(() => {
    const weekRange = getWeekDateRange(selectedWeek);
    const slots = [];
    const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

    const allExaminations = examinations || [];

    for (let i = 0; i < 5; i++) {
      const currentDay = new Date(weekRange.mondayDate);
      currentDay.setDate(weekRange.mondayDate.getDate() + i);

      const formattedDate = format(currentDay, "dd/MM");
      const fullDate = format(currentDay, "yyyy-MM-dd");

      allExaminations.forEach((exam) => {
        slots.push({
          id: `${fullDate}-${exam.id}`,
          day: dayNames[i],
          period: exam.workSession,
          periodName: exam.name,
          date: formattedDate,
          fullDate: fullDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          examinationId: exam.id,
          workSession: exam.workSession,
          enabled: exam.enable,
          disabled: !exam.enable,
        });
      });
    }

    return slots;
  }, [selectedWeek, examinations]);

  // ✅ Week range for header
  const weekRange = useMemo(
    () => getWeekDateRange(selectedWeek),
    [selectedWeek]
  );

  // ✅ Initialize schedule data when departments are loaded
  useEffect(() => {
    if (allDepartments.length > 0) {
      const initialData: Record<string, Record<string, ShiftSlot>> = {};

      allDepartments
        .filter((dept) => dept.enable)
        .forEach((dept) => {
          initialData[dept.id.toString()] = {};
        });

      setScheduleData(initialData);
    }
  }, [allDepartments]);

  // ✅ Zone options
  const zoneOptions = useMemo(() => {
    return [
      { id: "all", name: "Tất cả khu khám" },
      ...(zones || []).map((zone) => ({
        id: zone.id.toString(),
        name: zone.name,
      })),
    ];
  }, [zones]);

  // ✅ Zone options with room count
  const zoneOptionsWithRoomCount = useMemo(() => {
    return zoneOptions.map((zone) => ({
      ...zone,
      roomCount:
        zone.id === "all"
          ? allRooms.length
          : allRooms.filter((room) => room.zoneId?.toString() === zone.id)
              .length,
    }));
  }, [zoneOptions, allRooms]);

  // ✅ Filtered rooms by zone
  const filteredRoomsByZone = useMemo(() => {
    if (selectedZone === "all") {
      return availableRooms;
    }
    return availableRooms.filter(
      (room) => room.zoneId?.toString() === selectedZone
    );
  }, [availableRooms, selectedZone]);

  // ✅ Helper to get used rooms in a specific slot
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
                  const roomId =
                    room.id || room.roomId || room.name || String(room);
                  usedRoomIds.add(roomId);
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

  // ✅ Room style helper
  const getRoomStyle = (type: string) => {
    const classification =
      roomClassifications[type as keyof typeof roomClassifications];
    if (classification && classification.enabled) {
      return `${classification.color} hover:opacity-80 transition-opacity`;
    }
    return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  };

  // ✅ Add room to shift function
  const addRoomToShift = useCallback(
    (deptId: string, slotId: string, roomId: string) => {
      try {
        const roomInfo = availableRooms.find((r) => r.id === roomId);
        const slot = timeSlots.find((t) => t.id === slotId);

        if (!roomInfo) {
          toast.error("Không tìm thấy thông tin phòng!");
          return;
        }

        if (!slot) {
          toast.error("Không tìm thấy thông tin ca khám!");
          return;
        }

        if (slot.disabled) {
          toast.error("Không thể thêm phòng vào ca khám đã tắt!");
          return;
        }

        const usedRooms = getUsedRoomsInSlot(slotId);
        if (usedRooms.has(roomId)) {
          toast.error(`Phòng ${roomInfo.name} đã được sử dụng trong ca này!`);
          return;
        }

        const cellKey = `${deptId}-${slotId}`;
        const shiftConfig = shiftDefaults[slot.workSession];

        const fallbackConfig = {
          startTime: slot.startTime?.slice(0, 5) || "07:30",
          endTime: slot.endTime?.slice(0, 5) || "11:00",
          maxAppointments: 10,
        };

        const newRoom: RoomSlot = {
          id: roomInfo.id,
          name: roomInfo.name,
          code: roomInfo.code,
          classification: roomInfo.classification,
          customStartTime: shiftConfig?.startTime || fallbackConfig.startTime,
          customEndTime: shiftConfig?.endTime || fallbackConfig.endTime,
          appointmentCount:
            shiftConfig?.maxAppointments || fallbackConfig.maxAppointments,
          specialties: [...(roomInfo.specialties || [])],
          selectedSpecialty: "", // ✅ Không set mặc định, để trống
          selectedDoctor: "", // ✅ Giữ nguyên - không set mặc định
          priorityOrder: 10,
          zoneId: roomInfo.zoneId,
          zoneName: roomInfo.zoneName,
        };

        setUndoStack((prev) => [...prev, { ...scheduleData }]);
        setRedoStack([]);

        setScheduleData((prev) => ({
          ...prev,
          [deptId]: {
            ...prev[deptId],
            [slotId]: {
              rooms: [...(prev[deptId]?.[slotId]?.rooms || []), newRoom],
            },
          },
        }));

        setScheduleChanges((prev) => ({
          ...prev,
          [cellKey]: { action: "add_room", roomId },
        }));

        toast.success(`Đã thêm ${roomInfo.name} vào lịch khám`);
      } catch (error) {
        console.error("Error adding room to shift:", error);
        toast.error("Lỗi khi thêm phòng vào ca khám!");
      }
    },
    [availableRooms, timeSlots, getUsedRoomsInSlot, shiftDefaults, scheduleData]
  );

  // ✅ Remove room function
  const removeRoomFromShift = (
    deptId: string,
    slotId: string,
    roomIndex: number
  ) => {
    const cellKey = `${deptId}-${slotId}`;

    setUndoStack((prev) => [...prev, { ...scheduleData }]);
    setRedoStack([]);

    setScheduleData((prev) => {
      const currentRooms = prev[deptId]?.[slotId]?.rooms || [];
      const updatedRooms = currentRooms.filter(
        (_, index) => index !== roomIndex
      );

      return {
        ...prev,
        [deptId]: {
          ...prev[deptId],
          [slotId]:
            updatedRooms.length > 0 ? { rooms: updatedRooms } : undefined,
        },
      };
    });

    setScheduleChanges((prev) => ({
      ...prev,
      [cellKey]: { action: "remove_room", roomIndex },
    }));

    toast.success("Đã xóa phòng khỏi lịch khám");
  };

  // ✅ Update room config function
  const updateRoomConfig = (
    deptId: string,
    slotId: string,
    roomIndex: number,
    updates: Partial<RoomSlot>
  ) => {
    const cellKey = `${deptId}-${slotId}`;

    setUndoStack((prev) => [...prev, { ...scheduleData }]);
    setRedoStack([]);

    setScheduleData((prev) => {
      const currentRooms = [...(prev[deptId]?.[slotId]?.rooms || [])];
      if (currentRooms[roomIndex]) {
        currentRooms[roomIndex] = { ...currentRooms[roomIndex], ...updates };
      }

      return {
        ...prev,
        [deptId]: {
          ...prev[deptId],
          [slotId]: { rooms: currentRooms },
        },
      };
    });

    setScheduleChanges((prev) => ({
      ...prev,
      [cellKey]: { action: "update_room", roomIndex, updates },
    }));

    toast.success("Đã cập nhật cấu hình phòng");
  };

  // ✅ Undo/Redo functions
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [scheduleData, ...prev]);
      setScheduleData(lastState);
      setUndoStack((prev) => prev.slice(0, -1));
      toast.success("Đã hoàn tác");
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack((prev) => [...prev, scheduleData]);
      setScheduleData(nextState);
      setRedoStack((prev) => prev.slice(1));
      toast.success("Đã làm lại");
    }
  };

  const handleSaveAll = () => {
    setTimeout(() => {
      setScheduleChanges({});
      toast.success("Đã lưu tất cả thay đổi thành công!");
    }, 1000);
  };

  // ✅ Add missing shift config save handler
  const handleShiftConfigSave = (newDefaults: any) => {
    setShiftDefaults(newDefaults);
    toast.success("Đã lưu cấu hình ca khám!");
  };

  // ✅ Departments for filtering
  const departments = useMemo(() => {
    return [
      { id: "all", name: "Tất cả khoa phòng" },
      ...(allDepartments || [])
        .filter((dept) => dept.enable)
        .map((dept) => ({
          id: dept.id.toString(),
          name: dept.name,
        })),
    ];
  }, [allDepartments]);

  const filteredDepartments = useMemo(() => {
    if (selectedDepartment === "all") {
      return departments.filter((d) => d.id !== "all");
    }
    return departments.filter((d) => d.id === selectedDepartment);
  }, [departments, selectedDepartment]);

  const searchFilteredDepartments = useMemo(() => {
    return searchTerm
      ? filteredDepartments.filter((dept) =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredDepartments;
  }, [filteredDepartments, searchTerm]);

  // ✅ Excel functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        toast.success(
          `Đã tải lên file Excel thành công! ${jsonData.length} dòng dữ liệu.`
        );
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error(
          "Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file."
        );
      }
    };
    reader.readAsArrayBuffer(file);

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDownloadExcel = () => {
    try {
      const exportData: any[] = [];

      exportData.push([
        "Khoa phòng",
        "Ngày",
        "Ca",
        "Phòng",
        "Phân loại",
        "Giờ bắt đầu",
        "Giờ kết thúc",
        "Số lượng khám",
        "Chức năng chuyên môn",
      ]);

      Object.entries(scheduleData).forEach(([deptId, deptSchedule]) => {
        const department = departments.find((d) => d.id === deptId);

        Object.entries(deptSchedule).forEach(([slotId, slot]) => {
          const timeSlot = timeSlots.find((t) => t.id === slotId);

          slot.rooms.forEach((room) => {
            const period = slotId.includes("morning")
              ? "morning"
              : slotId.includes("afternoon")
              ? "afternoon"
              : "evening";
            const defaultShift = shiftDefaults[period];

            exportData.push([
              department?.name || deptId,
              `${timeSlot?.day} ${timeSlot?.date}`,
              timeSlot?.period || "N/A",
              room.name,
              roomClassifications[
                room.classification as keyof typeof roomClassifications
              ]?.name || room.classification,
              room.customStartTime || defaultShift?.startTime || "07:30",
              room.customEndTime || defaultShift?.endTime || "11:00",
              room.appointmentCount || defaultShift?.maxAppointments || 10,
              room.selectedSpecialty || "Khám chuyên khoa",
            ]);
          });
        });
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      const maxWidth = exportData.reduce((acc, row) => {
        row.forEach((cell: any, index: number) => {
          const cellLength = String(cell).length;
          acc[index] = Math.max(acc[index] || 10, cellLength);
        });
        return acc;
      }, [] as number[]);

      worksheet["!cols"] = maxWidth.map((width) => ({
        width: Math.min(width + 2, 50),
      }));

      XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch khám tuần");

      const filename = `Lich_kham_tuan_${
        weekRange.weekNum
      }_${weekRange.startDate.replace("/", "")}-${weekRange.endDate.replace(
        "/",
        ""
      )}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success("Đã tải xuống file Excel thành công!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Lỗi khi xuất file Excel.");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // ✅ Navigation functions
  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex((week) => week.value === selectedWeek);
    if (currentIndex > 0) {
      setSelectedWeek(weeks[currentIndex - 1].value);
    } else {
      toast.info("Đã đến tuần sớm nhất");
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex((week) => week.value === selectedWeek);
    if (currentIndex < weeks.length - 1) {
      setSelectedWeek(weeks[currentIndex + 1].value);
    } else {
      toast.info("Đã đến tuần muộn nhất");
    }
  };

  // ✅ Thêm function nhân bản tuần
  const handleCloneWeek = useCallback(
    (targetWeeks: string[], options: CloneOptions) => {
      try {
        if (!scheduleData || Object.keys(scheduleData).length === 0) {
          toast.error("Không có dữ liệu để nhân bản!");
          return;
        }

        // ✅ Backup current state để undo
        setUndoStack((prev) => [...prev, { ...scheduleData }]);
        setRedoStack([]);

        let totalClonedRooms = 0;
        const sourceWeekData = { ...scheduleData };

        setScheduleData((prev) => {
          const newData = { ...prev };

          targetWeeks.forEach((targetWeek) => {
            // ✅ Tạo mapping từ slot ID tuần nguồn sang tuần đích
            const sourceSlots = timeSlots.filter((slot) =>
              slot.id.includes(selectedWeek.split("-W")[0])
            );

            const targetSlots = timeSlots.filter((slot) =>
              slot.id.includes(targetWeek.split("-W")[0])
            );

            Object.entries(sourceWeekData).forEach(([deptId, deptSchedule]) => {
              if (!newData[deptId]) {
                newData[deptId] = {};
              }

              Object.entries(deptSchedule || {}).forEach(
                ([sourceSlotId, slot]: [string, any]) => {
                  if (!slot?.rooms || !Array.isArray(slot.rooms)) return;

                  // ✅ Tìm slot tương ứng trong tuần đích
                  const sourceSlot = sourceSlots.find(
                    (s) => s.id === sourceSlotId
                  );
                  if (!sourceSlot) return;

                  // ✅ Tìm slot cùng ngày và ca trong tuần đích
                  const targetSlot = targetSlots.find(
                    (ts) =>
                      ts.day === sourceSlot.day &&
                      ts.workSession === sourceSlot.workSession
                  );

                  if (!targetSlot) return;

                  const targetSlotId = targetSlot.id;

                  // ✅ Xử lý ghi đè hoặc bổ sung
                  let existingRooms: any[] = [];
                  if (
                    !options.overwriteExisting &&
                    newData[deptId][targetSlotId]?.rooms
                  ) {
                    existingRooms = [...newData[deptId][targetSlotId].rooms];
                  }

                  // ✅ Clone rooms với options
                  const clonedRooms = slot.rooms.map((room: any) => {
                    const clonedRoom = {
                      ...room,
                      id: room.id, // Giữ nguyên ID phòng
                    };

                    // ✅ Áp dụng options
                    if (!options.includeSpecialties) {
                      clonedRoom.selectedSpecialty = "";
                    }
                    if (!options.includeDoctors) {
                      clonedRoom.selectedDoctor = "";
                    }
                    if (!options.includeTimeSettings) {
                      clonedRoom.customStartTime = "";
                      clonedRoom.customEndTime = "";
                      clonedRoom.appointmentCount = 0;
                    }

                    return clonedRoom;
                  });

                  // ✅ Kết hợp với rooms hiện có (nếu không ghi đè)
                  const finalRooms = options.overwriteExisting
                    ? clonedRooms
                    : [...existingRooms, ...clonedRooms];

                  newData[deptId][targetSlotId] = {
                    rooms: finalRooms,
                  };

                  totalClonedRooms += clonedRooms.length;
                }
              );
            });
          });

          return newData;
        });

        // ✅ Track changes
        const changeKey = `clone-${Date.now()}`;
        setScheduleChanges((prev) => ({
          ...prev,
          [changeKey]: {
            action: "clone_week",
            sourceWeek: selectedWeek,
            targetWeeks,
            options,
            roomCount: totalClonedRooms,
          },
        }));

        toast.success(
          `Đã nhân bản thành công ${totalClonedRooms} phòng sang ${targetWeeks.length} tuần!`
        );
      } catch (error) {
        console.error("❌ Error cloning week:", error);
        toast.error("Lỗi khi nhân bản tuần!");
      }
    },
    [scheduleData, selectedWeek, timeSlots]
  );

  // ✅ Loading check
  const isLoading =
    zonesLoading ||
    departmentsLoading ||
    examinationsLoading ||
    roomsLoading ||
    specialtiesLoading ||
    doctorsLoading ||
    examTypesLoading ||
    (selectedZone !== "all" && zoneDataLoading[selectedZone]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 min-w-0 overflow-x-auto">
        <WeeklyScheduleHeader
          weekRange={weekRange}
          selectedWeek={selectedWeek}
          viewMode={viewMode}
          selectedDay={selectedDay}
        />

        <WeeklyScheduleControls
          allRooms={allRooms}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          zoneOptions={zoneOptionsWithRoomCount}
          weeks={weeks}
          departments={departments}
          timeSlots={timeSlots}
          shiftDefaults={shiftDefaults}
          filteredRoomsByZone={filteredRoomsByZone}
          scheduleData={scheduleData}
          handlePreviousWeek={handlePreviousWeek}
          handleNextWeek={handleNextWeek}
          triggerFileUpload={triggerFileUpload}
          handleDownloadExcel={handleDownloadExcel}
          setShowShiftConfigDialog={setShowShiftConfigDialog}
          setShowRoomClassificationDialog={setShowRoomClassificationDialog}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          handleSaveAll={handleSaveAll}
          undoStack={undoStack}
          redoStack={redoStack}
          scheduleChanges={scheduleChanges}
          onCloneWeek={handleCloneWeek} // ✅ Thêm prop mới
        />

        <WeeklyScheduleTable
          searchFilteredDepartments={searchFilteredDepartments}
          timeSlots={timeSlots}
          viewMode={viewMode}
          selectedDay={selectedDay}
          selectedWeek={selectedWeek}
          scheduleData={scheduleData}
          scheduleChanges={scheduleChanges}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          roomSearchTerm={roomSearchTerm}
          setRoomSearchTerm={setRoomSearchTerm}
          filteredRooms={filteredRoomsByZone}
          allRooms={allRooms}
          availableSpecialties={availableSpecialties}
          availableDoctors={availableDoctors}
          getDoctorsBySpecialty={getDoctorsBySpecialty}
          getDoctorsByDepartment={getDoctorsByDepartment}
          roomClassifications={roomClassifications}
          shiftDefaults={shiftDefaults}
          addRoomToShift={addRoomToShift}
          removeRoomFromShift={removeRoomFromShift}
          updateRoomConfig={updateRoomConfig}
          getRoomStyle={getRoomStyle}
        />

        <WeeklyScheduleLegend roomClassifications={roomClassifications} />

        <WeeklyScheduleStats
          departments={departments}
          scheduleData={scheduleData}
          scheduleChanges={scheduleChanges}
        />

        <ShiftConfigDialog
          showShiftConfigDialog={showShiftConfigDialog}
          setShowShiftConfigDialog={setShowShiftConfigDialog}
          shiftDefaults={shiftDefaults}
          onSave={handleShiftConfigSave}
          examinations={examinations}
        />

        <RoomClassificationDialog
          showRoomClassificationDialog={showRoomClassificationDialog}
          setShowRoomClassificationDialog={setShowRoomClassificationDialog}
          roomClassifications={roomClassifications}
          setRoomClassifications={setRoomClassifications}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
};

export default WeeklySchedule;
