// Public routes (no authentication required)
export const PUBLIC_ROUTES = [
  "/",
  "/story",
  "/deals",
  "/menu",
  "/restaurants",
  "/register",
  "/auth-test",
  "/auth-debug",
  "/cors-test",
  "/storage-test",
  "/payment/callback",
  "/vnpay-payment-result",
  "/momo-web-return-result",
] as const;

// Authentication routes
export const AUTH_ROUTES = {
  REGISTER: "/register",
  AUTH_TEST: "/auth-test",
  AUTH_DEBUG: "/auth-debug",
  CORS_TEST: "/cors-test",
  STORAGE_TEST: "/storage-test",
} as const;

// Main application routes
export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard", // Legacy route for role-based redirect
  STORY: "/story",
  DEALS: "/deals",
  MENU: "/menu",
  MENU_DETAIL: "/menu/:id",
  RESTAURANTS: "/restaurants",
  CUSTOM_ORDER: "/custom-order",
  CART: "/cart",
  PAYMENT_CALLBACK: "/payment/callback",
  VNPAY_RETURN: "/vnpay-payment-result", // VNPay return URL
  MOMO_RETURN: "/momo-web-return-result", // MoMo return URL
  ORDER_HISTORY: "/orders/history",
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_DASHBOARD_REALTIME: "/admin/dashboard-realtime",
  ADMIN_STORES: "/admin/stores",
  ADMIN_USERS: "/admin/users",
  ADMIN_TRANSACTIONS: "/admin/transactions",
  ADMIN_PAYMENT_METHODS: "/admin/payment-methods",
  ADMIN_PROFILE: "/admin/profile",
} as const;

// Manager routes
export const MANAGER_ROUTES = {
  MANAGER_DASHBOARD: "/manager/dashboard",
  MANAGER_MENU_ITEMS: "/manager/menu-items",
  MANAGER_CATEGORIES: "/manager/categories",
  MANAGER_INGREDIENTS: "/manager/ingredients",
  MANAGER_DISHES: "/manager/dishes",
  MANAGER_ORDERS: "/manager/orders",
  MANAGER_PROMOTIONS: "/manager/promotions",
  MANAGER_PROFILE: "/manager/profile",
  MANAGER_NUTRIENTS: "/manager/nutrients",
  MANAGER_STEPS: "/manager/steps",
} as const;

// API endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  MENU: {
    GET_ALL: "/api/menu",
    GET_BY_ID: "/api/menu/:id",
    CREATE: "/api/menu",
    UPDATE: "/api/menu/:id",
    DELETE: "/api/menu/:id",
    GET_CATEGORIES: "/api/menu/categories",
  },
  ORDERS: {
    GET_ALL: "/api/orders",
    GET_BY_ID: "/api/orders/:id",
    CREATE: "/api/orders",
    UPDATE: "/api/orders/:id",
    DELETE: "/api/orders/:id",
    GET_BY_USER: "/api/orders/user/:userId",
  },
  USERS: {
    GET_PROFILE: "/api/users/profile",
    UPDATE_PROFILE: "/api/users/profile",
    GET_ALL: "/api/users",
    GET_BY_ID: "/api/users/:id",
    UPDATE: "/api/users/:id",
    DELETE: "/api/users/:id",
  },
  CART: {
    GET: "/api/cart",
    ADD_ITEM: "/api/cart/items",
    UPDATE_ITEM: "/api/cart/items/:id",
    REMOVE_ITEM: "/api/cart/items/:id",
    CLEAR: "/api/cart/clear",
  },
} as const;

// Member routes
export const MEMBER_ROUTES = {
  MEMBER_DASHBOARD: "/member/dashboard",
  MEMBER_PROFILE: "/profile",
  MEMBER_PROFILE_DEBUG: "/profile-debug",
} as const;

// Route access levels
export const ROUTE_ACCESS = {
  PUBLIC: "public",
  AUTHENTICATED: "authenticated",
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

// Protected routes - require authentication
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  ADMIN_ROUTES.ADMIN_DASHBOARD,
  MEMBER_ROUTES.MEMBER_DASHBOARD,
] as const;

// Admin-only routes
export const ADMIN_ONLY_ROUTES = [ADMIN_ROUTES.ADMIN_DASHBOARD] as const;

// Member-only routes
export const MEMBER_ONLY_ROUTES = [MEMBER_ROUTES.MEMBER_DASHBOARD] as const;

