import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "@/pages/authentication/Register";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import LoginModal from "@/components/shared/LoginModal";
import { useState } from "react";
import './App.css'

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
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
