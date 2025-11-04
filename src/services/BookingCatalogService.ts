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
