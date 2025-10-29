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
  Baby,
  Plus,
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
  createOrUpdatePatientThunk, // ✅ Add this import
  type GroupedSpecialtyResponse,
  type ServicePrice,
  type YouMed_PatientCreateDto, // ✅ Add this import
} from "@/store/slices/bookingCatalogSlice";
import { useAppSelector } from "@/hooks/redux";
import ChildProfileModal from "@/components/modals/ChildProfileModal";
import { getUserInfo } from "@/store/slices/locationSlice";

const BookingFlow = () => {
  // ✅ Add Redux hooks with specialty support
  const dispatch = useAppDispatch();
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

  // ✅ Get params from URL
  const { zoneId: zoneIdParam, examTypeId: examTypeIdParam } = useParams<{
    zoneId: string;
    examTypeId: string;
  }>(); // ✅ Get Redux state
  const {
    userInfo,
    provinces,
    wards,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);

  // ✅ Get childId from URL if provided
  const searchParams = new URLSearchParams(window.location.search);
  const childIdFromUrl = searchParams.get("childId");
  const [editingChild, setEditingChild] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  console.log("patientList from store:", patientList);

  // ✅ Updated state management - proper order
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

  // ✅ Changed to number to match patientList id type
  const [selectedChild, setSelectedChild] = useState<number | null>(() => {
    if (childIdFromUrl && !isNaN(parseInt(childIdFromUrl))) {
      return parseInt(childIdFromUrl);
    }
    return null;
  });

  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ✅ Add modal state for creating new child profile
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

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

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

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

  // ✅ Handle child profile creation success
  const handleChildCreated = (newChildId: number) => {
    console.log("New child created with ID:", newChildId);
    // Refresh patient list to include the new child
    dispatch(fetchPatientInfoByUserLogin());
    // Auto-select the newly created child
    setSelectedChild(newChildId);
    // Close modal
    setIsChildModalOpen(false);
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    console.log("Editing child:", patient);
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };

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

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

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

  // ✅ Handle child profile creation success
  const handleChildCreated = (newChildId: number) => {
    console.log("New child created with ID:", newChildId);
    // Refresh patient list to include the new child
    dispatch(fetchPatientInfoByUserLogin());
    // Auto-select the newly created child
    setSelectedChild(newChildId);
    // Close modal
    setIsChildModalOpen(false);
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    console.log("Editing child:", patient);
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };

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

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

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

  // ✅ Handle child profile creation success
  const handleChildCreated = (newChildId: number) => {
    console.log("New child created with ID:", newChildId);
    // Refresh patient list to include the new child
    dispatch(fetchPatientInfoByUserLogin());
    // Auto-select the newly created child
    setSelectedChild(newChildId);
    // Close modal
    setIsChildModalOpen(false);
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    console.log("Editing child:", patient);
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };

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

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

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

  // ✅ Handle child profile creation success
  const handleChildCreated = (newChildId: number) => {
    console.log("New child created with ID:", newChildId);
    // Refresh patient list to include the new child
    dispatch(fetchPatientInfoByUserLogin());
    // Auto-select the newly created child
    setSelectedChild(newChildId);
    // Close modal
    setIsChildModalOpen(false);
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    console.log("Editing child:", patient);
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };

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

  // ✅ Update availability check
  const hasAvailableService = !!currentServicePrice;

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

  // ✅ Handle child profile creation success
  const handleChildCreated = (newChildId: number) => {
    console.log("New child created with ID:", newChildId);
    // Refresh patient list to include the new child
    dispatch(fetchPatientInfoByUserLogin());
    // Auto-select the newly created child
    setSelectedChild(newChildId);
    // Close modal
    setIsChildModalOpen(false);
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
      console.log("Child profile data:", data);
      
      // ✅ Create proper API payload using YouMed_PatientCreateDto structure
      const patientDto: YouMed_PatientCreateDto = {
        id: editingChild?.id || 0, // 0 for new, actual ID for update
        patientId: editingChild?.patientId || null,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth 
          ? new Date(data.dateOfBirth).toISOString()
          : new Date().toISOString(),
        genderId: data.genderId,
        nationalId: data.nationalId || "01", // Default to "Kinh"
        jobId: data.jobId || "001", // Default job
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

      console.log("Sending patient data to API:", patientDto);

      if (editingChild) {
        // ✅ Update existing child
        console.log("Updating child:", editingChild.id);
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Update response:", response);

        // Show success message
        toast({
          title: "Thành công! ✅",
          description: `Cập nhật hồ sơ ${data.fullName} thành công`,
        });
      } else {
        // ✅ Create new child
        console.log("Creating new child");
        
        const response = await dispatch(createOrUpdatePatientThunk(patientDto)).unwrap();
        console.log("Create response:", response);

        // Auto-select the newly created child if we get an ID back
        if (response?.id) {
          setSelectedChild(response.id);
          console.log("Auto-selected new child:", response.id);
        }

        // Show success message
        toast({
          title: "Thành công! ✅", 
          description: `Thêm hồ sơ ${data.fullName} thành công`,
        });
      }

      // ✅ Refresh patient list after successful create/update
      await dispatch(fetchPatientInfoByUserLogin()).unwrap();
      console.log("Patient list refreshed");

      // Close modal and reset state
      setIsChildModalOpen(false);
      setEditingChild(null);
      setSelectedChildId(null);

    } catch (error: any) {
      console.error("Error handling child profile:", error);
      
      // ✅ Better error handling
      let errorMessage = editingChild 
        ? "Không thể cập nhật hồ sơ bệnh nhi"
        : "Không thể tạo hồ sơ bệnh nhi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error toast
      toast({
        title: "Lỗi! ❌",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't close modal on error so user can fix and retry
      console.log("Modal remains open for user to retry");
    }
  };

  // ✅ Add edit child handler for the cards
  const handleEditChild = (patient: any) => {
    console.log("Editing child:", patient);
    setEditingChild(patient);
    setSelectedChildId(patient.id);
    setIsChildModalOpen(true);
  };

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
                "Chọn khu khám, loại khám, chuyên khoa, bệnh nhi và thời gian phù hợp"
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

          {/* ✅ FIXED Progress Steps - 5 steps with correct order */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-12">
            {/* Step 1: Zone Selection */}
            <div
              className={`flex items-center ${
                selectedZone ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  selectedZone ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedZone ? (
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  "1"
                )}
              </div>
              <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-base hidden md:inline">
                Khu khám
              </span>
            </div>

            {/* Step 2: ExamType Selection */}
            <div
              className={`flex items-center ${
                selectedExamType ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  selectedExamType ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedExamType ? (
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  "2"
                )}
              </div>
              <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-base hidden md:inline">
                Loại khám
              </span>
            </div>

            {/* Step 3: Specialty Selection */}
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
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  selectedSpecialty
                    ? "bg-emerald-600 text-white"
                    : !loadingSpecialties && specialties.length === 0
                    ? "bg-red-200 text-red-600"
                    : "bg-gray-200"
                }`}
              >
                {selectedSpecialty ? (
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  "3"
                )}
              </div>
              <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-base hidden md:inline">
                Chuyên khoa
              </span>
            </div>

            {/* Step 4: Child Selection */}
            <div
              className={`flex items-center ${
                selectedChild ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  selectedChild ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedChild ? (
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  "4"
                )}
              </div>
              <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-base hidden md:inline">
                Bệnh nhi
              </span>
            </div>

            {/* Step  5: Time Selection */}
            <div
              className={`flex items-center ${
                selectedSlot ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  selectedSlot ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                {selectedSlot ? (
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  "5"
                )}
              </div>
              <span className="ml-1 sm:ml-2 font-medium text-xs sm:text-base hidden md:inline">
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
                      setSelectedChild(null);
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

              {/* Step 2: Select Exam Type */}
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
                    </CardHeader>
                  </CardDescription>
                  <CardContent>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại khám" />
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
                                <div className="font-medium">
                                  {examType.name}
                                </div>
                                {examType.description && (
                                  <div className="text-sm text-gray-500">
                                    {examType.description}
                                  </div>
                                )}
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

              {/* Step 3: Select Specialty */}
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
                          setSelectedChild(null);
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
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">Không có chuyên khoa nào</p>
                        <p className="text-sm">
                          Loại khám này chưa có chuyên khoa được cấu hình
                        </p>
                        <p className="text-sm text-orange-600 mt-2">
                          ⚠️ Bước này bị vô hiệu hóa - Sẽ chuyển thẳng sang bệnh
                          nhi
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ Step 4: Select Child - Show when specialty is selected OR when no specialties available but service is available */}
              {(selectedSpecialty ||
                (selectedExamType &&
                  hasAvailableService &&
                  specialties.length === 0 &&
                  !loadingSpecialties)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Baby className="w-5 h-5 mr-2 text-emerald-600" />
                      Bước 4: Chọn Bệnh Nhi
                      {selectedChild && (
                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Chọn bệnh nhi cần đặt lịch khám
                      {loadingPatient && (
                        <span className="ml-2 text-blue-600">
                          - Đang tải danh sách bệnh nhi...
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingPatient ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          Đang tải danh sách bệnh nhi...
                        </p>
                      </div>
                    ) : patientError ? (
                      <div className="text-center py-8 text-red-500">
                        <Baby className="w-12 h-12 mx-auto mb-4 text-red-300" />
                        <p className="font-medium">Lỗi tải danh sách bệnh nhi</p>
                        <p className="text-sm mb-4">{patientError}</p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            dispatch(fetchPatientInfoByUserLogin())
                          }
                        >
                          Thử lại
                        </Button>
                      </div>
                    ) : patientList.length > 0 ? (
                      <div className="space-y-3">
                        {patientList.map((patient) => {
                          const age = calculateAge(
                            patient.dateOfBirth,
                            patient.age
                          );
                          return (
                            <div
                              key={patient.id}
                              onClick={() => setSelectedChild(patient.id)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedChild === patient.id
                                  ? "border-emerald-600 bg-emerald-50"
                                  : "border-gray-200 hover:border-emerald-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">
                                    {patient.fullName}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {age} tuổi • {patient.genderName} • Sinh:{" "}
                                    {new Date(
                                      patient.dateOfBirth
                                    ).toLocaleDateString("vi-VN")}
                                  </p>

                                  {/* ✅ Additional patient info */}
                                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                                    {patient.bhytId && (
                                      <p className="text-blue-600">
                                        💳 BHYT: {patient.bhytId}
                                      </p>
                                    )}
                                    <p>
                                      📍 {patient.wardName},{" "}
                                      {patient.provinceName}
                                    </p>
                                    <p>👤 {patient.jobName}</p>
                                    {patient.motherName && (
                                      <p>
                                        👩 Mẹ: {patient.motherName} -{" "}
                                        {patient.motherPhone}
                                      </p>
                                    )}
                                    {patient.fatherName && (
                                      <p>
                                        👨 Bố: {patient.fatherName} -{" "}
                                        {patient.fatherPhone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {selectedChild === patient.id && (
                                  <CheckCircle className="w-6 h-6 text-emerald-600 ml-4 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* ✅ Updated button to open modal instead of navigating */}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsChildModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm bệnh nhi mới
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Baby className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">
                          Chưa có hồ sơ bệnh nhi nào
                        </p>
                        <p className="text-sm mb-4">
                          Bạn cần tạo hồ sơ bệnh nhi trước khi đặt lịch khám
                        </p>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setIsChildModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo hồ sơ bệnh nhi
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ✅ Step 5: Select Appointment Slot - Show when child is selected */}
              {selectedChild && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                      Bước 5: Chọn Lịch Khám
                    </CardTitle>
                    <CardDescription>
                      <span className="text-purple-600">
                        {currentSpecialty?.name || currentExamType?.name} - Lịch
                        khám trong 14 ngày tới
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
                        {/* Date Filter Section */}
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

                            {selectedDate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(null);
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
                        </div>

                        {/* Display filtered schedules */}
                        {filteredSchedules.length > 0 ? (
                          <div className="space-y-6">
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

                                {/* Doctor and Room info */}
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

                                {/* Appointment Slots */}
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
                                    Sinh:{" "}
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
                                    📍 {patient.wardName},{" "}
                                    {patient.provinceName}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
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
                                    BS. {schedule.doctorName}
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
                      !selectedSlot || !selectedChild || !hasAvailableService
                    }
                    onClick={() => {
                      if (selectedChild && selectedSlot) {
                        console.log("Booking confirmation:", {
                          patient: patientList.find(
                            (c) => c.id === selectedChild
                          ),
                          zone: currentZone,
                          examType: currentExamType,
                          specialty: currentSpecialty,
                          slot: selectedSlot,
                        });
                        alert("Chức năng đặt lịch sẽ được triển khai!");
                      }
                    }}
                  >
                    {!hasAvailableService
                      ? "Chưa có dịch vụ khả dụng"
                      : !selectedChild
                      ? "Chọn bệnh nhi trước"
                      : !selectedSlot
                      ? "Chọn thời gian khám"
                      : "Xác nhận đặt lịch"}
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
