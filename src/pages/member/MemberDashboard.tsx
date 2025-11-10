import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, ShoppingCart, Heart, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const MemberDashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false); // Prevent double toast in StrictMode

  // Show permission denied toast if redirected from unauthorized access
  useEffect(() => {
    if (location.state?.accessDenied && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error('Không có quyền truy cập', {
        description: 'Bạn không có quyền truy cập vào trang này',
        duration: 4000,
      });
      // Clear the state to prevent toast on refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍗 Member Dashboard</h1>
            <p className="text-gray-600">Chào mừng thành viên - Khám phá thực đơn và đặt món yêu thích</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin thành viên</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Tên hiển thị:</strong> {currentUser?.displayName || 'Chưa cập nhật'}</p>
                <p><strong>Role:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Member</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Đặt món</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Xem menu và đặt món yêu thích</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem Menu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Lịch sử đơn hàng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Xem lại các đơn hàng đã đặt</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem lịch sử
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Món yêu thích</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Danh sách các món ăn yêu thích</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem yêu thích
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Cập nhật thông tin cá nhân</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Chỉnh sửa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Giỏ hàng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Xem và quản lý giỏ hàng</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem giỏ hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;