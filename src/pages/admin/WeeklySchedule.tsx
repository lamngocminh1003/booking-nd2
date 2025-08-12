import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Undo2,
  Redo2,
  Search,
  Info,
  Settings,
  Palette,
  Plus,
  X,
  Clock,
  Users,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchZones } from "@/store/slices/zoneSlice";
import { fetchDepartments } from "@/store/slices/departmentSlice";
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  getISOWeek,
  endOfYear,
  differenceInWeeks,
} from "date-fns";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// Types
interface RoomSlot {
  id: string;
  name: string;
  classification: string;
  customStartTime?: string;
  customEndTime?: string;
  appointmentCount?: number;
  specialties: string[];
  selectedSpecialty?: string; // Single selected specialty to display
  selectedDoctor?: string; // Thêm trường chọn bác sĩ
  _doctorSearchTerm?: string; // Dùng để lưu giá trị tìm kiếm bác sĩ
  priorityOrder?: number; // Số ưu tiên
}

interface ShiftSlot {
  rooms: RoomSlot[];
}

const getWeeksList = () => {
  const today = new Date();
  const endYear = endOfYear(today);
  const weeksUntilEndOfYear = Math.ceil(differenceInWeeks(endYear, today));
  const weeks = [];

  // Add past weeks (12 weeks)
  for (let i = 12; i > 0; i--) {
    const currentDate = addWeeks(today, -i);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekNumber = getISOWeek(currentDate);
    const year = currentDate.getFullYear();

    weeks.push({
      value: `${year}-W${weekNumber}`,
      label: `Tuần ${weekNumber} (${format(weekStart, "dd/MM")} - ${format(
        weekEnd,
        "dd/MM/yyyy"
      )})`,
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      isPast: true,
    });
  }

  // Add current week
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentWeekNumber = getISOWeek(today);
  weeks.push({
    value: `${today.getFullYear()}-W${currentWeekNumber}`,
    label: `Tuần ${currentWeekNumber} (${format(
      currentWeekStart,
      "dd/MM"
    )} - ${format(currentWeekEnd, "dd/MM/yyyy")}) - Hiện tại`,
    startDate: format(currentWeekStart, "yyyy-MM-dd"),
    endDate: format(currentWeekEnd, "yyyy-MM-dd"),
    isCurrent: true,
  });

  // Add future weeks until end of year
  for (let i = 1; i <= weeksUntilEndOfYear; i++) {
    const currentDate = addWeeks(today, i);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekNumber = getISOWeek(currentDate);
    const year = currentDate.getFullYear();

    weeks.push({
      value: `${year}-W${weekNumber}`,
      label: `Tuần ${weekNumber} (${format(weekStart, "dd/MM")} - ${format(
        weekEnd,
        "dd/MM/yyyy"
      )})`,
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      isFuture: true,
    });
  }

  return weeks;
};

