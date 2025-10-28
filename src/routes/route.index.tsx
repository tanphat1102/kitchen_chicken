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

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDashboardRealtime from "@/pages/admin/AdminDashboard-realtime";
import Stores from "@/pages/admin/Stores";
import Users from "@/pages/admin/Users";
import Transactions from "@/pages/admin/Transactions";
import PaymentMethods from "@/pages/admin/PaymentMethods";

// Manager pages
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import MenuItems from "@/pages/manager/MenuItems";
import Categories from "@/pages/manager/Categories";
import Ingredients from "@/pages/manager/Ingredients";
import DailyMenu from "@/pages/manager/DailyMenu";
import Orders from "@/pages/manager/Orders";
import Promotions from "@/pages/manager/Promotions";
import Reports from "@/pages/manager/Reports";

// Member pages
import MemberDashboard from "@/pages/member/MemberDashboard";

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
  <Route path="/menu/:id" element={<MenuDetailPage />} />
  {/* Restaurants / store locator */}
  <Route path="/restaurants" element={<Restaurants />} />
  {/* Custom order builder */}
  <Route path="/custom-order" element={<CustomOrder />} />
      
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

      {/* Admin routes */}
      <Route 
        path={ADMIN_ROUTES.ADMIN_DASHBOARD} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={ADMIN_ROUTES.ADMIN_DASHBOARD_REALTIME} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboardRealtime />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={ADMIN_ROUTES.ADMIN_STORES} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Stores />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={ADMIN_ROUTES.ADMIN_USERS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Users />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={ADMIN_ROUTES.ADMIN_TRANSACTIONS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Transactions />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={ADMIN_ROUTES.ADMIN_PAYMENT_METHODS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <PaymentMethods />
          </RoleBasedRoute>
        } 
      />

      {/* Manager routes */}
      <Route 
        path={MANAGER_ROUTES.MANAGER_DASHBOARD} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <ManagerDashboard />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_MENU_ITEMS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <MenuItems />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_CATEGORIES} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Categories />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_INGREDIENTS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Ingredients />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_DAILY_MENU} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <DailyMenu />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_ORDERS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Orders />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_PROMOTIONS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Promotions />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path={MANAGER_ROUTES.MANAGER_REPORTS} 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Reports />
          </RoleBasedRoute>
        } 
      />

      {/* Member routes */}
      <Route 
        path={MEMBER_ROUTES.MEMBER_DASHBOARD} 
        element={
          <RoleBasedRoute allowedRoles={['member']}>
            <MemberDashboard />
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