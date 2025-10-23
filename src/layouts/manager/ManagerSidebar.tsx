import * as React from "react";
import { cn } from "@/lib/utils";
import { Home, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/img/Logo.png";
import { managerSidebarData } from "./manager-sidebar-data";

export function ManagerSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        "flex items-center gap-3 p-6 border-b border-gray-200 relative",
        isCollapsed && "justify-center p-4"
      )}>
        <img 
          src={Logo} 
          alt="Chicken Kitchen" 
          className={cn(
            "object-contain transition-all duration-300",
            isCollapsed ? "h-8 w-8" : "h-10 w-10"
          )} 
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800">Chicken Kitchen</span>
            <span className="text-xs text-gray-500">Manager Portal</span>
          </div>
        )}
        
        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="h-3 w-3 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {managerSidebarData.navMain.map((item) => {
            const Icon = item.icon || Home;
            const isActive = location.pathname === item.url;
            
            return (
              <li key={item.url}>
                <div className="relative group">
                  <Link
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}
                    
                    <Icon className={cn(
                      "shrink-0 transition-all",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="flex-1">{item.title}</span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.title}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with user info */}
      <div className={cn(
        "p-4 border-t border-gray-200",
        isCollapsed && "p-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
            MG
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {managerSidebarData.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {managerSidebarData.user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

