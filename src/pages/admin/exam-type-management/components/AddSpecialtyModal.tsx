import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  RefreshCw,
  Building2,
  Users,
  AlertCircle,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchSpecialties } from "@/store/slices/specialtySlice";
import { fetchDepartments } from "@/store/slices/departmentSlice";
import { createExamTypeSpecialty } from "@/store/slices/examTypeSlice";
import type { ExamZoneDetails } from "./types";

interface AddSpecialtyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examTypeId?: number;
  onSpecialtyAdded?: () => void;
  existingExamDetails?: ExamZoneDetails | null;
}

interface ExamTypeSpecialtyPayload {
  examTypeId: number;
  specialtyId: number;
  departmentHospitalId: number;
  enable: boolean;
}

export const AddSpecialtyModal: React.FC<AddSpecialtyModalProps> = ({
  open,
  onOpenChange,
  examTypeId,
  onSpecialtyAdded,
  existingExamDetails,
}) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const { list: specialties = [], loading: specialtiesLoading = false } =
    useAppSelector((state) => state.specialty);
  const { list: departments = [], loading: departmentsLoading = false } =
    useAppSelector((state) => state.department);
  const { specialtyLoading = false } = useAppSelector(
    (state) => state.examType
  );

  // Local state
  const [formData, setFormData] = useState<Partial<ExamTypeSpecialtyPayload>>({
    examTypeId: examTypeId || 0,
    specialtyId: undefined,
    departmentHospitalId: undefined,
    enable: true,
  });

  // Combobox states
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);

  // ✅ Get existing specialty IDs for selected department only
  const existingSpecialtyIds = useMemo(() => {
    if (
      !existingExamDetails?.departmentHospitals ||
      !formData.departmentHospitalId
    ) {
      return new Set<number>();
    }

    const selectedDept = existingExamDetails.departmentHospitals.find(
      (dept) => dept.id === formData.departmentHospitalId
    );

    const specialtyIds =
      selectedDept?.sepicalties?.map((specialty) => specialty.id) || [];
    return new Set(specialtyIds);
  }, [existingExamDetails, formData.departmentHospitalId]);

  // Filter enabled items
  const enabledSpecialties = useMemo(
    () => specialties.filter((s) => s.enable),
    [specialties]
  );
  const enabledDepartments = useMemo(
    () => departments.filter((d) => d.enable),
    [departments]
  );

  // Get selected items for display
  const selectedDepartment = enabledDepartments.find(
    (dept) => dept.id === formData.departmentHospitalId
  );
  const selectedSpecialty = enabledSpecialties.find(
    (spec) => spec.id === formData.specialtyId
  );

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchSpecialties());
      dispatch(fetchDepartments());
      setFormData({
        examTypeId: examTypeId || 0,
        specialtyId: undefined,
        departmentHospitalId: undefined,
        enable: true,
      });
      // Reset combobox states
      setDepartmentOpen(false);
      setSpecialtyOpen(false);
    }
  }, [open, examTypeId, dispatch]);

  // Update examTypeId when prop changes
  useEffect(() => {
    if (examTypeId) {
      setFormData((prev) => ({ ...prev, examTypeId }));
    }
  }, [examTypeId]);

  // ✅ Reset specialty selection when department changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, specialtyId: undefined }));
  }, [formData.departmentHospitalId]);

  const handleSave = async () => {
    if (!formData.specialtyId) {
      toast.error("Vui lòng chọn chuyên khoa!");
      return;
    }

    if (!formData.departmentHospitalId) {
      toast.error("Vui lòng chọn khoa phòng!");
      return;
    }

    // ✅ Check if specialty already exists in selected department
    if (existingSpecialtyIds.has(formData.specialtyId)) {
      toast.error("Chuyên khoa này đã tồn tại trong khoa phòng được chọn!");
      return;
    }

    try {
      const payload: ExamTypeSpecialtyPayload = {
        examTypeId: formData.examTypeId,
        specialtyId: formData.specialtyId,
        departmentHospitalId: formData.departmentHospitalId,
        enable: formData.enable ?? true,
      };

      console.log("🏥 Creating exam type specialty with payload:", payload);

      await dispatch(createExamTypeSpecialty(payload as any)).unwrap();

      toast.success("Thêm khoa phòng thành công!");
      onOpenChange(false);

      // Notify parent to refresh data
      if (onSpecialtyAdded) {
        onSpecialtyAdded();
      }
    } catch (error: any) {
      console.error("❌ Error creating exam type specialty:", error);
      toast.error(error?.message || "Lỗi khi thêm khoa phòng!");
    }
  };

  const handleFormChange = (
    field: keyof ExamTypeSpecialtyPayload,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading =
    specialtiesLoading || departmentsLoading || specialtyLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thêm Khoa/Phòng Mới
          </DialogTitle>
          <DialogDescription>
            Thêm khoa phòng và chuyên khoa cho khu khám này
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ✅ Department Search Combobox - No duplicate check */}
          <div className="space-y-2">
            <Label htmlFor="departmentHospitalId">
              Khoa phòng *
              {departmentsLoading && (
                <RefreshCw className="inline h-3 w-3 animate-spin ml-2" />
              )}
            </Label>

            <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={departmentOpen}
                  className="w-full justify-between"
                  disabled={departmentsLoading}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    {selectedDepartment ? (
                      <span>{selectedDepartment.name}</span>
                    ) : (
                      <span className="text-gray-500">
                        Tìm kiếm khoa phòng...
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Tìm kiếm khoa phòng..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {departmentsLoading
                        ? "Đang tải..."
                        : "Không tìm thấy khoa phòng nào"}
                    </CommandEmpty>
                    <CommandGroup>
                      {enabledDepartments.map((department) => {
                        const isSelected =
                          formData.departmentHospitalId === department.id;

                        return (
                          <CommandItem
                            key={department.id}
                            value={`${department.name} ${department.id}`}
                            onSelect={() => {
                              handleFormChange(
                                "departmentHospitalId",
                                department.id
                              );
                              setDepartmentOpen(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Building2 className="h-4 w-4" />
                            <div className="flex-1 flex items-center justify-between">
                              <span>{department.name}</span>
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* ✅ Specialty Search Combobox - With duplicate check for selected department */}
          <div className="space-y-2">
            <Label htmlFor="specialtyId">
              Chuyên khoa *
              {specialtiesLoading && (
                <RefreshCw className="inline h-3 w-3 animate-spin ml-2" />
              )}
            </Label>

            <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={specialtyOpen}
                  className="w-full justify-between"
                  disabled={
                    specialtiesLoading || !formData.departmentHospitalId
                  }
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    {selectedSpecialty ? (
                      <span>{selectedSpecialty.name}</span>
                    ) : (
                      <span className="text-gray-500">
                        {!formData.departmentHospitalId
                          ? "Chọn khoa phòng trước..."
                          : "Tìm kiếm chuyên khoa..."}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Tìm kiếm chuyên khoa..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {specialtiesLoading
                        ? "Đang tải..."
                        : "Không tìm thấy chuyên khoa nào"}
                    </CommandEmpty>
                    <CommandGroup>
                      {enabledSpecialties.map((specialty) => {
                        const isSelected =
                          formData.specialtyId === specialty.id;
                        const isExisting = existingSpecialtyIds.has(
                          specialty.id
                        );

                        return (
                          <CommandItem
                            key={specialty.id}
                            value={`${specialty.name} ${specialty.id}`}
                            onSelect={() => {
                              if (!isExisting) {
                                handleFormChange("specialtyId", specialty.id);
                                setSpecialtyOpen(false);
                              }
                            }}
                            disabled={isExisting}
                            className={cn(
                              "flex items-center gap-2",
                              isExisting && "text-gray-400 bg-gray-50"
                            )}
                          >
                            <Users className="h-4 w-4" />
                            <div className="flex-1 flex items-center justify-between">
                              <span>{specialty.name}</span>
                              <div className="flex items-center gap-2">
                                {isExisting && (
                                  <span className="text-xs text-orange-600">
                                    Đã có
                                  </span>
                                )}
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </div>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* ✅ Info about existing specialties in selected department */}
            {formData.departmentHospitalId && existingSpecialtyIds.size > 0 && (
              <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-l-yellow-500">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>
                    Khoa phòng "{selectedDepartment?.name}" đã có{" "}
                    {existingSpecialtyIds.size} chuyên khoa
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enable Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="enable"
              checked={formData.enable ?? true}
              onCheckedChange={(checked) => handleFormChange("enable", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="enable">Kích hoạt ngay</Label>
          </div>

          {/* ✅ Enhanced Summary Info */}
          {selectedDepartment && selectedSpecialty && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-sm">
                <div className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Sẽ thêm:
                </div>
                <div className="space-y-1">
                  <div className="text-green-700 flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    <span className="font-medium">Khoa phòng:</span>
                    <span>{selectedDepartment.name}</span>
                  </div>
                  <div className="text-green-700 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">Chuyên khoa:</span>
                    <span>{selectedSpecialty.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Search Stats */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Building2 className="h-3 w-3" />
              <span>{enabledDepartments.length} khoa phòng có sẵn</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <Users className="h-3 w-3" />
              <span>
                {formData.departmentHospitalId
                  ? `${enabledSpecialties.length - existingSpecialtyIds.size}/${
                      enabledSpecialties.length
                    } chuyên khoa khả dụng`
                  : `${enabledSpecialties.length} chuyên khoa có sẵn`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>Tìm kiếm để chọn nhanh</span>
              </div>
              {formData.departmentHospitalId &&
                existingSpecialtyIds.size > 0 && (
                  <span className="text-orange-600">
                    • {existingSpecialtyIds.size} chuyên khoa đã có
                  </span>
                )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isLoading ||
                  !formData.specialtyId ||
                  !formData.departmentHospitalId ||
                  existingSpecialtyIds.has(formData.specialtyId || 0) // ✅ Disable if specialty exists in selected department
                }
              >
                {specialtyLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Đang thêm...
                  </>
                ) : (
                  "Thêm mới"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
