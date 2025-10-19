// Authentication routes
export const AUTH_ROUTES = {
  REGISTER: '/register',
  AUTH_TEST: '/auth-test',
  AUTH_DEBUG: '/auth-debug',
  CORS_TEST: '/cors-test',
  STORAGE_TEST: '/storage-test',
} as const;

// Main application routes  
export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard', // Legacy route for role-based redirect
  MENU: '/menu',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;

// Member routes
export const MEMBER_ROUTES = {
  MEMBER_DASHBOARD: '/member/dashboard',
} as const;

// Route access levels
export const ROUTE_ACCESS = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated', 
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

// Protected routes - require authentication
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  ADMIN_ROUTES.ADMIN_DASHBOARD,
  MEMBER_ROUTES.MEMBER_DASHBOARD,
] as const;

// Admin-only routes
export const ADMIN_ONLY_ROUTES = [
  ADMIN_ROUTES.ADMIN_DASHBOARD,
] as const;

// Member-only routes  
export const MEMBER_ONLY_ROUTES = [
  MEMBER_ROUTES.MEMBER_DASHBOARD,
] as const;

// Route metadata
export const ROUTE_METADATA = {
  [AUTH_ROUTES.REGISTER]: {
    title: 'Đăng ký',
    description: 'Tạo tài khoản mới',
    access: ROUTE_ACCESS.GUEST,
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
    title: 'Trang chủ',
    description: 'Trang chủ người dùng',
    access: ROUTE_ACCESS.AUTHENTICATED,
  },
  [ADMIN_ROUTES.ADMIN_DASHBOARD]: {
    title: 'Quản trị - Tổng quan',
    description: 'Trang tổng quan quản trị',
    access: ROUTE_ACCESS.ADMIN,
  },
  [MEMBER_ROUTES.MEMBER_DASHBOARD]: {
    title: 'Thành viên - Trang chủ',
    description: 'Trang chủ thành viên',
    access: ROUTE_ACCESS.MEMBER,
  },
} as const;

// Navigation items for public pages
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
] as const;

// Admin navigation items
export const ADMIN_NAVIGATION_ITEMS = [
  {
    path: ADMIN_ROUTES.ADMIN_DASHBOARD,
    label: 'Tổng quan',
    icon: 'BarChart3',
  },
] as const;

// Member navigation items
export const MEMBER_NAVIGATION_ITEMS = [
  {
    path: MEMBER_ROUTES.MEMBER_DASHBOARD,
    label: 'Trang chủ',
    icon: 'Home',
  },
] as const;

// Export all route constants
export const ROUTES = {
  ...AUTH_ROUTES,
  ...APP_ROUTES,
  ...ADMIN_ROUTES,
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