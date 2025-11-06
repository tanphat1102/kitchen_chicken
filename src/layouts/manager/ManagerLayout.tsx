import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { managerSidebarData } from "./manager-sidebar-data";
import { Bell, Search, LogOut, ChevronDown, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

type ManagerLayoutProps = {
  children?: ReactNode;
};

// Helper function to generate breadcrumb based on current path
const getBreadcrumbFromPath = (pathname: string) => {
  // Check top-level items first
  const topLevelItem = managerSidebarData.navMain.find((item) => item.url === pathname);
  if (topLevelItem) {
    return { section: "Manager Panel", page: topLevelItem.title };
  }

  // Check sub-items (if any exist in the future)
  for (const section of managerSidebarData.navMain) {
    if ('items' in section && Array.isArray(section.items)) {
      const subItem = section.items.find((item: any) => item.url === pathname);
      if (subItem) {
        return { section: section.title, page: subItem.title };
      }
    }
  }

  // Fallback for unknown paths
  return { section: "Manager Panel", page: "Dashboard" };
};

export default function ManagerLayout({ children }: Readonly<ManagerLayoutProps>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const breadcrumb = getBreadcrumbFromPath(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/'); // Redirect to home page
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleGoHome = () => {
    // Force full page reload to exit ManagerLayout completely
    window.location.href = window.location.origin + '/';
  };

  return (
    <SidebarProvider>
      <AppSidebar data={managerSidebarData} panelType="manager" />
      <SidebarInset>
        {/* Enhanced Header - Light Theme */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-sm">
          <div className="flex flex-1 items-center justify-between gap-2 px-4">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbPage className="text-sm text-gray-500">
                      {breadcrumb.section}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-gray-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-semibold text-gray-900">
                      {breadcrumb.page}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-black hover:bg-gray-100">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-black hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-black text-white hover:bg-black"
                    >
                      2
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200">
                  <DropdownMenuLabel className="text-gray-900">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-gray-100">
                      <p className="text-sm font-medium text-gray-900">New order received</p>
                      <p className="text-xs text-gray-600">Order #12345 from table 5</p>
                      <span className="text-xs text-gray-500">5 minutes ago</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-gray-100">
                      <p className="text-sm font-medium text-gray-900">Low inventory alert</p>
                      <p className="text-xs text-gray-600">Chicken breast running low</p>
                      <span className="text-xs text-gray-500">30 minutes ago</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem className="justify-center text-sm text-black focus:bg-gray-100">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6 bg-gray-300" />

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 text-gray-700 hover:text-black hover:bg-gray-100">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-300">
                      <AvatarImage src={currentUser?.photoURL || managerSidebarData.user.avatar} alt={currentUser?.displayName || managerSidebarData.user.name} />
                      <AvatarFallback className="bg-black text-white font-semibold">
                        {(currentUser?.displayName || managerSidebarData.user.name).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-gray-900">{currentUser?.displayName || managerSidebarData.user.name}</span>
                      <span className="text-xs text-gray-600">{currentUser?.email || managerSidebarData.user.email}</span>
                    </div>
                    <ChevronDown className="hidden md:block h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                  <DropdownMenuLabel className="text-gray-900">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onSelect={handleGoHome} className="focus:bg-gray-100 cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    HomePage
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onSelect={handleLogout} className="text-black focus:bg-gray-100 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content - Light Theme */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6 bg-gray-50">
          <Outlet />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
