import {
  Home,
  ChefHat,
  ShoppingCart,
  Package,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
} from "lucide-react";

export const managerSidebarData = {
  user: {
    name: "Manager User",
    email: "manager@chickenkitchen.com",
    avatar: "/src/assets/img/Logo.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: Home,
      description: "Overview & analytics",
      badge: undefined,
    },
    {
      title: "Categories",
      url: "/manager/categories",
      icon: Tag,
      description: "Menu categories",
      badge: undefined,
    },
    {
      title: "Menu Items",
      url: "/manager/menu-items",
      icon: ChefHat,
      description: "Manage dishes",
      badge: undefined,
    },
    {
      title: "Daily Menu",
      url: "/manager/daily-menu",
      icon: Calendar,
      description: "Daily offerings",
      badge: undefined,
    },
    {
      title: "Orders",
      url: "/manager/orders",
      icon: ShoppingCart,
      description: "Order management",
      badge: "New",
    },
    {
      title: "Ingredients",
      url: "/manager/ingredients",
      icon: Package,
      description: "Inventory",
      badge: undefined,
    },
    {
      title: "Promotions",
      url: "/manager/promotions",
      icon: TrendingUp,
      description: "Special offers",
      badge: undefined,
    },
    {
      title: "Reports",
      url: "/manager/reports",
      icon: BarChart3,
      description: "Analytics & stats",
      badge: undefined,
    },
    {
      title: "Settings",
      url: "/manager/settings",
      icon: Settings,
      description: "Configuration",
      badge: undefined,
    },
  ],
};
