import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchExamTypes,
  createExamType,
  updateExamType,
  fetchExamsByZone,
  clearError,
  updateExamTypeSelectDoctor, // ✅ New import for isSelectDoctor
} from "@/store/slices/examTypeSlice";
import { fetchExamTypeServicePricesByExamTypeId } from "@/store/slices/servicePriceSlice";
import { fetchZones } from "@/store/slices/zoneSlice";
import { toast } from "sonner";
import type { ExamTypeWithZone, ExamTypePayload } from "../components/types";

const PAGE_SIZE = 10;

export const useExamTypeManagement = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const {
    list: examTypes = [],
    loading = false,
    error = null,
    examsByZone = {},
    zoneDataLoading = {},
  } = useAppSelector((state) => state.examType);

  const { list: zones = [], loading: zonesLoading = false } = useAppSelector(
    (state) => state.zone
  );

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");

  // ✅ New filter for isSelectDoctor
  const [selectDoctorFilter, setSelectDoctorFilter] = useState<
    "all" | "required" | "optional"
  >("all");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [selectedZoneForDepartments, setSelectedZoneForDepartments] = useState<{
    id: number;
    name: string;
    zoneName: string;
  } | null>(null);

  // Service Price Modal states
  const [showServicePriceModal, setShowServicePriceModal] = useState(false);
  const [selectedExamTypeForServicePrice, setSelectedExamTypeForServicePrice] =
    useState<{
      id: number;
      name: string;
      zoneName: string;
    } | null>(null);

  const [formData, setFormData] = useState<Partial<ExamTypeWithZone>>({
    name: "",
    code: "",
    description: "",
    enable: true,
    isSelectDoctor: false, // ✅ Add isSelectDoctor to form data
    zoneId: undefined,
    zoneName: "",
    appointmentFormId: 1,
    appointmentFormKey: "",
    appointmentFormName: "",
  });

  // Load initial data
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

  // Transform data
  const examTypesWithZoneNames = useMemo(() => {
    if (!Array.isArray(examTypes)) return [];

    return examTypes.map((examType): ExamTypeWithZone => {
      const zone = zones?.find((z) => z.id === examType.zoneId);
      return {
        ...examType,
        appointmentFormId: 1,
        appointmentFormKey: examType.code || "",
        appointmentFormName: "Bác sĩ",
        zoneName: zone?.name || "N/A",
        isSelectDoctor: examType.isSelectDoctor ?? false, // ✅ Ensure isSelectDoctor field
      };
    });
  }, [examTypes, zones]);

  // ✅ Enhanced filtered data with isSelectDoctor filter
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

      // ✅ New filter for isSelectDoctor
      const matchesSelectDoctor =
        selectDoctorFilter === "all" ||
        (selectDoctorFilter === "required" && examType.isSelectDoctor) ||
        (selectDoctorFilter === "optional" && !examType.isSelectDoctor);

      return (
        matchesSearch && matchesStatus && matchesZone && matchesSelectDoctor
      );
    });
  }, [
    examTypesWithZoneNames,
    searchTerm,
    statusFilter,
    zoneFilter,
    selectDoctorFilter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredExamTypes.length / PAGE_SIZE);
  const paginatedExamTypes = filteredExamTypes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, zoneFilter, selectDoctorFilter]); // ✅ Add selectDoctorFilter

  // Get exam details for selected zone
  const selectedZoneExamData = useMemo(() => {
    if (!selectedZoneForDepartments) return null;

    return examsByZone[selectedZoneForDepartments.id] || null;
  }, [selectedZoneForDepartments, examsByZone]);

  // ✅ Statistics with isSelectDoctor
  const statistics = useMemo(() => {
    const total = examTypesWithZoneNames.length;
    const active = examTypesWithZoneNames.filter((e) => e.enable).length;
    const requiresDoctor = examTypesWithZoneNames.filter(
      (e) => e.isSelectDoctor
    ).length;
    const optional = total - requiresDoctor;

    return {
      total,
      active,
      inactive: total - active,
      requiresDoctor,
      optional,
    };
  }, [examTypesWithZoneNames]);

  // Handlers
  const handleCreateClick = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      enable: true,
      isSelectDoctor: false, // ✅ Default to false
      zoneId: undefined,
      zoneName: "",
      appointmentFormId: 1,
      appointmentFormKey: "",
      appointmentFormName: "",
    });
    setShowCreateDialog(true);
  };

  const handleEditClick = (examType: ExamTypeWithZone) => {
    setFormData({
      ...examType,
      appointmentFormId: 1,
      isSelectDoctor: examType.isSelectDoctor ?? false,
    });
    setShowEditDialog(true);
  };

  // ✅ Fixed handler to toggle isSelectDoctor
  const handleToggleSelectDoctor = async (examType: ExamTypeWithZone) => {
    try {
      // ✅ Create updated data with toggled isSelectDoctor
      const updatedExamType = {
        ...examType,
        isSelectDoctor: !examType.isSelectDoctor, // Toggle the value
      };

      // ✅ Transform to API format
      const apiData = transformToApiFormat(updatedExamType);

      // ✅ Use updateExamType instead of createExamType
      await dispatch(updateExamType(apiData as any)).unwrap();

      const newValue = !examType.isSelectDoctor;
      toast.success(
        `${examType.name} ${newValue ? "yêu cầu" : "không yêu cầu"} chọn bác sĩ`
      );

      // ✅ Refresh the exam types list to reflect changes
      await dispatch(fetchExamTypes(false));

      // ✅ Also refresh zone data if we have selected zone
      if (selectedZoneForDepartments?.id) {
        await dispatch(fetchExamsByZone(selectedZoneForDepartments.id));
      }
    } catch (error: any) {
      console.error("❌ Error toggling isSelectDoctor:", error);
      toast.error(`Lỗi khi cập nhật: ${error?.message || "Unknown error"}`);
    }
  };
  const handleToggleStatus = async (examType: ExamTypeWithZone) => {
    try {
      const newValue = !examType.enable;

      // ✅ Create updated data with toggled enable status
      const updatedExamType = {
        ...examType,
        enable: newValue,
      };

      // ✅ Transform to API format
      const apiData = transformToApiFormat(updatedExamType);

      // ✅ Use updateExamType
      await dispatch(updateExamType(apiData as any)).unwrap();

      toast.success(
        `${examType.name} đã ${newValue ? "kích hoạt" : "tạm dừng"}`
      );

      // ✅ Refresh the exam types list to reflect changes
      await dispatch(fetchExamTypes(false));
    } catch (error: any) {
      console.error("❌ Error toggling status:", error);
      toast.error(
        `Lỗi khi cập nhật trạng thái: ${error?.message || "Unknown error"}`
      );
    }
  };
  // ✅ New handler to update isSelectDoctor with specific value
  const handleUpdateSelectDoctor = async (
    examTypeId: number,
    isSelectDoctor: boolean,
    zoneId: string
  ) => {
    try {
      dispatch(
        updateExamTypeSelectDoctor({
          examTypeId,
          zoneId,
          isSelectDoctor,
        })
      );

      toast.success(
        `Đã cập nhật yêu cầu chọn bác sĩ: ${
          isSelectDoctor ? "Bắt buộc" : "Tùy chọn"
        }`
      );
    } catch (error: any) {
      toast.error(`Lỗi khi cập nhật: ${error?.message || "Unknown error"}`);
    }
  };

  const handleViewDepartments = async (examType: ExamTypeWithZone) => {
    try {
      setSelectedZoneForDepartments({
        id: examType.id!,
        name: examType.name,
        zoneName: examType.zoneName || "N/A",
      });

      await dispatch(fetchExamsByZone(examType.id!)).unwrap();
      setShowDepartmentsModal(true);
      toast.success(`Đã tải thông tin chi tiết cho ${examType.name}`);
    } catch (error: any) {
      console.error("❌ Error fetching exam details:", error);
      toast.error(
        `Lỗi khi tải thông tin chi tiết: ${error?.message || "Unknown error"}`
      );
    }
  };

  const handleViewServicePrices = async (examType: ExamTypeWithZone) => {
    try {
      setSelectedExamTypeForServicePrice({
        id: examType.id!,
        name: examType.name,
        zoneName: examType.zoneName || "N/A",
      });
      await dispatch(
        fetchExamTypeServicePricesByExamTypeId(examType.id!)
      ).unwrap();

      setShowServicePriceModal(true);
    } catch (error) {
      console.error("❌ Error fetching exam details:", error);
    }
  };

  const handleFormChange = (field: keyof ExamTypeWithZone, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Enhanced transform function to include isSelectDoctor
  const transformToApiFormat = (
    data: Partial<ExamTypeWithZone>
  ): ExamTypePayload => {
    return {
      id: data.id || 0,
      zoneId: data.zoneId || 0,
      zoneName: data.zoneName || "",
      name: data.name || "",
      description: data.description || "",
      enable: data.enable ?? true,
      isSelectDoctor: data.isSelectDoctor ?? false,
      appointmentFormId: 1,
    };
  };

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
      await dispatch(createExamType(apiData as any)).unwrap();
      toast.success("Tạo khu khám thành công!");
      setShowCreateDialog(false);
      dispatch(fetchExamTypes(false));
    } catch (error: any) {
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
      await dispatch(updateExamType(apiData as any)).unwrap();
      toast.success("Cập nhật khu khám thành công!");
      setShowEditDialog(false);
      dispatch(fetchExamTypes(false));
    } catch (error: any) {
      toast.error(error?.message || "Lỗi khi cập nhật khu khám!");
    }
  };

  const handleRefreshDepartments = async () => {
    if (!selectedZoneForDepartments) {
      toast.error("Không tìm thấy thông tin khu khám!");
      return;
    }

    try {
      await dispatch(fetchExamsByZone(selectedZoneForDepartments.id)).unwrap();
      toast.success("Đã làm mới thông tin chi tiết!");
    } catch (error: any) {
      console.error("❌ Error refreshing exam details:", error);
      toast.error(`Lỗi khi làm mới: ${error?.message || "Unknown error"}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // Data
    examTypes: examTypesWithZoneNames,
    zones,
    filteredExamTypes,
    paginatedExamTypes,
    statistics,

    loading,
    zonesLoading,

    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    zoneFilter,
    setZoneFilter,
    selectDoctorFilter,
    setSelectDoctorFilter,
    currentPage,
    totalPages,
    handlePageChange,

    handleCreateClick,
    handleEditClick,

    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDepartmentsModal,
    setShowDepartmentsModal,
    showServicePriceModal,
    setShowServicePriceModal,

    formData,
    handleFormChange,
    handleSaveCreate,
    handleSaveEdit,

    handleViewDepartments,
    selectedZoneForDepartments,
    selectedZoneExamData,
    zoneDataLoading,
    handleRefreshDepartments,
    handleViewServicePrices,
    selectedExamTypeForServicePrice,
    setSelectedExamTypeForServicePrice,
    handleToggleSelectDoctor,
    handleUpdateSelectDoctor,
    handleToggleStatus,
  };
};
