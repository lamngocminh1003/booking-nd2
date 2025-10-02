import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Building2, RefreshCw, DollarSign } from "lucide-react";
import type { ExamTypeWithZone } from "./types";
import type { Zone } from "@/store/slices/zoneSlice";

const PAGE_SIZE = 10;

interface ExamTypeTableProps {
  examTypes: ExamTypeWithZone[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (examType: ExamTypeWithZone) => void;
  onViewDepartments: (examType: ExamTypeWithZone) => void;
  onViewServicePrices: (examType: ExamTypeWithZone) => void;
  zoneDataLoading: Record<number, boolean>;
  loading: boolean;
  filteredCount: number;
  zoneFilter: string;
  zones: Zone[];
}

export const ExamTypeTable: React.FC<ExamTypeTableProps> = ({
  examTypes,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onViewDepartments,
  onViewServicePrices,
  zoneDataLoading,
  loading,
  filteredCount,
  zoneFilter,
  zones,
}) => {
  return (
    <>
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên Khu Khám</TableHead>
              <TableHead>Khu Vực</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Khoa/Phòng</TableHead>{" "}
              <TableHead>Gía dịch vụ</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                  <p className="mt-2">Đang tải...</p>
                </TableCell>
              </TableRow>
            ) : examTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Không tìm thấy dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              examTypes.map((examType, index) => (
                <TableRow key={examType.id}>
                  <TableCell>
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{examType.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {examType.zoneName}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {examType.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={examType.enable ? "default" : "secondary"}>
                      {examType.enable ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDepartments(examType)}
                      disabled={zoneDataLoading[examType.zoneId]}
                      className="gap-2"
                    >
                      {zoneDataLoading[examType.zoneId] ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Building2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>{" "}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewServicePrices(examType)}
                      className="gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {/* Action buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(examType)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
        <span>
          Hiển thị {examTypes.length} / {filteredCount} khu khám
        </span>
        {zoneFilter !== "all" && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            Khu vực: {zones?.find((z) => z.id.toString() === zoneFilter)?.name}
          </span>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} đến{" "}
            {Math.min(currentPage * PAGE_SIZE, filteredCount)} trong tổng số{" "}
            {filteredCount} bản ghi
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
