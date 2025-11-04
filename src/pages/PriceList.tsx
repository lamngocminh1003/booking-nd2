import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  FileText,
  Download,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Receipt,
  Pill,
  Syringe,
  Bed,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import logo from "../assets/imgs/logo.png";

interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  files: string;
  slug: string;
  isActive: boolean;
  displayTime: string;
  createdAt: string;
  updatedAt: string;
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

const PriceList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 12;

  // ✅ Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://benhviennhi.org.vn/api/post?page=${currentPage}&pageSize=${POSTS_PER_PAGE}&keyword=${searchTerm}&groupCategorySlug=bang-gia-kham-chua-benh&slug=&isActive=true`
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin bảng giá");
        }

        const data: ApiResponse = await response.json();
        console.log(data);

        const postsData = data?.data?.data || [];
        const meta = data?.data?.meta || {
          page: 1,
          pageSize: POSTS_PER_PAGE,
          totalPosts: 0,
        };

        setPosts(postsData);
        setTotalPages(Math.ceil(meta.totalPosts / POSTS_PER_PAGE));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchTerm]);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ✅ Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    // Remove HTML tags
    let plainText = text.replace(/<[^>]*>/g, "");

    // Decode HTML entities
    const textarea = document.createElement("textarea");
    textarea.innerHTML = plainText;
    plainText = textarea.value;

    // Clean up extra whitespace
    plainText = plainText.replace(/\s+/g, " ").trim();

    if (plainText.length <= maxLength) return plainText;

    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  };

  const getPriceIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("thuốc")) {
      return <Pill className="w-5 h-5 text-blue-600" />;
    }
    if (lowerTitle.includes("vắc-xin") || lowerTitle.includes("vaccine")) {
      return <Syringe className="w-5 h-5 text-green-600" />;
    }
    if (lowerTitle.includes("giường") || lowerTitle.includes("phòng")) {
      return <Bed className="w-5 h-5 text-purple-600" />;
    }
    if (lowerTitle.includes("viện phí") || lowerTitle.includes("dịch vụ")) {
      return <Receipt className="w-5 h-5 text-emerald-600" />;
    }
    if (lowerTitle.includes("vật tư")) {
      return <FileCheck className="w-5 h-5 text-orange-600" />;
    }
    return <DollarSign className="w-5 h-5 text-gray-600" />;
  };

  const getFiles = (filesString: string) => {
    try {
      return JSON.parse(filesString) as string[];
    } catch {
      return [];
    }
  };

  // ✅ Pagination Controls Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
            let pageIndex;
            if (totalPages <= 5) {
              pageIndex = index + 1;
            } else {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + 4);
              const adjustedStart = Math.max(1, end - 4);
              pageIndex = adjustedStart + index;
            }

            return (
              <Button
                key={pageIndex}
                variant={currentPage === pageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageIndex)}
                className={`w-10 h-8 p-0 text-sm ${
                  currentPage === pageIndex
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {pageIndex}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
        >
          Tiếp
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  // ✅ Price Card Component
  const PriceCard = ({ post }: { post: Post }) => {
    const files = getFiles(post.files);

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 h-full flex flex-col">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={
              post.thumbnail
                ? `https://benhviennhi.org.vn${post.thumbnail}`
                : logo
            }
            alt={post.title}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = logo;
            }}
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-emerald-100/90  shadow-md backdrop-blur-sm hover:text-gray-900"
            >
              {getPriceIcon(post.title)}
              <span className="ml-1 hover:text-gray-900">Bảng giá</span>
            </Badge>
          </div>
          {files.length > 0 && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className="bg-blue-100/90 text-gray-900 shadow-md backdrop-blur-sm"
              >
                <Download className="w-3 h-3 mr-1" />
                {files.length} file
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="flex-1 p-4">
          <CardTitle className="text-lg text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight mb-2">
            <div
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.4",
              }}
            >
              {post.title}
            </div>
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm leading-relaxed">
            <div
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.5",
              }}
            >
              {truncateText(post.content, 140)}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 p-4">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Ngày đăng: {formatDate(post.displayTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Cập nhật: {formatDate(post.updatedAt)}</span>
            </div>
          </div>

          {/* Download Files */}
          {files.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Tài liệu đính kèm:
              </p>
              <div className="flex flex-wrap gap-1">
                {files.slice(0, 2).map((file, index) => (
                  <a
                    key={index}
                    href={`https://benhviennhi.org.vn${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    PDF {index + 1}
                  </a>
                ))}
                {files.length > 2 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{files.length - 2} file khác
                  </span>
                )}
              </div>
            </div>
          )}

          <a
            href={`https://benhviennhi.org.vn/kham-chua-benh/bang-gia-kham-chua-benh/${post.slug}?page=1`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 group-hover:shadow-md transition-all text-sm py-2">
              Xem chi tiết
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  };

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
                  Đang tải thông tin bảng giá...
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
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Không thể tải dữ liệu
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img
              alt="Logo Bệnh Viện Nhi Đồng 2"
              src={logo}
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bảng Giá Khám Chữa Bệnh
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thông tin chi tiết về giá dịch vụ y tế, thuốc, vắc-xin và các chi
              phí khám chữa bệnh tại Bệnh viện Nhi Đồng 2
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bảng giá..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm("")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm
                  ? `Kết quả tìm kiếm: "${searchTerm}"`
                  : "Tất cả bảng giá"}
              </h2>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {posts.length} bảng giá
              </Badge>
            </div>
            {currentPage > 1 && (
              <p className="text-gray-600 mt-2">
                Trang {currentPage} / {totalPages}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {posts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <PriceCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              <PaginationControls />
            </>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                Không tìm thấy kết quả
              </h4>
              <p className="text-gray-500">
                {searchTerm
                  ? "Thử thay đổi từ khóa tìm kiếm"
                  : "Hiện tại chưa có bảng giá nào"}
              </p>
            </div>
          )}

          {/* Quick Categories */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Danh mục bảng giá
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className="text-center p-6 bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSearchTerm("thuốc")}
              >
                <Pill className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Giá thuốc
                </h4>
                <p className="text-blue-600 text-sm">
                  Bảng giá thuốc trong và ngoài trú
                </p>
              </Card>

              <Card
                className="text-center p-6 bg-green-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSearchTerm("vắc-xin")}
              >
                <Syringe className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800 mb-2">
                  Giá vắc-xin
                </h4>
                <p className="text-green-600 text-sm">
                  Bảng giá các loại vắc-xin
                </p>
              </Card>

              <Card
                className="text-center p-6 bg-purple-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSearchTerm("giường")}
              >
                <Bed className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h4 className="text-lg font-semibold text-purple-800 mb-2">
                  Giá giường bệnh
                </h4>
                <p className="text-purple-600 text-sm">
                  Chi phí giường và phòng bệnh
                </p>
              </Card>

              <Card
                className="text-center p-6 bg-emerald-50 border-emerald-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSearchTerm("viện phí")}
              >
                <Receipt className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                <h4 className="text-lg font-semibold text-emerald-800 mb-2">
                  Viện phí
                </h4>
                <p className="text-emerald-600 text-sm">
                  Giá dịch vụ khám chữa bệnh
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceList;
