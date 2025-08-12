import { getProvinces, getWards } from "@/store/slices/locationSlice";

interface Province {
  provinceCode: string;
  provinceName: string;
}

interface Ward {
  wardCode: string;
  wardName: string;
  provinceCode: string; // Liên kết trực tiếp với province thay vì district
}

export const getProvinceName = (
  provinces: Province[],
  provinceCode: string
): string => {
  const province = provinces.find((p) => p.provinceCode === provinceCode);
  return province?.provinceName || "";
};

export const getWardName = (wards: Ward[], wardCode: string): string => {
  const ward = wards.find((w) => w.wardCode === wardCode);
  return ward?.wardName || "";
};

export const buildFullAddress = (
  address: string,
  wardName: string,
  provinceName: string
): string => {
  const parts = [address, wardName, provinceName].filter(Boolean);
  return parts.join(", ");
};

// Cập nhật hàm này để chỉ sử dụng province và ward
export const getFullAddressFromCodes = (
  provinces: Province[],
  wards: Ward[],
  address: string,
  provinceCode: string,
  wardCode: string
): string => {
  const provinceName = getProvinceName(provinces, provinceCode);
  const wardName = getWardName(wards, wardCode);

  if (!provinceName || !wardName) {
    console.warn("Incomplete address information provided.");
    return address;
  }

  return buildFullAddress(address, wardName, provinceName);
};
