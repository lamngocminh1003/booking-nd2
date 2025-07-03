import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  FileText,
  User,
  Calendar,
  Building,
  ClipboardList,
  NotebookPen,
  Hospital,
  BriefcaseMedical,
  CalendarDays,
} from "lucide-react";
import logo from "@/assets/imgs/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "Quản lý tài khoản",
    url: "/admin/accounts",
    icon: Users,
  },
  {
    title: "Quản lý bác sĩ",
    url: "/admin/doctors",
    icon: BriefcaseMedical,
  },
  {
    title: "Quản lý lịch hẹn",
    url: "/admin/appointments",
    icon: NotebookPen,
  },
  {
    title: "Quản lý phiếu khám",
    url: "/admin/records",
    icon: FileText,
  },
  {
    title: "Quản lý bệnh nhi",
    url: "/admin/patients",
    icon: User,
  },
  {
    title: "Quản lý khoa",
    url: "/admin/departments",
    icon: Building,
  },
  {
    title: "Quản lý phòng khám",
    url: "/admin/rooms",
    icon: Hospital,
  },
  {
    title: "Phân lịch khám",
    url: "/admin/schedules",
    icon: Calendar,
  },
  {
    title: "Lịch khám theo tuần",
    url: "/admin/weekly-schedule",
    icon: CalendarDays,
  },
  {
    title: "Báo cáo",
    url: "/admin/reports",
    icon: ClipboardList,
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center space-x-3 ">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={logo} // hoặc URL ảnh online
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Nhi Đồng 2</h1>
            <p className="text-xs text-gray-500">Quản lý đặt khám</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Quản lý hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
