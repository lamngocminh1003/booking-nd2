import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeRemaining } from "@/utils/registrationSession";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired: () => void;
  className?: string;
  compact?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpired,
  className = "",
  compact = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const remaining = expires.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining(0);
        onExpired();
      } else {
        setTimeRemaining(remaining);
        setIsWarning(remaining <= 5 * 60 * 1000); // Cảnh báo khi còn < 5 phút
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (timeRemaining <= 0) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const isUrgent = minutes < 5;

  if (compact) {
    return (
      <Badge
        variant={isUrgent ? "destructive" : "secondary"}
        className={`${className} text-xs`}
      >
        <Clock className="w-3 h-3 mr-1" />
        {formatTimeRemaining(timeRemaining)}
      </Badge>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg border ${
        isUrgent
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800"
      } ${className}`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
      ) : (
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
      )}

      <div className="flex-1">
        <p className="font-medium text-sm sm:text-base">
          {isUrgent ? "⚠️ Sắp hết hạn thanh toán!" : "⏰ Thời gian thanh toán"}
        </p>
        <p className="text-xs sm:text-sm">
          Còn lại:{" "}
          <span className="font-mono font-bold">
            {formatTimeRemaining(timeRemaining)}
          </span>
          {isUrgent && " - Vui lòng thanh toán ngay!"}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
