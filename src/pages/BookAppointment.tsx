import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Heart,
  ArrowLeft,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedChild, setSelectedChild] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const children = [
    { id: "1", name: "Nguyễn Hoàng An", age: 4, gender: "Nam" },
    { id: "2", name: "Nguyễn Hoàng Minh", age: 6, gender: "Nam" },
  ];

  const appointmentTypes = [
    {
      id: "general",
      name: "Khám tổng quát",
      description: "Kiểm tra sức khỏe định kỳ",
    },
    {
      id: "specialist",
      name: "Khám chuyên khoa",
      description: "Khám với bác sĩ chuyên khoa",
    },
    {
      id: "emergency",
      name: "Khám cấp cứu",
      description: "Khám trong trường hợp khẩn cấp",
    },
  ];

  const specialties = [
    "Nhi khoa tổng quát",
    "Tim mạch nhi",
    "Hô hấp nhi",
    "Tiêu hóa nhi",
    "Thần kinh nhi",
    "Nội tiết nhi",
    "Da liễu nhi",
  ];

  const doctors: Doctor[] = [
    {
      id: "1",
      name: "BS. Trần Văn Nam",
      specialty: "Nhi khoa tổng quát",
      experience: 15,
      rating: 4.8,
    },
    {
      id: "2",
      name: "BS. Lê Thị Hoa",
      specialty: "Tim mạch nhi",
      experience: 12,
      rating: 4.9,
    },
    {
      id: "3",
      name: "BS. Nguyễn Minh Tâm",
      specialty: "Hô hấp nhi",
      experience: 8,
      rating: 4.7,
    },
  ];

  const timeSlots: TimeSlot[] = [
    { time: "08:00", available: true },
    { time: "08:30", available: true },
    { time: "09:00", available: false },
    { time: "09:30", available: true },
    { time: "10:00", available: true },
    { time: "10:30", available: false },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: false },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
  ];

  const filteredDoctors = selectedSpecialty
    ? doctors.filter((doctor) => doctor.specialty === selectedSpecialty)
    : doctors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedChild ||
      !appointmentType ||
      !selectedDoctor ||
      !selectedDate ||
      !selectedTime
    ) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin để đặt lịch khám.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Đặt lịch khám thành công!",
      description:
        "Lịch khám đã được gửi, chúng tôi sẽ xác nhận trong vòng 24h.",
    });

    navigate("/appointments");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng ký khám bệnh
            </h1>
            <p className="text-gray-600">
              Đặt lịch khám cho bé một cách nhanh chóng và tiện lợi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Select Child */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-600" />
                  Chọn bé cần khám
                </CardTitle>
                <CardDescription>
                  Chọn bé trong danh sách hồ sơ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        selectedChild === child.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedChild(child.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{child.name}</h3>
                          <p className="text-sm text-gray-600">
                            {child.age} tuổi • {child.gender}
                          </p>
                        </div>
                        {selectedChild === child.id && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-emerald-600" />
                  Hình thức khám
                </CardTitle>
                <CardDescription>
                  Chọn loại khám phù hợp với nhu cầu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        appointmentType === type.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setAppointmentType(type.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-gray-600">
                            {type.description}
                          </p>
                        </div>
                        {appointmentType === type.id && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specialty Selection */}
            {appointmentType === "specialist" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />
                    Chọn chuyên khoa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedSpecialty}
                    onValueChange={setSelectedSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chuyên khoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Doctor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-600" />
                  Chọn bác sĩ
                </CardTitle>
                <CardDescription>
                  {selectedSpecialty
                    ? `Bác sĩ chuyên khoa ${selectedSpecialty}`
                    : "Danh sách bác sĩ có sẵn"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        selectedDoctor === doctor.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {doctor.experience} năm kinh nghiệm
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-yellow-600">
                                  ★ {doctor.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedDoctor === doctor.id && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Chọn ngày và giờ khám
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Chọn ngày khám</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP", { locale: vi })
                          : "Chọn ngày khám"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) =>
                          date < new Date() || date.getDay() === 0
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Chọn giờ khám</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          type="button"
                          variant={
                            selectedTime === slot.time ? "default" : "outline"
                          }
                          className={cn(
                            "relative",
                            !slot.available && "opacity-50 cursor-not-allowed",
                            selectedTime === slot.time &&
                              "bg-emerald-600 hover:bg-emerald-700"
                          )}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      * Các khung giờ màu xám đã được đặt trước
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú thêm</CardTitle>
                <CardDescription>
                  Mô tả dấu hiệu lâm sàng hoặc lý do khám (không bắt buộc)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Bé bị sốt 2 ngày, ho khan, ăn uống kém..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Đặt lịch khám
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
