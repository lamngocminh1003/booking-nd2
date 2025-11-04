import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Insurance from "./pages/Insurance";
import ChildForm from "./pages/ChildForm";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Payment from "./pages/Payment";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import DoctorManagement from "./pages/DoctorManagement";
import AdminAppointments from "./pages/admin/AdminAppointments";
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
import Examinations from "./pages/admin/ExaminationManagement";
import Reports1 from "./pages/admin/Reports";
import WeeklySchedule from "./pages/admin/WeeklySchedule";
const queryClient = new QueryClient();
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import MedicalProcedures from "./pages/MedicalProcedures";
import Contact from "./pages/Contact";
import ZoneManagement from "./pages/admin/ZoneManagement";
import PrivateRoute from "@/components/PrivateRoute";
import SpecialtyManagement from "./pages/admin/SpecialtyManagement";
import ServicePriceManagement from "./pages/admin/ServicePriceManagement";
import ExamTypeManagement from "./pages/admin/exam-type-management/index";
import BookingFlow from "./pages/BookingFlow";
import ExamReceipt from "./pages/ExamReceipt";

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
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/insurance"
          element={
            <PrivateRoute>
              <Insurance />
            </PrivateRoute>
          }
        />
        <Route
          path="/book-appointment"
          element={
            <PrivateRoute>
              <BookAppointment />
            </PrivateRoute>
          }
        />
        // routes
        <Route
          path="/booking-flow"
          element={
            <PrivateRoute>
              <BookingFlow />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking-flow/:zoneId/:examTypeId"
          element={
            <PrivateRoute>
              <BookingFlow />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/exam-receipt"
          element={
            <PrivateRoute>
              <ExamReceipt />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/medical-procedure" element={<MedicalProcedures />} />
        <Route path="/contact" element={<Contact />} />
        {/* Admin Routes */}
        <Route path="*" element={<NotFound />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard1 />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="records" element={<AppointmentManagement />} />
          <Route path="patients" element={<PatientManagement1 />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="reports" element={<Reports1 />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="weekly-schedule" element={<WeeklySchedule />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="zones" element={<ZoneManagement />} />
          <Route path="specialties" element={<SpecialtyManagement />} />
          <Route path="service-prices" element={<ServicePriceManagement />} />
          <Route path="exam-types" element={<ExamTypeManagement />} />
        </Route>
      </Routes>
      {!hideNav && <Footer />}
    </>
  );
}

export default AppWrapper;
