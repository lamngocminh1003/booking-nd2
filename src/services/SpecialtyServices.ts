import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

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
    console.error("❌ HTTP Error:", response.message);
    throw new Error(` ${response.message}`);
  }
};
// ✅ Helper function để xử lý response - QUAN TRỌNG!
const handleApiResponseDelete = (response: any, errorMessage: string) => {
  if (response.success) {
    if (response.success === true) {
      return { success: true };
    } else if (response.success === false) {
      // ✅ NÉM LỖI VỚI MESSAGE TỪ SERVER
      const errorMsg = response.message || "Lỗi không xác định từ server";
      console.error("❌ API Failed with success=false:", errorMsg);
      throw new Error(errorMsg);
    } else {
      console.warn("⚠️ No success field, assuming success");
      return response.success || response;
    }
  } else {
    // ✅ HTTP STATUS KHÁC 200
    console.error("❌ HTTP Error:", response.message);
    throw new Error(` ${response.message}`);
  }
};
export const getSpecialties = () => fetchData("/api/specialty/list");

export const createSpecialty = async (data: { name: string }) => {
  const response = await postJSONAuth("/api/specialty/create", data);
  return handleApiResponse(response, "Không thể tạo chuyên khoa");
};

export const updateSpecialty = async (
  id: number,
  data: { name: string; description: string; listType: string; enable: boolean }
) => {
  const response = await putJSONAuth(`/api/specialty/${id}`, data);
  return handleApiResponse(response, "Không thể cập nhật chuyên khoa");
};

export const deleteSpecialty = async (id: number) => {
  const response = await deleteJSONAuth(`/api/specialty/${id}`);
  return handleApiResponseDelete(response, "Không thể xóa chuyên khoa");
};
