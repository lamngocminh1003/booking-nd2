import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export interface CreateClinicScheduleDto {
  // Định nghĩa theo schema của API - có thể cần điều chỉnh theo actual schema
  roomId?: number;
  examTypeId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  maxAppointments?: number;
  appointmentDuration?: number;
  holdSlot?: number;
  notes?: string;
  // ✅ Thêm các field cần thiết cho API
  dateInWeek?: string;
  total?: number;
  spaceMinutes?: number;
  specialtyId?: number;
  examinationId?: number;
  doctorId?: number;
  departmentHospitalId?: number;
  startSlot?: string; // Format: "HH:mm:ss"
  endSlot?: string; // Format: "HH:mm:ss"
}

export interface ClinicScheduleQueryParams {
  Week?: number;
  Year?: number;
  ZoneId?: number;
}

export const getClinicSchedules = (params?: ClinicScheduleQueryParams) => {
  const queryString = params
    ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString()}`
    : "";

  return fetchData(`/api/clinic-schedule/list${queryString}`);
};

export const getClinicScheduleById = (id: number) =>
  fetchData(`/api/clinic-schedule/${id}`);

export const createClinicSchedules = (data: CreateClinicScheduleDto[]) =>
  postJSONAuth("/api/clinic-schedule/create", data);

export const updateClinicSchedule = (
  id: number,
  data: CreateClinicScheduleDto
) => putJSONAuth(`/api/clinic-schedule/${id}`, data);

export const deleteClinicSchedule = (id: number) =>
  deleteJSONAuth(`/api/clinic-schedule/${id}`);
