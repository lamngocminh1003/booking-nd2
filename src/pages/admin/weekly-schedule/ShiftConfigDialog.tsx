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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner"; // ✅ Thêm toast import

interface ShiftConfigDialogProps {
  showShiftConfigDialog: boolean;
  setShowShiftConfigDialog: (value: boolean) => void;
  shiftDefaults: any;
  onSave: (config: any) => void; // ✅ Sửa prop name từ setShiftDefaults thành onSave
  examinations?: any[];
}

export const ShiftConfigDialog: React.FC<ShiftConfigDialogProps> = ({
  showShiftConfigDialog,
  setShowShiftConfigDialog,
  shiftDefaults,
  onSave, // ✅ Sử dụng onSave
  examinations = [],
}) => {
  const [tempDefaults, setTempDefaults] = useState(shiftDefaults);

  useEffect(() => {
    setTempDefaults(shiftDefaults);
  }, [shiftDefaults]);

  // ✅ Helper để lấy màu theo ca
  const getShiftColor = (workSession: string) => {
    switch (workSession) {
      case "sáng":
        return "bg-yellow-400";
      case "chiều":
        return "bg-blue-400";
      case "tối":
        return "bg-purple-400";
      default:
        return "bg-gray-400";
    }
  };

  // ✅ Tạo danh sách ca khám từ examinations data
  const availableShifts = React.useMemo(() => {
    const shifts = examinations.map((exam) => ({
      id: exam.id,
      key: exam.workSession,
      name: exam.name,
      workSession: exam.workSession,
      originalStartTime: exam.startTime.slice(0, 5), // ✅ Lưu giờ gốc
      originalEndTime: exam.endTime.slice(0, 5), // ✅ Lưu giờ gốc
      startTime: exam.startTime.slice(0, 5),
      endTime: exam.endTime.slice(0, 5),
      enabled: exam.enable,
      color: getShiftColor(exam.workSession),
    }));

    return shifts;
  }, [examinations]);

  const handleSave = () => {
    onSave(tempDefaults); // ✅ Sử dụng onSave
    setShowShiftConfigDialog(false);
    toast.success("Đã lưu cấu hình ca khám!");
  };

  const handleReset = () => {
    // ✅ Reset về giờ gốc từ examinations
    const defaultConfig: any = {};

    availableShifts.forEach((shift) => {
      defaultConfig[shift.key] = {
        startTime: shift.originalStartTime, // ✅ Sử dụng giờ gốc
        endTime: shift.originalEndTime, // ✅ Sử dụng giờ gốc
        maxAppointments:
          shift.workSession === "sáng"
            ? 10
            : shift.workSession === "chiều"
            ? 12
            : 10,
        name: shift.name,
        examinationId: shift.id,
      };
    });

    // Thêm các settings chung
    defaultConfig.breakTime = "12:00";
    defaultConfig.appointmentDuration = 10;

    setTempDefaults(defaultConfig);
    toast.success("Đã đặt lại về cấu hình gốc từ ca khám!");
  };

  const updateShiftConfig = (shiftKey: string, field: string, value: any) => {
    if (field === "breakTime" || field === "appointmentDuration") {
      // Xử lý các trường top-level
      setTempDefaults((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // Xử lý các trường nested (ca khám)
      setTempDefaults((prev: any) => ({
        ...prev,
        [shiftKey]: {
          ...prev[shiftKey],
          [field]: value,
        },
      }));
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const diffInMinutes = Math.floor(
        (end.getTime() - start.getTime()) / 60000
      );
      return diffInMinutes > 0 ? diffInMinutes : 0;
    } catch (error) {
      return 0;
    }
  };

  return (
    <Dialog
      open={showShiftConfigDialog}
      onOpenChange={setShowShiftConfigDialog}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Cấu hình ca khám mặc định
            <span className="text-sm font-normal text-gray-500">
              (F5 để reset về giờ gốc)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ Hiển thị thông tin về override */}
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <div className="w-4 h-4 rounded-full bg-blue-400"></div>
              <span className="font-medium">Thông tin:</span>
            </div>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• Giờ mặc định lấy từ cấu hình ca khám trong hệ thống</li>
              <li>
                • Thay đổi ở đây chỉ áp dụng tạm thời cho phiên làm việc hiện
                tại
              </li>
              <li>• Tải lại trang (F5) sẽ reset về giờ gốc từ ca khám</li>
            </ul>
          </div>

          {/* Dynamic Shifts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {availableShifts.map((shift) => {
              const shiftData = tempDefaults?.[shift.key];
              const isModified =
                shiftData?.startTime !== shift.originalStartTime ||
                shiftData?.endTime !== shift.originalEndTime;

              return (
                <Card
                  key={shift.id}
                  className={`${shift.enabled ? "" : "opacity-60"} ${
                    isModified ? "ring-2 ring-orange-300 bg-orange-50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div
                        className={`w-3 h-3 ${shift.color} rounded-full`}
                      ></div>
                      <span>{shift.name}</span>
                      {!shift.enabled && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Tắt
                        </span>
                      )}
                      {isModified && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                          Đã sửa
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ✅ Hiển thị giờ gốc */}
                    {isModified && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Giờ gốc:</strong> {shift.originalStartTime} -{" "}
                        {shift.originalEndTime}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium">
                          Giờ bắt đầu
                          {isModified && (
                            <span className="text-orange-600"> *</span>
                          )}
                        </Label>
                        <Input
                          type="time"
                          value={shiftData?.startTime || shift.startTime}
                          onChange={(e) =>
                            updateShiftConfig(
                              shift.key,
                              "startTime",
                              e.target.value
                            )
                          }
                          className={`mt-1 ${
                            isModified ? "border-orange-300" : ""
                          }`}
                          disabled={!shift.enabled}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Giờ kết thúc
                          {isModified && (
                            <span className="text-orange-600"> *</span>
                          )}
                        </Label>
                        <Input
                          type="time"
                          value={shiftData?.endTime || shift.endTime}
                          onChange={(e) =>
                            updateShiftConfig(
                              shift.key,
                              "endTime",
                              e.target.value
                            )
                          }
                          className={`mt-1 ${
                            isModified ? "border-orange-300" : ""
                          }`}
                          disabled={!shift.enabled}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Số lượt khám mặc định
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={shiftData?.maxAppointments || 10}
                        onChange={(e) =>
                          updateShiftConfig(
                            shift.key,
                            "maxAppointments",
                            parseInt(e.target.value) || 10
                          )
                        }
                        className="mt-1"
                        disabled={!shift.enabled}
                      />
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Thời gian: {shiftData?.startTime || shift.startTime} -{" "}
                      {shiftData?.endTime || shift.endTime} (
                      {calculateDuration(
                        shiftData?.startTime || shift.startTime,
                        shiftData?.endTime || shift.endTime
                      )}{" "}
                      phút)
                    </div>

                    {!shift.enabled && (
                      <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                        ⚠️ Ca khám này đã tắt. Bật ca khám trong cấu hình hệ
                        thống để sử dụng.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Hiển thị thông báo nếu không có ca nào */}
          {availableShifts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có ca khám nào được cấu hình trong hệ thống.</p>
              <p className="text-sm mt-2">
                Vui lòng thêm ca khám trong phần Quản lý ca khám trước.
              </p>
            </div>
          )}

          {/* Additional Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cài đặt bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Label className="font-medium">Thời gian nghỉ giữa ca</Label>
                  <Input
                    type="time"
                    value={tempDefaults?.breakTime || "12:00"}
                    onChange={(e) =>
                      updateShiftConfig("", "breakTime", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">
                    Thời gian mỗi lượt khám (phút)
                  </Label>
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={tempDefaults?.appointmentDuration || 10}
                    onChange={(e) =>
                      updateShiftConfig(
                        "",
                        "appointmentDuration",
                        parseInt(e.target.value) || 10
                      )
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Về giờ gốc
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShiftConfigDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Áp dụng thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
