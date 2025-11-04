import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSpecialties,
  addSpecialty,
  updateSpecialtyThunk,
  deleteSpecialtyThunk,
} from "@/store/slices/specialtySlice";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

const PAGE_SIZE = 10;

export default function SpecialtyManagement() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.specialty
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<any>(null);
  const [deletingSpecialty, setDeletingSpecialty] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchSpecialties() as any);
  }, [dispatch]);

  // Filter and pagination
  const filteredList = useMemo(
    () =>
      list.filter((specialty) =>
        specialty?.name?.toLowerCase().includes(debouncedSearch?.toLowerCase())
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
      description: formData.get("description") as string,
      listType: formData.get("listType") as string,
      enable: true,
    };

    try {
      if (editingSpecialty) {
        await dispatch(
          updateSpecialtyThunk({
            id: editingSpecialty.id,
            data: { ...data },
          }) as any
        );
        toast.success("Cập nhật chuyên khoa thành công!");
      } else {
        await dispatch(addSpecialty(data) as any);
        toast.success("Thêm chuyên khoa mới thành công!");
      }
      setIsDialogOpen(false);
      setEditingSpecialty(null);
      dispatch(fetchSpecialties() as any);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (specialty: any) => {
    try {
      await dispatch(deleteSpecialtyThunk(specialty.id) as any);
      toast.success(`Xóa chuyên khoa "${specialty.name}" thành công!`);
      dispatch(fetchSpecialties() as any);
      setDeletingSpecialty(null);

      // Reset page if current page becomes empty
      const newTotalPages = Math.ceil((filteredList.length - 1) / PAGE_SIZE);
      if (page > newTotalPages && newTotalPages > 0) {
        setPage(newTotalPages);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa chuyên khoa!");
    }
  };

  return (
    <div className=" animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý chuyên khoa</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSpecialty(null);
              }}
            >
              Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSpecialty ? "Cập nhật" : "Thêm"} chuyên khoa
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                defaultValue={editingSpecialty?.name}
                placeholder="Tên chuyên khoa"
                required
              />
              <Textarea
                id="description"
                name="description"
                defaultValue={editingSpecialty?.description}
                placeholder="Nhập mô tả chi tiết về chuyên khoa..."
                rows={5}
                className="resize-none min-h-[120px]"
              />

              <Button type="submit">
                {editingSpecialty ? "Cập nhật" : "Thêm mới"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Thêm phần tổng quan */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng chuyên khoa
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

        {/* Search input existing code... */}
        <div className="flex justify-between mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm chuyên khoa..."
            className="max-w-xs"
          />
        </div>
        <div className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[250px]">Tên chuyên khoa</TableHead>
                <TableHead className="w-[300px]">Mô tả</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[120px] sticky right-0 bg-white">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedList.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="w-[80px]">{specialty.id}</TableCell>
                  <TableCell className="w-[250px]">{specialty.name}</TableCell>
                  <TableCell className="w-[300px]">
                    {specialty.description ? (
                      <div
                        className="max-w-xs text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: specialty.description.replace(/\n/g, "<br>"),
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="w-[120px]">
                    <Switch
                      checked={specialty.enable}
                      onCheckedChange={async (checked) => {
                        await dispatch(
                          updateSpecialtyThunk({
                            id: specialty.id,
                            data: { ...specialty, enable: checked },
                          }) as any
                        );
                        dispatch(fetchSpecialties() as any);
                        toast.success("Cập nhật trạng thái thành công!");
                      }}
                    />
                  </TableCell>
                  <TableCell className="w-[120px] sticky right-0 bg-white">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSpecialty(specialty);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa chuyên khoa{" "}
                              <span className="font-semibold">
                                "{specialty.name}"
                              </span>
                              ?<br />
                              <span className="text-red-600">
                                Hành động này không thể hoàn tác!
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(specialty)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
    </div>
  );
}
