import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "@/pages/authentication/Register";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import LoginModal from "@/components/shared/LoginModal";
import { useState } from "react";
import './App.css'
import { Toaster } from 'react-hot-toast';

// Admin pages
import AdminLayout from "@/layouts/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Stores from "@/pages/admin/Stores";
import Users from "@/pages/admin/Users";
import PaymentMethods from "@/pages/admin/PaymentMethods";
import Transactions from "@/pages/admin/Transactions";

// Manager pages
import ManagerLayout from "@/layouts/manager/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import Categories from "@/pages/manager/Categories";
import MenuItems from "@/pages/manager/MenuItems";
import DailyMenu from "@/pages/manager/DailyMenu";
import Orders from "@/pages/manager/Orders";
import Ingredients from "@/pages/manager/Ingredients";
import Promotions from "@/pages/manager/Promotions";
import Reports from "@/pages/manager/Reports";

// Simple components
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

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        
        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } 
        />

        
        {/* Protected routes - require authentication */}
        {/* COMMENTED FOR DEVELOPMENT - UNCOMMENT IN PRODUCTION */}
        {/* <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        /> */}

        {/* Temporary unprotected route for development */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin routes - UNPROTECTED FOR DEVELOPMENT */}
        {/* REMEMBER TO ENABLE ProtectedRoute IN PRODUCTION! */}
        {/* <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAuth={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        > */}
        
        {/* Admin routes - System Administration (4 pages) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="stores" element={<Stores />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        {/* Manager routes - Restaurant Operations (9 pages) */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="daily-menu" element={<DailyMenu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="ingredients" element={<Ingredients />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
