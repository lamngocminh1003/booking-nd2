import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchExamTypes,
  createExamType,
  updateExamType,
  fetchExamsByZone, // ✅ Thay đổi import
  clearError,
} from "@/store/slices/examTypeSlice";
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
    examsByZone = {}, // ✅ Thay đổi từ departmentsByZone
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [selectedZoneForDepartments, setSelectedZoneForDepartments] = useState<{
    id: number;
    name: string;
    zoneName: string;
  } | null>(null);

  const [formData, setFormData] = useState<Partial<ExamTypeWithZone>>({
    name: "",
    code: "",
    description: "",
    enable: true,
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
      };
    });
  }, [examTypes, zones]);

  // Filtered data
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

  // Pagination
  const totalPages = Math.ceil(filteredExamTypes.length / PAGE_SIZE);
  const paginatedExamTypes = filteredExamTypes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, zoneFilter]);

  // ✅ Get exam details for selected zone
  const selectedZoneExamData = useMemo(() => {
    if (!selectedZoneForDepartments) return null;

    return examsByZone[selectedZoneForDepartments.id] || null;
  }, [selectedZoneForDepartments, examsByZone]);

  // Handlers
  const handleCreateClick = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      enable: true,
      zoneId: undefined,
      zoneName: "",
      appointmentFormId: 1,
      appointmentFormKey: "",
      appointmentFormName: "",
    });
    setShowCreateDialog(true);
  };

  const handleEditClick = (examType: ExamTypeWithZone) => {
    setFormData({ ...examType, appointmentFormId: 1 });
    setShowEditDialog(true);
  };

  // ✅ Updated handler to use fetchExamsByZone
  const handleViewDepartments = async (examType: ExamTypeWithZone) => {
    try {
      setSelectedZoneForDepartments({
        id: examType.id,
        name: examType.name,
        zoneName: examType.zoneName || "N/A",
      });

      console.log(`🏥 Fetching exam details for examType ${examType.id}...`);
      await dispatch(fetchExamsByZone(examType.id)).unwrap();
      setShowDepartmentsModal(true);
      toast.success(`Đã tải thông tin chi tiết cho ${examType.name}`);
    } catch (error: any) {
      console.error("❌ Error fetching exam details:", error);
      toast.error(
        `Lỗi khi tải thông tin chi tiết: ${error?.message || "Unknown error"}`
      );
    }
  };

  const handleFormChange = (field: keyof ExamTypeWithZone, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleRefresh = () => {
    dispatch(fetchExamTypes(true));
    dispatch(fetchZones());
    toast.success("Đã làm mới dữ liệu!");
  };

  // ✅ Updated refresh function
  const handleRefreshDepartments = async () => {
    if (!selectedZoneForDepartments) {
      toast.error("Không tìm thấy thông tin khu khám!");
      return;
    }

    try {
      console.log(
        `🔄 Refreshing exam details for examType ${selectedZoneForDepartments.id}...`
      );
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

    // Loading states
    loading,
    zonesLoading,

    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    zoneFilter,
    setZoneFilter,

    // Pagination
    currentPage,
    totalPages,
    handlePageChange,

    // CRUD operations
    handleCreateClick,
    handleEditClick,
    handleRefresh,

    // Modals
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDepartmentsModal,
    setShowDepartmentsModal,

    // Form
    formData,
    handleFormChange,
    handleSaveCreate,
    handleSaveEdit,

    // Departments
    handleViewDepartments,
    selectedZoneForDepartments,
    selectedZoneExamData, // ✅ Thay đổi từ selectedZoneDepartments
    zoneDataLoading,

    // ✅ Updated function
    handleRefreshDepartments,
  };
};
