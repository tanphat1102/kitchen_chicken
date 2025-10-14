import { ROUTES } from "@/routes/route.constants";
import {
  Home,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  ChefHat,
  Package,
  User,
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
      title: "Menu Management",
      url: "#",
      icon: ChefHat,
      items: [
        {
          title: "All Items",
          url: ROUTES.ADMIN_MENU,
          icon: ChefHat,
        },
        {
          title: "Categories",
          url: "/admin/menu/categories",
        },
        {
          title: "Add New Item",
          url: "/admin/menu/add",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "All Orders",
          url: ROUTES.ADMIN_ORDERS,
          icon: ShoppingBag,
        },
        {
          title: "Pending Orders",
          url: "/admin/orders/pending",
        },
        {
          title: "Completed Orders",
          url: "/admin/orders/completed",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: ROUTES.ADMIN_USERS,
          icon: Users,
        },
        {
          title: "Customers",
          url: "/admin/users/customers",
        },
        {
          title: "Staff",
          url: "/admin/users/staff",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Sales Report",
          url: ROUTES.ADMIN_ANALYTICS,
          icon: BarChart3,
        },
        {
          title: "Popular Items",
          url: "/admin/analytics/popular",
        },
        {
          title: "Customer Insights",
          url: "/admin/analytics/customers",
        },
      ],
    },
    {
      title: "Settings",
      url: ROUTES.ADMIN_ANALYTICS,
      icon: Settings,
    },
  ],
};
