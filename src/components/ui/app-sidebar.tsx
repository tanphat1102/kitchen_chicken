import * as React from "react"
import { cn } from "@/lib/utils"
import { ChefHat, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface SidebarData {
  navMain: Array<{
    title: string
    url: string
    icon?: React.ComponentType<any>
    items?: Array<{
      title: string
      url: string
    }>
  }>
}

interface AppSidebarProps {
  data: SidebarData
  className?: string
}

const AppSidebar = React.forwardRef<HTMLDivElement, AppSidebarProps>(
  ({ data, className }, ref) => {
    const location = useLocation()

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-200">
          <ChefHat className="h-8 w-8 text-red-600" />
          <span className="text-xl font-bold text-gray-800">Chicken Kitchen</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {data.navMain.map((item) => {
              const Icon = item.icon || Home
              const isActive = location.pathname === item.url
              
              return (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-red-100 text-red-700 border-r-2 border-red-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                  
                  {/* Sub-items if exist */}
                  {item.items && item.items.length > 0 && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.items.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url
                        return (
                          <li key={subItem.url}>
                            <Link
                              to={subItem.url}
                              className={cn(
                                "block px-3 py-1 text-sm rounded transition-colors",
                                isSubActive
                                  ? "bg-red-50 text-red-600 font-medium"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    )
  }
)
AppSidebar.displayName = "AppSidebar"

export { AppSidebar }