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
import {
  Heart,
  ArrowLeft,
  Clock,
  Star,
  Calendar,
  Shield,
  Users,
  Award,
  CheckCircle,
} from "lucide-react";

const ServiceDetail = () => {
  const { id } = useParams();

  // Mock data - would normally fetch from API
  const service = {
    id: parseInt(id || "1"),
    name: "Khám tổng quát",
    description:
      "Khám sức khỏe tổng quát định kỳ cho trẻ em với đội ngũ bác sĩ giàu kinh nghiệm",
    fullDescription:
      "Dịch vụ khám tổng quát cho trẻ em tại bệnh viện chúng tôi bao gồm việc kiểm tra sức khỏe toàn diện từ đầu đến chân. Đội ngũ bác sĩ nhi khoa giàu kinh nghiệm sẽ thực hiện các xét nghiệm cần thiết để đánh giá tình trạng sức khỏe tổng thể của bé.",
    price: "200,000 VNĐ",
    duration: "30 phút",
    rating: 4.8,
    reviews: 124,
    category: "Khám tổng quát",
    image: "👶",
    benefits: [
      "Kiểm tra sức khỏe toàn diện",
      "Phát hiện sớm các vấn đề sức khỏe",
      "Tư vấn dinh dưỡng phù hợp",
      "Lập kế hoạch chăm sóc sức khỏe",
      "Theo dõi phát triển của trẻ",
    ],
    process: [
      "Đăng ký thông tin và đặt lịch hẹn",
      "Tiếp nhận và làm thủ tục khám",
      "Bác sĩ thăm khám và tư vấn",
      "Thực hiện các xét nghiệm cần thiết",
      "Nhận kết quả và lời khuyên từ bác sĩ",
    ],
    preparation: [
      "Mang theo giấy tờ tùy thân",
      "Chuẩn bị sổ tiêm chủng (nếu có)",
      "Cho trẻ ăn sáng nhẹ trước khi khám",
      "Mang theo danh sách thuốc đang sử dụng",
      "Chuẩn bị câu hỏi muốn tư vấn với bác sĩ",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/services">
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại dịch vụ
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-6xl">{service.image}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-3xl text-gray-900">
                          {service.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="border-emerald-200 text-emerald-600 text-lg px-3 py-1"
                        >
                          {service.price}
                        </Badge>
                      </div>
                      <CardDescription className="text-lg text-gray-600 mb-4">
                        {service.description}
                      </CardDescription>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {service.rating} ({service.reviews} đánh giá)
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {service.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    Mô tả chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {service.fullDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Lợi ích của dịch vụ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    Quy trình thực hiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {service.process.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preparation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Chuẩn bị trước khi khám
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {service.preparation.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {service.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      Thời gian: {service.duration}
                    </div>
                  </div>
                  <Link to="/book-appointment">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch ngay
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
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">Hotline</div>
                    <div className="text-emerald-600">1900 1234</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-emerald-600">info@benhviennhi.vn</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Giờ làm việc
                    </div>
                    <div className="text-gray-600">
                      7:00 - 18:00 (Thứ 2 - Chủ nhật)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
