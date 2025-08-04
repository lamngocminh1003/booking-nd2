import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getDepartments = () => fetchData("/api/department/list");

export const createDepartment = (data: { name: string }) =>
  postJSONAuth("/api/department/create", data);

export const updateDepartment = (id: number, data: { name: string }) =>
  putJSONAuth(`/api/department/${id}`, data);

export const deleteDepartment = (id: number) =>
  deleteJSONAuth(`/api/department/${id}`);
