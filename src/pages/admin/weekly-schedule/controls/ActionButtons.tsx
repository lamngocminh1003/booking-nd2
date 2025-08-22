import React from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Clock,
  Palette,
  CalendarCog,
  Undo2,
  Redo2,
  Save,
  Filter,
} from "lucide-react";

interface ActionButtonsProps {
  triggerFileUpload: () => void;
  handleDownloadExcel: () => void;
  setShowShiftConfigDialog: (value: boolean) => void;
  setShowRoomClassificationDialog: (value: boolean) => void;
  setShowCloneDialog: (value: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleSaveAll: () => void;
  undoStack: any[];
  redoStack: any[];
  scheduleChanges: Record<string, any>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  triggerFileUpload,
  handleDownloadExcel,
  setShowShiftConfigDialog,
  setShowRoomClassificationDialog,
  setShowCloneDialog,
  handleUndo,
  handleRedo,
  handleSaveAll,
  undoStack,
  redoStack,
  scheduleChanges,
}) => {
  return (
    <>
      {/* Excel Import/Export */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileUpload}
          className="h-9 gap-2"
        >
          <Upload className="w-4 h-4" />
          Tải lên Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadExcel}
          className="h-9 gap-2"
        >
          <Download className="w-4 h-4" />
          Tải xuống Excel
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShiftConfigDialog(true)}
          className="h-9"
        >
          <Clock className="w-4 h-4 mr-2" />
          Cấu hình ca khám
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRoomClassificationDialog(true)}
          className="h-9"
        >
          <Palette className="w-4 h-4 mr-2" />
          Phân loại phòng
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCloneDialog(true)}
          className="h-9 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-700"
        >
          <CalendarCog className="w-4 h-4 mr-2" />
          Nhân bản tuần
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={undoStack?.length === 0}
          className="h-9"
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Hoàn tác
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRedo}
          disabled={redoStack?.length === 0}
          className="h-9"
        >
          <Redo2 className="w-4 h-4 mr-2" />
          Làm lại
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleSaveAll}
          disabled={Object.keys(scheduleChanges || {}).length === 0}
          className="h-9 bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Lưu tất cả ({Object.keys(scheduleChanges || {}).length})
        </Button>

        <Button variant="outline" size="sm" className="h-9">
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc
        </Button>
      </div>
    </>
  );
};
