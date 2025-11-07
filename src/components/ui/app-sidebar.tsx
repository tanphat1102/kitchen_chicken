import * as React from "react"
import { cn } from "@/lib/utils"
import { Home, ChevronLeft } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import Logo from "@/assets/img/Logo.png"

interface SidebarData {
  navMain: Array<{
    title: string
    url: string
    icon?: React.ComponentType<any>
    description?: string
    badge?: string
    items?: Array<{
      title: string
      url: string
    }>
  }>
}

interface AppSidebarProps {
  data: SidebarData
  className?: string
  panelType?: "admin" | "manager"
}

const AppSidebar = React.forwardRef<HTMLDivElement, AppSidebarProps>(
  ({ data, className, panelType = "admin" }, ref) => {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [expandedItems, setExpandedItems] = React.useState<string[]>([])

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed)
      if (!isCollapsed) {
        setExpandedItems([])
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
          "flex h-screen flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out sticky top-0",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
        style={{ zIndex: 40 }}
      >
        {/* Collapse Toggle Button - Positioned at top level */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "absolute -right-3 h-6 w-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-black transition-all shadow-lg",
            isCollapsed && "rotate-180"
          )}
          style={{ 
            top: '32px', // Align with header center
            zIndex: 99999,
            position: 'absolute'
          }}
        >
          <ChevronLeft className="h-3 w-3 text-gray-700" />
        </button>

        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center gap-3 p-6 border-b border-gray-200 bg-gray-50",
          isCollapsed && "justify-center p-4"
        )}>
          <div className="relative">
            <img 
              src={Logo} 
              alt="Chicken Kitchen" 
              className={cn(
                "object-contain transition-all duration-300",
                isCollapsed ? "h-8 w-8" : "h-10 w-10"
              )} 
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Chicken Kitchen
              </span>
              <span className="text-[10px] font-medium text-gray-600 tracking-wider uppercase">
                {panelType === "manager" ? "Manager Panel" : "Admin Panel"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
          )}
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
                          ? "bg-black text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100 hover:text-black",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className={cn(
                        "shrink-0 transition-all relative z-10",
                        isCollapsed ? "h-5 w-5" : "h-4 w-4"
                      )} />
                      
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 flex flex-col gap-0.5 relative z-10">
                            <span className="leading-none">{item.title}</span>
                            {item.description && !isActive && (
                              <span className="text-[10px] text-gray-500 leading-none">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="bg-black text-white text-[10px] px-1.5 py-0 h-4"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-[10px] text-gray-600 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
                      </div>
                    )}
                  </div>
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