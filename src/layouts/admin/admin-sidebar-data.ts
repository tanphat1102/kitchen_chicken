import { ROUTES } from "@/routes/route.constants";
import { Home } from "lucide-react";

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
    // TODO: Add more admin routes when implemented
    // {
    //   title: "Menu Management",
    //   url: "#",
    //   icon: ChefHat,
    // },
    // {
    //   title: "Orders",
    //   url: "#", 
    //   icon: ShoppingBag,
    // },
    // {
    //   title: "Users",
    //   url: "#",
    //   icon: Users,
    // },
  ],
};
