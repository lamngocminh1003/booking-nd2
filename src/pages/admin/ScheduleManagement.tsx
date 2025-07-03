import { useState } from "react";
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
import { Calendar, Save, Plus, Copy, Download, Filter } from "lucide-react";
import { toast } from "sonner";

const ScheduleManagement = () => {
  const [selectedWeek, setSelectedWeek] = useState("2024-W25");
  const [selectedDay, setSelectedDay] = useState("all");

  // Mock schedule data
  const [schedules, setSchedules] = useState([
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

  const weeks = [
    { value: "2024-W24", label: "Tuần 24 (10/06 - 16/06)" },
    { value: "2024-W25", label: "Tuần 25 (17/06 - 23/06)" },
    { value: "2024-W26", label: "Tuần 26 (24/06 - 30/06)" },
  ];

  const days = [
    { value: "all", label: "Tất cả các ngày" },
    { value: "Thứ 2", label: "Thứ 2" },
    { value: "Thứ 3", label: "Thứ 3" },
    { value: "Thứ 4", label: "Thứ 4" },
    { value: "Thứ 5", label: "Thứ 5" },
    { value: "Thứ 6", label: "Thứ 6" },
    { value: "Thứ 7", label: "Thứ 7" },
    { value: "Chủ nhật", label: "Chủ nhật" },
  ];

  const shifts = [
    "Ca sáng",
    "Ca chiều",
    "Ca tối",
    "Trực đêm",
    "Ca 0",
    "Ca 4",
    "Ca 5",
  ];

  const rooms = [
    "Phòng 101",
    "Phòng 102",
    "Phòng 201",
    "Phòng 202",
    "Phòng 301",
  ];

  const doctors = [
    "BS. Nguyễn Văn A",
    "BS. Trần Thị B",
    "BS. Lê Văn C",
    "BS. Phạm Thị D",
    "BS. Hoàng Văn E",
  ];

  const specialties = [
    "Nhi khoa",
    "Tai mũi họng",
    "Khoa ngoại",
    "Khoa nội",
    "Da liễu",
  ];

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDay =
      selectedDay === "all" || schedule.dayOfWeek === selectedDay;
    return matchesDay;
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
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-64">
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
              <SelectTrigger className="w-48">
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
                  <TableHead>Năm</TableHead>
                  <TableHead>Tuần</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thứ</TableHead>
                  <TableHead>Khu</TableHead>
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
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.year}</TableCell>
                    <TableCell>{schedule.week}</TableCell>
                    <TableCell>{schedule.date}</TableCell>
                    <TableCell>{schedule.dayOfWeek}</TableCell>
                    <TableCell>{schedule.area}</TableCell>
                    <TableCell>
                      <Select defaultValue={schedule.room}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room} value={room}>
                              {room}
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
                      <Select defaultValue={schedule.specialty}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{schedule.department}</TableCell>
                    <TableCell>
                      <Select defaultValue={schedule.doctor}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor} value={doctor}>
                              {doctor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={() => handleToggleActive(schedule.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
