import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  FileText,
  Download,
  Eye,
  Search,
  User,
  Pill,
  ArrowDown,
} from "lucide-react";

interface MedicalRecord {
  id: string;
  childName: string;
  childId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  diagnosis: string;
  symptoms: string[];
  prescriptions: Prescription[];
  notes: string;
  followUp?: string;
  hasReport: boolean;
  hasImages: boolean;
}

interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const History = () => {
  const [selectedChild, setSelectedChild] = useState<string>("all");

  const children = [
    { id: "1", name: "Nguyễn Hoàng An", age: 4 },
    { id: "2", name: "Nguyễn Hoàng Minh", age: 6 },
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: "1",
      childName: "Nguyễn Hoàng An",
      childId: "1",
      doctorName: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      date: "2024-05-10",
      time: "09:30",
      diagnosis: "Viêm họng cấp",
      symptoms: ["Ho", "Sốt nhẹ", "Đau họng"],
      prescriptions: [
        {
          name: "Paracetamol",
          dosage: "120mg",
          frequency: "3 lần/ngày",
          duration: "5 ngày",
        },
        {
          name: "Kháng sinh Amoxicillin",
          dosage: "250mg",
          frequency: "2 lần/ngày",
          duration: "7 ngày",
        },
      ],
      notes: "Uống thuốc đủ liệu trình, uống nhiều nước, nghỉ ngơi.",
      followUp: "2024-05-20",
      hasReport: true,
      hasImages: false,
    },
    {
      id: "2",
      childName: "Nguyễn Hoàng Minh",
      childId: "2",
      doctorName: "BS. Lê Thị Hoa",
      specialty: "Tim mạch nhi",
      date: "2024-04-15",
      time: "14:00",
      diagnosis: "Khám tim định kỳ",
      symptoms: [],
      prescriptions: [],
      notes: "Kết quả siêu âm tim bình thường. Tim khỏe mạnh.",
      followUp: "2024-10-15",
      hasReport: true,
      hasImages: true,
    },
    {
      id: "3",
      childName: "Nguyễn Hoàng An",
      childId: "1",
      doctorName: "BS. Nguyễn Minh Tâm",
      specialty: "Hô hấp nhi",
      date: "2024-03-05",
      time: "10:15",
      diagnosis: "Viêm phế quản",
      symptoms: ["Ho kéo dài", "Khò khè", "Sốt"],
      prescriptions: [
        {
          name: "Ventolin",
          dosage: "2 nhát xịt",
          frequency: "2 lần/ngày",
          duration: "10 ngày",
        },
        {
          name: "Prednisolon",
          dosage: "5mg",
          frequency: "1 lần/ngày",
          duration: "5 ngày",
        },
      ],
      notes: "Theo dõi tình trạng ho, tái khám nếu không giảm sau 5 ngày.",
      hasReport: true,
      hasImages: true,
    },
  ];

  const filteredRecords =
    selectedChild === "all"
      ? medicalRecords
      : medicalRecords.filter((record) => record.childId === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lịch sử khám bệnh
            </h1>
            <p className="text-gray-600">
              Theo dõi lịch sử khám bệnh và kết quả chẩn đoán
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-64">
                    <Select
                      value={selectedChild}
                      onValueChange={setSelectedChild}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bé" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Tìm kiếm theo triệu chứng, chẩn đoán..."
                      className="pl-10 h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records List */}
          <div className="space-y-6">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="p-6 bg-white border-b">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {record.specialty}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {record.date} • {record.time}
                          </span>
                        </div>
                        <CardTitle className="text-lg">
                          {record.childName}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          {record.doctorName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 sm:self-start">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Chi tiết kết quả khám</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                      Thông tin chung
                                    </h3>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Bệnh nhi:
                                        </span>
                                        <span className="font-medium">
                                          {record.childName}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Bác sĩ:
                                        </span>
                                        <span className="font-medium">
                                          {record.doctorName}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Chuyên khoa:
                                        </span>
                                        <span className="font-medium">
                                          {record.specialty}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Ngày khám:
                                        </span>
                                        <span className="font-medium">
                                          {record.date}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Giờ khám:
                                        </span>
                                        <span className="font-medium">
                                          {record.time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                      Chẩn đoán
                                    </h3>
                                    <p className="mt-1 text-sm border p-3 rounded-md bg-gray-50">
                                      {record.diagnosis}
                                    </p>
                                  </div>

                                  {record.symptoms.length > 0 && (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">
                                        Triệu chứng
                                      </h3>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {record.symptoms.map((symptom, idx) => (
                                          <Badge key={idx} variant="outline">
                                            {symptom}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-4">
                                  {record.prescriptions.length > 0 && (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">
                                        Đơn thuốc
                                      </h3>
                                      <div className="mt-2 space-y-3">
                                        {record.prescriptions.map(
                                          (prescription, idx) => (
                                            <div
                                              key={idx}
                                              className="p-3 border rounded-md bg-blue-50"
                                            >
                                              <div className="flex items-center">
                                                <Pill className="w-4 h-4 mr-2 text-blue-600" />
                                                <span className="font-medium">
                                                  {prescription.name}
                                                </span>
                                              </div>
                                              <div className="mt-1 pl-6 text-sm text-gray-600 grid grid-cols-3 gap-1">
                                                <div>
                                                  Liều: {prescription.dosage}
                                                </div>
                                                <div>
                                                  Tần suất:{" "}
                                                  {prescription.frequency}
                                                </div>
                                                <div>
                                                  Thời gian:{" "}
                                                  {prescription.duration}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                      Lời dặn của bác sĩ
                                    </h3>
                                    <p className="mt-1 text-sm border p-3 rounded-md bg-gray-50">
                                      {record.notes}
                                    </p>
                                  </div>

                                  {record.followUp && (
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">
                                        Tái khám
                                      </h3>
                                      <div className="mt-1 text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                                        <span>{record.followUp}</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="pt-4">
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Tải kết quả (PDF)
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {record.hasReport && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Tải báo cáo
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Chẩn đoán
                        </h3>
                        <p className="font-medium">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Đơn thuốc
                        </h3>
                        <p className="font-medium">
                          {record.prescriptions.length > 0
                            ? `${record.prescriptions.length} loại thuốc`
                            : "Không có"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                          Tái khám
                        </h3>
                        <p className="font-medium">
                          {record.followUp || "Không cần thiết"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có lịch sử khám
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Chưa có thông tin khám bệnh nào được ghi nhận
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button variant="outline">
                Xem thêm
                <ArrowDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
