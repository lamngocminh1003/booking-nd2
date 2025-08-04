import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getSpecialties = () => fetchData("/api/specialty/list");

export const createSpecialty = (data: { name: string }) =>
  postJSONAuth("/api/specialty/create", data);

export const updateSpecialty = (
  id: number,
  data: { name: string; description: string; listType: string; enable: boolean }
) => putJSONAuth(`/api/specialty/${id}`, data);

export const deleteSpecialty = (id: number) =>
  deleteJSONAuth(`/api/specialty/${id}`);
