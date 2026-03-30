import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import React from "react";
import ChatBot from "@/components/ChatBot";

export default function Page() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="dashboard-bg">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                return (
                  <React.Fragment key={to}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>
                          {decodeURIComponent(value)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={to}>{decodeURIComponent(value)}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-4">
            <div id="header-right-slot" className="flex items-center gap-4">
              {/* Slot para búsqueda específica de cada página */}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-xs font-bold text-slate-600">AD</span>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <ChatBot />
      </SidebarInset>
    </SidebarProvider>
  );
}
