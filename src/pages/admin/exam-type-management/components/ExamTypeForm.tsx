import React from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { ExamTypeWithZone } from "./types";
import type { Zone } from "@/store/slices/zoneSlice";

interface ExamTypeFormProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Partial<ExamTypeWithZone>;
  zones: Zone[];
  onFormChange: (field: keyof ExamTypeWithZone, value: any) => void;
  onSave: () => void;
  loading: boolean;
}

export const ExamTypeForm: React.FC<ExamTypeFormProps> = ({
  mode,
  open,
  onOpenChange,
  formData,
  zones,
  onFormChange,
  onSave,
  loading,
}) => {
  const handleZoneChange = (value: string) => {
    const selectedZone = zones.find((z) => z.id === parseInt(value));
    onFormChange("zoneId", parseInt(value));
    onFormChange("zoneName", selectedZone?.name || "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm Khu Khám Mới" : "Chỉnh sửa Khu Khám"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin để tạo khu khám mới trong hệ thống."
              : "Cập nhật thông tin khu khám trong hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khu khám *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => onFormChange("name", e.target.value)}
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
              onChange={(e) => onFormChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về khu khám này..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enable"
              checked={formData.enable ?? true}
              onCheckedChange={(checked) => onFormChange("enable", checked)}
            />
            <Label htmlFor="enable">
              {mode === "create" ? "Kích hoạt ngay" : "Trạng thái hoạt động"}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                {mode === "create" ? "Đang tạo..." : "Đang cập nhật..."}
              </>
            ) : mode === "create" ? (
              "Tạo mới"
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
