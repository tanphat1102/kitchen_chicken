// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
} as const;

// Main application routes
export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MENU: '/menu',
  ORDERS: '/orders',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MENU: '/admin/menu',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;

// API endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  MENU: {
    GET_ALL: '/api/menu',
    GET_BY_ID: '/api/menu/:id',
    CREATE: '/api/menu',
    UPDATE: '/api/menu/:id',
    DELETE: '/api/menu/:id',
    GET_CATEGORIES: '/api/menu/categories',
  },
  ORDERS: {
    GET_ALL: '/api/orders',
    GET_BY_ID: '/api/orders/:id',
    CREATE: '/api/orders',
    UPDATE: '/api/orders/:id',
    DELETE: '/api/orders/:id',
    GET_BY_USER: '/api/orders/user/:userId',
  },
  USERS: {
    GET_PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    GET_ALL: '/api/users',
    GET_BY_ID: '/api/users/:id',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
  },
  CART: {
    GET: '/api/cart',
    ADD_ITEM: '/api/cart/items',
    UPDATE_ITEM: '/api/cart/items/:id',
    REMOVE_ITEM: '/api/cart/items/:id',
    CLEAR: '/api/cart/clear',
  },
} as const;

// Route parameters
export const ROUTE_PARAMS = {
  ID: 'id',
  USER_ID: 'userId',
  ORDER_ID: 'orderId',
  MENU_ID: 'menuId',
} as const;

// Route access types
export const ROUTE_ACCESS = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  ADMIN: 'admin',
} as const;

// Protected routes configuration
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  APP_ROUTES.PROFILE,
  APP_ROUTES.CART,
  APP_ROUTES.CHECKOUT,
  APP_ROUTES.ORDERS,
  ...Object.values(ADMIN_ROUTES),
] as const;

// Public routes configuration
export const PUBLIC_ROUTES = [
  APP_ROUTES.HOME,
  APP_ROUTES.MENU,
  ...Object.values(AUTH_ROUTES),
] as const;

// Admin only routes
export const ADMIN_ONLY_ROUTES = [
  ...Object.values(ADMIN_ROUTES),
] as const;

// Route metadata
export const ROUTE_METADATA = {
  [AUTH_ROUTES.LOGIN]: {
    title: 'Đăng nhập',
    description: 'Đăng nhập vào tài khoản của bạn',
    access: ROUTE_ACCESS.PUBLIC,
  },
  [AUTH_ROUTES.REGISTER]: {
    title: 'Đăng ký',
    description: 'Tạo tài khoản mới',
    access: ROUTE_ACCESS.PUBLIC,
  },
  [AUTH_ROUTES.FORGOT_PASSWORD]: {
    title: 'Quên mật khẩu',
    description: 'Khôi phục mật khẩu của bạn',
    access: ROUTE_ACCESS.PUBLIC,
  },
  [APP_ROUTES.HOME]: {
    title: 'Trang chủ',
    description: 'Trang chủ Chicken Kitchen',
    access: ROUTE_ACCESS.PUBLIC,
  },
  [APP_ROUTES.MENU]: {
    title: 'Thực đơn',
    description: 'Xem thực đơn của chúng tôi',
    access: ROUTE_ACCESS.PUBLIC,
  },
  [APP_ROUTES.DASHBOARD]: {
    title: 'Trang tổng quan',
    description: 'Trang tổng quan cá nhân',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [APP_ROUTES.ORDERS]: {
    title: 'Đơn hàng',
    description: 'Quản lý đơn hàng của bạn',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [APP_ROUTES.PROFILE]: {
    title: 'Hồ sơ',
    description: 'Quản lý thông tin cá nhân',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [APP_ROUTES.CART]: {
    title: 'Giỏ hàng',
    description: 'Giỏ hàng của bạn',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [APP_ROUTES.CHECKOUT]: {
    title: 'Thanh toán',
    description: 'Thanh toán đơn hàng',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [ADMIN_ROUTES.ADMIN_DASHBOARD]: {
    title: 'Quản trị - Tổng quan',
    description: 'Trang tổng quan quản trị',
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_MENU]: {
    title: 'Quản trị - Thực đơn',
    description: 'Quản lý thực đơn',
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_ORDERS]: {
    title: 'Quản trị - Đơn hàng',
    description: 'Quản lý đơn hàng',
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_USERS]: {
    title: 'Quản trị - Người dùng',
    description: 'Quản lý người dùng',
    access: ROUTE_ACCESS.ADMIN,
  },
  [ADMIN_ROUTES.ADMIN_ANALYTICS]: {
    title: 'Quản trị - Thống kê',
    description: 'Xem thống kê và báo cáo',
    access: ROUTE_ACCESS.ADMIN,
  },
} as const;

// Navigation items
export const NAVIGATION_ITEMS = [
  {
    path: APP_ROUTES.HOME,
    label: 'Trang chủ',
    icon: 'Home',
  },
  {
    path: APP_ROUTES.MENU,
    label: 'Thực đơn',
    icon: 'Menu',
  },
  {
    path: APP_ROUTES.ORDERS,
    label: 'Đơn hàng',
    icon: 'ShoppingBag',
    requireAuth: true,
  },
  {
    path: APP_ROUTES.CART,
    label: 'Giỏ hàng',
    icon: 'ShoppingCart',
    requireAuth: true,
  },
] as const;

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
  {
    path: ADMIN_ROUTES.ADMIN_DASHBOARD,
    label: 'Tổng quan',
    icon: 'BarChart3',
  },
  {
    path: ADMIN_ROUTES.ADMIN_MENU,
    label: 'Thực đơn',
    icon: 'Menu',
  },
  {
    path: ADMIN_ROUTES.ADMIN_ORDERS,
    label: 'Đơn hàng',
    icon: 'ShoppingBag',
  },
  {
    path: ADMIN_ROUTES.ADMIN_USERS,
    label: 'Người dùng',
    icon: 'Users',
  },
  {
    path: ADMIN_ROUTES.ADMIN_ANALYTICS,
    label: 'Thống kê',
    icon: 'TrendingUp',
  },
] as const;

// Export all route constants
export const ROUTES = {
  ...AUTH_ROUTES,
  ...APP_ROUTES,
  ...ADMIN_ROUTES,
} as const;

// Helper function to check if route is protected
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.includes(path as any);
};

// Helper function to check if route is admin only
export const isAdminRoute = (path: string): boolean => {
  return ADMIN_ONLY_ROUTES.includes(path as any);
};

// Helper function to get route metadata
export const getRouteMetadata = (path: string) => {
  return ROUTE_METADATA[path as keyof typeof ROUTE_METADATA];
};
