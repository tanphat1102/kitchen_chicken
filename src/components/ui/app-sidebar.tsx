import * as React from "react"
import { cn } from "@/lib/utils"
import { Home, ChevronLeft, ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import Logo from "@/assets/img/Logo.png"

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
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [expandedItems, setExpandedItems] = React.useState<string[]>([])

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed)
      if (!isCollapsed) {
        setExpandedItems([]) // Collapse all sub-items when sidebar collapses
      }
    }

    const toggleExpanded = (url: string) => {
      if (expandedItems.includes(url)) {
        setExpandedItems(expandedItems.filter(item => item !== url))
      } else {
        setExpandedItems([...expandedItems, url])
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          className
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
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap overflow-hidden">
              Chicken Kitchen
            </span>
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
            {data.navMain.map((item) => {
              const Icon = item.icon || Home
              const isActive = location.pathname === item.url
              const hasSubItems = item.items && item.items.length > 0
              const isExpanded = expandedItems.includes(item.url)
              
              return (
                <li key={item.url}>
                  <div className="relative group">
                    <Link
                      to={item.url}
                      onClick={(e) => {
                        if (hasSubItems && !isCollapsed) {
                          e.preventDefault()
                          toggleExpanded(item.url)
                        }
                      }}
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
                        <>
                          <span className="flex-1">{item.title}</span>
                          {hasSubItems && (
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )} />
                          )}
                        </>
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
                  
                  {/* Sub-items */}
                  {hasSubItems && !isCollapsed && isExpanded && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.items!.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url
                        return (
                          <li key={subItem.url}>
                            <Link
                              to={subItem.url}
                              className={cn(
                                "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                isSubActive
                                  ? "bg-gray-900 text-white font-medium shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

        {/* Footer - User info or additional actions */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@chickenkitchen.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
AppSidebar.displayName = "AppSidebar"

export { AppSidebar }