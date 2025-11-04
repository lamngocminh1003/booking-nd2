import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  Star,
  Clock,
  ArrowRight,
  Calendar,
  Stethoscope,
  Activity,
  Users,
  MapPin,
  Phone,
  Loader2,
  ExternalLink,
} from "lucide-react";
import logo from "../assets/imgs/logo.png";
import blouseImg from "../assets/imgs/blouse.png";

// ✅ Add type definitions for statistics
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

interface Service {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  displayTime: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  meseage: string;
  data: {
    data: Service[];
    meta: {
      page: number;
      pageSize: number;
      totalPosts: number;
    };
  };
}

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // ✅ Add statistics state
  const [statisticsData, setStatisticsData] = useState<StatisticalData[]>([]);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
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

  // ✅ Fetch services from API
  const fetchServices = async (page: number = 1, keyword: string = "") => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://benhviennhi.org.vn/api/post?page=${page}&pageSize=18&keyword=${encodeURIComponent(
          keyword
        )}&groupCategorySlug=dich-vu-noi-bat&slug=&isActive=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      setServices(data.data.data);
      setTotalPages(
        Math.ceil(data.data.meta.totalPosts / data.data.meta.pageSize)
      );
      setCurrentPage(data.data.meta.page);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
      );
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1, searchTerm);
    fetchStatistics(); // ✅ Fetch statistics on component mount
  }, []);
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

  // ✅ Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchServices(1, value);
  };

  // ✅ Handle pagination
  const handlePageChange = (page: number) => {
    fetchServices(page, searchTerm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Extract text from HTML content
  const extractTextFromHtml = (html: string, maxLength: number = 150) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* ✅ Enhanced Hero Section - Mobile Optimized */}
      <section className="relative pt-16 pb-12 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-24 w-40 h-40 bg-teal-200 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-200 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Logo and Title - Mobile Optimized */}
          <div className="mb-6 sm:mb-8"></div>

          {/* Search Section - Mobile Optimized */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm dịch vụ y tế..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 text-sm sm:text-base border-2 border-emerald-200 focus:border-emerald-500 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg"
              />
            </div>
          </div>

          <div>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={blouseImg}
                  alt="Medical Background"
                  className="w-full h-full object-cover"
                />
                {/* Multiple overlay layers for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 via-teal-800/80 to-green-900/85"></div>
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-20 w-24 h-24 bg-teal-200/15 rounded-full blur-xl animate-bounce"></div>
              </div>

              {/* Content - Mobile Optimized */}
              <div className="relative z-10 p-4 sm:p-8 lg:p-12">
                {/* Header - Mobile Optimized */}
                <div className="text-center mb-6 sm:mb-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-xs sm:text-sm font-medium">
                      Thống kê trực tiếp
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-xl lg:text-xl font-black text-white mb-3">
                    <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                      Những con số ấn tượng
                    </span>
                  </h2>

                  <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Minh chứng cho chất lượng dịch vụ và sự tin tưởng của bệnh
                    nhân
                  </p>
                </div>

                {/* Statistics Content - Mobile Optimized */}
                {statisticsLoading ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-teal-300 rounded-full animate-spin mx-auto mt-1"></div>
                    </div>
                    <p className="text-white/80 text-sm sm:text-base font-medium">
                      Đang tải thống kê...
                    </p>
                    <div className="flex justify-center mt-3 space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                ) : statisticsError ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" />
                    </div>
                    <p className="text-red-200 text-xs sm:text-sm mb-4 max-w-md mx-auto">
                      {statisticsError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={fetchStatistics}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm text-sm px-4 py-2"
                    >
                      <Activity className="w-3 h-3 mr-2" />
                      Thử lại
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                      {statisticsData.slice(0, 5).map((stat, index) => (
                        <div
                          key={stat.id}
                          className="group relative"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          {/* Card - Mobile Optimized */}
                          <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/20 hover:bg-white hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-bl-xl rounded-tr-xl opacity-80"></div>

                            {/* Icon - Mobile Optimized */}
                            <div className="flex justify-center mb-2 sm:mb-3">
                              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {getStatIcon(stat.title, index)}
                              </div>
                            </div>

                            {/* Number - Mobile Optimized */}
                            <div className="text-center mb-1">
                              <div className="text-lg sm:text-xl lg:text-xl font-black bg-gradient-to-br from-emerald-700 via-teal-600 to-green-700 bg-clip-text text-transparent mb-1">
                                {getDisplayValue(stat.figures, stat.title)}
                              </div>
                            </div>

                            {/* Title - Mobile Optimized */}
                            <p className="text-gray-700 text-xs capitalize font-semibold text-center leading-tight">
                              {stat.title}
                            </p>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>

                          {/* Floating particles on hover */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Services Grid Section - Mobile Optimized */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State - Mobile Optimized */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            /* Error State - Mobile Optimized */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                Có lỗi xảy ra
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                {error}
              </p>
              <Button
                onClick={() => fetchServices(1, searchTerm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-sm px-4 py-2"
              >
                <Activity className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : services.length === 0 ? (
            /* Empty State - Mobile Optimized */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                Không tìm thấy dịch vụ nào
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc
              </p>
              <Button
                variant="outline"
                onClick={() => handleSearch("")}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm px-4 py-2"
              >
                Xem tất cả dịch vụ
              </Button>
            </div>
          ) : (
            /* Services Grid - Mobile Optimized */
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map((service, index) => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Service Image - Mobile Optimized */}
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={`https://benhviennhi.org.vn${service.thumbnail}`}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkThu4tjaCB24bulPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-base sm:text-md text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {extractTextFromHtml(service.content)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <div className="space-y-3">
                        {/* Meta Info - Mobile Optimized */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(service.displayTime)}
                          </div>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex">
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 group/btn text-sm py-2"
                            onClick={() =>
                              window.open(
                                `https://benhviennhi.org.vn/kham-chua-benh/dich-vu-noi-bat/${service.slug}?page=1`,
                                "_blank"
                              )
                            }
                          >
                            Xem chi tiết
                            <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ✅ Pagination - Mobile Optimized */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm px-3 py-1.5"
                  >
                    Trước
                  </Button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => handlePageChange(page)}
                            className={
                              currentPage === page
                                ? "bg-emerald-600 hover:bg-emerald-700 text-sm px-3 py-1.5"
                                : "border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm px-3 py-1.5"
                            }
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-sm">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm px-3 py-1.5"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ✅ CTA Section - Mobile Optimized */}
      <section className="py-12 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-xl md:text-xl font-bold text-white mb-3 sm:mb-4">
            Cần tư vấn thêm về dịch vụ?
          </h2>
          <p className="text-sm sm:text-lg text-emerald-100 mb-4 sm:mb-6">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-emerald-700 border-white hover:bg-emerald-50 hover:text-emerald-500 px-6 py-3 text-sm sm:text-base font-semibold"
            >
              <Phone className="w-4 h-4 mr-2" />
              Gọi ngay: 1900 1215
            </Button>

            <Link to="/booking-flow">
              <Button
                size="lg"
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 text-sm sm:text-base font-semibold shadow-xl w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Đặt lịch khám
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
