import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Insurance from "./pages/Insurance";
import Children from "./pages/Children";
import ChildForm from "./pages/ChildForm";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Payment from "./pages/Payment";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import DoctorManagement from "./pages/DoctorManagement";
import AdminAppointments from "./pages/admin/AdminAppointments";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Footer from "./components/ui/Footer";
import Navigation from "./components/Navigation";
import { useAuthInitializer } from "@/hooks/useAuthInitializer";
import { useTokenRefresher } from "@/hooks/useTokenRefresher";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useLocation } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard1 from "./pages/admin/Dashboard";
import AccountManagement from "./pages/admin/AccountManagement";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import PatientManagement1 from "./pages/admin/PatientManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import Reports1 from "./pages/admin/Reports";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
const queryClient = new QueryClient();
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

function AppWrapper() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Đây mới là component có chứa useEffect theo dõi đăng nhập
function App() {
  const location = useLocation();
  const hideNav =
    ["/login", "/register"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  useAuthInitializer(); // Load token từ local hoặc secure storage
  useTokenRefresher();
  GoogleAuth.initialize(); // chạy 1 lần

  return (
    <>
      {!hideNav && <Navigation />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/children" element={<Children />} />
        <Route path="/children/:childId/edit" element={<ChildForm />} />
        <Route path="/children/new" element={<ChildForm />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Admin Routes */}
        <Route path="*" element={<NotFound />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard1 />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="records" element={<AppointmentManagement />} />
          <Route path="patients" element={<PatientManagement1 />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="reports" element={<Reports1 />} />{" "}
          <Route path="appointments" element={<AdminAppointments />} />{" "}
          <Route path="doctors" element={<DoctorManagement />} />{" "}
          <Route path="weekly-schedule" element={<WeeklySchedule />} />
        </Route>
      </Routes>
      {!hideNav && <Footer />}
    </>
  );
}

export default AppWrapper;
