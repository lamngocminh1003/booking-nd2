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
        console.log("✅ Delete operation successful");
        return { success: true };
      } else {
        // ✅ Outer success = true nhưng inner success = false
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

export const getExaminations = () => fetchData("/api/examination/list");

export const createExamination = async (data: {
  name: string;
  workSession: string;
  startTime: string;
  endTime: string;
}) => {
  const response = await postJSONAuth("/api/examination/create", data);
  return handleApiResponse(response, "Không thể tạo ca khám");
};

export const updateExamination = async (
  id: number,
  data: {
    name: string;
    workSession: string;
    startTime: string;
    endTime: string;
    enable: boolean;
  }
) => {
  const response = await putJSONAuth(`/api/examination/${id}`, data);
  return handleApiResponse(response, "Không thể cập nhật ca khám");
};

export const deleteExamination = async (id: number) => {
  const response = await deleteJSONAuth(`/api/examination/${id}`);
  return handleApiResponseDelete(response, "Không thể xóa ca khám");
};
