import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, Users, MapPin } from "lucide-react";

interface WeeklyScheduleLegendProps {
  roomClassifications: any;
}

export const WeeklyScheduleLegend: React.FC<WeeklyScheduleLegendProps> = ({
  roomClassifications,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="w-4 h-4" />
          Chú giải và hướng dẫn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Room Classifications */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Phân loại phòng
            </h4>
            <div className="space-y-2">
              {Object.entries(roomClassifications).map(
                ([key, classification]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge className={`${classification.color} border text-xs`}>
                      {classification.name}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {classification.description}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Time Periods */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ca khám
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Ca sáng: 07:30 - 11:00</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Ca chiều: 13:30 - 16:00</span>
              </div>
            </div>
          </div>

          {/* Usage Guide */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Hướng dẫn sử dụng
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Click vào ô trống để thêm phòng</div>
              <div>• Click vào phòng đã có để cấu hình</div>
              <div>• Chấm xanh: có thay đổi chưa lưu</div>
              <div>• Sử dụng Ctrl+Z để hoàn tác</div>
              <div>• Xuất Excel để backup dữ liệu</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
