import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/authentication/Login";
import Register from "@/pages/authentication/Register";
import ForgotPassword from "@/pages/authentication/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import  HomePage from "@/pages/Homepage/HomePage";
import './App.css'

const MenuPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Our Menu</h1>
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
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/menu" element={<MenuPage />} />
        
        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
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
