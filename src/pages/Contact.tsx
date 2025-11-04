import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logo from "../assets/imgs/logo.png";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Send,
  MessageCircle,
  Calendar,
  Users,
  Star,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// ✅ Type definition for statistics data
interface StatisticalData {
  id: number;
  title: string;
  figures: number;
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface StatisticalResponse {
  message: string;
  data: StatisticalData[];
}

const Contact = () => {
  // ✅ Remove form-related state, keep only statistics
  const [statisticsData, setStatisticsData] = useState<StatisticalData[]>([]);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const { toast } = useToast();

  // ✅ Keep existing fetchStatistics useEffect...
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatisticsLoading(true);
        setStatisticsError(null);

        const response = await fetch(
          "https://benhviennhi.org.vn/api/statistical/"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: StatisticalResponse = await response.json();

        if (result.data && Array.isArray(result.data)) {
          // ✅ Get all statistics data, not just top 3
          const sortedData = result.data.sort((a, b) => b.figures - a.figures);
          setStatisticsData(sortedData);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatisticsError("Không thể tải dữ liệu thống kê");

        // ✅ Fallback to default data
        setStatisticsData([
          {
            id: 1,
            title: "bệnh nhân đã khám",
            figures: 10000,
            icon: "",
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
          },
          {
            id: 2,
            title: "bác sĩ chuyên khoa",
            figures: 50,
            icon: "",
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
          },
          {
            id: 3,
            title: "đánh giá trung bình",
            figures: 4.9,
            icon: "",
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
          },
          {
            id: 4,
            title: "ca phẫu thuật mỗi năm",
            figures: 35000,
            icon: "",
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
          },
          {
            id: 5,
            title: "lượt khám mỗi ngày",
            figures: 3400,
            icon: "",
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
          },
        ]);
      } finally {
        setStatisticsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // ✅ Keep existing helper functions...
  const formatNumber = (num: number, title: string) => {
    if (title.includes("đánh giá") || num < 10) {
      return num.toString();
    }

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const getDisplayValue = (num: number, title: string) => {
    const formatted = formatNumber(num, title);

    if (title.includes("đánh giá") || num < 10) {
      return formatted;
    }

    return `${formatted}+`;
  };

  const getStatIcon = (title: string, index: number) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("bệnh nhân") || lowerTitle.includes("khám")) {
      return <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />;
    } else if (
      lowerTitle.includes("bác sĩ") ||
      lowerTitle.includes("tiến sĩ") ||
      lowerTitle.includes("thạc sĩ")
    ) {
      return <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />;
    } else if (
      lowerTitle.includes("đánh giá") ||
      lowerTitle.includes("rating")
    ) {
      return (
        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current" />
      );
    } else if (lowerTitle.includes("phẫu thuật") || lowerTitle.includes("ca")) {
      return <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />;
    } else if (lowerTitle.includes("ghép tạng")) {
      return <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />;
    } else {
      return <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />;
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Tổng đài tư vấn",
      content: "19001215", // ✅ Đã cập nhật
      description: "Bấm phím 1 (Từ 7g00 đến 19g00)",
    },
    {
      icon: Mail,
      title: "Email",
      content: "benhviennhi@benhviennhi.org.vn", // ✅ Đã cập nhật
      description: "Gửi câu hỏi và nhận phản hồi",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: "14, Lý Tự Trọng, Phường Sài Gòn, TP.HCM",
      description: "Cơ sở chính của bệnh viện",
    },
    {
      icon: Globe,
      title: "Website bệnh viện",
      content: "https://www.benhviennhi.org.vn",
      description: "Thứ 2 - Chủ nhật (bao gồm lễ)",
    },
  ];

  const departments = [
    { name: "Khoa Nhi tổng quát", phone: "0123 456 789", hours: "24/7" },
    { name: "Khoa Cấp cứu", phone: "0123 456 790", hours: "24/7" },
    { name: "Khoa Tim mạch nhi", phone: "0123 456 791", hours: "7:00 - 18:00" },
    { name: "Khoa Tiêu hóa nhi", phone: "0123 456 792", hours: "7:00 - 18:00" },
    { name: "Khoa Hô hấp nhi", phone: "0123 456 793", hours: "7:00 - 18:00" },
    {
      name: "Khoa Thần kinh nhi",
      phone: "0123 456 794",
      hours: "7:00 - 18:00",
    },
  ];

  const faqs = [
    {
      question: "Làm sao để đặt lịch khám?",
      answer:
        "Bạn có thể đặt lịch qua website, ứng dụng di động hoặc gọi hotline 1900 1234.",
    },
    {
      question: "Bệnh viện có khám cấp cứu 24/7 không?",
      answer:
        "Có, chúng tôi có khoa cấp cứu hoạt động 24/7 để phục vụ các trường hợp khẩn cấp.",
    },
    {
      question: "Chi phí khám có bao gồm bảo hiểm y tế không?",
      answer:
        "Chúng tôi chấp nhận bảo hiểm y tế và hỗ trợ thanh toán trực tiếp.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* ✅ Hero Section - Responsive */}
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <img
              alt="Logo Bệnh Viện Nhi Đồng 2"
              src={logo}
              className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn về sức khỏe của
              con em
            </p>
          </div>
        </div>
      </div>

      <div className="pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* ✅ Contact Info Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="text-center border-emerald-100 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg text-gray-900">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-emerald-600 font-semibold text-sm sm:text-lg mb-1 break-words">
                    {info.content}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ✅ Main Content - Replace Contact Form with Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ✅ Statistics Section - Now Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-emerald-700">
                    <Users className="w-6 h-6 text-emerald-600" />
                    Thống kê bệnh viện
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-emerald-600">
                    Những con số ấn tượng về hoạt động của bệnh viện
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  {statisticsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin mx-auto mb-4 text-emerald-600" />
                      <p className="text-gray-600 text-base sm:text-lg">
                        Đang tải thống kê...
                      </p>
                    </div>
                  ) : statisticsError ? (
                    <div className="text-center py-12">
                      <p className="text-red-500 text-sm sm:text-base mb-4">
                        {statisticsError}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="h-10 sm:h-12 px-6"
                      >
                        Thử lại
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {statisticsData.map((stat, index) => (
                        <div
                          key={stat.id}
                          className="text-center p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="mb-3 sm:mb-4 flex justify-center">
                            {getStatIcon(stat.title, index)}
                          </div>
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {getDisplayValue(stat.figures, stat.title)}
                          </div>
                          <p className="text-gray-600 text-sm sm:text-base capitalize font-medium">
                            {stat.title}
                          </p>
                          {/* ✅ Add description for better context */}
                          <div className="mt-2 text-xs sm:text-sm text-gray-500">
                            {stat.title.includes("bệnh nhân") &&
                              "Đã được điều trị"}
                            {stat.title.includes("bác sĩ") &&
                              "Chuyên gia giàu kinh nghiệm"}
                            {stat.title.includes("đánh giá") && "Từ bệnh nhân"}
                            {stat.title.includes("phẫu thuật") && "Mỗi năm"}
                            {stat.title.includes("khám") && "Trung bình"}
                            {stat.title.includes("ghép tạng") && "Thành công"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ✅ Additional Statistics Info */}
                  {!statisticsLoading &&
                    !statisticsError &&
                    statisticsData.length > 0 && (
                      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                        <div className="text-center">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Cam kết chất lượng
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="flex items-center justify-center gap-2 text-emerald-600">
                              <Heart className="w-5 h-5" />
                              <span className="text-sm sm:text-base font-medium">
                                Chăm sóc tận tâm
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-blue-600">
                              <Users className="w-5 h-5" />
                              <span className="text-sm sm:text-base font-medium">
                                Đội ngũ chuyên nghiệp
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-yellow-600">
                              <Star className="w-5 h-5 fill-current" />
                              <span className="text-sm sm:text-base font-medium">
                                Dịch vụ chất lượng cao
                              </span>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-4">
                            Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* ✅ Sidebar - Keep existing sidebar content */}
            <div className="lg:col-span-1 order-1 lg:order-2 space-y-4 sm:space-y-6">
              {/* ✅ Quick Booking - Responsive */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-emerald-600 flex items-center gap-2 text-lg sm:text-xl">
                    <Calendar className="w-5 h-5" />
                    Đặt lịch nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-gray-600 text-sm">
                    Đặt lịch khám ngay hôm nay
                  </p>
                  <Link to={`/booking-flow`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 sm:h-11 text-sm sm:text-base">
                      Đặt lịch khám
                    </Button>{" "}
                  </Link>

                  <div className="text-center text-xs sm:text-sm text-gray-500">
                    Hoặc gọi: 19001215 {/* ✅ Đã cập nhật */}
                  </div>
                </CardContent>
              </Card>

              {/* ✅ Quick Contact Form */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-emerald-600 flex items-center gap-2 text-lg sm:text-xl">
                    <MessageCircle className="w-5 h-5" />
                    Liên hệ nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-gray-600 text-sm">
                    Cần hỗ trợ ngay lập tức?
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() => window.open("tel:19001215")}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Gọi ngay
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm"
                      onClick={() =>
                        window.open("mailto:benhviennhi@benhviennhi.org.vn")
                      }
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi email
                    </Button>
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

export default Contact;
