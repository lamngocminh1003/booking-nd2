import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-emerald-600 mb-2">404</h1>
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-emerald-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Trang không tìm thấy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
              chuyển. Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>

            <Button
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang trước
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Cần hỗ trợ? Liên hệ với chúng tôi qua
              <a
                href="tel:1900123456"
                className="text-emerald-600 hover:underline"
              >
                1900 123 456
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
