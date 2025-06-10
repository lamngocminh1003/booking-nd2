import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Shield, Heart, Star } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store"; // path đến store của bạn
import {
  setAuthUser,
  clearAuthUser,
  setAuthLoading,
} from "@/store/slices/authSlice";
const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const loading = useSelector((state: RootState) => state.auth.loading);

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  const handleLogin = (user: User, token: string) => {
    dispatch(setAuthUser({ user, token }));
  };
  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          dispatch(setAuthUser({ user, token: idToken }));
        } catch (error) {
          console.error("Error getting ID token:", error);
          dispatch(clearAuthUser());
        }
      } else {
        dispatch(clearAuthUser());
      }
      dispatch(setAuthLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);
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
              <Heart className="w-4 h-4 mr-2" />
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hệ thống quản lý khám bệnh toàn diện, mang lại trải nghiệm tốt
              nhất cho phụ huynh
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">
                  Đặt lịch dễ dàng
                </CardTitle>
                <CardDescription>
                  Chọn bác sĩ, thời gian khám phù hợp chỉ với vài thao tác đơn
                  giản
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">
                  Bảo mật thông tin
                </CardTitle>
                <CardDescription>
                  Hồ sơ sức khỏe của bé được bảo vệ với công nghệ mã hóa hiện
                  đại
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">
                  Theo dõi lịch hẹn
                </CardTitle>
                <CardDescription>
                  Nhận thông báo nhắc nhở và quản lý lịch khám một cách khoa học
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">
                  Đội ngũ chuyên môn
                </CardTitle>
                <CardDescription>
                  Bác sĩ nhi khoa giàu kinh nghiệm, tận tâm chăm sóc sức khỏe
                  trẻ em
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-900">Đánh giá cao</CardTitle>
                <CardDescription>
                  Được hàng nghìn phụ huynh tin tưởng và đánh giá 5 sao
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  {/* <User className="w-6 h-6 text-emerald-600" /> */}
                </div>
                <CardTitle className="text-emerald-900">Hỗ trợ 24/7</CardTitle>
                <CardDescription>
                  Đội ngũ hỗ trợ khách hàng sẵn sàng giải đáp mọi thắc mắc
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bắt đầu chăm sóc sức khỏe bé ngay hôm nay
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Đăng ký tài khoản miễn phí và trải nghiệm dịch vụ y tế hiện đại
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3 text-lg transition-all duration-300 hover:scale-105"
            onClick={() => handleAuthClick("register")}
          >
            Đăng ký miễn phí
          </Button>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
