import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

const RoomManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Mock room data
  const rooms = [
    {
      id: 1,
      number: "101",
      name: "Phòng khám Nhi 1",
      department: "Khoa Nhi",
      area: "Khu A",
      capacity: 30,
      workingHours: "8:00 - 17:00",
      status: "Hoạt động",
      equipment: ["Máy đo nhiệt độ", "Cân điện tử", "Máy đo huyết áp"],
      assignedDoctors: ["BS. Nguyễn Văn A", "BS. Trần Thị B"],
    },
    {
      id: 2,
      number: "102",
      name: "Phòng khám TMH 1",
      department: "Tai Mũi Họng",
      area: "Khu A",
      capacity: 25,
      workingHours: "8:00 - 16:30",
      status: "Hoạt động",
      equipment: ["Máy nội soi TMH", "Máy đo thính lực"],
      assignedDoctors: ["BS. Lê Văn C"],
    },
    {
      id: 3,
      number: "201",
      name: "Phòng khám Nội 1",
      department: "Khoa Nội",
      area: "Khu B",
      capacity: 35,
      workingHours: "7:30 - 17:30",
      status: "Hoạt động",
      equipment: ["Máy ECG", "Máy siêu âm", "Máy đo đường huyết"],
      assignedDoctors: ["BS. Phạm Thị D", "BS. Hoàng Văn E"],
    },
    {
      id: 4,
      number: "105",
      name: "Phòng khám Da liễu",
      department: "Da Liễu",
      area: "Khu A",
      capacity: 20,
      workingHours: "9:00 - 16:00",
      status: "Bảo trì",
      equipment: ["Đèn UV", "Kính lúp chuyên dụng"],
      assignedDoctors: [],
    },
  ];

  const departments = [
    "Khoa Nhi",
    "Tai Mũi Họng",
    "Khoa Nội",
    "Da Liễu",
    "Khoa Ngoại",
  ];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.number.includes(searchTerm);
    const matchesDepartment =
      departmentFilter === "all" || room.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const RoomForm = ({
    isEdit = false,
    room = null,
  }: {
    isEdit?: boolean;
    room?: any;
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="number">Số phòng</Label>
          <Input
            id="number"
            defaultValue={room?.number}
            placeholder="Nhập số phòng"
          />
        </div>
        <div>
          <Label htmlFor="name">Tên phòng</Label>
          <Input
            id="name"
            defaultValue={room?.name}
            placeholder="Nhập tên phòng"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Khoa phụ trách</Label>
          <Select defaultValue={room?.department}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khoa" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="area">Khu vực</Label>
          <Select defaultValue={room?.area}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Khu A">Khu A</SelectItem>
              <SelectItem value="Khu B">Khu B</SelectItem>
              <SelectItem value="Khu C">Khu C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Sức chứa tối đa</Label>
          <Input
            id="capacity"
            type="number"
            defaultValue={room?.capacity}
            placeholder="Số bệnh nhân/ngày"
          />
        </div>
        <div>
          <Label htmlFor="workingHours">Khung giờ làm việc</Label>
          <Input
            id="workingHours"
            defaultValue={room?.workingHours}
            placeholder="VD: 8:00 - 17:00"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">Trạng thái</Label>
        <Select defaultValue={room?.status || "Hoạt động"}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hoạt động">Hoạt động</SelectItem>
            <SelectItem value="Bảo trì">Bảo trì</SelectItem>
            <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline">Hủy</Button>
        <Button
          onClick={() =>
            toast.success(
              isEdit ? "Đã cập nhật phòng khám" : "Đã tạo phòng khám mới"
            )
          }
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoạt động":
        return "bg-emerald-100 text-emerald-800";
      case "Bảo trì":
        return "bg-yellow-100 text-yellow-800";
      case "Tạm dừng":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý phòng khám
          </h1>
          <p className="text-gray-600">Quản lý phòng khám và thiết bị y tế</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm phòng khám
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo phòng khám mới</DialogTitle>
            </DialogHeader>
            <RoomForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {rooms.length}
                </div>
                <p className="text-sm text-gray-600">Tổng phòng khám</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {rooms.filter((r) => r.status === "Hoạt động").length}
            </div>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {rooms.filter((r) => r.status === "Bảo trì").length}
            </div>
            <p className="text-sm text-gray-600">Đang bảo trì</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                rooms.reduce((sum, r) => sum + r.capacity, 0) / rooms.length
              )}
            </div>
            <p className="text-sm text-gray-600">Sức chứa TB/phòng</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo số phòng hoặc tên phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khoa</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng khám ({filteredRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số phòng</TableHead>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Khoa phụ trách</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Giờ làm việc</TableHead>
                <TableHead>Bác sĩ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{room.area}</Badge>
                  </TableCell>
                  <TableCell>{room.capacity} BN/ngày</TableCell>
                  <TableCell className="text-sm">{room.workingHours}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {room.assignedDoctors.length > 0
                        ? `${room.assignedDoctors.length} bác sĩ`
                        : "Chưa phân công"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Chỉnh sửa phòng khám</DialogTitle>
                          </DialogHeader>
                          <RoomForm isEdit={true} room={room} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.success(`Đã xóa phòng ${room.number}`)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManagement;
