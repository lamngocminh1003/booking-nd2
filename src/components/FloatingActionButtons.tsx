import { useState, useEffect } from "react";
import {
  Calendar,
  Phone,
  Mail,
  ChevronUp,
  MessageCircle,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FloatingActionButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // ✅ Show/hide scroll to top button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // ✅ Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ✅ Handle booking navigation
  const handleBookingClick = () => {
    navigate("/booking-flow");
  };

  // ✅ Handle phone call
  const handlePhoneCall = () => {
    window.location.href = "tel:19001215";
  };

  // ✅ Handle email
  const handleEmail = () => {
    window.location.href = "mailto:benhviennhi@benhviennhi.org.vn";
  };

  // ✅ Handle Facebook
  const handleFacebook = () => {
    window.open(
      "https://www.facebook.com/bvnd2",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ✅ Handle Zalo (optional)
  const handleZalo = () => {
    window.open("https://zalo.me/19001215", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed right-2 sm:right-4 md:right-6 bottom-2 sm:bottom-4 md:bottom-6 z-50 flex flex-col space-y-2 sm:space-y-3">
      {/* ✅ Booking Button - Smaller on mobile */}
      <Button
        onClick={handleBookingClick}
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-110 group p-0"
        aria-label="Đặt lịch khám"
      >
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
      </Button>

      {/* ✅ Scroll to Top Button - Only show when scrolled, smaller on mobile */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:scale-110 group animate-fade-in p-0"
          aria-label="Lên đầu trang"
        >
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:animate-bounce" />
        </Button>
      )}

      {/* ✅ Tooltip labels - Responsive */}
      <style>{`
        .floating-action-buttons .tooltip {
          position: absolute;
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
          z-index: 60;
        }

        @media (min-width: 640px) {
          .floating-action-buttons .tooltip {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
          }
        }

        .floating-action-buttons button:hover .tooltip {
          opacity: 1;
        }

        /* Hide tooltips on very small screens */
        @media (max-width: 480px) {
          .floating-action-buttons .tooltip {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActionButtons;
