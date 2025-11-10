import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExaminations,
  addExamination,
  updateExaminationThunk,
  deleteExaminationThunk,
} from "@/store/slices/examinationSlice";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function ExaminationManagement() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.examination
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [deletingExam, setDeletingExam] = useState<any>(null);

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
      list.filter((exam) =>
        exam?.name?.toLowerCase().includes(debouncedSearch?.toLowerCase())
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
      workSession: formData.get("workSession") as string,
      startTime: `${formData.get("startTime")}:00`,
      endTime: `${formData.get("endTime")}:00`,
      enable: true,
    };

    try {
      if (editingExam) {
        const result = await dispatch(
          updateExaminationThunk({
            id: editingExam.id,
            data: { ...data, enable: editingExam.enable },
          }) as any
        ).unwrap(); // ✅ SỬ DỤNG unwrap() ĐỂ XỬ LÝ ERROR TỐT HÔN

        toast.success("Cập nhật ca khám thành công!");
      } else {
        const result = await dispatch(addExamination(data) as any).unwrap(); // ✅ SỬ DỤNG unwrap()
        toast.success("Thêm ca khám mới thành công!");
      }

      setIsDialogOpen(false);
      setEditingExam(null);
      dispatch(fetchExaminations() as any);
    } catch (error: any) {
      // ✅ ERROR ĐÃ LÀ STRING MESSAGE RỒI
      const errorMessage =
        typeof error === "string" ? error : error.message || "Có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  // ✅ SỬ DỤNG PATTERN GIỐNG SPECIALTY MANAGEMENT
  const handleDelete = async (exam: any) => {
    try {
      const res = await dispatch(deleteExaminationThunk(exam.id) as any);

      // ✅ KIỂM TRA TYPE CỦA ACTION - GIỐNG SPECIALTY
      if (res.type === deleteExaminationThunk.fulfilled.type) {
        toast.success(`Xóa ca khám "${exam.name}" thành công!`);
        dispatch(fetchExaminations() as any);
        setDeletingExam(null);

        const newTotalPages = Math.ceil((filteredList.length - 1) / PAGE_SIZE);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      } else if (res.type === deleteExaminationThunk.rejected.type) {
        let errorMessage = "Có lỗi xảy ra khi xóa ca khám!";
        if (res.payload) {
          if (typeof res.payload === "string") {
            errorMessage = res.payload;
          } else if (res.payload.message) {
            errorMessage = res.payload.message;
          } else if (res.error?.message) {
            errorMessage = res.error.message;
          }
        }

        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error("Có lỗi không mong muốn xảy ra!");
    }
  };

  const handleToggleEnable = async (exam: any) => {
    try {
      const result = await dispatch(
        updateExaminationThunk({
          id: exam.id,
          data: {
            name: exam.name,
            workSession: exam.workSession,
            startTime: exam.startTime,
            endTime: exam.endTime,
            enable: !exam.enable,
          },
        }) as any
      ).unwrap(); // ✅ SỬ DỤNG unwrap()

      await dispatch(fetchExaminations() as any); // Fetch after update
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      // ✅ ERROR HANDLING GIỐNG SPECIALTY
      const errorMessage =
        typeof error === "string" ? error : error.message || "Có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="animate-fade-in">
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
                <div className="space-y-2">
                  <Label htmlFor="name">Tên ca khám</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingExam?.name}
                    placeholder="Tên ca khám"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workSession">Ca làm việc</Label>
                  <Input
                    id="workSession"
                    name="workSession"
                    defaultValue={editingExam?.workSession}
                    placeholder="Ca (sáng/chiều/tối)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Giờ bắt đầu</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={editingExam?.startTime?.replace(/:00$/, "")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Giờ kết thúc</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={editingExam?.endTime?.replace(/:00$/, "")}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Đang xử lý..."
                    : editingExam
                    ? "Cập nhật"
                    : "Thêm mới"}
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
                      Tổng ca khám
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
                      {list.filter((e) => e.enable).length}
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
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[200px]">Tên ca</TableHead>
                  <TableHead className="w-[150px]">Ca</TableHead>
                  <TableHead className="w-[150px]">Bắt đầu</TableHead>
                  <TableHead className="w-[150px]">Kết thúc</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[120px] sticky right-0 bg-white">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedList.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="w-[80px]">{exam.id}</TableCell>
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
                    <TableCell className="w-[120px] sticky right-0 bg-white">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingExam(exam);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* ✅ ALERT DIALOG GIỐNG SPECIALTY */}
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
                                Bạn có chắc chắn muốn xóa ca khám{" "}
                                <span className="font-semibold">
                                  "{exam.name}"
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
                                onClick={() => handleDelete(exam)}
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
      </Card>
    </div>
  );
}
