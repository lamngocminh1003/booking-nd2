import { useState, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  parse,
  startOfWeek,
  endOfWeek,
  addWeeks,
  getISOWeek,
  endOfYear,
  differenceInWeeks,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Save,
  Plus,
  Copy,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchRooms } from "@/store/slices/roomSlice";
import { fetchSpecialties } from "@/store/slices/specialtySlice";
import { fetchDoctors } from "@/store/slices/doctorSlice";
import { fetchZones } from "@/store/slices/zoneSlice";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Thêm function để lấy danh sách tuần
const getWeeksList = () => {
  const today = new Date();
  const endYear = endOfYear(today);
  const weeksUntilEndOfYear = Math.ceil(differenceInWeeks(endYear, today));
  const weeks = [];

  // Thêm các tuần trong quá khứ (12 tuần)
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

  // Thêm tuần hiện tại
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

  // Thêm các tuần còn lại đến hết năm
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

// Thêm hàm helper để lấy danh sách ngày trong tuần
const getWeekDays = (weekString: string) => {
  const [year, week] = weekString.split("-W");
  // Tìm ngày đầu tiên của tuần
  const firstDayOfYear = new Date(parseInt(year), 0, 1);
  const firstWeek = getISOWeek(firstDayOfYear);
  const weekDiff = parseInt(week) - firstWeek;
  const weekStart = startOfWeek(addWeeks(firstDayOfYear, weekDiff), {
    weekStartsOn: 1,
  });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    days.push({
      date: format(date, "yyyy-MM-dd"),
      dayOfWeek: format(date, "EEEE", { locale: vi }),
      dayDisplay: format(date, "dd/MM/yyyy"),
    });
  }
  return days;
};

// Map thứ tiếng Anh sang tiếng Việt
const mapDayOfWeek = (engDay: string): string => {
  const dayMap: { [key: string]: string } = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };
  return dayMap[engDay] || engDay;
};

