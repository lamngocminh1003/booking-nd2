import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

// ✅ Helper function để xử lý response cho CREATE/UPDATE - QUAN TRỌNG!
const handleApiResponse = (response: any, errorMessage: string) => {
  if (response.success) {
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
  } else {
    // ✅ HTTP STATUS KHÁC 200
    console.error("❌ HTTP Error:", response.message);
    throw new Error(response.message || errorMessage);
  }
};

// ✅ Helper function để xử lý response cho DELETE - QUAN TRỌNG!
const handleApiResponseDelete = (response: any, errorMessage: string) => {
  // ✅ API Delete response format: { "data": { "success": true }, "success": true, "message": "" }
  if (response.success) {
    // ✅ KIỂM TRA outer success FIELD
    if (response.success === true) {
      // ✅ KIỂM TRA nested success trong data
      if (response.data && response.success === true) {
        return { success: true };
      } else {
        console.error("❌ Delete failed - nested success is false");
        const errorMsg = response.message || "Xóa thất bại";
        throw new Error(errorMsg);
      }
    } else if (response.success === false) {
      // ✅ NÉM LỖI VỚI MESSAGE TỪ SERVER
      const errorMsg = response.message || "Lỗi xóa từ server";
      console.error("❌ Delete API Failed with success=false:", errorMsg);
      throw new Error(errorMsg);
    } else {
      // ✅ TRƯỜNG HỢP KHÔNG CÓ success FIELD
      console.warn("⚠️ No success field in delete response, assuming success");
      return { success: true };
    }
  } else {
    // ✅ HTTP STATUS KHÁC 200
    console.error("❌ HTTP Delete Error:", response.message);
    throw new Error(response.message || errorMessage);
  }
};

// ✅ GET functions (no changes needed)
export const getServicePrices = () => fetchData("/api/service-price/list");

export const getExamTypeServicePricesByExamTypeId = (examTypeId: number) => {
  return fetchData(`/api/exam-type/detail-service-price/${examTypeId}`);
};

export const getExamTypeServicePrices = (isEnable?: boolean) => {
  const params = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
  return fetchData(`/api/exam-type/list-detail-service-price${params}`);
};

// ✅ CREATE functions with proper error handling
export const createServicePrice = async (data: {
  name: string;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
}) => {
  const response = await postJSONAuth("/api/service-price/create", data);
  return handleApiResponse(response, "Không thể tạo giá dịch vụ");
};

export const createOrUpdateExamTypeServicePrice = async (data: {
  examTypeId: number;
  servicePriceId: number;
  regularPrice?: number;
  insurancePrice?: number;
  vipPrice?: number;
  enable: boolean;
}) => {
  const response = await postJSONAuth(
    "/api/exam-type/create-or-update-service-price",
    data
  );
  return handleApiResponse(
    response,
    "Không thể tạo/cập nhật giá dịch vụ loại khám"
  );
};

// ✅ UPDATE functions with proper error handling
export const updateServicePrice = async (
  id: number,
  data: {
    name: string;
    regularPrice: number;
    insurancePrice: number;
    vipPrice: number;
  }
) => {
  const response = await putJSONAuth(`/api/service-price/${id}`, data);

  return handleApiResponse(response, "Không thể cập nhật giá dịch vụ");
};

// ✅ DELETE functions with proper error handling
export const deleteServicePrice = async (id: number) => {
  const response = await deleteJSONAuth(`/api/service-price/${id}`);
  return handleApiResponseDelete(response, "Không thể xóa giá dịch vụ");
};

export const deleteExamTypeServicePrice = async (
  examTypeId: number,
  servicePriceId: number
) => {
  const response = await deleteJSONAuth(
    `/api/exam-type/delete-service-price/${examTypeId}?servicePriceId=${servicePriceId}`
  );
  return handleApiResponseDelete(
    response,
    "Không thể xóa giá dịch vụ loại khám"
  );
};
