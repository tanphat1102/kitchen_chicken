import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/authentication/Login";
import Register from "@/pages/authentication/Register";
import ForgotPassword from "@/pages/authentication/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import  HomePage from "@/pages/Homepage/HomePage";
import  MenuPage from "@/pages/Menu/Menu";
import MenuDetailPage from "@/pages/Menu/MenuDetail";
import RestaurantsPage from "@/pages/Restaurants/Restaurants";
import CustomOrder from "@/pages/Custom/CustomOrder";
import './App.css'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:id" element={<MenuDetailPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/custom" element={<CustomOrder />} />
        
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
