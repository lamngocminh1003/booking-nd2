import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "doctor" | "nurse" | "staff";
  status: "Active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  headDoctor: string;
  status: "Active" | "inactive";
}

interface Room {
  id: number;
  number: string;
  name: string;
  departmentId: number;
  departmentName: string;
  capacity: number;
  workingHours: {
    start: string;
    end: string;
  };
  assignedDoctors: number[];
  status: "Active" | "maintenance" | "inactive";
}

interface Schedule {
  id: number;
  doctorId: number;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  roomId: number;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  bookedPatients: number;
  status: "available" | "full" | "cancelled";
}

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  departmentName: string;
  roomName: string;
  date: string;
  time: string;
  status:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "no-show"
    | "processing"
    | "transferred"
    | "confirmed"
    | "pending";
  source: "internal" | "his";
  notes?: string;
  patientAge?: number;
}

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  guardian: string;
  phone: string;
  address: string;
  medicalRecord: string;
  lastVisit?: string;
  hisLinked: boolean;
  visitCount: number;
}

interface SystemStatus {
  hisSyncStatus: "success" | "error" | "pending";
  lastSyncTime: string;
  pendingRecords: number;
  errorMessage?: string;
}

interface AdminState {
  users: User[];
  departments: Department[];
  rooms: Room[];
  schedules: Schedule[];
  appointments: Appointment[];
  patients: Patient[];
  systemStatus: SystemStatus;
  stats: {
    totalUsers: number;
    totalAppointments: number;
    totalPatients: number;
    completedAppointments: number;
    hisAppointments: number;
    todayAppointments: number;
    todaySchedules: number;
    weeklyAppointments: number;
    monthlyAppointments: number;
    roomUtilization: number;
    usersByRole: Record<string, number>;
    appointmentsByStatus: Record<string, number>;
    appointmentsByDepartment: Record<string, number>;
    patientsByAge: Record<string, number>;
    doctorWorkload: Record<string, number>;
  };
  loading: boolean;
}

