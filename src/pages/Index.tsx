import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthStorage } from "@/utils/authStorage";
import logo from "../assets/imgs/logo.png"; // Adjust the path as necessary

import {
  Calendar,
  Heart,
  Stethoscope,
  Activity,
  TestTube,
  Brain,
  Scissors,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // path đến store của bạn
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
      <section className="pt-32 pb-20 px-4">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/book-appointment">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Đặt lịch khám ngay
                  </Button>
                </Link>
                <Link to="/children">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 py-3 text-lg transition-all duration-300 w-full sm:w-auto"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Khám cho trẻ em
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khám bệnh dễ dàng, an tâm chọn lựa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Với các dịch vụ chất lượng cao từ đội ngũ y bác sĩ chuyên môn
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🩺 Khám Chuyên Khoa
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Tư vấn & chẩn đoán từ đội ngũ bác sĩ chuyên môn cao thuộc
                  nhiều chuyên khoa khác nhau.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🩹 Khám Tổng Quát
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Tầm soát sức khỏe định kỳ, phát hiện sớm nguy cơ bệnh lý để
                  kịp thời điều trị.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <TestTube className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🧪 Xét Nghiệm Y Học
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Đa dạng dịch vụ xét nghiệm chính xác, nhanh chóng – hỗ trợ
                  chẩn đoán hiệu quả.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🧠 Sức Khỏe Tinh Thần
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Hỗ trợ tâm lý – tư vấn & điều trị các vấn đề liên quan đến sức
                  khỏe tinh thần.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🦷 Khám Nha Khoa
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Dịch vụ chăm sóc răng miệng toàn diện – từ thẩm mỹ đến điều
                  trị chuyên sâu.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Scissors className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900 text-xl">
                  🔪 Gói Phẫu Thuật
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Tư vấn, lên kế hoạch và thực hiện các ca phẫu thuật theo chuẩn
                  y khoa hiện đại.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 text-lg transition-all duration-300"
              >
                Xem tất cả dịch vụ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
