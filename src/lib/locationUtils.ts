import {
  getProvinces,
  getDistricts,
  getWards,
} from "@/store/slices/locationSlice";

interface Province {
  provinceCode: string;
  provinceName: string;
}

interface District {
  districtCode: string;
  districtName: string;
  provinceCode: string;
}

interface Ward {
  wardCode: string;
  wardName: string;
  districtCode: string;
}

export const getProvinceName = (
  provinces: Province[],
  provinceCode: string
): string => {
  const province = provinces.find((p) => p.provinceCode === provinceCode);
  return province?.provinceName || "";
};

export const getDistrictName = (
  districts: District[],
  districtCode: string
): string => {
  const district = districts.find((d) => d.districtCode === districtCode);
  return district?.districtName || "";
};

export const getWardName = (wards: Ward[], wardCode: string): string => {
  const ward = wards.find((w) => w.wardCode === wardCode);
  return ward?.wardName || "";
};

export const buildFullAddress = (
  address: string,
  wardName: string,
  districtName: string,
  provinceName: string
): string => {
  const parts = [address, wardName, districtName, provinceName].filter(Boolean);
  return parts.join(", ");
};

export const getFullAddressFromCodes = (
  provinces: Province[],
  districts: District[],
  wards: Ward[],
  address: string,
  provinceCode: string,
  districtCode: string,
  wardCode: string
): string => {
  const provinceName = getProvinceName(provinces, provinceCode);

  const districtName = getDistrictName(districts, districtCode);

  const wardName = getWardName(wards, wardCode);
  if (!provinceName || !districtName || !wardName) {
    console.warn("Incomplete address information provided.");
    return address; // Return the original address if any part is missing
  }
  return buildFullAddress(address, wardName, districtName, provinceName);
};
