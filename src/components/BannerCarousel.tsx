import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Banner } from "@/store/slices/bannerSlice";

interface BannerCarouselProps {
  banners: Banner[];
  loading?: boolean;
}

const BannerCarousel = ({ banners, loading }: BannerCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [retryAttempts, setRetryAttempts] = useState<Record<number, number>>(
    {}
  );

  // ✅ Auto-play carousel
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // ✅ Debug: Log banner data
  useEffect(() => {
    console.log("Banners data:", banners);
    banners.forEach((banner, index) => {
      const urls = getAllImageUrls(banner.image);
      console.log(`Banner ${index + 1}:`, {
        id: banner.id,
        displayName: banner.displayName,
        originalImage: banner.image,
        allUrls: urls,
        status: banner.status,
      });
    });
  }, [banners]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.href) {
      window.open(banner.href, "_blank", "noopener,noreferrer");
    }
  };

  // ✅ Get all possible image URLs to try
  const getAllImageUrls = (imagePath: string) => {
    const baseUrls = [
      "https://benhviennhi.org.vn",
      "https://www.benhviennhi.org.vn",
    ];

    const pathVariations = [
      imagePath, // Original
      decodeURIComponent(imagePath), // Decode
      imagePath.replace(/[^\x00-\x7F]/g, ""), // Remove non-ASCII
      imagePath.replace(/Ä|đ|Ã¡|º|¦/g, (match) => {
        // Map common Vietnamese encoding issues
        const map: Record<string, string> = {
          Ä: "D",
          đ: "d",
          "Ã¡": "á",
          º: "",
          "¦": "Ầ",
        };
        return map[match] || match;
      }),
      // Try with proper Vietnamese characters
      imagePath.replace("Äáº¦U", "ĐẦU"),
    ];

    const urls: string[] = [];
    baseUrls.forEach((baseUrl) => {
      pathVariations.forEach((path) => {
        urls.push(`${baseUrl}${path}`);
        // Also try with encoded version
        try {
          const encoded = encodeURI(path);
          if (encoded !== path) {
            urls.push(`${baseUrl}${encoded}`);
          }
        } catch (e) {
          // Skip if encoding fails
        }
      });
    });

    // Remove duplicates
    return [...new Set(urls)];
  };

  // ✅ Handle image load error with retry logic
  const handleImageError = (bannerId: number, imagePath: string) => {
    const currentRetries = retryAttempts[bannerId] || 0;
    const maxRetries = 3;

    console.error(
      `Failed to load image for banner ID: ${bannerId}, attempt: ${
        currentRetries + 1
      }`
    );

    if (currentRetries < maxRetries) {
      // Try next URL after a short delay
      setTimeout(() => {
        setRetryAttempts((prev) => ({
          ...prev,
          [bannerId]: currentRetries + 1,
        }));
      }, 1000);
    } else {
      console.error(`All retry attempts failed for banner ID: ${bannerId}`);
      setImageErrors((prev) => ({ ...prev, [bannerId]: true }));
    }
  };

  // ✅ Get current image URL to try
  const getCurrentImageUrl = (imagePath: string, bannerId: number) => {
    const allUrls = getAllImageUrls(imagePath);
    const retryIndex = retryAttempts[bannerId] || 0;
    return allUrls[retryIndex] || allUrls[0];
  };

  if (loading) {
    return (
      <div className="relative w-full aspect-[16/9] sm:aspect-[20/9] md:aspect-[3/1] lg:aspect-[4/1] bg-gray-200 animate-pulse rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] sm:aspect-[20/9] md:aspect-[3/1] lg:aspect-[4/1] bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
            Bệnh Viện Nhi Đồng 2
          </h3>
          <p className="text-sm sm:text-base md:text-lg opacity-90">
            Chăm sóc sức khỏe trẻ em tốt nhất
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[20/9] md:aspect-[3/1] lg:aspect-[4/1] rounded-lg overflow-hidden shadow-lg group">
      {/* ✅ Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const hasError = imageErrors[banner.id];
          const currentUrl = getCurrentImageUrl(banner.image, banner.id);
          const retryCount = retryAttempts[banner.id] || 0;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`w-full h-full cursor-pointer relative overflow-hidden ${
                  banner.href ? "hover:scale-[1.02]" : ""
                } transition-transform duration-300`}
                onClick={() => handleBannerClick(banner)}
              >
                {!hasError ? (
                  <div className="w-full h-full relative">
                    {/* ✅ Show loading indicator during retry */}
                    {retryCount > 0 && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">
                            Đang thử tải ảnh... ({retryCount}/3)
                          </p>
                        </div>
                      </div>
                    )}

                    <img
                      key={`${banner.id}-${retryCount}`} // Force re-render on retry
                      src={currentUrl}
                      alt={banner.displayName}
                      className="w-full h-full object-contain bg-gray-50"
                      onError={() => handleImageError(banner.id, banner.image)}
                      onLoad={() => {
                        console.log(
                          `✅ Image loaded successfully: ${currentUrl}`
                        );
                        // Clear any retry state on successful load
                        setRetryAttempts((prev) => ({
                          ...prev,
                          [banner.id]: 0,
                        }));
                      }}
                    />
                  </div>
                ) : (
                  // ✅ Enhanced fallback with banner info
                  <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <div className="text-center text-white px-6 py-8">
                      <div className="mb-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">
                        {banner.displayName}
                      </h3>
                      <p className="text-sm opacity-90 mb-2">
                        Bệnh Viện Nhi Đồng 2
                      </p>
                      <p className="text-xs opacity-75 mb-2">
                        Banner ID: {banner.id}
                      </p>
                      <p className="text-xs opacity-60">
                        Không thể tải hình ảnh
                      </p>

                      {banner.href && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBannerClick(banner);
                            }}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 inline mr-1" />
                            Xem chi tiết
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Text overlay - only show on successful image load */}
                {banner.displayName && !hasError && retryCount === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3
                        className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 leading-tight"
                        style={{
                          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {banner.displayName}
                      </h3>
                      {banner.href && (
                        <div
                          className="flex items-center text-sm opacity-90"
                          style={{
                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>Nhấn để xem chi tiết</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg z-10"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg z-10"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* ✅ Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 shadow-sm ${
                index === currentSlide
                  ? "bg-white scale-125 shadow-md"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
