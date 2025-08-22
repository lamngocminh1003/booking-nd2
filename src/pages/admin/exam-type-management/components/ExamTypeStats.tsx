import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Eye, EyeOff, MapPin } from "lucide-react";
import type { ExamType } from "@/store/slices/examTypeSlice";
import type { Zone } from "@/store/slices/zoneSlice";

interface ExamTypeStatsProps {
  examTypes: ExamType[];
  zones: Zone[];
}

export const ExamTypeStats: React.FC<ExamTypeStatsProps> = ({
  examTypes,
  zones,
}) => {
  const stats = [
    {
      title: "Tổng số",
      value: examTypes?.length || 0,
      icon: Settings,
      color: "blue",
    },
    {
      title: "Hoạt động",
      value: examTypes?.filter((e) => e.enable).length || 0,
      icon: Eye,
      color: "green",
    },
    {
      title: "Không hoạt động",
      value: examTypes?.filter((e) => !e.enable).length || 0,
      icon: EyeOff,
      color: "red",
    },
    {
      title: "Khu vực",
      value: zones?.filter((zone) => zone.enable).length || 0,
      icon: MapPin,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
