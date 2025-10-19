import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { sidebarData } from "./admin-sidebar-data";

type AdminLayoutProps = {
  children?: ReactNode;
};

// Helper function to generate breadcrumb based on current path
const getBreadcrumbFromPath = (pathname: string) => {
  // Check top-level items first
  const topLevelItem = sidebarData.navMain.find((item) => item.url === pathname);
  if (topLevelItem) {
    return { section: "Chicken Kitchen Admin", page: topLevelItem.title };
  }

  // Fallback for unknown paths
  return { section: "Chicken Kitchen Admin", page: "Dashboard" };
};

export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const location = useLocation();
  const breadcrumb = getBreadcrumbFromPath(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar data={sidebarData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-3 px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage className="text-sm text-gray-500">{breadcrumb.section}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium text-gray-900">{breadcrumb.page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
