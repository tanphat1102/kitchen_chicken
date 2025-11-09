import { Routes, Route } from "react-router-dom";
import { 
  AUTH_ROUTES, 
  APP_ROUTES, 
  ADMIN_ROUTES,
  MANAGER_ROUTES, 
  MEMBER_ROUTES 
} from "@/routes/route.constants";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import LoginModal from "@/components/shared/LoginModal";
import Register from "@/pages/authentication/Register";
import Dashboard from "@/pages/Dashboard";
import HomePage from '@/pages/Homepage/HomePage';
import MenuPage from '@/pages/Menu/Menu';
import MenuDetailPage from '@/pages/Menu/MenuDetail';
import Restaurants from '@/pages/Restaurants/Restaurants';
import CustomOrder from '@/pages/Custom/CustomOrder';
import CartPage from '@/pages/Cart/Cart';
import PaymentCallbackPage from '@/pages/PaymentCallback/PaymentCallback';
import OrderHistoryPage from '@/pages/OrderHistory/OrderHistory';
import ServicesPage from '@/pages/Services/Services';

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDashboardRealtime from "@/pages/admin/AdminDashboard-realtime";
import Stores from "@/pages/admin/Stores";
import Users from "@/pages/admin/Users";
import Transactions from "@/pages/admin/Transactions";
import PaymentMethods from "@/pages/admin/PaymentMethods";
import AdminProfile from "@/pages/admin/AdminProfile";

// Admin layout
import AdminLayout from "@/layouts/admin/AdminLayout";

// Manager pages
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import MenuItems from "@/pages/manager/MenuItems";
import Categories from "@/pages/manager/Categories";
import Ingredients from "@/pages/manager/Ingredients";
import ManagerDishes from "@/pages/manager/ManagerDishes";
import Orders from "@/pages/manager/Orders";
import Promotions from "@/pages/manager/Promotions";
import Reports from "@/pages/manager/Reports";
import ManagerProfile from "@/pages/manager/ManagerProfile";
import Nutrients from "@/pages/manager/Nutrients";
import Steps from "@/pages/manager/Steps";

// Manager layout
import ManagerLayout from "@/layouts/manager/ManagerLayout";

// Member pages
import MemberDashboard from "@/pages/member/MemberDashboard";
import Profile from "@/pages/member/Profile";

import LocalStorageTest from "@/components/LocalStorageTest";
import { useState } from "react";

// Using dedicated page components from `src/pages/*`

// Main App Routes component
export function AppRoutes() {
  return (
    <Routes>
  {/* Public routes - use dedicated page components */}
  <Route path={APP_ROUTES.HOME} element={<HomePage />} />
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
        <Route 
          path={MANAGER_ROUTES.MANAGER_REPORTS} 
          element={<Reports />} 
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
  );
}