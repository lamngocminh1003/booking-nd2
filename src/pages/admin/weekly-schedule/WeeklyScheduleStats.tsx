import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from "lucide-react";

interface WeeklyScheduleStatsProps {
  departments: Array<{ id: string; name: string }>;
  scheduleData: Record<string, Record<string, any>>;
  scheduleChanges: Record<string, any>;
}

export const WeeklyScheduleStats: React.FC<WeeklyScheduleStatsProps> = ({
  departments,
  scheduleData,
  scheduleChanges,
}) => {
  // Calculate statistics
  const totalDepartments = departments.filter((d) => d.id !== "all").length;
  const totalChanges = Object.keys(scheduleChanges).length;

  // Count total rooms and shifts
  let totalRooms = 0;
  let totalShifts = 0;
  let departmentsWithSchedule = 0;
  let emptySlots = 0;

  departments
    .filter((d) => d.id !== "all")
    .forEach((dept) => {
      const deptData = scheduleData[dept.id];
      if (deptData) {
        let hasAnyRoom = false;
        Object.values(deptData).forEach((slot: any) => {
          if (slot?.rooms?.length > 0) {
            totalRooms += slot.rooms.length;
            totalShifts++;
            hasAnyRoom = true;
          } else {
            emptySlots++;
          }
        });
        if (hasAnyRoom) {
          departmentsWithSchedule++;
        }
      } else {
        emptySlots += 10; // 5 days * 2 shifts
      }
    });

  const coveragePercentage =
    totalDepartments > 0
      ? Math.round((departmentsWithSchedule / totalDepartments) * 100)
      : 0;

  const utilizationPercentage =
    totalShifts + emptySlots > 0
      ? Math.round((totalShifts / (totalShifts + emptySlots)) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Departments */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalDepartments}
              </div>
              <p className="text-sm text-gray-600">Tổng khoa phòng</p>
              <p className="text-xs text-blue-500 mt-1">
                {departmentsWithSchedule} có lịch khám
              </p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Rooms Scheduled */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalRooms}
              </div>
              <p className="text-sm text-gray-600">Phòng được phân</p>
              <p className="text-xs text-green-500 mt-1">
                {totalShifts} ca khám
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Coverage Percentage */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {coveragePercentage}%
              </div>
              <p className="text-sm text-gray-600">Độ bao phủ</p>
              <div className="mt-2">
                {coveragePercentage >= 80 ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Tốt
                  </Badge>
                ) : coveragePercentage >= 50 ? (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 text-xs"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Trung bình
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800 text-xs"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Cần cải thiện
                  </Badge>
                )}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {totalChanges}
              </div>
              <p className="text-sm text-gray-600">Thay đổi chờ lưu</p>
              <div className="mt-2">
                {totalChanges > 0 ? (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Có thay đổi
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Đã lưu tất cả
                  </Badge>
                )}
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats Row */}
      <div className="md:col-span-2 lg:col-span-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {emptySlots}
                </div>
                <p className="text-xs text-gray-500">Slot trống</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {utilizationPercentage}%
                </div>
                <p className="text-xs text-gray-500">Tỷ lệ sử dụng</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {Math.round((totalRooms / Math.max(totalShifts, 1)) * 10) /
                    10}
                </div>
                <p className="text-xs text-gray-500">Phòng/Ca trung bình</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-700">10</div>
                <p className="text-xs text-gray-500">Slot/Khoa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
