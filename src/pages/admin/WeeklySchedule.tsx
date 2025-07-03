import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
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

const WeeklySchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState("2025-W25");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [scheduleChanges, setScheduleChanges] = useState<Record<string, any>>(
    {}
  );
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [showRoomClassificationDialog, setShowRoomClassificationDialog] =
    useState(false);

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
    { id: "none", name: "Không có", classification: "normal" },
    { id: "303", name: "Phòng 303", classification: "normal" },
    { id: "307", name: "Phòng 307", classification: "normal" },
    { id: "313", name: "Phòng 313", classification: "priority" },
    { id: "315", name: "Phòng 315", classification: "normal" },
    { id: "316", name: "Phòng 316", classification: "normal" },
    { id: "404", name: "Phòng 404 (Đặc biệt)", classification: "special" },
    { id: "405", name: "Phòng 405 (Đặc biệt)", classification: "special" },
    { id: "420", name: "Phòng 420", classification: "urgent" },
    { id: "421", name: "Phòng 421 (11h-13h)", classification: "special" },
    { id: "422", name: "Phòng 422 (11h-13h)", classification: "special" },
    { id: "437", name: "Phòng 437", classification: "normal" },
    { id: "438", name: "Phòng 438", classification: "priority" },
    { id: "439", name: "Phòng 439", classification: "priority" },
    { id: "440", name: "Phòng 440", classification: "priority" },
    { id: "441", name: "Phòng 441", classification: "priority" },
    { id: "443", name: "Phòng 443", classification: "priority" },
    { id: "444", name: "Phòng 444", classification: "urgent" },
    { id: "446", name: "Phòng 446", classification: "normal" },
  ];

  // Mock data dựa theo hình ảnh tham khảo
  const departments = [
    { id: "all", name: "Tất cả khoa phòng" },
    { id: "OTBN", name: "OTBN" },
    { id: "cap-cuu", name: "Cấp cứu" },
    { id: "dinh-duong", name: "Dinh dưỡng" },
    { id: "noi-tong-hop", name: "Nội tổng hợp" },
    { id: "noi-1", name: "Nội 1" },
    { id: "noi-3", name: "Nội 3" },
    { id: "skte", name: "SKTE" },
    { id: "hs-nhiem", name: "Hs Nhiễm" },
    { id: "hs-chong-doc", name: "Hs chống độc" },
    { id: "pttmln", name: "PTTMLN" },
    { id: "ho-hap", name: "Hô hấp 1" },
    { id: "suyen", name: "Suyền" },
    { id: "nhiem", name: "Nhiễm" },
    { id: "hs-so-sinh", name: "Hs sơ sinh" },
    { id: "so-sinh", name: "Sơ sinh" },
    { id: "tieu-hoa", name: "Tiêu hóa" },
    { id: "tim-mach", name: "Tim mạch" },
    { id: "than-kinh", name: "Thần kinh" },
    { id: "than-noi-tiet", name: "Thận-Nội tiết" },
    { id: "ubhh", name: "UBHH" },
    { id: "gan-mat-tuy", name: "Gan Mật Tuy" },
    { id: "ngoai", name: "Ngoại" },
    { id: "ngoai-th", name: "Ngoại TH" },
    { id: "ngoai-ch", name: "Ngoại CH" },
    { id: "ngoai-tk", name: "Ngoại TK" },
    { id: "ngoai-nieu", name: "Ngoại niều" },
    { id: "rhm", name: "RHM" },
    { id: "mat", name: "Mắt" },
    { id: "tmh", name: "TMH" },
  ];

  const timeSlots = [
    { id: "mon-morning", day: "Thứ Hai", period: "sáng", date: "16/06/2025" },
    {
      id: "mon-afternoon",
      day: "Thứ Hai",
      period: "chiều",
      date: "16/06/2025",
    },
    { id: "tue-morning", day: "Thứ Ba", period: "sáng", date: "17/06/2025" },
    { id: "tue-afternoon", day: "Thứ Ba", period: "chiều", date: "17/06/2025" },
    { id: "wed-morning", day: "Thứ Tư", period: "sáng", date: "18/06/2025" },
    { id: "wed-afternoon", day: "Thứ Tư", period: "chiều", date: "18/06/2025" },
    { id: "thu-morning", day: "Thứ Năm", period: "sáng", date: "19/06/2025" },
    {
      id: "thu-afternoon",
      day: "Thứ Năm",
      period: "chiều",
      date: "19/06/2025",
    },
    { id: "fri-morning", day: "Thứ Sáu", period: "sáng", date: "20/06/2025" },
    {
      id: "fri-afternoon",
      day: "Thứ Sáu",
      period: "chiều",
      date: "20/06/2025",
    },
  ];

  // Mock schedule data với màu sắc phân biệt
  const [scheduleData, setScheduleData] = useState({
    OTBN: {
      "mon-morning": { room: "307", type: "normal" },
      "tue-morning": { room: "307", type: "normal" },
      "wed-morning": { room: "439", type: "priority" },
      "thu-morning": { room: "307", type: "normal" },
      "fri-morning": { room: "307", type: "normal" },
      "fri-afternoon": { room: "405", type: "special" },
    },
    "cap-cuu": {
      "mon-morning": { room: "420", type: "urgent" },
      "tue-morning": { room: "420", type: "urgent" },
      "wed-morning": { room: "420", type: "urgent" },
      "thu-morning": { room: "420", type: "urgent" },
      "fri-morning": { room: "420", type: "urgent" },
      "mon-afternoon": { room: "422", type: "special" },
      "tue-afternoon": { room: "444", type: "urgent" },
      "wed-afternoon": { room: "440", type: "priority" },
      "fri-afternoon": { room: "440", type: "priority" },
    },
    "dinh-duong": {
      "mon-morning": { room: "446", type: "normal" },
      "tue-morning": { room: "446", type: "normal" },
      "wed-morning": { room: "446", type: "normal" },
      "thu-morning": { room: "446", type: "normal" },
      "fri-morning": { room: "446", type: "normal" },
      "fri-afternoon": { room: "422", type: "special" },
    },
    "noi-tong-hop": {
      "tue-afternoon": { room: "444", type: "urgent" },
      "wed-afternoon": { room: "316", type: "normal" },
    },
    "noi-1": {
      "wed-afternoon": { room: "443", type: "priority" },
    },
    "noi-3": {
      "fri-afternoon": { room: "440", type: "priority" },
      "fri-morning": { room: "437", type: "normal" },
    },
    skte: {
      "mon-morning": { room: "437", type: "normal" },
    },
    "hs-nhiem": {
      "mon-morning": { room: "315", type: "normal" },
      "tue-morning": { room: "315", type: "normal" },
      "wed-morning": { room: "303", type: "normal" },
      "thu-morning": { room: "315", type: "normal" },
      "fri-morning": { room: "315", type: "normal" },
    },
    "hs-chong-doc": {
      "mon-morning": { room: "443", type: "priority" },
      "tue-morning": { room: "439", type: "priority" },
      "wed-morning": { room: "438", type: "priority" },
      "thu-morning": { room: "405", type: "special" },
      "fri-morning": { room: "439", type: "priority" },
      "fri-afternoon": { room: "438", type: "priority" },
    },
    pttmln: {
      "mon-morning": { room: "313", type: "priority" },
      "tue-morning": { room: "313", type: "priority" },
      "wed-morning": { room: "313", type: "priority" },
      "thu-morning": { room: "313", type: "priority" },
      "fri-morning": { room: "313", type: "priority" },
    },
    "ho-hap": {
      "tue-afternoon": { room: "440", type: "priority" },
      "wed-afternoon": { room: "441", type: "priority" },
      "thu-afternoon": { room: "441", type: "priority" },
      "tue-morning": { room: "421", type: "special" },
      "wed-morning": { room: "437", type: "normal" },
    },
  });

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

  const handleCellEdit = (
    deptId: string,
    slotId: string,
    newRoom: string,
    newType?: string
  ) => {
    const cellKey = `${deptId}-${slotId}`;

    // Auto-determine type based on room if not provided
    const roomInfo = availableRooms.find((r) => r.id === newRoom);
    const finalType = newType || roomInfo?.classification || "normal";

    // Save current state for undo
    setUndoStack((prev) => [...prev, { ...scheduleData }]);
    setRedoStack([]);

    // Update schedule - handle "none" as removal
    if (newRoom === "none") {
      setScheduleData((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          [slotId]: undefined,
        },
      }));
      // Track changes
      setScheduleChanges((prev) => ({
        ...prev,
        [cellKey]: { room: "", type: "normal" },
      }));
    } else {
      // Update schedule
      setScheduleData((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          [slotId]: { room: newRoom, type: finalType },
        },
      }));
      // Track changes
      setScheduleChanges((prev) => ({
        ...prev,
        [cellKey]: { room: newRoom, type: finalType },
      }));
    }

    setEditingCell(null);
    toast.success("Đã cập nhật lịch khám");
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

  const filteredDepartments =
    selectedDepartment === "all"
      ? departments.filter((d) => d.id !== "all")
      : departments.filter((d) => d.id === selectedDepartment);

  const searchFilteredDepartments = searchTerm
    ? filteredDepartments.filter((dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredDepartments;

  const handlePreviousWeek = () => {
    const currentWeek = parseInt(selectedWeek.split("-W")[1]);
    const newWeek = currentWeek - 1;
    setSelectedWeek(`2025-W${newWeek.toString().padStart(2, "0")}`);
  };

  const handleNextWeek = () => {
    const currentWeek = parseInt(selectedWeek.split("-W")[1]);
    const newWeek = currentWeek + 1;
    setSelectedWeek(`2025-W${newWeek.toString().padStart(2, "0")}`);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col space-y-6 animate-fade-in">
          <div className="">
            <h1 className="text-2xl font-bold">Lịch phân ban khoa khám bệnh</h1>
            <p className="text-blue-500 mt-2">
              Quản lý lịch khám bệnh theo tuần - Tuần{" "}
              {selectedWeek.split("-W")[1]} năm 2025
            </p>
            <p className="text-sm text-blue-700 font-medium mt-1">
              Từ ngày 16/6 đến ngày 20/6
            </p>
          </div>

          {/* Controls */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
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
                        {Array.from({ length: 10 }, (_, i) => {
                          const week = 25 + i;
                          return (
                            <SelectItem key={week} value={`2025-W${week}`}>
                              Tuần {week}
                            </SelectItem>
                          );
                        })}
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

                  {/* Department Filter */}
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-48 h-9">
                      <SelectValue placeholder="Chọn khoa phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
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
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Excel
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
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-w-full">
              <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                  {/* Header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700 bg-blue-100 sticky left-0 z-20 min-w-[140px] shadow-lg">
                        KHOA PHÒNG
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className="border border-gray-300 p-3 text-center font-medium text-gray-700 min-w-[100px] bg-gradient-to-b from-blue-50 to-blue-100"
                        >
                          <div className="text-sm font-semibold text-blue-800">
                            {slot.day}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {slot.date}
                          </div>
                          <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mt-1">
                            {slot.period}
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
                        <td className="border border-gray-300 p-3 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10 shadow-md">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            {dept.name}
                          </div>
                        </td>
                        {timeSlots.map((slot) => {
                          const roomData = scheduleData[dept.id]?.[slot.id];
                          const cellKey = `${dept.id}-${slot.id}`;
                          const isEditing = editingCell === cellKey;
                          const hasChanges = scheduleChanges[cellKey];
                          const specialNote = roomData
                            ? getSpecialNotes(roomData.room)
                            : null;

                          return (
                            <td
                              key={slot.id}
                              className="border border-gray-300 p-2 text-center relative"
                            >
                              {isEditing ? (
                                <Select
                                  value={roomData?.room || "none"}
                                  onValueChange={(value) => {
                                    handleCellEdit(dept.id, slot.id, value);
                                  }}
                                >
                                  <SelectTrigger className="w-full h-8 text-sm">
                                    <SelectValue placeholder="Chọn phòng" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableRooms.map((room) => (
                                      <SelectItem key={room.id} value={room.id}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-3 h-3 rounded ${
                                              roomClassifications[
                                                room.classification as keyof typeof roomClassifications
                                              ]?.color.split(" ")[0] ||
                                              "bg-gray-200"
                                            }`}
                                          ></div>
                                          {room.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="min-h-[32px] flex items-center justify-center">
                                  {roomData && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium border cursor-pointer transition-all duration-200 ${getRoomStyle(
                                            roomData.type
                                          )} ${
                                            hasChanges
                                              ? "ring-2 ring-blue-500"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setEditingCell(cellKey)
                                          }
                                        >
                                          {roomData.room}
                                          {specialNote && (
                                            <Info className="w-3 h-3" />
                                          )}
                                          {hasChanges && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-sm">
                                          <div className="font-medium">
                                            Phòng {roomData.room}
                                          </div>
                                          <div className="text-blue-600">
                                            Loại:{" "}
                                            {roomClassifications[
                                              roomData.type as keyof typeof roomClassifications
                                            ]?.name || roomData.type}
                                          </div>
                                          {specialNote && (
                                            <div className="text-yellow-600">
                                              {specialNote}
                                            </div>
                                          )}
                                          <div className="text-gray-500 mt-1">
                                            Click để chỉnh sửa
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {!roomData && (
                                    <div
                                      className="w-full h-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 cursor-pointer flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                                      onClick={() => setEditingCell(cellKey)}
                                    >
                                      <span className="text-xs">Thêm</span>
                                    </div>
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
                    • <strong>Phòng 404, 405:</strong> Sao đỏ thường - Khám
                    phòng đặc biệt
                  </div>
                  <div>
                    • <strong>Phòng 421, 422:</strong> Khám 11h-13h (trưa)
                  </div>
                  <div>
                    • <strong>Click vào ô:</strong> Chỉnh sửa nhanh phòng khám
                  </div>
                  <div>
                    • <strong>Dấu chấm xanh:</strong> Có thay đổi chưa lưu
                  </div>
                  <div>
                    • <strong>Màu sắc tự động:</strong> Được gán theo loại phòng
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
                {Object.keys(scheduleData).length}
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
                    Object.values(dept).filter((slot) => slot != null).length,
                  0
                )}
              </div>
              <p className="text-sm text-gray-600">Tổng ca khám trong tuần</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(scheduleData).reduce(
                  (total, dept) =>
                    total +
                    Object.values(dept).filter(
                      (slot) => slot != null && slot.type === "priority"
                    ).length,
                  0
                )}
              </div>
              <p className="text-sm text-gray-600">Ca khám ưu tiên</p>
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
      </div>
    </TooltipProvider>
  );
};

export default WeeklySchedule;
