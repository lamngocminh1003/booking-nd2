import React, { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  RefreshCw,
  Plus,
  Info,
  Trash2,
  AlertTriangle,
  Edit,
  X,
  Check, // ✅ Already imported
  // Save, // ✅ Add this if you want Save icon instead of Check
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchExamTypeServicePricesByExamTypeId, // ✅ NEW import
  createOrUpdateExamTypeServicePriceThunk,
  deleteExamTypeServicePriceThunk,
  fetchServicePrices,
  clearExamTypeServicePrices,
  type CreateUpdateExamTypeServicePrice,
} from "@/store/slices/servicePriceSlice";
import { toast } from "sonner";

interface ServicePriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExamType: {
    id: number;
    name: string;
    zoneName: string;
  } | null;
}

interface DeleteConfirmState {
  open: boolean;
  servicePrice?: {
    examTypeId: number;
    servicePriceId: number;
    servicePriceName: string;
  };
}

interface EditingServicePrice {
  examTypeId: number;
  servicePriceId: number;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
  enable: boolean;
}

export const ServicePriceModal: React.FC<ServicePriceModalProps> = ({
  open,
  onOpenChange,
  selectedExamType,
}) => {
  const dispatch = useAppDispatch();

  // ✅ Redux state
  const {
    examTypeServicePrices, // ✅ Now contains ServicePriceDetail[]
    examTypeServicePricesLoading,
    currentExamTypeId,
    list: allServicePrices,
    loading: servicePricesLoading,
  } = useAppSelector((state) => state.servicePrice);

  // ✅ Local state
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingService, setEditingService] =
    useState<EditingServicePrice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    servicePriceId: "",
    regularPrice: "",
    insurancePrice: "",
    vipPrice: "",
    enable: true,
  });

  // ✅ Load data when modal opens or exam type changes
  useEffect(() => {
    if (open && selectedExamType) {
      console.log(
        "🚀 Loading service prices for exam type:",
        selectedExamType.id
      );

      // ✅ Fetch service prices by examTypeId
      dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType.id));

      // ✅ Fetch all service prices for dropdown
      dispatch(fetchServicePrices());
    }

    // ✅ Clear when modal closes
    return () => {
      if (!open) {
        dispatch(clearExamTypeServicePrices());
      }
    };
  }, [open, selectedExamType, dispatch]);

  // ✅ Current service prices (directly from Redux)
  const currentExamTypeServicePrices = useMemo(() => {
    console.log("📊 Current service prices from Redux:", examTypeServicePrices);
    return examTypeServicePrices;
  }, [examTypeServicePrices]);

  // ✅ Available service prices for adding
  const availableServicePrices = useMemo(() => {
    const assignedServicePriceIds = currentExamTypeServicePrices.map(
      (sp: any) => sp.id
    );
    return allServicePrices.filter(
      (sp) => !assignedServicePriceIds.includes(sp.id)
    );
  }, [allServicePrices, currentExamTypeServicePrices]);

  // ✅ Statistics
  const stats = useMemo(() => {
    const total = currentExamTypeServicePrices.length;
    const active = currentExamTypeServicePrices.filter(
      (sp: any) => sp.enable
    ).length;

    return { total, active };
  }, [currentExamTypeServicePrices]);

  // ✅ Handle delete service price
  const handleDeleteServicePrice = (
    examTypeId: number,
    servicePriceId: number,
    servicePriceName: string
  ) => {
    setDeleteConfirm({
      open: true,
      servicePrice: {
        examTypeId,
        servicePriceId,
        servicePriceName,
      },
    });
  };

  // ✅ Confirm delete
  const confirmDeleteServicePrice = async () => {
    if (!deleteConfirm.servicePrice) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteExamTypeServicePriceThunk({
          examTypeId: deleteConfirm.servicePrice.examTypeId,
          servicePriceId: deleteConfirm.servicePrice.servicePriceId,
        })
      ).unwrap();

      // ✅ Success
      toast.success(
        `Đã xóa dịch vụ "${deleteConfirm.servicePrice.servicePriceName}" thành công!`
      );

      setDeleteConfirm({ open: false });

      // ✅ Refresh data
      if (selectedExamType) {
        dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType.id));
      }
    } catch (error: any) {
      console.error("❌ Error deleting service price:", error);

      // ✅ Display specific error message from API
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Lỗi khi xóa dịch vụ!";

      toast.error(errorMessage, {
        duration: 5000,
        description: "Vui lòng tắt hoạt động trước khi xóa.",
      });

      // ✅ Don't close dialog on error so user can see the message
      // setDeleteConfirm({ open: false }); // Comment this out
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Save edited service price
  const handleSaveEditedServicePrice = async () => {
    if (!editingService) return;

    setIsSaving(true);
    try {
      await dispatch(
        createOrUpdateExamTypeServicePriceThunk(editingService)
      ).unwrap();

      toast.success("Đã cập nhật dịch vụ thành công!");
      setEditingService(null);

      // ✅ Refresh data
      if (selectedExamType) {
        dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType.id));
      }
    } catch (error: any) {
      console.error("❌ Error updating service price:", error);
      toast.error(error?.message || "Lỗi khi cập nhật dịch vụ!");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Handle toggle service price status
  const handleToggleServicePrice = async (servicePrice: any) => {
    if (!selectedExamType) return;

    try {
      const payload: CreateUpdateExamTypeServicePrice = {
        examTypeId: selectedExamType.id,
        servicePriceId: servicePrice.id,
        regularPrice: servicePrice.price || 0,
        insurancePrice: 0,
        vipPrice: 0,
        enable: !servicePrice.enable,
      };

      await dispatch(createOrUpdateExamTypeServicePriceThunk(payload)).unwrap();

      toast.success(
        `Đã ${!servicePrice.enable ? "bật" : "tắt"} dịch vụ "${
          servicePrice.name
        }"`
      );

      // ✅ Refresh data
      dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType.id));
    } catch (error: any) {
      console.error("❌ Error toggling service price:", error);
      toast.error(error?.message || "Lỗi khi cập nhật trạng thái dịch vụ!");
    }
  };

  // ✅ Handle add new service price
  const handleAddServicePrice = async () => {
    if (!selectedExamType || !newServiceForm.servicePriceId) return;

    try {
      const payload: CreateUpdateExamTypeServicePrice = {
        examTypeId: selectedExamType.id,
        servicePriceId: parseInt(newServiceForm.servicePriceId),
        regularPrice: parseFloat(newServiceForm.regularPrice) || 0,
        insurancePrice: parseFloat(newServiceForm.insurancePrice) || 0,
        vipPrice: parseFloat(newServiceForm.vipPrice) || 0,
        enable: newServiceForm.enable,
      };

      await dispatch(createOrUpdateExamTypeServicePriceThunk(payload)).unwrap();

      toast.success("Đã thêm dịch vụ thành công!");

      // Reset form
      setNewServiceForm({
        servicePriceId: "",
        regularPrice: "",
        insurancePrice: "",
        vipPrice: "",
        enable: true,
      });
      setShowAddForm(false);

      // ✅ Refresh data
      dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType.id));
    } catch (error: any) {
      console.error("❌ Error adding service price:", error);
      toast.error(error?.message || "Lỗi khi thêm dịch vụ!");
    }
  };

  const isLoading = examTypeServicePricesLoading || servicePricesLoading;

  console.log("🔍 ServicePriceModal Debug:", {
    selectedExamType,
    currentExamTypeId,
    servicePrices: examTypeServicePrices,
    stats,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <DialogTitle>Quản lý Dịch vụ - Khu Khám</DialogTitle>
                  <DialogDescription>
                    {selectedExamType && (
                      <div className="flex items-center gap-4 mt-2">
                        <span>
                          Khu khám: <strong>{selectedExamType.name}</strong>
                        </span>
                        <span>
                          Khu vực: <strong>{selectedExamType.zoneName}</strong>
                        </span>
                      </div>
                    )}
                  </DialogDescription>
                </div>
              </div>

              {/* ✅ Add Service Button */}
              <Button
                onClick={() => setShowAddForm(true)}
                className="gap-2"
                size="sm"
                disabled={
                  isLoading ||
                  !selectedExamType ||
                  availableServicePrices.length === 0
                }
              >
                <Plus className="h-4 w-4" />
                Thêm Dịch vụ
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">
                  Đang tải dữ liệu dịch vụ...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ✅ Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tổng dịch vụ
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.total}
                        </p>
                        {stats.active !== stats.total && (
                          <p className="text-xs text-green-600">
                            {stats.active} đang hoạt động
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Plus className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Có thể thêm
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {availableServicePrices.length}
                        </p>
                        <p className="text-xs text-gray-500">
                          dịch vụ chưa gán
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ✅ Add Form */}
                {showAddForm && (
                  <Card className="p-4 border-dashed border-2 border-blue-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5 text-blue-600" />
                          Thêm Dịch vụ Mới
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* ✅ Select Service Price */}
                        <div className="col-span-2">
                          <Label htmlFor="servicePriceId">Chọn Dịch vụ *</Label>
                          <select
                            id="servicePriceId"
                            value={newServiceForm.servicePriceId}
                            onChange={(e) =>
                              setNewServiceForm((prev) => ({
                                ...prev,
                                servicePriceId: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">-- Chọn dịch vụ --</option>
                            {availableServicePrices.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* ✅ Enable Toggle - Separate Card */}
                      <Card
                        className={`p-4 border-2 transition-all ${
                          newServiceForm.enable
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                newServiceForm.enable
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {newServiceForm.enable ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <X className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor="enable-toggle"
                                className="cursor-pointer font-semibold text-base"
                              >
                                Trạng thái dịch vụ
                              </Label>
                              <p
                                className={`text-sm mt-0.5 ${
                                  newServiceForm.enable
                                    ? "text-green-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {newServiceForm.enable
                                  ? "✓ Dịch vụ sẽ được kích hoạt ngay"
                                  : "✗ Dịch vụ sẽ ở trạng thái tắt"}
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="enable-toggle"
                            checked={newServiceForm.enable}
                            onCheckedChange={(checked) =>
                              setNewServiceForm((prev) => ({
                                ...prev,
                                enable: checked,
                              }))
                            }
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </Card>

                      {/* ✅ Info Box */}
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-700">
                          <p className="font-medium">Lưu ý:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Bạn có thể bật/tắt dịch vụ bất kỳ lúc nào</li>
                            <li>
                              Nếu tắt, dịch vụ sẽ không hiển thị khi đặt lịch
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* ✅ Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewServiceForm({
                              servicePriceId: "",
                              regularPrice: "",
                              insurancePrice: "",
                              vipPrice: "",
                              enable: true,
                            });
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddServicePrice}
                          disabled={!newServiceForm.servicePriceId}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm Dịch vụ
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* ✅ Service Prices List */}
                {stats.total === 0 ? (
                  <Card className="p-8">
                    <div className="text-center space-y-3">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="font-medium text-gray-900">
                        Chưa có dịch vụ nào
                      </h3>
                      <p className="text-sm text-gray-500">
                        Hãy thêm dịch vụ đầu tiên cho khu khám này.
                      </p>
                      {availableServicePrices.length > 0 && (
                        <Button
                          onClick={() => setShowAddForm(true)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm Dịch vụ Đầu Tiên
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">
                        Danh sách Dịch vụ ({stats.total})
                      </h3>
                    </div>

                    {/* ✅ Map qua currentExamTypeServicePrices */}
                    {currentExamTypeServicePrices.map(
                      (servicePrice: any, index: number) => (
                        <Card
                          key={`${selectedExamType?.id}-${servicePrice.id}-${index}`}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">
                                  {servicePrice.name}
                                </h4>
                                <Badge
                                  variant={
                                    servicePrice.enable
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {servicePrice.enable ? "Hoạt động" : "Tắt"}
                                </Badge>
                              </div>

                              {/* ✅ FIXED: Check if editing this service */}
                              {editingService &&
                              editingService.servicePriceId ===
                                servicePrice.id ? (
                                // ✅ EDIT MODE
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs">
                                        Giá dịch vụ
                                      </Label>
                                      <Input
                                        type="number"
                                        value={editingService.regularPrice}
                                        onChange={(e) =>
                                          setEditingService((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  regularPrice:
                                                    parseFloat(
                                                      e.target.value
                                                    ) || 0,
                                                }
                                              : null
                                          )
                                        }
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">
                                        Giá BHYT
                                      </Label>
                                      <Input
                                        type="number"
                                        value={editingService.insurancePrice}
                                        onChange={(e) =>
                                          setEditingService((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  insurancePrice:
                                                    parseFloat(
                                                      e.target.value
                                                    ) || 0,
                                                }
                                              : null
                                          )
                                        }
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Giá VIP</Label>
                                      <Input
                                        type="number"
                                        value={editingService.vipPrice}
                                        onChange={(e) =>
                                          setEditingService((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  vipPrice:
                                                    parseFloat(
                                                      e.target.value
                                                    ) || 0,
                                                }
                                              : null
                                          )
                                        }
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>

                                  {/* ✅ Action buttons in edit mode */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditedServicePrice}
                                      disabled={isSaving}
                                      className="gap-1"
                                    >
                                      {isSaving ? (
                                        <>
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                          Đang lưu...
                                        </>
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )}
                                      Lưu
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingService(null)}
                                    >
                                      <X className="h-3 w-3" />
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // ✅ VIEW MODE
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-600 font-medium">
                                      💰 Giá dịch vụ
                                    </span>
                                    <span className="text-xl font-bold text-blue-800">
                                      {servicePrice.price?.toLocaleString(
                                        "vi-VN"
                                      )}{" "}
                                      VNĐ
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ✅ Action Buttons - FIXED */}
                            <div className="flex items-center gap-2 ml-4">
                              {/* ✅ Show switch only in view mode */}
                              {!editingService ||
                              editingService.servicePriceId !==
                                servicePrice.id ? (
                                <>
                                  <Switch
                                    checked={servicePrice.enable}
                                    onCheckedChange={() =>
                                      handleToggleServicePrice(servicePrice)
                                    }
                                    className="data-[state=checked]:bg-green-600"
                                  />

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() =>
                                      handleDeleteServicePrice(
                                        selectedExamType!.id,
                                        servicePrice.id,
                                        servicePrice.name
                                      )
                                    }
                                    title="Xóa dịch vụ"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : null}
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
                <div className="flex items-center gap-6">
                  <span>
                    <strong>{stats.total}</strong> dịch vụ
                    {stats.active !== stats.total && (
                      <span className="text-green-600 ml-1">
                        ({stats.active} hoạt động)
                      </span>
                    )}
                  </span>
                  <span>
                    <strong>{availableServicePrices.length}</strong> có thể thêm
                  </span>
                </div>
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
              Xác nhận xóa dịch vụ
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <span className="font-semibold text-red-600">
                "{deleteConfirm.servicePrice?.servicePriceName}"
              </span>{" "}
              khỏi khu khám này?
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
              onClick={confirmDeleteServicePrice}
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
                  Xóa dịch vụ
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
