import { format, addWeeks, startOfYear, getISOWeek } from "date-fns";

export interface ShiftSlot {
  rooms: RoomSlot[];
}

export interface RoomSlot {
  id: string;
  name: string;
  classification: string;
  customStartTime?: string;
  customEndTime?: string;
  appointmentCount?: number;
  specialties: string[];
  selectedSpecialty?: string;
  selectedDoctor?: string;
  priorityOrder?: number;
  notes?: string;
}

export interface WeekOption {
  value: string;
  label: string;
  isCurrent: boolean;
  isPast: boolean;
}

// Generate weeks list for the current year and next year
export const getWeeksList = (): WeekOption[] => {
  const weeks: WeekOption[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeek = getISOWeek(currentDate);

  // Generate weeks for current year
  for (let year = currentYear; year <= currentYear + 1; year++) {
    const startOfYearDate = startOfYear(new Date(year, 0, 1));
    let weekCount = 52;

    // Check if year has 53 weeks
    const lastDayOfYear = new Date(year, 11, 31);
    if (getISOWeek(lastDayOfYear) === 53) {
      weekCount = 53;
    }

    for (let week = 1; week <= weekCount; week++) {
      const weekValue = `${year}-W${week.toString().padStart(2, "0")}`;

      // Calculate Monday of this week
      const mondayOfWeek = addWeeks(startOfYearDate, week - 1);
      const startDate = format(mondayOfWeek, "dd/MM");
      const endDate = format(
        addWeeks(mondayOfWeek, 0).setDate(mondayOfWeek.getDate() + 4),
        "dd/MM"
      );

      const isCurrent = year === currentYear && week === currentWeek;
      const isPast =
        year < currentYear || (year === currentYear && week < currentWeek);

      weeks.push({
        value: weekValue,
        label: `Tuần ${week} (${startDate} - ${endDate})`,
        isCurrent,
        isPast,
      });
    }
  }

  return weeks;
};

// Mock data for initial testing
export const mockData: Record<string, Record<string, ShiftSlot>> = {
  "1": {
    // Department ID 1
    "2024-12-16-morning": {
      rooms: [
        {
          id: "303",
          name: "Phòng 303",
          classification: "normal",
          customStartTime: "07:30",
          customEndTime: "11:00",
          appointmentCount: 15,
          specialties: ["Khám nội tổng quát"],
          selectedSpecialty: "Khám nội tổng quát",
          selectedDoctor: "BS. Nguyễn Thị Mai",
          priorityOrder: 1,
        },
        {
          id: "307",
          name: "Phòng 307",
          classification: "normal",
          customStartTime: "08:00",
          customEndTime: "11:00",
          appointmentCount: 12,
          specialties: ["Khám nội tổng quát", "Đo điện tim (ECG)"],
          selectedSpecialty: "Đo điện tim (ECG)",
          selectedDoctor: "BS. Trần Văn Nam",
          priorityOrder: 2,
        },
      ],
    },
    "2024-12-16-afternoon": {
      rooms: [
        {
          id: "315",
          name: "Phòng 315",
          classification: "normal",
          customStartTime: "13:30",
          customEndTime: "16:00",
          appointmentCount: 10,
          specialties: ["Khám nhi"],
          selectedSpecialty: "Khám nhi",
          selectedDoctor: "BS. Lê Thị Hoa",
          priorityOrder: 1,
        },
      ],
    },
  },
  "2": {
    // Department ID 2
    "2024-12-16-morning": {
      rooms: [
        {
          id: "404",
          name: "Phòng 404 (Đặc biệt)",
          classification: "special",
          customStartTime: "07:30",
          customEndTime: "11:00",
          appointmentCount: 8,
          specialties: ["Khám sản phụ khoa", "Siêu âm"],
          selectedSpecialty: "Siêu âm",
          selectedDoctor: "BS. Phạm Minh Tuấn",
          priorityOrder: 1,
          notes: "Phòng có thiết bị siêu âm chuyên dụng",
        },
      ],
    },
    "2024-12-17-morning": {
      rooms: [
        {
          id: "405",
          name: "Phòng 405 (Đặc biệt)",
          classification: "special",
          customStartTime: "08:00",
          customEndTime: "11:30",
          appointmentCount: 6,
          specialties: ["Nội soi", "Xét nghiệm"],
          selectedSpecialty: "Nội soi",
          selectedDoctor: "BS. Vũ Thị Lan",
          priorityOrder: 1,
        },
      ],
    },
  },
  "3": {
    // Department ID 3
    "2024-12-18-afternoon": {
      rooms: [
        {
          id: "420",
          name: "Phòng 420",
          classification: "urgent",
          customStartTime: "13:30",
          customEndTime: "16:30",
          appointmentCount: 20,
          specialties: ["Khám nội tổng quát"],
          selectedSpecialty: "Khám nội tổng quát",
          selectedDoctor: "BS. Hoàng Văn Đức",
          priorityOrder: 1,
          notes: "Phòng khám nhanh",
        },
        {
          id: "421",
          name: "Phòng 421 (11h-13h)",
          classification: "special",
          customStartTime: "11:00",
          customEndTime: "13:00",
          appointmentCount: 15,
          specialties: ["Tiêm chủng"],
          selectedSpecialty: "Tiêm chủng",
          selectedDoctor: "",
          priorityOrder: 2,
          notes: "Chỉ hoạt động 11h-13h",
        },
      ],
    },
  },
};

// Helper function to generate empty schedule for a department
export const createEmptyScheduleForDepartment = (): Record<
  string,
  ShiftSlot
> => {
  return {};
};

// Helper function to generate time slots for a week
export const generateTimeSlots = (selectedWeek: string) => {
  const [year, weekStr] = selectedWeek.split("-W");
  const weekNum = parseInt(weekStr);
  const yearNum = parseInt(year);

  const startOfYear = new Date(yearNum, 0, 1);
  const daysToAdd = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
  const mondayOfWeek = new Date(yearNum, 0, 1 + daysToAdd);

  const slots = [];
  const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

  for (let i = 0; i < 5; i++) {
    const currentDay = new Date(mondayOfWeek);
    currentDay.setDate(mondayOfWeek.getDate() + i);

    const formattedDate = format(currentDay, "dd/MM");
    const fullDate = format(currentDay, "yyyy-MM-dd");

    // Morning slot
    slots.push({
      id: `${fullDate}-morning`,
      day: dayNames[i],
      period: "sáng",
      date: formattedDate,
      fullDate: fullDate,
    });

    // Afternoon slot
    slots.push({
      id: `${fullDate}-afternoon`,
      day: dayNames[i],
      period: "chiều",
      date: formattedDate,
      fullDate: fullDate,
    });
  }

  return slots;
};

// Sample room classifications
export const defaultRoomClassifications = {
  normal: {
    name: "Khám thường",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    enabled: true,
    description: "Phòng khám thường, không đặc biệt",
  },
  priority: {
    name: "Ưu tiên",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    enabled: true,
    description: "Phòng dành cho bệnh nhân ưu tiên",
  },
  urgent: {
    name: "Khẩn cấp",
    color: "bg-red-100 text-red-800 border-red-300",
    enabled: true,
    description: "Phòng dành cho ca khẩn cấp",
  },
  special: {
    name: "Đặc biệt",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    enabled: true,
    description: "Phòng có trang thiết bị đặc biệt",
  },
  vip: {
    name: "VIP",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    enabled: true,
    description: "Phòng VIP",
  },
  emergency: {
    name: "Cấp cứu",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    enabled: true,
    description: "Phòng cấp cứu",
  },
};

// Default shift configurations
export const defaultShiftConfig = {
  morning: {
    startTime: "07:30",
    endTime: "11:00",
    maxAppointments: 15,
  },
  afternoon: {
    startTime: "13:30",
    endTime: "16:00",
    maxAppointments: 12,
  },
  breakTime: "12:00",
  appointmentDuration: 15, // minutes
};
