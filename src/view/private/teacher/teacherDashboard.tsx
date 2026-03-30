import { AppSidebarTeacher } from "@/components/app-sidebar-teacher";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AiAssistant } from "@/components/AiAssistant";

export default function TeacherDashboard() {
  return (
    <SidebarProvider>
      <AppSidebarTeacher />
      <SidebarInset className="bg-slate-50 overflow-x-hidden">
        <main className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </main>
      </SidebarInset>
      <AiAssistant />
    </SidebarProvider>
  );
}
