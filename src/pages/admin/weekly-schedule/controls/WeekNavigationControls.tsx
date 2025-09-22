import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigationControlsProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
  weeks: Array<any>;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
}

export const WeekNavigationControls: React.FC<WeekNavigationControlsProps> = ({
  selectedWeek,
  setSelectedWeek,
  weeks,
  handlePreviousWeek,
  handleNextWeek,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousWeek}
        className="h-9"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="w-40 h-9" data-week-value={selectedWeek}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {weeks?.map((week) => (
            <SelectItem
              key={week.value}
              value={week.value}
              data-week-value={week.value}
              className={`${
                week.isCurrent
                  ? "text-blue-600 font-medium"
                  : week.isPast
                  ? "text-gray-500"
                  : "text-gray-900"
              }`}
            >
              {week.label}
            </SelectItem>
          )) || []}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNextWeek}
        className="h-9"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
