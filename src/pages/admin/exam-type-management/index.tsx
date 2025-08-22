import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { ExamTypeFilters } from "./components/ExamTypeFilters";
import { ExamTypeStats } from "./components/ExamTypeStats";
import { ExamTypeTable } from "./components/ExamTypeTable";
import { ExamTypeForm } from "./components/ExamTypeForm";
import { DepartmentsModal } from "./components/DepartmentsModal";
import { useExamTypeManagement } from "./hooks/useExamTypeManagement";

const ExamTypeManagement = () => {
  const {
    // Data
    examTypes,
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
    selectedZoneExamData,
    zoneDataLoading,
    handleRefreshDepartments,
  } = useExamTypeManagement();

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

      {/* ✅ Fix: Wrap content in Card component */}
      <Card>
        <CardContent className="p-6">
          <ExamTypeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            zoneFilter={zoneFilter}
            setZoneFilter={setZoneFilter}
            zones={zones}
          />

          <ExamTypeStats examTypes={examTypes} zones={zones} />

          <ExamTypeTable
            examTypes={paginatedExamTypes}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEditClick}
            onViewDepartments={handleViewDepartments}
            zoneDataLoading={zoneDataLoading}
            loading={loading || zonesLoading}
            filteredCount={filteredExamTypes.length}
            zoneFilter={zoneFilter}
            zones={zones}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ExamTypeForm
        mode="create"
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        formData={formData}
        zones={zones}
        onFormChange={handleFormChange}
        onSave={handleSaveCreate}
        loading={loading}
      />

      <ExamTypeForm
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        formData={formData}
        zones={zones}
        onFormChange={handleFormChange}
        onSave={handleSaveEdit}
        loading={loading}
      />

      <DepartmentsModal
        open={showDepartmentsModal}
        onOpenChange={setShowDepartmentsModal}
        selectedZone={selectedZoneForDepartments}
        examDetails={selectedZoneExamData}
        loading={zoneDataLoading}
        onRefreshDepartments={handleRefreshDepartments}
      />
    </div>
  );
};

export default ExamTypeManagement;
