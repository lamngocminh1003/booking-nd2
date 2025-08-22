import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Save, RotateCcw, Plus, Trash2 } from "lucide-react";

interface RoomClassificationDialogProps {
  showRoomClassificationDialog: boolean;
  setShowRoomClassificationDialog: (value: boolean) => void;
  roomClassifications: any;
  setRoomClassifications: (value: any) => void;
}

export const RoomClassificationDialog: React.FC<
  RoomClassificationDialogProps
> = ({
  showRoomClassificationDialog,
  setShowRoomClassificationDialog,
  roomClassifications,
  setRoomClassifications,
}) => {
  const [tempClassifications, setTempClassifications] =
    useState(roomClassifications);

  useEffect(() => {
    setTempClassifications(roomClassifications);
  }, [roomClassifications]);

  const handleSave = () => {
    setRoomClassifications(tempClassifications);
    setShowRoomClassificationDialog(false);
  };

  const handleReset = () => {
    const defaultClassifications = {
      normal: {
        name: "Phòng thường",
        color: "bg-gray-200 border-gray-300 text-gray-800",
        description: "Phòng khám thường, không đặc biệt",
      },
      priority: {
        name: "Phòng ưu tiên",
        color: "bg-blue-100 border-blue-300 text-blue-800",
        description: "Phòng dành cho bệnh nhân ưu tiên",
      },
      special: {
        name: "Phòng đặc biệt",
        color: "bg-green-100 border-green-300 text-green-800",
        description: "Phòng có trang thiết bị đặc biệt",
      },
      urgent: {
        name: "Phòng cấp cứu",
        color: "bg-red-100 border-red-300 text-red-800",
        description: "Phòng dành cho ca cấp cứu",
      },
    };
    setTempClassifications(defaultClassifications);
  };

  const updateClassification = (key: string, field: string, value: string) => {
    setTempClassifications((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const addNewClassification = () => {
    const newKey = `custom_${Date.now()}`;
    setTempClassifications((prev: any) => ({
      ...prev,
      [newKey]: {
        name: "Phòng tùy chỉnh",
        color: "bg-purple-100 border-purple-300 text-purple-800",
        description: "Mô tả phòng tùy chỉnh",
      },
    }));
  };

  const removeClassification = (key: string) => {
    setTempClassifications((prev: any) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const colorOptions = [
    "bg-gray-100 border-gray-300 text-gray-800",
    "bg-blue-100 border-blue-300 text-blue-800",
    "bg-green-100 border-green-300 text-green-800",
    "bg-red-100 border-red-300 text-red-800",
    "bg-yellow-100 border-yellow-300 text-yellow-800",
    "bg-purple-100 border-purple-300 text-purple-800",
    "bg-pink-100 border-pink-300 text-pink-800",
    "bg-indigo-100 border-indigo-300 text-indigo-800",
  ];

  return (
    <Dialog
      open={showRoomClassificationDialog}
      onOpenChange={setShowRoomClassificationDialog}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cấu hình phân loại phòng khám
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(tempClassifications).map(
              ([key, classification]: [string, any]) => (
                <Card key={key} className="relative">
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-3 gap-4 items-start">
                      {/* Name and Preview */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Tên loại phòng
                        </Label>
                        <Input
                          value={classification.name}
                          onChange={(e) =>
                            updateClassification(key, "name", e.target.value)
                          }
                          placeholder="Tên phân loại"
                        />
                        <div className="pt-2">
                          <Badge className={`${classification.color} border`}>
                            {classification.name}
                          </Badge>
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Màu sắc</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((colorClass) => (
                            <button
                              key={colorClass}
                              type="button"
                              className={`w-8 h-8 rounded border-2 ${colorClass} ${
                                classification.color === colorClass
                                  ? "ring-2 ring-blue-500"
                                  : ""
                              }`}
                              onClick={() =>
                                updateClassification(key, "color", colorClass)
                              }
                            />
                          ))}
                        </div>
                        <Input
                          value={classification.color}
                          onChange={(e) =>
                            updateClassification(key, "color", e.target.value)
                          }
                          placeholder="CSS classes tùy chỉnh"
                          className="text-xs"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mô tả</Label>
                        <textarea
                          value={classification.description}
                          onChange={(e) =>
                            updateClassification(
                              key,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Mô tả chi tiết về loại phòng này"
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none h-20"
                        />
                      </div>
                    </div>

                    {/* Delete Button for custom classifications */}
                    {key.startsWith("custom_") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeClassification(key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Add New Classification */}
          <Button
            variant="outline"
            onClick={addNewClassification}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm phân loại mới
          </Button>

          {/* Preview Section */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Xem trước</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tempClassifications).map(
                  ([key, classification]: [string, any]) => (
                    <Badge
                      key={key}
                      className={`${classification.color} border`}
                    >
                      {classification.name}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Đặt lại mặc định
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRoomClassificationDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
