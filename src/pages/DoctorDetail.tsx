import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Award,
  GraduationCap,
  Clock,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";

const DoctorDetail = () => {
  const { id } = useParams();

  // Mock data - would normally fetch from API
  const doctor = {
    id: parseInt(id || "1"),
    name: "Bác sĩ Nguyễn Thị Mai",
    title: "Tiến sĩ, Bác sĩ chuyên khoa II",
    specialty: "Nhi khoa tổng quát",
    experience: 15,
    rating: 4.9,
    reviews: 234,
    hospital: "Bệnh viện Nhi Trung ương",
    description:
      "Chuyên gia hàng đầu về nhi khoa với hơn 15 năm kinh nghiệm trong việc chăm sóc và điều trị các bệnh lý ở trẻ em. Bác sĩ Mai đã từng đào tạo tại nhiều bệnh viện lớn và có chứng chỉ chuyên khoa quốc tế.",
    availability: "Thứ 2, 4, 6",
    workingHours: "8:00 - 17:00",
    phone: "0123 456 789",
    email: "bs.mai@benhviennhi.vn",
    education: [
      "Tiến sĩ Y khoa - Đại học Y Hà Nội (2008)",
      "Bác sĩ chuyên khoa II Nhi khoa - Đại học Y Hà Nội (2012)",
      "Chứng chỉ Nhi khoa quốc tế - Johns Hopkins (2015)",
    ],
    achievements: [
      "Bác sĩ xuất sắc năm 2020, 2021, 2022",
      "Giải thưởng nghiên cứu khoa học xuất sắc",
      "Chứng nhận ISO 9001:2015 về chất lượng khám chữa bệnh",
      "Thành viên Hội Nhi khoa Việt Nam",
    ],
    specializations: [
      "Khám sức khỏe định kỳ cho trẻ em",
      "Điều trị các bệnh nhiễm trùng ở trẻ",
      "Tư vấn dinh dưỡng và phát triển",
      "Tiêm chủng và phòng ngừa bệnh",
      "Chăm sóc trẻ sơ sinh và trẻ nhỏ",
    ],
    schedule: [
      { day: "Thứ 2", time: "8:00 - 12:00, 13:30 - 17:00" },
      { day: "Thứ 4", time: "8:00 - 12:00, 13:30 - 17:00" },
      { day: "Thứ 6", time: "8:00 - 12:00, 13:30 - 17:00" },
      { day: "Chủ nhật", time: "8:00 - 12:00 (theo lịch hẹn)" },
    ],
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return (
      parts[parts.length - 2]?.charAt(0) + parts[parts.length - 1]?.charAt(0) ||
      "BS"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/doctors">
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách bác sĩ
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Doctor Header */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-600">
                        {getInitials(doctor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-3xl text-gray-900 mb-2">
                        {doctor.name}
                      </CardTitle>
                      <CardDescription className="text-lg text-emerald-600 font-medium mb-3">
                        {doctor.title}
                      </CardDescription>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 mb-4"
                      >
                        {doctor.specialty}
                      </Badge>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {doctor.experience} năm kinh nghiệm
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {doctor.rating} ({doctor.reviews} đánh giá)
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {doctor.hospital}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {doctor.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    Học vấn và Chứng chỉ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doctor.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{edu}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    Chuyên môn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {doctor.specializations.map((spec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Thành tích và Giải thưởng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doctor.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Lịch làm việc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doctor.schedule.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-900">
                          {schedule.day}
                        </span>
                        <span className="text-emerald-600">
                          {schedule.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-center text-emerald-600">
                    Đặt lịch khám
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-500">
                      Phí khám dự kiến
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      200,000 VNĐ
                    </div>
                    <div className="text-sm text-gray-500">
                      Thời gian khám: 30 phút
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Lịch khám: {doctor.availability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Giờ làm việc: {doctor.workingHours}</span>
                    </div>
                  </div>

                  <Link to="/book-appointment">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch khám
                    </Button>
                  </Link>

                  <div className="text-center text-sm text-gray-500">
                    Miễn phí hủy lịch trong 24h
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-600">
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Điện thoại
                      </div>
                      <div className="text-emerald-600">{doctor.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-emerald-600">{doctor.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">Địa điểm</div>
                      <div className="text-gray-600">{doctor.hospital}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-600">
                    Hành động nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600"
                  >
                    Xem đánh giá của bệnh nhân
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600"
                  >
                    Chia sẻ hồ sơ bác sĩ
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600"
                  >
                    Lưu vào danh sách yêu thích
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
