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
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchRooms } from "@/store/slices/roomSlice";
import { fetchSpecialties } from "@/store/slices/specialtySlice";
import { fetchDoctors } from "@/store/slices/doctorSlice";
import { fetchZones } from "@/store/slices/zoneSlice";
import { fetchDepartments } from "@/store/slices/departmentSlice";
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
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

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

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiInputBase-root": {
    borderRadius: "0.375rem",
    backgroundColor: "white",
    borderColor: "rgb(209 213 219)",
    "&:hover": {
      borderColor: "rgb(156 163 175)",
    },
    "&.Mui-focused": {
      borderColor: "rgb(16 185 129)",
      boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
    },
  },
});

// Add this to your existing styles
const autoCompleteStyles = {
  "& .MuiAutocomplete-input": {
    padding: "8px 12px !important",
  },
  "& .MuiOutlinedInput-root": {
    padding: "0 !important",
  },
  "& .MuiAutocomplete-endAdornment": {
    right: "8px !important",
  },
};

const filterOptions = createFilterOptions({
  matchFrom: "any",
  stringify: (option) => {
    // Combine both name and ID for searching
    return `${option.name} ${option.doctor_IdEmployee_Postgresql || ""}`;
  },
  limit: 100, // Adjust this number based on your needs
});

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
  const { list: departments, loading: departmentsLoading } = useAppSelector(
    (state) => state.department
  );

  // Thêm loading state chung
  const isLoading =
    roomsLoading || specialtiesLoading || doctorsLoading || departmentsLoading;

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const weekNumber = getISOWeek(today);
    const year = today.getFullYear();
    return `${year}-W${weekNumber}`;
  });
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedZone, setSelectedZone] = useState(() => {
    const lyTuTrongZone = zones?.find((zone) => zone.name === "Lý Tự Trọng");
    return lyTuTrongZone?.id || "all";
  });

  // Remove mock schedules and update initialization
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [weekDays, setWeekDays] = useState(() => getWeekDays(selectedWeek));

  // Add selected date state
  const [selectedDate, setSelectedDate] = useState("");

  // Update useEffect to set default zone and date
  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchRooms());
    dispatch(fetchSpecialties());
    dispatch(fetchDoctors());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    // Set default date to first day of selected week
    setSelectedDate(weekDays[0].date);
  }, [weekDays]);

  // Update empty schedule template
  const emptySchedule: Partial<Schedule> = {
    year: new Date().getFullYear(),
    week: parseInt(selectedWeek.split("-W")[1]),
    date: selectedDate, // Use selected date instead of first day
    dayOfWeek: mapDayOfWeek(
      format(
        parse(selectedDate || weekDays[0].date, "yyyy-MM-dd", new Date()),
        "EEEE",
        { locale: vi }
      )
    ),
    room: "",
    shift: "",
    examType: "",
    specialty: "",
    doctor: "",
    isActive: true,
    priority: 0,
    patientsPerHour: 4,
    zone: "Lý Tự Trọng", // Set default zone
  };

  const weeks = useMemo(() => getWeeksList(), []); // Cached list of weeks

  // Thêm state để lưu danh sách ngày trong tuần

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

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      return schedule.date === selectedDate;
    });
  }, [schedules, selectedDate]);

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

  const handleAddSchedule = (newScheduleData: Partial<Schedule>) => {
    const newSchedule: Schedule = {
      ...emptySchedule,
      ...newScheduleData,
      id: Math.max(...schedules.map((s) => s.id)) + 1,
    } as Schedule;

    setSchedules([newSchedule, ...schedules]);
    toast.success("Đã thêm ca khám mới");
  };

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
            {/* Zone selection */}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <StyledAutocomplete
                options={zones || []}
                getOptionLabel={(option) => option.name}
                value={zones.find((zone) => zone.name === "Lý Tự Trọng")}
                disabled // Disable zone selection
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Khu Lý Tự Trọng"
                    sx={{ minWidth: "200px" }}
                  />
                )}
              />
            </div>

            {/* Existing week selection */}
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

            {/* Date selection */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Chọn ngày trong tuần" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.date} value={day.date}>
                      {`${mapDayOfWeek(day.dayOfWeek)} (${day.dayDisplay})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Existing day selection */}
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
                    <TableHead>Ca</TableHead>
                    <TableHead>Loại khám</TableHead>
                    <TableHead>Chuyên khoa</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Số ưu tiên</TableHead>
                    <TableHead>Số ca khám/giờ</TableHead>
                    <TableHead>Tr.Thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty row for new schedule */}
                  <TableRow>
                    <TableCell>
                      {format(
                        parse(weekDays[0].date, "yyyy-MM-dd", new Date()),
                        "dd/MM/yyyy"
                      )}
                    </TableCell>
                    <TableCell>{mapDayOfWeek(weekDays[0].dayOfWeek)}</TableCell>
                    <TableCell>
                      <StyledAutocomplete
                        options={rooms || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, newValue) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            room: newValue?.name || "",
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Chọn phòng"
                            sx={{ minWidth: "150px" }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            shift: value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Chọn ca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sáng">Ca sáng</SelectItem>
                          <SelectItem value="Chiều">Ca chiều</SelectItem>
                          <SelectItem value="Tối">Ca tối</SelectItem>
                          <SelectItem value="Trưa">Ca trưa</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            examType: value,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chuyên khoa">
                            Chuyên khoa
                          </SelectItem>
                          <SelectItem value="Tạp">Tạp</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <StyledAutocomplete
                        options={specialties || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, newValue) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            specialty: newValue?.name || "",
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Chọn chuyên khoa"
                            sx={{ minWidth: "200px" }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <StyledAutocomplete
                        options={doctors || []}
                        getOptionLabel={(option) =>
                          `${option.doctor_IdEmployee_Postgresql} - ${option.name}`
                        }
                        filterOptions={filterOptions}
                        onChange={(_, newValue) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            doctor: newValue?.name || "",
                            doctorId:
                              newValue?.doctor_IdEmployee_Postgresql || "",
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Tìm bác sĩ..."
                            sx={{ minWidth: "250px" }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        placeholder="0"
                        onChange={(e) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            priority: parseInt(e.target.value) || 0,
                          });
                        }}
                        inputProps={{ min: 0 }}
                        sx={{ width: "100px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        placeholder="4"
                        onChange={(e) => {
                          handleAddSchedule({
                            ...emptySchedule,
                            patientsPerHour: parseInt(e.target.value) || 4,
                          });
                        }}
                        inputProps={{ min: 0 }}
                        sx={{ width: "100px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch checked={true} />
                    </TableCell>
                  </TableRow>

                  {/* Existing schedules */}
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        {format(
                          parse(schedule.date, "yyyy-MM-dd", new Date()),
                          "dd/MM/yyyy"
                        )}
                      </TableCell>
                      <TableCell>{schedule.dayOfWeek}</TableCell>
                      <TableCell>
                        <StyledAutocomplete
                          disabled={isSelectedWeekInPast}
                          options={rooms || []}
                          getOptionLabel={(option) => option.name}
                          value={rooms.find(
                            (room) => room.name === schedule.room
                          )}
                          onChange={(_, newValue) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? { ...s, room: newValue?.name || "" }
                                  : s
                              )
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Chọn phòng"
                              sx={{ minWidth: "150px" }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={isSelectedWeekInPast}
                          value={schedule.shift}
                          onValueChange={(value) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? { ...s, shift: value }
                                  : s
                              )
                            );
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sáng">Ca sáng</SelectItem>
                            <SelectItem value="Chiều">Ca chiều</SelectItem>
                            <SelectItem value="Tối">Ca tối</SelectItem>
                            <SelectItem value="Trưa">Ca trưa</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={isSelectedWeekInPast}
                          value={schedule.examType}
                          onValueChange={(value) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? { ...s, examType: value }
                                  : s
                              )
                            );
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Chuyên khoa">
                              Chuyên khoa
                            </SelectItem>
                            <SelectItem value="Tạp">Tạp</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <StyledAutocomplete
                          disabled={isSelectedWeekInPast}
                          options={specialties || []}
                          getOptionLabel={(option) => option.name}
                          value={specialties.find(
                            (spec) => spec.name === schedule.specialty
                          )}
                          onChange={(_, newValue) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? { ...s, specialty: newValue?.name || "" }
                                  : s
                              )
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Chọn chuyên khoa"
                              sx={{ minWidth: "200px" }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <StyledAutocomplete
                          disabled={isSelectedWeekInPast}
                          options={doctors || []}
                          getOptionLabel={(option) =>
                            `${option.doctor_IdEmployee_Postgresql} - ${option.name}`
                          }
                          filterOptions={filterOptions}
                          value={doctors.find(
                            (doc) => doc.name === schedule.doctor
                          )}
                          onChange={(_, newValue) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? {
                                      ...s,
                                      doctor: newValue?.name || "",
                                      doctorId:
                                        newValue?.doctor_IdEmployee_Postgresql ||
                                        "",
                                    }
                                  : s
                              )
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Tìm bác sĩ..."
                              sx={{ minWidth: "250px" }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={schedule.priority || 0}
                          onChange={(e) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? {
                                      ...s,
                                      priority: parseInt(e.target.value) || 0,
                                    }
                                  : s
                              )
                            );
                          }}
                          disabled={isSelectedWeekInPast}
                          inputProps={{ min: 0 }}
                          sx={{ width: "100px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={schedule.patientsPerHour || 0}
                          onChange={(e) => {
                            setSchedules((prevSchedules) =>
                              prevSchedules.map((s) =>
                                s.id === schedule.id
                                  ? {
                                      ...s,
                                      patientsPerHour:
                                        parseInt(e.target.value) || 0,
                                    }
                                  : s
                              )
                            );
                          }}
                          disabled={isSelectedWeekInPast}
                          inputProps={{ min: 0 }}
                          sx={{ width: "100px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={() =>
                            handleToggleActive(schedule.id)
                          }
                          disabled={isSelectedWeekInPast}
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
  zone: string; // Zone/Khu
  room: string; // Phòng khám
  shift: string; // Ca
  examType: string; // Loại khám
  specialty: string; // Chuyên khoa
  doctor: string; // Bác sĩ
  isActive: boolean;
  doctorId?: string;
  priority: number;
  patientsPerHour: number;
}
