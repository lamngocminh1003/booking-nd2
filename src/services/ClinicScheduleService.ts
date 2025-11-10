import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

// ✅ Cập nhật handleApiResponsePost để xử lý bulk operations
const handleApiResponsePost = (response: any, errorMessage: string) => {
  // ✅ KIỂM TRA success FIELD - QUAN TRỌNG!
  if (response.success === true) {
    const data = response.data;

    // ✅ KIỂM TRA BULK OPERATION RESULTS
    if (Array.isArray(data)) {
      const failedItems = data.filter((item: any) => item.status === false);
      const successItems = data.filter((item: any) => item.status !== false);

      if (failedItems.length > 0) {
        // ✅ CÓ LỖI TRONG BULK OPERATION
        const errorMessages = failedItems
          .map((item: any) => item.message)
          .join("; ");
        console.error("❌ Bulk operation có lỗi:", {
          failed: failedItems.length,
          success: successItems.length,
          errors: errorMessages,
        });

        // ✅ Tạo error object với thông tin chi tiết
        const bulkError = new Error(errorMessages);
        (bulkError as any).bulkResult = {
          total: data.length,
          success: successItems.length,
          failed: failedItems.length,
          failedItems: failedItems,
          successItems: successItems,
          errors: errorMessages,
        };
        throw bulkError;
      }
    }

    return data;
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

export interface CreateClinicScheduleDto {
  // Định nghĩa theo schema của API - có thể cần điều chỉnh theo actual schema
  roomId?: number;
  examTypeId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  maxAppointments?: number;
  appointmentDuration?: number;
  holdSlot?: number;
  notes?: string;
  // ✅ Thêm các field cần thiết cho API
  dateInWeek?: string;
  total?: number;
  spaceMinutes?: number;
  specialtyId?: number;
  examinationId?: number;
  doctorId?: number;
  departmentHospitalId?: number;
  startSlot?: string; // Format: "HH:mm:ss"
  endSlot?: string; // Format: "HH:mm:ss"
}

export interface ClinicScheduleQueryParams {
  Week?: number;
  Year?: number;
  ZoneId?: number;
}

// ✅ GET requests - giữ nguyên vì thường không cần handleApiResponsePost
export const getClinicSchedules = async (
  params?: ClinicScheduleQueryParams
) => {
  try {
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        ).toString()}`
      : "";

    const response = await fetchData(`/api/clinic-schedule/list${queryString}`);

    return response;
  } catch (error: any) {
    console.error("❌ getClinicSchedules error:", error);
    throw error;
  }
};

export const getClinicScheduleById = async (id: number) => {
  try {
    const response = await fetchData(`/api/clinic-schedule/${id}`);

    return response;
  } catch (error: any) {
    console.error("❌ getClinicScheduleById error:", error);
    throw error;
  }
};

// ✅ POST request - áp dụng handleApiResponsePost
export const createClinicSchedules = async (
  data: CreateClinicScheduleDto[]
) => {
  try {
    const response = await postJSONAuth("/api/clinic-schedule/create", data);

    return handleApiResponsePost(response, "Lỗi tạo lịch khám");
  } catch (error: any) {
    console.error("❌ createClinicSchedules error:", error);

    // ✅ Xử lý bulk operation error
    if (error.bulkResult) {
      console.error("📊 Bulk operation summary:", error.bulkResult);

      // ✅ Ném lỗi với thông tin chi tiết
      const detailedError = new Error(
        `Tạo lịch khám thất bại: ${error.bulkResult.failed}/${error.bulkResult.total} lịch bị lỗi. Chi tiết: ${error.message}`
      );
      (detailedError as any).bulkResult = error.bulkResult;
      throw detailedError;
    }

    // ✅ Kiểm tra nếu error đã được xử lý bởi handleApiResponsePost
    if (error.message && !error.message.includes("Lỗi tạo lịch khám")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi tạo lịch khám");
  }
};

// ✅ PUT request - áp dụng handleApiResponsePost
export const updateClinicSchedule = async (
  id: number,
  data: CreateClinicScheduleDto
) => {
  try {
    const response = await putJSONAuth(`/api/clinic-schedule/${id}`, data);

    return handleApiResponsePost(response, "Lỗi cập nhật lịch khám");
  } catch (error: any) {
    console.error("❌ updateClinicSchedule error:", error);

    // ✅ Kiểm tra nếu error đã được xử lý bởi handleApiResponsePost
    if (error.message && !error.message.includes("Lỗi cập nhật lịch khám")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi cập nhật lịch khám");
  }
};

// ✅ DELETE request - áp dụng handleApiResponsePost
export const deleteClinicSchedule = async (id: number) => {
  try {
    const response = await deleteJSONAuth(`/api/clinic-schedule/${id}`);

    return handleApiResponsePost(response, "Lỗi xóa lịch khám");
  } catch (error: any) {
    console.error("❌ deleteClinicSchedule error:", error);

    // ✅ Kiểm tra nếu error đã được xử lý bởi handleApiResponsePost
    if (error.message && !error.message.includes("Lỗi xóa lịch khám")) {
      throw error;
    }

    throw new Error(error.message || "Lỗi xóa lịch khám");
  }
};

// ✅ Thêm các utility functions bổ sung
export const createSingleClinicSchedule = async (
  data: CreateClinicScheduleDto
) => {
  return createClinicSchedules([data]);
};

// ✅ Bulk operations
export const createMultipleClinicSchedules = async (
  schedules: CreateClinicScheduleDto[]
) => {
  try {
    const response = await createClinicSchedules(schedules);

    return response;
  } catch (error: any) {
    console.error("❌ Failed to create multiple clinic schedules:", error);
    throw error;
  }
};

// ✅ Helper function để validate trước khi tạo
export const validateBeforeCreate = (
  schedules: CreateClinicScheduleDto[]
): {
  valid: CreateClinicScheduleDto[];
  invalid: { schedule: CreateClinicScheduleDto; errors: string[] }[];
} => {
  const valid: CreateClinicScheduleDto[] = [];
  const invalid: { schedule: CreateClinicScheduleDto; errors: string[] }[] = [];

  schedules.forEach((schedule) => {
    const errors = validateScheduleData(schedule);
    if (errors.length === 0) {
      valid.push(schedule);
    } else {
      invalid.push({ schedule, errors });
    }
  });

  return { valid, invalid };
};

// ✅ Cập nhật validateScheduleData để kiểm tra specialtyId
export const validateScheduleData = (
  data: CreateClinicScheduleDto
): string[] => {
  const errors: string[] = [];

  if (!data.examTypeId || data.examTypeId === 0) {
    errors.push("Exam Type ID is required");
  }

  if (!data.specialtyId || data.specialtyId === 0) {
    errors.push("Specialty ID is required");
  }

  if (!data.doctorId || data.doctorId === 0) {
    errors.push("Doctor ID is required");
  }

  if (!data.roomId || data.roomId === 0) {
    errors.push("Room ID is required");
  }

  if (!data.startSlot) {
    errors.push("Start time is required");
  }

  if (!data.endSlot) {
    errors.push("End time is required");
  }

  if (data.startSlot && data.endSlot) {
    const startTime = new Date(`1970-01-01T${data.startSlot}`);
    const endTime = new Date(`1970-01-01T${data.endSlot}`);

    if (startTime >= endTime) {
      errors.push("Start time must be before end time");
    }
  }

  if (data.total && data.total <= 0) {
    errors.push("Total appointments must be greater than 0");
  }

  if (!data.dateInWeek) {
    errors.push("Date in week is required");
  }

  return errors;
};
export const createClinicSchedulesWithPartialSuccess = async (
  data: CreateClinicScheduleDto[]
) => {
  try {
    const response = await postJSONAuth("/api/clinic-schedule/create", data);

    if (response.success === true && Array.isArray(response.data)) {
      const results = response.data;
      const failedItems = results.filter((item: any) => item.status === false);
      const successItems = results.filter((item: any) => item.status !== false);

      return {
        success: true,
        total: results.length,
        successCount: successItems.length,
        failedCount: failedItems.length,
        successItems: successItems,
        failedItems: failedItems,
        errors: failedItems.map((item: any) => item.message),
        data: results,
      };
    }

    // ✅ Fallback - sử dụng handleApiResponsePost cho các case khác
    return handleApiResponsePost(response, "Lỗi tạo lịch khám");
  } catch (error: any) {
    console.error("❌ createClinicSchedulesWithPartialSuccess error:", error);

    // ✅ Xử lý network error hoặc parse error
    if (error.name === "SyntaxError" || error.message?.includes("JSON")) {
      throw new Error("Lỗi phân tích dữ liệu từ server");
    }

    // ✅ Xử lý HTTP error
    if (error.status) {
      const statusMessages = {
        400: "Dữ liệu gửi lên không hợp lệ",
        401: "Phiên đăng nhập đã hết hạn",
        403: "Không có quyền thực hiện thao tác này",
        404: "Không tìm thấy API endpoint",
        500: "Lỗi server nội bộ",
        502: "Lỗi kết nối đến server",
        503: "Server đang bảo trì",
      };

      const statusMessage =
        statusMessages[error.status] || `Lỗi HTTP ${error.status}`;
      throw new Error(statusMessage);
    }

    throw error;
  }
};

// ✅ Create schedules with validation and partial success handling
export const createValidatedClinicSchedules = async (
  schedules: CreateClinicScheduleDto[]
) => {
  const { valid, invalid } = validateBeforeCreate(schedules);

  if (invalid.length > 0) {
    console.warn("⚠️ Found", invalid.length, "invalid schedules:", invalid);
  }

  if (valid.length === 0) {
    throw new Error("Không có lịch khám hợp lệ để tạo");
  }

  try {
    const result = await createClinicSchedulesWithPartialSuccess(valid);

    // ✅ Merge client-side validation errors với server errors
    const allErrors = [
      ...invalid.map((item) => `Client validation: ${item.errors.join(", ")}`),
      ...(result.errors || []),
    ];

    return {
      ...result,
      clientValidationFailed: invalid.length,
      allErrors: allErrors,
    };
  } catch (error: any) {
    console.error("❌ Failed to create validated schedules:", error);
    throw error;
  }
};

// ✅ Utility để log chi tiết lỗi
export const logScheduleErrors = (error: any) => {
  if (error.bulkResult) {
    if (error.bulkResult.failedItems?.length > 0) {
      console.table(
        error.bulkResult.failedItems.map((item: any) => ({
          message: item.message,
          specialtyId: item.clinicSchedule?.specialtyId,
          examTypeId: item.clinicSchedule?.examTypeId,
          doctorId: item.clinicSchedule?.doctorId,
          date: item.clinicSchedule?.dateInWeek,
        }))
      );
    }
    console.groupEnd();
  }
};
