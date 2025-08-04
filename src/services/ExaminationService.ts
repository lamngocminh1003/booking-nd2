import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getExaminations = () => fetchData("/api/examination/list");

export const createExamination = (data: {
  name: string;
  workSession: string;
  startTime: string;
  endTime: string;
}) => postJSONAuth("/api/examination/create", data);

export const updateExamination = (
  id: number,
  data: {
    name: string;
    workSession: string;
    startTime: string;
    endTime: string;
    enable: boolean;
  }
) => putJSONAuth(`/api/examination/${id}`, data);

export const deleteExamination = (id: number) =>
  deleteJSONAuth(`/api/examination/${id}`);
