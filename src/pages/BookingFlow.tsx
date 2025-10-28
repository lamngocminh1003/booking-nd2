import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/redux";
import { RootState } from "@/store";
import {
  fetchZones,
  fetchSpecialtiesByExamType,
  fetchPatientInfoByUserLogin,
  fetchGroupedSpecialty,
  clearSpecialties,
  clearGroupedSpecialty,
  type GroupedSpecialtyResponse,
  type ServicePrice,
} from "@/store/slices/bookingCatalogSlice";

const BookingFlow = () => {
  // ✅ Add Redux hooks with specialty support
  const dispatch = useAppDispatch();
  const {
    zones,
    specialties,
    groupedSpecialty,
    loadingZones,
    loadingSpecialties,
    loadingSchedules,
    error,
  } = useSelector((state: RootState) => state.bookingCatalog);

  // ✅ Get params from URL
  const { zoneId: zoneIdParam, examTypeId: examTypeIdParam } = useParams<{
    zoneId: string;
    examTypeId: string;
  }>();

  // ✅ Updated state management - Add specialty back
  const [selectedZone, setSelectedZone] = useState<number | null>(() => {
    if (zoneIdParam && !isNaN(parseInt(zoneIdParam))) {
      return parseInt(zoneIdParam);
    }
    return null;
  });

  const [selectedExamType, setSelectedExamType] = useState<number | null>(
    () => {
      if (
        examTypeIdParam &&
        examTypeIdParam !== "0" &&
        !isNaN(parseInt(examTypeIdParam))
      ) {
        return parseInt(examTypeIdParam);
      }
      return null;
    }
  );

  // ✅ Add specialty selection back
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(
    null
  );
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // ✅ Add state for date filter in BookingFlow component
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ✅ Fetch zones data on component mount
  useEffect(() => {
    if (zones.length === 0) {
      dispatch(fetchZones(true));
    }
  }, [dispatch, zones.length]);

  // ✅ Fetch specialties when examType changes
  useEffect(() => {
    if (selectedExamType) {
      dispatch(fetchSpecialtiesByExamType(selectedExamType));
    } else {
      // Clear specialties if no examType selected
      dispatch(clearSpecialties());
    }
  }, [selectedExamType, dispatch]);

  // ✅ Fetch schedules when specialty changes
  useEffect(() => {
    if (selectedExamType && selectedSpecialty) {
      dispatch(
        fetchGroupedSpecialty({
          examTypeId: selectedExamType,
          specialtyId: selectedSpecialty,
        })
      );
    } else {
      // Clear schedules if no specialty selected
      dispatch(clearGroupedSpecialty());
    }
  }, [selectedExamType, selectedSpecialty, dispatch]);

  // ✅ Sync URL params with state when zones are loaded
  useEffect(() => {
    if (zones.length > 0) {
      if (zoneIdParam && !isNaN(parseInt(zoneIdParam))) {
        const zoneId = parseInt(zoneIdParam);
        if (selectedZone !== zoneId) {
          setSelectedZone(zoneId);
        }
      }

      if (
        examTypeIdParam &&
        examTypeIdParam !== "0" &&
        !isNaN(parseInt(examTypeIdParam))
      ) {
        const examTypeId = parseInt(examTypeIdParam);
        if (selectedExamType !== examTypeId) {
          setSelectedExamType(examTypeId);
        }
      }
    }
  }, [zones, zoneIdParam, examTypeIdParam]);
  useEffect(() => {
    setSelectedDate(null);
  }, [selectedExamType, selectedSpecialty]);

  // ✅ Get unique dates from groupedSpecialty for filter options
  const availableDates = useMemo(() => {
    const dates = groupedSpecialty.map((schedule) => schedule.date);
    const uniqueDates = [...new Set(dates)].sort();
    return uniqueDates;
  }, [groupedSpecialty]);

  // ✅ Filter schedules by selected date
  const filteredSchedules = useMemo(() => {
    if (!selectedDate) return groupedSpecialty;
    return groupedSpecialty.filter(
      (schedule) => schedule.date === selectedDate
    );
  }, [groupedSpecialty, selectedDate]);
  // ✅ Updated data calculations - Add specialty back
  const currentZone = zones.find((z) => z.id === selectedZone);
  const availableExamTypes = currentZone?.examTypes || [];
  const currentExamType = availableExamTypes.find(
    (e) => e.id === selectedExamType
  );

  // ✅ ADD: Missing currentSpecialty definition
  const currentSpecialty = specialties.find((s) => s.id === selectedSpecialty);

  // ✅ FIXED: Get single servicePrice object
  const currentServicePrice = useMemo(() => {
    if (!currentExamType?.servicePrice) {
      return null;
    }

    // ✅ Check if service price is enabled
    return currentExamType.servicePrice.enable
      ? currentExamType.servicePrice
      : null;
  }, [currentExamType]);

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

  // ✅ Show loading state while fetching zones
  if (loadingZones) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khu khám...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state if failed to load zones
  if (error && zones.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi tải dữ liệu khu khám: {error}</p>
          <Button onClick={() => dispatch(fetchZones(true))}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // ✅ Reset date filter when exam type or specialty changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Đặt Lịch Khám
            </h1>
            <p className="text-gray-600">
              {selectedZone && selectedExamType ? (
                <>
                  <span className="text-emerald-600 font-medium">
                    {currentZone?.name || `Zone ID: ${selectedZone}`}
                  </span>
                  {" - "}
                  <span className="text-blue-600 font-medium">
                    {currentExamType?.name ||
                      `ExamType ID: ${selectedExamType}`}
                  </span>
                  {/* ✅ FIXED: Now currentSpecialty is defined */}
                  {selectedSpecialty && currentSpecialty && (
                    <>
                      {" - "}
                      <span className="text-purple-600 font-medium">
                        {currentSpecialty.name}
                      </span>
                    </>
                  )}
                  {/* ✅ Show service price in header */}
                  {currentServicePrice && (
                    <>
                      {" - "}
                      <span className="text-orange-600 font-medium">
                        {formatCurrency(currentServicePrice.price)}
                      </span>
                    </>
                  )}
                </>
              ) : selectedZone ? (
                <>
                  <span className="text-emerald-600 font-medium">
                    {currentZone?.name || `Zone ID: ${selectedZone}`}
                  </span>
                  {" - "}
                  <span className="text-gray-500">Chọn loại khám</span>
                </>
              ) : (
                "Chọn khu khám, loại khám, chuyên khoa và thời gian phù hợp"
              )}
            </p>
          </div>

          {/* ✅ Show pre-selected info */}
          {(selectedZone || selectedExamType) && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                <span className="text-emerald-800 font-medium">
                  Thông tin đã chọn từ trang chủ:
                </span>
              </div>
              <div className="mt-2 text-sm text-emerald-700">
                {selectedZone && (
                  <span>
                    Khu khám: {currentZone?.name || `ID: ${selectedZone}`}
                  </span>
                )}
                {selectedZone && selectedExamType && <span> • </span>}
                {selectedExamType && (
                  <span>
                    Loại khám:{" "}
                    {currentExamType?.name || `ID: ${selectedExamType}`}
                  </span>
                )}

                {/* ✅ FIXED: Display service price automatically with validation */}
                {currentServicePrice ? (
                  <div className="mt-2">
                    <span className="text-gray-600">Dịch vụ: </span>
                    <Badge
                      variant="secondary"
                      className={`text-sm ${
                        currentServicePrice.name.includes("[CLC]")
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {currentServicePrice.name} -{" "}
                      {formatCurrency(currentServicePrice.price)}
                    </Badge>
                  </div>
                ) : currentExamType?.servicePrice &&
                  !currentExamType.servicePrice.enable ? (
                  <div className="mt-2">
                    <span className="text-yellow-600">
                      ⚠️ Dịch vụ "{currentExamType.servicePrice.name}" đang tắt
                    </span>
                  </div>
                ) : (
                  selectedExamType &&
                  currentExamType && (
                    <div className="mt-2">
                      <span className="text-red-600">
                        ⚠️ Loại khám này chưa có dịch vụ - Vui lòng chọn loại
                        khám khác
                      </span>
                    </div>
                  )
                )}

                {selectedZone && !selectedExamType && (
                  <span> • Vui lòng chọn loại khám bên dưới</span>
                )}
              </div>
            </div>
          )}

          {/* ✅ Dynamic Progress Steps - Only 4 steps if specialty exists */}
          <div className={`grid grid-cols-4 gap-4 mb-12`}>
            <div
              className={`flex items-center ${
                selectedZone ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedZone ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedZone ? <CheckCircle className="w-6 h-6" /> : "1"}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">
                Khu khám
              </span>
            </div>

            <div
              className={`flex items-center ${
                selectedExamType ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedExamType ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedExamType ? <CheckCircle className="w-6 h-6" /> : "2"}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">
                Loại khám
              </span>
            </div>

            <div
              className={`flex items-center ${
                selectedSpecialty
                  ? "text-emerald-600"
                  : !loadingSpecialties && specialties.length === 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedSpecialty
                    ? "bg-emerald-600 text-white"
                    : !loadingSpecialties && specialties.length === 0
                    ? "bg-red-200 text-red-600"
                    : "bg-gray-200"
                }`}
              >
                {selectedSpecialty ? <CheckCircle className="w-6 h-6" /> : "3"}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">
                Chuyên khoa
              </span>
            </div>

            <div
              className={`flex items-center ${
                selectedSlot && selectedSpecialty
                  ? "text-emerald-600"
                  : !loadingSpecialties && specialties.length === 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedSlot && selectedSpecialty
                    ? "bg-emerald-600 text-white"
                    : !loadingSpecialties && specialties.length === 0
                    ? "bg-red-200 text-red-600"
                    : "bg-gray-200"
                }`}
              >
                {selectedSlot && selectedSpecialty ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  "4"
                )}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">
                Thời gian
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Selection Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                    Bước 1: Chọn Khu Khám
                    {selectedZone && (
                      <CheckCircle className="w-4 h-4 ml-2 text-emerald-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedZone?.toString() || ""}
                    onValueChange={(value) => {
                      const newZoneId = parseInt(value);
                      setSelectedZone(newZoneId);

                      setSelectedExamType(null);
                      setSelectedSpecialty(null);
                      setSelectedAppointment(null);
                      setSelectedSlot(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khu khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">
                              {zone.address}
                            </div>
                            <div className="text-xs text-blue-600">
                              {zone.examTypes.length} loại khám
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Step 2: Select Exam Type with service price validation */}
              {selectedZone && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />
                      Bước 2: Chọn Loại Khám
                      {selectedExamType && (
                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {currentZone && (
                        <span className="text-emerald-600">
                          {currentZone.name} - {availableExamTypes.length} loại
                          khám có sẵn
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availableExamTypes.length > 0 ? (
                      <Select
                        value={selectedExamType?.toString() || ""}
                        onValueChange={(value) => {
                          const newExamTypeId = parseInt(value);
                          setSelectedExamType(newExamTypeId);

                          setSelectedSpecialty(null);
                          setSelectedAppointment(null);
                          setSelectedSlot(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại khám" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExamTypes.map((examType) => (
                            <SelectItem
                              key={examType.id}
                              value={examType.id.toString()}
                              // ✅ FIXED: Check single servicePrice object and its enable status
                              disabled={
                                !examType.servicePrice ||
                                !examType.servicePrice.enable
                              }
                            >
                              <div className="w-full">
                                <div className="font-medium">
                                  {examType.name}
                                </div>
                                {examType.description && (
                                  <div className="text-sm text-gray-500">
                                    {examType.description}
                                  </div>
                                )}

                                {/* ✅ FIXED: Check single servicePrice object */}
                                {examType.servicePrice ? (
                                  <div className="mt-1">
                                    {examType.servicePrice.enable ? (
                                      <span
                                        className={`text-sm font-semibold ${
                                          examType.servicePrice.name.includes(
                                            "[CLC]"
                                          )
                                            ? "text-purple-600"
                                            : "text-emerald-600"
                                        }`}
                                      >
                                        {formatCurrency(
                                          examType.servicePrice.price
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-yellow-500">
                                        Dịch vụ đang tắt
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  // ✅ Show warning if no service price
                                  <div className="mt-1">
                                    <span className="text-xs text-red-500">
                                      Chưa có dịch vụ
                                    </span>
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Không có loại khám nào</p>
                        <p className="text-sm">
                          Khu khám này chưa có loại khám được cấu hình
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ Show warning if selected examType has no available service */}
              {selectedExamType && currentExamType && !hasAvailableService && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6 text-orange-600">
                      <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-orange-500" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">
                        {currentExamType.servicePrice
                          ? "Dịch vụ đang bị tắt"
                          : "Loại khám chưa có dịch vụ"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {currentExamType.servicePrice
                          ? `Dịch vụ "${currentExamType.servicePrice.name}" hiện đang bị tắt và không thể đặt lịch.`
                          : `Loại khám "${currentExamType.name}" chưa được cấu hình dịch vụ.`}
                      </p>
                      <p className="text-sm font-medium text-orange-600">
                        Vui lòng chọn loại khám khác để tiếp tục đặt lịch.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ✅ Step 3: Select Specialty - Only show if examType has available service */}
              {selectedExamType && hasAvailableService && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Bước 3: Chọn Chuyên Khoa
                      {selectedSpecialty && (
                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {currentExamType && (
                        <span className="text-blue-600">
                          {currentExamType.name}
                          {currentServicePrice && (
                            <span className="ml-2 text-emerald-600">
                              • Dịch vụ: {currentServicePrice.name} -{" "}
                              {formatCurrency(currentServicePrice.price)}
                            </span>
                          )}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSpecialties ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải chuyên khoa...</p>
                      </div>
                    ) : specialties.length > 0 ? (
                      <Select
                        value={selectedSpecialty?.toString() || ""}
                        onValueChange={(value) => {
                          const newSpecialtyId = parseInt(value);
                          setSelectedSpecialty(newSpecialtyId);
                          setSelectedAppointment(null);
                          setSelectedSlot(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chuyên khoa" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem
                              key={specialty.id}
                              value={specialty.id.toString()}
                            >
                              <div className="w-full">
                                <div className="font-medium">
                                  {specialty.name}
                                </div>
                                {specialty.description && (
                                  <div className="text-sm text-gray-500">
                                    {specialty.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      // ✅ Show disabled state if no specialties
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Không có chuyên khoa nào</p>
                        <p className="text-sm">
                          Loại khám này chưa có chuyên khoa được cấu hình
                        </p>
                        <p className="text-sm text-orange-600 mt-2">
                          ⚠️ Bước này bị vô hiệu hóa - Sẽ chuyển thẳng sang lịch
                          khám
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ Show direct schedule if no specialties available */}
              {selectedExamType &&
                currentServicePrice &&
                specialties.length === 0 &&
                !loadingSpecialties && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-800">
                        <User className="w-5 h-5 mr-2" />
                        Không có chuyên khoa
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-orange-100 text-orange-800"
                        >
                          Loại khám này chưa được cấu hình chuyên khoa
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-orange-700">
                        Loại khám "{currentExamType?.name}" hiện tại chưa có
                        chuyên khoa được cấu hình. Vui lòng liên hệ bộ phận hỗ
                        trợ để được tư vấn thêm.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-4">
                          Bạn có thể thử:
                        </p>
                        <ul className="text-sm text-gray-600 text-left space-y-2">
                          <li>• Chọn loại khám khác</li>
                          <li>• Liên hệ hotline: 1900-xxxx</li>
                          <li>• Đến trực tiếp bệnh viện để được tư vấn</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* ✅ Step 4: Select Appointment Slot - Only show if specialty is selected */}
              {selectedSpecialty && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                      Bước 4: Chọn Lịch Khám
                    </CardTitle>
                    <CardDescription>
                      <span className="text-purple-600">
                        {currentSpecialty?.name} - Lịch khám trong 14 ngày tới
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSchedules ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải lịch khám...</p>
                      </div>
                    ) : groupedSpecialty.length > 0 ? (
                      <div className="space-y-6">
                        {/* ✅ Date Filter Section */}
                        <div className="border-b pb-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                Chọn ngày khám
                              </h4>
                              <p className="text-sm text-gray-600">
                                {availableDates.length} ngày có lịch khám
                                {selectedDate && (
                                  <span className="ml-2">
                                    • Đang hiển thị:{" "}
                                    <span className="font-medium text-emerald-600">
                                      {formatDateShort(selectedDate)}
                                    </span>
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Clear filter button */}
                            {selectedDate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(null);
                                  // Reset slot selection when clearing date filter
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Hiển thị tất cả
                              </Button>
                            )}
                          </div>

                          {/* Date Filter Options Grid */}
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                            {availableDates.map((date) => {
                              const scheduleCount = groupedSpecialty.filter(
                                (s) => s.date === date
                              ).length;
                              const totalSlots = groupedSpecialty
                                .filter((s) => s.date === date)
                                .reduce(
                                  (sum, s) => sum + s.totalAvailableSlot,
                                  0
                                );
                              const dayOfWeek = new Date(
                                date
                              ).toLocaleDateString("vi-VN", {
                                weekday: "short",
                              });

                              return (
                                <Button
                                  key={date}
                                  variant={
                                    selectedDate === date
                                      ? "default"
                                      : "outline"
                                  }
                                  className={`h-auto p-3 flex flex-col items-center transition-all ${
                                    selectedDate === date
                                      ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                                      : "hover:bg-emerald-50 hover:border-emerald-300"
                                  }`}
                                  onClick={() => {
                                    setSelectedDate(
                                      selectedDate === date ? null : date
                                    );
                                    // Reset slot selection when changing date
                                    setSelectedSlot(null);
                                    setSelectedAppointment(null);
                                  }}
                                >
                                  <div
                                    className={`font-medium text-sm ${
                                      selectedDate === date
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {new Date(date).toLocaleDateString(
                                      "vi-VN",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                      }
                                    )}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      selectedDate === date
                                        ? "text-emerald-100"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {dayOfWeek}
                                  </div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      selectedDate === date
                                        ? "text-emerald-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {totalSlots} chỗ
                                  </div>
                                  {scheduleCount > 1 && (
                                    <div
                                      className={`text-xs ${
                                        selectedDate === date
                                          ? "text-emerald-100"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {scheduleCount} ca
                                    </div>
                                  )}
                                </Button>
                              );
                            })}
                          </div>

                          {/* Quick date selection buttons */}
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Select today if available
                                const today = new Date()
                                  .toISOString()
                                  .split("T")[0];
                                const todayAvailable = availableDates.find(
                                  (date) => date.startsWith(today)
                                );
                                if (todayAvailable) {
                                  setSelectedDate(todayAvailable);
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }
                              }}
                              className="text-xs"
                              disabled={
                                !availableDates.some((date) =>
                                  date.startsWith(
                                    new Date().toISOString().split("T")[0]
                                  )
                                )
                              }
                            >
                              Hôm nay
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Select tomorrow if available
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const tomorrowStr = tomorrow
                                  .toISOString()
                                  .split("T")[0];
                                const tomorrowAvailable = availableDates.find(
                                  (date) => date.startsWith(tomorrowStr)
                                );
                                if (tomorrowAvailable) {
                                  setSelectedDate(tomorrowAvailable);
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }
                              }}
                              className="text-xs"
                              disabled={
                                !availableDates.some((date) => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  return date.startsWith(
                                    tomorrow.toISOString().split("T")[0]
                                  );
                                })
                              }
                            >
                              Ngày mai
                            </Button>
                          </div>
                        </div>

                        {/* ✅ Display filtered schedules */}
                        {filteredSchedules.length > 0 ? (
                          <div className="space-y-6">
                            {/* Show selected date info */}
                            {selectedDate && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-emerald-600 mr-2" />
                                  <span className="font-medium text-emerald-800">
                                    Lịch khám ngày {formatDate(selectedDate)}
                                  </span>
                                </div>
                                <p className="text-sm text-emerald-700 mt-1">
                                  {filteredSchedules.length} ca khám có sẵn •{" "}
                                  {filteredSchedules.reduce(
                                    (sum, s) => sum + s.totalAvailableSlot,
                                    0
                                  )}{" "}
                                  chỗ trống
                                </p>
                              </div>
                            )}

                            {filteredSchedules.map((schedule, index) => (
                              <div
                                key={schedule.id || index}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                  <div>
                                    <h4 className="font-semibold text-lg">
                                      {formatDate(schedule.date)}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                      {schedule.dayName} -{" "}
                                      {schedule.examinationName}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {schedule.timeStart} - {schedule.timeEnd}
                                    </p>
                                  </div>
                                  <Badge
                                    className="mt-2 sm:mt-0"
                                    variant={
                                      schedule.isAvailable
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {schedule.totalAvailableSlot} chỗ trống
                                  </Badge>
                                </div>

                                {/* ✅ Doctor and Room info */}
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Bác sĩ:{" "}
                                    <span className="font-medium ml-1">
                                      {schedule.doctorName}
                                    </span>
                                  </p>
                                  <p className="text-sm flex items-center mt-1">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Phòng:{" "}
                                    <span className="font-medium ml-1">
                                      {schedule.roomName}
                                    </span>
                                  </p>
                                  {/* ✅ Display service prices from schedule */}
                                  {schedule.servicePrices &&
                                    schedule.servicePrices.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-sm text-gray-600">
                                          Giá dịch vụ:
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {schedule.servicePrices.map(
                                            (service) => (
                                              <Badge
                                                key={service.id}
                                                variant="secondary"
                                                className="text-xs bg-emerald-100 text-emerald-800"
                                              >
                                                {service.name} -{" "}
                                                {formatCurrency(
                                                  service.regularPrice
                                                )}
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* ✅ Appointment Slots */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                  {schedule.appointmentSlots.map((slot) => (
                                    <Button
                                      key={slot.slotId}
                                      variant={
                                        selectedSlot === slot.slotId
                                          ? "default"
                                          : "outline"
                                      }
                                      className={`h-auto p-2 ${
                                        selectedSlot === slot.slotId
                                          ? "bg-emerald-600 hover:bg-emerald-700"
                                          : "hover:bg-emerald-50"
                                      }`}
                                      onClick={() => {
                                        setSelectedSlot(slot.slotId);
                                        setSelectedAppointment(schedule.id);
                                      }}
                                      disabled={!slot.isAvailable}
                                    >
                                      <div className="text-center">
                                        <div className="font-medium text-sm">
                                          {slot.startSlot}
                                        </div>
                                        <div className="text-xs opacity-80">
                                          {slot.endSlot}
                                        </div>
                                        <div className="text-xs mt-1 opacity-75">
                                          {slot.availableSlot}/{slot.totalSlot}
                                        </div>
                                      </div>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : selectedDate ? (
                          // Show message when no schedules for selected date
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">Không có lịch khám</p>
                            <p className="text-sm">
                              Ngày {formatDateShort(selectedDate)} không có lịch
                              khám cho chuyên khoa này
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => setSelectedDate(null)}
                            >
                              Xem tất cả ngày khác
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Không có lịch khám nào</p>
                        <p className="text-sm">
                          Chuyên khoa này chưa có lịch khám trong 14 ngày tới
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm Tắt Đặt Lịch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedZone && (
                    <div>
                      <p className="text-sm text-gray-600">Khu khám</p>
                      <p className="font-medium">
                        {currentZone?.name || `ID: ${selectedZone}`}
                      </p>
                      {currentZone?.address && (
                        <p className="text-sm text-gray-500">
                          {currentZone.address}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedExamType && (
                    <div>
                      <p className="text-sm text-gray-600">Loại khám</p>
                      <p className="font-medium">
                        {currentExamType?.name || `ID: ${selectedExamType}`}
                      </p>
                      {currentExamType?.description && (
                        <p className="text-sm text-gray-500">
                          {currentExamType.description}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedSpecialty && currentSpecialty && (
                    <div>
                      <p className="text-sm text-gray-600">Chuyên khoa</p>
                      <p className="font-medium">{currentSpecialty.name}</p>
                      {currentSpecialty.description && (
                        <p className="text-sm text-gray-500">
                          {currentSpecialty.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ✅ Display service price in summary */}
                  {currentServicePrice && (
                    <div>
                      <p className="text-sm text-gray-600">Dịch vụ</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {currentServicePrice.name}
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(currentServicePrice.price)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedSlot && (
                    <div>
                      <p className="text-sm text-gray-600">Thời gian đã chọn</p>
                      <p className="font-medium">
                        {(() => {
                          // Find selected slot info
                          for (const dateGroup of groupedSpecialty) {
                            for (const specialty of dateGroup.specialties) {
                              const slot = specialty.slots.find(
                                (s) => s.id === selectedSlot
                              );
                              if (slot) {
                                return (
                                  <div>
                                    <div>{formatDate(dateGroup.date)}</div>
                                    <div>
                                      {slot.timeStart} - {slot.timeEnd}
                                    </div>
                                    {slot.doctorName && (
                                      <div className="text-sm text-gray-500">
                                        BS. {slot.doctorName}
                                      </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                      {slot.roomName}
                                    </div>
                                  </div>
                                );
                              }
                            }
                          }
                          return "Đang tải...";
                        })()}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!selectedSlot || !hasAvailableService}
                    onClick={() =>
                      alert("Chức năng đặt lịch sẽ được triển khai!")
                    }
                  >
                    {!hasAvailableService
                      ? "Chưa có dịch vụ khả dụng"
                      : "Xác nhận đặt lịch"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateShort = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN") + "đ";
};

export default BookingFlow;
