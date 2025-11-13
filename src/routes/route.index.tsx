import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { 
  AUTH_ROUTES, 
  APP_ROUTES, 
  ADMIN_ROUTES,
  MANAGER_ROUTES, 
  MEMBER_ROUTES 
} from "@/routes/route.constants";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";

// Eagerly load critical components (above the fold)
import HomePage from '@/pages/Homepage/HomePage';

// Lazy load non-critical pages
const LoginModal = lazy(() => import("@/components/shared/LoginModal"));
const Register = lazy(() => import("@/pages/authentication/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StoryPage = lazy(() => import('@/pages/Story/Story'));
const CurrentDealsPage = lazy(() => import('@/pages/Deals/CurrentDeals'));
const MenuPage = lazy(() => import('@/pages/Menu/Menu'));
const MenuDetailPage = lazy(() => import('@/pages/Menu/MenuDetail'));
const Restaurants = lazy(() => import('@/pages/Restaurants/Restaurants'));
const CustomOrder = lazy(() => import('@/pages/Custom/CustomOrder'));
const CartPage = lazy(() => import('@/pages/Cart/Cart'));
const PaymentCallbackPage = lazy(() => import('@/pages/PaymentCallback/PaymentCallback'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistory/OrderHistory'));
const ServicesPage = lazy(() => import('@/pages/Services/Services'));
const ChatHistoryPage = lazy(() => import('@/pages/ChatHistory/ChatHistory'));

// Admin pages - lazy load entire admin bundle
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminDashboardRealtime = lazy(() => import("@/pages/admin/AdminDashboard-realtime"));
const Stores = lazy(() => import("@/pages/admin/Stores"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Transactions = lazy(() => import("@/pages/admin/Transactions"));
const PaymentMethods = lazy(() => import("@/pages/admin/PaymentMethods"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const AdminLayout = lazy(() => import("@/layouts/admin/AdminLayout"));

// Manager pages - lazy load
const ManagerDashboard = lazy(() => import("@/pages/manager/ManagerDashboard"));
const MenuItems = lazy(() => import("@/pages/manager/MenuItems"));
const Categories = lazy(() => import("@/pages/manager/Categories"));
const Ingredients = lazy(() => import("@/pages/manager/Ingredients"));
const ManagerDishes = lazy(() => import("@/pages/manager/ManagerDishes"));
const Orders = lazy(() => import("@/pages/manager/Orders"));
const Promotions = lazy(() => import("@/pages/manager/Promotions"));
const ManagerProfile = lazy(() => import("@/pages/manager/ManagerProfile"));
const Nutrients = lazy(() => import("@/pages/manager/Nutrients"));
const Steps = lazy(() => import("@/pages/manager/Steps"));
const ManagerLayout = lazy(() => import("@/layouts/manager/ManagerLayout"));

// Member pages - lazy load
const MemberDashboard = lazy(() => import("@/pages/member/MemberDashboard"));
const Profile = lazy(() => import("@/pages/member/Profile"));

const LocalStorageTest = lazy(() => import("@/components/LocalStorageTest"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Main App Routes component
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
  {/* Public routes - use dedicated page components */}
  <Route path={APP_ROUTES.HOME} element={<HomePage />} />
  <Route path="/story" element={<StoryPage />} />
  <Route path="/deals" element={<CurrentDealsPage />} />
  <Route path={APP_ROUTES.MENU} element={<MenuPage />} />
  {/* Menu detail */}
  <Route path={APP_ROUTES.MENU_DETAIL} element={<MenuDetailPage />} />
  {/* Restaurants / store locator */}
  <Route path={APP_ROUTES.RESTAURANTS} element={<Restaurants />} />
  {/* Custom order builder */}
  <Route path={APP_ROUTES.CUSTOM_ORDER} element={<CustomOrder />} />
  {/* Cart */}
  <Route path={APP_ROUTES.CART} element={<CartPage />} />
  {/* Payment Callback */}
  <Route path={APP_ROUTES.PAYMENT_CALLBACK} element={<PaymentCallbackPage />} />
  {/* VNPay Return URL - same component as payment callback */}
  <Route path={APP_ROUTES.VNPAY_RETURN} element={<PaymentCallbackPage />} />
  {/* MoMo Return URL */}
  <Route path={APP_ROUTES.MOMO_RETURN} element={<PaymentCallbackPage />} />
  {/* Order History */}
  <Route path={APP_ROUTES.ORDER_HISTORY} element={<OrderHistoryPage />} />
  {/* Services */}
  <Route path="/services" element={<ServicesPage />} />
  {/* Chat History */}
  <Route path="/chat-history" element={<ChatHistoryPage />} />
      
      {/* Auth routes - accessible to guests only */}
      <Route 
        path={AUTH_ROUTES.REGISTER} 
        element={
          <RoleBasedRoute allowedRoles={['guest']}>
            <Register />
          </RoleBasedRoute>
        } 
      />
      {/* Login handled via modal (LoginModal) - no separate /login page */}

      {/* LocalStorage test route - test token persistence */}
      <Route path={AUTH_ROUTES.STORAGE_TEST} element={<LocalStorageTest />} />

      {/* Admin routes - wrapped in AdminLayout */}
      <Route 
        path="/admin" 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleBasedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="dashboard-realtime" element={<AdminDashboardRealtime />} />
        <Route path="stores" element={<Stores />} />
        <Route path="users" element={<Users />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="payment-methods" element={<PaymentMethods />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Manager routes with layout */}
      <Route 
        path="/manager" 
        element={
          <RoleBasedRoute allowedRoles={['admin', 'manager']}>
            <ManagerLayout />
          </RoleBasedRoute>
        }
      >
        <Route 
          path={MANAGER_ROUTES.MANAGER_DASHBOARD} 
          element={<ManagerDashboard />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_MENU_ITEMS} 
          element={<MenuItems />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_CATEGORIES} 
          element={<Categories />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_INGREDIENTS} 
          element={<Ingredients />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_DISHES} 
          element={<ManagerDishes />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_ORDERS} 
          element={<Orders />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_PROMOTIONS} 
          element={<Promotions />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_NUTRIENTS} 
          element={<Nutrients />} 
        />
        <Route 
          path={MANAGER_ROUTES.MANAGER_STEPS} 
          element={<Steps />} 
        />
        <Route path="profile" element={<ManagerProfile />} />
      </Route>

      {/* Member routes */}
      <Route 
        path={MEMBER_ROUTES.MEMBER_DASHBOARD} 
        element={
          <RoleBasedRoute allowedRoles={['member']}>
            <MemberDashboard />
          </RoleBasedRoute>
        } 
      />

      {/* Profile route - accessible by member and guest only */}
      <Route 
        path={MEMBER_ROUTES.MEMBER_PROFILE} 
        element={
          <RoleBasedRoute allowedRoles={['guest', 'member']}>
            <Profile />
          </RoleBasedRoute>
        } 
      />

      {/* Legacy dashboard route - redirect based on role */}
      <Route 
        path={APP_ROUTES.DASHBOARD} 
        element={
          <RoleBasedRoute allowedRoles={['member', 'admin']}>
            <Dashboard />
          </RoleBasedRoute>
        } 
      />
    </Routes>
    </Suspense>
  );
}