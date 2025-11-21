import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner"; // ✅ Import toast for error handling
import {
  getZones,
  getSpecialtiesByExamType,
  getGroupedSpecialty,
  addStartHold,
  createOrUpdatePatient,
  getPatientInfo,
  getListPatientInfo,
  createOnlineRegistration,
  confirmPayment,
  cancelRegistration,
  getOnlineRegistrationList, // ✅ NEW
  getOnlineRegistrationsByPatient, // ✅ NEW
  AddOnlineRegistrationDto,
  OnlineRegistrationResponse,
  PaymentConfirmationRequest,
  PaymentConfirmationResponse,
  OnlineRegistrationPagedResponse,
  OnlineRegistrationQueryParams,
  getAllOnlineRegistrations,
  createRegistrationQueryParams,
  getRegistrationsByStatus,
  getRegistrationsByPatient,
  getRegistrationsByPaymentStatus,
  getCancelledRegistrations,
  getConfirmedRegistrations,
  searchRegistrations,
  OnlineRegistrationItem, // ✅ NEW interface
  OnlineRegistrationListResponse, // ✅ NEW interface
} from "@/services/BookingCatalogService";

// ✅ Interface cho Zone
export interface Zone {
  id: number;
  name: string;
  address?: string; // ✅ Add address field
  enable: boolean; // ✅ Change from isEnable to enable
  examTypes?: ExamType[]; // ✅ Keep examTypes array
  // Keep for compatibility
  code?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface cho ExamType
export interface ExamType {
  id: number;
  name: string;
  description?: string;
  enable: boolean; // ✅ Change from isEnable to enable
  zoneId: number;
  zoneName: string; // ✅ Add zoneName field
  appointmentFormId: number; // ✅ Add appointmentFormId
  appointmentFormKey: string; // ✅ Add appointmentFormKey
  appointmentFormName: string; // ✅ Add appointmentFormName
  servicePrice?: ServicePrice; // Single object, not array
  code?: string;
  specialties?: Specialty[];
  isSelectDoctor: boolean; // ✅ Add isSelectDoctor field
}

// ✅ Interface cho Specialty
export interface Specialty {
  id: number;
  name: string;
  code?: string;
  examTypeId: number;
  description?: string;
  isEnable: boolean;
  createdAt?: string;
  updatedAt?: string;
  slots: AppointmentSlot[];
}

// ✅ Interface cho Grouped Specialty (lịch khám)
export interface GroupedSpecialty {
  date: string;
  dayOfWeek: number;
  dayName: string;
  specialties: SpecialtySchedule[];
}

// ✅ Interface cho Specialty Schedule
export interface SpecialtySchedule {
  specialtyId: number;
  specialtyName: string;
  slots: AppointmentSlot[];
  totalSlots: number;
  availableSlots: number;
}

// ✅ Interface cho Appointment Slot
export interface AppointmentSlot {
  id: number;
  timeStart: string;
  timeEnd: string;
  roomName: string;
  roomCode?: string;
  doctorName?: string;
  doctorCode?: string;
  maxAppointments: number;
  currentAppointments: number;
  availableSlots: number;
  isAvailable: boolean;
  holdSlots: number;
  examTypeId: number;
  specialtyId: number;
  departmentName?: string;
}

// ✅ Interface cho Patient Info
export interface PatientInfo {
  id: number;
  patientId?: number | null;
  fullName: string;
  dateOfBirth: string;
  genderId: number;
  genderName: string;
  nationalId: string;
  jobId: string;
  provinceCode: string;
  wardCode: string;
  address: string;
  bhytId: string;
  licenseDate: string;

  // Additional fields from API
  noiDKKCBId?: number | null;
  cccd: string;
  motherName: string;
  motherPhone: string;
  motherCCCD: string;
  fatherName: string;
  fatherPhone: string;
  fatherCCCD: string;
  isGuardian: boolean;
  age: number;
  yearOfBirth: number;
  provinceName: string;
  districtName?: string | null;
  wardName: string;
  nationalName: string;
  jobName: string;

