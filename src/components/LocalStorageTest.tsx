import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { useGoogleLogin, useLogout } from '@/hooks/useAuth';
import { Loader2, RefreshCw, LogOut, User, Clock, Key } from 'lucide-react';

const LocalStorageTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>({});
  const [storageData, setStorageData] = useState<any>({});
  
  const googleLogin = useGoogleLogin();
  const logout = useLogout();

  const refreshAuthStatus = () => {
    const status = authService.getAuthStatus();
    setAuthStatus(status);

    // Get all auth-related localStorage data
    const storage = {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      tokenExpiresAt: localStorage.getItem('tokenExpiresAt'),
      userInfo: localStorage.getItem('userInfo'),
      loginTimestamp: localStorage.getItem('loginTimestamp'),
    };
    setStorageData(storage);
  };

  const testTokenRefresh = async () => {
    try {
      await authService.refreshAuthToken();
      refreshAuthStatus();
    } catch (error: any) {
      console.error('Token refresh failed:', error);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    refreshAuthStatus();
  };

  useEffect(() => {
    refreshAuthStatus();
    
    // Refresh status every 5 seconds
    const interval = setInterval(refreshAuthStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              LocalStorage & Token Management Test
            </CardTitle>
            <CardDescription>
              Test authentication state persistence and token refresh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={() => googleLogin.mutate()}
                disabled={googleLogin.isPending || authStatus.isAuthenticated}
                variant="outline"
              >
                {googleLogin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Login with Google
              </Button>

              <Button 
                onClick={() => logout.mutate()}
                disabled={logout.isPending || !authStatus.isAuthenticated}
                variant="outline"
              >
                {logout.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>

              <Button 
                onClick={testTokenRefresh}
                disabled={!authStatus.hasRefreshToken}
                variant="secondary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Token Refresh
              </Button>

              <Button onClick={refreshAuthStatus} variant="secondary">
                🔄 Refresh Status
              </Button>

              <Button onClick={clearStorage} variant="destructive">
                🗑️ Clear Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auth Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={authStatus.isAuthenticated ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${authStatus.isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-semibold">
                  {authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={authStatus.hasAccessToken ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="font-semibold">Access Token</span>
              </div>
              <p className="text-sm text-gray-600">
                {authStatus.hasAccessToken ? '✅ Present' : '❌ Missing'}
              </p>
            </CardContent>
          </Card>

          <Card className={authStatus.hasRefreshToken ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="font-semibold">Refresh Token</span>
              </div>
              <p className="text-sm text-gray-600">
                {authStatus.hasRefreshToken ? '✅ Present' : '❌ Missing'}
              </p>
            </CardContent>
          </Card>

          <Card className={authStatus.isTokenExpired ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Token Status</span>
              </div>
              <p className="text-sm text-gray-600">
                {authStatus.isTokenExpired ? '⏰ Expired' : '✅ Valid'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        {authStatus.userInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {authStatus.userInfo.displayName}
                </div>
                <div>
                  <strong>Email:</strong> {authStatus.userInfo.email}
                </div>
                <div>
                  <strong>Provider:</strong> {authStatus.userInfo.provider}
                </div>
                <div>
                  <strong>Login Duration:</strong> {authStatus.loginDuration || 'Unknown'}
                </div>
                <div>
                  <strong>UID:</strong> {authStatus.userInfo.uid}
                </div>
                <div>
                  <strong>Login Time:</strong> {authStatus.userInfo.loginTime}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LocalStorage Data */}
        <Card>
          <CardHeader>
            <CardTitle>🗄️ LocalStorage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(storageData).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <strong className="text-sm">{key}:</strong>
                    <div className="max-w-md">
                      {value ? (
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {typeof value === 'string' && value.length > 100 
                            ? `${value.substring(0, 100)}...`
                            : String(value)
                          }
                        </pre>
                      ) : (
                        <span className="text-gray-400 text-sm">null</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1. Login Test:</strong> Click "Login with Google" và kiểm tra localStorage được lưu</p>
              <p><strong>2. Persistence Test:</strong> Refresh trang và xem thông tin có còn không</p>
              <p><strong>3. Token Refresh:</strong> Click "Test Token Refresh" để test refresh token</p>
              <p><strong>4. Logout Test:</strong> Click "Logout" và xem localStorage có bị clear không</p>
              <p><strong>5. Expiry Test:</strong> Đợi token expire (hoặc clear tokenExpiresAt) và xem auto refresh</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalStorageTest;