import React from "react";

interface WeeklyScheduleHeaderProps {
  weekRange: {
    weekNum: number;
    startDate: string;
    endDate: string;
  };
  selectedWeek: string;
  viewMode: "week" | "day";
  selectedDay: string;
}

export const WeeklyScheduleHeader: React.FC<WeeklyScheduleHeaderProps> = ({
  weekRange,
  selectedWeek,
  viewMode,
  selectedDay,
}) => {
  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Lịch phân ban khoa khám bệnh</h1>
        <p className="text-blue-500 mt-2">
          Quản lý lịch khám bệnh theo tuần - Tuần {weekRange.weekNum} năm
          {selectedWeek.split("-W")[0]}
        </p>
        <p className="text-sm text-blue-700 font-medium mt-1">
          Từ ngày {weekRange.startDate} đến ngày {weekRange.endDate}
        </p>
      </div>
    </div>
  );
};
