import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchRooms, addRoom, updateRoomThunk } from "@/store/slices/roomSlice";
import { fetchZones } from "@/store/slices/zoneSlice";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

export default function RoomManagement() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.room
  );
  const { list: zoneList } = useSelector((state: RootState) => state.zone);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchRooms() as any);
    dispatch(fetchZones() as any);
  }, [dispatch]);

  // Filter and pagination
  const filteredList = useMemo(
    () =>
      list.filter((room) =>
        room?.name?.toLowerCase().includes(debouncedSearch?.toLowerCase())
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
      code: formData.get("code") as string,
      zoneId: Number(formData.get("zoneId")),
    };

    try {
      if (editingRoom) {
        await dispatch(
          updateRoomThunk({
            id: editingRoom.id,
            data,
          }) as any
        );
        toast.success("Cập nhật phòng thành công!");
      } else {
        await dispatch(addRoom(data) as any);
        toast.success("Thêm phòng mới thành công!");
      }
      setIsDialogOpen(false);
      setEditingRoom(null);
      dispatch(fetchRooms() as any);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  // Thêm hàm xử lý toggle enable
  const handleToggleEnable = async (room: any) => {
    try {
      await dispatch(
        updateRoomThunk({
          id: room.id,
          data: { ...room, enable: !room.enable },
        }) as any
      );
      await dispatch(fetchRooms() as any); // Fetch lại sau khi update
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý phòng khám</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingRoom(null);
                }}
              >
                Thêm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? "Cập nhật" : "Thêm"} phòng khám
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  defaultValue={editingRoom?.name}
                  placeholder="Tên phòng"
                  required
                />
                <Select
                  name="zoneId"
                  defaultValue={editingRoom?.zoneId?.toString()}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneList
                      ?.filter((zone) => zone.enable)
                      .map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button type="submit">
                  {editingRoom ? "Cập nhật" : "Thêm mới"}
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
                      Tổng số phòng
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
                      {list.filter((r) => r.enable).length}
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
              placeholder="Tìm kiếm phòng..."
              className="max-w-xs"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Tên khu</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[200px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="w-[100px]">{room.id}</TableCell>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.zoneName}</TableCell>
                    <TableCell className="w-[120px]">
                      <Switch
                        checked={room.enable}
                        onCheckedChange={() => handleToggleEnable(room)}
                      />
                    </TableCell>
                    <TableCell className="w-[200px] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingRoom(room);
                            setIsDialogOpen(true);
                          }}
                        >
                          Sửa
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
