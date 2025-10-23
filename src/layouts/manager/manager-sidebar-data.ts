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
    },
    {
      title: "Categories",
      url: "/manager/categories",
      icon: Tag,
    },
    {
      title: "Menu Items",
      url: "/manager/menu-items",
      icon: ChefHat,
    },
    {
      title: "Daily Menu",
      url: "/manager/daily-menu",
      icon: Calendar,
    },
    {
      title: "Orders",
      url: "/manager/orders",
      icon: ShoppingCart,
    },
    {
      title: "Ingredients",
      url: "/manager/ingredients",
      icon: Package,
    },
    {
      title: "Promotions",
      url: "/manager/promotions",
      icon: TrendingUp,
    },
    {
      title: "Reports",
      url: "/manager/reports",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/manager/settings",
      icon: Settings,
    },
  ],
};
