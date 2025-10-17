import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();

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
            <h1 className="text-3xl font-bold text-gray-900">🍗 Chicken Kitchen Dashboard</h1>
            <p className="text-gray-600">Chào mừng bạn đến với hệ thống quản lý</p>
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
                <span>Thông tin tài khoản</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Tên hiển thị:</strong> {currentUser?.displayName || 'Chưa cập nhật'}</p>
                <p><strong>Trạng thái email:</strong> {currentUser?.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Quản lý các món ăn trong menu</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem Menu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Xem và quản lý đơn hàng</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem Đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;