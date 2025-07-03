import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/store/slices/adminSlice";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Hospital,
  Search,
  Building,
  User,
  FileText,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export default function DepartmentManagement() {
  const dispatch = useDispatch();
  const { departments } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    headDoctor: "",
    status: "Active" as "active" | "inactive",
  });

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.headDoctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDepartment) {
      dispatch(updateDepartment({ ...formData, id: editingDepartment.id }));
      toast.success("Cập nhật khoa thành công!");
    } else {
      dispatch(addDepartment(formData));
      toast.success("Thêm khoa mới thành công!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (department: any) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,
      headDoctor: department.headDoctor,
      status: department.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khoa này?")) {
      dispatch(deleteDepartment(id));
      toast.success("Xóa khoa thành công!");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      headDoctor: "",
      status: "Active",
    });
    setEditingDepartment(null);
  };

  return (
    <div className="animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <CardTitle className=" flex items-center gap-2">
            Quản lý khoa/phòng khám
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm khoa mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-semibold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Hospital className="h-6 w-6" />
                    </div>
                    {editingDepartment
                      ? "Cập nhật thông tin khoa"
                      : "Thêm khoa/phòng mới"}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Tên khoa <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ví dụ: Khoa Nhi"
                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        Mã khoa <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        placeholder="Ví dụ: PEDI"
                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      Trưởng khoa <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.headDoctor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headDoctor: e.target.value,
                        })
                      }
                      placeholder="Tên bác sĩ trưởng khoa"
                      className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Mô tả
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Mô tả chi tiết về khoa"
                      rows={4}
                      className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      Trạng thái
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">
                          Ngừng hoạt động
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      {editingDepartment ? "Cập nhật khoa" : "Thêm khoa mới"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-8 h-12 border-gray-200"
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên khoa, mã khoa hoặc trưởng khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50">
                <TableHead>Mã khoa</TableHead>
                <TableHead>Tên khoa</TableHead>
                <TableHead>Trưởng khoa</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow
                  key={department.id}
                  className="hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <TableCell className="font-mono font-medium">
                    {department.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>{department.headDoctor}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {department.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        department.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {department.status === "active"
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(department)}
                        className="h-8 w-8 p-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(department.id)}
                        className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  );
}
