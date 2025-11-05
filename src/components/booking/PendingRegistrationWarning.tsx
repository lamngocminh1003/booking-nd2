import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  Calendar,
  User,
  MapPin,
  X,
} from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";
import type { RegistrationSession } from "@/utils/registrationSession";

interface PendingRegistrationWarningProps {
  session: RegistrationSession;
  onContinuePayment: () => void;
  onStartNew: () => void;
  onDismiss: () => void;
}

const PendingRegistrationWarning: React.FC<PendingRegistrationWarningProps> = ({
  session,
  onContinuePayment,
  onStartNew,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    return timeString?.substring(0, 5) || "N/A";
  };

  return (
    <Card className="border-orange-200 bg-orange-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-800 text-base sm:text-lg">
              Bạn có lịch khám chưa thanh toán
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            Mã đăng ký: #{session.registrationId}
          </Badge>
          {session.orderId && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Đơn hàng: {session.orderId}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown Timer */}
        <CountdownTimer
          expiresAt={session.expiresAt}
          onExpired={() => {
            onStartNew();
          }}
        />

        {/* Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Bệnh nhi:</span>
            <span className="font-medium">{session.patientData?.fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-600">Ngày khám:</span>
            <span className="font-medium">
              {session.scheduleData?.date
                ? new Date(session.scheduleData.date).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                    }
                  )
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">Giờ khám:</span>
            <span className="font-medium">
              {formatTime(session.slotData?.startSlot)} -{" "}
              {formatTime(session.slotData?.endSlot)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium text-emerald-600">
              {formatCurrency(session.serviceData?.price || 0)}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-orange-200 pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Bác sĩ:</span>
                <p className="font-medium">
                  {session.scheduleData?.doctorName}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Phòng khám:</span>
                <p className="font-medium">{session.scheduleData?.roomName}</p>
              </div>
              <div>
                <span className="text-gray-600">Cân nặng:</span>
                <p className="font-medium">
                  {session.appointmentData?.childWeight} kg
                </p>
              </div>
              <div>
                <span className="text-gray-600">Chiều cao:</span>
                <p className="font-medium">
                  {session.appointmentData?.childHeight} cm
                </p>
              </div>
            </div>

            {session.appointmentData?.childSymptom && (
              <div>
                <span className="text-gray-600">Triệu chứng:</span>
                <p className="text-sm bg-white p-2 rounded border">
                  {session.appointmentData.childSymptom}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={onContinuePayment}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Tiếp tục thanh toán
          </Button>

          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isExpanded ? "Thu gọn" : "Xem chi tiết"}
          </Button>

          <Button
            onClick={onStartNew}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Đặt lịch mới
          </Button>
        </div>

        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          💡 <strong>Lưu ý:</strong> Lịch khám sẽ bị hủy tự động nếu không thanh
          toán trong thời gian quy định.
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingRegistrationWarning;
