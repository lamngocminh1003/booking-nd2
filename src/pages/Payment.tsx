import { useState, useEffect, useRef } from "react"; // ✅ Thêm useEffect và useRef
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ArrowLeft,
  Receipt,
  Download,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // ✅ Sửa useEffect để scroll lên đầu trang trước, sau đó scroll đến QR
  useEffect(() => {
    // Scroll lên đầu trang ngay lập tức
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Sau đó delay một chút rồi scroll đến QR code
    const timer = setTimeout(() => {
      if (qrCodeRef.current) {
        qrCodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 500); // Tăng delay để người dùng thấy rõ việc scroll lên đầu

    return () => clearTimeout(timer);
  }, []);

  const appointmentDetails = {
    childName: "Nguyễn Hoàng An",
    doctorName: "BS. Trần Văn Nam",
    specialty: "Nhi khoa tổng quát",
    date: "2024-06-15",
    time: "09:00",
    location: "Phòng 201, Tầng 2",
  };

  const feeBreakdown = {
    consultation: 150000,
    service: 50000,
    insurance: -100000,
  };

  const totalAmount = Object.values(feeBreakdown).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const paymentQRData = `VNPAY://PAY?amount=${totalAmount}&ref=APPOINTMENT_${Date.now()}&description=Thanh+toan+kham+benh`;

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Thanh toán thành công!",
        description:
          "Lịch khám đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ.",
      });
      navigate("/exam-receipt");
    }, 2000);
  };

  const handlePayLater = () => {
    toast({
      title: "Đặt lịch thành công!",
      description: "Vui lòng thanh toán tại bệnh viện khi đến khám.",
    });
    navigate("/exam-receipt");
  };

  const downloadQR = () => {
    const svg = document.getElementById("payment-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `ma-thanh-toan-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "Tải xuống thành công!",
        description: "Mã QR đã được lưu vào thiết bị của bạn.",
      });
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/book-appointment")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán
            </h1>
            <p className="text-gray-600">
              Hoàn tất đặt lịch khám với thanh toán an toàn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* QR Code Payment */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center text-emerald-700">
                    <Smartphone className="w-6 h-6 mr-3" />
                    Thanh toán bằng mã QR
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center space-y-6">
                    {/* QR Code - ✅ Thêm ref vào đây */}
                    <div className="relative" ref={qrCodeRef}>
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl" />
                      <div className="relative bg-white p-8 rounded-2xl shadow-2xl border-4 border-emerald-100">
                        <QRCode
                          id="payment-qr-code"
                          value={paymentQRData}
                          size={280}
                          level="H"
                          style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center space-y-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-4 rounded-xl border border-emerald-200">
                      <p className="text-sm text-gray-600 font-medium">
                        Số tiền thanh toán
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="w-full max-w-md space-y-4 bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                          i
                        </span>
                        Hướng dẫn thanh toán
                      </h4>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                            1
                          </span>
                          <span>
                            Mở ứng dụng <strong>Ngân hàng</strong> hoặc
                            <strong>Ví điện tử</strong> (MoMo, ZaloPay,
                            VNPay...)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                            2
                          </span>
                          <span>
                            Chọn chức năng <strong>Quét mã QR</strong>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                            3
                          </span>
                          <span>
                            Quét mã QR phía trên và xác nhận thanh toán
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                            4
                          </span>
                          <span>
                            Sau khi thanh toán thành công, nhấn nút
                            <strong>"Xác nhận đã thanh toán"</strong> bên dưới
                          </span>
                        </li>
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full max-w-md space-y-3 pt-4">
                      <Button
                        onClick={downloadQR}
                        variant="outline"
                        className="w-full h-12 text-base border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Tải xuống mã QR
                      </Button>

                      <Button
                        onClick={handleConfirmPayment}
                        className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Xác nhận đã thanh toán
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-emerald-600" />
                    Chi tiết thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Appointment Details */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">
                      Thông tin lịch khám
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bệnh nhi:</span>
                        <span className="font-medium">
                          {appointmentDetails.childName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">
                          {appointmentDetails.doctorName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày khám:</span>
                        <span className="font-medium">
                          {appointmentDetails.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ khám:</span>
                        <span className="font-medium">
                          {appointmentDetails.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Fee Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Chi phí</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí khám:</span>
                        <span>{formatCurrency(feeBreakdown.consultation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí dịch vụ:</span>
                        <span>{formatCurrency(feeBreakdown.service)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">BHYT hỗ trợ:</span>
                        <span className="text-green-600">
                          {formatCurrency(feeBreakdown.insurance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="text-xs text-center text-gray-500 bg-gray-50 p-3 rounded-lg">
                      Vui lòng quét mã QR bên trái để hoàn tất thanh toán
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

export default Payment;
