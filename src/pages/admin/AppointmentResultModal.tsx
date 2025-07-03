import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  Pill,
  AlertCircle,
} from "lucide-react";
import { Appointment } from "@/types/appointment";

interface AppointmentResultModalProps {
  appointment: Appointment;
}

const AppointmentResultModal = ({
  appointment,
}: AppointmentResultModalProps) => {
  const [open, setOpen] = useState(false);

  // Mock data cho kết quả khám
  const mockResult = {
    diagnosis: "Viêm họng cấp tính",
    symptoms: ["Sốt 38.5°C", "Ho khan", "Đau họng", "Mệt mỏi"],
    examination: {
      weight: "15.2kg",
      height: "105cm",
      temperature: "38.5°C",
      bloodPressure: "Bình thường",
      heartRate: "110 bpm",
    },
    prescription: [
      {
        medicine: "Paracetamol 250mg",
        dosage: "1 viên x 3 lần/ngày",
        duration: "5 ngày",
      },
      {
        medicine: "Amoxicillin 125mg",
        dosage: "1 viên x 2 lần/ngày",
        duration: "7 ngày",
      },
    ],
    advice:
      "Cho bé uống nhiều nước, nghỉ ngơi đầy đủ. Tái khám sau 3-5 ngày nếu không cải thiện.",
    nextAppointment: "2024-06-20",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-1" />
          Xem kết quả
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Kết quả khám - {appointment.childName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Ngày khám</p>
              <p className="font-medium">{appointment.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bác sĩ khám</p>
              <p className="font-medium">{appointment.doctor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chuyên khoa</p>
              <p className="font-medium">{appointment.specialty}</p>
            </div>
          </div>

          {/* Chẩn đoán */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2" />
              Chẩn đoán
            </h3>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="font-medium text-red-800">{mockResult.diagnosis}</p>
            </div>
          </div>

          {/* Triệu chứng */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Triệu chứng
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {mockResult.symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline" className="justify-start">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Kết quả khám */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Kết quả khám</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cân nặng</p>
                <p className="font-medium">{mockResult.examination.weight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chiều cao</p>
                <p className="font-medium">{mockResult.examination.height}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhiệt độ</p>
                <p className="font-medium">
                  {mockResult.examination.temperature}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhịp tim</p>
                <p className="font-medium">
                  {mockResult.examination.heartRate}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Đơn thuốc */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Đơn thuốc
            </h3>
            <div className="space-y-3">
              {mockResult.prescription.map((med, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {med.medicine}
                      </p>
                      <p className="text-sm text-gray-600">
                        Liều dùng: {med.dosage}
                      </p>
                    </div>
                    <Badge variant="outline">{med.duration}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lời khuyên */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Lời khuyên của bác sĩ
            </h3>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800">{mockResult.advice}</p>
            </div>
          </div>

          {/* Lịch tái khám */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Lịch tái khám
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">
                Ngày tái khám dự kiến: {mockResult.nextAppointment}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            In kết quả
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentResultModal;
