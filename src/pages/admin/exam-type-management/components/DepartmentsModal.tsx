import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  RefreshCw,
  Stethoscope,
  Users,
  Plus,
  Info,
} from "lucide-react";
import { AddSpecialtyModal } from "./AddSpecialtyModal";
import type { ExamZoneDetails } from "./types";

interface DepartmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedZone: {
    id: number;
    name: string;
    zoneName: string;
  } | null;
  examDetails: ExamZoneDetails | null; // ✅ Thay đổi type
  loading: Record<number, boolean>;
  onRefreshDepartments?: () => void;
}

export const DepartmentsModal: React.FC<DepartmentsModalProps> = ({
  open,
  onOpenChange,
  selectedZone,
  examDetails,
  loading,
  onRefreshDepartments,
}) => {
  const [showAddSpecialtyModal, setShowAddSpecialtyModal] = useState(false);
  const isLoading = selectedZone && loading[selectedZone.id];

  const handleAddSpecialty = () => {
    setShowAddSpecialtyModal(true);
  };

  const handleSpecialtyAdded = () => {
    // Refresh exam details after adding specialty
    if (onRefreshDepartments) {
      onRefreshDepartments();
    }
  };

  // ✅ Calculate statistics from new data structure
  const totalDepartments = examDetails?.departmentHospitals?.length || 0;
  const totalSpecialties =
    examDetails?.departmentHospitals?.reduce(
      (sum, dept) => sum + (dept.sepicalties?.length || 0),
      0
    ) || 0;
  const activeDepartments =
    examDetails?.departmentHospitals?.filter((d) => d.enable).length || 0;
  const activeSpecialties =
    examDetails?.departmentHospitals?.reduce(
      (sum, dept) =>
        sum + (dept.sepicalties?.filter((s) => s.enable).length || 0),
      0
    ) || 0;

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
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Đang tải thông tin chi tiết...</span>
              </div>
            ) : !examDetails ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Không có thông tin</h3>
                <p className="text-sm mb-4">
                  Không thể tải thông tin chi tiết cho khu khám này
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ✅ Exam Type Info Card */}

                {/* ✅ Department Hospitals */}
                {totalDepartments === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      Chưa có khoa phòng nào
                    </h3>
                    <p className="text-sm mb-4">
                      Bắt đầu bằng cách thêm khoa phòng đầu tiên cho khu khám
                      này
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
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">
                        Danh sách Khoa/Phòng ({totalDepartments})
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
                              {/* Specialties */}
                              {department.sepicalties &&
                              department.sepicalties.length > 0 ? (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-sm">
                                      Chuyên khoa (
                                      {department.sepicalties.length})
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                    {department.sepicalties.map(
                                      (specialty, sIndex) => (
                                        <div
                                          key={sIndex}
                                          className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-l-purple-500"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm text-purple-800">
                                              {specialty.name}
                                            </span>
                                          </div>

                                          <div className="flex items-center justify-between">
                                            <Badge
                                              variant={
                                                specialty.enable
                                                  ? "default"
                                                  : "secondary"
                                              }
                                              className="text-xs"
                                            >
                                              {specialty.enable
                                                ? "Hoạt động"
                                                : "Tắt"}
                                            </Badge>
                                            {specialty.listType && (
                                              <span className="text-xs text-gray-600">
                                                Type: {specialty.listType}
                                              </span>
                                            )}
                                          </div>

                                          {specialty.description && (
                                            <p className="text-xs text-gray-600 mt-2">
                                              {specialty.description}
                                            </p>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 p-4 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                                  <div className="text-center text-yellow-700">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                    <p className="text-sm">
                                      Chưa có chuyên khoa nào
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
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
                      <strong>{totalDepartments}</strong> khoa phòng
                      {activeDepartments !== totalDepartments && (
                        <span className="text-green-600 ml-1">
                          ({activeDepartments} hoạt động)
                        </span>
                      )}
                    </span>
                    <span>
                      <strong>{totalSpecialties}</strong> chuyên khoa
                      {activeSpecialties !== totalSpecialties && (
                        <span className="text-green-600 ml-1">
                          ({activeSpecialties} hoạt động)
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

      {/* ✅ Add Specialty Modal with existing exam details */}
      <AddSpecialtyModal
        open={showAddSpecialtyModal}
        onOpenChange={setShowAddSpecialtyModal}
        examTypeId={selectedZone?.id}
        onSpecialtyAdded={handleSpecialtyAdded}
        existingExamDetails={examDetails} // ✅ Pass existing exam details for department check
      />
    </>
  );
};