const initialState: AdminState = {
  users: [
    {
      id: 1,
      name: "Dr. Nguyễn Văn A",
      email: "drnguyenvana@hospital.com",
      role: "doctor",
      status: "Active",
      createdAt: "2024-01-15",
      lastLogin: "2024-06-16",
    },
    {
      id: 2,
      name: "Y tá Trần Thị B",
      email: "nurse.tran@hospital.com",
      role: "nurse",
      status: "Active",
      createdAt: "2024-02-10",
      lastLogin: "2024-06-15",
    },
    {
      id: 3,
      name: "Admin Lê Văn C",
      email: "admin.le@hospital.com",
      role: "admin",
      status: "Active",
      createdAt: "2024-01-01",
      lastLogin: "2024-06-16",
    },
    {
      id: 4,
      name: "Nhân viên Phạm Thị D",
      email: "staff.pham@hospital.com",
      role: "staff",
      status: "Active",
      createdAt: "2024-03-01",
      lastLogin: "2024-06-14",
    },
    {
      id: 5,
      name: "Dr. Trần Văn B",
      email: "drtranvanb@hospital.com",
      role: "doctor",
      status: "Active",
      createdAt: "2024-02-01",
      lastLogin: "2024-06-16",
    },
    {
      id: 6,
      name: "Dr. Lê Thị C",
      email: "drlethic@hospital.com",
      role: "doctor",
      status: "Active",
      createdAt: "2024-03-01",
      lastLogin: "2024-06-16",
    },
  ],
  departments: [
    {
      id: 1,
      name: "Khoa Nhi",
      code: "PEDI",
      description: "Khoa khám và điều trị các bệnh về trẻ em",
      headDoctor: "Dr. Nguyễn Văn A",
      status: "Active",
    },
    {
      id: 2,
      name: "Khoa Tai Mũi Họng",
      code: "ENT",
      description: "Khoa khám và điều trị các bệnh về tai mũi họng",
      headDoctor: "Dr. Trần Văn B",
      status: "Active",
    },
    {
      id: 3,
      name: "Khoa Ngoại",
      code: "SURG",
      description: "Khoa phẫu thuật nhi",
      headDoctor: "Dr. Lê Thị C",
      status: "Active",
    },
  ],
  rooms: [
    {
      id: 1,
      number: "P101",
      name: "Phòng khám Nhi 1",
      departmentId: 1,
      departmentName: "Khoa Nhi",
      capacity: 20,
      workingHours: {
        start: "08:00",
        end: "17:00",
      },
      assignedDoctors: [1],
      status: "Active",
    },
    {
      id: 2,
      number: "P102",
      name: "Phòng khám Nhi 2",
      departmentId: 1,
      departmentName: "Khoa Nhi",
      capacity: 15,
      workingHours: {
        start: "08:00",
        end: "17:00",
      },
      assignedDoctors: [1],
      status: "Active",
    },
    {
      id: 3,
      number: "P201",
      name: "Phòng khám TMH",
      departmentId: 2,
      departmentName: "Khoa Tai Mũi Họng",
      capacity: 25,
      workingHours: {
        start: "07:30",
        end: "16:30",
      },
      assignedDoctors: [5],
      status: "Active",
    },
  ],
  schedules: [
    {
      id: 1,
      doctorId: 1,
      doctorName: "Dr. Nguyễn Văn A",
      departmentId: 1,
      departmentName: "Khoa Nhi",
      roomId: 1,
      roomName: "Phòng khám Nhi 1",
      date: "2024-06-17",
      startTime: "08:00",
      endTime: "12:00",
      maxPatients: 20,
      bookedPatients: 15,
      status: "available",
    },
    {
      id: 2,
      doctorId: 1,
      doctorName: "Dr. Nguyễn Văn A",
      departmentId: 1,
      departmentName: "Khoa Nhi",
      roomId: 2,
      roomName: "Phòng khám Nhi 2",
      date: "2024-06-17",
      startTime: "14:00",
      endTime: "17:00",
      maxPatients: 15,
      bookedPatients: 15,
      status: "full",
    },
  ],
  appointments: [
    {
      id: 1,
      patientName: "Bé Nguyễn Văn D",
      doctorName: "Dr. Nguyễn Văn A",
      departmentName: "Khoa Nhi",
      roomName: "Phòng khám Nhi 1",
      date: "2024-06-17",
      time: "09:00",
      status: "confirmed",
      source: "internal",
      notes: "Khám định kỳ",
      patientAge: 4,
    },
    {
      id: 2,
      patientName: "Bé Trần Thị E",
      doctorName: "Dr. Nguyễn Văn A",
      departmentName: "Khoa Nhi",
      roomName: "Phòng khám Nhi 1",
      date: "2024-06-16",
      time: "14:30",
      status: "completed",
      source: "his",
      notes: "Tiêm phòng",
      patientAge: 5,
    },
    {
      id: 3,
      patientName: "Bé Phạm Văn F",
      doctorName: "Dr. Trần Văn B",
      departmentName: "Khoa Tai Mũi Họng",
      roomName: "Phòng khám TMH",
      date: "2024-06-16",
      time: "10:00",
      status: "processing",
      source: "internal",
      notes: "Khám tai",
      patientAge: 2,
    },
  ],
  patients: [
    {
      id: 1,
      name: "Bé Nguyễn Văn D",
      dateOfBirth: "2020-05-15",
      gender: "male",
      guardian: "Nguyễn Văn F",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      medicalRecord: "MR001",
      lastVisit: "2024-06-10",
      hisLinked: true,
      visitCount: 3,
    },
    {
      id: 2,
      name: "Bé Trần Thị E",
      dateOfBirth: "2019-03-22",
      gender: "female",
      guardian: "Trần Văn G",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      medicalRecord: "MR002",
      lastVisit: "2024-06-16",
      hisLinked: false,
      visitCount: 5,
    },
    {
      id: 3,
      name: "Bé Phạm Văn F",
      dateOfBirth: "2021-01-10",
      gender: "male",
      guardian: "Phạm Thị H",
      phone: "0456789123",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      medicalRecord: "MR003",
      lastVisit: "2024-06-14",
      hisLinked: true,
      visitCount: 7,
    },
  ],
  systemStatus: {
    hisSyncStatus: "success",
    lastSyncTime: "2024-06-16 08:30:00",
    pendingRecords: 5,
    errorMessage: "",
  },
  stats: {
    totalUsers: 6,
    totalAppointments: 3,
    totalPatients: 3,
    completedAppointments: 1,
    hisAppointments: 1,
    todayAppointments: 1,
    todaySchedules: 2,
    weeklyAppointments: 3,
    monthlyAppointments: 3,
    roomUtilization: 75,
    usersByRole: {
      admin: 1,
      doctor: 3,
      nurse: 1,
      staff: 1,
    },
    appointmentsByStatus: {
      confirmed: 1,
      completed: 1,
      processing: 1,
      cancelled: 0,
      transferred: 0,
      pending: 0,
    },
    appointmentsByDepartment: {
      "Khoa Nhi": 2,
      "Khoa Tai Mũi Họng": 1,
      "Khoa Ngoại": 0,
    },
    patientsByAge: {
      "<1": 0,
      "1-3": 1,
      "4-6": 2,
      ">6": 0,
    },
    doctorWorkload: {
      "Dr. Nguyễn Văn A": 2,
      "Dr. Trần Văn B": 1,
      "Dr. Lê Thị C": 0,
    },
  },
  loading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addUser: (state, action: PayloadAction<Omit<User, "id">>) => {
      const newUser = {
        ...action.payload,
        id: Math.max(...state.users.map((u) => u.id)) + 1,
      };
      state.users.push(newUser);
      state.stats.totalUsers = state.users.length;
      state.stats.usersByRole[action.payload.role] =
        (state.stats.usersByRole[action.payload.role] || 0) + 1;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        state.stats.usersByRole[user.role] = Math.max(
          0,
          (state.stats.usersByRole[user.role] || 0) - 1
        );
      }
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.stats.totalUsers = state.users.length;
    },
    addDepartment: (state, action: PayloadAction<Omit<Department, "id">>) => {
      const newDepartment = {
        ...action.payload,
        id: Math.max(...state.departments.map((d) => d.id)) + 1,
      };
      state.departments.push(newDepartment);
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(
        (d) => d.id === action.payload.id
      );
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
    deleteDepartment: (state, action: PayloadAction<number>) => {
      state.departments = state.departments.filter(
        (d) => d.id !== action.payload
      );
    },
    addRoom: (state, action: PayloadAction<Omit<Room, "id">>) => {
      const newRoom = {
        ...action.payload,
        id: Math.max(...state.rooms.map((r) => r.id)) + 1,
      };
      state.rooms.push(newRoom);
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
    deleteRoom: (state, action: PayloadAction<number>) => {
      state.rooms = state.rooms.filter((r) => r.id !== action.payload);
    },
    addSchedule: (state, action: PayloadAction<Omit<Schedule, "id">>) => {
      const newSchedule = {
        ...action.payload,
        id: Math.max(...state.schedules.map((s) => s.id)) + 1,
      };
      state.schedules.push(newSchedule);
    },
    updateSchedule: (state, action: PayloadAction<Schedule>) => {
      const index = state.schedules.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.schedules[index] = action.payload;
      }
    },
    deleteSchedule: (state, action: PayloadAction<number>) => {
      state.schedules = state.schedules.filter((s) => s.id !== action.payload);
    },
    addPatient: (state, action: PayloadAction<Omit<Patient, "id">>) => {
      const newPatient = {
        ...action.payload,
        id: Math.max(...state.patients.map((p) => p.id)) + 1,
      };
      state.patients.push(newPatient);
      state.stats.totalPatients = state.patients.length;
    },
    updateAppointmentStatus: (
      state,
      action: PayloadAction<{ id: number; status: Appointment["status"] }>
    ) => {
      const appointment = state.appointments.find(
        (a) => a.id === action.payload.id
      );
      if (appointment) {
        const oldStatus = appointment.status;
        appointment.status = action.payload.status;

        // Update status counts
        state.stats.appointmentsByStatus[oldStatus] = Math.max(
          0,
          (state.stats.appointmentsByStatus[oldStatus] || 0) - 1
        );
        state.stats.appointmentsByStatus[action.payload.status] =
          (state.stats.appointmentsByStatus[action.payload.status] || 0) + 1;
        state.stats.completedAppointments = state.appointments.filter(
          (a) => a.status === "completed"
        ).length;
      }
    },
    updateSystemStatus: (
      state,
      action: PayloadAction<Partial<SystemStatus>>
    ) => {
      state.systemStatus = { ...state.systemStatus, ...action.payload };
    },
  },
});

export const {
  setLoading,
  addUser,
  updateUser,
  deleteUser,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addRoom,
  updateRoom,
  deleteRoom,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  addPatient,
  updateAppointmentStatus,
  updateSystemStatus,
} = adminSlice.actions;

export default adminSlice.reducer;
