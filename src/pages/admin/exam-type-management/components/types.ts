import type { ExamType } from "@/store/slices/examTypeSlice";

export interface ExamTypeWithZone extends ExamType {
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
  zoneName?: string;
  isSelectDoctor?: boolean; // ✅ Ensure this is included in ExamTypeWithZone
}

export interface ExamTypePayload {
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  appointmentFormId: number;
  isSelectDoctor?: boolean; // ✅ Fix: Remove ExamTypePayload and keep isSelectDoctor
  code?: string; // ✅ Add code field if needed
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
      isSelectDoctor?: boolean; // ✅ Add isSelectDoctor to sepicalties
    }[];
    id: number;
    name: string;
    enable: boolean;
    isSelectDoctor?: boolean; // ✅ Add isSelectDoctor to departmentHospitals
    departmentHospital_Id_Postgresql: number;
  }[];
  id?: number;
  zoneId?: number;
  zoneName?: string;
  name?: string;
  description?: string;
  enable?: boolean;
  isSelectDoctor?: boolean; // ✅ Add isSelectDoctor to main interface
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
      isSelectDoctor?: boolean; // ✅ Add isSelectDoctor
    }[];
    id: number;
    name: string;
    enable: boolean;
    isSelectDoctor?: boolean; // ✅ Add isSelectDoctor
    departmentHospital_Id_Postgresql: number;
  }[];
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Add isSelectDoctor
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
}

export interface ExamTypeSpecialtyPayload {
  examTypeId: number;
  specialtyId: number;
  departmentHospitalId: number;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Add isSelectDoctor
}

// ✅ Nếu chưa có, thêm interface cho selectedExamTypeForServicePrice
export interface SelectedExamTypeForServicePrice {
  id: number;
  name: string;
  zoneName: string;
  isSelectDoctor?: boolean; // ✅ Add isSelectDoctor
}
