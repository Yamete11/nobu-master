import type { ReactNode } from "react";

import { ManagerSidebar } from "@/components/dashboard/manager-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div>
            <p className="text-sm text-muted-foreground">Workforce Management</p>
            <h1 className="text-base font-semibold">Nobu Dashboard</h1>
          </div>
        </header>
        <section className="flex-1 p-4 md:p-6">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
