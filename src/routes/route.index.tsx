import { Routes, Route } from "react-router-dom";
import { 
  AUTH_ROUTES, 
  APP_ROUTES, 
  ADMIN_ROUTES, 
  MEMBER_ROUTES 
} from "@/routes/route.constants";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import LoginModal from "@/components/shared/LoginModal";
import Register from "@/pages/authentication/Register";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MemberDashboard from "@/pages/member/MemberDashboard";
import LocalStorageTest from "@/components/LocalStorageTest";
import { useState } from "react";

// Simple components for public pages
const HomePage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">🍗 Chicken Kitchen</h1>
        <p className="text-lg text-gray-600">Welcome to our delicious chicken restaurant!</p>
        <div className="mt-8 space-x-4">
          <a href="/menu" className="rounded bg-red-600 px-6 py-3 text-white hover:bg-red-700">
            View Menu
          </a>
          <button 
            onClick={() => setLoginModalOpen(true)}
            className="rounded border border-red-600 px-6 py-3 text-red-600 hover:bg-red-50"
          >
            Login
          </button>
        </div>
      </div>
      
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
      />
    </div>
  );
};

const MenuPage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
          <button 
            onClick={() => setLoginModalOpen(true)}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Login to Order
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-xl font-semibold">Fried Chicken</h3>
            <p className="text-gray-600">Crispy and delicious fried chicken</p>
            <p className="mt-2 text-lg font-bold text-red-600">$12.99</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-xl font-semibold">Grilled Chicken</h3>
            <p className="text-gray-600">Healthy grilled chicken breast</p>
            <p className="mt-2 text-lg font-bold text-red-600">$14.99</p>
          </div>
        </div>
      </div>
      
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
      />
    </div>
  );
};

// Main App Routes component
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={APP_ROUTES.HOME} element={<HomePage />} />
      <Route path={APP_ROUTES.MENU} element={<MenuPage />} />
      
      {/* Auth routes - accessible to guests only */}
      <Route 
        path={AUTH_ROUTES.REGISTER} 
        element={
          <RoleBasedRoute allowedRoles={['guest']}>
            <Register />
          </RoleBasedRoute>
        } 
      />
      
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