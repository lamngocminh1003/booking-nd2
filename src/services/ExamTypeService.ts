import { fetchData, postJSONAuth, deleteJSONAuth } from "@/lib/utils";

export interface ExamTypeDto {
  id?: number;
  name: string;
  code: string;
  description?: string;
  isEnable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  appointmentFormName?: string;
  appointmentFormKey?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateUpdateExamTypeSpecialty {
  examTypeId: number;
  specialtyId: number;
  departmentId: number;
  isEnable?: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  appointmentFormName?: string;
  appointmentFormKey?: string;
}

export interface CreateUpdateExamTypeServicePrice {
  examTypeId: number;
  servicePriceId: number;
  price: number;
  appointmentFormName?: string;
  appointmentFormKey?: string;
  isEnable?: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
}

export interface ExamTypeSpecialtyDetail {
  examTypeId: number;
  examTypeName: string;
  specialtyId: number;
  specialtyName: string;
  departmentId: number;
  departmentName: string;
  isEnable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
}

export interface ExamTypeServicePriceDetail {
  examTypeId: number;
  examTypeName: string;
  servicePriceId: number;
  servicePriceName: string;
  appointmentFormName?: string;
  appointmentFormKey?: string;
  price: number;
  isEnable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
}

// Basic CRUD operations
export const getExamTypes = (isEnable?: boolean) => {
  const params = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
  return fetchData(`/api/exam-type/list${params}`);
};

export const createOrUpdateExamType = (data: ExamTypeDto) =>
  postJSONAuth("/api/exam-type/create-or-update", data);

// Specialty-Department operations
export const getExamTypeSpecialtyDetails = (isEnable?: boolean) => {
  const params = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
  return fetchData(`/api/exam-type/list-detail-sepicalty${params}`);
};

export const getExamTypeSpecialtyDepartmentList = () =>
  fetchData("/api/exam-type/list-detail-specialty-department");

export const createOrUpdateExamTypeSpecialty = (
  data: CreateUpdateExamTypeSpecialty
) => postJSONAuth("/api/exam-type/create-or-update-sepicalty-department", data);

export const deleteExamTypeSpecialty = (
  examTypeId: number,
  specialtyId?: number,
  departmentId?: number
) => {
  const params = new URLSearchParams();
  if (specialtyId !== undefined)
    params.append("specialyId", specialtyId.toString());
  if (departmentId !== undefined)
    params.append("departmentId", departmentId.toString());

  const queryString = params.toString();
  const url = `/api/exam-type/delete-sepicalty-department/${examTypeId}${
    queryString ? `?${queryString}` : ""
  }`;

  return deleteJSONAuth(url);
};

// Service-Price operations
export const getExamTypeServicePriceDetails = (isEnable?: boolean) => {
  const params = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
  return fetchData(`/api/exam-type/list-detail-service-price${params}`);
};

export const createOrUpdateExamTypeServicePrice = (
  data: CreateUpdateExamTypeServicePrice
) => postJSONAuth("/api/exam-type/create-or-update-service-price", data);

export const deleteExamTypeServicePrice = (
  examTypeId: number,
  servicePriceId?: number
) => {
  const params =
    servicePriceId !== undefined ? `?servicePriceId=${servicePriceId}` : "";
  return deleteJSONAuth(
    `/api/exam-type/delete-service-price/${examTypeId}${params}`
  );
};

// ✅ New API 1: Lấy danh sách khoa phòng theo zone ID
export const getDepartmentsByZoneId = async (zoneId: number | string) => {
  try {
    const response = await fetchData(
      `/api/exam-type/get-department-by-zone-id/${zoneId}`
    );
    return response;
  } catch (error) {
    console.error(`❌ getDepartmentsByZoneId(${zoneId}) error:`, error);
    throw error;
  }
};

// ✅ New API 2: Lấy danh sách loại khám theo zone ID
export const getExamsByZoneId = async (zoneId: number | string) => {
  try {
    const response = await fetchData(
      `/api/exam-type/get-exams-by-zone-id/${zoneId}`
    );
    return response;
  } catch (error) {
    console.error(`❌ getExamsByZoneId(${zoneId}) error:`, error);
    throw error;
  }
};

// ✅ Batch API call để lấy cả 2 loại dữ liệu cùng lúc
export const getZoneRelatedData = async (zoneId: number | string) => {
  try {
    const [departmentsResponse, examsResponse] = await Promise.all([
      getDepartmentsByZoneId(zoneId),
      getExamsByZoneId(zoneId),
    ]);

    const result = {
      departments:
        departmentsResponse?.data?.data || departmentsResponse?.data || [],
      exams: examsResponse?.data?.data || examsResponse?.data || [],
      zoneId,
      success: departmentsResponse?.success && examsResponse?.success,
      timestamp: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    console.error(`❌ getZoneRelatedData(${zoneId}) error:`, error);
    throw error;
  }
};

// ✅ Utility function để parse và validate data - Thêm isSelectDoctor
export const parseZoneExamData = (rawData: any[]) => {
  return rawData.map((exam) => ({
    id: exam.id,
    zoneId: exam.zoneId,
    zoneName: exam.zoneName,
    name: exam.name,
    description: exam.description,
    enable: exam.enable,
    isSelectDoctor: exam.isSelectDoctor || false, // ✅ Thêm isSelectDoctor với default false
    appointmentFormId: exam.appointmentFormId,
    appointmentFormKey: exam.appointmentFormKey,
    appointmentFormName: exam.appointmentFormName,
    departmentHospitals: exam.departmentHospitals || [],
    specialtiesCount:
      exam.departmentHospitals?.reduce(
        (sum: number, dept: any) => sum + (dept.sepicalties?.length || 0),
        0
      ) || 0,
  }));
};

export const parseZoneDepartmentData = (rawData: any[]) => {
  return rawData.map((dept) => ({
    departmentHospitalId: dept.departmentHospitalId,
    departmentHospitalName: dept.departmentHospitalName,
    examTypes: dept.examTypes || [],
    totalSpecialties:
      dept.examTypes?.reduce(
        (sum: number, et: any) => sum + (et.sepicalties?.length || 0),
        0
      ) || 0,
    // ✅ Thêm isSelectDoctor aggregation nếu cần
    hasSelectDoctorExams:
      dept.examTypes?.some((et: any) => et.isSelectDoctor) || false,
  }));
};

// ✅ Helper function để validate isSelectDoctor field
export const validateExamTypeData = (data: ExamTypeDto): boolean => {
  // Kiểm tra các trường bắt buộc
  if (!data.name || !data.code) {
    return false;
  }

  // Kiểm tra isSelectDoctor nếu có
  if (
    data.isSelectDoctor !== undefined &&
    typeof data.isSelectDoctor !== "boolean"
  ) {
    return false;
  }

  return true;
};

// ✅ Helper function để set default values cho isSelectDoctor
export const setDefaultExamTypeValues = (
  data: Partial<ExamTypeDto>
): ExamTypeDto => {
  return {
    name: data.name || "",
    code: data.code || "",
    description: data.description || "",
    isEnable: data.isEnable ?? true,
    isSelectDoctor: data.isSelectDoctor ?? false, // ✅ Default false cho isSelectDoctor
    appointmentFormName: data.appointmentFormName || "",
    appointmentFormKey: data.appointmentFormKey || "",
    ...data,
  };
};
