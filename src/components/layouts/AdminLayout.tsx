import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen">
            <div className="flex items-center gap-2 p-4 border-b bg-white">
              <SidebarTrigger className="h-7 w-7" />
              <div className="flex-1">
                <AdminHeader />
              </div>
            </div>
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
