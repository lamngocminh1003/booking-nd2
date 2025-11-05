import React, { useState, useEffect } from "react";
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
  Phone,
  Mail,
  MapPin,
  Activity,
  Loader2,
  Filter,
  X,
} from "lucide-react";

// ✅ Interface definitions
interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  isActive: boolean;
  authorId: number;
  groupId: number;
  postCategory: string;
  displayTime: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ApiResponse {
  meseage: string;
  data: {
    data: Post[];
    meta: {
      page: number;
      pageSize: number;
      totalPosts: number;
    };
  };
}

// ✅ Filter type
type FilterType =
  | "all"
  | "SurgicalSpecialty"
  | "InternalMedicine"
  | "ClinicalMedicine";

const ServiceDetail = () => {
  const [services, setServices] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // ✅ Group services by category
  const groupedServices = {
    SurgicalSpecialty: services.filter(
      (service) => service.postCategory === "SurgicalSpecialty"
    ),
    InternalMedicine: services.filter(
      (service) => service.postCategory === "InternalMedicine"
    ),
    ClinicalMedicine: services.filter(
      (service) => service.postCategory === "ClinicalMedicine"
    ),
  };

  // ✅ Filter configuration
  const filterOptions = [
    {
      key: "all" as FilterType,
      label: "Tất cả chuyên khoa",
      icon: <Award className="w-5 h-5" />,
      count: services.length,
      color: "bg-gray-600 hover:bg-gray-700",
      borderColor: "border-gray-600",
    },
    {
      key: "SurgicalSpecialty" as FilterType,
      label: "Chuyên khoa Ngoại",
      icon: <Activity className="w-5 h-5" />,
      count: groupedServices.SurgicalSpecialty.length,
      color: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-600",
    },
    {
      key: "InternalMedicine" as FilterType,
      label: "Chuyên khoa Nội",
      icon: <Heart className="w-5 h-5" />,
      count: groupedServices.InternalMedicine.length,
      color: "bg-emerald-600 hover:bg-emerald-700",
      borderColor: "border-emerald-600",
    },
    {
      key: "ClinicalMedicine" as FilterType,
      label: "Cận lâm sàng",
      icon: <Shield className="w-5 h-5" />,
      count: groupedServices.ClinicalMedicine.length,
      color: "bg-purple-600 hover:bg-purple-700",
      borderColor: "border-purple-600",
    },
  ];

  // ✅ Get filtered services
  const getFilteredServices = (): Post[] => {
    if (activeFilter === "all") return services;
    return services.filter((service) => service.postCategory === activeFilter);
  };

  // ✅ Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://benhviennhi.org.vn/api/post?page=1&pageSize=50&keyword=&groupCategorySlug=cac-chuyen-khoa&slug=&isActive=true`
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin chuyên khoa");
        }

        const data: ApiResponse = await response.json();

        const servicesData = data?.data?.data || [];
        setServices(servicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ✅ Helper function to extract text from HTML
  const extractTextFromHtml = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // ✅ Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "InternalMedicine":
        return <Heart className="w-5 h-5 text-emerald-600" />;
      case "SurgicalSpecialty":
        return <Activity className="w-5 h-5 text-blue-600" />;
      case "ClinicalMedicine":
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <Award className="w-5 h-5 text-gray-600" />;
    }
  };

  // ✅ Get category name
  const getCategoryName = (category: string): string => {
    switch (category) {
      case "InternalMedicine":
        return "Nội khoa";
      case "SurgicalSpecialty":
        return "Ngoại khoa";
      case "ClinicalMedicine":
        return "Cận lâm sàng";
      default:
        return "Chuyên khoa";
    }
  };

  // ✅ Filter Button Component
  const FilterButton = ({ option }: { option: (typeof filterOptions)[0] }) => {
    const isActive = activeFilter === option.key;

    return (
      <Button
        onClick={() => setActiveFilter(option.key)}
        variant={isActive ? "default" : "outline"}
        className={`
          flex items-center gap-2 transition-all duration-300
          ${
            isActive
              ? `${option.color} text-white shadow-lg`
              : `hover:${option.color} hover:text-white ${option.borderColor}`
          }
        `}
      >
        {option.icon}
        <span className="font-medium">{option.label}</span>
        <Badge
          variant="secondary"
          className={`ml-1 ${
            isActive ? "bg-white/20 text-white" : "bg-gray-100"
          }`}
        >
          {option.count}
        </Badge>
      </Button>
    );
  };

  // ✅ Service Card Component
  const ServiceCard = ({ service }: { service: Post }) => (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
      {/* Service Image */}
      {service.thumbnail && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={`https://benhviennhi.org.vn${service.thumbnail}`}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(service.postCategory)}
            <Badge
              variant="outline"
              className="border-emerald-200 text-emerald-600 text-xs"
            >
              {getCategoryName(service.postCategory)}
            </Badge>
          </div>
        </div>

        <CardTitle className="text-lg text-gray-900 leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {service.title}
        </CardTitle>

        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {extractTextFromHtml(service.content).substring(0, 150)}...
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(service.updatedAt)}
          </div>
        </div>

        <div className="space-y-2">
          <a
            href={`https://benhviennhi.org.vn/kham-chua-benh/cac-chuyen-khoa/${service.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm">
              <Heart className="w-4 h-4 mr-2" />
              Xem chi tiết
            </Button>
          </a>
          <Link to="/booking-flow" className="block">
            <Button
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-500 text-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Đặt lịch khám
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600 text-lg">
                  Đang tải thông tin chuyên khoa...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Không thể tải dữ liệu
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredServices = getFilteredServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* ✅ Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Danh sách chuyên khoa
            </h1>
            <p className="text-gray-600 text-lg">
              Tìm hiểu về các chuyên khoa tại bệnh viện
            </p>
          </div>

          {/* ✅ Filter Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Lọc chuyên khoa
              </h3>
              {activeFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilter("all")}
                  className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <FilterButton key={option.key} option={option} />
              ))}
            </div>
          </div>

          {/* ✅ Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeFilter === "all"
                  ? "Tất cả chuyên khoa"
                  : filterOptions.find((opt) => opt.key === activeFilter)
                      ?.label}
              </h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {filteredServices.length} kết quả
              </Badge>
            </div>
          </div>

          {/* ✅ Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Không có dữ liệu
              </h2>
              <p className="text-gray-600">
                Không có chuyên khoa nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          )}

          {/* ✅ Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 bg-blue-50 border-blue-200">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900">
                {groupedServices.SurgicalSpecialty.length}
              </h3>
              <p className="text-blue-700">Chuyên khoa Ngoại</p>
            </Card>

            <Card className="text-center p-6 bg-emerald-50 border-emerald-200">
              <Heart className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-900">
                {groupedServices.InternalMedicine.length}
              </h3>
              <p className="text-emerald-700">Chuyên khoa Nội</p>
            </Card>

            <Card className="text-center p-6 bg-purple-50 border-purple-200">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-900">
                {groupedServices.ClinicalMedicine.length}
              </h3>
              <p className="text-purple-700">Cận lâm sàng</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
