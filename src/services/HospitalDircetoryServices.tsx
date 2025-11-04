import { fetchData } from "@/lib/utils";
const fetchListNation = () => fetchData("/api/hospital-dircetory/nations");
const fetchListJob = () => fetchData(`/api/hospital-dircetory/jobs`);
const fetchListGender = () => fetchData(`/api/hospital-dircetory/genders`);
export { fetchListNation, fetchListJob, fetchListGender };
