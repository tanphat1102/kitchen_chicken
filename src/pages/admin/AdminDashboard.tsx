import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Shield,
  Users,
  Store,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Database,
  Server,
  Calendar,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { storeService } from '@/services/storeService';
import { paymentMethodService } from '@/services/paymentMethodService';
import { transactionService } from '@/services/transactionService';
import { dashboardService } from '@/services/dashboardService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    activePaymentMethods: 0,
    totalTransactions: 0,
  });

  // Chart data state
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [storePerformance, setStorePerformance] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [users, stores, paymentMethods, transactions] = await Promise.all([
        userService.getAll().catch(() => []),
        storeService.getAll().catch(() => []),
        paymentMethodService.getAll().catch(() => []),
        transactionService.getAll().catch(() => []),
      ]);

      setStats({
        totalUsers: users.length,
        totalStores: stores.length,
        activePaymentMethods: paymentMethods.filter((pm: any) => pm.isActive).length,
        totalTransactions: transactions.length,
      });

      // Fetch chart data
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const [revenueTrendData, storePerformanceData, userGrowthData] = await Promise.all([
        dashboardService.getRevenueTrend(days),
        dashboardService.getStorePerformance(),
        dashboardService.getUserGrowth(),
      ]);

      setRevenueTrend(revenueTrendData);
      setStorePerformance(storePerformanceData);
      setUserGrowth(userGrowthData);

      // Get recent transactions
      const sortedTransactions = transactions
        .sort((a: any, b: any) => new Date(b.createAt || b.date).getTime() - new Date(a.createAt || a.date).getTime())
        .slice(0, 5);
      setRecentTransactions(sortedTransactions);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Calculate total revenue from trend data
  const totalRevenue = revenueTrend.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailyRevenue = revenueTrend.length > 0 ? totalRevenue / revenueTrend.length : 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Shield className="h-8 w-8 text-gray-900" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System administration & analytics overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <Button
              size="sm"
              variant={dateRange === '7d' ? 'default' : 'ghost'}
              onClick={() => setDateRange('7d')}
              className={dateRange === '7d' ? 'bg-gray-900 hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              7 Days
            </Button>
            <Button
              size="sm"
              variant={dateRange === '30d' ? 'default' : 'ghost'}
              onClick={() => setDateRange('30d')}
              className={dateRange === '30d' ? 'bg-gray-900 hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              30 Days
            </Button>
            <Button
              size="sm"
              variant={dateRange === '90d' ? 'default' : 'ghost'}
              onClick={() => setDateRange('90d')}
              className={dateRange === '90d' ? 'bg-gray-900 hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              90 Days
            </Button>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/admin/users')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  System users
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/admin/stores')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stores</CardTitle>
            <Store className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStores}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Active locations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/admin/payment-methods')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.activePaymentMethods}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Active methods
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white"
          onClick={() => navigate('/admin/transactions')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  All time
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-900" />
                <span>Revenue Trend</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Last {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₫{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₫{Math.floor(avgDailyRevenue).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1f2937" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1f2937" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₫${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`₫${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#1f2937" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* Store Performance Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-gray-900" />
                <span>Store Performance</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/stores')}
                className="text-gray-600 hover:text-gray-900"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={storePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₫${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="storeName" 
                    width={120}
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`₫${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#1f2937"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Growth & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-900" />
                <span>User Growth</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Last 6 months
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalUsers" 
                    stroke="#1f2937" 
                    strokeWidth={2}
                    dot={{ fill: '#1f2937', r: 4 }}
                    name="Total Users"
                    animationDuration={800}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#6b7280', r: 4 }}
                    name="New Users"
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gray-900" />
                <span>Recent Activity</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/transactions')}
                className="text-gray-600 hover:text-gray-900"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div 
                    key={transaction.id || index} 
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                        transaction.transactionType === 'CREDIT' 
                          ? 'bg-gray-100 border border-gray-300' 
                          : 'bg-gray-900 border border-gray-900'
                      }`}>
                        <Receipt className={`h-4 w-4 ${
                          transaction.transactionType === 'CREDIT' 
                            ? 'text-gray-900' 
                            : 'text-white'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Transaction #{transaction.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.createAt 
                            ? formatDistanceToNow(new Date(transaction.createAt), { addSuffix: true }) 
                            : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      transaction.transactionType === 'CREDIT' 
                        ? 'text-gray-900' 
                        : 'text-gray-600'
                    }`}>
                      {transaction.transactionType === 'CREDIT' ? '+' : '-'}₫{(transaction.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent transactions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Server className="h-5 w-5 text-gray-900" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50/50 transition-all">
              <div className="h-10 w-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs border-0">
                    Healthy
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50/50 transition-all">
              <div className="h-10 w-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <Server className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Server</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs border-0">
                    Online
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50/50 transition-all">
              <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Performance</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs border-0">
                    Optimal
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;