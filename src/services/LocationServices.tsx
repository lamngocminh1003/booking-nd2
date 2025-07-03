import { fetchData } from "@/lib/utils";
const fetchAllProvinces = () => fetchData("/api/location/provinces");
const fetchAllDistricts = (provinceId: string) =>
  fetchData(`/api/location/districts/${provinceId}`);
const fetchAllWards = (districtId: string) =>
  fetchData(`/api/location/wards/${districtId}`);

export { fetchAllProvinces, fetchAllDistricts, fetchAllWards };
