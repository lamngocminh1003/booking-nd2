import { getJSONAuth, fetchData, postJSONAuth } from "@/lib/utils";

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
    console.log("🔄 Calling payment confirmation API with payload:", payload);

    const response = await postJSONAuth(
      "/api/online-registration/payment-confirmation",
      payload
    );

    console.log("✅ Payment confirmation API response:", response);
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
    const response = await fetch(`/api/online-registration/cancel/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Lỗi hủy đăng ký khám`);
    }

    return { success: true, message: "Hủy đăng ký khám thành công" };
  } catch (error: any) {
    console.error("❌ cancelRegistration error:", error);
    throw new Error(error.message || "Lỗi hủy đăng ký khám");
  }
};
