export interface Appointment {
  id: string;
  patientName: string;
  childName: string;
  parentPhone: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "regular" | "urgent" | "specialist";
  notes?: string;
}
