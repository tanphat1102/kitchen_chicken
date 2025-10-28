import { ROUTES } from "@/routes/route.constants";
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  Receipt,
  BarChart3,
  Shield,
  Database,
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
      icon: LayoutDashboard,
      description: "Overview & analytics",
      badge: undefined,
    },
    {
      title: "Users",
      url: ROUTES.ADMIN_USERS,
      icon: Users,
      description: "Manage user accounts",
      badge: undefined,
    },
    {
      title: "Stores",
      url: ROUTES.ADMIN_STORES,
      icon: Store,
      description: "Store locations",
      badge: undefined,
    },
    {
      title: "Payment Methods",
      url: "/admin/payment-methods",
      icon: CreditCard,
      description: "Payment options",
      badge: undefined,
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: Receipt,
      description: "Transaction history",
      badge: "New",
    },
  ],
};
