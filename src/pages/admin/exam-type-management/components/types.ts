import type { ExamType } from "@/store/slices/examTypeSlice";

export interface ExamTypeWithZone extends ExamType {
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
  zoneName?: string;
}

export interface ExamTypePayload {
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  appointmentFormId: number;
}

// ✅ Updated interface to match actual API response
export interface ExamZoneDetails {
  departmentHospitals?: {
    sepicalties: {
      id: number;
      name: string;
      description: string | null;
      listType: string | null;
      enable: boolean;
    }[];
    id: number;
    name: string;
    enable: boolean;
    departmentHospital_Id_Postgresql: number;
  }[];
  id?: number;
  zoneId?: number;
  zoneName?: string;
  name?: string;
  description?: string;
  enable?: boolean;
  appointmentFormId?: number;
  appointmentFormKey?: string;
  appointmentFormName?: string;
}

// ✅ Add type for Redux state structure (if it's different)
export interface ZoneExamType {
  departmentHospitals: {
    sepicalties: {
      id: number;
      name: string;
      description: string | null;
      listType: string | null;
      enable: boolean;
    }[];
    id: number;
    name: string;
    enable: boolean;
    departmentHospital_Id_Postgresql: number;
  }[];
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
}

export interface ExamTypeSpecialtyPayload {
  examTypeId: number;
  specialtyId: number;
  departmentHospitalId: number;
  enable: boolean;
}

// ✅ Nếu chưa có, thêm interface cho selectedExamTypeForServicePrice
export interface SelectedExamTypeForServicePrice {
  id: number;
  name: string;
  zoneName: string;
}
