import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Settings, Users, BarChart3, Package } from 'lucide-react';

const AdminDashboard: React.FC = () => {
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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🍗 Admin Dashboard</h1>
            <p className="text-gray-600">Bảng điều khiển quản trị viên - Quản lý toàn bộ hệ thống</p>
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
                <span>Thông tin Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Tên hiển thị:</strong> {currentUser?.displayName || 'Chưa cập nhật'}</p>
                <p><strong>Role:</strong> <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">Admin</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Quản lý người dùng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Quản lý tài khoản và phân quyền</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem danh sách người dùng
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Quản lý Menu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Thêm, sửa, xóa các món ăn</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Quản lý Menu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Báo cáo & Thống kê</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Xem báo cáo doanh thu và thống kê</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem báo cáo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Cài đặt hệ thống</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Cấu hình và cài đặt ứng dụng</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Cài đặt
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Đơn hàng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Quản lý tất cả đơn hàng</p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Xem đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;