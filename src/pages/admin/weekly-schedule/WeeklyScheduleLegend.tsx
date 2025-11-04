import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Clock,
  Users,
  MapPin,
  Building,
  Stethoscope,
} from "lucide-react";

interface WeeklyScheduleLegendProps {
  roomClassifications: any;
  departmentsByZone?: any; // ✅ Thêm departmentsByZone
  examsByZone?: any; // ✅ Thêm examsByZone
  examinations?: any[]; // ✅ Thêm examinations
  selectedZone?: string; // ✅ Thêm selectedZone để filter data
  zones?: any[]; // ✅ Thêm zones để hiển thị tên
}

export const WeeklyScheduleLegend: React.FC<WeeklyScheduleLegendProps> = ({
  roomClassifications,
  departmentsByZone,
  examsByZone,
  examinations,
  selectedZone,
  zones,
}) => {
  // ✅ Helper function để lấy tên zone
  const getZoneName = () => {
    if (!selectedZone || selectedZone === "all") return "Tất cả zones";
    const zone = zones?.find((z) => z.id.toString() === selectedZone);
    return zone ? zone.name : `Zone ${selectedZone}`;
  };

  // ✅ Lấy khoa phòng theo zone
  const getCurrentDepartments = () => {
    if (!departmentsByZone) return [];

    if (selectedZone && selectedZone !== "all") {
      return departmentsByZone[selectedZone] || [];
    }

    // Nếu chọn "all", lấy từ tất cả zones
    return Object.values(departmentsByZone).flat();
  };

  // ✅ Lấy khu khám theo zone
  const getCurrentExams = () => {
    if (!examsByZone) return [];

    if (selectedZone && selectedZone !== "all") {
      return examsByZone[selectedZone] || [];
    }

    // Nếu chọn "all", lấy từ tất cả zones
    return Object.values(examsByZone).flat();
  };

  // ✅ Lấy ca khám từ examinations
  const getCurrentExaminations = () => {
    if (!examinations || !Array.isArray(examinations)) return [];
    return examinations.filter((exam) => exam.enable !== false);
  };

  const departments = getCurrentDepartments();
  const exams = getCurrentExams();
  const examSchedules = getCurrentExaminations();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="w-4 h-4" />
          Chú giải và hướng dẫn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          {/* ✅ Khoa phòng động từ departmentsByZone */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Khoa phòng ({getZoneName()})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {departments.length > 0 ? (
                departments.slice(0, 5).map((dept, index) => (
                  <div
                    key={dept.departmentHospitalId || index}
                    className="text-xs"
                  >
                    <Badge variant="outline" className="text-xs">
                      {dept.departmentHospitalName}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Chưa có khoa phòng nào
                </div>
              )}
              {departments.length > 5 && (
                <div className="text-xs text-gray-500">
                  +{departments.length - 5} khoa phòng khác...
                </div>
              )}
            </div>
          </div>

          {/* ✅ Khu khám động từ examsByZone */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Khu khám ({getZoneName()})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {exams.length > 0 ? (
                exams.slice(0, 5).map((exam, index) => (
                  <div key={exam.id || index} className="text-xs">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        exam.enable === false ? "opacity-50" : ""
                      }`}
                    >
                      {exam.name}
                    </Badge>
                    {exam.enable === false && (
                      <span className="text-xs text-red-500 ml-1">
                        (Tạm ngưng)
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Chưa có khu khám nào
                </div>
              )}
              {exams.length > 5 && (
                <div className="text-xs text-gray-500">
                  +{exams.length - 5} khu khám khác...
                </div>
              )}
            </div>
          </div>

          {/* ✅ Ca khám động từ examinations */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ca khám
            </h4>
            <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
              {examSchedules.length > 0 ? (
                examSchedules.map((exam, index) => (
                  <div
                    key={exam.id || index}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        exam.workSession === "morning"
                          ? "bg-yellow-400"
                          : exam.workSession === "afternoon"
                          ? "bg-blue-400"
                          : exam.workSession === "evening"
                          ? "bg-purple-400"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-xs">
                      {exam.workSession === "morning"
                        ? "Sáng"
                        : exam.workSession === "afternoon"
                        ? "Chiều"
                        : exam.workSession === "evening"
                        ? "Tối"
                        : "Ca khám"}
                      : {exam.startTime?.slice(0, 5)} -
                      {exam.endTime?.slice(0, 5)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Chưa có ca khám nào
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
