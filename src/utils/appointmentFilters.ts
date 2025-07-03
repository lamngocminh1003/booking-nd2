import { Appointment } from "@/types/appointment";

export const filterAppointments = (
  appointments: Appointment[],
  selectedTab: string,
  searchTerm: string
): Appointment[] => {
  let filtered = appointments;

  if (selectedTab !== "all") {
    filtered = filtered.filter((apt) => apt.status === selectedTab);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return filtered;
};
