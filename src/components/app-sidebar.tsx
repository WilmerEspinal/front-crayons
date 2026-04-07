import * as React from "react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (title: string) => {
    setExpandedGroup(prev => prev === title ? null : title);
  };

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
        queryClient.clear(); // Limpiar la caché de React Query por seguridad
        navigate('/login');
      } else {
      }
    } catch (error) {
    }
  };

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        items: [
          {
            title: "Resumen General",
            url: "/dashboard",
          },
        ],
      },
      {
        title: "Gestión de Alumnos",
        url: "#",
        icon: Users,
        items: [
          {
            title: "Registro de Alumno",
            url: "/dashboard/register-student",
          },
          {
            title: "Lista de Alumnos",
            url: "/dashboard/list-student",
          },
          {
            title: "Gestión de Grados",
            url: "/dashboard/promocion-alumnos",
          },
          {
            title: "Reporte de Asistencia",
            url: "/dashboard/reporte-asistencia",
          },
        ],
      },
      {
        title: "Gestión de Docentes",
        url: "#",
        icon: UserCog,
        items: [
          {
            title: "Registro de Docente",
            url: "/dashboard/register-teacher",
          },
          {
            title: "Lista de Docentes",
            url: "/dashboard/list-teacher",
          },
          {
            title: "Asignar Horarios",
            url: "/dashboard/asignar-horarios",
          },
          {
            title: "Ver Horarios",
            url: "/dashboard/ver-horarios",
          },
        ],
      },
      {
        title: "Gestión de Cuotas",
        url: "#",
        icon: CreditCard,
        items: [
          {
            title: "Programar periodo",
            url: "/dashboard/programar-cuotas",
          },
          {
            title: "Cuotas",
            url: "/dashboard/cuotas-detalle",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center justify-center w-full">
          <img
            src="https://res.cloudinary.com/dszdc6rh8/image/upload/v1747351782/image_1_vhjpzr.png"
            alt="Colegio Crayon's"
            className="h-10 w-auto object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <div className="space-y-1">
          {data.navMain.map((item) => (
            <SidebarGroup key={item.title} className="p-0">
              <div
                onClick={() => toggleGroup(item.title)}
                className={`flex items-center justify-between w-full px-3 py-2.5 cursor-pointer select-none group rounded-md transition-all ${expandedGroup === item.title ? 'bg-slate-50' : 'hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={`${expandedGroup === item.title ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`} />
                  <span className={`text-sm tracking-tight ${expandedGroup === item.title ? 'text-slate-900 font-semibold' : 'text-slate-600 font-medium'
                    }`}>
                    {item.title}
                  </span>
                </div>
                {expandedGroup === item.title ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                )}
              </div>

              {expandedGroup === item.title && (
                <div className="mt-1 ml-4 space-y-1 border-l border-slate-100">
                  <SidebarMenu className="px-2">
                    {item.items.map((subItem) => {
                      const isActive = location.pathname === subItem.url;
                      return (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <Link
                              to={subItem.url}
                              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-all ${isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              )}
            </SidebarGroup>
          ))}
        </div>
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
