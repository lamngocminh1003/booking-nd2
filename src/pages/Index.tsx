import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthStorage } from "@/utils/authStorage";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary
import { Calendar, Heart, Stethoscope, Brain, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/redux";
import { RootState } from "@/store";
import { fetchZones } from "@/store/slices/bookingCatalogSlice";

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
  }; // ✅ Add Redux hooks
  const dispatch = useAppDispatch();
  const { zones, loadingZones, error } = useSelector(
    (state: RootState) => state.bookingCatalog
  );
  const { loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  // ✅ Fetch zones data on component mount
  useEffect(() => {
    dispatch(fetchZones(true)); // Pass true to get only enabled zones
  }, [dispatch]);

  // ✅ Add error handling
  if (error && !zones.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi tải dữ liệu: {error}</p>
          <Button onClick={() => dispatch(fetchZones(true))}>Thử lại</Button>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Hero Section */}
      <section className="pt-32 pb-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2">
              <img
                alt="Logo Bệnh Viện Nhi Đồng 2"
                src={logo}
                className="w-4 h-4 text-white mr-2 "
              />
              Hệ thống đăng ký khám bệnh hiện đại - nhanh chóng
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bệnh Viện Nhi Đồng 2
              <span className="text-emerald-600 block mt-2">
                Thân thiện như chính ngôi nhà bạn
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Đặt lịch khám nhanh chóng, quản lý hồ sơ sức khỏe và theo dõi lịch
              sử khám bệnh của bé một cách dễ dàng
            </p>
            {!userLocal ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg transition-all duration-300 hover:scale-105"
                  onClick={() => handleAuthClick("register")}
                >
                  {/* <User className="w-5 h-5 mr-2" /> */}
                  Đăng ký ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 text-lg transition-all duration-300"
                  onClick={() => handleAuthClick("login")}
                >
                  Đăng nhập
                </Button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <section className=" px-4 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Các Khu Khám
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Chọn khu khám phù hợp với bạn để đặt lịch khám nhanh chóng và
                  tiện lợi.
                </p>
              </div>

              {/* ✅ Update loading section */}
              {loadingZones ? (
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                  {[1, 2].map((index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="p-6 bg-gray-200 h-32"></div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : zones.length > 0 ? (
                // ✅ Actual zones display
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                  {zones.map((zone, index) => (
                    <Card
                      key={zone.id}
                      className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                    >
                      <div
                        className={`p-6 text-white ${
                          index === 0
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                            : "bg-gradient-to-br from-blue-500 to-indigo-600"
                        }`}
                      >
                        <h3 className="text-2xl font-bold mb-2">{zone.name}</h3>
                        <p
                          className={`flex items-start ${
                            index === 0 ? "text-emerald-50" : "text-blue-50"
                          }`}
                        >
                          <span className="mr-2">📍</span>
                          {zone.address}
                        </p>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {zone.examTypes && zone.examTypes.length > 0 ? (
                            zone.examTypes.map((examType, examIndex) => (
                              <Link
                                key={examType.id}
                                to={`/booking-flow/${zone.id}/${examType.id}`}
                                className="block"
                              >
                                <div
                                  className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 ${
                                    examType.name === "Khám Tâm Lý"
                                      ? "bg-emerald-50 hover:bg-emerald-100"
                                      : examType.name === "Khám Dịch Vụ"
                                      ? "bg-blue-50 hover:bg-blue-100"
                                      : examType.name === "Khám Ưu Tiên"
                                      ? "bg-purple-50 hover:bg-purple-100"
                                      : examType.name ===
                                        "Khu khám sức khỏe trẻ em"
                                      ? "bg-pink-50 hover:bg-pink-100"
                                      : examType.name ===
                                        "Khu khám chất lượng cao"
                                      ? "bg-purple-50 hover:bg-purple-100"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  {/* Icon dựa trên tên examType */}
                                  {examType.name === "Khám Tâm Lý" ? (
                                    <Brain className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                  ) : examType.name === "Khám Dịch Vụ" ? (
                                    <Stethoscope className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                  ) : examType.name === "Khám Ưu Tiên" ? (
                                    <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                  ) : examType.name ===
                                    "Khu khám sức khỏe trẻ em" ? (
                                    <Heart className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                                  ) : examType.name ===
                                    "Khu khám chất lượng cao" ? (
                                    <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                  ) : (
                                    <Stethoscope className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                  )}

                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {examType.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {examType.description}
                                    </p>

                                    {/* ✅ FIXED: Hiển thị giá từ servicePrice (single object) */}
                                    {examType.servicePrice ? (
                                      <div className="flex flex-wrap gap-2">
                                        {/* ✅ Check if service is enabled */}
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
                                            {examType.servicePrice.name} - Đang
                                            tắt
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      // ✅ No service price available
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-yellow-100 text-yellow-600"
                                      >
                                        Chưa có dịch vụ
                                      </Badge>
                                    )}

                                    {/* ✅ Enhanced indicator với thông tin servicePrice */}
                                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {examType.servicePrice?.enable
                                          ? "Nhấn để đặt lịch khám"
                                          : "Dịch vụ đang tắt"}
                                      </div>

                                      {/* ✅ Show appointment form type */}
                                      {examType.appointmentFormName && (
                                        <div className="flex items-center text-blue-500">
                                          <Stethoscope className="w-3 h-3 mr-1" />
                                          {examType.appointmentFormName}
                                        </div>
                                      )}
                                    </div>

                                    {/* ✅ Additional service info */}
                                    {examType.servicePrice && (
                                      <div className="mt-1 text-xs text-gray-400">
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

                                  {/* ✅ Price display on the right */}
                                  {examType.servicePrice?.enable && (
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-emerald-600">
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
                            // Fallback nếu không có examTypes - Link đến zone
                            <Link
                              to={`/booking-flow?zoneId=${zone.id}`}
                              className="block"
                            >
                              <div className="text-center py-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200">
                                <p className="text-gray-500">
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
                // ✅ Empty state
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Chưa có khu khám nào
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Hiện tại hệ thống chưa có khu khám nào được kích hoạt
                  </p>
                  <Button
                    onClick={() => dispatch(fetchZones(true))}
                    variant="outline"
                  >
                    Thử tải lại
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Index;
