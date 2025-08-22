import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  viewMode: "week" | "day";
  setViewMode: (value: "week" | "day") => void;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
}) => {
  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm khoa phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-48 h-9"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex border rounded-lg">
        <Button
          variant={viewMode === "week" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("week")}
          className="rounded-r-none h-9"
        >
          Tuần
        </Button>
        <Button
          variant={viewMode === "day" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("day")}
          className="rounded-l-none h-9"
        >
          Ngày
        </Button>
      </div>
    </>
  );
};
