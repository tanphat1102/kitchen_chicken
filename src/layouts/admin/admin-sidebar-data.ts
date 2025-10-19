import { ROUTES } from "@/routes/route.constants";
import {
  Home,
  Users,
  ShoppingBag,
  Settings,
  ChefHat,
  Package,
  FileText,
  Store,
} from "lucide-react";

export const sidebarData = {
  user: {
    name: "Admin User",
    email: "admin@chickenkitchen.com",
    avatar: "/src/assets/img/Logo.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: ROUTES.ADMIN_DASHBOARD,
      icon: Home,
    },
    {
      title: "Stores",
      url: ROUTES.ADMIN_STORES,
      icon: Store,
    },
    {
      title: "Orders",
      url: ROUTES.ADMIN_ORDERS,
      icon: ShoppingBag,
    },
    {
      title: "Menu",
      url: ROUTES.ADMIN_MENU,
      icon: ChefHat,
    },
    {
      title: "Ingredients",
      url: ROUTES.ADMIN_INGREDIENTS,
      icon: Package,
    },
    {
      title: "Customers",
      url: ROUTES.ADMIN_USERS,
      icon: Users,
    },
    {
      title: "Reports",
      url: ROUTES.ADMIN_ANALYTICS,
      icon: FileText,
    },
    {
      title: "Settings",
      url: ROUTES.ADMIN_SETTINGS,
      icon: Settings,
    },
  ],
};
