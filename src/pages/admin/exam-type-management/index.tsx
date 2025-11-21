import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamTypeFilters } from "./components/ExamTypeFilters";
import { ExamTypeStats } from "./components/ExamTypeStats";
import { ExamTypeTable } from "./components/ExamTypeTable";
import { ExamTypeForm } from "./components/ExamTypeForm";
import { DepartmentsModal } from "./components/DepartmentsModal";
import { ServicePriceModal } from "./components/ServicePriceModal";
import { useExamTypeManagement } from "./hooks/useExamTypeManagement";

const ExamTypeManagement = () => {
  const {
    examTypes,
    zones,
    filteredExamTypes,
    paginatedExamTypes,
    loading,
    zonesLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    zoneFilter,
    setZoneFilter,
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
    handleToggleStatus,
    handleToggleSelectDoctor, // ✅ Add handleToggleSelectDoctor
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
            onViewServicePrices={handleViewServicePrices}
            onToggleSelectDoctor={handleToggleSelectDoctor} // ✅ Pass handleToggleSelectDoctor
            zoneDataLoading={zoneDataLoading}
            loading={loading || zonesLoading}
            filteredCount={filteredExamTypes.length}
            onToggleStatus={handleToggleStatus} // ✅ Add this new prop
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

      <ServicePriceModal
        open={showServicePriceModal}
        onOpenChange={setShowServicePriceModal}
        selectedExamType={selectedExamTypeForServicePrice} // ✅ Pass single exam type, not array
      />
    </div>
  );
};

export default ExamTypeManagement;
