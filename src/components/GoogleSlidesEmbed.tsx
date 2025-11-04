import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleSlidesEmbedProps {
  url: string;
  title: string;
  location: string;
  className?: string;
}

const GoogleSlidesEmbed = ({
  url,
  title,
  location,
  className = "",
}: GoogleSlidesEmbedProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // ✅ Extract presentation ID for direct link
  const presentationId = url.match(/\/d\/e\/(.*?)\/embed/)?.[1];
  const directLink = presentationId
    ? `https://docs.google.com/presentation/d/e/${presentationId}/pub?start=false&loop=false&delayms=3000`
    : url;

  return (
    <Card
      className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              {location}
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-emerald-50 text-emerald-700"
          >
            Lịch khám
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="relative">
          {/* ✅ Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <div className="text-center">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2 text-emerald-600" />
                <p className="text-xs sm:text-sm text-gray-600">
                  Đang tải lịch khám...
                </p>
              </div>
            </div>
          )}

          {/* ✅ Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-10">
              <div className="text-center p-4">
                <p className="text-red-600 text-sm mb-3">
                  Không thể tải lịch khám
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(directLink, "_blank")}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Xem trực tiếp
                </Button>
              </div>
            </div>
          )}

          {/* ✅ Responsive iframe */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {" "}
            {/* 16:9 aspect ratio */}
            <iframe
              src={url}
              className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
              title={title}
              onLoad={handleLoad}
              onError={handleError}
              allowFullScreen
              allow="autoplay; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        </div>

        {/* ✅ Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(directLink, "_blank")}
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Xem toàn màn hình
          </Button>
          <Button
            size="sm"
            onClick={() => (window.location.href = "/booking-flow")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Đặt lịch ngay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleSlidesEmbed;
