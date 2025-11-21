import { useState } from "react";
import { Info, AlertTriangle, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ✅ Enhanced component với thiết kế mới
const SpecialtyDescriptionPopover = ({
  specialty,
  formatSpecialtyDescription,
}: {
  specialty: any;
  formatSpecialtyDescription: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const formatted = formatSpecialtyDescription(specialty.description);

  if (!formatted || (!formatted.symptoms?.length && !formatted.notes?.length)) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <Info className="w-4 h-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 shadow-xl border-2 border-blue-200"
        align="start"
        side="right"
        sideOffset={10}
      >
        <div className="max-h-[80vh] overflow-hidden rounded-lg">
          {/* ✅ Enhanced Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                {specialty.name}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Thông tin chi tiết về chuyên khoa
            </p>
          </div>

          {/* ✅ Enhanced Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-4 space-y-4">
              {/* ✅ Symptoms Section */}
              {formatted.symptoms?.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h5 className="font-bold text-emerald-800 mb-3 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-xs">📋</span>
                    </div>
                    Dấu hiệu lâm sàng phù hợp
                  </h5>
                  <div className="space-y-2">
                    {formatted.symptoms.map(
                      (symptom: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm group"
                        >
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-emerald-600 transition-colors" />
                          <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                            {symptom}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ✅ Notes Section */}
              {formatted.notes?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h5 className="font-bold text-amber-800 mb-3 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    </div>
                    Lưu ý quan trọng
                  </h5>
                  <div className="space-y-3">
                    {formatted.notes.map((note: string, index: number) => (
                      <div
                        key={index}
                        className="bg-white/60 rounded-lg p-3 border border-amber-300"
                      >
                        <p className="text-sm text-amber-700 leading-relaxed font-medium">
                          {note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ Footer Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-600">
                  💡 Thông tin này chỉ mang tính chất tham khảo. Vui lòng tham
                  khảo ý kiến bác sĩ để có chẩn đoán chính xác.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpecialtyDescriptionPopover;
