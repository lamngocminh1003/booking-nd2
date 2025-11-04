import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchZones,
  addZone,
  updateZoneThunk,
  deleteZoneThunk,
} from "@/store/slices/zoneSlice";
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

const PAGE_SIZE = 10;

export default function ZoneManagement() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.zone
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchZones() as any);
  }, [dispatch]);

  // Filter and pagination
  const filteredList = useMemo(
    () =>
      list.filter((zone) =>
        zone?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
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
      zoneCode: formData.get("zoneCode") as string,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      enable: true,
    };

    try {
      if (editingZone) {
        await dispatch(
          updateZoneThunk({
            id: editingZone.id,
            data: { ...data, enable: editingZone.enable },
          }) as any
        );
        toast.success("Cập nhật khu thành công!");
      } else {
        await dispatch(addZone(data) as any);
        toast.success("Thêm khu mới thành công!");
      }
      setIsDialogOpen(false);
      setEditingZone(null);
      dispatch(fetchZones() as any);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleToggleEnable = async (zone: any) => {
    try {
      await dispatch(
        updateZoneThunk({
          id: zone.id,
          data: { ...zone, enable: !zone.enable },
        }) as any
      );
      await dispatch(fetchZones() as any); // Fetch after update
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  function handleDelete(id: number): void {
    if (window.confirm("Bạn có chắc chắn muốn xóa khu vực này?")) {
      dispatch(deleteZoneThunk(id) as any);
      toast.success("Xóa khu vực thành công!");
    }
  }

  return (
    <div className="p-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý khu vực</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingZone(null);
                }}
              >
                Thêm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingZone ? "Cập nhật" : "Thêm"} khu vực
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  defaultValue={editingZone?.name}
                  placeholder="Tên khu"
                  required
                />
                <Input
                  name="address"
                  defaultValue={editingZone?.address}
                  placeholder="Địa chỉ"
                  required
                />
                <Button type="submit">
                  {editingZone ? "Cập nhật" : "Thêm mới"}
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
                      Tổng số khu vực
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
                      {list.filter((z) => z.enable).length}
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
              placeholder="Tìm kiếm khu vực..."
              className="max-w-xs"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tên khu</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[200px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="w-[100px]">{zone.id}</TableCell>
                    <TableCell>{zone.name}</TableCell>
                    <TableCell>{zone.address}</TableCell>
                    <TableCell className="w-[120px]">
                      <Switch
                        checked={zone.enable}
                        onCheckedChange={() => handleToggleEnable(zone)}
                      />
                    </TableCell>
                    <TableCell className="w-[200px] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingZone(zone);
                            setIsDialogOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(zone.id)}
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
