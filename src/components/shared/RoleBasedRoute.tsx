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

  // 🔓 DEV MODE: Check for ?dev=1 or ?bypass=1 to skip authentication
  const searchParams = new URLSearchParams(location.search);
  const devMode = searchParams.get('dev') === '1' || searchParams.get('bypass') === '1';
  
  if (devMode) {
    console.log('🔓 DEV MODE ACTIVE: Bypassing auth check for', location.pathname);
    return <>{children}</>;
  }

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

  // 🚧 TEMPORARY: Authentication check disabled for UI development
  // TODO: Re-enable this after UI development is complete
   
  // Check if user's role is allowed to access this route
  // if (!allowedRoles.includes(userRole)) {
  //   console.warn('🚫 Access denied to', location.pathname, '- User role:', userRole, '- Required:', allowedRoles);
    
  //   // Redirect based on user role
  //   if (userRole === 'guest') {
  //     // Guest users should see login modal or be redirected to home
  //     return <Navigate to="/" state={{ from: location, showLogin: true }} replace />;
  //   } else if (userRole === 'member') {
  //     // Members should be redirected to member dashboard
  //     return <Navigate to="/member/dashboard" replace />;
  //   } else if (userRole === 'admin') {
  //     // Admins should be redirected to admin dashboard
  //     return <Navigate to="/admin/dashboard" replace />;
  //   } else {
  //     // Fallback redirect
  //     return <Navigate to={fallbackPath} replace />;
  //   }
  // }
  

  console.log('✅ Access granted to', location.pathname, '- User role:', userRole);
  return <>{children}</>;
};

export default RoleBasedRoute;