const ScheduleManagement = () => {
  const dispatch = useAppDispatch();
  // Sửa lại cách lấy data từ store để phù hợp với interface
  const { list: rooms, loading: roomsLoading } = useAppSelector(
    (state) => state.room
  );
  const { list: specialties, loading: specialtiesLoading } = useAppSelector(
    (state) => state.specialty
  );
  const { doctors, loading: doctorsLoading } = useAppSelector(
    (state) => state.doctor
  );
  const { list: zones } = useAppSelector((state) => state.zone);

  // Thêm loading state chung
  const isLoading = roomsLoading || specialtiesLoading || doctorsLoading;

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const weekNumber = getISOWeek(today);
    const year = today.getFullYear();
    return `${year}-W${weekNumber}`;
  });
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Mock schedule data
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      year: 2024,
      week: 25,
      date: "2024-06-17",
      dayOfWeek: "Thứ 2",
      area: "Khu A",
      room: "Phòng 101",
      shift: "Ca sáng",
      examType: "Khám thường",
      specialty: "Nhi khoa",
      department: "Khoa Nhi",
      doctor: "BS. Nguyễn Văn A",
      isActive: true,
    },
    {
      id: 2,
      year: 2024,
      week: 25,
      date: "2024-06-17",
      dayOfWeek: "Thứ 2",
      area: "Khu A",
      room: "Phòng 102",
      shift: "Ca chiều",
      examType: "Khám chuyên khoa",
      specialty: "Tai mũi họng",
      department: "Khoa TMH",
      doctor: "BS. Trần Thị B",
      isActive: true,
    },
    {
      id: 3,
      year: 2024,
      week: 25,
      date: "2024-06-18",
      dayOfWeek: "Thứ 3",
      area: "Khu B",
      room: "Phòng 201",
      shift: "Trực đêm",
      examType: "Cấp cứu",
      specialty: "Khoa ngoại",
      department: "Khoa Ngoại",
      doctor: "BS. Lê Văn C",
      isActive: false,
    },
  ]);

  const weeks = useMemo(() => getWeeksList(), []); // Cached list of weeks

  // Thêm state để lưu danh sách ngày trong tuần
  const [weekDays, setWeekDays] = useState(() => getWeekDays(selectedWeek));

  // Cập nhật useEffect để theo dõi thay đổi tuần
  useEffect(() => {
    const days = getWeekDays(selectedWeek);
    setWeekDays(days);

    // Cập nhật lại schedules với ngày mới
    setSchedules((prevSchedules) =>
      prevSchedules.map((schedule) => ({
        ...schedule,
        date: days[0].date, // Mặc định là ngày đầu tuần
        dayOfWeek: mapDayOfWeek(days[0].dayOfWeek),
        year: parseInt(selectedWeek.split("-W")[0]),
        week: parseInt(selectedWeek.split("-W")[1]),
      }))
    );
  }, [selectedWeek]);

  // Cập nhật days array để sử dụng ngày thực tế
  const days = [
    { value: "all", label: "Tất cả các ngày" },
    ...weekDays.map((day) => ({
      value: mapDayOfWeek(day.dayOfWeek),
      label: `${mapDayOfWeek(day.dayOfWeek)} (${day.dayDisplay})`,
      date: day.date,
    })),
  ];

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDay =
      selectedDay === "all" || schedule.dayOfWeek === selectedDay;
    const matchesZone =
      selectedZone === "all" || schedule.area === selectedZone;
    return matchesDay && matchesZone;
  });

  const handleToggleActive = (id: number) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      )
    );
    toast.success("Đã cập nhật trạng thái lịch khám");
  };

  const handleSave = () => {
    toast.success("Đã lưu lịch phân công thành công!");
  };

  const handleCopyWeek = () => {
    toast.success("Đã sao chép lịch từ tuần trước!");
  };

  const handleExportExcel = () => {
    toast.success("Đang xuất file Excel...");
  };

  const getShiftColor = (shift: string) => {
    if (shift.includes("đêm")) return "bg-purple-100 text-purple-800";
    if (shift.includes("sáng")) return "bg-blue-100 text-blue-800";
    if (shift.includes("chiều")) return "bg-orange-100 text-orange-800";
    if (shift.includes("tối")) return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
  };

  const isSelectedWeekInPast = useMemo(() => {
    const selectedWeekData = weeks.find((week) => week.value === selectedWeek);
    return selectedWeekData?.isPast || false;
  }, [selectedWeek, weeks]);

  // Thêm vào phần styles hoặc className của component
  const disabledStyle = isSelectedWeekInPast
    ? "opacity-50 cursor-not-allowed"
    : "";

  const handleDisabledFieldClick = (e: React.MouseEvent) => {
    if (isSelectedWeekInPast) {
      e.preventDefault();
      toast.error("Không thể chỉnh sửa lịch trong quá khứ!");
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchRooms());
    dispatch(fetchSpecialties());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const searchBoxStyles = {
    position: "relative" as const,
    width: "100%",
    maxWidth: "500px",
  };

  const searchResultsStyles = {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    marginTop: "0.25rem",
    maxHeight: "300px",
    overflowY: "auto" as const,
    zIndex: 50,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return [];

    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.doctor_IdEmployee_Postgresql
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearching &&
        !(event.target as HTMLElement).closest(".search-container")
      ) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearching]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Phân lịch phòng khám cho bác sĩ
          </h1>
          <p className="text-gray-600">
            Quản lý và phân công lịch khám bệnh cho bác sĩ
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Thêm select zone trước select week */}
            <div className="flex items-center space-x-2">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Chọn tuần" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Chọn ngày" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div style={searchBoxStyles}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ theo tên hoặc mã..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {isSearching && searchQuery && (
                <div style={searchResultsStyles}>
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        // Handle doctor selection
                        setSearchQuery("");
                        setIsSearching(false);
                      }}
                    >
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">
                          {doctor.doctor_IdEmployee_Postgresql} - {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doctor.specialty}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="p-2 text-gray-500 text-center">
                      Không tìm thấy bác sĩ
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
            <Button variant="outline" onClick={handleCopyWeek}>
              <Copy className="w-4 h-4 mr-2" />
              Nhận bản sao tuần
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Lịch phân công - Tuần {selectedWeek.split("-W")[1]}/2024 (
              {filteredSchedules.length} ca khám)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Thứ</TableHead>
                    <TableHead>Phòng khám</TableHead>
                    <TableHead>Ca khám</TableHead>
                    <TableHead>Loại khám</TableHead>
                    <TableHead>Chuyên khoa</TableHead>
                    <TableHead>Khoa phòng</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules?.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.date}</TableCell>
                      <TableCell>{schedule.dayOfWeek}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={schedule.room}
                          value={schedule.room}
                          onValueChange={(value) => {
                            // Xử lý cập nhật giá trị
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(rooms || []).map((room) => (
                              <SelectItem key={room.id} value={room.name}>
                                {room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getShiftColor(schedule.shift)}>
                          {schedule.shift}
                        </Badge>
                      </TableCell>
                      <TableCell>{schedule.examType}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={schedule.specialty}
                          disabled={isSelectedWeekInPast}
                          onPointerDown={handleDisabledFieldClick}
                          className={disabledStyle}
                        >
                          <SelectTrigger className={`w-32 ${disabledStyle}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(specialties || []).map((specialty) => (
                              <SelectItem
                                key={specialty.id}
                                value={specialty.name}
                              >
                                {specialty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{schedule.department}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={schedule.doctor}
                          disabled={isSelectedWeekInPast}
                          onPointerDown={handleDisabledFieldClick}
                          className={disabledStyle}
                        >
                          <SelectTrigger className={`w-40 ${disabledStyle}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(doctors || []).map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.name}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={() =>
                            handleToggleActive(schedule.id)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {filteredSchedules.filter((s) => s.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Ca khám đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredSchedules.filter((s) => s.shift.includes("đêm")).length}
            </div>
            <p className="text-sm text-gray-600">Ca trực đêm</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(filteredSchedules.map((s) => s.doctor)).size}
            </div>
            <p className="text-sm text-gray-600">Bác sĩ tham gia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredSchedules.map((s) => s.room)).size}
            </div>
            <p className="text-sm text-gray-600">Phòng khám sử dụng</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleManagement;

interface Schedule {
  id: number;
  year: number;
  week: number;
  date: string;
  dayOfWeek: string;
  area: string;
  room: string;
  shift: string;
  examType: string;
  specialty: string;
  department: string;
  doctor: string;
  isActive: boolean;
}
