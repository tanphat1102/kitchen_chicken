import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  Shield,
  Users,
  Store,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { storeService } from '@/services/storeService';
import { paymentMethodService } from '@/services/paymentMethodService';
import { transactionService } from '@/services/transactionService';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    activePaymentMethods: 0,
    totalTransactions: 0,
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [users, stores, paymentMethods, transactions] = await Promise.all([
        userService.getAll().catch(() => []),
        storeService.getAll().catch(() => []),
        paymentMethodService.getAll().catch(() => []),
        transactionService.getAll().catch(() => []),
      ]);

      setStats({
        totalUsers: users.length,
        totalStores: stores.length,
        activePaymentMethods: paymentMethods.filter((pm: { isActive: boolean }) => pm.isActive).length,
        totalTransactions: transactions.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);



  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Shield className="h-8 w-8 text-black" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            System administration & configuration
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-black hover:shadow-lg transition-all cursor-pointer bg-white border-gray-200" onClick={() => navigate('/admin/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">System users</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-black hover:shadow-lg transition-all cursor-pointer bg-white border-gray-200" onClick={() => navigate('/admin/stores')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Stores</CardTitle>
            <Store className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStores}</div>
                <p className="text-xs text-gray-500 mt-1">Active locations</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-black hover:shadow-lg transition-all cursor-pointer bg-white border-gray-200" onClick={() => navigate('/admin/payment-methods')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.activePaymentMethods}</div>
                <p className="text-xs text-gray-500 mt-1">Active methods</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-black hover:shadow-lg transition-all cursor-pointer bg-white border-gray-200" onClick={() => navigate('/admin/transactions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
                <p className="text-xs text-gray-500 mt-1">Total transactions</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-black" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Manage system users, roles, permissions, and access control
            </p>
            <Button 
              onClick={() => navigate('/admin/users')}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Store className="h-5 w-5 text-black" />
              Store Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Configure store locations, operating hours, and settings
            </p>
            <Button 
              onClick={() => navigate('/admin/stores')}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Manage Stores
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <CreditCard className="h-5 w-5 text-black" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Configure payment options and processing methods
            </p>
            <Button 
              onClick={() => navigate('/admin/payment-methods')}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Manage Payments
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Receipt className="h-5 w-5 text-black" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              View and manage all financial transactions
            </p>
            <Button 
              onClick={() => navigate('/admin/transactions')}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              View Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;