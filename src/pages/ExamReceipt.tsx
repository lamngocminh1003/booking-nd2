import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Baby,
  FileText,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ExamReceipt = () => {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const appointments = useAppSelector(
    (state) => state.appointments.appointments
  );
  const latestAppointment = appointments[appointments.length - 1];

  useEffect(() => {
    if (!latestAppointment) {
      navigate("/appointments");
    }
  }, [latestAppointment, navigate]);

  if (!latestAppointment) {
    return null;
  }

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`phieu-kham-${latestAppointment.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-3 sm:mb-4">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 px-2">
              Đặt lịch thành công!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Phiếu khám của bạn đã được tạo. Vui lòng mang theo khi đến khám.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center px-2">
            <Button
              variant="outline"
              onClick={() => navigate("/appointments")}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">
                Xem danh sách phiếu khám
              </span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-sm sm:text-base">Đang tải...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">
                    Tải phiếu khám (PDF)
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Receipt Card */}
          <Card className="shadow-xl">
            <div ref={receiptRef} className="bg-white">
              <CardHeader className="border-b-2 border-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl text-emerald-800 truncate">
                      Phiếu Khám Bệnh
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Bệnh viện Nhi Đồng 2
                    </p>
                  </div>
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-emerald-600 flex-shrink-0" />
                </div>
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Mã phiếu:
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-white px-2 sm:px-3 py-1 rounded break-all">
                    {latestAppointment.id}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <Baby className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                    Thông tin bệnh nhi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium text-gray-900">
                        {latestAppointment.childName}
                      </p>
                    </div>
                    {latestAppointment.childWeight && (
                      <div>
                        <p className="text-sm text-gray-600">Cân nặng</p>
                        <p className="font-medium text-gray-900">
                          {latestAppointment.childWeight} kg
                        </p>
                      </div>
                    )}
                    {latestAppointment.childHeight && (
                      <div>
                        <p className="text-sm text-gray-600">Chiều cao</p>
                        <p className="font-medium text-gray-900">
                          {latestAppointment.childHeight} cm
                        </p>
                      </div>
                    )}
                    {latestAppointment.childStatus && (
                      <div>
                        <p className="text-sm text-gray-600">Tình trạng</p>
                        <p className="font-medium text-gray-900">
                          {latestAppointment.childStatus}
                        </p>
                      </div>
                    )}
                  </div>
                  {latestAppointment.childSymptom && (
                    <div className="mt-3 bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        Dấu hiệu lâm sàng
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                        {latestAppointment.childSymptom}
                      </p>
                    </div>
                  )}
                  {latestAppointment.childRequiredInformation && (
                    <div className="mt-3 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        Thông tin cần thiết
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                        {latestAppointment.childRequiredInformation}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Appointment Details */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                    Chi tiết lịch khám
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Bác sĩ khám
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                          {latestAppointment.doctorName}
                        </p>
                        <p className="text-xs sm:text-sm text-emerald-600">
                          {latestAppointment.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Ngày khám
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                          {formatDate(latestAppointment.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Giờ khám
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {latestAppointment.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Địa điểm
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                          {latestAppointment.location ||
                            "Phòng khám sẽ được thông báo khi đến"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Important Notes */}
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm sm:text-base font-semibold text-emerald-900 mb-2">
                    Lưu ý quan trọng:
                  </h4>
                  <ul className="text-xs sm:text-sm text-emerald-800 space-y-1 list-disc list-inside">
                    <li>Vui lòng có mặt trước giờ hẹn 15 phút</li>
                    <li>Mang theo thẻ bảo hiểm y tế (nếu có)</li>
                    <li>Mang theo sổ khám bệnh và kết quả xét nghiệm cũ</li>
                    <li>Liên hệ hotline 1900-xxxx nếu cần hỗ trợ</li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="text-center text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t space-y-1">
                  <p>Bệnh viện Nhi Đồng 2</p>
                  <p className="break-words px-2">
                    14 Lý Tự Trọng, Phường Sài Gòn, TP. HCM
                  </p>
                  <p className="break-words">
                    Hotline: 1900-xxxx | Email: info@nhi1.org.vn
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamReceipt;
