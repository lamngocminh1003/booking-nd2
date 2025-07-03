import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-orange-100 text-orange-800">Chờ duyệt</Badge>;
    case "confirmed":
      return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
};

export const getTypeBadge = (type: string) => {
  switch (type) {
    case "regular":
      return <Badge variant="outline">Thường</Badge>;
    case "urgent":
      return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
    case "specialist":
      return (
        <Badge className="bg-purple-100 text-purple-800">Chuyên khoa</Badge>
      );
    default:
      return <Badge variant="outline">Khác</Badge>;
  }
};
