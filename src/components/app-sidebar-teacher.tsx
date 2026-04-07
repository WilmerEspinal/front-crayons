import * as React from "react";
import {
  History,
  ShieldCheck,
  LogOut,
  UserCheck,
  Calendar
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function AppSidebarTeacher({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const menuItems = [
    { id: 'registro', label: 'Registro Asistencia', icon: UserCheck, url: 'registrar-asistencia' },
    { id: 'historial', label: 'Historial General', icon: History, url: 'ver-asistencia' },
    { id: 'justificaciones', label: 'Justificaciones', icon: ShieldCheck, url: 'justificaciones' },
    { id: 'horario', label: 'Mi Horario', icon: Calendar, url: 'mi-horario' },
  ];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        queryClient.clear();
        navigate('/login');
      } else {
        localStorage.removeItem('token');
        queryClient.clear();
        navigate('/login');
      }
    } catch (error) {
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/login');
    }
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white" {...props}>
      <SidebarHeader className="h-14 flex items-center px-5 border-b border-slate-100">
        <div className="flex flex-col gap-0.5 leading-none">
          <img
            src="https://res.cloudinary.com/dszdc6rh8/image/upload/v1747351782/image_1_vhjpzr.png"
            alt="Logo Colegio Crayon's"
            className="h-14 w-auto drop-shadow"
            style={{ background: "transparent" }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.includes(item.url);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        <item.icon size={16} />
                        <span className="tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100">
        <Button
          onClick={handleLogout}
          className="w-full bg-slate-50 text-slate-500 px-3 py-2 rounded-md flex items-center gap-3 font-medium text-xs hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-none justify-start"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
