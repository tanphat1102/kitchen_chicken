import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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

  // Check sub-items
  for (const section of sidebarData.navMain) {
    const subItem = section.items?.find((item) => item.url === pathname);
    if (subItem) {
      return { section: section.title, page: subItem.title };
    }
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>{breadcrumb.section}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumb.page}</BreadcrumbPage>
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
