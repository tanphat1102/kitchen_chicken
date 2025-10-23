import { ROUTES } from "@/routes/route.constants";
import {
  Home,
  Users,
  Store,
  CreditCard,
  Receipt,
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
      title: "Users",
      url: ROUTES.ADMIN_USERS,
      icon: Users,
    },
    {
      title: "Stores",
      url: ROUTES.ADMIN_STORES,
      icon: Store,
    },
    {
      title: "Payment Methods",
      url: "/admin/payment-methods",
      icon: CreditCard,
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: Receipt,
    },
  ],
};
