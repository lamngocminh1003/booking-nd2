import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Search,
  Award,
  Activity,
  Shield,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo from "../assets/imgs/logo.png";

interface Doctor {
  id: number;
  name: string;
  position: string;
  specialty: string;
  introduce: string;
  displaySpecialty: string;
  displayPosition: string;
  trainProcess: string;
  experience: string;
  strength: string;
  image?: string;
  status: boolean;
}

interface ApiResponse {
  message: string;
  data: {
    allDoctor: Doctor[];
    meta: {
      page: number;
      pageSize: number;
      totalDoctor: number;
    };
  };
}

type FilterType =
  | "all"
  | "InternalMedicine"
  | "SurgicalSpecialty"
  | "ClinicalMedicine";

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  // ✅ State for pagination/slider
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({
    InternalMedicine: 0,
    SurgicalSpecialty: 0,
    ClinicalMedicine: 0,
  });

  const DOCTORS_PER_PAGE = 6;

  // ✅ Function to get position priority for sorting
  const getPositionPriority = (position: string): number => {
    const lowerPosition = position.toLowerCase();

    // Giám đốc - Phó Giám đốc
    if (lowerPosition.includes("giám đốc") && !lowerPosition.includes("phó"))
      return 1;

    // Cố vấn
    if (lowerPosition.includes("cố vấn")) return 2;
    if (lowerPosition.includes("phó giám đốc")) return 3;

    // ✅ SỬA: Kiểm tra Trưởng phòng trước Phó Trưởng phòng
    if (
      lowerPosition.includes("trưởng phòng") &&
      !lowerPosition.includes("phó")
    )
      return 4;
    if (lowerPosition.includes("phó trưởng phòng")) return 5;

    // ✅ SỬA: Kiểm tra Trưởng khoa trước Phó Trưởng khoa
    if (lowerPosition.includes("trưởng khoa") && !lowerPosition.includes("phó"))
      return 6;
    if (lowerPosition.includes("phó trưởng khoa")) return 7;

    // Các chức vụ khác
    if (lowerPosition.includes("bác sĩ cao cấp")) return 8;
    if (lowerPosition.includes("thầy thuốc ưu tú")) return 9;
    if (lowerPosition.includes("giáo sư")) return 10;
    if (lowerPosition.includes("phó giáo sư")) return 11;
    if (lowerPosition.includes("tiến sĩ")) return 12;
    if (lowerPosition.includes("thạc sĩ")) return 13;
    if (lowerPosition.includes("bác sĩ chuyên khoa 2")) return 14;
    if (lowerPosition.includes("bác sĩ chuyên khoa 1")) return 15;
    if (lowerPosition.includes("bác sĩ")) return 16;

    // Dược sĩ
    if (lowerPosition.includes("dược sĩ")) return 17;

    return 99; // Default cho các chức vụ không xác định
  };

  // ✅ Sort doctors by position priority
  const sortDoctorsByPosition = (doctorsList: Doctor[]): Doctor[] => {
    return [...doctorsList].sort((a, b) => {
      const positionPriorityA = getPositionPriority(a.position);
      const positionPriorityB = getPositionPriority(b.position);

      if (positionPriorityA !== positionPriorityB) {
        return positionPriorityA - positionPriorityB;
      }

      // Nếu cùng position priority, sắp xếp theo tên
      return a.name.localeCompare(b.name, "vi");
    });
  };

  // ✅ Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://benhviennhi.org.vn/api/doctor?page=1&pageSize=1000&keyword="
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin bác sĩ");
        }

        const data: ApiResponse = await response.json();

        const doctorsData = data?.data?.allDoctor || [];
        setDoctors(doctorsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // ✅ Group doctors by specialty and sort within each group
  const groupedDoctors = {
    InternalMedicine: sortDoctorsByPosition(
      doctors.filter((doctor) => doctor.specialty === "InternalMedicine")
    ),
    SurgicalSpecialty: sortDoctorsByPosition(
      doctors.filter((doctor) => doctor.specialty === "SurgicalSpecialty")
    ),
    ClinicalMedicine: sortDoctorsByPosition(
      doctors.filter((doctor) => doctor.specialty === "ClinicalMedicine")
    ),
  };

  // ✅ Filter doctors by search term
  const filterDoctorsBySearch = (doctorsList: Doctor[]): Doctor[] => {
    if (!searchTerm) return doctorsList;

    return doctorsList.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.displaySpecialty
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // ✅ Get filtered grouped doctors
  const getFilteredGroupedDoctors = () => {
    if (activeFilter === "all") {
      return {
        InternalMedicine: filterDoctorsBySearch(
          groupedDoctors.InternalMedicine
        ),
        SurgicalSpecialty: filterDoctorsBySearch(
          groupedDoctors.SurgicalSpecialty
        ),
        ClinicalMedicine: filterDoctorsBySearch(
          groupedDoctors.ClinicalMedicine
        ),
      };
    } else {
      return {
        InternalMedicine:
          activeFilter === "InternalMedicine"
            ? filterDoctorsBySearch(groupedDoctors.InternalMedicine)
            : [],
        SurgicalSpecialty:
          activeFilter === "SurgicalSpecialty"
            ? filterDoctorsBySearch(groupedDoctors.SurgicalSpecialty)
            : [],
        ClinicalMedicine:
          activeFilter === "ClinicalMedicine"
            ? filterDoctorsBySearch(groupedDoctors.ClinicalMedicine)
            : [],
      };
    }
  };

  // ✅ Get paginated doctors for a specialty
  const getPaginatedDoctors = (specialty: string, doctorsList: Doctor[]) => {
    const currentPage = currentPages[specialty] || 0;
    const startIndex = currentPage * DOCTORS_PER_PAGE;
    const endIndex = startIndex + DOCTORS_PER_PAGE;
    return doctorsList.slice(startIndex, endIndex);
  };

  // ✅ Get total pages for a specialty
  const getTotalPages = (doctorsList: Doctor[]) => {
    return Math.ceil(doctorsList.length / DOCTORS_PER_PAGE);
  };

  // ✅ Navigation functions
  const goToNextPage = (specialty: string, totalPages: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [specialty]: (prev[specialty] + 1) % totalPages,
    }));
  };

  const goToPrevPage = (specialty: string, totalPages: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [specialty]: prev[specialty] === 0 ? totalPages - 1 : prev[specialty] - 1,
    }));
  };

  // ✅ Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPages({
      InternalMedicine: 0,
      SurgicalSpecialty: 0,
      ClinicalMedicine: 0,
    });
  }, [searchTerm, activeFilter]);

  // ✅ Specialty configurations
  const specialtyConfigs = [
    {
      key: "InternalMedicine",
      title: "Chuyên Khoa Nội",
      icon: <Heart className="w-6 h-6" />,
      color: "emerald",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-600",
      titleColor: "text-emerald-800",
    },
    {
      key: "SurgicalSpecialty",
      title: "Chuyên Khoa Ngoại",
      icon: <Activity className="w-6 h-6" />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
    },
    {
      key: "ClinicalMedicine",
      title: "Cận Lâm Sàng",
      icon: <Shield className="w-6 h-6" />,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      titleColor: "text-purple-800",
    },
  ];

  // ✅ Filter configuration
  const filterOptions = [
    {
      key: "all" as FilterType,
      label: "Tất cả bác sĩ",
      icon: <Award className="w-5 h-5" />,
      count: doctors.length,
      color: "bg-gray-600 hover:bg-gray-700",
      borderColor: "border-gray-600",
    },
    {
      key: "InternalMedicine" as FilterType,
      label: "Chuyên khoa Nội",
      icon: <Heart className="w-5 h-5" />,
      count: groupedDoctors.InternalMedicine.length,
      color: "bg-emerald-600 hover:bg-emerald-700",
      borderColor: "border-emerald-600",
    },
    {
      key: "SurgicalSpecialty" as FilterType,
      label: "Chuyên khoa Ngoại",
      icon: <Activity className="w-5 h-5" />,
      count: groupedDoctors.SurgicalSpecialty.length,
      color: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-600",
    },
    {
      key: "ClinicalMedicine" as FilterType,
      label: "Cận lâm sàng",
      icon: <Shield className="w-5 h-5" />,
      count: groupedDoctors.ClinicalMedicine.length,
      color: "bg-purple-600 hover:bg-purple-700",
      borderColor: "border-purple-600",
    },
  ];

  // ✅ Toggle section collapse
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // ✅ Helper functions
  const getPositionDisplay = (position: string): JSX.Element => {
    const priority = getPositionPriority(position);
    const isHighRanking = priority <= 7;

    return (
      <div className="flex items-center gap-2 justify-center">
        {isHighRanking && (
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        )}
        <span className={isHighRanking ? "font-semibold text-amber-700" : ""}>
          {position}
        </span>
      </div>
    );
  };

  const getSpecialtyName = (specialty: string): string => {
    switch (specialty) {
      case "InternalMedicine":
        return "Nội khoa";
      case "SurgicalSpecialty":
        return "Ngoại khoa";
      case "ClinicalMedicine":
        return "Cận lâm sàng";
      default:
        return "Chuyên khoa";
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case "InternalMedicine":
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case "SurgicalSpecialty":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "ClinicalMedicine":
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Award className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return (
      parts[parts.length - 2]?.charAt(0) + parts[parts.length - 1]?.charAt(0) ||
      "BS"
    );
  };

  // ✅ Filter Button Component
  const FilterButton = ({ option }: { option: (typeof filterOptions)[0] }) => {
    const isActive = activeFilter === option.key;

    return (
      <Button
        onClick={() => setActiveFilter(option.key)}
        variant={isActive ? "default" : "outline"}
        className={`
          flex items-center gap-2 transition-all duration-300
          ${
            isActive
              ? `${option.color} text-white shadow-lg`
              : `hover:${option.color} hover:text-white ${option.borderColor}`
          }
        `}
      >
        {option.icon}
        <span className="font-medium">{option.label}</span>
      </Button>
    );
  };

  // ✅ Doctor Card Component
  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 flex flex-col h-full">
      <CardHeader className="text-center">
        <div className="mb-4">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarImage
              src={
                doctor.image
                  ? `https://benhviennhi.org.vn${doctor.image}`
                  : undefined
              }
            />
            <AvatarFallback className="text-xl bg-emerald-100 text-emerald-600">
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
          {doctor.name}
        </CardTitle>
        <CardDescription className="text-emerald-600 font-medium">
          {getPositionDisplay(doctor.position)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* ✅ Main description with fixed height */}
          <div className="h-2 flex items-start">
            <p className="text-gray-600 text-sm text-center line-clamp-3 w-full">
              {doctor.introduce ||
                "Bác sĩ chuyên nghiệp tại Bệnh viện Nhi đồng 2"}
            </p>
          </div>

          {/* ✅ Hospital info với height cố định */}
          <div className="flex items-center gap-1 text-sm text-gray-500 justify-center h-6"></div>
        </div>
        {/* ✅ Button section luôn ở cuối */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid">
            <a
              href={`https://benhviennhi.org.vn/kham-chua-benh/doi-ngu-chuyen-gia/${doctor.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-500"
              >
                Xem thêm
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600 text-lg">
                  Đang tải thông tin bác sĩ...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="pt-20 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Không thể tải dữ liệu
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredGroupedDoctors = getFilteredGroupedDoctors();
  const totalFilteredDoctors = Object.values(filteredGroupedDoctors).reduce(
    (total, doctors) => total + doctors.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img
              alt="Logo Bệnh Viện Nhi Đồng 2"
              src={logo}
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Đội Ngũ Bác Sĩ
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gặp gỡ đội ngũ bác sĩ chuyên nghiệp, giàu kinh nghiệm và tận tâm
              với trẻ em
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-1">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bác sĩ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {(searchTerm || activeFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {filterOptions.map((option) => (
                <FilterButton key={option.key} option={option} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Sections */}
      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          {specialtyConfigs.map((config) => {
            const allDoctors =
              filteredGroupedDoctors[
                config.key as keyof typeof filteredGroupedDoctors
              ];
            const isCollapsed = collapsedSections[config.key];
            const currentPage = currentPages[config.key] || 0;
            const totalPages = getTotalPages(allDoctors);
            const displayedDoctors = getPaginatedDoctors(
              config.key,
              allDoctors
            );

            if (allDoctors.length === 0 && activeFilter !== "all") return null;

            return (
              <div
                key={config.key}
                className={`${config.bgColor} rounded-xl p-6 ${config.borderColor} border-2`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleSection(config.key)}
                  >
                    <div className={`${config.textColor}`}>{config.icon}</div>
                    <div>
                      <h3 className={`text-2xl font-bold ${config.titleColor}`}>
                        {config.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* ✅ Pagination Controls in Header */}
                    {totalPages > 1 && !isCollapsed && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToPrevPage(config.key, totalPages);
                          }}
                          className={`${config.textColor} hover:bg-white/20 p-2 hover:text-emerald-500`}
                          disabled={currentPage === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, index) => {
                              let pageIndex;
                              if (totalPages <= 5) {
                                pageIndex = index;
                              } else {
                                // Show pages around current page
                                const start = Math.max(0, currentPage - 2);
                                const end = Math.min(totalPages - 1, start + 4);
                                const adjustedStart = Math.max(0, end - 4);
                                pageIndex = adjustedStart + index;
                              }

                              return (
                                <Button
                                  key={pageIndex}
                                  variant={
                                    currentPage === pageIndex
                                      ? "default"
                                      : "ghost"
                                  }
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPages((prev) => ({
                                      ...prev,
                                      [config.key]: pageIndex,
                                    }));
                                  }}
                                  className={`w-8 h-8 p-0 text-xs ${
                                    currentPage === pageIndex
                                      ? `bg-${config.color}-600 hover:bg-${config.color}-700 text-white hover:text-emerald-500`
                                      : `${config.textColor} hover:bg-emerald/20 hover:text-emerald/20`
                                  }`}
                                >
                                  {pageIndex + 1}
                                </Button>
                              );
                            }
                          )}

                          {totalPages > 5 && currentPage < totalPages - 3 && (
                            <>
                              <span className={`${config.textColor} px-1`}>
                                ...
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPages((prev) => ({
                                    ...prev,
                                    [config.key]: totalPages - 1,
                                  }));
                                }}
                                className={`w-8 h-8 p-0 text-xs ${config.textColor} hover:bg-white/20 hover:text-emerald-500`}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToNextPage(config.key, totalPages);
                          }}
                          className={`${config.textColor} hover:bg-white/20 p-2 hover:text-emerald-500`}
                          disabled={currentPage === totalPages - 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {allDoctors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(config.key)}
                        className={`${config.textColor} hover:bg-white/20 hover:text-emerald-500`}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronUp className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Doctors Grid */}
                {!isCollapsed && (
                  <div className="transition-all duration-300">
                    {displayedDoctors.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedDoctors.map((doctor) => (
                          <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/50 rounded-lg">
                        <div
                          className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                        >
                          <div className={config.textColor}>{config.icon}</div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">
                          Không có bác sĩ nào
                        </h4>
                        <p className="text-gray-500">
                          Thử thay đổi từ khóa tìm kiếm
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