const WeeklySchedule = () => {
  const dispatch = useAppDispatch();
  const { list: zones, loading: zonesLoading } = useAppSelector(
    (state) => state.zone
  );
  const { list: allDepartments, loading: departmentsLoading } = useAppSelector(
    (state) => state.department
  );

  // Filter only enabled departments
  const departments = useMemo(() => {
    const enabledDepartments =
      allDepartments?.filter((dept) => dept.enable) || [];
    return [
      { id: "all", name: "Tất cả khoa phòng" },
      ...enabledDepartments.map((dept) => ({
        id: dept.id.toString(),
        name: dept.name,
      })),
    ];
  }, [allDepartments]);

  // Add weeks state
  const [weeks] = useState(() => getWeeksList());
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const weekNumber = getISOWeek(today);
    const year = today.getFullYear();
    return `${year}-W${weekNumber}`;
  });
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [scheduleChanges, setScheduleChanges] = useState<Record<string, any>>(
    {}
  );
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [showRoomClassificationDialog, setShowRoomClassificationDialog] =
    useState(false);
  const [showShiftConfigDialog, setShowShiftConfigDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shift default times
  const [shiftDefaults, setShiftDefaults] = useState({
    morning: { start: "07:30", end: "11:00", defaultAppointments: 10 },
    afternoon: { start: "13:30", end: "16:00", defaultAppointments: 10 },
    evening: { start: "18:00", end: "21:00", defaultAppointments: 10 },
  });

  // Available specialties
  const availableSpecialties = [
    "Khám chuyên khoa",
    "Khám nội tổng quát",
    "Khám tai mũi họng",
    "Khám sản phụ khoa",
    "Siêu âm",
    "Xét nghiệm",
    "Nội soi",
    "Tiêm chủng",
    "Tư vấn dinh dưỡng",
    "Đo điện tim (ECG)",
    "Khám nhi",
  ];

  // Room classification system
  const [roomClassifications, setRoomClassifications] = useState({
    normal: {
      name: "Khám thường",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      enabled: true,
    },
    priority: {
      name: "Ưu tiên",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      enabled: true,
    },
    urgent: {
      name: "Khẩn cấp",
      color: "bg-red-100 text-red-800 border-red-300",
      enabled: true,
    },
    special: {
      name: "Đặc biệt",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      enabled: true,
    },
    vip: {
      name: "VIP",
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      enabled: true,
    },
    emergency: {
      name: "Cấp cứu",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      enabled: true,
    },
  });

  // Available rooms for selection with classification
  const availableRooms = [
    {
      id: "303",
      name: "Phòng 303",
      code: "P303",
      classification: "normal",
      specialties: ["Khám nội tổng quát"],
    },
    {
      id: "307",
      name: "Phòng 307",
      code: "P307",
      classification: "normal",
      specialties: ["Khám nội tổng quát", "Đo điện tim (ECG)"],
    },
    {
      id: "313",
      name: "Phòng 313",
      code: "P313",
      classification: "priority",
      specialties: ["Khám tai mũi họng"],
    },
    {
      id: "315",
      name: "Phòng 315",
      code: "P315",
      classification: "normal",
      specialties: ["Khám nhi"],
    },
    {
      id: "316",
      name: "Phòng 316",
      code: "P316",
      classification: "normal",
      specialties: ["Khám nội tổng quát"],
    },
    {
      id: "404",
      name: "Phòng 404 (Đặc biệt)",
      code: "P404",
      classification: "special",
      specialties: ["Khám sản phụ khoa", "Siêu âm"],
    },
    {
      id: "405",
      name: "Phòng 405 (Đặc biệt)",
      code: "P405",
      classification: "special",
      specialties: ["Nội soi", "Xét nghiệm"],
    },
    {
      id: "420",
      name: "Phòng 420",
      code: "P420",
      classification: "urgent",
      specialties: ["Khám nội tổng quát"],
    },
    {
      id: "421",
      name: "Phòng 421 (11h-13h)",
      code: "P421",
      classification: "special",
      specialties: ["Tiêm chủng"],
    },
    {
      id: "422",
      name: "Phòng 422 (11h-13h)",
      code: "P422",
      classification: "special",
      specialties: ["Tư vấn dinh dưỡng"],
    },
    {
      id: "437",
      name: "Phòng 437",
      code: "P437",
      classification: "normal",
      specialties: ["Khám nội tổng quát"],
    },
    {
      id: "438",
      name: "Phòng 438",
      code: "P438",
      classification: "priority",
      specialties: ["Khám tai mũi họng"],
    },
    {
      id: "439",
      name: "Phòng 439",
      code: "P439",
      classification: "priority",
      specialties: ["Khám nhi"],
    },
    {
      id: "440",
      name: "Phòng 440",
      code: "P440",
      classification: "priority",
      specialties: ["Khám sản phụ khoa"],
    },
    {
      id: "441",
      name: "Phòng 441",
      code: "P441",
      classification: "priority",
      specialties: ["Siêu âm"],
    },
    {
      id: "443",
      name: "Phòng 443",
      code: "P443",
      classification: "priority",
      specialties: ["Nội soi"],
    },
    {
      id: "444",
      name: "Phòng 444",
      code: "P444",
      classification: "urgent",
      specialties: ["Xét nghiệm"],
    },
    {
      id: "446",
      name: "Phòng 446",
      code: "P446",
      classification: "normal",
      specialties: ["Đo điện tim (ECG)"],
    },
  ];

  // Thêm dữ liệu bác sĩ mock
  const availableDoctors = [
    {
      id: "BS001",
      code: "BS001",
      name: "BS. Nguyễn Thị Mai",
      specialty: "Nhi khoa tổng quát",
    },
    {
      id: "BS002",
      code: "BS002",
      name: "BS. Trần Văn Nam",
      specialty: "Tim mạch nhi",
    },
    {
      id: "BS003",
      code: "BS003",
      name: "BS. Lê Thị Hoa",
      specialty: "Nhi tiêu hóa",
    },
    {
      id: "BS004",
      code: "BS004",
      name: "BS. Phạm Minh Tuấn",
      specialty: "Nhi hô hấp",
    },
    {
      id: "BS005",
      code: "BS005",
      name: "BS. Vũ Thị Lan",
      specialty: "Nhi thần kinh",
    },
    {
      id: "BS006",
      code: "BS006",
      name: "BS. Hoàng Văn Đức",
      specialty: "Nhi ngoại",
    },
  ];

  // Filtered rooms for search
  const filteredRooms = roomSearchTerm
    ? availableRooms.filter(
        (room) =>
          room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
          room.code.toLowerCase().includes(roomSearchTerm.toLowerCase())
      )
    : availableRooms;

  // Examination zones
  const examinationZones = [
    { id: "all", name: "Tất cả khu khám" },
    { id: "zone-a", name: "Khu A - Tầng 3" },
    { id: "zone-b", name: "Khu B - Tầng 4" },
    { id: "zone-c", name: "Khu C - Cấp cứu" },
    { id: "zone-d", name: "Khu D - Đặc biệt" },
  ];

  // Get week date range
  const getWeekDateRange = (weekString: string) => {
    const [year, weekStr] = weekString.split("-W");
    const weekNum = parseInt(weekStr);
    const yearNum = parseInt(year);

    // Calculate the first day (Monday) of the selected week
    const startOfYear = new Date(yearNum, 0, 1);
    const daysToAdd = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
    const mondayOfWeek = new Date(yearNum, 0, 1 + daysToAdd);

    // Calculate Friday of the week
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

  // Update timeSlots generation to use actual dates
  const timeSlots = useMemo(() => {
    const weekRange = getWeekDateRange(selectedWeek);
    const slots = [];
    const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

    for (let i = 0; i < 5; i++) {
      // Monday to Friday
      const currentDay = new Date(weekRange.mondayDate);
      currentDay.setDate(weekRange.mondayDate.getDate() + i);

      const formattedDate = format(currentDay, "dd/MM");
      const fullDate = format(currentDay, "yyyy-MM-dd");

      // Morning slot
      slots.push({
        id: `${fullDate}-morning`,
        day: dayNames[i],
        period: "sáng",
        date: formattedDate,
        fullDate: fullDate,
      });

      // Afternoon slot
      slots.push({
        id: `${fullDate}-afternoon`,
        day: dayNames[i],
        period: "chiều",
        date: formattedDate,
        fullDate: fullDate,
      });
    }

    return slots;
  }, [selectedWeek]);

  // Update the header description to show dynamic dates
  const weekRange = useMemo(
    () => getWeekDateRange(selectedWeek),
    [selectedWeek]
  );

  // Update the header JSX
  <div className="flex flex-col space-y-6 animate-fade-in">
    <div className="">
      <h1 className="text-2xl font-bold">Lịch phân ban khoa khám bệnh</h1>
      <p className="text-blue-500 mt-2">
        Quản lý lịch khám bệnh theo tuần - Tuần {weekRange.weekNum} năm{" "}
        {selectedWeek.split("-W")[0]}
      </p>
      <p className="text-sm text-blue-700 font-medium mt-1">
        Từ ngày {weekRange.startDate} đến ngày {weekRange.endDate}
      </p>
    </div>
  </div>;

  // Mock schedule data with multiple rooms per shift
  const [scheduleData, setScheduleData] = useState<
    Record<string, Record<string, ShiftSlot>>
  >({});

  // Load initial data when departments are fetched
  useEffect(() => {
    if (allDepartments.length > 0) {
      // Initialize empty schedule data for enabled departments
      const initialData: Record<string, Record<string, ShiftSlot>> = {};

      allDepartments
        .filter((dept) => dept.enable) // ✅ Chỉ lấy enabled departments
        .forEach((dept) => {
          initialData[dept.id.toString()] = {};
        });

      setScheduleData(initialData);
    }
  }, [allDepartments]);

  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchDepartments()); // Fetch departments
  }, [dispatch]);

  const zoneOptions = useMemo(() => {
    return [
      { id: "all", name: "Tất cả khu khám" },
      ...(zones || []).map((zone) => ({
        id: zone.id.toString(),
        name: zone.name,
      })),
    ];
  }, [zones]);

  const getRoomStyle = (type: string) => {
    const classification =
      roomClassifications[type as keyof typeof roomClassifications];
    if (classification && classification.enabled) {
      return `${classification.color} hover:opacity-80 transition-opacity`;
    }
    return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  };

  const getSpecialNotes = (room: string) => {
    if (["404", "405"].includes(room))
      return "Sao đỏ thường - Khám phòng đặc biệt";
    if (["421", "422"].includes(room)) return "Khám 11h-13h";
    return null;
  };

  const addRoomToShift = (deptId: string, slotId: string, roomId: string) => {
    const roomInfo = availableRooms.find((r) => r.id === roomId);
    if (!roomInfo) return;

    const cellKey = `${deptId}-${slotId}`;
    const period = slotId.includes("morning")
      ? "morning"
      : slotId.includes("afternoon")
      ? "afternoon"
      : "evening";
    const newRoom: RoomSlot = {
      id: roomInfo.id,
      name: roomInfo.name,
      classification: roomInfo.classification,
      customStartTime: shiftDefaults[period].start,
      customEndTime: shiftDefaults[period].end,
      appointmentCount: shiftDefaults[period].defaultAppointments,
      specialties: [...roomInfo.specialties],
      selectedSpecialty: roomInfo.specialties[0] || "Khám chuyên khoa",
      selectedDoctor: "", // Mặc định chưa chọn bác sĩ
      priorityOrder: 10, // Mặc định là 10
    };

    // Save current state for undo
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

    // Track changes
    setScheduleChanges((prev) => ({
      ...prev,
      [cellKey]: { action: "add_room", roomId },
    }));

    toast.success(`Đã thêm ${roomInfo.name} vào lịch khám`);
  };

  const removeRoomFromShift = (
    deptId: string,
    slotId: string,
    roomIndex: number
  ) => {
    const cellKey = `${deptId}-${slotId}`;

    // Save current state for undo
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

    // Track changes
    setScheduleChanges((prev) => ({
      ...prev,
      [cellKey]: { action: "remove_room", roomIndex },
    }));

    toast.success("Đã xóa phòng khỏi lịch khám");
  };

  const updateRoomConfig = (
    deptId: string,
    slotId: string,
    roomIndex: number,
    updates: Partial<RoomSlot>
  ) => {
    const cellKey = `${deptId}-${slotId}`;

    // Save current state for undo
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

    // Track changes
    setScheduleChanges((prev) => ({
      ...prev,
      [cellKey]: { action: "update_room", roomIndex, updates },
    }));

    toast.success("Đã cập nhật cấu hình phòng");
  };

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
    // Simulate API call
    setTimeout(() => {
      setScheduleChanges({});
      toast.success("Đã lưu tất cả thay đổi thành công!");
    }, 1000);
  };

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

  // Excel upload/download functions
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

        // Process the imported data and update scheduleData
        // This is a simplified example - you'd need to map your Excel structure
        console.log("Imported data:", jsonData);
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

    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel export
      const exportData: any[] = [];

      // Header row
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

      // Data rows
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
              room.customStartTime || defaultShift.start,
              room.customEndTime || defaultShift.end,
              room.appointmentCount || defaultShift.defaultAppointments,
              room.selectedSpecialty || "Khám chuyên khoa",
            ]);
          });
        });
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      // Auto-size columns
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

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch khám tuần");

      // Generate filename with current week
      const filename = `Lich_kham_tuan_${
        weekRange.weekNum
      }_${weekRange.startDate.replace("/", "")}-${weekRange.endDate.replace(
        "/",
        ""
      )}.xlsx`;

      // Download file
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

  const isLoading = zonesLoading || departmentsLoading;

  // Add loading check in the render
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

  // Add these handler functions to your WeeklySchedule component
  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex((week) => week.value === selectedWeek);
    if (currentIndex > 0) {
      setSelectedWeek(weeks[currentIndex - 1].value);
    } else {
      // Nếu đang ở tuần đầu tiên, có thể thêm logic để tạo tuần trước đó
      toast.info("Đã đến tuần sớm nhất");
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex((week) => week.value === selectedWeek);
    if (currentIndex < weeks.length - 1) {
      setSelectedWeek(weeks[currentIndex + 1].value);
    } else {
      // Nếu đang ở tuần cuối, có thể thêm logic để tạo tuần sau
      toast.info("Đã đến tuần muộn nhất");
    }
  };

  // Add this after your existing useMemo hooks
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: any) => option.name,
    limit: 100,
  });

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 min-w-0 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-6 animate-fade-in">
              <div className="">
                <h1 className="text-2xl font-bold">
                  Lịch phân ban khoa khám bệnh
                </h1>
                <p className="text-blue-500 mt-2">
                  Quản lý lịch khám bệnh theo tuần - Tuần {weekRange.weekNum}{" "}
                  năm {selectedWeek.split("-W")[0]}
                </p>
                <p className="text-sm text-blue-700 font-medium mt-1">
                  Từ ngày {weekRange.startDate} đến ngày {weekRange.endDate}
                </p>
              </div>
            </div>
            {/* Controls */}
          </div>

          {/* Controls */}
          <Card className="shadow-md">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                  {/* Zone Selection */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="zone-select"
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      Khu khám:
                    </Label>
                    <Select
                      value={selectedZone}
                      onValueChange={setSelectedZone}
                    >
                      <SelectTrigger id="zone-select" className="w-40 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {zoneOptions.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Week Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousWeek}
                      className="h-9"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Select
                      value={selectedWeek}
                      onValueChange={setSelectedWeek}
                    >
                      <SelectTrigger className="w-40 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weeks.map((week) => (
                          <SelectItem
                            key={week.value}
                            value={week.value}
                            className={`${
                              week.isCurrent
                                ? "text-blue-600 font-medium"
                                : week.isPast
                                ? "text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {week.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextWeek}
                      className="h-9"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm khoa phòng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-48 h-9"
                    />
                  </div>

                  {/* Department Filter - Replace the existing Select with this */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">
                      Khoa phòng:
                    </Label>
                    <Autocomplete
                      value={
                        departments.find(
                          (dept) => dept.id === selectedDepartment
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        setSelectedDepartment(newValue?.id || "all");
                      }}
                      options={departments}
                      getOptionLabel={(option) => option.name}
                      filterOptions={filterOptions}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn khoa phòng..."
                          size="small"
                          sx={{
                            minWidth: "300px",
                            "& .MuiOutlinedInput-root": {
                              height: "36px", // Match the h-9 class
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{option.name}</span>
                          </div>
                        </li>
                      )}
                      noOptionsText="Không tìm thấy khoa phòng"
                      clearText="Xóa"
                      openText="Mở"
                      closeText="Đóng"
                    />
                  </div>

                  {/* Excel Import/Export */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerFileUpload}
                      className="h-9 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Tải lên Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadExcel}
                      className="h-9 gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống Excel
                    </Button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "week" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                      className="rounded-r-none h-9"
                    >
                      Tuần
                    </Button>
                    <Button
                      variant={viewMode === "day" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("day")}
                      className="rounded-l-none h-9"
                    >
                      Ngày
                    </Button>
                  </div>

                  {/* Day Filter (when in day view) */}
                  {viewMode === "day" && (
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger className="w-48 h-9">
                        <SelectValue placeholder="Chọn ngày cụ thể" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả ngày</SelectItem>
                        {timeSlots
                          .filter(
                            (slot, index, array) =>
                              array.findIndex(
                                (s) => s.fullDate === slot.fullDate
                              ) === index
                          )
                          .map((slot) => {
                            // Parse the date properly from the week selection
                            const [year, weekStr] = selectedWeek.split("-W");
                            const weekNum = parseInt(weekStr);

                            // Calculate the actual date based on the week
                            const yearNum = parseInt(year);
                            const startOfYear = new Date(yearNum, 0, 1);
                            const daysToAdd =
                              (weekNum - 1) * 7 - startOfYear.getDay() + 1;
                            const mondayOfWeek = new Date(
                              yearNum,
                              0,
                              1 + daysToAdd
                            );

                            // Map day names to day numbers
                            const dayIndex =
                              slot.day === "Thứ Hai"
                                ? 0
                                : slot.day === "Thứ Ba"
                                ? 1
                                : slot.day === "Thứ Tư"
                                ? 2
                                : slot.day === "Thứ Năm"
                                ? 3
                                : slot.day === "Thứ Sáu"
                                ? 4
                                : 0;

                            const actualDate = new Date(mondayOfWeek);
                            actualDate.setDate(
                              mondayOfWeek.getDate() + dayIndex
                            );

                            const formattedDate = format(actualDate, "dd/MM");

                            return (
                              <SelectItem
                                key={slot.fullDate}
                                value={slot.fullDate}
                              >
                                {slot.day} - {formattedDate}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Dialog
                    open={showShiftConfigDialog}
                    onOpenChange={setShowShiftConfigDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Clock className="w-4 h-4 mr-2" />
                        Cấu hình ca khám
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Cấu hình thời gian ca khám</DialogTitle>
                        <DialogDescription>
                          Thiết lập thời gian mặc định và số ca khám cho từng ca
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {Object.entries(shiftDefaults).map(
                          ([shiftKey, shift]) => (
                            <div key={shiftKey} className="space-y-3">
                              <Label className="text-base font-medium">
                                Ca{" "}
                                {shiftKey === "morning"
                                  ? "sáng"
                                  : shiftKey === "afternoon"
                                  ? "chiều"
                                  : "tối"}
                              </Label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-sm">Giờ bắt đầu</Label>
                                  <Input
                                    type="time"
                                    value={shift.start}
                                    onChange={(e) =>
                                      setShiftDefaults((prev) => ({
                                        ...prev,
                                        [shiftKey]: {
                                          ...prev[
                                            shiftKey as keyof typeof prev
                                          ],
                                          start: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">
                                    Giờ kết thúc
                                  </Label>
                                  <Input
                                    type="time"
                                    value={shift.end}
                                    onChange={(e) =>
                                      setShiftDefaults((prev) => ({
                                        ...prev,
                                        [shiftKey]: {
                                          ...prev[
                                            shiftKey as keyof typeof prev
                                          ],
                                          end: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">
                                    Số ca mặc định
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={shift.defaultAppointments}
                                    onChange={(e) =>
                                      setShiftDefaults((prev) => ({
                                        ...prev,
                                        [shiftKey]: {
                                          ...prev[
                                            shiftKey as keyof typeof prev
                                          ],
                                          defaultAppointments:
                                            parseInt(e.target.value) || 10,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={showRoomClassificationDialog}
                    onOpenChange={setShowRoomClassificationDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Palette className="w-4 h-4 mr-2" />
                        Phân loại phòng
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Quản lý phân loại phòng khám</DialogTitle>
                        <DialogDescription>
                          Cấu hình màu sắc và trạng thái cho từng loại phòng
                          khám
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {Object.entries(roomClassifications).map(
                          ([key, classification]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded border ${
                                    classification.color.split(" ")[0]
                                  } ${classification.color.split(" ")[2]}`}
                                ></div>
                                <div>
                                  <div className="font-medium">
                                    {classification.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Loại: {key}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {classification.enabled
                                    ? "Đang sử dụng"
                                    : "Đã tắt"}
                                </span>
                                <Button
                                  variant={
                                    classification.enabled
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => {
                                    setRoomClassifications((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key as keyof typeof prev],
                                        enabled:
                                          !prev[key as keyof typeof prev]
                                            .enabled,
                                      },
                                    }));
                                  }}
                                >
                                  {classification.enabled ? "Tắt" : "Bật"}
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="h-9"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Hoàn tác
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="h-9"
                  >
                    <Redo2 className="w-4 h-4 mr-2" />
                    Làm lại
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={Object.keys(scheduleChanges).length === 0}
                    className="h-9 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu tất cả ({Object.keys(scheduleChanges).length})
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Table */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar className="w-5 h-5 text-blue-600" />
              Lịch phân ban khoa khám bệnh - Tuần {
                selectedWeek.split("-W")[1]
              }{" "}
              năm 2025
              {viewMode === "day" && selectedDay !== "all" && (
                <span className="text-sm font-normal ml-2">
                  -{" "}
                  {timeSlots.find((slot) => slot.fullDate === selectedDay)?.day}{" "}
                  (
                  {
                    timeSlots.find((slot) => slot.fullDate === selectedDay)
                      ?.date
                  }
                  )
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ minWidth: "max-content" }}
              >
                {/* Header */}
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="border border-gray-300 p-1 text-left font-semibold text-gray-700 bg-blue-100 sticky left-0 z-20 w-24 shadow-lg">
                      <div className="text-[10px]">KHOA PHÒNG</div>
                    </th>
                    {(viewMode === "week"
                      ? timeSlots
                      : timeSlots.filter(
                          (slot) =>
                            selectedDay === "all" ||
                            slot.fullDate === selectedDay
                        )
                    ).map((slot) => (
                      <th
                        key={slot.id}
                        className="border border-gray-300 p-1 text-center font-medium text-gray-700 w-20 bg-gradient-to-b from-blue-50 to-blue-100"
                      >
                        <div className="text-[9px] font-semibold text-blue-800">
                          {slot.day.replace("Thứ ", "T")}, {slot.date}
                        </div>
                        <div className="text-[8px] text-blue-600 font-medium uppercase tracking-wide mt-0.5">
                          {slot.period === "sáng"
                            ? "Sáng: 07:30 – 11:00"
                            : "Chiều: 13:30 – 16:00"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {searchFilteredDepartments.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className={
                        index % 2 === 0
                          ? "bg-white hover:bg-gray-50"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                    >
                      <td className="border border-gray-300 p-1 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 shadow-md">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-[10px]">{dept.name}</span>
                        </div>
                      </td>
                      {(viewMode === "week"
                        ? timeSlots
                        : timeSlots.filter(
                            (slot) =>
                              selectedDay === "all" ||
                              slot.fullDate === selectedDay
                          )
                      ).map((slot) => {
                        const shiftData = scheduleData[dept.id]?.[slot.id];
                        const cellKey = `${dept.id}-${slot.id}`;
                        const isEditing = editingCell === cellKey;
                        const hasChanges = scheduleChanges[cellKey];
                        const rooms = shiftData?.rooms || [];

                        return (
                          <td
                            key={slot.id}
                            className="border border-gray-300 p-1 text-center relative min-w-[120px]"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                  <Input
                                    placeholder="Tìm phòng..."
                                    value={roomSearchTerm}
                                    onChange={(e) =>
                                      setRoomSearchTerm(e.target.value)
                                    }
                                    className="pl-7 h-7 text-xs"
                                  />
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {filteredRooms.map((room) => (
                                    <Button
                                      key={room.id}
                                      variant="outline"
                                      size="sm"
                                      className="w-full h-7 text-xs justify-start"
                                      onClick={() => {
                                        addRoomToShift(
                                          dept.id,
                                          slot.id,
                                          room.id
                                        );
                                        setEditingCell(null);
                                        setRoomSearchTerm("");
                                      }}
                                    >
                                      <div
                                        className={`w-2 h-2 rounded mr-2 ${
                                          roomClassifications[
                                            room.classification as keyof typeof roomClassifications
                                          ]?.color.split(" ")[0] ||
                                          "bg-gray-200"
                                        }`}
                                      ></div>
                                      {room.code} - {room.name}
                                    </Button>
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-6 text-xs"
                                  onClick={() => {
                                    setEditingCell(null);
                                    setRoomSearchTerm("");
                                  }}
                                >
                                  Hủy
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {rooms.map((room, roomIndex) => (
                                  <Popover key={roomIndex}>
                                    <PopoverTrigger asChild>
                                      <div
                                        className={`flex flex-col gap-1 px-2 py-1 rounded-md text-xs font-medium border cursor-pointer transition-all duration-200 ${getRoomStyle(
                                          room.classification
                                        )} ${
                                          hasChanges
                                            ? "ring-1 ring-blue-400"
                                            : ""
                                        } w-full`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold">
                                            {room.name.replace("Phòng ", "")}
                                          </span>
                                          <X
                                            className="w-3 h-3 hover:text-red-500"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeRoomFromShift(
                                                dept.id,
                                                slot.id,
                                                roomIndex
                                              );
                                            }}
                                          />
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-medium">
                                          {room.selectedSpecialty ||
                                            "Khám chuyên khoa"}
                                        </div>
                                        {room.selectedDoctor && (
                                          <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                            <span>👨‍⚕️</span>
                                            <span>
                                              {availableDoctors.find(
                                                (d) =>
                                                  d.id === room.selectedDoctor
                                              )?.name || room.selectedDoctor}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between text-[10px]">
                                          <div className="flex items-center gap-1">
                                            {((room.customStartTime &&
                                              room.customStartTime !==
                                                shiftDefaults[
                                                  slot.period as keyof typeof shiftDefaults
                                                ]?.start) ||
                                              (room.customEndTime &&
                                                room.customEndTime !==
                                                  shiftDefaults[
                                                    slot.period as keyof typeof shiftDefaults
                                                  ]?.end)) && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                  {room.customStartTime !==
                                                    shiftDefaults[
                                                      slot.period as keyof typeof shiftDefaults
                                                    ]?.start &&
                                                  room.customEndTime !==
                                                    shiftDefaults[
                                                      slot.period as keyof typeof shiftDefaults
                                                    ]?.end
                                                    ? `${room.customStartTime}-${room.customEndTime}`
                                                    : room.customStartTime !==
                                                      shiftDefaults[
                                                        slot.period as keyof typeof shiftDefaults
                                                      ]?.start
                                                    ? `${room.customStartTime}`
                                                    : `${room.customEndTime}`}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{room.appointmentCount}</span>
                                            {room.priorityOrder > 0 && (
                                              <span className="flex items-center ml-1 text-yellow-500">
                                                <svg
                                                  width="12"
                                                  height="12"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                  className="inline-block mr-0.5"
                                                >
                                                  <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                                                </svg>
                                                <span className="text-[10px] font-bold">
                                                  {room.priorityOrder ?? 10}
                                                </span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-80 p-4"
                                      side="right"
                                    >
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium text-sm">
                                            {room.name}
                                          </h4>
                                          <div className="text-xs text-gray-600">
                                            Loại:{" "}
                                            {roomClassifications[
                                              room.classification as keyof typeof roomClassifications
                                            ]?.name || room.classification}
                                          </div>
                                        </div>

                                        {/* Room Classification Selector */}
                                        <div>
                                          <Label className="text-xs">
                                            Phân loại phòng
                                          </Label>
                                          <Select
                                            value={room.classification}
                                            onValueChange={(value) =>
                                              updateRoomConfig(
                                                dept.id,
                                                slot.id,
                                                roomIndex,
                                                { classification: value }
                                              )
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.entries(
                                                roomClassifications
                                              )
                                                .filter(
                                                  ([_, classification]) =>
                                                    classification.enabled
                                                )
                                                .map(
                                                  ([key, classification]) => (
                                                    <SelectItem
                                                      key={key}
                                                      value={key}
                                                      className="text-xs"
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <div
                                                          className={`w-3 h-3 rounded border ${
                                                            classification.color.split(
                                                              " "
                                                            )[0]
                                                          } ${
                                                            classification.color.split(
                                                              " "
                                                            )[2]
                                                          }`}
                                                        ></div>
                                                        {classification.name}
                                                      </div>
                                                    </SelectItem>
                                                  )
                                                )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label className="text-xs">
                                              Giờ bắt đầu
                                            </Label>
                                            <Input
                                              type="time"
                                              value={
                                                room.customStartTime ||
                                                shiftDefaults[
                                                  slot.period as keyof typeof shiftDefaults
                                                ]?.start ||
                                                "07:30"
                                              }
                                              onChange={(e) =>
                                                updateRoomConfig(
                                                  dept.id,
                                                  slot.id,
                                                  roomIndex,
                                                  {
                                                    customStartTime:
                                                      e.target.value,
                                                  }
                                                )
                                              }
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-xs">
                                              Giờ kết thúc
                                            </Label>
                                            <Input
                                              type="time"
                                              value={
                                                room.customEndTime ||
                                                shiftDefaults[
                                                  slot.period as keyof typeof shiftDefaults
                                                ]?.end ||
                                                "11:00"
                                              }
                                              onChange={(e) =>
                                                updateRoomConfig(
                                                  dept.id,
                                                  slot.id,
                                                  roomIndex,
                                                  {
                                                    customEndTime:
                                                      e.target.value,
                                                  }
                                                )
                                              }
                                              className="h-7 text-xs"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <Label className="text-xs">
                                            Số ca khám/giờ
                                          </Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={room.appointmentCount || 10}
                                            onChange={(e) =>
                                              updateRoomConfig(
                                                dept.id,
                                                slot.id,
                                                roomIndex,
                                                {
                                                  appointmentCount:
                                                    parseInt(e.target.value) ||
                                                    10,
                                                }
                                              )
                                            }
                                            className="h-7 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <Label className="text-xs">
                                            Số ưu tiên
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="99"
                                            value={room.priorityOrder ?? 10}
                                            onChange={(e) =>
                                              updateRoomConfig(
                                                dept.id,
                                                slot.id,
                                                roomIndex,
                                                {
                                                  priorityOrder:
                                                    parseInt(e.target.value) ||
                                                    0,
                                                }
                                              )
                                            }
                                            className="h-7 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <Label className="text-xs">
                                            Chức năng/Kỹ thuật chuyên môn
                                          </Label>
                                          <Select
                                            value={
                                              room.selectedSpecialty ||
                                              "Khám chuyên khoa"
                                            }
                                            onValueChange={(value) =>
                                              updateRoomConfig(
                                                dept.id,
                                                slot.id,
                                                roomIndex,
                                                { selectedSpecialty: value }
                                              )
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs mt-2">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableSpecialties.map(
                                                (specialty) => (
                                                  <SelectItem
                                                    key={specialty}
                                                    value={specialty}
                                                    className="text-xs"
                                                  >
                                                    {specialty}
                                                  </SelectItem>
                                                )
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Bác sĩ phụ trách */}
                                        <Label className="text-xs">
                                          Bác sĩ phụ trách
                                        </Label>
                                        {!room.selectedDoctor ? (
                                          <div>
                                            <div className="relative mb-2">
                                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                              <Input
                                                placeholder="Tìm kiếm bác sĩ theo tên hoặc mã..."
                                                value={
                                                  room._doctorSearchTerm || ""
                                                }
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  updateRoomConfig(
                                                    dept.id,
                                                    slot.id,
                                                    roomIndex,
                                                    { _doctorSearchTerm: value }
                                                  );
                                                }}
                                                className="pl-7 h-7 text-xs"
                                              />
                                            </div>
                                            <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                                              {availableDoctors
                                                .filter((doctor) => {
                                                  const term = (
                                                    room._doctorSearchTerm || ""
                                                  ).toLowerCase();
                                                  return (
                                                    doctor.name
                                                      .toLowerCase()
                                                      .includes(term) ||
                                                    doctor.code
                                                      .toLowerCase()
                                                      .includes(term)
                                                  );
                                                })
                                                .map((doctor) => (
                                                  <Button
                                                    key={doctor.id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-7 text-xs justify-start"
                                                    onClick={() => {
                                                      updateRoomConfig(
                                                        dept.id,
                                                        slot.id,
                                                        roomIndex,
                                                        {
                                                          selectedDoctor:
                                                            doctor.id,
                                                          _doctorSearchTerm: "",
                                                        }
                                                      );
                                                    }}
                                                  >
                                                    <span className="mr-2">
                                                      👨‍⚕️
                                                    </span>
                                                    {doctor.code} -{" "}
                                                    {doctor.name} (
                                                    {doctor.specialty})
                                                  </Button>
                                                ))}
                                            </div>
                                            {availableDoctors.filter(
                                              (doctor) => {
                                                const term = (
                                                  room._doctorSearchTerm || ""
                                                ).toLowerCase();
                                                return (
                                                  doctor.name
                                                    .toLowerCase()
                                                    .includes(term) ||
                                                  doctor.code
                                                    .toLowerCase()
                                                    .includes(term)
                                                );
                                              }
                                            ).length === 0 && (
                                              <div className="text-xs text-gray-400 text-center">
                                                Không tìm thấy bác sĩ
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                              <span>👨‍⚕️</span>
                                              <span>
                                                {availableDoctors.find(
                                                  (d) =>
                                                    d.id === room.selectedDoctor
                                                )?.name || room.selectedDoctor}
                                              </span>
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 px-2 text-xs"
                                              onClick={() =>
                                                updateRoomConfig(
                                                  dept.id,
                                                  slot.id,
                                                  roomIndex,
                                                  { selectedDoctor: "" }
                                                )
                                              }
                                            >
                                              Xóa
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ))}

                                {rooms.length === 0 && (
                                  <div
                                    className="w-full h-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 cursor-pointer flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Thêm phòng</span>
                                  </div>
                                )}

                                {rooms.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-6 text-xs border-dashed border-2 border-gray-300 hover:border-blue-400"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Thêm phòng
                                  </Button>
                                )}

                                {hasChanges && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1 right-1"></div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Chú thích và hướng dẫn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Màu sắc phân loại:
                </h4>
                <div className="space-y-3">
                  {Object.entries(roomClassifications)
                    .filter(([_, classification]) => classification.enabled)
                    .map(([key, classification]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded border ${
                            classification.color.split(" ")[0]
                          } ${classification.color.split(" ")[2]}`}
                        ></div>
                        <span className="text-sm">{classification.name}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Ghi chú đặc biệt:
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    • <strong>Click vào phòng:</strong> Cấu hình chi tiết (giờ
                    khám, số ca, chuyên khoa, phân loại)
                  </div>
                  <div>
                    • <strong>Tìm kiếm phòng:</strong> Theo tên hoặc mã phòng
                  </div>
                  <div>
                    • <strong>Nhiều phòng/ca:</strong> Có thể thêm nhiều phòng
                    cho cùng một ca khám
                  </div>
                  <div>
                    • <strong>Số bên cạnh icon:</strong> Số ca khám của phòng
                  </div>
                  <div>
                    • <strong>Thời gian tự động:</strong> Ca sáng (7:30-11:00),
                    ca chiều (13:30-16:00)
                  </div>
                  <div>
                    • <strong>Phân loại phòng:</strong> Có thể thay đổi từ
                    thường sang ưu tiên và ngược lại
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {departments.filter((d) => d.id !== "all").length}
              </div>
              <p className="text-sm text-gray-600">Khoa phòng hoạt động</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(scheduleData).reduce(
                  (total, dept) =>
                    total +
                    Object.values(dept).reduce(
                      (deptTotal, shift) =>
                        deptTotal + (shift?.rooms?.length || 0),
                      0
                    ),
                  0
                )}
              </div>
              <p className="text-sm text-gray-600">Tổng phòng khám hoạt động</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(scheduleData).reduce(
                  (total, dept) =>
                    total +
                    Object.values(dept).reduce(
                      (deptTotal, shift) =>
                        deptTotal +
                        (shift?.rooms?.reduce(
                          (roomTotal, room) =>
                            roomTotal + (room.appointmentCount || 0),
                          0
                        ) || 0),
                      0
                    ),
                  0
                )}
              </div>
              <p className="text-sm text-gray-600">
                Tổng số ca khám trong tuần
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {Object.keys(scheduleChanges).length}
              </div>
              <p className="text-sm text-gray-600">Thay đổi chưa lưu</p>
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input for Excel upload */}
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
