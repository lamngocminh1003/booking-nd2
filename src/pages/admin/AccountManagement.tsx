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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AccountManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Mock data
  const accounts = [
    {
      id: 1,
      name: "Dr. Nguyễn Văn A",
      email: "drnguyenvana@hospital.com",
      role: "Bác sĩ",
      status: "Hoạt động",
      department: "Nhi khoa",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Lê Thị B",
      email: "lethib@hospital.com",
      role: "Y tá",
      status: "Hoạt động",
      department: "Khoa ngoại",
      createdAt: "2024-01-20",
    },
    {
      id: 3,
      name: "Trần Văn C",
      email: "tranvanc@hospital.com",
      role: "Tiếp nhận",
      status: "Tạm khóa",
      department: "Lễ tân",
      createdAt: "2024-02-01",
    },
  ];

  const handleCreateAccount = () => {
    toast.success("Tài khoản đã được tạo thành công!");
  };

  const handleEditAccount = (id: number) => {
    toast.success(`Đã cập nhật tài khoản ID: ${id}`);
  };

  const handleDeleteAccount = (id: number) => {
    toast.success(`Đã xóa tài khoản ID: ${id}`);
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const AccountForm = ({
    isEdit = false,
    account = null,
  }: {
    isEdit?: boolean;
    account?: any;
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            defaultValue={account?.name}
            placeholder="Nhập họ và tên"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={account?.email}
            placeholder="Nhập email"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Vai trò</Label>
          <Select defaultValue={account?.role}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bác sĩ">Bác sĩ</SelectItem>
              <SelectItem value="Y tá">Y tá</SelectItem>
              <SelectItem value="Tiếp nhận">Tiếp nhận</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Khoa phòng</Label>
          <Select defaultValue={account?.department}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khoa phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nhi khoa">Nhi khoa</SelectItem>
              <SelectItem value="Khoa ngoại">Khoa ngoại</SelectItem>
              <SelectItem value="Khoa nội">Khoa nội</SelectItem>
              <SelectItem value="Tai mũi họng">Tai mũi họng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="status">Trạng thái</Label>
        <Select defaultValue={account?.status || "Hoạt động"}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hoạt động">Hoạt động</SelectItem>
            <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline">Hủy</Button>
        <Button
          onClick={
            isEdit ? () => handleEditAccount(account?.id) : handleCreateAccount
          }
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">Quản lý tài khoản người dùng hệ thống</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
            </DialogHeader>
            <AccountForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="Bác sĩ">Bác sĩ</SelectItem>
                <SelectItem value="Y tá">Y tá</SelectItem>
                <SelectItem value="Tiếp nhận">Tiếp nhận</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Khoa phòng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{account.role}</Badge>
                  </TableCell>
                  <TableCell>{account.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        account.status === "Hoạt động"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        account.status === "Hoạt động"
                          ? "bg-emerald-100 text-emerald-800"
                          : ""
                      }
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.createdAt}</TableCell>
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
                            <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
                          </DialogHeader>
                          <AccountForm isEdit={true} account={account} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
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

export default AccountManagement;
