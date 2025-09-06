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
import { Palette, Save, RotateCcw } from "lucide-react";

interface RoomClassificationDialogProps {
  showRoomClassificationDialog: boolean;
  setShowRoomClassificationDialog: (value: boolean) => void;
  roomClassifications: any;
  setRoomClassifications: (value: any) => void;
  updateClassificationColor?: (key: string, hexColor: string) => void;
  tailwindToHex?: (tailwindClass: string) => string;
  hexToTailwind?: (hex: string) => string;
  examsByZone?: any; // ✅ Thêm examsByZone data
  selectedZone?: string; // ✅ Thêm selected zone
  zones?: any[]; // ✅ Thêm zones data để hiển thị tên
}

export const RoomClassificationDialog: React.FC<
  RoomClassificationDialogProps
> = ({
  showRoomClassificationDialog,
  setShowRoomClassificationDialog,
  roomClassifications,
  setRoomClassifications,
  updateClassificationColor,
  tailwindToHex,
  hexToTailwind,
  examsByZone,
  selectedZone,
  zones,
}) => {
  const [tempClassifications, setTempClassifications] =
    useState(roomClassifications);

  useEffect(() => {
    setTempClassifications(roomClassifications);
  }, [roomClassifications]);

  // ✅ Helper function để kiểm tra màu đã được sử dụng
  const isColorInUse = (color: string, excludeKey?: string) => {
    return Object.entries(tempClassifications).some(
      ([key, classification]: [string, any]) =>
        key !== excludeKey && classification.color === color
    );
  };

  // ✅ Auto load examsByZone data khi dialog mở
  useEffect(() => {
    if (
      showRoomClassificationDialog &&
      selectedZone &&
      selectedZone !== "all" &&
      examsByZone?.[selectedZone]
    ) {
      const zoneExams = examsByZone[selectedZone];
      const examClassifications = {};

      if (Array.isArray(zoneExams)) {
        const availableColors = [
          "bg-blue-50 text-blue-700 border-blue-200",
          "bg-green-50 text-green-700 border-green-200",
          "bg-purple-50 text-purple-700 border-purple-200",
          "bg-yellow-50 text-yellow-700 border-yellow-200",
          "bg-red-50 text-red-700 border-red-200",
          "bg-indigo-50 text-indigo-700 border-indigo-200",
          "bg-pink-50 text-pink-700 border-pink-200",
          "bg-orange-50 text-orange-700 border-orange-200",
          "bg-cyan-50 text-cyan-700 border-cyan-200",
          "bg-emerald-50 text-emerald-700 border-emerald-200",
          "bg-violet-50 text-violet-700 border-violet-200",
          "bg-rose-50 text-rose-700 border-rose-200",
          "bg-sky-50 text-sky-700 border-sky-200",
          "bg-amber-50 text-amber-700 border-amber-200",
          "bg-lime-50 text-lime-700 border-lime-200",
          "bg-teal-50 text-teal-700 border-teal-200",
        ];

        // ✅ Tạo Set để theo dõi màu đã được sử dụng
        const usedColors = new Set();

        zoneExams.forEach((exam, index) => {
          if (exam.id && exam.name) {
            const shortName =
              exam.name.length > 15
                ? exam.name.substring(0, 15) + "..."
                : exam.name;

            const classificationKey = `exam_${exam.id}`;

            // ✅ Kiểm tra màu hiện có từ roomClassifications
            let currentColor = roomClassifications[classificationKey]?.color;

            // ✅ Nếu màu chưa có hoặc đã được sử dụng, tìm màu mới
            if (!currentColor || usedColors.has(currentColor)) {
              // Tìm màu chưa được sử dụng
              currentColor = availableColors.find(
                (color) => !usedColors.has(color)
              );

              // Nếu không còn màu nào, sử dụng index
              if (!currentColor) {
                currentColor = availableColors[index % availableColors.length];
              }
            }

            // ✅ Đánh dấu màu đã được sử dụng
            usedColors.add(currentColor);

            examClassifications[classificationKey] = {
              name: shortName,
              color: currentColor,
              description: exam.description || `Loại khám: ${exam.name}`,
              enabled: exam.enable !== false,
              examId: exam.id,
              originalName: exam.name,
            };
          }
        });

        // ✅ Merge với custom classifications hiện có
        const customClassifications = Object.fromEntries(
          Object.entries(roomClassifications).filter(([key]) =>
            key.startsWith("custom_")
          )
        );

        setTempClassifications({
          ...examClassifications,
          ...customClassifications,
        });
      }
    }
  }, [
    showRoomClassificationDialog,
    selectedZone,
    examsByZone,
    roomClassifications,
  ]);

  const handleSave = () => {
    setRoomClassifications(tempClassifications);
    setShowRoomClassificationDialog(false);
  };

  const handleReset = () => {
    // ✅ Bỏ defaultClassifications, sử dụng examsByZone
    if (selectedZone && selectedZone !== "all" && examsByZone?.[selectedZone]) {
      const zoneExams = examsByZone[selectedZone];
      const resetClassifications = {};

      if (Array.isArray(zoneExams)) {
        const availableColors = [
          "bg-blue-50 text-blue-700 border-blue-200",
          "bg-green-50 text-green-700 border-green-200",
          "bg-purple-50 text-purple-700 border-purple-200",
          "bg-yellow-50 text-yellow-700 border-yellow-200",
          "bg-red-50 text-red-700 border-red-200",
          "bg-indigo-50 text-indigo-700 border-indigo-200",
          "bg-pink-50 text-pink-700 border-pink-200",
          "bg-orange-50 text-orange-700 border-orange-200",
          "bg-cyan-50 text-cyan-700 border-cyan-200",
          "bg-emerald-50 text-emerald-700 border-emerald-200",
          "bg-violet-50 text-violet-700 border-violet-200",
          "bg-rose-50 text-rose-700 border-rose-200",
          "bg-sky-50 text-sky-700 border-sky-200",
          "bg-amber-50 text-amber-700 border-amber-200",
          "bg-lime-50 text-lime-700 border-lime-200",
          "bg-teal-50 text-teal-700 border-teal-200",
        ];

        zoneExams.forEach((exam, index) => {
          if (exam.id && exam.name) {
            // ✅ Đảm bảo mỗi exam có màu riêng biệt
            const colorIndex = index % availableColors.length;
            const shortName =
              exam.name.length > 15
                ? exam.name.substring(0, 15) + "..."
                : exam.name;

            const classificationKey = `exam_${exam.id}`;
            resetClassifications[classificationKey] = {
              name: shortName,
              color: availableColors[colorIndex],
              description: exam.description || `Loại khám: ${exam.name}`,
              enabled: exam.enable !== false,
              examId: exam.id,
              originalName: exam.name,
            };
          }
        });
      }

      setTempClassifications(resetClassifications);
    } else {
      // Fallback nếu không có examsByZone
      setTempClassifications({});
    }
  };

  const updateClassification = (key: string, field: string, value: string) => {
    // ✅ Cho phép chọn màu thoải mái - bỏ logic ngăn chặn trùng lặp
    setTempClassifications((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // ✅ Helper function để tự động sắp xếp màu không trùng
  const autoAssignUniqueColors = () => {
    const availableColors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-green-50 text-green-700 border-green-200",
      "bg-purple-50 text-purple-700 border-purple-200",
      "bg-yellow-50 text-yellow-700 border-yellow-200",
      "bg-red-50 text-red-700 border-red-200",
      "bg-indigo-50 text-indigo-700 border-indigo-200",
      "bg-pink-50 text-pink-700 border-pink-200",
      "bg-orange-50 text-orange-700 border-orange-200",
      "bg-cyan-50 text-cyan-700 border-cyan-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-violet-50 text-violet-700 border-violet-200",
      "bg-rose-50 text-rose-700 border-rose-200",
      "bg-sky-50 text-sky-700 border-sky-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-lime-50 text-lime-700 border-lime-200",
      "bg-teal-50 text-teal-700 border-teal-200",
    ];

    const newClassifications = { ...tempClassifications };
    const keys = Object.keys(newClassifications);

    keys.forEach((key, index) => {
      const colorIndex = index % availableColors.length;
      newClassifications[key] = {
        ...newClassifications[key],
        color: availableColors[colorIndex],
      };
    });

    setTempClassifications(newClassifications);
  };

  // ✅ Helper function để lấy tên zone
  const getZoneName = () => {
    if (selectedZone === "all") return "Tất cả zones";
    const zone = zones?.find((z) => z.id.toString() === selectedZone);
    return zone ? zone.name : `Zone ${selectedZone}`;
  };

  const colorOptions = [
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-green-50 text-green-700 border-green-200",
    "bg-purple-50 text-purple-700 border-purple-200",
    "bg-yellow-50 text-yellow-700 border-yellow-200",
    "bg-red-50 text-red-700 border-red-200",
    "bg-indigo-50 text-indigo-700 border-indigo-200",
    "bg-pink-50 text-pink-700 border-pink-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-cyan-50 text-cyan-700 border-cyan-200",
    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "bg-violet-50 text-violet-700 border-violet-200",
    "bg-rose-50 text-rose-700 border-rose-200",
    "bg-sky-50 text-sky-700 border-sky-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-lime-50 text-lime-700 border-lime-200",
    "bg-teal-50 text-teal-700 border-teal-200",
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
            Cấu hình màu sắc phòng khám - {getZoneName()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(tempClassifications).map(
              ([key, classification]: [string, any]) => (
                <Card key={key} className="relative">
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4 items-start">
                      {/* Name and Preview - Read only */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Loại khám</Label>
                        {/* ✅ Hiển thị thông tin exam từ examsByZone - chỉ đọc */}
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded text-sm border">
                            <div className="font-medium">
                              {classification.originalName ||
                                classification.name}
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Badge className={`${classification.color} border`}>
                            {classification.name}
                          </Badge>
                        </div>
                      </div>

                      {/* Color Selection với Color Picker */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Màu sắc</Label>

                        {/* ✅ Color Picker */}
                        {updateClassificationColor && tailwindToHex && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={tailwindToHex(classification.color)}
                                onChange={(e) =>
                                  updateClassificationColor(key, e.target.value)
                                }
                                className="w-10 h-10 rounded border cursor-pointer"
                                title="Chọn màu tùy chỉnh"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">
                                  Màu tùy chỉnh
                                </span>
                                <span className="text-xs text-gray-500">
                                  {tailwindToHex(classification.color)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ✅ Preset colors - Cho phép chọn thoải mái */}
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((colorClass) => {
                            const isCurrentColor =
                              classification.color === colorClass;

                            return (
                              <button
                                key={colorClass}
                                type="button"
                                className={`w-8 h-8 rounded border-2 ${colorClass} ${
                                  isCurrentColor ? "ring-2 ring-blue-500" : ""
                                } cursor-pointer hover:scale-110 transition-transform`}
                                onClick={() =>
                                  updateClassification(key, "color", colorClass)
                                }
                                title={`Sử dụng màu: ${colorClass}`}
                              />
                            );
                          })}
                        </div>

                        {/* ✅ Custom input */}
                        <Input
                          value={classification.color}
                          onChange={(e) =>
                            updateClassification(key, "color", e.target.value)
                          }
                          placeholder="CSS classes tùy chỉnh"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Preview Section */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">
                Xem trước màu sắc - {getZoneName()}
              </h4>
              <div className="space-y-3">
                {/* ✅ Chỉ hiển thị Exam-based classifications */}
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">
                    Các loại khám:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tempClassifications)
                      .filter(
                        ([key, classification]: [string, any]) =>
                          classification.examId
                      )
                      .map(([key, classification]: [string, any]) => (
                        <Badge
                          key={key}
                          className={`${classification.color} border`}
                        >
                          {classification.name}
                        </Badge>
                      ))}
                  </div>
                  {Object.entries(tempClassifications).filter(
                    ([key, classification]: [string, any]) =>
                      classification.examId
                  ).length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có loại khám nào cho zone này
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={autoAssignUniqueColors}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Tự động sắp xếp màu
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Đặt lại màu mặc định
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
