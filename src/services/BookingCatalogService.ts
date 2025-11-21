import {
  getJSONAuth,
  fetchData,
  postJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

// ✅ Interface cho Patient Create DTO
export interface YouMed_PatientCreateDto {
  id?: number;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: number; // 0: Nam, 1: Nữ, 2: Khác
  address?: string;
  identityNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
}
// ✅ Interface cho Online Registration Item - UPDATED với thêm fields từ API
export interface OnlineRegistrationItem {
  // ✅ Core registration fields
  id: number;
  onlineRegistrationIdHis?: string | null;
  orderId?: string | null;
  cancel: boolean;
  confirm: boolean;
  patientId: number;
  symptom: string;
  requiredInformation: string;
  statusPayment: number; // 0: Chưa thanh toán, 1: Đã thanh toán, 2: Đã hoàn tiền
  registrationId?: string | null;
  registrationDate: string; // "03/11/2025 00:00"
  weight: number;
  height: number;
  status: number; // 0: Chờ khám, 1: Đã khám, 2: Hoàn thành, 3: Đã hủy
  type: number; // 1: Người dùng, 2: YouMed, 4: Admin
  typeName: string; // "Người dùng", "YouMed", "Admin"
  dateCreate: string; // "2025-10-31T18:48:44.042923"
  dateUpdate: string; // "2025-10-31T18:48:44.042923"
  timeSlotId?: number | null;
  logs?: any | null;
  createBy: number; // ID của người tạo
  patientEscortName?: string | null;
  patientEscortPhone?: string | null;
  patientEscortRelationship?: string | null;
  isCertificate?: boolean | null;
  cancelApprovalStatus?: number | null;
  cancelApprovalStatusName?: string | null;

  // ✅ NEW: Nested objects
  patient: PatientInfo;
  paymentTransaction?: PaymentTransaction | null;
  timeSlot?: TimeSlot | null;

  // ✅ Keep existing optional fields for backward compatibility
  patientName?: string;
  appointmentSlotId?: number;
  createdAt?: string;
  updatedAt?: string;
  paymentStatus?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
  specialtyName?: string;
  roomName?: string;
  totalAmount?: number;
  examinationName?: string;
  zoneName?: string;
}
// ✅ Interface cho Patient object
export interface PatientInfo {
  cccd?: string | null;
  noiDKKCBId?: string | null;
  motherName?: string | null;
  motherPhone?: string | null;
  motherCCCD?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  fatherCCCD?: string | null;
  isGuardian: boolean;
  age: number;
  yearOfBirth: number;
  genderName?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
  nationalName?: string | null;
  jobName?: string | null;
  id: number;
  patientId?: string | null;
  fullName: string;
  dateOfBirth: string;
  genderId: number;
  nationalId?: number | null;
  jobId?: number | null;
  provinceCode?: string | null;
  wardCode?: string | null;
  address?: string | null;
  bhytId?: string | null;
  licenseDate?: string | null;
} // ✅ Interface cho PaymentTransaction object
export interface PaymentTransaction {
  id?: number;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTime?: string;
  refundAmount?: number;
  refundTime?: string;
  gatewayResponse?: any;
  createdAt?: string;
  updatedAt?: string;
} // ✅ Interface cho TimeSlot object
export interface TimeSlot {
  id: number;
  appointmentSlotId: number;
  startSlot: string; // "07:00:00"
  endSlot: string; // "08:00:00"
  clinicScheduleId: number;
  roomId: number;
  roomName: string; // "PK Nội Tim mạch"
  doctorId: number;
  doctorName: string; // "ĐD. TRẦN LÊ ANH TRÂM"
  examinationId: number;
  examinationName: string; // "Ca 1"
  examTypeId: number;
  examTypeName: string; // "Khám Tâm Lý"
  departmentId: number;
  departmentName: string; // "Tâm lý - Vật lý trị liệu"
  specialtyId: number;
  specialtyName: string; // "Tâm Lý"
  zoneId: number;
  zoneName: string; // "Khu khám Nguyễn Du"
  dateInWeek: string; // "2025-11-03T00:00:00"
  stt: number; // Số thứ tự
}
// ✅ Interface cho List Response - THÊM MỚI (nếu cần)
export interface OnlineRegistrationListResponse {
  registrations: OnlineRegistrationItem[];
  total: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// ✅ Interface cho Cancel Response - THÊM MỚI
export interface CancelRegistrationResponse {
  success: boolean;
  message: string;
  registrationId: number;
  canceledAt: string;
  refundInfo?: {
    amount: number;
    refundStatus: string;
    refundTime?: string;
  };
}
// ✅ Interface cho query parameters
export interface BookingCatalogQueryParams {
  isEnable?: boolean;
  examTypeId?: number;
  specialtyId?: number;
  patientId?: number;
  appointmentSlotId?: number;
}

// ✅ Interface cho Online Registration DTO
export interface AddOnlineRegistrationDto {
  appointmentSlotId: number;
  patientId: number;
  symptom: string;
  requiredInformation: string;
  weight: number;
  height: number;
  patientEscortName: string;
  patientEscortPhone: string;
  patientEscortRelationship: string;
}

// ✅ Interface cho Online Registration Response
export interface OnlineRegistrationResponse {
  id: number;
  appointmentSlotId: number;
  patientId: number;
  symptom: string;
  requiredInformation: string;
  weight: number;
  height: number;
  patientEscortName: string;
  patientEscortPhone: string;
  patientEscortRelationship: string;
  status: string;
  createdAt: string;
  orderId?: string;
  paymentUrl?: string;
}

// ✅ Interface cho Payment Confirmation Request
export interface PaymentConfirmationRequest {
  orderId: string;
  transactionId?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  paymentTime?: string;
}

// ✅ Interface cho Payment Confirmation Response
export interface PaymentConfirmationResponse {
  success: boolean;
  message: string;
  registrationId?: number;
  paymentStatus?: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  paymentTime?: string;
  data?: any;
}
// ✅ Helper functions để extract thông tin từ nested objects
export const getPatientDisplayName = (
  registration: OnlineRegistrationItem
): string => {
  return (
    registration.patient?.fullName ||
    registration.patientName ||
    `Bệnh nhân #${registration.patientId}`
  );
};

export const getPatientAge = (
  registration: OnlineRegistrationItem
): number | string => {
  if (registration.patient?.age && registration.patient.age > 0) {
    return registration.patient.age;
  }

  // Calculate from dateOfBirth if available
  if (registration.patient?.dateOfBirth) {
    const birthDate = new Date(registration.patient.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  }

  return "N/A";
};
export const getGenderDisplay = (
  registration: OnlineRegistrationItem
): string => {
  if (registration.patient?.genderName) {
    return registration.patient.genderName;
  }

  switch (registration.patient?.genderId) {
    case 0:
      return "Nam";
    case 1:
      return "Nữ";
    case 2:
      return "Khác";
    default:
      return "N/A";
  }
};
export const getDoctorInfo = (
  registration: OnlineRegistrationItem
): {
  name: string;
  room: string;
  department: string;
  specialty: string;
} => {
  return {
    name: registration.timeSlot?.doctorName || registration.doctorName || "N/A",
    room: registration.timeSlot?.roomName || registration.roomName || "N/A",
    department: registration.timeSlot?.departmentName || "N/A",
    specialty:
      registration.timeSlot?.specialtyName ||
      registration.specialtyName ||
      "N/A",
  };
};

export const getAppointmentSchedule = (
  registration: OnlineRegistrationItem
): {
  date: string;
  timeSlot: string;
  examination: string;
  zone: string;
} => {
  const timeSlot = registration.timeSlot;

  return {
    date: timeSlot?.dateInWeek
      ? new Date(timeSlot.dateInWeek).toLocaleDateString("vi-VN")
      : registration.registrationDate.split(" ")[0],
    timeSlot: timeSlot ? `${timeSlot.startSlot} - ${timeSlot.endSlot}` : "N/A",
    examination:
      timeSlot?.examinationName || registration.examinationName || "N/A",
    zone: timeSlot?.zoneName || registration.zoneName || "N/A",
  };
};

export const getAppointmentStatus = (
  registration: OnlineRegistrationItem
): {
  hasTimeSlot: boolean;
  isScheduled: boolean;
  appointmentSlotId?: number;
  stt?: number;
} => {
  return {
    hasTimeSlot: !!registration.timeSlot,
    isScheduled: !!registration.timeSlotId,
    appointmentSlotId:
      registration.timeSlot?.appointmentSlotId ||
      registration.appointmentSlotId,
    stt: registration.timeSlot?.stt,
  };
};

export const getPaymentInfo = (
  registration: OnlineRegistrationItem
): {
  hasTransaction: boolean;
  orderId?: string;
  amount?: number;
  method?: string;
  time?: string;
} => {
  return {
    hasTransaction: !!registration.paymentTransaction,
    orderId: registration.paymentTransaction?.orderId || registration.orderId,
    amount: registration.paymentTransaction?.amount || registration.totalAmount,
    method: registration.paymentTransaction?.paymentMethod,
    time: registration.paymentTransaction?.paymentTime,
  };
};

// ✅ Enhanced comprehensive status với timeSlot info
export const getComprehensiveStatusWithSchedule = (
  registration: OnlineRegistrationItem
): {
  status: string;
  color: string;
  priority: number;
  hasSchedule: boolean;
  scheduleInfo?: string;
} => {
  const baseStatus = getComprehensiveStatus(registration);
  const hasSchedule = !!registration.timeSlot;

  let scheduleInfo = "";
  if (hasSchedule && registration.timeSlot) {
    const date = new Date(registration.timeSlot.dateInWeek).toLocaleDateString(
      "vi-VN"
    );
    const time = `${registration.timeSlot.startSlot.slice(
      0,
      5
    )} - ${registration.timeSlot.endSlot.slice(0, 5)}`;
    scheduleInfo = `${date} (${time})`;
  }

  return {
    ...baseStatus,
    hasSchedule,
    scheduleInfo: hasSchedule ? scheduleInfo : undefined,
  };
};

// ✅ Function để format full registration display
export const formatRegistrationDisplay = (
  registration: OnlineRegistrationItem
) => {
  const patient = getPatientDisplayName(registration);
  const age = getPatientAge(registration);
  const gender = getGenderDisplay(registration);
  const doctor = getDoctorInfo(registration);
  const schedule = getAppointmentSchedule(registration);
  const status = getComprehensiveStatusWithSchedule(registration);
  const payment = getPaymentInfo(registration);

  return {
    patient: {
      name: patient,
      age: age,
      gender: gender,
      id: registration.patientId,
      escort: {
        name: registration.patientEscortName,
        phone: registration.patientEscortPhone,
        relationship: registration.patientEscortRelationship,
      },
    },
    medical: {
      symptom: registration.symptom,
      requiredInformation: registration.requiredInformation,
      weight: registration.weight,
      height: registration.height,
      bmi:
        registration.weight > 0 && registration.height > 0
          ? (
              registration.weight / Math.pow(registration.height / 100, 2)
            ).toFixed(1)
          : null,
    },
    appointment: {
      id: registration.id,
      registrationId: registration.registrationId,
      onlineRegistrationIdHis: registration.onlineRegistrationIdHis,
      date: schedule.date,
      timeSlot: schedule.timeSlot,
      examination: schedule.examination,
      zone: schedule.zone,
      status: status.status,
      statusColor: status.color,
      hasSchedule: status.hasSchedule,
      scheduleInfo: status.scheduleInfo,
    },
    doctor: doctor,
    payment: {
      status: getPaymentStatusName(registration.statusPayment),
      statusColor: getPaymentStatusColor(registration.statusPayment),
      hasTransaction: payment.hasTransaction,
      orderId: payment.orderId,
      amount: payment.amount,
    },
    system: {
      type: registration.typeName,
      createBy: registration.createBy,
      dateCreate: formatRegistrationDate(registration.dateCreate),
      dateUpdate: formatRegistrationDate(registration.dateUpdate),
    },
  };
};
export const filterRegistrationsByPatientInfo = (
  registrations: OnlineRegistrationItem[],
  searchTerm: string
) => {
  const term = searchTerm.toLowerCase();

  return registrations.filter((reg) => {
    return (
      // Patient info
      reg.patient?.fullName?.toLowerCase().includes(term) ||
      reg.patientId.toString().includes(term) ||
      reg.patient?.id.toString().includes(term) ||
      // Registration info
      reg.id.toString().includes(term) ||
      reg.registrationId?.toLowerCase().includes(term) ||
      reg.onlineRegistrationIdHis?.toLowerCase().includes(term) ||
      reg.orderId?.toLowerCase().includes(term) ||
      // Medical info
      reg.symptom?.toLowerCase().includes(term) ||
      // Doctor/Schedule info
      reg.timeSlot?.doctorName?.toLowerCase().includes(term) ||
      reg.timeSlot?.roomName?.toLowerCase().includes(term) ||
      reg.timeSlot?.specialtyName?.toLowerCase().includes(term) ||
      // Escort info
      reg.patientEscortName?.toLowerCase().includes(term) ||
      reg.patientEscortPhone?.includes(term)
    );
  });
};

export const sortRegistrationsBySchedule = (
  registrations: OnlineRegistrationItem[],
  direction: "asc" | "desc" = "asc"
) => {
  return registrations.sort((a, b) => {
    // Ưu tiên những registration có schedule trước
    if (a.timeSlot && !b.timeSlot) return direction === "asc" ? -1 : 1;
    if (!a.timeSlot && b.timeSlot) return direction === "asc" ? 1 : -1;

    if (a.timeSlot && b.timeSlot) {
      // Sort by date first
      const dateA = new Date(a.timeSlot.dateInWeek);
      const dateB = new Date(b.timeSlot.dateInWeek);
      const dateDiff = dateA.getTime() - dateB.getTime();

      if (dateDiff !== 0) {
        return direction === "asc" ? dateDiff : -dateDiff;
      }

      // Then by start time
      const timeA = a.timeSlot.startSlot;
      const timeB = b.timeSlot.startSlot;
      const timeDiff = timeA.localeCompare(timeB);

      return direction === "asc" ? timeDiff : -timeDiff;
    }

    // Fallback to registration date
    const regDateA = new Date(a.dateCreate);
    const regDateB = new Date(b.dateCreate);
    const regDateDiff = regDateA.getTime() - regDateB.getTime();

    return direction === "asc" ? regDateDiff : -regDateDiff;
  });
};

// ✅ Helper function để xử lý response - QUAN TRỌNG!
const handleApiResponse = (response: any, errorMessage: string) => {
  if (response.status === 200) {
    const data = response.data;

    // ✅ KIỂM TRA success FIELD - QUAN TRỌNG!
    if (data.success === true) {
      return data.data;
    } else if (data.success === false) {
      // ✅ NÉM LỖI VỚI MESSAGE TỪ SERVER
      const errorMsg = data.message || "Lỗi không xác định từ server";
      console.error("❌ API Failed with success=false:", errorMsg);
      throw new Error(errorMsg);
    } else {
      // ✅ TRƯỜNG HỢP KHÔNG CÓ success FIELD
      console.warn("⚠️ No success field, assuming success");
      return data.data || data;
    }
  } else {
    // ✅ HTTP STATUS KHÁC 200
    console.error("❌ HTTP Error:", response.status);
    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
  }
};
const handleApiResponsePost = (response: any, errorMessage: string) => {
  // ✅ KIỂM TRA success FIELD - QUAN TRỌNG!
  if (response.success === true) {
    return response.data;
  } else if (response.success === false) {
    // ✅ NÉM LỖI VỚI MESSAGE TỪ SERVER
    const errorMsg = response.message || "Lỗi không xác định từ server";
    console.error("❌ API Failed with success=false:", errorMsg);
    throw new Error(errorMsg);
  } else {
    // ✅ TRƯỜNG HỢP KHÔNG CÓ success FIELD
    console.warn("⚠️ No success field, assuming success");
    return response.data || response;
  }
};
// ✅ 1. Lấy danh sách khu khám
export const getZones = async (isEnable?: boolean) => {
  try {
    const queryString = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
    const response = await getJSONAuth(
      `/api/booking-catalog/zones${queryString}`
    );

    return handleApiResponse(response, "Lỗi lấy danh sách khu khám");
  } catch (error: any) {
    console.error("❌ getZones error:", error);

    // ✅ GIỮ NGUYÊN MESSAGE TỪ SERVER
    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách khu khám")
    ) {
      throw error; // Throw original error với message từ server
    }

    throw new Error(error.message || "Lỗi lấy danh sách khu khám");
  }
};

// ✅ 2. Lấy danh sách chuyên khoa theo loại khu
export const getSpecialtiesByExamType = async (examTypeId: number) => {
  try {
    const response = await fetchData(
      `/api/booking-catalog/sepicaltys-by/${examTypeId}`
    );

    return handleApiResponse(response, "Lỗi lấy danh sách chuyên khoa");
  } catch (error: any) {
    console.error("❌ getSpecialtiesByExamType error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách chuyên khoa")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy danh sách chuyên khoa");
  }
};

// ✅ 3. Lấy danh sách lịch khám theo chuyên khoa trong 14 ngày
export const getGroupedSpecialty = async (
  examTypeId: number,
  specialtyId?: number
) => {
  try {
    const queryString =
      specialtyId !== undefined ? `?specialtyId=${specialtyId}` : "";
    const response = await fetchData(
      `/api/booking-catalog/grouped-specialty/${examTypeId}${queryString}`
    );

    return handleApiResponse(response, "Lỗi lấy danh sách lịch khám");
  } catch (error: any) {
    console.error("❌ getGroupedSpecialty error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách lịch khám")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy danh sách lịch khám");
  }
};

// ✅ 4. Đặt giữ chỗ khám - FIX PARAMETER NAME
export const addStartHold = async (
  patientId: number,
  appointmentSlotId: number
) => {
  try {
    // ✅ FIX: API doc shows "appoinmetSlotId" (typo in API)
    const response = await postJSONAuth(
      `/api/booking-catalog/add-start-hold?patientId=${patientId}&appoinmetSlotId=${appointmentSlotId}`,
      {} // Empty body for POST request
    );

    return handleApiResponsePost(response, "Lỗi đặt giữ chỗ khám");
  } catch (error: any) {
    console.error("❌ addStartHold error:", error);

    if (error.message && !error.message.includes("Lỗi đặt giữ chỗ khám")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi đặt giữ chỗ khám");
  }
};

// ✅ 5. Tạo hoặc cập nhật thông tin bệnh nhân
export const createOrUpdatePatient = async (
  payload: YouMed_PatientCreateDto
) => {
  try {
    const response = await postJSONAuth(
      "/api/booking-catalog/create-or-update-patient",
      payload
    );

    return handleApiResponsePost(
      response,
      "Lỗi tạo/cập nhật thông tin bệnh nhân"
    );
  } catch (error: any) {
    console.error("❌ createOrUpdatePatient error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi tạo/cập nhật thông tin bệnh nhân")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi tạo/cập nhật thông tin bệnh nhân");
  }
};

// ✅ 6. Lấy thông tin chi tiết bệnh nhân
export const getPatientInfo = async (id: number) => {
  try {
    const response = await fetchData(`/api/booking-catalog/patient-info/${id}`);

    return handleApiResponse(response, "Lỗi lấy thông tin bệnh nhân");
  } catch (error: any) {
    console.error("❌ getPatientInfo error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy thông tin bệnh nhân")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy thông tin bệnh nhân");
  }
};
// ✅ 6. Lấy thông tin chi tiết bệnh nhân
export const getListPatientInfo = async () => {
  try {
    const response = await fetchData(
      `/api/booking-catalog/patients-by-user-login`
    );

    return handleApiResponse(response, "Lỗi lấy thông tin bệnh nhân");
  } catch (error: any) {
    console.error("❌ getPatientInfo error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy thông tin bệnh nhân")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy thông tin bệnh nhân");
  }
};

// ✅ 7. Tạo đăng ký khám online
export const createOnlineRegistration = async (
  payload: AddOnlineRegistrationDto,
  isQR: boolean = true
) => {
  try {
    const queryString = isQR ? `?isQR=${isQR}` : "";
    const response = await postJSONAuth(
      `/api/online-registration/create${queryString}`,
      payload
    );

    return handleApiResponsePost(response, "Lỗi tạo đăng ký khám online");
  } catch (error: any) {
    console.error("❌ createOnlineRegistration error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi tạo đăng ký khám online")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi tạo đăng ký khám online");
  }
};

// ✅ 8. Xác nhận thanh toán
export const confirmPayment = async (payload: PaymentConfirmationRequest) => {
  try {
    const response = await postJSONAuth(
      "/api/online-registration/payment-confirmation",
      payload
    );

    return handleApiResponsePost(response, "Lỗi xác nhận thanh toán");
  } catch (error: any) {
    console.error("❌ confirmPayment error:", error);

    if (error.message && !error.message.includes("Lỗi xác nhận thanh toán")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi xác nhận thanh toán");
  }
};

// ✅ 9. Hủy đăng ký khám
export const cancelRegistration = async (id: number) => {
  try {
    const response = await deleteJSONAuth(
      `/api/online-registration/cancel/${id}`
    );

    return handleApiResponsePost(response, "Lỗi hủy đăng ký khám");
  } catch (error: any) {
    console.error("❌ cancelRegistration error:", error);

    // ✅ Kiểm tra nếu error đã được xử lý bởi handleApiResponsePost
    if (error.message && !error.message.includes("Lỗi hủy đăng ký khám")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi hủy đăng ký khám");
  }
};
// ✅ 10. Lấy danh sách đăng ký khám online (tất cả)
export const getOnlineRegistrationList = async () => {
  try {
    const response = await fetchData("/api/online-registration/list");

    return handleApiResponse(response, "Lỗi lấy danh sách đăng ký khám");
  } catch (error: any) {
    console.error("❌ getOnlineRegistrationList error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách đăng ký khám")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy danh sách đăng ký khám");
  }
};

// ✅ 11. Lấy danh sách đăng ký khám online theo patientId
export const getOnlineRegistrationsByPatient = async (patientId: number) => {
  try {
    const response = await fetchData(
      `/api/online-registration/list/${patientId}`
    );

    return handleApiResponse(
      response,
      "Lỗi lấy danh sách đăng ký khám theo bệnh nhân"
    );
  } catch (error: any) {
    console.error("❌ getOnlineRegistrationsByPatient error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách đăng ký khám theo bệnh nhân")
    ) {
      throw error;
    }

    throw new Error(
      error.message || "Lỗi lấy danh sách đăng ký khám theo bệnh nhân"
    );
  }
};

// ✅ Interface cho query parameters của API all
export interface OnlineRegistrationQueryParams {
  PageNumber?: number;
  PageSize?: number;
  Id?: number;
  OnlineRegistrationIdHis?: string;
  OrderId?: string;
  Cancel?: boolean;
  Confirm?: boolean;
  PatientId?: number;
  StatusPayment?: number;
  RegistrationId?: string;
  RegistrationDate?: string;
  Status?: number;
  Type?: number;
  DateCreate?: string;
  DateUpdate?: string;
  TimeSlotId?: number;
  CreateBy?: number;
  PatientEscortPhone?: string;
  IsCertificate?: boolean;
  CancelApprovalStatus?: number;
}

// ✅ Interface cho Response với phân trang
export interface OnlineRegistrationPagedResponse {
  items: OnlineRegistrationItem[]; // ✅ API returns 'items', not 'data'
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ✅ Interface cho API Response wrapper
export interface OnlineRegistrationResponsePagedResultApiResponse {
  success: boolean;
  message: string;
  data: OnlineRegistrationPagedResponse;
  errors?: string[];
}

// ✅ 12. Lấy tất cả đăng ký khám online với filter và phân trang
export const getAllOnlineRegistrations = async (
  queryParams?: OnlineRegistrationQueryParams
) => {
  try {
    // ✅ Build query string from parameters
    const params = new URLSearchParams();

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = `/api/online-registration/all${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetchData(url);

    return handleApiResponse(response, "Lỗi lấy danh sách tất cả đăng ký khám");
  } catch (error: any) {
    console.error("❌ getAllOnlineRegistrations error:", error);

    if (
      error.message &&
      !error.message.includes("Lỗi lấy danh sách tất cả đăng ký khám")
    ) {
      throw error;
    }

    throw new Error(error.message || "Lỗi lấy danh sách tất cả đăng ký khám");
  }
};

// ✅ 13. Helper function để tạo query params dễ dàng
export const createRegistrationQueryParams = (options: {
  page?: number;
  pageSize?: number;
  patientId?: number;
  status?: number;
  statusPayment?: number;
  cancel?: boolean;
  confirm?: boolean;
  type?: number;
  dateFrom?: string;
  dateTo?: string;
  orderId?: string;
  registrationId?: string;
  timeSlotId?: number;
  patientEscortPhone?: string;
}): OnlineRegistrationQueryParams => {
  const params: OnlineRegistrationQueryParams = {};

  if (options.page !== undefined) params.PageNumber = options.page;
  if (options.pageSize !== undefined) params.PageSize = options.pageSize;
  if (options.patientId !== undefined) params.PatientId = options.patientId;
  if (options.status !== undefined) params.Status = options.status;
  if (options.statusPayment !== undefined)
    params.StatusPayment = options.statusPayment;
  if (options.cancel !== undefined) params.Cancel = options.cancel;
  if (options.confirm !== undefined) params.Confirm = options.confirm;
  if (options.type !== undefined) params.Type = options.type;
  if (options.dateFrom !== undefined) params.DateCreate = options.dateFrom;
  if (options.dateTo !== undefined) params.DateUpdate = options.dateTo;
  if (options.orderId !== undefined) params.OrderId = options.orderId;
  if (options.registrationId !== undefined)
    params.RegistrationId = options.registrationId;
  if (options.timeSlotId !== undefined) params.TimeSlotId = options.timeSlotId;
  if (options.patientEscortPhone !== undefined)
    params.PatientEscortPhone = options.patientEscortPhone;

  return params;
};

// ✅ 14. Convenience functions cho các use cases phổ biến
export const getRegistrationsByStatus = async (
  status: number,
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      status,
      page,
      pageSize,
    })
  );
};

export const getRegistrationsByPatient = async (
  patientId: number,
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      patientId,
      page,
      pageSize,
    })
  );
};

export const getRegistrationsByPaymentStatus = async (
  statusPayment: number,
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      statusPayment,
      page,
      pageSize,
    })
  );
};

export const getCancelledRegistrations = async (
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      cancel: true,
      page,
      pageSize,
    })
  );
};

export const getConfirmedRegistrations = async (
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      confirm: true,
      page,
      pageSize,
    })
  );
};

export const getRegistrationsByDateRange = async (
  dateFrom: string,
  dateTo: string,
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      dateFrom,
      dateTo,
      page,
      pageSize,
    })
  );
};

export const getRegistrationsByOrderId = async (
  orderId: string,
  page: number = 1,
  pageSize: number = 20
) => {
  return getAllOnlineRegistrations(
    createRegistrationQueryParams({
      orderId,
      page,
      pageSize,
    })
  );
};

// ✅ 15. Advanced search function
export const searchRegistrations = async (searchCriteria: {
  patientId?: number;
  status?: number[];
  paymentStatus?: number[];
  dateFrom?: string;
  dateTo?: string;
  cancel?: boolean;
  confirm?: boolean;
  type?: number;
  orderId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const {
    patientId,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
    cancel,
    confirm,
    type,
    orderId,
    page = 1,
    pageSize = 20,
  } = searchCriteria;

  // ✅ For multiple status values, we'll need to make multiple calls
  // or handle it on the frontend. For now, let's use the first status
  const params = createRegistrationQueryParams({
    patientId,
    status: status?.[0],
    statusPayment: paymentStatus?.[0],
    dateFrom,
    dateTo,
    cancel,
    confirm,
    type,
    orderId,
    page,
    pageSize,
  });

  return getAllOnlineRegistrations(params);
};

// ✅ Interface cho Type mapping
export interface OnlineRegistrationType {
  id: number;
  name: string;
  description?: string;
}

// ✅ Interface cho Status mapping
export interface OnlineRegistrationStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

// ✅ Interface cho Payment Status mapping
export interface PaymentStatusType {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

// ✅ Constants cho các enums
export const REGISTRATION_TYPES: OnlineRegistrationType[] = [
  { id: 1, name: "Người dùng", description: "Đăng ký từ người dùng cuối" },
  { id: 2, name: "YouMed", description: "Đăng ký qua hệ thống YouMed" },
  { id: 4, name: "Admin", description: "Đăng ký bởi quản trị viên" },
];

export const REGISTRATION_STATUSES: OnlineRegistrationStatus[] = [
  {
    id: 0,
    name: "Chờ khám",
    description: "Đang chờ được khám",
    color: "yellow",
  },
  { id: 1, name: "Đã khám", description: "Đã được khám xong", color: "green" },
  {
    id: 2,
    name: "Hoàn thành",
    description: "Hoàn thành toàn bộ quy trình",
    color: "blue",
  },
  { id: 3, name: "Đã hủy", description: "Đã bị hủy", color: "red" },
];

export const PAYMENT_STATUSES: PaymentStatusType[] = [
  {
    id: 0,
    name: "Chưa thanh toán",
    description: "Chưa thực hiện thanh toán",
    color: "orange",
  },
  {
    id: 1,
    name: "Đã thanh toán",
    description: "Đã thanh toán thành công",
    color: "green",
  },
  {
    id: 2,
    name: "Đã hoàn tiền",
    description: "Đã được hoàn tiền",
    color: "blue",
  },
];

// ✅ Helper functions để get display values
export const getRegistrationTypeName = (type: number): string => {
  const registrationType = REGISTRATION_TYPES.find((t) => t.id === type);
  return registrationType?.name || `Loại ${type}`;
};

export const getRegistrationStatusName = (status: number): string => {
  const registrationStatus = REGISTRATION_STATUSES.find((s) => s.id === status);
  return registrationStatus?.name || `Trạng thái ${status}`;
};

export const getPaymentStatusName = (statusPayment: number): string => {
  const paymentStatus = PAYMENT_STATUSES.find((s) => s.id === statusPayment);
  return paymentStatus?.name || `Thanh toán ${statusPayment}`;
};

export const getRegistrationStatusColor = (status: number): string => {
  const registrationStatus = REGISTRATION_STATUSES.find((s) => s.id === status);
  return registrationStatus?.color || "gray";
};

export const getPaymentStatusColor = (statusPayment: number): string => {
  const paymentStatus = PAYMENT_STATUSES.find((s) => s.id === statusPayment);
  return paymentStatus?.color || "gray";
};

// ✅ Helper function để format dates
export const formatRegistrationDate = (dateString: string): string => {
  try {
    // Handle different date formats
    if (dateString.includes("/")) {
      // Format: "03/11/2025 00:00" -> "03/11/2025"
      return dateString.split(" ")[0];
    } else if (dateString.includes("T")) {
      // Format: "2025-10-31T18:48:44.042923" -> "31/10/2025 18:48"
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return dateString;
  } catch (error) {
    console.warn("Error formatting date:", dateString);
    return dateString;
  }
};

// ✅ Helper function để parse registration date
export const parseRegistrationDate = (dateString: string): Date | null => {
  try {
    if (dateString.includes("/")) {
      // Format: "03/11/2025 00:00"
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = (timePart || "00:00").split(":");
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
    } else if (dateString.includes("T")) {
      // Format: "2025-10-31T18:48:44.042923"
      return new Date(dateString);
    }
    return new Date(dateString);
  } catch (error) {
    console.warn("Error parsing date:", dateString);
    return null;
  }
};

// ✅ Helper function để get comprehensive status display
export const getComprehensiveStatus = (
  registration: OnlineRegistrationItem
): {
  status: string;
  color: string;
  priority: number;
} => {
  // Priority: Higher number = higher priority display
  if (registration.cancel) {
    return { status: "Đã hủy", color: "red", priority: 4 };
  }

  if (registration.confirm && registration.status === 1) {
    return { status: "Đã khám", color: "green", priority: 3 };
  }

  if (registration.confirm) {
    return { status: "Đã xác nhận", color: "blue", priority: 2 };
  }

  switch (registration.status) {
    case 0:
      return { status: "Chờ khám", color: "yellow", priority: 1 };
    case 1:
      return { status: "Đã khám", color: "green", priority: 3 };
    case 2:
      return { status: "Hoàn thành", color: "emerald", priority: 5 };
    case 3:
      return { status: "Đã hủy", color: "red", priority: 4 };
    default:
      return { status: "Chờ xác nhận", color: "gray", priority: 0 };
  }
};
