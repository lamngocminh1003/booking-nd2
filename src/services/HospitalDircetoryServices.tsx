import { fetchData } from "@/lib/utils";
const fetchListNation = () => fetchData("/api/HospitalDircetory/GetListNation");
const fetchListJob = () => fetchData(`/api/HospitalDircetory/GetListJob`);
const fetchListGender = () => fetchData(`/api/HospitalDircetory/GetListGender`);

export { fetchListNation, fetchListJob, fetchListGender };
