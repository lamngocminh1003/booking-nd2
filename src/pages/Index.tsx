import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthStorage } from "@/utils/authStorage";
import logo from "../assets/imgs/logo.png";
import { Calendar, Heart, Stethoscope, Brain, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/redux";
import { RootState } from "@/store";
import { fetchZones } from "@/store/slices/bookingCatalogSlice";
import { fetchBanners } from "@/store/slices/bannerSlice";
import BannerCarousel from "@/components/BannerCarousel";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import GoogleSlidesEmbed from "@/components/GoogleSlidesEmbed"; // ✅ Import new component

const Index = () => {
  const [userLocal, setUserLocal] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getAuthStorage();
      setUserLocal(user);
    };
    checkUser();
  }, [userLocal]);

  const loading = useSelector((state: RootState) => state.auth.loading);
  const navigate = useNavigate();

  const handleAuthClick = (mode: "login" | "register") => {
    if (mode === "login") {
      navigate("/login");
    } else if (mode === "register") {
      navigate("/register");
    }
  };

  // ✅ Add Redux hooks
  const dispatch = useAppDispatch();
  const { zones, loadingZones, error } = useSelector(
    (state: RootState) => state.bookingCatalog
  );
  const { loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // ✅ Add banner state
  const {
    activeBanners,
    loading: loadingBanners,
    error: bannerError,
  } = useSelector((state: RootState) => state.banner);

  // ✅ Fetch zones and banners data on component mount
  useEffect(() => {
    dispatch(fetchZones(true)); // Pass true to get only enabled zones
    dispatch(fetchBanners({ type: "Banner" })); // Fetch banners with type "Banner"
  }, [dispatch]);

  // ✅ Add error handling
  if (error && !zones.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2 sm:px-4">
        <div className="text-center">
          <p className="text-red-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Lỗi tải dữ liệu: {error}
          </p>
          <Button
            onClick={() => dispatch(fetchZones(true))}
            className="text-sm sm:text-base"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2 sm:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 relative">
      {/* ✅ Banner Section */}
      <section className="pt-12 sm:pt-20 pb-4 sm:pb-8 px-1 sm:px-2 lg:px-4">
        <div className="max-w-full mx-auto">
          <BannerCarousel banners={activeBanners} loading={loadingBanners} />
          {bannerError && (
            <div className="mt-2 sm:mt-4 text-center">
              <p className="text-yellow-600 text-xs sm:text-sm">
                Không thể tải banner: {bannerError}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ✅ UPDATED: Hero Section with Background Image */}
      <section
        className="relative pt-4 sm:pt-12 pb-6 sm:pb-10 px-2 sm:px-4 overflow-hidden"
        style={{
          backgroundImage:
            "url(https://benhviennhi.org.vn/assets/1-R8ndWJ4W.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* ✅ Background Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-emerald-50/85 backdrop-blur-[1px]"></div>

        {/* ✅ Alternative overlay for mobile */}
        <div className="absolute inset-0 bg-white/80 sm:bg-transparent"></div>

        {/* ✅ Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="animate-fade-in text-center lg:text-left">
            {/* ✅ Enhanced Badge with better visibility */}
            <Badge className="mb-3 sm:mb-6 bg-white/90 text-emerald-700 hover:bg-white/95 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-lg border border-emerald-200 backdrop-blur-sm">
              <img
                alt="Logo Bệnh Viện Nhi Đồng 2"
                src={logo}
                className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3"
              />
              Hệ thống đăng ký khám bệnh hiện đại - nhanh chóng
            </Badge>

            {/* ✅ Enhanced Headings with better contrast */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-6 leading-tight px-1 sm:px-0">
              <span className="text-gray-900 drop-shadow-sm">
                Bệnh Viện Nhi Đồng 2
              </span>
              <span className="text-emerald-600 block mt-1 sm:mt-2 text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-sm">
                Thân thiện như chính ngôi nhà bạn
              </span>
            </h1>

            {/* ✅ Enhanced Description with background */}
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-8 shadow-lg">
              <p className="text-sm sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                Đặt lịch khám nhanh chóng, quản lý hồ sơ sức khỏe và theo dõi
                lịch sử khám bệnh của bé một cách dễ dàng
              </p>
            </div>

            {/* ✅ Enhanced Buttons */}
            {!userLocal ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center lg:justify-start px-2 sm:px-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl transform"
                  onClick={() => handleAuthClick("register")}
                >
                  🎯 Đăng ký ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/90 backdrop-blur-sm border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => handleAuthClick("login")}
                >
                  👤 Đăng nhập
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center lg:justify-start px-2 sm:px-0">
                <Link to="/booking-flow">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    📅 Đặt lịch khám ngay
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Decorative Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl"></div>
      </section>
      {/* ✅ Existing Zones Section */}
      <section className="py-8 sm:py-20 px-2 sm:px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Các Khu Khám
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Chọn khu khám phù hợp với bạn để đặt lịch khám nhanh chóng và tiện
              lợi.
            </p>
          </div>

          {/* Loading state - Reduced mobile spacing */}
          {loadingZones ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 mb-8 sm:mb-20">
              {[1, 2].map((index) => (
                <Card key={index} className="animate-pulse">
                  <div className="p-3 sm:p-6 bg-gray-200 h-20 sm:h-32"></div>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : zones.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 mb-8 sm:mb-20">
              {zones.map((zone, index) => (
                <Card
                  key={zone.id}
                  className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                >
                  {/* ✅ Zone Header - Reduced mobile padding */}
                  <div
                    className={`p-3 sm:p-6 text-white ${
                      index === 0
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      {zone.name}
                    </h3>
                    <p
                      className={`flex items-start text-sm sm:text-base ${
                        index === 0 ? "text-emerald-50" : "text-blue-50"
                      }`}
                    >
                      <span className="mr-1 sm:mr-2 text-base sm:text-lg">
                        📍
                      </span>
                      <span className="leading-relaxed">{zone.address}</span>
                    </p>
                  </div>

                  {/* ✅ Exam Types Section - Reduced mobile padding */}
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-4">
                      {zone.examTypes && zone.examTypes.length > 0 ? (
                        zone.examTypes.map((examType, examIndex) => (
                          <Link
                            key={examType.id}
                            to={`/booking-flow/${zone.id}/${examType.id}`}
                            className="block"
                          >
                            <div
                              className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-4 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 ${
                                examType.name === "Khám Tâm Lý"
                                  ? "bg-emerald-50 hover:bg-emerald-100"
                                  : examType.name === "Khám Dịch Vụ"
                                  ? "bg-blue-50 hover:bg-blue-100"
                                  : examType.name === "Khám Ưu Tiên"
                                  ? "bg-purple-50 hover:bg-purple-100"
                                  : examType.name === "Khu khám sức khỏe trẻ em"
                                  ? "bg-pink-50 hover:bg-pink-100"
                                  : examType.name === "Khu khám chất lượng cao"
                                  ? "bg-purple-50 hover:bg-purple-100"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              {/* ✅ Icon dựa trên tên examType */}
                              {examType.name === "Khám Tâm Lý" ? (
                                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              ) : examType.name === "Khám Dịch Vụ" ? (
                                <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              ) : examType.name === "Khám Ưu Tiên" ? (
                                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              ) : examType.name ===
                                "Khu khám sức khỏe trẻ em" ? (
                                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-pink-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              ) : examType.name ===
                                "Khu khám chất lượng cao" ? (
                                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              ) : (
                                <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                              )}

                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {examType.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                                  {examType.description}
                                </p>

                                {/* ✅ Service Price Display */}
                                {examType.servicePrice ? (
                                  <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {examType.servicePrice.enable ? (
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          examType.servicePrice.name.includes(
                                            "[CLC]"
                                          )
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-emerald-100 text-emerald-800"
                                        }`}
                                      >
                                        {examType.servicePrice.name.includes(
                                          "[CLC]"
                                        ) && "CLC: "}
                                        {examType.servicePrice.price.toLocaleString(
                                          "vi-VN"
                                        )}
                                        đ
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-100 text-gray-500"
                                      >
                                        {examType.servicePrice.name} - Đang tắt
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-yellow-100 text-yellow-600"
                                  >
                                    Chưa có dịch vụ
                                  </Badge>
                                )}

                                {/* ✅ Status Indicator - Reduced mobile spacing */}
                                <div className="mt-1 sm:mt-2 text-xs text-gray-500 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {examType.servicePrice?.enable
                                      ? "Nhấn để đặt lịch khám"
                                      : "Dịch vụ đang tắt"}
                                  </div>

                                  {examType.appointmentFormName && (
                                    <div className="flex items-center text-blue-500">
                                      <Stethoscope className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">
                                        {examType.appointmentFormName}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* ✅ Service Info */}
                                {examType.servicePrice && (
                                  <div className="mt-0.5 sm:mt-1 text-xs text-gray-400">
                                    Dịch vụ: {examType.servicePrice.name}
                                    {examType.servicePrice.name.includes(
                                      "[CLC]"
                                    ) && (
                                      <span className="ml-1 text-purple-600 font-medium">
                                        (Chất lượng cao)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* ✅ Price Display */}
                              {examType.servicePrice?.enable && (
                                <div className="text-right">
                                  <div className="text-sm sm:text-lg font-bold text-emerald-600">
                                    {examType.servicePrice.price.toLocaleString(
                                      "vi-VN"
                                    )}
                                    đ
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {examType.servicePrice.name.includes(
                                      "[CLC]"
                                    )
                                      ? "CLC"
                                      : "Thường"}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        // ✅ Fallback nếu không có examTypes
                        <Link
                          to={`/booking-flow?zoneId=${zone.id}`}
                          className="block"
                        >
                          <div className="text-center py-3 sm:py-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200">
                            <p className="text-gray-500 text-sm sm:text-base">
                              Nhấn để chọn loại khám
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-12 px-2 sm:px-4">
              <div className="w-12 h-12 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                Chưa có khu khám nào
              </h3>
              <p className="text-gray-500 mb-3 sm:mb-6 text-sm sm:text-base">
                Hiện tại hệ thống chưa có khu khám nào được kích hoạt
              </p>
              <Button
                onClick={() => dispatch(fetchZones(true))}
                variant="outline"
                className="text-sm sm:text-base"
              >
                Thử tải lại
              </Button>
            </div>
          )}
        </div>
      </section>
      {/* Lịch Khám Section */}
      <section className="py-8 sm:py-16 px-2 sm:px-4 lg:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {" "}
          {/* ✅ Reduced max width for better spacing */}
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Lịch Khám Bệnh
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Xem lịch khám chi tiết của các bác sĩ tại hai cơ sở chính của bệnh
              viện
            </p>
          </div>
          {/* ✅ Schedule Stack - Each in separate row */}
          <div className="space-y-8 sm:space-y-12">
            {/* Cơ sở 1 - Full width row */}
            <div className="w-full">
              <GoogleSlidesEmbed
                url="https://docs.google.com/presentation/d/e/2PACX-1vQCJKOQo9RDF6WdQNc99F8HcQ8pw5ZcUyEVUtuPJOLG3Jii0XBfHcnjGxoxyAekQ2DizjntQ9m6hY2f/embed?start=false&loop=false&delayms=3000"
                title="Lịch Khám Cổng 1 - Bệnh viện Nhi Đồng 2"
                location="14 Lý Tự Trọng, Phường Bến Nghé, TP.HCM"
                className="w-full"
              />
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="px-4 py-2 bg-emerald-50 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Cơ sở 2 - Full width row */}
            <div className="w-full">
              <GoogleSlidesEmbed
                url="https://docs.google.com/presentation/d/e/2PACX-1vTtT04PC9Xiq-S4ccHC1mu0T289zPYwmOlB04tkgiaUCaYuKdeDmY96nILScJGrX020Nwo_2Uccan9R/embed?start=false&loop=false&delayms=3000"
                title="Lịch Khám Cổng 1 - Bệnh viện Nhi Đồng 2"
                location="33 Nguyễn Du, Phường Sài Gòn, TP.HCM"
                className="w-full"
              />
            </div>
          </div>
          {/* ✅ Additional Info */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Lưu ý quan trọng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm sm:text-base text-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Lịch có thể thay đổi</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Đặt lịch trước 24h</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Hotline: 19001215</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};

export default Index;
