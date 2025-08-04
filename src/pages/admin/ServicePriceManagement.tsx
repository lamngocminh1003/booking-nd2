import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchServicePrices,
  addServicePrice,
  updateServicePriceThunk,
  deleteServicePriceThunk,
} from "@/store/slices/servicePriceSlice";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 10;

export default function ServicePriceManagement() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.servicePrice
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchServicePrices() as any);
  }, [dispatch]);

  // Filter and pagination
  const filteredList = useMemo(
    () =>
      list.filter((service) =>
        service.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [list, debouncedSearch]
  );

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const pagedList = filteredList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      regularPrice: Number(formData.get("regularPrice")),
      insurancePrice: Number(formData.get("insurancePrice")),
      vipPrice: Number(formData.get("vipPrice")),
    };

    try {
      if (editingService) {
        await dispatch(
          updateServicePriceThunk({
            id: editingService.id,
            data,
          }) as any
        );
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        await dispatch(addServicePrice(data) as any);
        toast.success("Thêm dịch vụ mới thành công!");
      }
      setIsDialogOpen(false);
      setEditingService(null);
      dispatch(fetchServicePrices() as any);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      dispatch(deleteServicePriceThunk(id) as any);
      toast.success("Xóa dịch vụ thành công!");
    }
  };

  const handleToggleEnable = async (service: any) => {
    try {
      await dispatch(
        updateServicePriceThunk({
          id: service.id,
          data: { ...service, enable: !service.enable },
        }) as any
      );
      await dispatch(fetchServicePrices() as any); // Fetch after update
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý giá dịch vụ</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingService(null);
                }}
              >
                Thêm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Cập nhật" : "Thêm"} dịch vụ
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên dịch vụ</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingService?.name}
                    placeholder="Tên dịch vụ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Giá thường</Label>
                  <Input
                    id="regularPrice"
                    name="regularPrice"
                    type="number"
                    defaultValue={editingService?.regularPrice}
                    placeholder="Giá thường"
                    required
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurancePrice">Giá BHYT</Label>
                  <Input
                    id="insurancePrice"
                    name="insurancePrice"
                    type="number"
                    defaultValue={editingService?.insurancePrice}
                    placeholder="Giá BHYT"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vipPrice">Giá VIP</Label>
                  <Input
                    id="vipPrice"
                    name="vipPrice"
                    type="number"
                    defaultValue={editingService?.vipPrice}
                    placeholder="Giá VIP"
                    min={0}
                  />
                </div>

                <Button type="submit">
                  {editingService ? "Cập nhật" : "Thêm mới"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {/* Overview Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Tổng dịch vụ
                    </p>
                    <p className="text-2xl font-bold">{list.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Đang hoạt động
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {list.filter((s) => s.enable).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex justify-between mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm dịch vụ..."
              className="max-w-xs"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead className="w-[150px]">Giá thường</TableHead>
                  <TableHead className="w-[150px]">Giá BHYT</TableHead>
                  <TableHead className="w-[150px]">Giá VIP</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[200px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="w-[100px]">{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="w-[150px]">
                      {service.regularPrice?.toLocaleString()} đ
                    </TableCell>
                    <TableCell className="w-[150px]">
                      {service.insurancePrice?.toLocaleString()} đ
                    </TableCell>
                    <TableCell className="w-[150px]">
                      {service.vipPrice?.toLocaleString()} đ
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <Switch
                        checked={service.enable}
                        onCheckedChange={() => handleToggleEnable(service)}
                      />
                    </TableCell>
                    <TableCell className="w-[200px] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingService(service);
                            setIsDialogOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(service.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <span className="text-sm">
              Trang {page}/{totalPages || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