  // Optional fields for backward compatibility
  phoneNumber?: string;
  email?: string;
  identityNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface cho Hold Result
export interface HoldResult {
  success: boolean;
  holdId?: number;
  expiredAt?: string;
  remainingTime?: number;
  appointmentSlotId?: number;
  patientId?: number;
  message?: string;
}

// ✅ Interface mới cho Grouped Specialty Response (single object, not array)
export interface GroupedSpecialtyResponse {
  servicePrices: ServicePrice[];
  date: string;
  dayOfWeek: string;
  dayName: string;
  examinationId: number;
  examinationName: string;
  id: number;
  doctorId: number;
  doctorName: string;
  roomId: number;
  roomName: string;
  timeStart: string;
  timeEnd: string;
  spaceSlot: number;
  spaceMinutes: number;
  total: number;
  totalAvailableSlot: number;
  totalBookedSlot: number;
  isAvailable: boolean;
  appointmentSlots: AppointmentSlotSimple[];
  specialties?: Specialty[];
}

// ✅ Interface cho Service Price
export interface ServicePrice {
  id: number;
  name: string;
  regularPrice: number; // ✅ Change from regularPrice to price
  price: number; // ✅ Change from regularPrice to price
  enable: boolean; // ✅ Add enable field
}

// ✅ Interface cho Appointment Slot (simplified)
export interface AppointmentSlotSimple {
  slotId: number;
  startSlot: string;
  endSlot: string;
  totalSlot: number;
  availableSlot: number;
  bookedSlot: number;
  isAvailable: boolean;
}

// ✅ Cập nhật State interface để thêm registration list
interface BookingCatalogState {
  zones: Zone[];
  specialties: Specialty[];
  groupedSpecialty: GroupedSpecialtyResponse[];
  patientInfo: PatientInfo | null;
  patientList: PatientInfo[];
  holdResult: HoldResult | null;
  loading: boolean;
  error: string | null;

  // Loading states for specific actions
  loadingZones: boolean;
  loadingSpecialties: boolean;
  loadingSchedules: boolean;
  loadingHold: boolean;
  loadingPatient: boolean;
  loadingPatientList: boolean;

  // Online registration và payment confirmation
  onlineRegistration: OnlineRegistrationResponse | null;
  paymentConfirmation: PaymentConfirmationResponse | null;
  loadingRegistration: boolean;
  loadingPayment: boolean;

