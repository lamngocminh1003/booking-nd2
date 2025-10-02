import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

// ✅ Existing functions
export const getServicePrices = () => fetchData("/api/service-price/list");

export const createServicePrice = (data: {
  name: string;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
}) => postJSONAuth("/api/service-price/create", data);

export const updateServicePrice = (
  id: number,
  data: {
    name: string;
    regularPrice: number;
    insurancePrice: number;
    vipPrice: number;
  }
) => putJSONAuth(`/api/service-price/${id}`, data);

export const deleteServicePrice = (id: number) =>
  deleteJSONAuth(`/api/service-price/${id}`);

// ✅ UPDATED: Lấy service prices theo examTypeId
export const getExamTypeServicePricesByExamTypeId = (examTypeId: number) => {
  return fetchData(`/api/exam-type/detail-service-price/${examTypeId}`);
};

// ✅ Keep old function for backward compatibility (optional)
export const getExamTypeServicePrices = (isEnable?: boolean) => {
  const params = isEnable !== undefined ? `?isEnable=${isEnable}` : "";
  return fetchData(`/api/exam-type/list-detail-service-price${params}`);
};

export const createOrUpdateExamTypeServicePrice = (data: {
  examTypeId: number;
  servicePriceId: number;
  regularPrice?: number;
  insurancePrice?: number;
  vipPrice?: number;
  enable: boolean;
}) => postJSONAuth("/api/exam-type/create-or-update-service-price", data);

export const deleteExamTypeServicePrice = async (
  examTypeId: number,
  servicePriceId: number
) => {
  const response = await deleteJSONAuth(
    `/api/exam-type/delete-service-price/${examTypeId}?servicePriceId=${servicePriceId}`
  );

  // ✅ Check if success is false
  if (response?.success === false || response?.data?.success === false) {
    const errorMessage =
      response?.message || response?.data?.message || "Lỗi khi xóa dịch vụ";
    throw new Error(errorMessage);
  }

  return response;
};
