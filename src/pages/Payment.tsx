import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  Calendar,
  Baby,
  CreditCard,
  QrCode,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { confirmPaymentThunk } from "@/store/slices/bookingCatalogSlice";
import type { RootState } from "@/store";
import {
  getRegistrationSession,
  clearRegistrationSession,
  isSessionExpired,
} from "@/utils/registrationSession";
import CountdownTimer from "@/components/ui/countdown-timer";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { loadingPayment } = useSelector(
    (state: RootState) => state.bookingCatalog
  );

  // ✅ Get data from navigation state
  const {
    registrationData,
    appointmentData,
    patientData,
    scheduleData,
    slotData,
    serviceData,
    examTypeData,
    specialtyData,
    zoneData,
  } = location.state || {};

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Thêm state cho session management
  const [sessionExpired, setSessionExpired] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // ✅ Extract data from API response
  const registrationId = registrationData?.id;
  const patientId = registrationData?.patientId;
  const qrCodeBase64 = registrationData?.base64QrCode;
  const registrationDate = registrationData?.registrationDate;
  const timeSlot = registrationData?.timeSlot;
  const symptom = registrationData?.symptom;
  const requiredInformation = registrationData?.requiredInformation;
  const weight = registrationData?.weight;
  const height = registrationData?.height;

  // ✅ Calculate fees
  const consultationFee = serviceData?.price || 150000;
  const serviceFee = 0; // Additional service fee if any
  const insuranceDiscount = patientData?.bhytId ? -50000 : 0; // BHYT discount
  const totalAmount = consultationFee + serviceFee + insuranceDiscount;

  // ✅ Generate payment info
  const orderId = `REG_${registrationId}_${Date.now()}`;
  const paymentDescription = `Thanh toan kham benh - ${patientData?.fullName}`;

  // ✅ Auto scroll to QR code
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      if (qrCodeRef.current) {
        qrCodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Xử lý khi session hết hạn
  const handleSessionExpired = () => {
    setSessionExpired(true);
    clearRegistrationSession();

    toast({
      title: "Thời gian thanh toán đã hết hạn! ⏰",
      description: "Lịch khám đã bị hủy tự động. Vui lòng đặt lịch mới.",
      variant: "destructive",
    });

    // ✅ Tự động chuyển về trang booking sau 3 giây
    setTimeout(() => {
      navigate("/booking");
    }, 3000);
  };

  // ✅ Kiểm tra session khi component mount
  useEffect(() => {
    const session = getRegistrationSession();

    if (session) {
      if (isSessionExpired(session)) {
        // ✅ Gọi handleSessionExpired ngay lập tức nếu đã hết hạn
        handleSessionExpired();
      } else {
        setCurrentSession(session);
      }
    }

    // Nếu không có session và không có data từ navigation
    if (!session && !registrationData) {
      navigate("/booking");
    }
  }, [registrationData, navigate]);

  // ✅ Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!registrationId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin đăng ký",
        variant: "destructive",
      });
      return;
    }

    // ✅ Kiểm tra session trước khi thanh toán
    if (currentSession && isSessionExpired(currentSession)) {
      handleSessionExpired();
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ Call payment confirmation API
      const paymentData = {
        orderId: orderId,
        transactionId: `TXN_${Date.now()}`,
        amount: totalAmount,
        status: "success",
        paymentMethod: "qr_code",
        paymentTime: new Date().toISOString(),
      };

      console.log("🔄 Confirming payment:", paymentData);

      await dispatch(confirmPaymentThunk(paymentData)).unwrap();

      // ✅ Xóa session sau khi thanh toán thành công
      clearRegistrationSession();
      setCurrentSession(null);
      setPaymentConfirmed(true);

      toast({
        title: "Thanh toán thành công! ✅",
        description: "Lịch khám đã được xác nhận. Vui lòng đến đúng giờ hẹn.",
      });

      // ✅ Navigate to success page after delay
      setTimeout(() => {
        navigate("/appointments", {
          state: {
            registrationId,
            paymentConfirmed: true,
            appointmentData,
          },
        });
      }, 3000);
    } catch (error: any) {
      console.error("❌ Payment confirmation failed:", error);
      toast({
        title: "Lỗi thanh toán",
        description:
          error.message || "Không thể xác nhận thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Download QR code
  const downloadQR = () => {
    if (!qrCodeBase64) {
      toast({
        title: "Lỗi",
        description: "Không có mã QR để tải xuống",
        variant: "destructive",
      });
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrCodeBase64}`;
      link.download = `ma-thanh-toan-${registrationId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Tải xuống thành công! ✅",
        description: "Mã QR đã được lưu vào thiết bị của bạn.",
      });
    } catch (error) {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống mã QR. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ Format time
  const formatTime = (timeString: string) => {
    return timeString?.substring(0, 5) || "N/A";
  };

  // ✅ Early return if no data
  if (!registrationData || !appointmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy thông tin đặt lịch
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng đặt lịch khám trước khi thanh toán.
            </p>
            <Button onClick={() => navigate("/booking")}>Đặt lịch khám</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Show session expired state
  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-800">
              Thời gian thanh toán đã hết hạn
            </h3>
            <p className="text-gray-600 mb-4">
              Lịch khám đã bị hủy tự động. Bạn cần đặt lịch khám mới.
            </p>
            <Button
              onClick={() => navigate("/booking")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Đặt lịch khám mới
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-16 sm:pt-20 pb-10 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/booking")}
              className="mb-3 sm:mb-4 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Quay lại
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Thanh toán lịch khám
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Hoàn tất đặt lịch khám với thanh toán an toàn qua mã QR
            </p>
          </div>

          {/* ✅ Session Timer */}
          {currentSession && !paymentConfirmed && (
            <div className="mb-6">
              <CountdownTimer
                expiresAt={currentSession.expiresAt}
                onExpired={handleSessionExpired}
              />
            </div>
          )}

          {/* Registration Success Banner */}
          {!paymentConfirmed && (
            <div className="mb-6 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2" />
                <span className="text-emerald-800 font-medium text-sm sm:text-base">
                  Đặt lịch khám thành công!
                </span>
              </div>
              <p className="text-emerald-700 text-xs sm:text-sm mt-1">
                Mã đăng ký:{" "}
                <span className="font-mono font-bold">#{registrationId}</span>
                {registrationDate && (
                  <span className="ml-2">• Ngày tạo: {registrationDate}</span>
                )}
                {currentSession && (
                  <span className="ml-2">
                    • Hết hạn thanh toán:{" "}
                    {new Date(currentSession.expiresAt).toLocaleTimeString(
                      "vi-VN"
                    )}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* QR Code Payment Section */}
            <div className="lg:col-span-2">
              {!paymentConfirmed ? (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b pb-3 sm:pb-6">
                    <CardTitle className="flex items-center text-emerald-700 text-base sm:text-xl">
                      <QrCode className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Thanh toán bằng mã QR
                    </CardTitle>
                    <CardDescription className="text-gray-700 text-xs sm:text-base">
                      Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-4 sm:py-8">
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                      {/* QR Code Display */}
                      <div className="relative" ref={qrCodeRef}>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl" />
                        <div className="relative bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-emerald-100">
                          {qrCodeBase64 ? (
                            <img
                              src={`data:image/png;base64,${qrCodeBase64}`}
                              alt="Payment QR Code"
                              className="w-48 h-48 sm:w-72 sm:h-72 mx-auto"
                            />
                          ) : (
                            <div className="w-48 h-48 sm:w-72 sm:h-72 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center">
                                <QrCode className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-500 text-sm">
                                  Đang tải mã QR...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="text-center space-y-1 sm:space-y-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-emerald-200">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">
                          Số tiền thanh toán
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                          {formatCurrency(totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mã đơn hàng:{" "}
                          <span className="font-mono">{orderId}</span>
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="w-full max-w-md space-y-3 sm:space-y-4 bg-blue-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-blue-900 flex items-center text-sm sm:text-base">
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm mr-2">
                            i
                          </span>
                          Hướng dẫn thanh toán
                        </h4>
                        <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                              1
                            </span>
                            <span>
                              Mở ứng dụng <strong>Ngân hàng</strong> hoặc
                              <strong> Ví điện tử</strong> (MoMo, ZaloPay,
                              VNPay...)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                              2
                            </span>
                            <span>
                              Chọn chức năng <strong>Quét mã QR</strong>
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                              3
                            </span>
                            <span>
                              Quét mã QR phía trên và xác nhận thanh toán{" "}
                              <strong>{formatCurrency(totalAmount)}</strong>
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                              4
                            </span>
                            <span>
                              Sau khi thanh toán thành công, nhấn nút
                              <strong> "Xác nhận đã thanh toán"</strong> bên
                              dưới
                            </span>
                          </li>
                        </ol>
                      </div>

                      {/* Action Buttons */}
                      <div className="w-full max-w-md space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                        {qrCodeBase64 && (
                          <Button
                            onClick={downloadQR}
                            variant="outline"
                            className="w-full h-10 sm:h-12 text-sm sm:text-base border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Tải xuống mã QR
                          </Button>
                        )}

                        <Button
                          onClick={handleConfirmPayment}
                          className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                          disabled={isProcessing || loadingPayment}
                        >
                          {isProcessing || loadingPayment ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Xác nhận đã thanh toán
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Payment Success */
                <Card className="overflow-hidden">
                  <CardContent className="py-8 sm:py-12">
                    <div className="text-center space-y-4 sm:space-y-6">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2">
                          Thanh toán thành công! ✅
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Lịch khám của bạn đã được xác nhận
                        </p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 sm:p-6">
                        <p className="text-emerald-800 font-medium text-sm sm:text-base mb-2">
                          Thông tin quan trọng:
                        </p>
                        <ul className="text-emerald-700 text-xs sm:text-sm space-y-1">
                          <li>• Vui lòng đến đúng giờ hẹn</li>
                          <li>• Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                          <li>• Đến trước giờ hẹn 15-30 phút để làm thủ tục</li>
                        </ul>
                      </div>
                      <Button
                        onClick={() => navigate("/appointments")}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Xem lịch khám của tôi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center text-base sm:text-xl">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                    Chi tiết đặt lịch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Patient Info */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base flex items-center">
                      <Baby className="w-4 h-4 mr-2 text-blue-600" />
                      Thông tin bệnh nhi
                    </h3>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ tên:</span>
                        <span className="font-medium">
                          {patientData?.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuổi:</span>
                        <span>{patientData?.age || "N/A"} tuổi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giới tính:</span>
                        <span>{patientData?.genderName}</span>
                      </div>
                      {patientData?.bhytId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">BHYT:</span>
                          <span className="text-blue-600 font-mono text-xs">
                            {patientData.bhytId}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cân nặng:</span>
                        <span>{weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chiều cao:</span>
                        <span>{height} cm</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Appointment Details */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                      Lịch khám
                    </h3>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày khám:</span>
                        <span className="font-medium">
                          {scheduleData?.date
                            ? formatDate(scheduleData.date)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ khám:</span>
                        <span className="font-medium">
                          {formatTime(slotData?.startSlot)} -{" "}
                          {formatTime(slotData?.endSlot)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">
                          {scheduleData?.doctorName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phòng:</span>
                        <span className="font-medium">
                          {scheduleData?.roomName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chuyên khoa:</span>
                        <span className="font-medium">
                          {specialtyData?.name || examTypeData?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Medical Info */}
                  {(symptom || requiredInformation) && (
                    <>
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                          Thông tin khám
                        </h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          {symptom && (
                            <div>
                              <span className="text-gray-600">
                                Triệu chứng:
                              </span>
                              <p className="text-gray-800 mt-1 bg-gray-50 p-2 rounded text-xs">
                                {symptom}
                              </p>
                            </div>
                          )}
                          {requiredInformation && (
                            <div>
                              <span className="text-gray-600">
                                Thông tin bổ sung:
                              </span>
                              <p className="text-gray-800 mt-1 bg-gray-50 p-2 rounded text-xs">
                                {requiredInformation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Fee Breakdown */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                      Chi phí
                    </h3>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí khám:</span>
                        <span>{formatCurrency(consultationFee)}</span>
                      </div>
                      {serviceFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí dịch vụ:</span>
                          <span>{formatCurrency(serviceFee)}</span>
                        </div>
                      )}
                      {insuranceDiscount < 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">BHYT hỗ trợ:</span>
                          <span className="text-green-600">
                            {formatCurrency(insuranceDiscount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2 sm:space-y-3 pt-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    {!paymentConfirmed && (
                      <div className="text-xs text-center text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
                        {qrCodeBase64
                          ? "Quét mã QR bên trái để thanh toán"
                          : "Đang tải mã QR thanh toán..."}
                      </div>
                    )}
                    {paymentConfirmed && (
                      <div className="text-xs text-center text-emerald-700 bg-emerald-50 p-2 sm:p-3 rounded-lg border border-emerald-200">
                        ✅ Đã thanh toán thành công
                      </div>
                    )}
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