  // ✅ NEW: Registration list management
  registrationList: OnlineRegistrationItem[]; // Danh sách tất cả đăng ký
  patientRegistrations: OnlineRegistrationItem[]; // Đăng ký theo bệnh nhân
  loadingRegistrationList: boolean;
  loadingPatientRegistrations: boolean;
  allRegistrationsPagination: {
    items: OnlineRegistrationItem[]; // ✅ Changed from 'data' to 'items'
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  loadingAllRegistrations: boolean;
}

// ✅ Cập nhật initial state
const initialState: BookingCatalogState = {
  zones: [],
  specialties: [],
  groupedSpecialty: [],
  patientInfo: null,
  patientList: [],
  holdResult: null,
  loading: false,
  error: null,

  loadingZones: false,
  loadingSpecialties: false,
  loadingSchedules: false,
  loadingHold: false,
  loadingPatient: false,
  loadingPatientList: false,

  onlineRegistration: null,
  paymentConfirmation: null,
  loadingRegistration: false,
  loadingPayment: false,

  // ✅ NEW: Initialize registration list states
  registrationList: [],
  patientRegistrations: [],
  loadingRegistrationList: false,
  loadingPatientRegistrations: false,
  allRegistrationsPagination: null,
  loadingAllRegistrations: false,
};
// ✅ 1. Fetch zones
export const fetchZones = createAsyncThunk(
  "bookingCatalog/fetchZones",
  async (isEnable: boolean, { rejectWithValue }) => {
    try {
      const response = await getZones(isEnable);

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách khu khám";
      console.error("❌ fetchZones error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
export const fetchAllOnlineRegistrations = createAsyncThunk(
  "bookingCatalog/fetchAllOnlineRegistrations",
  async (
    queryParams: OnlineRegistrationQueryParams = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getAllOnlineRegistrations(queryParams);
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy danh sách tất cả đăng ký khám";
      console.error("❌ fetchAllOnlineRegistrations error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ NEW: Fetch registrations by status với pagination
export const fetchRegistrationsByStatus = createAsyncThunk(
  "bookingCatalog/fetchRegistrationsByStatus",
  async (
    {
      status,
      page = 1,
      pageSize = 20,
    }: { status: number; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRegistrationsByStatus(status, page, pageSize);
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy đăng ký khám theo trạng thái";
      console.error("❌ fetchRegistrationsByStatus error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Fetch registrations by patient với pagination (override existing)
export const fetchRegistrationsByPatient = createAsyncThunk(
  "bookingCatalog/fetchRegistrationsByPatient",
  async (
    {
      patientId,
      page = 1,
      pageSize = 20,
    }: { patientId: number; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRegistrationsByPatient(
        patientId,
        page,
        pageSize
      );
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy đăng ký khám theo bệnh nhân";
      console.error("❌ fetchRegistrationsByPatient error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Fetch registrations by payment status
export const fetchRegistrationsByPaymentStatus = createAsyncThunk(
  "bookingCatalog/fetchRegistrationsByPaymentStatus",
  async (
    {
      statusPayment,
      page = 1,
      pageSize = 20,
    }: { statusPayment: number; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRegistrationsByPaymentStatus(
        statusPayment,
        page,
        pageSize
      );
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy đăng ký khám theo trạng thái thanh toán";
      console.error(
        "❌ fetchRegistrationsByPaymentStatus error:",
        errorMessage
      );
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Fetch cancelled registrations
export const fetchCancelledRegistrations = createAsyncThunk(
  "bookingCatalog/fetchCancelledRegistrations",
  async (
    { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getCancelledRegistrations(page, pageSize);
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy đăng ký khám đã hủy";
      console.error("❌ fetchCancelledRegistrations error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Advanced search registrations
export const searchRegistrationsThunk = createAsyncThunk(
  "bookingCatalog/searchRegistrations",
  async (
    searchCriteria: {
      patientId?: number;
      status?: number[];
      paymentStatus?: number[];
      dateFrom?: string;
      dateTo?: string;
      cancel?: boolean;
      confirm?: boolean;
      type?: number;
      orderId?: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await searchRegistrations(searchCriteria);
      return response as OnlineRegistrationPagedResponse;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi tìm kiếm đăng ký khám";
      console.error("❌ searchRegistrations error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ 2. Fetch specialties by exam type
export const fetchSpecialtiesByExamType = createAsyncThunk(
  "bookingCatalog/fetchSpecialtiesByExamType",
  async (examTypeId: number, { rejectWithValue }) => {
    try {
      const response = await getSpecialtiesByExamType(examTypeId);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách chuyên khoa";
      console.error("❌ fetchSpecialtiesByExamType error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 3. Fetch grouped specialty (lịch khám trong 14 ngày)
export const fetchGroupedSpecialty = createAsyncThunk(
  "bookingCatalog/fetchGroupedSpecialty",
  async (
    { examTypeId, specialtyId }: { examTypeId: number; specialtyId?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getGroupedSpecialty(examTypeId, specialtyId);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách lịch khám";
      console.error("❌ fetchGroupedSpecialty error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 4. Add start hold (đặt giữ chỗ)
export const addStartHoldThunk = createAsyncThunk(
  "bookingCatalog/addStartHold",
  async (
    {
      patientId,
      appointmentSlotId,
    }: { patientId: number; appointmentSlotId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await addStartHold(patientId, appointmentSlotId);

      toast.success("✅ Đặt giữ chỗ khám thành công!");
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi đặt giữ chỗ khám";
      console.error("❌ addStartHold error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 5. Create or update patient
export const createOrUpdatePatientThunk = createAsyncThunk(
  "bookingCatalog/createOrUpdatePatient",
  async (payload: YouMed_PatientCreateDto, { rejectWithValue }) => {
    try {
      const response = await createOrUpdatePatient(payload);

      const successMessage = payload.id
        ? "✅ Cập nhật thông tin bệnh nhân thành công!"
        : "✅ Tạo mới bệnh nhân thành công!";
      toast.success(successMessage);

      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi tạo/cập nhật thông tin bệnh nhân";
      console.error("❌ createOrUpdatePatient error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 6. Fetch patient info
export const fetchPatientInfo = createAsyncThunk(
  "bookingCatalog/fetchPatientInfo",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getPatientInfo(id);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy thông tin bệnh nhân";
      console.error("❌ fetchPatientInfo error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ 6. Fetch patient info
export const fetchPatientInfoByUserLogin = createAsyncThunk(
  "bookingCatalog/fetchPatientInfoByUserLogin",
  async (_, { rejectWithValue }) => {
    // ✅ Fix parameter - use underscore for unused param
    try {
      const response = await getListPatientInfo();

      return response || []; // Ensure we return an array
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy danh sách thông tin bệnh nhân";
      console.error("❌ fetchPatientInfoByUserLogin error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 7. Create online registration
export const createOnlineRegistrationThunk = createAsyncThunk(
  "bookingCatalog/createOnlineRegistration",
  async (
    {
      payload,
      isQR = false,
    }: { payload: AddOnlineRegistrationDto; isQR?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await createOnlineRegistration(payload, isQR);

      toast.success("✅ Đăng ký khám online thành công!");
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi tạo đăng ký khám online";
      console.error("❌ createOnlineRegistration error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 8. Confirm payment
export const confirmPaymentThunk = createAsyncThunk(
  "bookingCatalog/confirmPayment",
  async (payload: PaymentConfirmationRequest, { rejectWithValue }) => {
    try {
      const response = await confirmPayment(payload);

      toast.success("✅ Xác nhận thanh toán thành công!");
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi xác nhận thanh toán";
      console.error("❌ confirmPayment error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 9. Cancel registration
export const cancelRegistrationThunk = createAsyncThunk(
  "bookingCatalog/cancelRegistration",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await cancelRegistration(id);
      toast.success("✅ Hủy đăng ký khám thành công!");
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi hủy đăng ký khám";
      console.error("❌ cancelRegistration error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ 10. Fetch all online registrations (cho user hiện tại)
export const fetchOnlineRegistrationList = createAsyncThunk(
  "bookingCatalog/fetchOnlineRegistrationList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOnlineRegistrationList();
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách đăng ký khám";
      console.error("❌ fetchOnlineRegistrationList error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 11. Fetch online registrations by patient
export const fetchOnlineRegistrationsByPatient = createAsyncThunk(
  "bookingCatalog/fetchOnlineRegistrationsByPatient",
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await getOnlineRegistrationsByPatient(patientId);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy danh sách đăng ký khám theo bệnh nhân";
      console.error(
        "❌ fetchOnlineRegistrationsByPatient error:",
        errorMessage
      );
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ Update state interface để hỗ trợ multiple patients
interface BookingCatalogState {
  zones: Zone[];
  specialties: Specialty[];
  groupedSpecialty: GroupedSpecialtyResponse[];
  patientInfo: PatientInfo | null; // Single patient (for backward compatibility)
  patientList: PatientInfo[]; // ✅ NEW: List of patients from user login
  holdResult: HoldResult | null;
  loading: boolean;
  error: string | null;

  // ✅ Loading states for specific actions
  loadingZones: boolean;
  loadingSpecialties: boolean;
  loadingSchedules: boolean;
  loadingHold: boolean;
  loadingPatient: boolean;
  loadingPatientList: boolean; // ✅ NEW: Loading state for patient list

  // ✅ Thêm các trường mới cho online registration và payment confirmation
  onlineRegistration: OnlineRegistrationResponse | null;
  paymentConfirmation: PaymentConfirmationResponse | null;
  loadingRegistration: boolean;
  loadingPayment: boolean;
}

// ✅ Create slice
const bookingCatalogSlice = createSlice({
  name: "bookingCatalog",
  initialState,
  reducers: {
    // ✅ Clear error
    clearError: (state) => {
      state.error = null;
    },

    // ✅ Clear patient info
    clearPatientInfo: (state) => {
      state.patientInfo = null;
    },

    // ✅ NEW: Clear patient list
    clearPatientList: (state) => {
      state.patientList = [];
    },

    // ✅ Clear hold result
    clearHoldResult: (state) => {
      state.holdResult = null;
    },

    // ✅ Clear specialties (khi đổi exam type)
    clearSpecialties: (state) => {
      state.specialties = [];
    },

    // ✅ Clear grouped specialty (khi đổi specialty)
    clearGroupedSpecialty: (state) => {
      state.groupedSpecialty = [];
    },

    // ✅ Clear online registration
    clearOnlineRegistration: (state) => {
      state.onlineRegistration = null;
    },

    // ✅ Clear payment confirmation
    clearPaymentConfirmation: (state) => {
      state.paymentConfirmation = null;
    }, // ✅ NEW: Clear registration list
    clearRegistrationList: (state) => {
      state.registrationList = [];
    },

    // ✅ NEW: Clear patient registrations
    clearPatientRegistrations: (state) => {
      state.patientRegistrations = [];
    },
    // ✅ NEW: Clear all registrations pagination
    clearAllRegistrationsPagination: (state) => {
      state.allRegistrationsPagination = null;
    },

    // ✅ NEW: Update registration in pagination data
    updateRegistrationInPagination: (
      state,
      action: PayloadAction<{ id: number; status: number }>
    ) => {
      const { id, status } = action.payload;

      if (state.allRegistrationsPagination?.items) {
        // ✅ Changed from 'data' to 'items'
        const index = state.allRegistrationsPagination.items.findIndex(
          (reg) => reg.id === id
        );
        if (index !== -1) {
          state.allRegistrationsPagination.items[index].status = status;
        }
      }
    },

    // ✅ NEW: Remove registration from pagination data
    removeRegistrationFromPagination: (
      state,
      action: PayloadAction<number>
    ) => {
      const registrationId = action.payload;

      if (state.allRegistrationsPagination?.items) {
        // ✅ Changed from 'data' to 'items'
        state.allRegistrationsPagination.items =
          state.allRegistrationsPagination.items.filter(
            (reg) => reg.id !== registrationId
          );
        // Update totalCount
        state.allRegistrationsPagination.totalCount = Math.max(
          0,
          state.allRegistrationsPagination.totalCount - 1
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch zones
      .addCase(fetchZones.pending, (state) => {
        state.loadingZones = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action: PayloadAction<Zone[]>) => {
        state.loadingZones = false;
        state.loading = false;
        state.zones = action.payload || [];
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loadingZones = false;
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllOnlineRegistrations.pending, (state) => {
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllOnlineRegistrations.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingAllRegistrations = false;
          state.loading = false;
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(fetchAllOnlineRegistrations.rejected, (state, action) => {
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch registrations by status
      .addCase(fetchRegistrationsByStatus.pending, (state) => {
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRegistrationsByStatus.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingAllRegistrations = false;
          state.loading = false;
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(fetchRegistrationsByStatus.rejected, (state, action) => {
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch registrations by patient (update for pagination)
      .addCase(fetchRegistrationsByPatient.pending, (state) => {
        state.loadingPatientRegistrations = true;
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRegistrationsByPatient.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingPatientRegistrations = false;
          state.loadingAllRegistrations = false;
          state.loading = false;
          // ✅ UPDATE: Handle both old format and new pagination format with 'items'
          state.patientRegistrations = action.payload.items || []; // ✅ Changed from 'data' to 'items'
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(fetchRegistrationsByPatient.rejected, (state, action) => {
        state.loadingPatientRegistrations = false;
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch registrations by payment status
      .addCase(fetchRegistrationsByPaymentStatus.pending, (state) => {
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRegistrationsByPaymentStatus.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingAllRegistrations = false;
          state.loading = false;
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(fetchRegistrationsByPaymentStatus.rejected, (state, action) => {
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch cancelled registrations
      .addCase(fetchCancelledRegistrations.pending, (state) => {
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCancelledRegistrations.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingAllRegistrations = false;
          state.loading = false;
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(fetchCancelledRegistrations.rejected, (state, action) => {
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Search registrations
      .addCase(searchRegistrationsThunk.pending, (state) => {
        state.loadingAllRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchRegistrationsThunk.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationPagedResponse>) => {
          state.loadingAllRegistrations = false;
          state.loading = false;
          state.allRegistrationsPagination = action.payload;
        }
      )
      .addCase(searchRegistrationsThunk.rejected, (state, action) => {
        state.loadingAllRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch specialties by exam type
      .addCase(fetchSpecialtiesByExamType.pending, (state) => {
        state.loadingSpecialties = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpecialtiesByExamType.fulfilled,
        (state, action: PayloadAction<Specialty[]>) => {
          state.loadingSpecialties = false;
          state.loading = false;
          state.specialties = action.payload || [];
        }
      )
      .addCase(fetchSpecialtiesByExamType.rejected, (state, action) => {
        state.loadingSpecialties = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch grouped specialty
      .addCase(fetchGroupedSpecialty.pending, (state) => {
        state.loadingSchedules = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupedSpecialty.fulfilled,
        (state, action: PayloadAction<GroupedSpecialtyResponse[]>) => {
          state.loadingSchedules = false;
          state.loading = false;
          state.groupedSpecialty = action.payload || [];
        }
      )
      .addCase(fetchGroupedSpecialty.rejected, (state, action) => {
        state.loadingSchedules = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Add start hold
      .addCase(addStartHoldThunk.pending, (state) => {
        state.loadingHold = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addStartHoldThunk.fulfilled,
        (state, action: PayloadAction<HoldResult>) => {
          state.loadingHold = false;
          state.loading = false;
          state.holdResult = action.payload;
        }
      )
      .addCase(addStartHoldThunk.rejected, (state, action) => {
        state.loadingHold = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Create or update patient
      .addCase(createOrUpdatePatientThunk.pending, (state) => {
        state.loadingPatient = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOrUpdatePatientThunk.fulfilled,
        (state, action: PayloadAction<PatientInfo>) => {
          state.loadingPatient = false;
          state.loading = false;
          state.patientInfo = action.payload;

          // ✅ Auto-update patient list if patient exists in list
          const existingIndex = state.patientList.findIndex(
            (patient) => patient.id === action.payload.id
          );
          if (existingIndex !== -1) {
            state.patientList[existingIndex] = action.payload;
          } else {
            // Add new patient to list
            state.patientList.push(action.payload);
          }
        }
      )
      .addCase(createOrUpdatePatientThunk.rejected, (state, action) => {
        state.loadingPatient = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch patient info
      .addCase(fetchPatientInfo.pending, (state) => {
        state.loadingPatient = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPatientInfo.fulfilled,
        (state, action: PayloadAction<PatientInfo>) => {
          state.loadingPatient = false;
          state.loading = false;
          state.patientInfo = action.payload;
        }
      )
      .addCase(fetchPatientInfo.rejected, (state, action) => {
        state.loadingPatient = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Add cases for fetchPatientInfoByUserLogin
      .addCase(fetchPatientInfoByUserLogin.pending, (state) => {
        state.loadingPatientList = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPatientInfoByUserLogin.fulfilled,
        (state, action: PayloadAction<PatientInfo[]>) => {
          state.loadingPatientList = false;
          state.loading = false;
          state.patientList = action.payload || [];

          // ✅ Auto-select first patient if available and no patient currently selected
          if (state.patientList.length > 0 && !state.patientInfo) {
            state.patientInfo = state.patientList[0];
          }
        }
      )
      .addCase(fetchPatientInfoByUserLogin.rejected, (state, action) => {
        state.loadingPatientList = false;
        state.loading = false;
        state.error = action.payload as string;
        console.error("❌ Redux: Failed to load patient list:", action.payload);
      })

      // ✅ Create online registration
      .addCase(createOnlineRegistrationThunk.pending, (state) => {
        state.loadingRegistration = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOnlineRegistrationThunk.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationResponse>) => {
          state.loadingRegistration = false;
          state.loading = false;
          state.onlineRegistration = action.payload;
        }
      )
      .addCase(createOnlineRegistrationThunk.rejected, (state, action) => {
        state.loadingRegistration = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Confirm payment
      .addCase(confirmPaymentThunk.pending, (state) => {
        state.loadingPayment = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        confirmPaymentThunk.fulfilled,
        (state, action: PayloadAction<PaymentConfirmationResponse>) => {
          state.loadingPayment = false;
          state.loading = false;
          state.paymentConfirmation = action.payload;
        }
      )
      .addCase(confirmPaymentThunk.rejected, (state, action) => {
        state.loadingPayment = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch online registration list
      .addCase(fetchOnlineRegistrationList.pending, (state) => {
        state.loadingRegistrationList = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOnlineRegistrationList.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationItem[]>) => {
          state.loadingRegistrationList = false;
          state.loading = false;
          state.registrationList = action.payload || [];
        }
      )
      .addCase(fetchOnlineRegistrationList.rejected, (state, action) => {
        state.loadingRegistrationList = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Fetch online registrations by patient
      .addCase(fetchOnlineRegistrationsByPatient.pending, (state) => {
        state.loadingPatientRegistrations = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOnlineRegistrationsByPatient.fulfilled,
        (state, action: PayloadAction<OnlineRegistrationItem[]>) => {
          state.loadingPatientRegistrations = false;
          state.loading = false;
          state.patientRegistrations = action.payload || [];
        }
      )
      .addCase(fetchOnlineRegistrationsByPatient.rejected, (state, action) => {
        state.loadingPatientRegistrations = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Cancel registration - CONSOLIDATED (remove duplicates)
      .addCase(cancelRegistrationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRegistrationThunk.fulfilled, (state, action) => {
        state.loading = false;

        // Clear related data after successful cancellation
        state.onlineRegistration = null;

        // ✅ Update registration status in lists (if we have the registration ID)
        if (action.meta.arg) {
          const cancelledId = action.meta.arg;

          // Update status to 'cancelled' in both lists
          const mainIndex = state.registrationList.findIndex(
            (reg) => reg.id === cancelledId
          );
          if (mainIndex !== -1) {
            state.registrationList[mainIndex].status = 0;
          }

          const patientIndex = state.patientRegistrations.findIndex(
            (reg) => reg.id === cancelledId
          );
          if (patientIndex !== -1) {
            state.patientRegistrations[patientIndex].status = 0;
          }
        }
      })
      .addCase(cancelRegistrationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ Export actions
export const {
  clearError,
  clearPatientInfo,
  clearPatientList, // ✅ NEW
  clearHoldResult,
  clearSpecialties,
  clearGroupedSpecialty,
  clearOnlineRegistration,
  clearPaymentConfirmation,
  clearRegistrationList, // ✅ NEW
  clearPatientRegistrations, // ✅ NEW
  clearAllRegistrationsPagination,
  updateRegistrationInPagination,
  removeRegistrationFromPagination,
} = bookingCatalogSlice.actions;

// ✅ Export reducer
export default bookingCatalogSlice.reducer;

// ✅ Fixed YouMed_PatientCreateDto to match API requirements exactly
export interface YouMed_PatientCreateDto {
  id?: number; // For update operations (0 for new, existing id for update)
  patientId?: string | null; // Keep for API compatibility
  fullName: string;
  dateOfBirth: string; // ISO string format: "2025-10-22T02:28:54.389Z"
  genderId: number; // 0=Nam, 1=Nữ, 2=Khác (API field)
  nationalId?: string;
  jobId?: string;
  provinceCode?: string;
  wardCode?: string;
  address?: string;
  bhytId?: string;
  licenseDate?: string; // ISO string format
  noiDKKCBId?: number;
  cccd?: string;
  phoneNumber?: string;

  motherName?: string;
  motherPhone?: string;
  motherCCCD?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherCCCD?: string;
  isGuardian: boolean; // Required API field
}
