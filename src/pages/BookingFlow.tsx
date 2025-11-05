import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Baby,
  Plus,
  Edit, // ✅ Add missing Edit import
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  fetchZones,
  fetchSpecialtiesByExamType,
  fetchPatientInfoByUserLogin,
  fetchGroupedSpecialty,
  clearSpecialties,
  clearGroupedSpecialty,
  createOrUpdatePatientThunk,
  type GroupedSpecialtyResponse,
  type ServicePrice,
  type YouMed_PatientCreateDto,
  createOnlineRegistrationThunk,
} from "@/store/slices/bookingCatalogSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import ChildProfileModal from "@/components/modals/ChildProfileModal";
import { getUserInfo } from "@/store/slices/locationSlice";
import { toast } from "@/components/ui/use-toast"; // ✅ Add missing toast import
import type { AddOnlineRegistrationDto } from "@/services/BookingCatalogService";
import {
  saveRegistrationSession,
  getRegistrationSession,
  clearRegistrationSession,
  isSessionExpired,
} from "@/utils/registrationSession";
import PendingRegistrationWarning from "@/components/booking/PendingRegistrationWarning";
const BookingFlow = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // ✅ Get params from URL
  const { zoneId: zoneIdParam, examTypeId: examTypeIdParam } = useParams<{
    zoneId: string;
    examTypeId: string;
  }>(); // ✅ Get Redux state
  const {
    zones,
    specialties,
    groupedSpecialty,
    patientList,
    loadingZones,
    loadingSpecialties,
    loadingSchedules,
    loadingPatient,
    error,
    error: patientError,
  } = useSelector((state: RootState) => state.bookingCatalog);
  const {
    userInfo,
    provinces,
    wards,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);
  const { loadingRegistration } = useSelector(
    (state: RootState) => state.bookingCatalog
  );

  const searchParams = new URLSearchParams(window.location.search);
  const childIdFromUrl = searchParams.get("childId");
  const [pendingSession, setPendingSession] = useState<any>(null);
  const [showPendingWarning, setShowPendingWarning] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childWeight, setChildWeight] = useState<string>("");
  const [childHeight, setChildHeight] = useState<string>("");
  const [childStatus, setChildStatus] = useState<number | 0>(0);
  const [childSymptom, setChildSymptom] = useState<string>("");
  const [childRequiredInformation, setChildRequiredInformation] =
    useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const availableDoctors = useMemo(() => {
    const doctors = groupedSpecialty.map((schedule) => ({
      id: schedule.doctorId,
      name: schedule.doctorName,
    }));

    const uniqueDoctors = doctors.filter(
      (doctor, index, self) =>
        index === self.findIndex((d) => d.id === doctor.id)
    );

    return uniqueDoctors.sort((a, b) => a.name.localeCompare(b.name));
  }, [groupedSpecialty]);
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
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(
    null
  );
  const [selectedChild, setSelectedChild] = useState<number | null>(() => {
    if (childIdFromUrl && !isNaN(parseInt(childIdFromUrl))) {
      return parseInt(childIdFromUrl);
    }
    return null;
  });
  const isChildInfoComplete =
    selectedChild && childWeight && childHeight && childSymptom;
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const examTypeRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const childInfoRef = useRef<HTMLDivElement>(null); // ✅ Thêm ref mới
  const scheduleRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLDivElement>(null); // ✅ Thêm ref mới

  // ✅ Get unique dates from groupedSpecialty for filter options
  const availableDates = useMemo(() => {
    const dates = groupedSpecialty.map((schedule) => schedule.date);
    const uniqueDates = [...new Set(dates)].sort();
    return uniqueDates;
  }, [groupedSpecialty]);

  // ✅ Filter schedules by selected date
  const filteredSchedules = useMemo(() => {
    let filtered = groupedSpecialty;

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((schedule) => schedule.date === selectedDate);
    }

    // Filter by doctor
    if (selectedDoctor) {
      filtered = filtered.filter(
        (schedule) => schedule.doctorId?.toString() === selectedDoctor
      );
    }

    return filtered;
  }, [groupedSpecialty, selectedDate, selectedDoctor]);

  // ✅ Updated data calculations
  const currentZone = zones.find((z) => z.id === selectedZone);
  const availableExamTypes = currentZone?.examTypes || [];
  const currentExamType = availableExamTypes.find(
    (e) => e.id === selectedExamType
  );
  const currentSpecialty = specialties.find((s) => s.id === selectedSpecialty);

  // ✅ Get single servicePrice object
  const currentServicePrice = useMemo(() => {
    if (!currentExamType?.servicePrice) {
      return null;
    }
    return currentExamType.servicePrice.enable
      ? currentExamType.servicePrice
      : null;
  }, [currentExamType]);
  const hasValidUrlParams = useMemo(() => {
    return (
      selectedZone !== null &&
      selectedExamType !== null &&
      (specialties.length > 0 || loadingSpecialties) // Still loading specialties is valid
    );
  }, [selectedZone, selectedExamType, specialties.length, loadingSpecialties]);
  const scrollToStep = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };
  useEffect(() => {
    // Scroll đến bước chọn ExamType khi Zone được chọn
    if (selectedZone && examTypeRef.current) {
      setTimeout(() => scrollToStep(examTypeRef), 300);
    }
  }, [selectedZone]);
  useEffect(() => {
    const session = getRegistrationSession();
    if (session && !isSessionExpired(session)) {
      setPendingSession(session);
      setShowPendingWarning(true);
    } else if (session && isSessionExpired(session)) {
      clearRegistrationSession();
      toast({
        title: "Phiên đăng ký đã hết hạn ⏰",
        description: "Vui lòng đăng ký lại lịch khám mới.",
        variant: "destructive",
      });
    }
  }, []);
  useEffect(() => {
    // Scroll đến bước chọn Child khi Specialty được chọn
    if (selectedSpecialty && childRef.current) {
      setTimeout(() => scrollToStep(childRef), 300);
    }
  }, [selectedSpecialty]);

  // ✅ Thêm effect mới để scroll đến phần thông tin khám khi chọn bệnh nhi
  useEffect(() => {
    // Scroll đến phần thông tin khám khi bệnh nhi được chọn
    if (selectedChild && childInfoRef.current) {
      setTimeout(() => scrollToStep(childInfoRef), 500);
    }
  }, [selectedChild]);

  useEffect(() => {
    // Scroll đến bước chọn Schedule khi Child info complete
    if (isChildInfoComplete && scheduleRef.current) {
      setTimeout(() => scrollToStep(scheduleRef), 300);
    }
  }, [isChildInfoComplete]);
  // ✅ Thêm effect mới để scroll đến nút xác nhận khi chọn slot
  useEffect(() => {
    // Scroll đến nút xác nhận khi slot được chọn
    if (selectedSlot && confirmButtonRef.current) {
      setTimeout(() => scrollToStep(confirmButtonRef), 500);
    }
  }, [selectedSlot]);
  // ✅ Fetch zones data on component mount
  useEffect(() => {
    if (zones.length === 0) {
      dispatch(fetchZones(true));
    }
  }, [dispatch, zones.length]);
  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);
  // ✅ Fetch patient list on component mount
  useEffect(() => {
    if (patientList.length === 0) {
      dispatch(fetchPatientInfoByUserLogin());
    }
  }, [dispatch, patientList.length]);

  // ✅ Fetch specialties when examType changes
  useEffect(() => {
    if (selectedExamType) {
      dispatch(fetchSpecialtiesByExamType(selectedExamType));
    } else {
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

  useEffect(() => {
    if (
      selectedZone &&
      !selectedExamType &&
      availableExamTypes.length === 1 &&
      availableExamTypes[0].servicePrice?.enable
    ) {
      setSelectedExamType(availableExamTypes[0].id);
    }
  }, [selectedZone, selectedExamType, availableExamTypes]);
  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;
  useEffect(() => {
    if (
      selectedExamType &&
      hasAvailableService &&
      specialties.length > 0 &&
      specialtyRef.current
    ) {
      setTimeout(() => scrollToStep(specialtyRef), 300);
    } else if (
      selectedExamType &&
      hasAvailableService &&
      specialties.length === 0 &&
      !loadingSpecialties &&
      childRef.current
    ) {
      setTimeout(() => scrollToStep(childRef), 300);
    }
  }, [
    selectedExamType,
    hasAvailableService,
    specialties.length,
    loadingSpecialties,
  ]);
  useEffect(() => {
    if (
      selectedExamType &&
      !loadingSpecialties &&
      specialties.length === 1 &&
      !selectedSpecialty
    ) {
      setSelectedSpecialty(specialties[0].id);
    }
  }, [selectedExamType, loadingSpecialties, specialties, selectedSpecialty]);

  // ✅ Auto-select child when only one is available
  useEffect(() => {
    if (
      (selectedSpecialty ||
        (selectedExamType &&
          hasAvailableService &&
          specialties.length === 0)) &&
      !loadingPatient &&
      patientList.length === 1 &&
      !selectedChild
    ) {
      setSelectedChild(patientList[0].id);
    }
  }, [
    selectedSpecialty,
    selectedExamType,
    hasAvailableService,
    specialties.length,
    loadingPatient,
    patientList,
    selectedChild,
  ]);

  // ✅ Cập nhật auto-scroll effect cho specialty
  useEffect(() => {
    // Scroll đến bước chọn Specialty khi ExamType được chọn và có specialty
    if (
      selectedExamType &&
      hasAvailableService &&
      specialties.length > 1 && // ✅ Chỉ scroll khi có nhiều hơn 1 specialty
      specialtyRef.current
    ) {
      setTimeout(() => scrollToStep(specialtyRef), 300);
    }
    // Nếu không có specialty hoặc chỉ có 1 specialty thì scroll đến bước chọn child
    else if (
      selectedExamType &&
      hasAvailableService &&
      (specialties.length === 0 || selectedSpecialty) &&
      !loadingSpecialties &&
      childRef.current
    ) {
      setTimeout(() => scrollToStep(childRef), 300);
    }
  }, [
    selectedExamType,
    hasAvailableService,
    specialties.length,
    selectedSpecialty,
    loadingSpecialties,
  ]);

  // ✅ Cập nhật auto-scroll effect cho child
  useEffect(() => {
    // Scroll đến bước chọn Child khi Specialty được chọn và có nhiều bệnh nhi
    if (selectedSpecialty && patientList.length > 1 && childRef.current) {
      setTimeout(() => scrollToStep(childRef), 300);
    }
    // Nếu chỉ có 1 bệnh nhi thì scroll thẳng đến thông tin khám
    else if (selectedSpecialty && selectedChild && childInfoRef.current) {
      setTimeout(() => scrollToStep(childInfoRef), 500);
    }
  }, [selectedSpecialty, patientList.length, selectedChild]);
  // ✅ Helper function to calculate age
  const calculateAge = (dateOfBirth: string, age?: number) => {
    if (age !== undefined && age > 0) return age;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    return calculatedAge;
  };

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
  const handleChildModalSubmit = async (data: any) => {
    try {
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0,
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01",
        jobId: data.jobId || "001",
        provinceCode: data.provinceCode || userInfo?.provinceCode || "",
        wardCode: data.wardCode || userInfo?.wardCode || "",
        address: data.address || userInfo?.address || "",
        bhytId: data.bhytId || "",
        licenseDate: data.licenseDate
          ? new Date(data.licenseDate).toISOString()
          : undefined,
        noiDKKCBId: data.noiDKKCBId || null,
        cccd: data.cccd || userInfo?.cccd || "",
        motherName: data.motherName || userInfo?.fullName || "",
        motherPhone: data.motherPhone || userInfo?.phoneNumber || "",
        motherCCCD: data.motherCCCD || userInfo?.cccd || "",
        fatherName: data.fatherName || "",
        fatherPhone: data.fatherPhone || "",
        fatherCCCD: data.fatherCCCD || "",
        isGuardian: data.isGuardian || false,
      };

      const response = await dispatch(
        createOrUpdatePatientThunk(patientDto)
      ).unwrap();

      toast({
        title: "Thành công! ✅",
        description: editingChild
          ? `Cập nhật hồ sơ ${data.fullName} thành công`
          : `Thêm hồ sơ ${data.fullName} thành công`,
      });

      if (!editingChild && response?.id) {
        setSelectedChild(response.id);
      }

      await dispatch(fetchPatientInfoByUserLogin()).unwrap();

      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);
    } catch (error: any) {
      console.error("Error handling child profile:", error);

      let errorMessage = editingChild
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };
  // ✅ Xử lý khi tiếp tục thanh toán
  const handleContinuePayment = () => {
    if (pendingSession) {
      navigate("/payment", {
        state: {
          registrationData: {
            id: pendingSession.registrationId,
            base64QrCode: pendingSession.qrCodeBase64,
            orderId: pendingSession.orderId,
          },
          appointmentData: pendingSession.appointmentData,
          patientData: pendingSession.patientData,
          scheduleData: pendingSession.scheduleData,
          slotData: pendingSession.slotData,
          serviceData: pendingSession.serviceData,
        },
      });
    }
  };

  // ✅ Xử lý khi bắt đầu đặt lịch mới
  const handleStartNewBooking = () => {
    clearRegistrationSession();
    setPendingSession(null);
    setShowPendingWarning(false);

    // Reset tất cả states
    setSelectedZone(null);
    setSelectedExamType(null);
    setSelectedSpecialty(null);
    setSelectedChild(null);
    setSelectedAppointment(null);
    setSelectedSlot(null);
    setChildWeight("");
    setChildHeight("");
    setChildSymptom("");
    setChildRequiredInformation("");

    toast({
      title: "Đã xóa lịch khám cũ ✅",
      description: "Bạn có thể đặt lịch khám mới ngay bây giờ.",
    });
  };
  // ✅ Cập nhật phần xử lý khi đăng ký thành công
  const handleRegistrationSuccess = async (
    result: any,
    childData: any,
    scheduleData: any,
    slotData: any,
    appointmentData: any
  ) => {
    try {
      console.log("✅ Registration created successfully:", result);

      // ✅ Lưu session để theo dõi
      const sessionData = {
        registrationId: result.id,
        orderId: result.orderId,
        qrCodeBase64: result.base64QrCode,
        patientData: childData,
        appointmentData: appointmentData,
        scheduleData: scheduleData,
        slotData: slotData,
        serviceData: currentServicePrice,
      };

      saveRegistrationSession(sessionData);

      navigate("/payment", {
        state: {
          registrationData: result,
          appointmentData: appointmentData,
          patientData: childData,
          scheduleData: scheduleData,
          slotData: slotData,
          serviceData: currentServicePrice,
          examTypeData: currentExamType,
          specialtyData: currentSpecialty,
          zoneData: currentZone,
        },
      });
    } catch (error: any) {
      console.error("❌ Error in handleRegistrationSuccess:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="pt-16 sm:pt-24 pb-12 sm:pb-20 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header - Smaller on mobile */}
          <div className="mb-4 sm:mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-2 sm:mb-4 p-1 sm:p-2">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Quay lại</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Đặt Lịch Khám
            </h1>
            <p className="text-gray-600 text-xs sm:text-base">
              {/* ✅ Description content remains the same but with responsive text */}
              {hasValidUrlParams && selectedZone && selectedExamType ? (
                <>
                  <span className="text-emerald-600 font-medium">
                    {currentZone?.name || `Zone ID: ${selectedZone}`}
                  </span>
                  {" - "}
                  <span className="text-blue-600 font-medium">
                    {currentExamType?.name ||
                      `ExamType ID: ${selectedExamType}`}
                  </span>
                  {selectedSpecialty && currentSpecialty && (
                    <>
                      {" - "}
                      <span className="text-purple-600 font-medium">
                        {currentSpecialty.name}
                      </span>
                    </>
                  )}
                  {selectedChild && (
                    <>
                      {" - "}
                      <span className="text-orange-600 font-medium">
                        {
                          patientList.find((c) => c.id === selectedChild)
                            ?.fullName
                        }
                      </span>
                    </>
                  )}
                  {currentServicePrice && (
                    <>
                      {" - "}
                      <span className="text-green-600 font-medium">
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
                <span className="hidden sm:inline">
                  Chọn khu khám, loại khám, chuyên khoa, bệnh nhi và thời gian
                  phù hợp
                </span>
              )}
            </p>
          </div>
          {showPendingWarning && pendingSession && (
            <div className="mb-6">
              <PendingRegistrationWarning
                session={pendingSession}
                onContinuePayment={handleContinuePayment}
                onStartNew={handleStartNewBooking}
                onDismiss={() => setShowPendingWarning(false)}
              />
            </div>
          )}
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
                    Loại khám:
                    {currentExamType?.name || `ID: ${selectedExamType}`}
                  </span>
                )}

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
                      {currentServicePrice.name} -
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

          {/* ✅ Progress Steps - Much more compact on mobile */}
          <div className="grid grid-cols-5 gap-1 sm:gap-4 mb-6 sm:mb-12">
            {/* Step 1: Zone Selection */}
            <div
              className={`flex flex-col sm:flex-row items-center ${
                selectedZone ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base ${
                  selectedZone ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedZone ? (
                  <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                ) : (
                  "1"
                )}
              </div>
              <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0 sm:ml-2 text-center">
                <span className="sm:hidden">Khu</span>
                <span className="hidden sm:inline">Khu khám</span>
              </span>
            </div>

            {/* Step 2: ExamType Selection */}
            <div
              className={`flex flex-col sm:flex-row items-center ${
                selectedExamType && hasValidUrlParams
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base ${
                  selectedExamType && hasValidUrlParams
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {selectedExamType && hasValidUrlParams ? (
                  <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                ) : (
                  "2"
                )}
              </div>
              <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0 sm:ml-2 text-center">
                <span className="sm:hidden">Loại</span>
                <span className="hidden sm:inline">Loại khám</span>
              </span>
            </div>

            {/* Step 3: Specialty Selection */}
            <div
              className={`flex flex-col sm:flex-row items-center ${
                selectedSpecialty && hasValidUrlParams
                  ? "text-emerald-600"
                  : !loadingSpecialties &&
                    specialties.length === 0 &&
                    hasValidUrlParams
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base ${
                  selectedSpecialty && hasValidUrlParams
                    ? "bg-emerald-600 text-white"
                    : !loadingSpecialties &&
                      specialties.length === 0 &&
                      hasValidUrlParams
                    ? "bg-red-200 text-red-600"
                    : "bg-gray-200"
                }`}
              >
                {selectedSpecialty && hasValidUrlParams ? (
                  <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                ) : (
                  "3"
                )}
              </div>
              <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0 sm:ml-2 text-center">
                <span className="sm:hidden">Khoa</span>
                <span className="hidden sm:inline">Chuyên khoa</span>
              </span>
            </div>

            {/* Step 4: Child Selection */}
            <div
              className={`flex flex-col sm:flex-row items-center ${
                isChildInfoComplete && hasValidUrlParams
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base ${
                  isChildInfoComplete && hasValidUrlParams
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {isChildInfoComplete && hasValidUrlParams ? (
                  <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                ) : (
                  "4"
                )}
              </div>
              <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0 sm:ml-2 text-center">
                <span className="sm:hidden">Nhi</span>
                <span className="hidden sm:inline">Bệnh nhi</span>
              </span>
            </div>

            {/* Step 5: Time Selection */}
            <div
              className={`flex flex-col sm:flex-row items-center ${
                selectedSlot && hasValidUrlParams
                  ? "text-emerald-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base ${
                  selectedSlot && hasValidUrlParams
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {selectedSlot && hasValidUrlParams ? (
                  <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                ) : (
                  "5"
                )}
              </div>
              <span className="text-xs sm:text-base font-medium mt-1 sm:mt-0 sm:ml-2 text-center">
                <span className="sm:hidden">Giờ</span>
                <span className="hidden sm:inline">Thời gian</span>
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Selection Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Zone */}
              <Card ref={zoneRef} className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center text-base sm:text-xl">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
                    <span className="text-sm sm:text-base">
                      Bước 1: Chọn Khu Khám
                    </span>
                    {selectedZone && (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 text-emerald-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <Select
                    value={selectedZone?.toString() || ""}
                    onValueChange={(value) => {
                      const newZoneId = parseInt(value);
                      setSelectedZone(newZoneId);
                      setSelectedExamType(null);
                      setSelectedSpecialty(null);
                      setSelectedChild(null);
                      setSelectedAppointment(null);
                      setSelectedSlot(null);
                    }}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="Chọn khu khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          <div>
                            <div className="font-medium text-sm sm:text-base">
                              {zone.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
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
              {/* Step 2: Select Exam Type */}
              {selectedZone && (
                <Card ref={examTypeRef} className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center text-base sm:text-xl">
                      <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
                      <span className="text-sm sm:text-base">
                        Bước 2: Chọn Loại Khám
                      </span>
                      {selectedExamType && (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                      {currentZone && (
                        <span className="text-emerald-600">
                          {currentZone.name} - {availableExamTypes.length} loại
                          khám có sẵn
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                    {availableExamTypes.length > 0 ? (
                      <Select
                        value={selectedExamType?.toString() || ""}
                        onValueChange={(value) => {
                          const newExamTypeId = parseInt(value);
                          setSelectedExamType(newExamTypeId);
                          setSelectedSpecialty(null);
                          setSelectedChild(null);
                          setSelectedAppointment(null);
                          setSelectedSlot(null);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue
                            placeholder="Chọn loại khám"
                            className="text-sm sm:text-base"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExamTypes.map((examType) => (
                            <SelectItem
                              key={examType.id}
                              value={examType.id.toString()}
                              disabled={
                                !examType.servicePrice ||
                                !examType.servicePrice.enable
                              }
                            >
                              <div className="w-full">
                                <div className="font-medium text-sm sm:text-base">
                                  {examType.name}
                                </div>
                                {examType.description && (
                                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                    {examType.description}
                                  </div>
                                )}
                                {examType.servicePrice ? (
                                  <div className="mt-0.5 sm:mt-1">
                                    {examType.servicePrice.enable ? (
                                      <span
                                        className={`text-xs sm:text-sm font-semibold ${
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
                                  <div className="mt-0.5 sm:mt-1">
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
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Stethoscope className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="font-medium text-sm sm:text-base">
                          Không có loại khám nào
                        </p>
                        <p className="text-xs sm:text-sm">
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
              {selectedExamType && hasAvailableService && (
                <Card ref={specialtyRef} className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center text-base sm:text-xl">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
                      <span className="text-sm sm:text-base">
                        Bước 3: Chọn Chuyên Khoa
                      </span>
                      {selectedSpecialty && (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                      {currentExamType && (
                        <span className="text-blue-600">
                          {currentExamType.name}
                          {currentServicePrice && (
                            <span className="ml-1 sm:ml-2 text-emerald-600">
                              <span className="hidden sm:inline">
                                • Dịch vụ:{" "}
                              </span>
                              <span className="sm:hidden">• </span>
                              {currentServicePrice.name} -{" "}
                              {formatCurrency(currentServicePrice.price)}
                            </span>
                          )}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                    {loadingSpecialties ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600 mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Đang tải chuyên khoa...
                        </p>
                      </div>
                    ) : specialties.length > 1 ? (
                      // ✅ Hiển thị Select khi có nhiều hơn 1 specialty
                      <Select
                        value={selectedSpecialty?.toString() || ""}
                        onValueChange={(value) => {
                          const newSpecialtyId = parseInt(value);
                          setSelectedSpecialty(newSpecialtyId);
                          setSelectedChild(null);
                          setSelectedAppointment(null);
                          setSelectedSlot(null);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue
                            placeholder="Chọn chuyên khoa"
                            className="text-sm sm:text-base"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem
                              key={specialty.id}
                              value={specialty.id.toString()}
                            >
                              <div className="w-full">
                                <div className="font-medium text-sm sm:text-base">
                                  {specialty.name}
                                </div>
                                {specialty.description && (
                                  <div className="text-xs sm:text-sm text-gray-500">
                                    {specialty.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : specialties.length === 1 ? (
                      // ✅ Hiển thị thông báo auto-select khi chỉ có 1 specialty
                      <div className="text-center py-4 sm:py-6 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-emerald-500" />
                        <p className="font-medium text-sm sm:text-base">
                          Tự động chọn chuyên khoa
                        </p>
                        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                          <span className="font-medium">
                            {specialties[0].name}
                          </span>
                        </p>
                        {specialties[0].description && (
                          <p className="text-xs sm:text-sm text-emerald-700 mt-0.5 sm:mt-1">
                            {specialties[0].description}
                          </p>
                        )}
                        <p className="text-xs text-emerald-600 mt-1 sm:mt-2">
                          ✅ Đã tự động chọn do chỉ có một chuyên khoa
                        </p>
                      </div>
                    ) : (
                      // ✅ Hiển thị khi không có specialty - yêu cầu chọn lại
                      <div className="text-center py-6 sm:py-8 text-red-500">
                        <User className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-300" />
                        <p className="font-medium text-base sm:text-lg mb-2">
                          Không có chuyên khoa nào
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2 sm:px-0">
                          Loại khám{" "}
                          <span className="font-medium">
                            "{currentExamType?.name}"
                          </span>{" "}
                          chưa có chuyên khoa được cấu hình
                        </p>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm text-orange-700 mb-2 sm:mb-3">
                            ⚠️{" "}
                            <strong>
                              Không thể tiếp tục với loại khám này
                            </strong>
                          </p>
                          <p className="text-xs text-orange-600">
                            Vui lòng chọn lại loại khám khác hoặc khu khám khác
                            có chuyên khoa phù hợp
                          </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          {/* ✅ Nút chọn lại loại khám */}
                          <Button
                            variant="outline"
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-500 h-8 sm:h-10 text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedExamType(null);
                              setSelectedSpecialty(null);
                              setSelectedChild(null);
                              setSelectedAppointment(null);
                              setSelectedSlot(null);
                              // Scroll về phần chọn exam type
                              setTimeout(() => {
                                if (examTypeRef.current) {
                                  examTypeRef.current.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }, 100);
                            }}
                          >
                            🔄 Chọn lại loại khám
                          </Button>

                          {/* ✅ Nút chọn lại khu khám */}
                          <Button
                            variant="outline"
                            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-500 h-8 sm:h-10 text-xs sm:text-sm"
                            onClick={() => {
                              setSelectedZone(null);
                              setSelectedExamType(null);
                              setSelectedSpecialty(null);
                              setSelectedChild(null);
                              setSelectedAppointment(null);
                              setSelectedSlot(null);
                              // Scroll về đầu trang
                              setTimeout(() => {
                                if (zoneRef.current) {
                                  zoneRef.current.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }, 100);
                            }}
                          >
                            🏥 Chọn lại khu khám
                          </Button>

                          {/* ✅ Hiển thị gợi ý các loại khám khác trong zone hiện tại */}
                          {availableExamTypes.length > 1 && (
                            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-2">
                                💡 Gợi ý: Các loại khám khác trong khu này
                              </p>
                              <div className="space-y-0.5 sm:space-y-1">
                                {availableExamTypes
                                  .filter(
                                    (et) =>
                                      et.id !== selectedExamType &&
                                      et.servicePrice?.enable
                                  )
                                  .slice(0, 3)
                                  .map((examType) => (
                                    <button
                                      key={examType.id}
                                      className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:underline py-0.5 sm:py-1"
                                      onClick={() => {
                                        setSelectedExamType(examType.id);
                                        setSelectedSpecialty(null);
                                        setSelectedChild(null);
                                        setSelectedAppointment(null);
                                        setSelectedSlot(null);
                                      }}
                                    >
                                      → {examType.name}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedSpecialty && (
                <Card ref={childRef} className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center text-base sm:text-xl">
                      <Baby className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
                      <span className="text-sm sm:text-base">
                        Bước 4: Chọn Bệnh Nhi
                      </span>
                      {selectedChild && (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                      Chọn bệnh nhi cần đặt lịch khám
                      {loadingPatient && (
                        <span className="ml-1 sm:ml-2 text-blue-600 text-xs sm:text-sm">
                          - Đang tải danh sách bệnh nhi...
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  {/* ✅ Thêm max-height và overflow-y-auto cho CardContent */}
                  <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 ">
                    {loadingPatient ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600 mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Đang tải danh sách bệnh nhi...
                        </p>
                      </div>
                    ) : patientError ? (
                      <div className="text-center py-6 sm:py-8 text-red-500">
                        <Baby className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-300" />
                        <p className="font-medium text-sm sm:text-base">
                          Lỗi tải danh sách bệnh nhi
                        </p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {patientError}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            dispatch(fetchPatientInfoByUserLogin())
                          }
                          className="text-xs sm:text-base h-8 sm:h-10 px-3 sm:px-4"
                        >
                          Thử lại
                        </Button>
                      </div>
                    ) : patientList.length > 1 ? (
                      // ✅ Hiển thị danh sách chọn khi có nhiều hơn 1 bệnh nhi
                      <div className="space-y-2 sm:space-y-3">
                        {/* ✅ Thêm container scroll riêng cho danh sách bệnh nhi */}
                        <div className="max-h-[40vh] sm:max-h-[50vh] overflow-y-auto space-y-2 sm:space-y-3 pr-1">
                          {patientList.map((patient) => {
                            const age = calculateAge(
                              patient.dateOfBirth,
                              patient.age
                            );
                            return (
                              <div
                                key={patient.id}
                                className={`p-2 sm:p-4 border rounded-lg transition-all cursor-pointer ${
                                  selectedChild === patient.id
                                    ? "border-emerald-600 bg-emerald-50"
                                    : "border-gray-200 hover:border-emerald-300"
                                }`}
                                onClick={() => {
                                  setSelectedChild(patient.id);
                                  setSelectedAppointment(null);
                                  setSelectedSlot(null);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm sm:text-lg">
                                      {patient.fullName}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {age} tuổi • {patient.genderName} •
                                      <span className="hidden sm:inline">
                                        Sinh:{" "}
                                        {new Date(
                                          patient.dateOfBirth
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                      <span className="sm:hidden">
                                        {new Date(
                                          patient.dateOfBirth
                                        ).toLocaleDateString("vi-VN", {
                                          day: "2-digit",
                                          month: "2-digit",
                                        })}
                                      </span>
                                    </p>

                                    {/* ✅ Additional patient info - Very compact on mobile */}
                                    <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                                      {patient.bhytId && (
                                        <p className="text-blue-600">
                                          💳 BHYT: {patient.bhytId}
                                        </p>
                                      )}
                                      <p className="hidden sm:block">
                                        📍 {patient.wardName},{" "}
                                        {patient.provinceName}
                                      </p>
                                      <p className="hidden sm:block">
                                        👤 {patient.jobName}
                                      </p>
                                      {patient.motherName && (
                                        <p className="hidden sm:block">
                                          👩 Mẹ: {patient.motherName} -{" "}
                                          {patient.motherPhone}
                                        </p>
                                      )}
                                      {patient.fatherName && (
                                        <p className="hidden sm:block">
                                          👨 Bố: {patient.fatherName} -{" "}
                                          {patient.fatherPhone}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* ✅ Action buttons - Compact mobile */}
                                  <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
                                    {/* Edit button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditChild(patient);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 h-7 sm:h-8 px-2 sm:px-3"
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                                      <span className="hidden sm:inline">
                                        Sửa
                                      </span>
                                    </Button>

                                    {/* Selection indicator */}
                                    {selectedChild === patient.id && (
                                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>

                                {selectedChild === patient.id && (
                                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-emerald-200">
                                    <div className="flex items-center text-xs sm:text-sm text-emerald-700">
                                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                      <span className="font-medium">
                                        Đã chọn bệnh nhi này
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          className="w-full h-8 sm:h-10 text-xs sm:text-base"
                          onClick={() => setIsChildModalOpen(true)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Thêm bệnh nhi mới
                        </Button>
                      </div>
                    ) : patientList.length === 1 ? (
                      // ✅ Hiển thị thông báo auto-select khi chỉ có 1 bệnh nhi
                      <div className="space-y-3 sm:space-y-4">
                        <div className="text-center py-4 sm:py-6 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-emerald-500" />
                          <p className="font-medium text-sm sm:text-base">
                            Tự động chọn bệnh nhi
                          </p>
                          <div className="mt-1 sm:mt-2">
                            <p className="font-medium text-base sm:text-lg">
                              {patientList[0].fullName}
                            </p>
                            <p className="text-xs sm:text-sm text-emerald-700">
                              {calculateAge(
                                patientList[0].dateOfBirth,
                                patientList[0].age
                              )}{" "}
                              tuổi • {patientList[0].genderName}
                            </p>
                            <p className="text-xs sm:text-sm text-emerald-700">
                              <span className="hidden sm:inline">Sinh: </span>
                              {new Date(
                                patientList[0].dateOfBirth
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <p className="text-xs text-emerald-600 mt-1 sm:mt-2">
                            ✅ Đã tự động chọn do chỉ có một bệnh nhi
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full h-8 sm:h-10 text-xs sm:text-base"
                          onClick={() => setIsChildModalOpen(true)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Thêm bệnh nhi mới
                        </Button>
                      </div>
                    ) : (
                      // ✅ Hiển thị khi không có bệnh nhi
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Baby className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="font-medium text-sm sm:text-base">
                          Chưa có hồ sơ bệnh nhi nào
                        </p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          Bạn cần tạo hồ sơ bệnh nhi trước khi đặt lịch khám
                        </p>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 h-8 sm:h-10 text-xs sm:text-base px-3 sm:px-4"
                          onClick={() => setIsChildModalOpen(true)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Tạo hồ sơ bệnh nhi
                        </Button>
                      </div>
                    )}

                    {/* ✅ Phần thông tin khám - Very compact mobile */}
                    {selectedChild && (
                      <div
                        ref={childInfoRef}
                        className="mt-4 sm:mt-6 p-2 sm:p-4 border border-emerald-200 rounded-lg bg-emerald-50/50"
                      >
                        <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-4">
                          Thông tin khám
                        </h4>
                        <div className="grid gap-2 sm:gap-4">
                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div>
                              <Label
                                htmlFor="weight"
                                className="text-xs sm:text-sm"
                              >
                                Cân nặng (kg) *
                              </Label>
                              <Input
                                id="weight"
                                type="number"
                                placeholder="VD: 15.5"
                                value={childWeight}
                                onChange={(e) => setChildWeight(e.target.value)}
                                className="mt-0.5 sm:mt-1 h-8 sm:h-10 text-sm"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="height"
                                className="text-xs sm:text-sm"
                              >
                                Chiều cao (cm) *
                              </Label>
                              <Input
                                id="height"
                                type="number"
                                placeholder="VD: 105"
                                value={childHeight}
                                onChange={(e) => setChildHeight(e.target.value)}
                                className="mt-0.5 sm:mt-1 h-8 sm:h-10 text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="symptom"
                              className="text-xs sm:text-sm"
                            >
                              Triệu chứng *
                            </Label>
                            <Input
                              id="symptom"
                              type="text"
                              placeholder="Mô tả triệu chứng của bệnh nhi"
                              value={childSymptom}
                              onChange={(e) => setChildSymptom(e.target.value)}
                              className="mt-0.5 sm:mt-1 h-8 sm:h-10 text-sm"
                            />
                          </div>

                          <div className="hidden sm:block">
                            <Label
                              htmlFor="requiredInformation"
                              className="text-xs sm:text-sm"
                            >
                              Thông tin cần thiết
                            </Label>
                            <Input
                              id="requiredInformation"
                              type="text"
                              placeholder="Thông tin bổ sung khác"
                              value={childRequiredInformation}
                              onChange={(e) =>
                                setChildRequiredInformation(e.target.value)
                              }
                              className="mt-0.5 sm:mt-1 h-8 sm:h-10 text-sm"
                            />
                          </div>
                        </div>

                        {/* ✅ Compact success feedback */}
                        {isChildInfoComplete && (
                          <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-emerald-100 border border-emerald-300 rounded-lg">
                            <div className="flex items-center text-emerald-700">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                              <span className="font-medium text-xs sm:text-sm">
                                Thông tin khám đã đầy đủ! Có thể chuyển sang
                                bước tiếp theo.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* ✅ Step 5: Select Appointment Slot - Show when child is selected */}
              {isChildInfoComplete && (
                <Card ref={scheduleRef} className="shadow-sm">
                  <CardHeader className="pb-2 sm:pb-6">
                    <CardTitle className="flex items-center text-base sm:text-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-emerald-600" />
                      <span className="text-sm sm:text-base">
                        Bước 5: Chọn Lịch Khám
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                      <span className="text-purple-600">
                        {currentSpecialty?.name || currentExamType?.name} - Lịch
                        khám trong 14 ngày tới
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                    {loadingSchedules ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-600 mx-auto mb-3 sm:mb-4"></div>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Đang tải lịch khám...
                        </p>
                      </div>
                    ) : groupedSpecialty.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Date & Doctor Filter Section */}
                        <div className="border-b pb-3 sm:pb-4">
                          {/* Date Filter */}
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">
                                Chọn ngày khám
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {availableDates.length} ngày có lịch khám
                                {selectedDate && (
                                  <span className="ml-1 sm:ml-2">
                                    • Đang hiển thị:
                                    <span className="font-medium text-emerald-600">
                                      {formatDateShort(selectedDate)}
                                    </span>
                                  </span>
                                )}
                              </p>
                            </div>

                            {selectedDate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(null);
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                              >
                                Hiển thị tất cả ngày
                              </Button>
                            )}
                          </div>

                          {/* Date Filter Options Grid */}
                          <div className="mt-3 sm:mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5 sm:gap-2 mb-6">
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
                                  className={`h-auto p-2 sm:p-3 flex flex-col items-center transition-all ${
                                    selectedDate === date
                                      ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                                      : "hover:bg-emerald-50 hover:border-emerald-300"
                                  }`}
                                  onClick={() => {
                                    setSelectedDate(
                                      selectedDate === date ? null : date
                                    );
                                    setSelectedSlot(null);
                                    setSelectedAppointment(null);
                                  }}
                                >
                                  <div
                                    className={`font-medium text-xs sm:text-sm ${
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
                                </Button>
                              );
                            })}
                          </div>

                          {/* ✅ Doctor Filter Section */}
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">
                                Chọn bác sĩ
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {availableDoctors.length} bác sĩ có lịch khám
                                {selectedDoctor && (
                                  <span className="ml-1 sm:ml-2">
                                    • Đang hiển thị:
                                    <span className="font-medium text-blue-600">
                                      {
                                        availableDoctors.find(
                                          (d) =>
                                            d.id?.toString() === selectedDoctor
                                        )?.name
                                      }
                                    </span>
                                  </span>
                                )}
                              </p>
                            </div>

                            {selectedDoctor && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoctor(null);
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                              >
                                Hiển thị tất cả bác sĩ
                              </Button>
                            )}
                          </div>

                          {/* ✅ Doctor Filter Options Grid */}
                          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
                            {availableDoctors.map((doctor) => {
                              const doctorSchedules = groupedSpecialty.filter(
                                (s) => s.doctorId === doctor.id
                              );
                              const totalSlots = doctorSchedules.reduce(
                                (sum, s) => sum + s.totalAvailableSlot,
                                0
                              );
                              const totalDays = new Set(
                                doctorSchedules.map((s) => s.date)
                              ).size;

                              return (
                                <Button
                                  key={doctor.id}
                                  variant={
                                    selectedDoctor === doctor.id?.toString()
                                      ? "default"
                                      : "outline"
                                  }
                                  className={`h-auto p-2 sm:p-3 flex flex-col items-start justify-start text-left transition-all ${
                                    selectedDoctor === doctor.id?.toString()
                                      ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                                      : "hover:bg-blue-50 hover:border-blue-300"
                                  }`}
                                  onClick={() => {
                                    setSelectedDoctor(
                                      selectedDoctor === doctor.id?.toString()
                                        ? null
                                        : doctor.id?.toString()
                                    );
                                    setSelectedSlot(null);
                                    setSelectedAppointment(null);
                                  }}
                                >
                                  <div
                                    className={`text-xs ${
                                      selectedDoctor === doctor.id?.toString()
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {doctor.name}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* ✅ Active Filters Display */}
                        {(selectedDate || selectedDoctor) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="text-blue-800 font-medium text-sm">
                                  Bộ lọc đang áp dụng:
                                </span>
                                {selectedDate && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-800 text-xs"
                                  >
                                    📅 {formatDateShort(selectedDate)}
                                  </Badge>
                                )}
                                {selectedDoctor && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 text-xs"
                                  >
                                    {
                                      availableDoctors.find(
                                        (d) =>
                                          d.id?.toString() === selectedDoctor
                                      )?.name
                                    }
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(null);
                                  setSelectedDoctor(null);
                                  setSelectedSlot(null);
                                  setSelectedAppointment(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 h-6 sm:h-7 text-xs px-2"
                              >
                                Xóa tất cả
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Display filtered schedules */}
                        {filteredSchedules.length > 0 ? (
                          <div className="space-y-4 sm:space-y-6 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                            {/* ✅ Header thông tin ngày đã chọn */}
                            {selectedDate && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-3">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 mr-1 sm:mr-2" />
                                  <span className="font-medium text-emerald-800 text-sm sm:text-base">
                                    Lịch khám ngày {formatDate(selectedDate)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* ✅ Danh sách lịch khám đầy đủ */}
                            {filteredSchedules.map((schedule, index) => (
                              <div
                                key={schedule.id || index}
                                className={`border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all ${
                                  selectedAppointment === schedule.id
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-gray-200 hover:border-emerald-300"
                                }`}
                              >
                                {/* ✅ Header thông tin ca khám */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-base sm:text-lg">
                                        {formatDate(schedule.date)}
                                      </h4>
                                      {selectedAppointment === schedule.id && (
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      )}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-gray-600 text-xs sm:text-sm flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {schedule.dayName} -{" "}
                                        {schedule.examinationName}
                                      </p>
                                      <p className="text-gray-600 text-xs sm:text-sm flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Ca khám: {schedule.timeStart} -{" "}
                                        {schedule.timeEnd}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2 mt-2 sm:mt-0">
                                    {schedule.totalAvailableSlot > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs text-green-600"
                                      >
                                        {
                                          schedule.appointmentSlots.filter(
                                            (slot) => slot.isAvailable
                                          ).length
                                        }{" "}
                                        khung giờ
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* ✅ Thông tin bác sĩ và phòng khám */}
                                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <p className="text-xs sm:text-sm flex items-center">
                                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600" />
                                      <span className="text-gray-600">
                                        Bác sĩ:
                                      </span>
                                      <span className="font-medium ml-1 text-blue-800">
                                        {schedule.doctorName}
                                      </span>
                                    </p>
                                    <p className="text-xs sm:text-sm flex items-center">
                                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-600" />
                                      <span className="text-gray-600">
                                        Phòng:
                                      </span>
                                      <span className="font-medium ml-1 text-purple-800">
                                        {schedule.roomName}
                                      </span>
                                    </p>
                                  </div>

                                  {/* ✅ Thông tin dịch vụ và giá */}
                                  {schedule.servicePrices &&
                                    schedule.servicePrices.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                          💰 Giá dịch vụ:
                                        </p>
                                        <div className="flex flex-wrap gap-1 sm:gap-2">
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

                                {/* ✅ Khung giờ khám chi tiết */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-sm sm:text-base text-gray-900">
                                      ⏰ Chọn khung giờ khám
                                    </h5>
                                  </div>

                                  {/* ✅ Grid khung giờ responsive */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
                                    {schedule.appointmentSlots.map((slot) => (
                                      <Button
                                        key={slot.slotId}
                                        variant={
                                          selectedSlot === slot.slotId
                                            ? "default"
                                            : "outline"
                                        }
                                        className={`h-auto p-2 sm:p-3 transition-all ${
                                          selectedSlot === slot.slotId
                                            ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-md"
                                            : slot.isAvailable
                                            ? "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
                                            : "opacity-50 cursor-not-allowed bg-gray-100"
                                        }`}
                                        onClick={() => {
                                          if (!slot.isAvailable) return;

                                          // ✅ Log chi tiết thông tin booking
                                          console.log(
                                            "=== APPOINTMENT SLOT SELECTION ==="
                                          );
                                          console.log("Slot ID:", slot.slotId);
                                          console.log(
                                            "Schedule ID:",
                                            schedule.id
                                          );
                                          console.log(
                                            "Patient ID:",
                                            selectedChild
                                          );

                                          const bookingData = {
                                            timeSlotId: slot.slotId,
                                            patientId: selectedChild,
                                            symptom: childSymptom || "",
                                            requiredInformation:
                                              childRequiredInformation || "",
                                            statusPayment: 0,
                                            orderId: "",
                                            weight:
                                              parseFloat(childWeight) || 0,
                                            height:
                                              parseFloat(childHeight) || 0,
                                            status: childStatus || 0,
                                            appointmentSlotId: slot.slotId,
                                            scheduleId: schedule.id,
                                            slotStartTime: slot.startSlot,
                                            slotEndTime: slot.endSlot,
                                            doctorName: schedule.doctorName,
                                            roomName: schedule.roomName,
                                            date: schedule.date,
                                            zoneId: selectedZone,
                                            examTypeId: selectedExamType,
                                            specialtyId: selectedSpecialty,
                                            servicePrice: currentServicePrice,
                                          };

                                          console.log(
                                            "Booking Data:",
                                            bookingData
                                          );
                                          console.log("=== END SELECTION ===");

                                          setSelectedSlot(slot.slotId);
                                          setSelectedAppointment(schedule.id);
                                        }}
                                        disabled={!slot.isAvailable}
                                      >
                                        <div className="text-center w-full">
                                          <div
                                            className={`font-medium text-xs sm:text-sm ${
                                              selectedSlot === slot.slotId
                                                ? "text-white"
                                                : slot.isAvailable
                                                ? "text-gray-900"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {slot.startSlot}
                                          </div>
                                          <div
                                            className={`text-xs ${
                                              selectedSlot === slot.slotId
                                                ? "text-emerald-100"
                                                : slot.isAvailable
                                                ? "text-gray-600"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {slot.endSlot}
                                          </div>
                                          <div
                                            className={`text-xs mt-0.5 sm:mt-1 ${
                                              selectedSlot === slot.slotId
                                                ? "text-emerald-200"
                                                : slot.isAvailable
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                            }`}
                                          >
                                            {slot.availableSlot}/
                                            {slot.totalSlot}
                                          </div>

                                          {/* ✅ Hiển thị trạng thái */}
                                          {!slot.isAvailable && (
                                            <div className="text-xs text-red-500 font-medium mt-0.5">
                                              Hết chỗ
                                            </div>
                                          )}
                                          {selectedSlot === slot.slotId && (
                                            <div className="text-xs text-white font-medium mt-0.5">
                                              ✓ Đã chọn
                                            </div>
                                          )}
                                        </div>
                                      </Button>
                                    ))}
                                  </div>

                                  {/* ✅ Thông tin bổ sung về khung giờ */}
                                  {schedule.appointmentSlots.filter(
                                    (slot) => slot.isAvailable
                                  ).length === 0 && (
                                    <div className="text-center py-3 text-gray-500 bg-gray-50 rounded-lg">
                                      <p className="text-sm">
                                        ❌ Tất cả khung giờ đã hết chỗ
                                      </p>
                                      <p className="text-xs mt-1">
                                        Vui lòng chọn ca khám khác
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* ✅ Thông báo khi đã chọn slot */}
                                {selectedSlot &&
                                  selectedAppointment === schedule.id && (
                                    <div className="mt-3 p-2 sm:p-3 bg-emerald-100 border border-emerald-300 rounded-lg">
                                      <div className="flex items-center text-emerald-700">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        <span className="font-medium text-sm">
                                          ✅ Đã chọn khung giờ{" "}
                                          {
                                            schedule.appointmentSlots.find(
                                              (s) => s.slotId === selectedSlot
                                            )?.startSlot
                                          }{" "}
                                          -{" "}
                                          {
                                            schedule.appointmentSlots.find(
                                              (s) => s.slotId === selectedSlot
                                            )?.endSlot
                                          }
                                        </span>
                                      </div>
                                      <p className="text-xs text-emerald-600 mt-1">
                                        Bác sĩ {schedule.doctorName} • Phòng{" "}
                                        {schedule.roomName}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // ✅ Trạng thái không có lịch khám
                          <div className="text-center py-6 sm:py-8 text-gray-500">
                            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                            <p className="font-medium text-sm sm:text-base">
                              Không có lịch khám phù hợp
                            </p>
                            <p className="text-xs sm:text-sm">
                              {selectedDate && selectedDoctor
                                ? `Ngày ${formatDateShort(selectedDate)} và  ${
                                    availableDoctors.find(
                                      (d) => d.id?.toString() === selectedDoctor
                                    )?.name
                                  } không có lịch khám`
                                : selectedDate
                                ? `Ngày ${formatDateShort(
                                    selectedDate
                                  )} không có lịch khám`
                                : selectedDoctor
                                ? ` ${
                                    availableDoctors.find(
                                      (d) => d.id?.toString() === selectedDoctor
                                    )?.name
                                  } không có lịch khám`
                                : "Không có lịch khám nào"}
                            </p>
                            <Button
                              variant="outline"
                              className="mt-3 sm:mt-4 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                              onClick={() => {
                                setSelectedDate(null);
                                setSelectedDoctor(null);
                              }}
                            >
                              Xem tất cả lịch khám
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="font-medium text-sm sm:text-base">
                          Không có lịch khám nào
                        </p>
                        <p className="text-xs sm:text-sm">
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
              <Card className="sticky top-24" ref={confirmButtonRef}>
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

                  {/* ✅ Display patient info in summary */}
                  {selectedChild && (
                    <div>
                      <p className="text-sm text-gray-600">Bệnh nhi</p>
                      <div className="mt-1">
                        {(() => {
                          const patient = patientList.find(
                            (c) => c.id === selectedChild
                          );
                          if (patient) {
                            const age = calculateAge(
                              patient.dateOfBirth,
                              patient.age
                            );
                            return (
                              <div>
                                <p className="font-medium">
                                  {patient.fullName}
                                </p>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>
                                    {age} tuổi • {patient.genderName}
                                  </p>
                                  <p>
                                    Sinh:
                                    {new Date(
                                      patient.dateOfBirth
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                  {patient.bhytId && (
                                    <p className="text-blue-600">
                                      BHYT: {patient.bhytId}
                                    </p>
                                  )}
                                  <p>
                                    📍 {patient.wardName},{patient.provinceName}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      {childWeight && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cân nặng: {childWeight} kg
                        </p>
                      )}
                      {childHeight && (
                        <p className="text-xs text-gray-500">
                          Chiều cao: {childHeight} cm
                        </p>
                      )}
                      {childSymptom && (
                        <p className="text-xs text-gray-500">
                          Triệu chứng: {childSymptom}
                        </p>
                      )}
                      {childRequiredInformation && (
                        <p className="text-xs text-gray-500">
                          Thông tin: {childRequiredInformation}
                        </p>
                      )}
                    </div>
                  )}

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
                          const schedule = groupedSpecialty.find((schedule) =>
                            schedule.appointmentSlots.some(
                              (slot) => slot.slotId === selectedSlot
                            )
                          );
                          if (schedule) {
                            const slot = schedule.appointmentSlots.find(
                              (s) => s.slotId === selectedSlot
                            );
                            if (slot) {
                              return (
                                <div>
                                  <div>{formatDate(schedule.date)}</div>
                                  <div>
                                    {slot.startSlot} - {slot.endSlot}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {schedule.doctorName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {schedule.roomName}
                                  </div>
                                </div>
                              );
                            }
                          }
                          return "Đang tải...";
                        })()}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={
                      !selectedSlot ||
                      !selectedChild ||
                      !hasAvailableService ||
                      loadingRegistration ||
                      showPendingWarning
                    }
                    onClick={async () => {
                      if (
                        !selectedChild ||
                        !selectedAppointment ||
                        !selectedSlot
                      )
                        return;

                      const selectedChildData = patientList.find(
                        (p) => p.id === selectedChild
                      );
                      const selectedScheduleData = groupedSpecialty.find(
                        (s) => s.id === selectedAppointment
                      );
                      const selectedSlotData =
                        selectedScheduleData?.appointmentSlots.find(
                          (s) => s.slotId === selectedSlot
                        );

                      if (
                        !selectedChildData ||
                        !selectedScheduleData ||
                        !selectedSlotData
                      ) {
                        toast({
                          title: "Lỗi dữ liệu",
                          description:
                            "Không tìm thấy thông tin cần thiết. Vui lòng thử lại.",
                          variant: "destructive",
                        });
                        return;
                      }
                      // ✅ Tạo API payload
                      const apiPayload: AddOnlineRegistrationDto = {
                        appointmentSlotId: selectedSlot,
                        patientId: selectedChild,
                        symptom: childSymptom || "",
                        requiredInformation: childRequiredInformation || "",
                        weight: parseFloat(childWeight) || 0,
                        height: parseFloat(childHeight) || 0,
                        patientEscortName:
                          selectedChildData.motherName ||
                          userInfo?.fullName ||
                          "",
                        patientEscortPhone:
                          selectedChildData.motherPhone ||
                          userInfo?.phoneNumber ||
                          "",
                        patientEscortRelationship: selectedChildData.motherName
                          ? "Mẹ"
                          : "Người giám hộ",
                      };
                      // ✅ Tạo appointment object trước
                      const newAppointment = {
                        id: Date.now().toString(), // Temporary ID
                        childId: selectedChild,
                        childName: selectedChildData.fullName,
                        doctorId:
                          selectedScheduleData.doctorId?.toString() ||
                          selectedScheduleData.id.toString(),
                        doctorName: selectedScheduleData.doctorName,
                        specialty:
                          currentSpecialty?.name || currentExamType?.name || "",
                        date: selectedScheduleData.date,
                        time: selectedSlotData.startSlot,
                        status: "pending" as const,
                        location: selectedScheduleData.roomName,
                        childWeight,
                        childHeight,
                        childStatus,
                        childSymptom,
                        childRequiredInformation,
                        zoneId: selectedZone,
                        examTypeId: selectedExamType,
                        specialtyId: selectedSpecialty,
                        scheduleId: selectedAppointment,
                        slotId: selectedSlot,
                        servicePrice: currentServicePrice?.price || 0,
                        serviceName: currentServicePrice?.name || "",
                      };
                      console.log("=== API BOOKING PAYLOAD ===");
                      console.log(
                        "POST /api/online-registration/create:",
                        JSON.stringify(apiPayload, null, 2)
                      );

                      try {
                        // ✅ Gọi API tạo đăng ký
                        const result = await dispatch(
                          createOnlineRegistrationThunk({
                            payload: apiPayload,
                            isQR: true,
                          })
                        ).unwrap();

                        console.log("result", result);

                        // ✅ Tạo appointment object
                        const newAppointment = {
                          id: result.id?.toString() || Date.now().toString(),
                          childId: selectedChild,
                          childName: selectedChildData.fullName,
                          doctorId:
                            selectedScheduleData.doctorId?.toString() ||
                            selectedScheduleData.id.toString(),
                          doctorName: selectedScheduleData.doctorName,
                          specialty:
                            currentSpecialty?.name ||
                            currentExamType?.name ||
                            "",
                          date: selectedScheduleData.date,
                          time: selectedSlotData.startSlot,
                          status: "pending" as const,
                          location: selectedScheduleData.roomName,
                          childWeight,
                          childHeight,
                          childStatus,
                          childSymptom,
                          childRequiredInformation,
                          zoneId: selectedZone,
                          examTypeId: selectedExamType,
                          specialtyId: selectedSpecialty,
                          scheduleId: selectedAppointment,
                          slotId: selectedSlot,
                          servicePrice: currentServicePrice?.price || 0,
                          serviceName: currentServicePrice?.name || "",
                          registrationId: result.id,
                          orderId: result.orderId,
                        };
                        // ✅ Update appointment with real ID
                        const finalAppointment = {
                          ...newAppointment,
                          id: result.id?.toString() || newAppointment.id,
                          registrationId: result.id,
                          orderId: result.orderId,
                        };

                        // ✅ Gọi handler với tất cả data cần thiết
                        await handleRegistrationSuccess(
                          result,
                          selectedChildData,
                          selectedScheduleData,
                          selectedSlotData,
                          finalAppointment
                        );
                        navigate("/payment", {
                          state: {
                            registrationData: result, // ✅ Thêm toàn bộ response từ API
                            appointmentData: newAppointment,
                            patientData: selectedChildData,
                            scheduleData: selectedScheduleData,
                            slotData: selectedSlotData,
                            serviceData: currentServicePrice,
                            examTypeData: currentExamType,
                            specialtyData: currentSpecialty,
                            zoneData: currentZone,
                          },
                        });
                      } catch (error: any) {
                        console.error(
                          "❌ Failed to create registration:",
                          error
                        );
                        toast({
                          title: "Lỗi đặt lịch khám",
                          description: error.message || "Vui lòng thử lại sau",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {loadingRegistration ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : !hasAvailableService ? (
                      "Chưa có dịch vụ khả dụng"
                    ) : !selectedChild ? (
                      "Chọn bệnh nhi trước"
                    ) : !selectedSlot ? (
                      "Chọn thời gian khám"
                    ) : (
                      "Xác nhận đặt lịch"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Updated Child Profile Modal with correct props */}
      <ChildProfileModal
        isOpen={isChildModalOpen}
        onClose={() => {
          setIsChildModalOpen(false);
          setEditingChild(null);
          setSelectedChildId(null);
        }}
        onSubmit={handleChildModalSubmit}
        initialData={editingChild || undefined}
        isEditing={!!editingChild}
        loading={loadingPatient}
        userInfo={userInfo}
      />
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
