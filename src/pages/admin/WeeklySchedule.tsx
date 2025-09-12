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
import { fetchDoctors } from "@/store/slices/doctorSlice";
// ✅ Thêm missing imports
import {
  fetchExamTypes,
  fetchDepartmentsByZone,
} from "@/store/slices/examTypeSlice";
import {
  addClinicSchedules,
  fetchClinicSchedules,
} from "@/store/slices/clinicScheduleSlice";
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

interface ShiftConfig {
  startTime: string;
  endTime: string;
  maxAppointments: number;
  name?: string;
  examinationId?: number;
  workSession?: string;
}

interface ShiftDefaults {
  [key: string]: ShiftConfig;
  morning?: ShiftConfig;
  afternoon?: ShiftConfig;
  evening?: ShiftConfig;
}

interface RoomSlot {
  id: string;
  name: string;
  code?: string;
  classification: string;
  customStartTime?: string;
  customEndTime?: string;
  appointmentCount?: number;
  maxAppointments?: number;
  holdSlot?: number;
  appointmentDuration?: number;
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
  const [shiftDefaults, setShiftDefaults] = useState<ShiftDefaults>({
    morning: { startTime: "07:30", endTime: "11:00", maxAppointments: 10 },
    afternoon: { startTime: "13:00", endTime: "17:00", maxAppointments: 10 },
    evening: { startTime: "17:30", endTime: "20:30", maxAppointments: 8 },
  });
  const [roomClassificationSettings, setRoomClassificationSettings] = useState({
    showDialog: false,
  });

  // ✅ State để lưu custom room classifications colors
  const [customClassificationColors, setCustomClassificationColors] = useState<
    Record<string, string>
  >({});

  // ✅ State để track việc đã populate clinic schedules chưa
  const [isClinicSchedulesPopulated, setIsClinicSchedulesPopulated] =
    useState(false);

  // ✅ State để force refresh UI khi cần thiết
  const [refreshCounter, setRefreshCounter] = useState(0);

  // ✅ State để lưu thông tin week clone indicators
  const [recentClonedWeeks, setRecentClonedWeeks] = useState<{
    targetWeeks: string[];
    sourceWeek: string;
    roomCount: number;
    timestamp: number;
  } | null>(null);

  // ✅ State để lưu thông tin xung đột
  const [scheduleConflicts, setScheduleConflicts] = useState<{
    doctorConflicts: any[];
    roomConflicts: any[];
  }>({
    doctorConflicts: [],
    roomConflicts: [],
  });

  // ✅ Add missing ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Add missing weeks data
  const weeks = useMemo(() => getWeeksList(), []);

  // ✅ Redux selectors với fallback và error handling
  const { list: zones = [], loading: zonesLoading } = useAppSelector(
    (state) => state.zone
  );
  const { list: examinations = [], loading: examinationsLoading } =
    useAppSelector((state) => state.examination);
  const { list: allRooms = [], loading: roomsLoading } = useAppSelector(
    (state) => state.room
  );
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

  // ✅ Clinic schedule selectors
  const {
    list: clinicSchedules = [],
    loading: clinicSchedulesLoading,
    error: clinicSchedulesError,
  } = useAppSelector((state) => state.clinicSchedule);

  // ✅ Dynamic room classifications với custom colors từ user
  const roomClassifications = useMemo(() => {
    const defaultClassifications = {
      normal: {
        name: "Thường",
        color:
          customClassificationColors["normal"] ||
          "bg-blue-50 text-blue-700 border-blue-200",
        enabled: true,
        editable: true, // ✅ Cho phép edit
      },
      vip: {
        name: "VIP",
        color:
          customClassificationColors["vip"] ||
          "bg-purple-50 text-purple-700 border-purple-200",
        enabled: true,
        editable: true,
      },
      priority: {
        name: "Ưu tiên",
        color:
          customClassificationColors["priority"] ||
          "bg-red-50 text-red-700 border-red-200",
        enabled: true,
        editable: true,
      },
    };

    // ✅ Lấy classifications từ examsByZone và cho phép custom màu
    if (selectedZone && selectedZone !== "all" && examsByZone[selectedZone]) {
      const zoneExams = examsByZone[selectedZone];
      const customClassifications = { ...defaultClassifications };

      // ✅ Tạo classifications từ exam types với màu có thể custom
      if (Array.isArray(zoneExams)) {
        const defaultColors = [
          "bg-green-50 text-green-700 border-green-200",
          "bg-yellow-50 text-yellow-700 border-yellow-200",
          "bg-indigo-50 text-indigo-700 border-indigo-200",
          "bg-pink-50 text-pink-700 border-pink-200",
          "bg-orange-50 text-orange-700 border-orange-200",
          "bg-cyan-50 text-cyan-700 border-cyan-200",
        ];

        zoneExams.forEach((exam, index) => {
          if (exam.id && exam.name) {
            const colorIndex = index % defaultColors.length;
            const shortName =
              exam.name.length > 10
                ? exam.name.substring(0, 10) + "..."
                : exam.name;

            const classificationKey = `exam_${exam.id}`;
            customClassifications[classificationKey] = {
              name: shortName,
              color:
                customClassificationColors[classificationKey] ||
                defaultColors[colorIndex],
              enabled: exam.enable !== false,
              editable: true, // ✅ Cho phép user chỉnh sửa màu
            };
          }
        });
      }

      return customClassifications;
    }

    return defaultClassifications;
  }, [examsByZone, selectedZone, customClassificationColors]);

  // ✅ Function để update room classifications với custom colors
  const setRoomClassifications = useCallback(
    (newClassifications: any) => {
      // ✅ Lưu custom colors cho từng classification
      const newCustomColors = {};
      Object.entries(newClassifications).forEach(
        ([key, classification]: [string, any]) => {
          if (classification.color) {
            newCustomColors[key] = classification.color;
          }
        }
      );

      setCustomClassificationColors((prev) => ({
        ...prev,
        ...newCustomColors,
      }));

      // ✅ Lưu vào localStorage để persist across sessions
      try {
        const storageKey = `roomClassificationColors_${selectedZone}`;
        localStorage.setItem(storageKey, JSON.stringify(newCustomColors));
        toast.success("Đã lưu cấu hình màu sắc!");
      } catch (error) {
        console.error("Error saving colors to localStorage:", error);
      }
    },
    [selectedZone]
  );

  // ✅ Load custom colors từ localStorage khi zone thay đổi
  useEffect(() => {
    if (selectedZone && selectedZone !== "all") {
      try {
        const storageKey = `roomClassificationColors_${selectedZone}`;
        const savedColors = localStorage.getItem(storageKey);
        if (savedColors) {
          const parsedColors = JSON.parse(savedColors);
          setCustomClassificationColors((prev) => ({
            ...prev,
            ...parsedColors,
          }));
        }
      } catch (error) {
        console.error("Error loading colors from localStorage:", error);
      }
    }
  }, [selectedZone]);

  // ✅ Sync shiftDefaults với examinations data
  useEffect(() => {
    if (examinations && examinations.length > 0) {
      const newDefaults: any = {};

      // ✅ Map workSession to English keys
      const workSessionMap: Record<string, string> = {
        sáng: "morning",
        chiều: "afternoon",
        tối: "evening",
      };

      examinations.forEach((exam) => {
        const englishKey = workSessionMap[exam.workSession] || exam.workSession;

        // ✅ Chỉ update nếu chưa có hoặc chưa được user override
        if (!newDefaults[englishKey]) {
          newDefaults[englishKey] = {
            startTime: exam.startTime?.slice(0, 5) || "07:00",
            endTime: exam.endTime?.slice(0, 5) || "17:00",
            maxAppointments: 10,
            name: exam.name,
            examinationId: exam.id,
            workSession: exam.workSession,
          };
        }
      });

      // ✅ Merge với defaults hiện tại thay vì replace hoàn toàn
      setShiftDefaults((prev) => ({
        ...prev,
        ...newDefaults,
      }));

      console.log("🔄 Updated shiftDefaults from examinations:", newDefaults);
    }
  }, [examinations]);

