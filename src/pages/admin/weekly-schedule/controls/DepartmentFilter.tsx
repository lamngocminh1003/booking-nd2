import React from "react";
import { Label } from "@/components/ui/label";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

interface DepartmentFilterProps {
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  departments: Array<{ id: string; name: string }>;
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  departments,
}) => {
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: any) => option.name,
    limit: 100,
  });

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium whitespace-nowrap">
        Khoa phòng:
      </Label>
      <Autocomplete
        value={
          departments?.find((dept) => dept.id === selectedDepartment) || null
        }
        onChange={(_, newValue) => {
          setSelectedDepartment(newValue?.id || "all");
        }}
        options={departments || []}
        getOptionLabel={(option) => option.name || ""}
        filterOptions={filterOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Chọn khoa phòng..."
            size="small"
            sx={{
              minWidth: "300px",
              "& .MuiOutlinedInput-root": {
                height: "36px",
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{option.name}</span>
            </div>
          </li>
        )}
        noOptionsText="Không tìm thấy khoa phòng"
        clearText="Xóa"
        openText="Mở"
        closeText="Đóng"
      />
    </div>
  );
};
