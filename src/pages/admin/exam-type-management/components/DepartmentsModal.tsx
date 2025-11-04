import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  RefreshCw,
  Users,
  Plus,
  Info,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AddSpecialtyModal } from "./AddSpecialtyModal";
import type { ExamZoneDetails } from "./types";
import { useAppDispatch } from "@/hooks/redux";
import {
  deleteExamTypeSpecialty,
  createExamTypeSpecialty,
} from "@/store/slices/examTypeSlice";
import { toast } from "sonner";

interface DepartmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedZone: {
    id: number;
    name: string;
    zoneName: string;
  } | null;
  examDetails: ExamZoneDetails | null;
  loading: Record<number, boolean>;
  onRefreshDepartments?: () => void;
}

// ✅ Add delete confirmation state interface
interface DeleteConfirmState {
  open: boolean;
  specialty?: {
    id: number;
    name: string;
    departmentId: number;
    departmentName: string;
  };
}

// ✅ Add local payload interface
interface ExamTypeSpecialtyPayload {
  examTypeId: number;
  specialtyId: number;
  departmentHospitalId: number;
  enable: boolean;
}

export const DepartmentsModal: React.FC<DepartmentsModalProps> = ({
  open,
  onOpenChange,
  selectedZone,
  examDetails,
  loading,
  onRefreshDepartments,
}) => {
  const dispatch = useAppDispatch();

  // ✅ State management
  const [showAddSpecialtyModal, setShowAddSpecialtyModal] = useState<{
    open: boolean;
    departmentId?: number;
  }>({
    open: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingSpecialty, setUpdatingSpecialty] = useState<number | null>(
    null
  );

  const isLoading = selectedZone && loading[selectedZone.id];

  // ✅ Event handlers
  const handleAddSpecialty = () => {
    setShowAddSpecialtyModal({ open: true });
  };

  const handleSpecialtyAdded = () => {
    if (onRefreshDepartments) {
      onRefreshDepartments();
    }
  };

  // ✅ Handle delete specialty
  const handleDeleteSpecialty = (
    specialtyId: number,
    specialtyName: string,
    departmentId: number,
    departmentName: string
  ) => {
    setDeleteConfirm({
      open: true,
      specialty: {
        id: specialtyId,
        name: specialtyName,
        departmentId,
        departmentName,
      },
    });
  };

  // ✅ Confirm delete specialty
  const confirmDeleteSpecialty = async () => {
    if (!deleteConfirm.specialty || !selectedZone) return;

    setIsDeleting(true);
    try {
      await dispatch(
        deleteExamTypeSpecialty({
          examTypeId: selectedZone.id,
          specialtyId: deleteConfirm.specialty.id,
          departmentId: deleteConfirm.specialty.departmentId,
        })
      ).unwrap();

      toast.success(
        `Đã xóa chuyên khoa "${deleteConfirm.specialty.name}" khỏi khoa phòng "${deleteConfirm.specialty.departmentName}"`
      );

      // Close dialog and refresh data
      setDeleteConfirm({ open: false });

      if (onRefreshDepartments) {
        onRefreshDepartments();
      }
    } catch (error: any) {
      console.error("❌ Error deleting specialty:", error);
      toast.error(error?.message || "Lỗi khi xóa chuyên khoa!");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Handle toggle specialty status
  const handleToggleSpecialty = async (
    specialtyId: number,
    currentStatus: boolean,
    specialtyName: string,
    departmentId: number
  ) => {
    if (!selectedZone) return;

    setUpdatingSpecialty(specialtyId);
    try {
      // ✅ Create payload object as requested
      const payload: ExamTypeSpecialtyPayload = {
        examTypeId: selectedZone.id,
        specialtyId: specialtyId,
        departmentHospitalId: departmentId,
        enable: !currentStatus,
      };

      await dispatch(createExamTypeSpecialty(payload as any)).unwrap();

      toast.success(
        `Đã ${!currentStatus ? "bật" : "tắt"} chuyên khoa "${specialtyName}"`
      );

      if (onRefreshDepartments) {
        onRefreshDepartments();
      }
    } catch (error: any) {
      console.error("❌ Error updating specialty status:", error);
      toast.error(error?.message || "Lỗi khi cập nhật trạng thái chuyên khoa!");
    } finally {
      setUpdatingSpecialty(null);
    }
  };

  // ✅ Calculate statistics from new data structure
  const stats = useMemo(() => {
    if (!examDetails?.departmentHospitals) {
      return {
        totalDepartments: 0,
        totalSpecialties: 0,
        activeDepartments: 0,
        activeSpecialties: 0,
      };
    }

    const totalDepartments = examDetails.departmentHospitals.length;
    const activeDepartments = examDetails.departmentHospitals.filter(
      (d) => d.enable
    ).length;

    const totalSpecialties = examDetails.departmentHospitals.reduce(
      (sum, dept) => sum + (dept.sepicalties?.length || 0),
      0
    );

    const activeSpecialties = examDetails.departmentHospitals.reduce(
      (sum, dept) =>
        sum + (dept.sepicalties?.filter((s) => s.enable).length || 0),
      0
    );

    return {
      totalDepartments,
      totalSpecialties,
      activeDepartments,
      activeSpecialties,
    };
  }, [examDetails]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <div>
                  <DialogTitle>Chi tiết Khu Khám</DialogTitle>
                  <DialogDescription>
                    {selectedZone && examDetails && (
                      <>
                        <div className="flex items-center gap-4 mt-2">
                          <span>
                            Khu khám: <strong>{examDetails.name}</strong>
                          </span>
                          <span>
                            Khu vực: <strong>{examDetails.zoneName}</strong>
                          </span>
                          <Badge
                            variant={
                              examDetails.enable ? "default" : "secondary"
                            }
                          >
                            {examDetails.enable
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {/* ✅ Add Specialty Button */}
              <Button
                onClick={handleAddSpecialty}
                className="gap-2"
                size="sm"
                disabled={isLoading || !selectedZone}
              >
                <Plus className="h-4 w-4" />
                Thêm Khoa/Phòng
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">
                  Đang tải dữ liệu khoa phòng...
                </p>
              </div>
            ) : !examDetails ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Info className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <h3 className="font-medium text-gray-900">
                    Không có dữ liệu
                  </h3>
                  <p className="text-sm text-gray-500">
                    Không tìm thấy thông tin khoa phòng cho khu khám này.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ✅ Statistics Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tổng khoa phòng
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.totalDepartments}
                        </p>
                        {stats.activeDepartments !== stats.totalDepartments && (
                          <p className="text-xs text-green-600">
                            {stats.activeDepartments} đang hoạt động
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tổng chuyên khoa
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.totalSpecialties}
                        </p>
                        {stats.activeSpecialties !== stats.totalSpecialties && (
                          <p className="text-xs text-green-600">
                            {stats.activeSpecialties} đang hoạt động
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ✅ Department List */}
                {stats.totalDepartments === 0 ? (
                  <Card className="p-8">
                    <div className="text-center space-y-3">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="font-medium text-gray-900">
                        Chưa có khoa phòng nào
                      </h3>
                      <p className="text-sm text-gray-500">
                        Hãy thêm khoa phòng đầu tiên cho khu khám này.
                      </p>
                      <Button
                        onClick={handleAddSpecialty}
                        className="gap-2"
                        disabled={!selectedZone}
                      >
                        <Plus className="h-4 w-4" />
                        Thêm Khoa/Phòng Đầu Tiên
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">
                        Danh sách Khoa/Phòng ({stats.totalDepartments})
                      </h3>
                    </div>

                    {examDetails.departmentHospitals.map(
                      (department, index) => (
                        <Card
                          key={index}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">
                                  {department.name}
                                </h4>
                                <Badge
                                  variant={
                                    department.enable ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {department.enable ? "Hoạt động" : "Tắt"}
                                </Badge>
                              </div>

                              {/* ✅ Specialties List - Optimized */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium text-sm">
                                    Chuyên khoa (
                                    {department.sepicalties?.length || 0})
                                  </span>
                                </div>

                                {!department.sepicalties ||
                                department.sepicalties.length === 0 ? (
                                  <div className="ml-6 p-3 bg-yellow-50 rounded border-l-2 border-l-yellow-400">
                                    <p className="text-sm text-yellow-700 flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Chưa có chuyên khoa nào
                                    </p>
                                  </div>
                                ) : (
                                  <div className="ml-6 grid grid-cols-2 gap-2">
                                    {department.sepicalties.map(
                                      (specialty, specIndex) => (
                                        <div
                                          key={specIndex}
                                          className="flex items-center justify-between p-2 bg-purple-50 rounded border-l-2 border-l-purple-400 hover:bg-purple-100 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="font-medium text-xs text-purple-800 truncate">
                                              {specialty.name}
                                            </span>

                                            {/* ✅ Compact toggle and status */}
                                            <div className="flex items-center gap-1 shrink-0">
                                              <Switch
                                                checked={specialty.enable}
                                                onCheckedChange={() =>
                                                  handleToggleSpecialty(
                                                    specialty.id,
                                                    specialty.enable,
                                                    specialty.name,
                                                    department.id
                                                  )
                                                }
                                                disabled={
                                                  updatingSpecialty ===
                                                  specialty.id
                                                }
                                                className="data-[state=checked]:bg-green-600 scale-75"
                                              />
                                              {updatingSpecialty ===
                                                specialty.id && (
                                                <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                                              )}
                                            </div>
                                          </div>

                                          {/* ✅ Compact delete button */}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 shrink-0 ml-1"
                                            onClick={() =>
                                              handleDeleteSpecialty(
                                                specialty.id,
                                                specialty.name,
                                                department.id,
                                                department.name
                                              )
                                            }
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ Add Specialty Button for this department */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2"
                              onClick={() => {
                                setShowAddSpecialtyModal({
                                  open: true,
                                  departmentId: department.id,
                                });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Thêm chuyên khoa
                            </Button>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {examDetails && (
                  <div className="flex items-center gap-6">
                    <span>
                      <strong>{stats.totalDepartments}</strong> khoa phòng
                      {stats.activeDepartments !== stats.totalDepartments && (
                        <span className="text-green-600 ml-1">
                          ({stats.activeDepartments} hoạt động)
                        </span>
                      )}
                    </span>
                    <span>
                      <strong>{stats.totalSpecialties}</strong> chuyên khoa
                      {stats.activeSpecialties !== stats.totalSpecialties && (
                        <span className="text-green-600 ml-1">
                          ({stats.activeSpecialties} hoạt động)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              <Button onClick={() => onOpenChange(false)} className="ml-auto">
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Xác nhận xóa chuyên khoa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyên khoa
              <span className="font-semibold text-red-600">
                "{deleteConfirm.specialty?.name}"
              </span>
              khỏi khoa phòng
              <span className="font-semibold">
                "{deleteConfirm.specialty?.departmentName}"
              </span>
              ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Hành động này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSpecialty}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa chuyên khoa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Add Specialty Modal */}
      <AddSpecialtyModal
        open={showAddSpecialtyModal.open}
        onOpenChange={(open) => setShowAddSpecialtyModal({ open })}
        examTypeId={selectedZone?.id}
        onSpecialtyAdded={handleSpecialtyAdded}
        existingExamDetails={examDetails}
        departmentHospitalId={showAddSpecialtyModal.departmentId}
      />
    </>
  );
};
