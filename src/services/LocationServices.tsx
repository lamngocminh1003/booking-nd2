import { fetchData } from "@/lib/utils";
const fetchAllProvinces = () => fetchData("/api/location/provinces");

const fetchAllWards = (provinceId: string) =>
  fetchData(`/api/location/wards/${provinceId}`);

export { fetchAllProvinces, fetchAllWards };