  // ✅ Utility functions cho color picker
  const hexToTailwind = useCallback((hex: string) => {
    // ✅ Simple mapping hex colors to tailwind classes
    const colorMap = {
      "#dbeafe": "bg-blue-50 text-blue-700 border-blue-200",
      "#f3e8ff": "bg-purple-50 text-purple-700 border-purple-200",
      "#fef2f2": "bg-red-50 text-red-700 border-red-200",
      "#f0fdf4": "bg-green-50 text-green-700 border-green-200",
      "#fffbeb": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "#eef2ff": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "#fdf2f8": "bg-pink-50 text-pink-700 border-pink-200",
      "#fff7ed": "bg-orange-50 text-orange-700 border-orange-200",
      "#ecfeff": "bg-cyan-50 text-cyan-700 border-cyan-200",
    };

    return (
      colorMap[hex.toLowerCase()] || `bg-[${hex}] text-gray-700 border-gray-200`
    );
  }, []);

  const tailwindToHex = useCallback((tailwindClass: string) => {
    // ✅ Extract color from tailwind class or return default
    const colorMap = {
      "bg-blue-50": "#dbeafe",
      "bg-purple-50": "#f3e8ff",
      "bg-red-50": "#fef2f2",
      "bg-green-50": "#f0fdf4",
      "bg-yellow-50": "#fffbeb",
      "bg-indigo-50": "#eef2ff",
      "bg-pink-50": "#fdf2f8",
      "bg-orange-50": "#fff7ed",
      "bg-cyan-50": "#ecfeff",
    };

    const match = tailwindClass.match(/bg-(\w+)-(\d+)/);
    if (match) {
      const key = `bg-${match[1]}-${match[2]}`;
      return colorMap[key] || "#dbeafe";
    }

    // Check for custom hex colors
    const hexMatch = tailwindClass.match(/bg-\[([#\w]+)\]/);
    if (hexMatch) {
      return hexMatch[1];
    }

    return "#dbeafe"; // default
  }, []);

  // ✅ Function to update single classification color
  const updateClassificationColor = useCallback(
    (classificationKey: string, hexColor: string) => {
      const tailwindClass = hexToTailwind(hexColor);
      setCustomClassificationColors((prev) => ({
        ...prev,
        [classificationKey]: tailwindClass,
      }));

      // ✅ Save to localStorage
      try {
        const storageKey = `roomClassificationColors_${selectedZone}`;
        const currentColors = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );
        currentColors[classificationKey] = tailwindClass;
        localStorage.setItem(storageKey, JSON.stringify(currentColors));
      } catch (error) {
        console.error("Error saving color to localStorage:", error);
      }
    },
    [selectedZone, hexToTailwind]
  );

  // ✅ Fetch all required data với error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchZones()),
          dispatch(fetchDepartments()),
          dispatch(fetchExaminations()),
          dispatch(fetchRooms()),
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

  // ✅ Callback để refresh data sau khi copy phòng từ DB
  const handleDataUpdated = useCallback(() => {
    console.log("🔄 WeeklySchedule: Data updated, forcing complete refresh...");

    // ✅ Force refresh counter ngay lập tức để re-mount components
    setRefreshCounter((prev) => prev + 1);

    // Reset populate flag để cho phép re-populate clinic schedules
    setIsClinicSchedulesPopulated(false);

    // Force re-render bằng cách tạo copy mới của scheduleData với timestamp
    const timestamp = Date.now();
    setScheduleData((prevData) => {
      const newData = { ...prevData };
      // Thêm metadata để force update mà không ảnh hưởng logic
      (newData as any).__lastRefresh = timestamp;
      (newData as any).__refreshCount =
        ((prevData as any).__refreshCount || 0) + 1;

      console.log("📊 Schedule data updated:", {
        departments: Object.keys(newData).filter((key) => !key.startsWith("__"))
          .length,
        refreshCount: (newData as any).__refreshCount,
        timestamp,
      });

      return newData;
    });

    // ✅ Trigger multiple refresh waves để đảm bảo UI được update
    setTimeout(() => {
      console.log("🔄 Second wave refresh...");
      setRefreshCounter((prev) => prev + 1);
      setScheduleData(
        (prevData) =>
          ({
            ...prevData,
            __forceUpdate: Date.now(),
          } as any)
      );
    }, 100);

    setTimeout(() => {
      console.log("🔄 Third wave refresh...");
      setRefreshCounter((prev) => prev + 1);
    }, 300);

    // Re-fetch clinic schedules để có data mới nhất (nếu cần)
    if (selectedWeek) {
      console.log("🔄 Re-fetching clinic schedules...");
      const [year, weekStr] = selectedWeek.split("-W");
      const week = parseInt(weekStr);
      const yearNum = parseInt(year);

      dispatch(
        fetchClinicSchedules({
          Week: week,
          Year: yearNum,
          ...(selectedZone !== "all" && { ZoneId: parseInt(selectedZone) }),
        })
      );
    }
  }, [selectedWeek, selectedZone, dispatch]);

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

  // ✅ Fetch clinic schedules khi week, year hoặc zone thay đổi
  useEffect(() => {
    const fetchClinicScheduleData = async () => {
      try {
        // Parse week và year từ selectedWeek format "YYYY-WXX"
        const [year, weekStr] = selectedWeek.split("-W");
        const week = parseInt(weekStr);
        const yearNum = parseInt(year);

        const params = {
          Week: week,
          Year: yearNum,
          ...(selectedZone !== "all" && { ZoneId: parseInt(selectedZone) }),
        };

        await dispatch(fetchClinicSchedules(params));
      } catch (error) {
        console.error("❌ Error fetching clinic schedules:", error);
        toast.error("Lỗi khi tải lịch phòng khám");
      }
    };

    // Chỉ fetch khi có selectedWeek và selectedZone
    if (selectedWeek && selectedZone) {
      fetchClinicScheduleData();
    }
  }, [selectedWeek, selectedZone, dispatch]);

  // ✅ Debug clinic schedules data
  useEffect(() => {
    if (clinicSchedules.length > 0) {
      // ✅ Phân tích chi tiết dữ liệu từ example (sử dụng type any để tránh lỗi TypeScript)

      // Kiểm tra xung đột phòng khám theo dữ liệu thực tế
      const scheduleList = clinicSchedules as any[];
      const roomConflictAnalysis = scheduleList.reduce(
        (acc: any, schedule: any) => {
          const key = `${schedule.dayInWeek}-${schedule.examinationId}-${schedule.roomId}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            id: schedule.id,
            doctorName: schedule.doctorName,
            roomName: schedule.roomName,
            specialty: schedule.specialtyName,
            department: schedule.departmentHospitalName,
          });
          return acc;
        },
        {}
      );

      // Kiểm tra xung đột bác sĩ
      const doctorConflictAnalysis = scheduleList.reduce(
        (acc: any, schedule: any) => {
          const key = `${schedule.dayInWeek}-${schedule.examinationId}-${schedule.doctorId}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            id: schedule.id,
            doctorName: schedule.doctorName,
            roomName: schedule.roomName,
            specialty: schedule.specialtyName,
            department: schedule.departmentHospitalName,
          });
          return acc;
        },
        {}
      );
    }
    if (clinicSchedulesError) {
      console.error("❌ Clinic schedules error:", clinicSchedulesError);
    }
  }, [clinicSchedules, clinicSchedulesError]);

  // ✅ Function to detect conflicts in clinic schedules
  const detectScheduleConflicts = useCallback((schedules: any[]) => {
    const conflicts = {
      doctorConflicts: [] as any[],
      roomConflicts: [] as any[],
    };

    // Group schedules by day and examination (sử dụng dữ liệu thực tế)
    const scheduleGroups: Record<string, any[]> = {};

    schedules.forEach((schedule: any) => {
      const key = `${schedule.dayInWeek}-${schedule.examinationId}`;
      if (!scheduleGroups[key]) {
        scheduleGroups[key] = [];
      }
      scheduleGroups[key].push(schedule);
    });

    // Check for conflicts within each group
    Object.entries(scheduleGroups).forEach(([groupKey, groupSchedules]) => {
      const [dayInWeek, examinationId] = groupKey.split("-");

      // Check doctor conflicts
      const doctorMap: Record<number, any[]> = {};
      groupSchedules.forEach((schedule: any) => {
        if (!doctorMap[schedule.doctorId]) {
          doctorMap[schedule.doctorId] = [];
        }
        doctorMap[schedule.doctorId].push(schedule);
      });

      // Find doctors with multiple schedules in same examination
      Object.entries(doctorMap).forEach(([doctorId, doctorSchedules]) => {
        if (doctorSchedules.length > 1) {
          conflicts.doctorConflicts.push({
            doctorId: parseInt(doctorId),
            doctorName: doctorSchedules[0].doctorName,
            dayInWeek,
            examinationId: parseInt(examinationId),
            examinationName: doctorSchedules[0].examinationName,
            conflictingSchedules: doctorSchedules.map((s: any) => ({
              id: s.id,
              roomName: s.roomName,
              departmentName: s.departmentHospitalName,
              specialtyName: s.specialtyName,
            })),
          });
        }
      });

      // Check room conflicts
      const roomMap: Record<number, any[]> = {};
      groupSchedules.forEach((schedule: any) => {
        if (!roomMap[schedule.roomId]) {
          roomMap[schedule.roomId] = [];
        }
        roomMap[schedule.roomId].push(schedule);
      });

      // Find rooms with multiple schedules in same examination
      Object.entries(roomMap).forEach(([roomId, roomSchedules]) => {
        if (roomSchedules.length > 1) {
          conflicts.roomConflicts.push({
            roomId: parseInt(roomId),
            roomName: roomSchedules[0].roomName,
            dayInWeek,
            examinationId: parseInt(examinationId),
            examinationName: roomSchedules[0].examinationName,
            conflictingSchedules: roomSchedules.map((s: any) => ({
              id: s.id,
              doctorName: s.doctorName,
              departmentName: s.departmentHospitalName,
              specialtyName: s.specialtyName,
            })),
          });
        }
      });
    });

    return conflicts;
  }, []);

  // ✅ Debug trong useEffect

  // ✅ Convert specialties from departmentsByZone instead of allSpecialties
  const availableSpecialties = useMemo(() => {
    try {
      // ✅ Updated to handle new response structure: departments is now an array directly
      const currentZoneDepartments =
        selectedZone && selectedZone !== "all"
          ? departmentsByZone[selectedZone] || []
          : Object.values(departmentsByZone).flat();

      if (currentZoneDepartments.length === 0) {
        return ["Khám chuyên khoa", "Khám nội tổng quát"];
      }

      // ✅ Extract specialties from new departmentsByZone structure
      const specialtiesSet = new Set<string>();

      currentZoneDepartments.forEach((department) => {
        department.examTypes?.forEach((examType) => {
          examType.sepicalties?.forEach((specialty) => {
            if (specialty.enable) {
              specialtiesSet.add(specialty.name);
            }
          });
        });
      });

      const specialtiesArray = Array.from(specialtiesSet);

      return specialtiesArray.length > 0
        ? specialtiesArray
        : ["Khám chuyên khoa", "Khám nội tổng quát"];
    } catch (error) {
      console.error(
        "❌ Error extracting specialties from departmentsByZone:",
        error
      );
      return ["Khám chuyên khoa", "Khám nội tổng quát"];
    }
  }, [departmentsByZone, selectedZone]);

  // ✅ Convert doctors from Redux state with zone-specific filtering
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

            // ✅ Filter by available specialties in current zone
            const doctorSpecialty = doctor.specialtyName || "Chưa xác định";
            const isSpecialtyAvailable =
              availableSpecialties.includes(doctorSpecialty);

            return (
              isValid &&
              doctor.enable !== false && // Default to enabled if not specified
              isSpecialtyAvailable
            ); // Only include doctors with specialties available in zone
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

    // ✅ Enhanced fallback data with zone-specific specialties
    const fallbackDoctors = availableSpecialties
      .slice(0, 2)
      .map((specialty, index) => ({
        id: `BS00${index + 1}`,
        code: `BS00${index + 1}`,
        name: `BS. ${index === 0 ? "Nguyễn Thị Mai" : "Trần Văn Nam"}`,
        specialty: specialty,
        specialtyId: index + 1,
        departmentId: 1,
        departmentName: "Khoa chuyên khoa",
      }));

    return fallbackDoctors;
  }, [allDoctors, availableSpecialties]);

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
    const currentZoneDepartments =
      selectedZone && selectedZone !== "all"
        ? departmentsByZone[selectedZone] || []
        : Object.values(departmentsByZone).flat();

    if (currentZoneDepartments.length > 0) {
      const initialData: Record<string, Record<string, ShiftSlot>> = {};

      currentZoneDepartments.forEach((dept) => {
        initialData[dept.departmentHospitalId.toString()] = {};
      });

      setScheduleData(initialData);
    }
  }, [departmentsByZone, selectedZone]);

  // ✅ Populate schedule data từ clinic schedules
  useEffect(() => {
    if (
      clinicSchedules.length > 0 &&
      Object.keys(scheduleData).length > 0 &&
      !isClinicSchedulesPopulated
    ) {
      const updatedScheduleData = { ...scheduleData };

      clinicSchedules.forEach((schedule) => {
        const {
          roomId,
          examTypeId,
          dayOfWeek,
          startTime,
          endTime,
          maxAppointments,
          holdSlot,
          notes,
        } = schedule;

        // Tìm room và department tương ứng
        const room = allRooms.find((r) => r.id === roomId);
        if (!room) return;

        // Tạo slot ID dựa trên day và time
        const slotId = `day-${dayOfWeek}-${startTime?.replace(
          ":",
          ""
        )}-${endTime?.replace(":", "")}`;

        // Tìm department ID từ current zone departments
        let departmentId = "1"; // default
        const currentZoneDepartments =
          selectedZone && selectedZone !== "all"
            ? departmentsByZone[selectedZone] || []
            : Object.values(departmentsByZone).flat();

        // Tìm department đầu tiên (có thể cải thiện logic này sau)
        if (currentZoneDepartments.length > 0) {
          departmentId =
            currentZoneDepartments[0].departmentHospitalId.toString();
        }

        if (!updatedScheduleData[departmentId]) {
          updatedScheduleData[departmentId] = {};
        }

        if (!updatedScheduleData[departmentId][slotId]) {
          updatedScheduleData[departmentId][slotId] = { rooms: [] };
        }

        // Thêm room vào slot
        const existingRoomIndex = updatedScheduleData[departmentId][
          slotId
        ].rooms.findIndex((r) => r.id === room.id.toString());

        const roomSlot: RoomSlot = {
          id: room.id.toString(),
          name: room.name,
          code: room.code,
          classification: "normal", // default classification
          customStartTime: startTime,
          customEndTime: endTime,
          appointmentCount: maxAppointments,
          specialties: [], // Sẽ cần map từ examTypeId
          priorityOrder: 1,
          notes: notes || "",
          zoneId: room.zoneId,
          zoneName: room.zoneName,
        };

        if (existingRoomIndex >= 0) {
          updatedScheduleData[departmentId][slotId].rooms[existingRoomIndex] =
            roomSlot;
        } else {
          updatedScheduleData[departmentId][slotId].rooms.push(roomSlot);
        }
      });

      setScheduleData(updatedScheduleData);
      setIsClinicSchedulesPopulated(true); // ✅ Đánh dấu đã populate
    }
  }, [
    clinicSchedules,
    allRooms,
    selectedZone,
    departmentsByZone,
    isClinicSchedulesPopulated,
  ]); // ✅ Loại bỏ scheduleData khỏi dependency

  // ✅ Reset populate flag khi thay đổi week/zone để cho phép populate lại
  useEffect(() => {
    setIsClinicSchedulesPopulated(false);
  }, [selectedWeek, selectedZone]);

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

  // ✅ Helper function to check room and doctor conflicts
  const checkConflicts = useCallback(
    (deptId: string, slotId: string, roomId?: string, doctorId?: number) => {
      if (!clinicSchedules || clinicSchedules.length === 0) {
        return {
          hasRoomConflict: false,
          hasDoctorConflict: false,
          conflictDetails: [],
        };
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

      // Filter clinic schedules theo context hiện tại
      const relevantSchedules = (clinicSchedules as any[]).filter(
        (schedule) => {
          const scheduleDate = schedule.dateInWeek?.slice(0, 10);
          const dateMatch = scheduleDate === targetDate;
          const examinationMatch =
            schedule.examinationId?.toString() === targetExaminationId;
          const departmentMatch =
            schedule.departmentHospitalId?.toString() === deptId;

          return dateMatch && examinationMatch && departmentMatch;
        }
      );

      let hasRoomConflict = false;
      let hasDoctorConflict = false;
      const conflictDetails: any[] = [];

      // Check room conflict
      if (roomId) {
        hasRoomConflict = relevantSchedules.some((schedule) => {
          if (schedule.roomId?.toString() === roomId.toString()) {
            conflictDetails.push({
              type: "room",
              schedule: schedule,
              message: `Phòng ${schedule.roomName} đã có lịch khám`,
            });
            return true;
          }
          return false;
        });
      }

      // Check doctor conflict
      if (doctorId) {
        hasDoctorConflict = relevantSchedules.some((schedule) => {
          if (schedule.doctorId === doctorId) {
            conflictDetails.push({
              type: "doctor",
              schedule: schedule,
              message: `Bác sĩ ${schedule.doctorName} đã có lịch khám`,
            });
            return true;
          }
          return false;
        });
      }

      return {
        hasRoomConflict,
        hasDoctorConflict,
        conflictDetails,
        relevantSchedules,
      };
    },
    [clinicSchedules]
  );

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
        console.log(
          `🏥 addRoomToShift called: ${deptId}-${slotId}, roomId: ${roomId}`
        );

        const roomInfo = availableRooms.find((r) => r.id === roomId);
        const slot = timeSlots.find((t) => t.id === slotId);

        if (!roomInfo) {
          console.error(`❌ Room not found: ${roomId}`);
          toast.error("Không tìm thấy thông tin phòng!");
          return;
        }

        if (!slot) {
          console.error(`❌ Slot not found: ${slotId}`);
          console.log(
            "Available slots:",
            timeSlots.map((s) => s.id)
          );
          // ✅ Thay vì return error, tạo fallback slot info
          console.warn(`⚠️ Using fallback slot config for ${slotId}`);
        }

        // ✅ Fallback slot config nếu không tìm thấy slot
        const slotConfig = slot || {
          id: slotId,
          workSession: "sáng", // default
          startTime: "07:30",
          endTime: "11:00",
          disabled: false,
        };

        if (slotConfig.disabled) {
          toast.error("Không thể thêm phòng vào ca khám đã tắt!");
          return;
        }

        const usedRooms = getUsedRoomsInSlot(slotId);
        if (usedRooms.has(roomId)) {
          console.warn(
            `⚠️ Room ${roomInfo.name} already used in slot ${slotId}`
          );
          toast.error(`Phòng ${roomInfo.name} đã được sử dụng trong ca này!`);
          return;
        }

        const cellKey = `${deptId}-${slotId}`;
        const shiftConfig = shiftDefaults[slotConfig.workSession];

        const fallbackConfig = {
          startTime: slotConfig.startTime?.slice(0, 5) || "07:30",
          endTime: slotConfig.endTime?.slice(0, 5) || "11:00",
          maxAppointments: 10,
        };

        const newRoom: RoomSlot = {
          id: roomInfo.id,
          name: roomInfo.name,
          code: roomInfo.code,
          classification: roomInfo.classification,
          customStartTime: shiftConfig?.startTime || fallbackConfig.startTime,
          customEndTime: shiftConfig?.endTime || fallbackConfig.endTime,
          appointmentCount: 10, // ✅ Mặc định 10 lượt khám
          maxAppointments: 10, // ✅ Mặc định 10 lượt khám
          holdSlot: 0, // ✅ Mặc định 0 giữ chỗ
          appointmentDuration: 60, // ✅ Mặc định 60 phút cho 1 tiếng (2 slot)
          specialties: [...(roomInfo.specialties || [])],
          selectedSpecialty: "", // ✅ Không set mặc định, để trống
          selectedDoctor: "", // ✅ Giữ nguyên - không set mặc định
          priorityOrder: 10,
          zoneId: roomInfo.zoneId,
          zoneName: roomInfo.zoneName,
        };

        setUndoStack((prev) => [...prev, { ...scheduleData }]);
        setRedoStack([]);

        setScheduleData((prev) => {
          const newData = {
            ...prev,
            [deptId]: {
              ...prev[deptId],
              [slotId]: {
                rooms: [...(prev[deptId]?.[slotId]?.rooms || []), newRoom],
              },
            },
          };

          console.log(
            `✅ Added room ${roomInfo.name} to ${deptId}-${slotId}:`,
            {
              previousRoomsCount: prev[deptId]?.[slotId]?.rooms?.length || 0,
              newRoomsCount: newData[deptId][slotId].rooms.length,
              newRoom: newRoom.name,
            }
          );

          return newData;
        });

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

  // ✅ Thêm hàm nhân bản phòng
  const handleCloneRooms = useCallback(
    (
      rooms: any[],
      targetSlots?: string[],
      targetDepartmentIds?: string[],
      cloneOptions?: any,
      sourceSlotId?: string
    ) => {
      try {
        console.log("🚀 handleCloneRooms nhận được:", {
          roomsCount: rooms.length,
          targetSlotsCount: targetSlots?.length || 0,
          targetDepartmentIds: targetDepartmentIds || [],
          cloneOptions: cloneOptions || {},
          rooms,
          targetSlots,
        });

        if (!rooms || rooms.length === 0) {
          toast.error("Không có phòng nào để nhân bản!");
          return;
        }

        if (!targetSlots || targetSlots.length === 0) {
          toast.error("Không có ca khám đích để nhân bản!");
          return;
        }

        let totalCloned = 0;
        let successfulSlots: string[] = [];
        let failedSlots: string[] = [];

        // ✅ Backup state để undo
        setUndoStack((prev) => [...prev, { ...scheduleData }]);
        setRedoStack([]);

        // ✅ Clone từng phòng sang từng target slot
        setScheduleData((prev) => {
          const newData = { ...prev };

          targetSlots.forEach((targetSlotId) => {
            try {
              console.log("🎯 Processing target slot:", targetSlotId);

              // ✅ Đơn giản hóa: dùng department đầu tiên trong filtered list làm default
              const defaultDeptId =
                searchFilteredDepartments[0]?.id?.toString() || "1";
              const targetDeptId = targetDepartmentIds?.[0] || defaultDeptId;
              const actualSlotId = targetSlotId;

              console.log(
                `✅ Using dept=${targetDeptId}, slot=${actualSlotId}`
              );

              // ✅ Khởi tạo structure nếu chưa có
              if (!newData[targetDeptId]) {
                newData[targetDeptId] = {};
              }
              if (!newData[targetDeptId][actualSlotId]) {
                newData[targetDeptId][actualSlotId] = { rooms: [] };
              }

              // ✅ Clone rooms với kiểm tra duplicate
              const existingRoomIds = new Set(
                newData[targetDeptId][actualSlotId].rooms.map((r: any) => r.id)
              );

              const newRooms = rooms
                .filter((room) => !existingRoomIds.has(room.id))
                .map((room) => {
                  // ✅ Base room data
                  const clonedRoom = { ...room };

                  // ✅ Áp dụng clone options
                  if (!cloneOptions?.includeDoctors) {
                    clonedRoom.selectedDoctor = "";
                    clonedRoom.doctor = "";
                  } else {
                    // Giữ lại bác sĩ
                    clonedRoom.selectedDoctor =
                      room.selectedDoctor || room.doctor || "";
                  }

                  if (!cloneOptions?.includeSpecialties) {
                    clonedRoom.selectedSpecialty = "";
                    clonedRoom.specialty = "";
                  } else {
                    clonedRoom.selectedSpecialty =
                      room.selectedSpecialty || room.specialty || "";
                  }

                  if (!cloneOptions?.includeExamTypes) {
                    clonedRoom.selectedExamType = "";
                    clonedRoom.examType = "";
                  } else {
                    clonedRoom.selectedExamType =
                      room.selectedExamType || room.examType || "";
                  }

                  // ✅ LUÔN lấy thông tin ca khám đích để áp dụng giờ theo ca + khoa
                  // Tìm sourceSlot từ sourceSlotId nếu có với nhiều fallback
                  console.log("🔍 DEBUG finding sourceSlot:", {
                    sourceSlotId,
                    actualSlotId,
                    timeSlots: timeSlots.map((slot) => ({
                      id: slot.id,
                      slotId: slot.slotId,
                      date: slot.date,
                      workSession: slot.workSession,
                      combined: `${slot.date}-${slot.workSession}`,
                    })),
                  });

                  // ✅ Nhiều cách tìm sourceSlot với fallback
                  let sourceSlot = null;
                  if (sourceSlotId) {
                    // Thử 1: Exact match với id
                    sourceSlot = timeSlots.find(
                      (slot) => slot.id === sourceSlotId
                    );

                    // Thử 2: Match với slotId
                    if (!sourceSlot) {
                      sourceSlot = timeSlots.find(
                        (slot) => slot.slotId === sourceSlotId
                      );
                    }

                    // Thử 3: Match với combined format
                    if (!sourceSlot) {
                      sourceSlot = timeSlots.find(
                        (slot) =>
                          `${slot.date}-${slot.workSession}` === sourceSlotId
                      );
                    }

                    // Thử 4: Partial match (nếu sourceSlotId chứa date và workSession)
                    if (!sourceSlot && sourceSlotId.includes("-")) {
                      const parts = sourceSlotId.split("-");
                      if (parts.length >= 4) {
                        const sourceDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
                        const sourceExamId = parts[3];
                        sourceSlot = timeSlots.find(
                          (slot) =>
                            slot.date === sourceDate &&
                            slot.id?.endsWith(`-${sourceExamId}`)
                        );
                      }
                    }
                  }

                  const targetSlot = timeSlots.find(
                    (slot) =>
                      `${slot.date}-${slot.workSession}` === actualSlotId ||
                      slot.slotId === actualSlotId ||
                      slot.id === actualSlotId
                  );

                  console.log("🔍 DEBUG found slots:", {
                    sourceSlot: sourceSlot
                      ? {
                          id: sourceSlot.id,
                          workSession: sourceSlot.workSession,
                        }
                      : "NOT FOUND",
                    targetSlot: targetSlot
                      ? {
                          id: targetSlot.id,
                          workSession: targetSlot.workSession,
                        }
                      : "NOT FOUND",
                  });

                  const targetWorkSession = targetSlot?.workSession;

                  // ✅ Tìm examination theo workSession (không có departmentId field)
                  const targetExamination = examinations.find(
                    (exam) =>
                      exam.workSession === targetWorkSession && exam.enable
                  );

                  // ✅ Fallback về examination đầu tiên của ca
                  const fallbackExamination = examinations.find(
                    (exam) => exam.workSession === targetWorkSession
                  );

                  const finalExamination =
                    targetExamination || fallbackExamination;

                  // ✅ Map workSession (tiếng Việt) sang key của shiftDefaults (tiếng Anh)
                  const workSessionMap: Record<string, string> = {
                    sáng: "morning",
                    chiều: "afternoon",
                    tối: "evening",
                    morning: "morning",
                    afternoon: "afternoon",
                    evening: "evening",
                  };

                  const shiftKey = targetWorkSession
                    ? workSessionMap[targetWorkSession]
                    : null;

                  // ✅ Ưu tiên examination thực tế, fallback về shiftDefaults
                  const examTime = finalExamination
                    ? {
                        startTime: finalExamination.startTime?.slice(0, 5),
                        endTime: finalExamination.endTime?.slice(0, 5),
                        maxAppointments: 10,
                      }
                    : null;

                  const shiftConfig = shiftKey
                    ? shiftDefaults[shiftKey as keyof typeof shiftDefaults]
                    : null;

                  console.log("🕐 Clone time settings:", {
                    targetSlotId: actualSlotId,
                    targetDeptId,
                    targetWorkSession,
                    targetExamination: targetExamination?.id,
                    fallbackExamination: fallbackExamination?.id,
                    finalExamination: finalExamination?.id,
                    examTime,
                    shiftConfig,
                    includeTimeSettings: cloneOptions?.includeTimeSettings,
                    originalRoom: {
                      startTime: room.startTime,
                      endTime: room.endTime,
                      customStartTime: room.customStartTime,
                      customEndTime: room.customEndTime,
                    },
                    result: cloneOptions?.includeTimeSettings
                      ? "Copy custom times"
                      : "Use target shift times",
                  });

                  // ✅ Check xem có cùng workSession không với fallback logic
                  const sourceWorkSession = sourceSlot?.workSession;
                  let isSameShift = sourceWorkSession === targetWorkSession;

                  // ✅ Fallback: nếu không tìm thấy sourceSlot, thử phân tích từ sourceSlotId
                  if (
                    !sourceSlot &&
                    sourceSlotId &&
                    sourceSlotId.includes("-")
                  ) {
                    const parts = sourceSlotId.split("-");
                    if (parts.length >= 4) {
                      const sourceDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
                      const targetDate = targetSlot?.date;

                      // Nếu cùng ngày, có khả năng cùng ca (fallback assumption)
                      if (sourceDate === targetDate) {
                        isSameShift = true;
                        console.log(
                          "🔄 FALLBACK: Assume same shift (same date):",
                          {
                            sourceDate,
                            targetDate,
                            sourceSlotId,
                            targetSlotId: actualSlotId,
                          }
                        );
                      }
                    }
                  }

                  // ✅ Fallback khác: nếu sourceSlotId === actualSlotId thì chắc chắn cùng ca
                  if (sourceSlotId === actualSlotId) {
                    isSameShift = true;
                    console.log("🔄 FALLBACK: Same slot ID detected");
                  }

                  console.log("🔍 DEBUG clone workSession comparison:", {
                    sourceSlotId,
                    targetSlotId: actualSlotId,
                    sourceSlot: sourceSlot
                      ? {
                          id: sourceSlot.id,
                          workSession: sourceSlot.workSession,
                          date: sourceSlot.date,
                        }
                      : null,
                    targetSlot: targetSlot
                      ? {
                          id: targetSlot.id,
                          workSession: targetSlot.workSession,
                          date: targetSlot.date,
                        }
                      : null,
                    sourceWorkSession,
                    targetWorkSession,
                    isSameShift,
                    cloneOptionsIncludeTimeSettings:
                      cloneOptions?.includeTimeSettings,
                  });

                  if (!cloneOptions?.includeTimeSettings) {
                    // ✅ Không tick checkbox "Copy giờ tùy chỉnh"

                    if (isSameShift) {
                      // ✅ CÙNG CA: Luôn copy giờ tùy chỉnh (bất kể checkbox)
                      const startTime =
                        room.customStartTime || room.startTime || "";
                      const endTime = room.customEndTime || room.endTime || "";
                      const maxAppointments =
                        room.appointmentCount || room.maxAppointments || 10;

                      clonedRoom.customStartTime = startTime;
                      clonedRoom.customEndTime = endTime;
                      clonedRoom.appointmentCount = maxAppointments;
                      clonedRoom.startTime = startTime;
                      clonedRoom.endTime = endTime;
                      clonedRoom.maxAppointments = maxAppointments;
                      clonedRoom.appointmentDuration =
                        room.appointmentDuration || 10;

                      console.log("🎯 SAME SHIFT - always keep custom time:", {
                        sourceWorkSession,
                        targetWorkSession,
                        isSameShift,
                        keptTime: { startTime, endTime, maxAppointments },
                      });
                    } else {
                      // ✅ KHÁC CA: Reset về giờ mặc định của ca đích
                      const defaultStartTime =
                        examTime?.startTime || shiftConfig?.startTime || "";
                      const defaultEndTime =
                        examTime?.endTime || shiftConfig?.endTime || "";
                      const defaultMaxAppointments =
                        examTime?.maxAppointments ||
                        shiftConfig?.maxAppointments ||
                        10;

                      // ✅ XÓA HOÀN TOÀN tất cả time fields cũ
                      delete clonedRoom.customStartTime;
                      delete clonedRoom.customEndTime;
                      delete clonedRoom.appointmentCount;
                      delete clonedRoom.maxAppointments;
                      delete clonedRoom.appointmentDuration;

                      // ✅ SET giờ mặc định của ca đích
                      clonedRoom.startTime = defaultStartTime;
                      clonedRoom.endTime = defaultEndTime;
                      clonedRoom.appointmentCount = defaultMaxAppointments;
                      clonedRoom.maxAppointments = defaultMaxAppointments;
                      clonedRoom.appointmentDuration = 10;

                      console.log("🎯 DIFFERENT SHIFT - reset to default:", {
                        sourceWorkSession,
                        targetWorkSession,
                        isSameShift,
                        resetToDefault: {
                          startTime: defaultStartTime,
                          endTime: defaultEndTime,
                          maxAppointments: defaultMaxAppointments,
                        },
                      });
                    }
                  } else {
                    // ✅ Có tick checkbox "Copy giờ tùy chỉnh"

                    if (isSameShift) {
                      // ✅ CÙNG CA: Giữ nguyên giờ tùy chỉnh từ room gốc
                      const startTime =
                        room.customStartTime || room.startTime || "";
                      const endTime = room.customEndTime || room.endTime || "";
                      const maxAppointments =
                        room.appointmentCount || room.maxAppointments || 10;

                      clonedRoom.customStartTime = startTime;
                      clonedRoom.customEndTime = endTime;
                      clonedRoom.appointmentCount = maxAppointments;
                      clonedRoom.startTime = startTime;
                      clonedRoom.endTime = endTime;

                      console.log(
                        "🎯 WITH checkbox (SAME SHIFT - keep custom):",
                        {
                          sourceWorkSession,
                          targetWorkSession,
                          isSameShift,
                          originalCustomTime: {
                            startTime: room.customStartTime,
                            endTime: room.customEndTime,
                          },
                          keptTime: {
                            startTime,
                            endTime,
                            maxAppointments,
                          },
                        }
                      );
                    } else {
                      // ✅ KHÁC CA: Reset về giờ mặc định của ca đích
                      const defaultStartTime =
                        examTime?.startTime || shiftConfig?.startTime || "";
                      const defaultEndTime =
                        examTime?.endTime || shiftConfig?.endTime || "";
                      const defaultMaxAppointments =
                        examTime?.maxAppointments ||
                        shiftConfig?.maxAppointments ||
                        10;

                      // Xóa custom time cũ và set về mặc định
                      delete clonedRoom.customStartTime;
                      delete clonedRoom.customEndTime;

                      clonedRoom.startTime = defaultStartTime;
                      clonedRoom.endTime = defaultEndTime;
                      clonedRoom.appointmentCount = defaultMaxAppointments;

                      console.log(
                        "🎯 Clone WITH time settings (DIFFERENT SHIFT - reset to default):",
                        {
                          sourceWorkSession,
                          targetWorkSession,
                          isSameShift,
                          resetToDefault: {
                            startTime: defaultStartTime,
                            endTime: defaultEndTime,
                            maxAppointments: defaultMaxAppointments,
                          },
                        }
                      );
                    }

                    clonedRoom.maxAppointments = clonedRoom.appointmentCount;
                    clonedRoom.appointmentDuration =
                      room.appointmentDuration || 10;
                  }

                  if (!cloneOptions?.includeNotes) {
                    clonedRoom.notes = "";
                  } else {
                    clonedRoom.notes = room.notes || "";
                  }

                  // ✅ Luôn giữ lại các thông tin cơ bản và số lượt khám
                  clonedRoom.holdSlot = room.holdSlot || room.holdSlots || 0;
                  clonedRoom.priorityOrder = room.priorityOrder || 10;

                  // ✅ Copy số lượt khám và giữ chỗ nếu được bật
                  if (cloneOptions?.includeAppointmentCounts) {
                    clonedRoom.appointmentCount =
                      room.appointmentCount || room.maxAppointments || 10;
                    clonedRoom.maxAppointments =
                      room.maxAppointments || room.appointmentCount || 10;
                    clonedRoom.holdSlot = room.holdSlot || room.holdSlots || 0;
                    clonedRoom.appointmentDuration =
                      room.appointmentDuration || 60;

                    console.log("🔢 COPIED appointment counts:", {
                      appointmentCount: clonedRoom.appointmentCount,
                      maxAppointments: clonedRoom.maxAppointments,
                      holdSlot: clonedRoom.holdSlot,
                      appointmentDuration: clonedRoom.appointmentDuration,
                    });
                  } else {
                    // Không copy, dùng mặc định
                    if (
                      !clonedRoom.appointmentCount &&
                      !clonedRoom.maxAppointments
                    ) {
                      clonedRoom.appointmentCount = 10;
                      clonedRoom.maxAppointments = 10;
                      clonedRoom.holdSlot = 0;
                      clonedRoom.appointmentDuration = 60;
                    }
                  }

                  // ✅ Fallback: Luôn copy appointmentDuration nếu chưa có
                  if (!clonedRoom.appointmentDuration) {
                    clonedRoom.appointmentDuration =
                      room.appointmentDuration || 60;
                  }

                  // ✅ Metadata cho tracking
                  clonedRoom.isCloned = true;
                  clonedRoom.clonedFrom = `${room.deptId || "unknown"}-${
                    room.slotId || "unknown"
                  }`;
                  clonedRoom.clonedAt = Date.now();
                  clonedRoom.clonedOptions = cloneOptions;

                  // ✅ DEBUG: Log kết quả cuối cùng
                  console.log("📊 FINAL CLONED ROOM RESULT:", {
                    originalRoom: {
                      name: room.name,
                      startTime: room.startTime,
                      endTime: room.endTime,
                      customStartTime: room.customStartTime,
                      customEndTime: room.customEndTime,
                      appointmentCount: room.appointmentCount,
                    },
                    clonedRoom: {
                      name: clonedRoom.name,
                      startTime: clonedRoom.startTime,
                      endTime: clonedRoom.endTime,
                      customStartTime: clonedRoom.customStartTime,
                      customEndTime: clonedRoom.customEndTime,
                      appointmentCount: clonedRoom.appointmentCount,
                    },
                    decisionFactors: {
                      sourceSlotId,
                      targetSlotId: actualSlotId,
                      isSameShift,
                      includeTimeSettings: cloneOptions?.includeTimeSettings,
                      sourceWorkSession,
                      targetWorkSession,
                    },
                  });

                  return clonedRoom;
                });

              if (newRooms.length > 0) {
                newData[targetDeptId][actualSlotId].rooms = [
                  ...newData[targetDeptId][actualSlotId].rooms,
                  ...newRooms,
                ];
                totalCloned += newRooms.length;
                successfulSlots.push(targetSlotId); // Vẫn dùng original targetSlotId cho tracking
                console.log(
                  `✅ Cloned ${newRooms.length} rooms to dept=${targetDeptId}, slot=${actualSlotId}`
                );
              }
            } catch (error) {
              console.error("Error cloning to slot:", targetSlotId, error);
              failedSlots.push(targetSlotId);
            }
          });

          return newData;
        });

        // ✅ Update schedule changes
        const changeKey = `clone-${Date.now()}`;
        setScheduleChanges((prev) => ({
          ...prev,
          [changeKey]: {
            action: "clone_rooms",
            sourceRooms: rooms.length,
            targetSlots: successfulSlots,
            totalCloned,
          },
        }));

        // ✅ Show success toast
        if (totalCloned > 0) {
          const timeSettingsInfo = cloneOptions?.includeTimeSettings
            ? " (giữ giờ tùy chỉnh)"
            : " (giờ theo ca đích)";

          toast.success(
            `✅ Đã nhân bản ${totalCloned} phòng sang ${successfulSlots.length} ca khám${timeSettingsInfo}`,
            {
              description: `Thành công: ${successfulSlots.length} ca • Thất bại: ${failedSlots.length} ca`,
              duration: 4000,
            }
          );

          // ✅ Debug log để kiểm tra
          console.log("🎉 Clone completed:", {
            totalCloned,
            successfulSlots,
            failedSlots,
            cloneOptions,
            currentShiftDefaults: shiftDefaults,
          });
        }

        if (failedSlots.length > 0) {
          toast.error(
            `⚠️ Không thể nhân bản sang ${failedSlots.length} ca khám`
          );
        }

        console.log("🎉 Clone thành công:", {
          totalCloned,
          successfulSlots: successfulSlots.length,
          failedSlots: failedSlots.length,
        });
      } catch (error) {
        console.error("Error in handleCloneRooms:", error);
        toast.error("Lỗi khi nhân bản phòng!");
      }
    },
    [scheduleData, timeSlots, shiftDefaults]
  );

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

  const handleSaveAll = async () => {
    try {
      // ✅ Helper function để format time thành "HH:mm:ss"
      const formatTimeToHHmmss = (timeString: string): string => {
        if (!timeString) return "07:30:00";

        // Nếu đã có format "HH:mm:ss" thì giữ nguyên
        if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeString;
        }

        // Nếu có format "HH:mm" thì thêm ":00"
        if (timeString.match(/^\d{2}:\d{2}$/)) {
          return `${timeString}:00`;
        }

        // Fallback: thêm ":00" vào cuối
        return `${timeString}:00`;
      };

      // ✅ Chuyển đổi scheduleData thành format API
      const clinicScheduleData: any[] = [];

      // ✅ Lấy thông tin tuần hiện tại
      const [year, weekStr] = selectedWeek.split("-W");
      const weekNum = parseInt(weekStr);
      const yearNum = parseInt(year);

      // ✅ Tính toán ngày đầu tuần (Thứ 2)
      const startOfYear = new Date(yearNum, 0, 1);
      const daysToAdd = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
      const mondayOfWeek = new Date(yearNum, 0, 1 + daysToAdd);

      Object.entries(scheduleData).forEach(([deptId, deptSchedule]) => {
        Object.entries(deptSchedule).forEach(
          ([slotId, slot]: [string, any]) => {
            if (slot?.rooms && Array.isArray(slot.rooms)) {
              slot.rooms.forEach((room: any) => {
                // ✅ Tìm thông tin slot từ timeSlots
                const slotInfo = timeSlots.find((s) => s.id === slotId);
                if (!slotInfo) return;

                // ✅ Tính ngày trong tuần dựa trên fullDate của slot
                const slotDate = new Date(slotInfo.fullDate);

                // ✅ Lấy doctorId từ selectedDoctor với nhiều cách tìm kiếm
                let doctorId = 0;
                if (room.selectedDoctor) {
                  // ✅ Tìm doctor theo nhiều field: name, fullName, code, id
                  const doctor = allDoctors.find((d) => {
                    const searchValue = room.selectedDoctor.toString();
                    return (
                      // Tìm theo tên
                      d.name === searchValue ||
                      d.fullName === searchValue ||
                      // Tìm theo code (employee ID)
                      d.doctor_IdEmployee_Postgresql?.toString() ===
                        searchValue ||
                      d.code?.toString() === searchValue ||
                      // Tìm theo ID
                      d.id?.toString() === searchValue
                    );
                  });

                  if (doctor) {
                    doctorId =
                      parseInt(
                        doctor.id?.toString() ||
                          doctor.doctor_IdEmployee_Postgresql?.toString() ||
                          "0"
                      ) || 0;
                    console.log(`👨‍⚕️ Found doctor for room ${room.name}:`, {
                      searchValue: room.selectedDoctor,
                      foundDoctor: doctor.name,
                      doctorId,
                    });
                  } else {
                    console.warn("⚠️ Doctor not found:", {
                      searchValue: room.selectedDoctor,
                      availableDoctors: allDoctors.map((d) => ({
                        name: d.name,
                        fullName: d.fullName,
                        code: d.doctor_IdEmployee_Postgresql || d.code,
                        id: d.id,
                      })),
                    });
                  }
                }

                // ✅ Lấy examTypeId từ selectedExamType HOẶC từ room.examTypeId (copy từ DB)
                let examTypeId = 0;

                // ✅ PRIORITY 1: Sử dụng examTypeId trực tiếp nếu có (từ copy DB)
                if (room.examTypeId && room.examTypeId > 0) {
                  examTypeId = room.examTypeId;
                  console.log(
                    `✅ Using direct examTypeId: ${examTypeId} for room ${room.name}`
                  );
                }
                // ✅ PRIORITY 2: Tìm từ selectedExamType như bình thường
                else if (
                  room.selectedExamType &&
                  departmentsByZone[selectedZone]
                ) {
                  const currentDept = departmentsByZone[selectedZone].find(
                    (dept: any) =>
                      dept.departmentHospitalId.toString() === deptId
                  );
                  if (currentDept?.examTypes) {
                    const examType = currentDept.examTypes.find(
                      (et: any) => et.name === room.selectedExamType
                    );
                    if (examType) {
                      examTypeId = examType.id || 0;
                      console.log(
                        `✅ Found examTypeId from name: ${examTypeId} for examType "${room.selectedExamType}"`
                      );
                    } else {
                      console.warn(
                        `⚠️ ExamType not found: "${room.selectedExamType}" in department ${deptId}`
                      );
                    }
                  }
                } else {
                  console.warn(
                    `⚠️ No examTypeId or selectedExamType found for room ${room.name}`
                  );
                }

                // ✅ Lấy specialtyId từ selectedSpecialty HOẶC từ room.specialtyId (copy từ DB)
                let specialtyId = 0;

                // ✅ PRIORITY 1: Sử dụng specialtyId trực tiếp nếu có (từ copy DB)
                if (room.specialtyId && room.specialtyId > 0) {
                  specialtyId = room.specialtyId;
                  console.log(
                    `✅ Using direct specialtyId: ${specialtyId} for room ${room.name}`
                  );
                }
                // ✅ PRIORITY 2: Tìm từ selectedSpecialty như bình thường
                else if (
                  room.selectedSpecialty &&
                  departmentsByZone[selectedZone]
                ) {
                  const currentDept = departmentsByZone[selectedZone].find(
                    (dept: any) =>
                      dept.departmentHospitalId.toString() === deptId
                  );

                  if (currentDept?.examTypes) {
                    // Debug: Hiển thị tất cả specialties có sẵn
                    const allSpecialties: any[] = [];
                    currentDept.examTypes.forEach((examType: any) => {
                      if (
                        examType.sepicalties &&
                        Array.isArray(examType.sepicalties)
                      ) {
                        examType.sepicalties.forEach((specialty: any) => {
                          if (specialty.enable) {
                            allSpecialties.push({
                              id: specialty.id,
                              name: specialty.name,
                              examType: examType.name,
                            });
                          }
                        });
                      }
                    });

                    // Tìm specialty trong tất cả examTypes của department
                    let foundSpecialty = null;

                    for (const examType of currentDept.examTypes) {
                      if (
                        examType.sepicalties &&
                        Array.isArray(examType.sepicalties)
                      ) {
                        foundSpecialty = examType.sepicalties.find(
                          (specialty: any) =>
                            specialty.name === room.selectedSpecialty &&
                            specialty.enable
                        );
                        if (foundSpecialty) break;
                      }
                    }

                    if (foundSpecialty) {
                      specialtyId =
                        parseInt(foundSpecialty.id?.toString() || "0") || 0;
                    } else {
                      console.warn(
                        "⚠️ Specialty not found:",
                        room.selectedSpecialty
                      );
                    }
                  }
                }

                // ✅ Tạo clinic schedule entry
                const startSlotFormatted = formatTimeToHHmmss(
                  room.customStartTime ||
                    slotInfo.startTime?.slice(0, 5) ||
                    "07:30"
                );
                const endSlotFormatted = formatTimeToHHmmss(
                  room.customEndTime || slotInfo.endTime?.slice(0, 5) || "11:00"
                );

                // ✅ Lấy examinationId từ examination thực tế
                let examinationId = 0;
                if (slotInfo && slotInfo.examinationId) {
                  examinationId = slotInfo.examinationId;
                } else {
                  // Fallback: tìm examination từ workSession và thời gian
                  const matchingExam = examinations.find(
                    (exam) =>
                      exam.workSession === slotInfo?.workSession ||
                      exam.workSession === slotInfo?.period
                  );
                  if (matchingExam) {
                    examinationId = matchingExam.id;
                  }
                }

                const scheduleEntry = {
                  dateInWeek: slotDate.toISOString(),
                  total: room.appointmentCount || room.maxAppointments || 10,
                  spaceMinutes: room.appointmentDuration || 60,
                  specialtyId: specialtyId,
                  roomId: parseInt(room.id) || 0,
                  examinationId: examinationId, // ✅ Sử dụng examinationId từ examination thực tế
                  doctorId: doctorId, // ✅ Sử dụng doctorId đã tìm được
                  departmentHospitalId: parseInt(deptId) || 0,
                  examTypeId: examTypeId,
                  startSlot: startSlotFormatted,
                  endSlot: endSlotFormatted,
                  holdSlot: room.holdSlot || room.holdSlots || 0,
                };

                console.log(`📊 Schedule entry for room ${room.name}:`, {
                  roomName: room.name,
                  examTypeId: examTypeId,
                  specialtyId: specialtyId,
                  spaceMinutes: room.appointmentDuration || 60,
                  doctorId: doctorId,
                  scheduleEntry: scheduleEntry,
                  roomData: {
                    selectedExamType: room.selectedExamType,
                    selectedSpecialty: room.selectedSpecialty,
                    selectedDoctor: room.selectedDoctor,
                    appointmentDuration: room.appointmentDuration,
                    directExamTypeId: room.examTypeId,
                    directSpecialtyId: room.specialtyId,
                  },
                });

                clinicScheduleData.push(scheduleEntry);
              });
            }
          }
        );
      });

      // ✅ Gọi API để lưu
      if (clinicScheduleData.length > 0) {
        await dispatch(addClinicSchedules(clinicScheduleData));
        setScheduleChanges({});
        toast.success(
          `Đã lưu ${clinicScheduleData.length} lịch phòng khám thành công!`
        );
      } else {
        toast.warning("Không có dữ liệu để lưu");
      }
    } catch (error) {
      console.error("❌ Error saving clinic schedules:", error);
      toast.error("Lỗi khi lưu lịch phòng khám: " + (error as any).message);
    }
  };

  // ✅ Add missing shift config save handler
  const handleShiftConfigSave = (newDefaults: any) => {
    console.log("💾 Saving shift config:", newDefaults);
    setShiftDefaults(newDefaults);
    toast.success("Đã lưu cấu hình ca khám!");
  };

  // ✅ Departments for filtering
  const departments = useMemo(() => {
    const currentZoneDepartments =
      selectedZone && selectedZone !== "all"
        ? departmentsByZone[selectedZone] || []
        : Object.values(departmentsByZone).flat();

    return [
      { id: "all", name: "Tất cả khoa phòng" },
      ...currentZoneDepartments.map((dept) => ({
        id: dept.departmentHospitalId.toString(),
        name: dept.departmentHospitalName,
      })),
    ];
  }, [departmentsByZone, selectedZone]);

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
    examinationsLoading ||
    roomsLoading ||
    doctorsLoading ||
    examTypesLoading ||
    clinicSchedulesLoading ||
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
  console.log(clinicSchedules);

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
          key={`schedule-table-${refreshCounter}`}
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
          // ✅ Thêm props cho cấu trúc phân cấp
          departmentsByZone={departmentsByZone}
          selectedZone={selectedZone}
          // ✅ Thêm clinic schedules data
          clinicSchedules={clinicSchedules}
          // ✅ Thêm props cho chức năng clone rooms
          onCloneRooms={handleCloneRooms}
          allTimeSlots={timeSlots}
          allDepartments={searchFilteredDepartments}
          // ✅ Thêm callback để refresh data
          onDataUpdated={handleDataUpdated}
        />

        <WeeklyScheduleLegend
          roomClassifications={roomClassifications}
          departmentsByZone={departmentsByZone}
          examsByZone={examsByZone}
          examinations={examinations}
          selectedZone={selectedZone}
          zones={zones}
        />

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
          updateClassificationColor={updateClassificationColor}
          tailwindToHex={tailwindToHex}
          hexToTailwind={hexToTailwind}
          examsByZone={examsByZone}
          selectedZone={selectedZone}
          zones={zones}
        />

        {/* ✅ Conflict Alert Component */}
        {(scheduleConflicts.doctorConflicts.length > 0 ||
          scheduleConflicts.roomConflicts.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800">
                Cảnh báo xung đột lịch khám
              </h3>
              <div className="ml-auto text-sm text-red-600">
                Tổng:{" "}
                {scheduleConflicts.doctorConflicts.length +
                  scheduleConflicts.roomConflicts.length}{" "}
                xung đột
              </div>
            </div>

            {scheduleConflicts.doctorConflicts.length > 0 && (
              <div className="mb-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scheduleConflicts.doctorConflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className="bg-white border border-red-200 rounded p-3"
                    >
                      <div className="font-medium text-red-800">
                        👨‍⚕️ {conflict.doctorName} (ID: {conflict.doctorId})
                      </div>
                      <div className="text-sm text-red-600 mb-2">
                        📅 {conflict.dayInWeek} - {conflict.examinationName}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Các lịch trùng ({conflict.conflictingSchedules.length}
                          ):
                        </span>
                        <ul className="ml-4 mt-1 space-y-1">
                          {conflict.conflictingSchedules.map(
                            (schedule: any, idx: number) => (
                              <li
                                key={idx}
                                className="text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                🏥 {schedule.roomName} - 🏢{" "}
                                {schedule.departmentName} (
                                {schedule.specialtyName})
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scheduleConflicts.roomConflicts.length > 0 && (
              <div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scheduleConflicts.roomConflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className="bg-white border border-red-200 rounded p-3"
                    >
                      <div className="font-medium text-red-800">
                        🏥 {conflict.roomName} (ID: {conflict.roomId})
                      </div>
                      <div className="text-sm text-red-600 mb-2">
                        📅 {conflict.dayInWeek} - {conflict.examinationName}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Các lịch trùng ({conflict.conflictingSchedules.length}
                          ):
                        </span>
                        <ul className="ml-4 mt-1 space-y-1">
                          {conflict.conflictingSchedules.map(
                            (schedule: any, idx: number) => (
                              <li
                                key={idx}
                                className="text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                👨‍⚕️ {schedule.doctorName} - 🏢{" "}
                                {schedule.departmentName} (
                                {schedule.specialtyName})
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-lg">💡</span>
                <span className="font-medium">Khuyến nghị:</span>
              </div>
              <ul className="ml-6 mt-2 text-sm text-yellow-700 space-y-1">
                <li>
                  • Điều chỉnh lịch để tránh bác sĩ và phòng khám bị trùng trong
                  cùng ca
                </li>
                <li>• Kiểm tra lại thông tin khoa phòng và chuyên môn</li>
                <li>• Phân bổ lại bác sĩ cho các ca khám khác nhau</li>
              </ul>
            </div>
          </div>
        )}

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
