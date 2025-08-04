import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchExaminations,
  addExamination,
  updateExaminationThunk,
  deleteExaminationThunk,
  Examination,
} from "@/store/slices/examinationSlice";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function ExaminationManagement() {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector(
    (state: any) => state.examination
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchExaminations() as any);
  }, [dispatch]);

  // Filter and pagination
  const filteredList = useMemo(
    () =>
      list?.filter((exam: Examination) =>
        exam.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) || [],
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
      workSession: formData.get("workSession") as string,
      startTime: `${formData.get("startTime")}:00`,
      endTime: `${formData.get("endTime")}:00`,
      enable: true,
    };

    try {
      if (editingExam) {
        await dispatch(
          updateExaminationThunk({
            id: editingExam.id,
            data: { ...data, enable: editingExam.enable },
          }) as any
        );
        toast.success("Cập nhật ca khám thành công!");
      } else {
        await dispatch(addExamination(data) as any);
        toast.success("Thêm ca khám mới thành công!");
      }
      setIsDialogOpen(false);
      setEditingExam(null);
      dispatch(fetchExaminations() as any);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleToggleEnable = async (exam: Examination) => {
    try {
      await dispatch(
        updateExaminationThunk({
          id: exam.id,
          data: { ...exam, enable: !exam.enable },
        }) as any
      );
      dispatch(fetchExaminations() as any);
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  function handleDelete(id: number): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý ca khám</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingExam(null);
                }}
              >
                Thêm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExam ? "Cập nhật" : "Thêm"} ca khám
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  defaultValue={editingExam?.name}
                  placeholder="Tên ca khám"
                  required
                />
                <Input
                  name="workSession"
                  defaultValue={editingExam?.workSession}
                  placeholder="Ca (sáng/chiều/tối)"
                  required
                />
                <Input
                  name="startTime"
                  type="time"
                  defaultValue={editingExam?.startTime?.replace(/:00$/, "")}
                  required
                />
                <Input
                  name="endTime"
                  type="time"
                  defaultValue={editingExam?.endTime?.replace(/:00$/, "")}
                  required
                />
                <Button type="submit">
                  {editingExam ? "Cập nhật" : "Thêm mới"}
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
                      Tổng số ca khám
                    </p>
                    <p className="text-2xl font-bold">{list?.length || 0}</p>
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
                      {list?.filter((e: Examination) => e.enable).length || 0}
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
              placeholder="Tìm kiếm ca khám..."
              className="max-w-xs"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Tên ca</TableHead>
                  <TableHead className="w-[150px]">Ca</TableHead>
                  <TableHead className="w-[150px]">Bắt đầu</TableHead>
                  <TableHead className="w-[150px]">Kết thúc</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[200px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((exam: Examination) => (
                  <TableRow key={exam.id}>
                    <TableCell className="w-[200px]">{exam.name}</TableCell>
                    <TableCell className="w-[150px]">
                      {exam.workSession}
                    </TableCell>
                    <TableCell className="w-[150px]">
                      {exam.startTime}
                    </TableCell>
                    <TableCell className="w-[150px]">{exam.endTime}</TableCell>
                    <TableCell className="w-[120px]">
                      <Switch
                        checked={exam.enable}
                        onCheckedChange={() => handleToggleEnable(exam)}
                      />
                    </TableCell>
                    <TableCell className="w-[200px] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingExam(exam);
                            setIsDialogOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(exam.id)}
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