// Route metadata
export const ROUTE_METADATA = {
  [AUTH_ROUTES.REGISTER]: {
    title: "Đăng ký",
    description: "Tạo tài khoản mới",
    access: ROUTE_ACCESS.GUEST,
  },
  [APP_ROUTES.HOME]: {
    title: "Trang chủ",
    description: "Trang chủ Chicken Kitchen",
    access: ROUTE_ACCESS.PUBLIC,
  },
  [APP_ROUTES.MENU]: {
    title: "Thực đơn",
    description: "Xem thực đơn của chúng tôi",
    access: ROUTE_ACCESS.PUBLIC,
  },
  [APP_ROUTES.DASHBOARD]: {
    title: "Trang chủ",
    description: "Trang chủ người dùng",
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [ADMIN_ROUTES.ADMIN_DASHBOARD]: {
    title: "Quản trị - Tổng quan",
    description: "Trang tổng quan quản trị",
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_DASHBOARD_REALTIME]: {
    title: "Quản trị - Tổng quan Real-time",
    description: "Trang tổng quan thời gian thực",
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_STORES]: {
    title: "Quản trị - Cửa hàng",
    description: "Quản lý cửa hàng",
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_USERS]: {
    title: "Quản trị - Người dùng",
    description: "Quản lý người dùng",
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_TRANSACTIONS]: {
    title: "Quản trị - Giao dịch",
    description: "Quản lý giao dịch tài chính",
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_PAYMENT_METHODS]: {
    title: "Quản trị - Phương thức thanh toán",
    description: "Quản lý phương thức thanh toán",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_DASHBOARD]: {
    title: "Quản lý - Tổng quan",
    description: "Trang tổng quan quản lý",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_MENU_ITEMS]: {
    title: "Quản lý - Món ăn",
    description: "Quản lý món ăn",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_CATEGORIES]: {
    title: "Quản lý - Danh mục",
    description: "Quản lý danh mục món ăn",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_INGREDIENTS]: {
    title: "Quản lý - Nguyên liệu",
    description: "Quản lý kho nguyên liệu",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_DISHES]: {
    title: "Quản lý - Món ăn mẫu",
    description: "Quản lý món ăn có sẵn",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_ORDERS]: {
    title: "Quản lý - Đơn hàng",
    description: "Quản lý đơn hàng",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_PROMOTIONS]: {
    title: "Quản lý - Khuyến mãi",
    description: "Quản lý chương trình khuyến mãi",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_NUTRIENTS]: {
    title: "Quản lý - Dinh dưỡng",
    description: "Quản lý thông tin dinh dưỡng",
    access: ROUTE_ACCESS.ADMIN,
  },
  [MANAGER_ROUTES.MANAGER_STEPS]: {
    title: "Quản lý - Công thức",
    description: "Quản lý các bước nấu ăn",
    access: ROUTE_ACCESS.ADMIN,
  },
} as const;

// Navigation items for public pages
export const NAVIGATION_ITEMS = [
  {
    path: APP_ROUTES.HOME,
    label: "Trang chủ",
    icon: "Home",
  },
  {
    path: APP_ROUTES.MENU,
    label: "Thực đơn",
    icon: "Menu",
  },
] as const;

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
  {
    path: ADMIN_ROUTES.ADMIN_DASHBOARD,
    label: "Tổng quan",
    icon: "BarChart3",
  },
  {
    path: ADMIN_ROUTES.ADMIN_USERS,
    label: "Người dùng",
    icon: "Users",
  },
  {
    path: ADMIN_ROUTES.ADMIN_STORES,
    label: "Cửa hàng",
    icon: "Store",
  },
  {
    path: ADMIN_ROUTES.ADMIN_PAYMENT_METHODS,
    label: "Thanh toán",
    icon: "CreditCard",
  },
  {
    path: ADMIN_ROUTES.ADMIN_TRANSACTIONS,
    label: "Giao dịch",
    icon: "Receipt",
  },
] as const;

// Manager navigation items
export const MANAGER_NAVIGATION_ITEMS = [
  {
    path: MANAGER_ROUTES.MANAGER_DASHBOARD,
    label: "Tổng quan",
    icon: "Home",
  },
  {
    path: MANAGER_ROUTES.MANAGER_MENU_ITEMS,
    label: "Món ăn",
    icon: "ChefHat",
  },
  {
    path: MANAGER_ROUTES.MANAGER_CATEGORIES,
    label: "Danh mục",
    icon: "Tag",
  },
  {
    path: MANAGER_ROUTES.MANAGER_INGREDIENTS,
    label: "Nguyên liệu",
    icon: "Package",
  },
  {
    path: MANAGER_ROUTES.MANAGER_DISHES,
    label: "Món ăn mẫu",
    icon: "Utensils",
  },
  {
    path: MANAGER_ROUTES.MANAGER_ORDERS,
    label: "Đơn hàng",
    icon: "ShoppingBag",
  },
  {
    path: MANAGER_ROUTES.MANAGER_PROMOTIONS,
    label: "Khuyến mãi",
    icon: "TrendingUp",
  },
  {
    path: MANAGER_ROUTES.MANAGER_NUTRIENTS,
    label: "Dinh dưỡng",
    icon: "Apple",
  },
  {
    path: MANAGER_ROUTES.MANAGER_STEPS,
    label: "Công thức",
    icon: "ListOrdered",
  },
] as const;

// Export all route constants
export const ROUTES = {
  ...AUTH_ROUTES,
  ...APP_ROUTES,
  ...ADMIN_ROUTES,
  ...MANAGER_ROUTES,
  ...MEMBER_ROUTES,
} as const;

// Helper function to check if route is protected
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.includes(path as any);
};

// Helper function to check if route is admin only
export const isAdminRoute = (path: string): boolean => {
  return ADMIN_ONLY_ROUTES.includes(path as any);
};

// Helper function to check if route is member only
export const isMemberRoute = (path: string): boolean => {
  return MEMBER_ONLY_ROUTES.includes(path as any);
};

// Helper function to get route metadata
export const getRouteMetadata = (path: string) => {
  return ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
};
