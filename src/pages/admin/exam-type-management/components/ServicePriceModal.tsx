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

  // ✅ Add search state
  const [serviceSearch, setServiceSearch] = useState("");

  // ✅ Load data when modal opens or exam type changes
  useEffect(() => {
    if (open && selectedExamType) {
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

  // ✅ Update useMemo để filter enabled services
  const currentExamTypeServicePrices = useMemo(() => {
    if (!examTypeServicePrices?.servicePrice) {
      return [];
    }

    // ✅ Chỉ lấy những servicePrice có enable = true
    const enabledServices = examTypeServicePrices.servicePrice.filter(
      (servicePrice) => servicePrice.enable === true
    );

    return enabledServices;
  }, [examTypeServicePrices]);

  // ✅ Statistics
  const stats = useMemo(() => {
    const totalServices = examTypeServicePrices?.servicePrice?.length || 0;
    const enabledServices = currentExamTypeServicePrices.length;
    const disabledServices = totalServices - enabledServices;

    return {
      total: enabledServices,
      disabled: disabledServices,
      allServices: totalServices,
    };
  }, [currentExamTypeServicePrices, examTypeServicePrices]);

  // ✅ Available service prices for adding
  const availableServicePrices = useMemo(() => {
    // Lấy tất cả servicePrice IDs từ examType hiện tại
    const assignedServicePriceIds =
      examTypeServicePrices?.servicePrice?.map((sp) => sp.id) || [];

    // Chỉ show những service price chưa được assign
    return allServicePrices.filter(
      (sp) => !assignedServicePriceIds.includes(sp.id)
    );
  }, [allServicePrices, examTypeServicePrices]);

  // ✅ Add logic để check nếu đã có service price enabled
  const hasEnabledServicePrice = useMemo(() => {
    if (!examTypeServicePrices?.servicePrice) {
      return false;
    }

    // ✅ Check if có bất kỳ service price nào đang enable = true
    return examTypeServicePrices.servicePrice.some(
      (servicePrice) => servicePrice.enable === true
    );
  }, [examTypeServicePrices]);

  // ✅ Enhanced filtered service prices with search
  const filteredAvailableServicePrices = useMemo(() => {
    if (!serviceSearch.trim()) {
      return availableServicePrices;
    }

    const searchLower = serviceSearch.toLowerCase();
    return availableServicePrices.filter((sp) => {
      const nameMatch = sp.name.toLowerCase().includes(searchLower);
      // ✅ Fix: Use regularPrice instead of price
      const priceMatch = sp.regularPrice.toString().includes(serviceSearch);
      return nameMatch || priceMatch;
    });
  }, [availableServicePrices, serviceSearch]);

  // ✅ Get selected service details - Fix price field
  const selectedServiceDetails = useMemo(() => {
    if (!newServiceForm.servicePriceId) return null;
    return availableServicePrices.find(
      (sp) => sp.id.toString() === newServiceForm.servicePriceId
    );
  }, [availableServicePrices, newServiceForm.servicePriceId]);

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
    try {
      // ✅ Gọi API để update enable status
      await dispatch(
        createOrUpdateExamTypeServicePriceThunk({
          examTypeId: selectedExamType!.id,
          servicePriceId: servicePrice.id,
          regularPrice: servicePrice.price,
          insurancePrice: 0,
          vipPrice: 0,
          enable: !servicePrice.enable, // ✅ Toggle enable status
        })
      ).unwrap();

      // ✅ Refresh data sau khi toggle
      dispatch(fetchExamTypeServicePricesByExamTypeId(selectedExamType!.id));

      toast.success(
        servicePrice.enable
          ? `Đã tắt dịch vụ "${servicePrice.name}"`
          : `Đã bật dịch vụ "${servicePrice.name}"`
      );
    } catch (error: any) {
      console.error("❌ Error toggling service price:", error);
      toast.error(error.message || "Lỗi khi thay đổi trạng thái dịch vụ");
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
                  availableServicePrices.length === 0 ||
                  hasEnabledServicePrice // ✅ Disable nếu đã có service price enabled
                }
                title={
                  hasEnabledServicePrice
                    ? "Đã có dịch vụ đang hoạt động. Vui lòng tắt dịch vụ hiện tại trước khi thêm mới."
                    : availableServicePrices.length === 0
                    ? "Không có dịch vụ nào để thêm"
                    : "Thêm dịch vụ mới"
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

                      <div className="grid grid-cols-1 gap-4">
                        {/* ✅ Enhanced Service Price Selection with Search */}
                        <div className="col-span-1">
                          <Label
                            htmlFor="servicePriceId"
                            className="text-sm font-medium"
                          >
                            Chọn Dịch vụ *
                          </Label>

                          {/* ✅ Search Input */}
                          <div className="mt-1 mb-3">
                            <Input
                              type="text"
                              placeholder="🔍 Tìm kiếm theo tên hoặc giá dịch vụ..."
                              value={serviceSearch}
                              onChange={(e) => setServiceSearch(e.target.value)}
                              className="w-full text-sm"
                            />
                            {serviceSearch && (
                              <p className="text-xs text-gray-500 mt-1">
                                Tìm thấy {filteredAvailableServicePrices.length}{" "}
                                dịch vụ phù hợp
                              </p>
                            )}
                          </div>

                          {/* ✅ Enhanced Service Selection - Fix price display */}
                          <div className="border rounded-md max-h-64 overflow-y-auto bg-white">
                            {filteredAvailableServicePrices.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">
                                  {serviceSearch
                                    ? "Không tìm thấy dịch vụ phù hợp"
                                    : "Không có dịch vụ nào để thêm"}
                                </p>
                                {serviceSearch && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setServiceSearch("")}
                                    className="mt-2 text-xs"
                                  >
                                    Xóa bộ lọc
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {filteredAvailableServicePrices.map((sp) => (
                                  <div
                                    key={sp.id}
                                    className={`p-3 cursor-pointer transition-colors ${
                                      newServiceForm.servicePriceId ===
                                      sp.id.toString()
                                        ? "bg-blue-50 border-l-4 border-blue-500"
                                        : "hover:bg-gray-50"
                                    }`}
                                    onClick={() =>
                                      setNewServiceForm((prev) => ({
                                        ...prev,
                                        servicePriceId: sp.id.toString(),
                                        regularPrice:
                                          sp.regularPrice.toString(), // ✅ Auto-fill from regularPrice
                                      }))
                                    }
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        {/* ✅ Service Name */}
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name="servicePrice"
                                            value={sp.id}
                                            checked={
                                              newServiceForm.servicePriceId ===
                                              sp.id.toString()
                                            }
                                            onChange={() => {}}
                                            className="text-blue-600"
                                          />
                                          <h4 className="font-medium text-sm text-gray-900 truncate">
                                            {sp.name}
                                          </h4>
                                        </div>

                                        {/* ✅ Service Details */}
                                        <div className="mt-2 space-y-1">
                                          {/* ✅ Multiple Price Types Display */}
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center justify-between">
                                              <span className="text-gray-500">
                                                Giá thường:
                                              </span>
                                              <span className="font-semibold text-emerald-600">
                                                {sp.regularPrice.toLocaleString(
                                                  "vi-VN"
                                                )}{" "}
                                                VNĐ
                                              </span>
                                            </div>
                                            {sp.insurancePrice > 0 && (
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-500">
                                                  Giá BHYT:
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                  {sp.insurancePrice.toLocaleString(
                                                    "vi-VN"
                                                  )}{" "}
                                                  VNĐ
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* ✅ VIP and other prices in second row */}
                                          {sp.vipPrice > 0 && (
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              {sp.vipPrice > 0 && (
                                                <div className="flex items-center justify-between">
                                                  <span className="text-gray-500">
                                                    Giá VIP:
                                                  </span>
                                                  <span className="font-semibold text-purple-600">
                                                    {sp?.vipPrice?.toLocaleString(
                                                      "vi-VN"
                                                    )}{" "}
                                                    VNĐ
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* ✅ Service status and type badges */}
                                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge
                                              variant={
                                                sp.enable
                                                  ? "default"
                                                  : "secondary"
                                              }
                                              className="text-xs"
                                            >
                                              {sp.enable
                                                ? "✓ Hoạt động"
                                                : "✗ Tạm dừng"}
                                            </Badge>

                                            {/* ✅ Service type indicators based on name */}
                                            {sp.name.includes("[CLC]") && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                                              >
                                                CLC
                                              </Badge>
                                            )}
                                            {sp.name.includes("[VIP]") && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                                              >
                                                VIP
                                              </Badge>
                                            )}
                                            {sp.name.includes("[BHYT]") && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-green-50 text-green-700 border-green-300"
                                              >
                                                BHYT
                                              </Badge>
                                            )}
                                            {sp.name.includes(
                                              "[Con CNVC-LĐ]"
                                            ) && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-blue-50 text-blue-700 border-blue-300"
                                              >
                                                Con CNVC
                                              </Badge>
                                            )}
                                            {sp.name.includes("[Nội trú]") && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-gray-50 text-gray-700 border-gray-300"
                                              >
                                                Nội trú
                                              </Badge>
                                            )}

                                            {/* ✅ Special price indicator */}
                                            {sp.regularPrice === 0 && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-green-50 text-green-700 border-green-300"
                                              >
                                                Miễn phí
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* ✅ Selection indicator */}
                                      {newServiceForm.servicePriceId ===
                                        sp.id.toString() && (
                                        <div className="flex-shrink-0 ml-2">
                                          <Check className="h-5 w-5 text-blue-600" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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
                        Chưa có dịch vụ nào được kích hoạt
                      </h3>
                      <p className="text-sm text-gray-500">
                        {examTypeServicePrices?.servicePrice?.length > 0
                          ? "Có dịch vụ đã được thêm nhưng đang tắt. Hãy kích hoạt để hiển thị."
                          : "Hãy thêm dịch vụ đầu tiên cho khu khám này."}
                      </p>

                      {/* ✅ Show different messages based on state */}
                      {hasEnabledServicePrice ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700 font-medium">
                            ⚠️ Đã có dịch vụ đang hoạt động
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Vui lòng tắt dịch vụ hiện tại trước khi thêm dịch vụ
                            mới
                          </p>
                        </div>
                      ) : availableServicePrices.length > 0 ? (
                        <Button
                          onClick={() => setShowAddForm(true)}
                          className="gap-2"
                          disabled={hasEnabledServicePrice}
                        >
                          <Plus className="h-4 w-4" />
                          Thêm Dịch vụ
                        </Button>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Không có dịch vụ nào để thêm
                          </p>
                        </div>
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
                                      )}
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
                    <strong>{stats.total}</strong> dịch vụ hoạt động
                    {hasEnabledServicePrice && (
                      <span className="text-green-600 ml-1">✓</span>
                    )}
                  </span>
                  <span>
                    <strong>
                      {hasEnabledServicePrice
                        ? 0
                        : availableServicePrices.length}
                    </strong>
                    có thể thêm
                    {hasEnabledServicePrice && (
                      <span className="text-yellow-600 ml-1">
                        (Tắt dịch vụ hiện tại để thêm mới)
                      </span>
                    )}
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
              Bạn có chắc chắn muốn xóa dịch vụ
              <span className="font-semibold text-red-600">
                "{deleteConfirm.servicePrice?.servicePriceName}"
              </span>
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
