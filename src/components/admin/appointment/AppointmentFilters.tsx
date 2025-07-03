import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface AppointmentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AppointmentFilters = ({
  searchTerm,
  onSearchChange,
}: AppointmentFiltersProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Danh sách lịch hẹn</h3>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm lịch hẹn..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Lọc
        </Button>
      </div>
    </div>
  );
};

export default AppointmentFilters;
