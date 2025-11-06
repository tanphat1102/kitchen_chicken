import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, type UserRole } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { AuthErrorHandler } from "@/utils/authErrorHandler";
import Logo from "@/assets/img/Logo.png";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, refreshUser } = useAuth();

  // Get the current page path to redirect back after login
  const currentPath = location.pathname + location.search;

  // Helper function to get role from JWT token
  const getRoleFromToken = (): UserRole => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return 'guest';

      // Decode JWT token to get role
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const roleFromToken = payload.role;
      
      // Map backend role to frontend role
      if (roleFromToken === 'ADMIN') return 'admin';
      if (roleFromToken === 'MANAGER') return 'manager';
      if (roleFromToken === 'USER') return 'member';
      return 'guest';
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return 'guest';
    }
  };

  // Helper function to redirect after login based on user role
  const redirectAfterLogin = (role: string) => {
    if (role === 'admin') {
      // Admin always goes to admin dashboard
      navigate("/admin/dashboard");
    } else if (role === 'manager') {
      // Manager goes to manager dashboard
      navigate("/manager/dashboard");
    } else {
      // Guest stays on current page or goes to home
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/manager') || currentPath.startsWith('/member')) {
        navigate("/");
      }
      // Otherwise stay on current page (public pages)
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const loadingToast = AuthErrorHandler.showLoadingToast("Đang đăng nhập với Google...");

    try {
      await authService.loginWithGoogle();
      
      AuthErrorHandler.dismissToast(loadingToast);
      AuthErrorHandler.showSuccessToast("Đăng nhập thành công!");
      
      // Refresh user data in AuthContext to trigger immediate UI update
      await refreshUser();
      
      // Close modal first
      onOpenChange(false);
      
      // Get role directly from JWT token and redirect
      setTimeout(() => {
        const role = getRoleFromToken();
        redirectAfterLogin(role);
      }, 200);
    } catch (err: any) {
      // Dismiss loading toast immediately
      AuthErrorHandler.dismissToast(loadingToast);
      
      // Check if user cancelled the popup (closed the window)
      const errorCode = err?.code || err?.message || '';
      const isCancelled = 
        errorCode.includes('popup-closed-by-user') || 
        errorCode.includes('cancelled-popup-request') ||
        errorCode.includes('popup_closed_by_user') ||
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request';
      
      // Only show error if user didn't cancel
      if (!isCancelled) {
        AuthErrorHandler.showErrorToast(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    const loadingToast = AuthErrorHandler.showLoadingToast("Đang đăng nhập với GitHub...");

    try {
      await authService.loginWithGithub();
      
      AuthErrorHandler.dismissToast(loadingToast);
      AuthErrorHandler.showSuccessToast("Đăng nhập thành công!");
      
      // Refresh user data in AuthContext to trigger immediate UI update
      await refreshUser();
      
      // Close modal first
      onOpenChange(false);
      
      // Get role directly from JWT token and redirect
      setTimeout(() => {
        const role = getRoleFromToken();
        redirectAfterLogin(role);
      }, 200);
    } catch (err: any) {
      // Dismiss loading toast immediately
      AuthErrorHandler.dismissToast(loadingToast);
      
      // Check if user cancelled the popup (closed the window)
      const errorCode = err?.code || err?.message || '';
      const isCancelled = 
        errorCode.includes('popup-closed-by-user') || 
        errorCode.includes('cancelled-popup-request') ||
        errorCode.includes('popup_closed_by_user') ||
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request';
      
      // Only show error if user didn't cancel
      if (!isCancelled) {
        AuthErrorHandler.showErrorToast(err);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleTwitterLogin = async () => {
    setLoading(true);
    const loadingToast = AuthErrorHandler.showLoadingToast("Đang đăng nhập với X...");

    try {
      await authService.loginWithTwitter();
      
      AuthErrorHandler.dismissToast(loadingToast);
      AuthErrorHandler.showSuccessToast("Đăng nhập thành công!");
      
      // Refresh user data in AuthContext to trigger immediate UI update
      await refreshUser();
      
      // Close modal first
      onOpenChange(false);
      
      // Get role directly from JWT token and redirect
      setTimeout(() => {
        const role = getRoleFromToken();
        redirectAfterLogin(role);
      }, 200);
    } catch (err: any) {
      // Dismiss loading toast immediately
      AuthErrorHandler.dismissToast(loadingToast);
      
      // Check if user cancelled the popup (closed the window)
      const errorCode = err?.code || err?.message || '';
      const isCancelled = 
        errorCode.includes('popup-closed-by-user') || 
        errorCode.includes('cancelled-popup-request') ||
        errorCode.includes('popup_closed_by_user') ||
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request';
      
      // Only show error if user didn't cancel
      if (!isCancelled) {
        AuthErrorHandler.showErrorToast(err);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center p-2">
            <img 
              src={Logo} 
              alt="Chicken Kitchen Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <DialogTitle className="text-2xl">Đăng Nhập</DialogTitle>
          <DialogDescription>
            Chọn một phương thức đăng nhập để tiếp tục
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Đăng nhập với Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleTwitterLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23 3.01c-.8.36-1.66.6-2.56.71.92-.55 1.62-1.43 1.95-2.47-.86.51-1.81.88-2.82 1.08C18.76 1.6 17.32 1 15.78 1c-2.62 0-4.74 2.12-4.74 4.74 0 .37.04.73.12 1.08C6.88 6.6 3.64 4.77 1.64 1.96c-.41.7-.64 1.51-.64 2.37 0 1.63.83 3.07 2.09 3.91-.77-.03-1.5-.24-2.14-.59v.06c0 2.28 1.62 4.18 3.77 4.62-.39.11-.8.17-1.22.17-.3 0-.6-.03-.89-.08.6 1.87 2.36 3.23 4.44 3.27-1.63 1.28-3.69 2.04-5.93 2.04-.38 0-.75-.02-1.12-.06 2.11 1.35 4.62 2.14 7.32 2.14 8.78 0 13.58-7.27 13.58-13.57 0-.21 0-.42-.01-.63.93-.67 1.73-1.51 2.36-2.47z" />
              </svg>
            )}
            Đăng nhập với X
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            )}
            Đăng nhập với GitHub
          </Button>


          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button 
              type="button"
              onClick={() => {
                onOpenChange(false);
                navigate("/register");
              }}
              className="text-red-600 hover:underline"
              disabled={loading}
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;