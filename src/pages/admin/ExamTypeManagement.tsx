import React, { useState, useEffect, useMemo } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  MapPin,
  Building2,
  Users,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchExamTypes,
  createExamType,
  fetchDepartmentsByZone,
  updateExamType,
  clearError,
  type ExamType,
} from "@/store/slices/examTypeSlice";
import { fetchZones } from "@/store/slices/zoneSlice";
import * as ExamTypeService from "@/services/ExamTypeService";

const PAGE_SIZE = 10;

// ✅ Interface khớp với API payload mới
interface ExamTypeWithZone extends ExamType {
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
  zoneName?: string;
}

// ✅ API payload interface cho create/update
interface ExamTypePayload {
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  appointmentFormId: number;
}

const ExamTypeManagement = () => {
  const dispatch = useAppDispatch();

  // ✅ Redux selectors
  const {
    list: examTypes = [],
    loading = false,
    error = null,
    departmentsByZone = {},
    zoneDataLoading = {},
    zoneDataErrors = {},
  } = useAppSelector((state) => state.examType);

  const { list: zones = [], loading: zonesLoading = false } = useAppSelector(
    (state) => state.zone
  );

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedExamType, setSelectedExamType] =
    useState<ExamTypeWithZone | null>(null);

  // ✅ New state for departments modal
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [selectedZoneForDepartments, setSelectedZoneForDepartments] = useState<{
    id: number;
    name: string;
    zoneName: string;
  } | null>(null);

  // ✅ Form data với appointmentFormId mặc định là 1
  const [formData, setFormData] = useState<Partial<ExamTypeWithZone>>({
    name: "",
    code: "",
    description: "",
    enable: true,
    zoneId: undefined,
    zoneName: "",
    appointmentFormId: 1, // ✅ Mặc định là 1
    appointmentFormKey: "",
    appointmentFormName: "",
  });

  // Load data
  useEffect(() => {
    dispatch(fetchExamTypes(false));
    dispatch(fetchZones());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ✅ Transform API data to UI format với safe checks
  const examTypesWithZoneNames = useMemo(() => {
    if (!Array.isArray(examTypes)) return [];

    return examTypes.map((examType): ExamTypeWithZone => {
      // Tìm zone tương ứng
      const zone = zones?.find((z) => z.id === examType.zoneId);

      return {
        ...examType,
        appointmentFormId: 1, // ✅ Mặc định luôn là 1
        appointmentFormKey: examType.code || "",
        appointmentFormName: "Bác sĩ", // ✅ Mặc định form name
        zoneName: zone?.name || "N/A",
      };
    });
  }, [examTypes, zones]);

  // ✅ Filtered data logic
  const filteredExamTypes = useMemo(() => {
    if (!Array.isArray(examTypesWithZoneNames)) return [];

    return examTypesWithZoneNames.filter((examType) => {
      const matchesSearch =
        examType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        examType?.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && examType.enable) ||
        (statusFilter === "inactive" && !examType.enable);

      const matchesZone =
        zoneFilter === "all" || examType.zoneId?.toString() === zoneFilter;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [examTypesWithZoneNames, searchTerm, statusFilter, zoneFilter]);

  const totalPages = Math.ceil(filteredExamTypes.length / PAGE_SIZE);
  const paginatedExamTypes = filteredExamTypes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, zoneFilter]);

  // ✅ Handle view departments
  const handleViewDepartments = async (examType: ExamTypeWithZone) => {
    try {
      setSelectedZoneForDepartments({
        id: examType.id,
        name: examType.name,
        zoneName: examType.zoneName || "N/A",
      });

      console.log(`🏥 Fetching departments for zone ${examType.zoneId}...`);

      // ✅ Gọi API với zoneId từ examType
      await dispatch(fetchDepartmentsByZone(examType.id)).unwrap();

      setShowDepartmentsModal(true);
    } catch (error: any) {
      console.error("❌ Error fetching departments:", error);
      toast.error(
        `Lỗi khi tải danh sách khoa phòng: ${error?.message || "Unknown error"}`
      );
    }
  };

  // ✅ Get departments for selected zone
  const selectedZoneDepartments = useMemo(() => {
    if (!selectedZoneForDepartments) return [];

    const examType = examTypes.find(
      (et) => et.id === selectedZoneForDepartments.id
    );
    if (!examType) return [];

    const departments = departmentsByZone[examType.zoneId] || [];

    console.log(`📊 Departments for zone ${examType.zoneId}:`, departments);

    return departments;
  }, [selectedZoneForDepartments, departmentsByZone, examTypes]);

  // Handlers
  const handleCreateClick = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      enable: true,
      zoneId: undefined,
      zoneName: "",
      appointmentFormId: 1, // ✅ Mặc định là 1
      appointmentFormKey: "",
      appointmentFormName: "",
    });
    setShowCreateDialog(true);
  };

  const handleEditClick = (examType: ExamTypeWithZone) => {
    setFormData({
      ...examType,
      appointmentFormId: 1, // ✅ Luôn set về 1
    });
    setSelectedExamType(examType);
    setShowEditDialog(true);
  };

  // ✅ Zone change handler
  const handleZoneChange = (value: string) => {
    const selectedZone = zones.find((z) => z.id === parseInt(value));
    setFormData((prev) => ({
      ...prev,
      zoneId: parseInt(value),
      zoneName: selectedZone?.name || "",
    }));
  };

  // ✅ Transform UI data to API format theo structure mới
  const transformToApiFormat = (
    data: Partial<ExamTypeWithZone>
  ): ExamTypePayload => {
    return {
      id: data.id || 0, // ✅ Tạo mới thì id = 0
      zoneId: data.zoneId || 0,
      zoneName: data.zoneName || "",
      name: data.name || "",
      description: data.description || "",
      enable: data.enable ?? true,
      appointmentFormId: 1, // ✅ Luôn là 1
    };
  };

  // ✅ Save handlers với validation mới
  const handleSaveCreate = async () => {
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên khu khám!");
      return;
    }

    if (!formData.zoneId) {
      toast.error("Vui lòng chọn khu vực!");
      return;
    }

    try {
      const apiData = transformToApiFormat(formData);
      console.log("🚀 Creating exam type with payload:", apiData);

      await dispatch(createExamType(apiData as any)).unwrap();
      toast.success("Tạo khu khám thành công!");
      setShowCreateDialog(false);

      // ✅ Refresh data after create
      dispatch(fetchExamTypes(false));
    } catch (error: any) {
      console.error("❌ Create exam type error:", error);
      toast.error(error?.message || "Lỗi khi tạo khu khám!");
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên khu khám!");
      return;
    }

    if (!formData.zoneId) {
      toast.error("Vui lòng chọn khu vực!");
      return;
    }

    if (!formData.id) {
      toast.error("Không tìm thấy ID khu khám!");
      return;
    }

    try {
      const apiData = transformToApiFormat(formData);
      console.log("🔄 Updating exam type with payload:", apiData);

      await dispatch(updateExamType(apiData as any)).unwrap();
      toast.success("Cập nhật khu khám thành công!");
      setShowEditDialog(false);

      // ✅ Refresh data after update
      dispatch(fetchExamTypes(false));
    } catch (error: any) {
      console.error("❌ Update exam type error:", error);
      toast.error(error?.message || "Lỗi khi cập nhật khu khám!");
    }
  };

  const handleRefresh = () => {
    dispatch(fetchExamTypes(true));
    dispatch(fetchZones());
    toast.success("Đã làm mới dữ liệu!");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFormChange = (field: keyof ExamTypeWithZone, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Loại Khu Khám
          </h1>
          <p className="text-muted-foreground">
            Quản lý các khu khám theo từng khu vực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || zonesLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading || zonesLoading ? "animate-spin" : ""
              }`}
            />
          </Button>
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm Khu Khám
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={zoneFilter}
            onValueChange={(value) => setZoneFilter(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khu vực</SelectItem>
              {zones
                ?.filter((zone) => zone.enable)
                .map((zone) => (
                  <SelectItem key={zone.id} value={zone.id.toString()}>
                    {zone.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== "all" || zoneFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setZoneFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng số</p>
                  <p className="text-2xl font-bold">{examTypes?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hoạt động</p>
                  <p className="text-2xl font-bold">
                    {examTypes?.filter((e) => e.enable).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <EyeOff className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Không hoạt động
                  </p>
                  <p className="text-2xl font-bold">
                    {examTypes?.filter((e) => !e.enable).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khu vực</p>
                  <p className="text-2xl font-bold">
                    {zones?.filter((zone) => zone.enable).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên Khu Khám</TableHead>
                <TableHead>Khu Vực</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Khoa/Phòng</TableHead> {/* ✅ New column */}
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || zonesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                    <p className="mt-2">Đang tải...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedExamTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    zoneFilter !== "all"
                      ? "Không tìm thấy dữ liệu phù hợp"
                      : "Chưa có khu khám nào"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedExamTypes.map((examType, index) => (
                  <TableRow key={examType.id}>
                    <TableCell>
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {examType.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {examType.zoneName}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {examType.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={examType.enable ? "default" : "secondary"}
                      >
                        {examType.enable ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    {/* ✅ New departments column */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDepartments(examType)}
                        disabled={zoneDataLoading[examType.zoneId]}
                        className="gap-2"
                      >
                        {zoneDataLoading[examType.zoneId] ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        Xem khoa phòng
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(examType)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results info và Pagination giữ nguyên như cũ */}
        <div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
          <span>
            Hiển thị {paginatedExamTypes.length} / {filteredExamTypes.length}{" "}
            khu khám
          </span>
          {zoneFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Khu vực:{" "}
              {zones?.find((z) => z.id.toString() === zoneFilter)?.name}
            </span>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} đến{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredExamTypes.length)}{" "}
              trong tổng số {filteredExamTypes.length} bản ghi
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* ✅ Departments Modal */}
      <Dialog
        open={showDepartmentsModal}
        onOpenChange={setShowDepartmentsModal}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Danh sách Khoa/Phòng
            </DialogTitle>
            <DialogDescription>
              {selectedZoneForDepartments && (
                <>
                  Khu khám: <strong>{selectedZoneForDepartments.name}</strong> -{" "}
                  Khu vực:{" "}
                  <strong>{selectedZoneForDepartments.zoneName}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {selectedZoneForDepartments &&
            zoneDataLoading[
              examTypes.find((et) => et.id === selectedZoneForDepartments.id)
                ?.zoneId || 0
            ] ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Đang tải danh sách khoa phòng...</span>
              </div>
            ) : selectedZoneDepartments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Không có khoa phòng nào được tìm thấy</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedZoneDepartments.map((department, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-lg">
                            {department.departmentHospitalName}
                          </h3>
                          <Badge variant="outline">
                            ID: {department.departmentHospitalId}
                          </Badge>
                        </div>

                        {/* ✅ Exam Types */}
                        {department.examTypes &&
                          department.examTypes.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-sm">
                                  Loại khám ({department.examTypes.length})
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {department.examTypes.map(
                                  (examType, etIndex) => (
                                    <div
                                      key={etIndex}
                                      className="p-2 bg-gray-50 rounded border-l-4 border-l-green-500"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                          {examType.name}
                                        </span>
                                        <Badge
                                          variant={
                                            examType.enable
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {examType.enable
                                            ? "Hoạt động"
                                            : "Tắt"}
                                        </Badge>
                                      </div>
                                      {examType.description && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {examType.description}
                                        </p>
                                      )}

                                      {/* ✅ Specialties */}
                                      {examType.sepicalties &&
                                        examType.sepicalties.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex items-center gap-1 mb-1">
                                              <Users className="h-3 w-3 text-purple-600" />
                                              <span className="text-xs font-medium">
                                                Chuyên khoa (
                                                {examType.sepicalties.length})
                                              </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {examType.sepicalties.map(
                                                (specialty, sIndex) => (
                                                  <Badge
                                                    key={sIndex}
                                                    variant="outline"
                                                    className="text-xs px-1 py-0"
                                                  >
                                                    {specialty.name}
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {selectedZoneDepartments.length > 0 && (
                  <>
                    Tổng: {selectedZoneDepartments.length} khoa phòng -{" "}
                    {selectedZoneDepartments.reduce(
                      (sum, dept) => sum + (dept.examTypes?.length || 0),
                      0
                    )}{" "}
                    loại khám -{" "}
                    {selectedZoneDepartments.reduce(
                      (sum, dept) =>
                        sum +
                        (dept.examTypes?.reduce(
                          (examSum, et) =>
                            examSum + (et.sepicalties?.length || 0),
                          0
                        ) || 0),
                      0
                    )}{" "}
                    chuyên khoa
                  </>
                )}
              </div>
              <Button
                onClick={() => setShowDepartmentsModal(false)}
                className="ml-auto"
              >
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Create Dialog - ẩn appointment form field, thêm zone selection */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm Khu Khám Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo khu khám mới trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên khu khám *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="VD: Khám Tâm Lý"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneId">Khu vực *</Label>
                <Select
                  value={formData.zoneId?.toString() || ""}
                  onValueChange={handleZoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones
                      ?.filter((zone) => zone.enable)
                      .map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Mô tả chi tiết về khu khám này..."
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enable"
                checked={formData.enable ?? true}
                onCheckedChange={(checked) =>
                  handleFormChange("enable", checked)
                }
              />
              <Label htmlFor="enable">Kích hoạt ngay</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveCreate} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo mới"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Edit Dialog - tương tự như create */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Khu Khám</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khu khám trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên khu khám *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ""}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="VD: Khám Tâm Lý"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zoneId">Khu vực *</Label>
                <Select
                  value={formData.zoneId?.toString() || ""}
                  onValueChange={handleZoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones
                      ?.filter((zone) => zone.enable)
                      .map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Mô tả chi tiết về khu khám này..."
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-enable"
                checked={formData.enable ?? true}
                onCheckedChange={(checked) =>
                  handleFormChange("enable", checked)
                }
              />
              <Label htmlFor="edit-enable">Trạng thái hoạt động</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamTypeManagement;
