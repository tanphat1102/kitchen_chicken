import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/services/authService';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath = "/" 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, treat as guest
  const userRole: UserRole = currentUser?.role || 'guest';

  // Check if user's role is allowed to access this route
  if (!allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'guest') {
      // Guest users should see login modal or be redirected to home
      return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
    } else if (userRole === 'member') {
      // Members should be redirected to member dashboard
      return <Navigate to="/member/dashboard" replace />;
    } else if (userRole === 'admin') {
      // Admins should be redirected to admin dashboard
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // Fallback redirect
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute;