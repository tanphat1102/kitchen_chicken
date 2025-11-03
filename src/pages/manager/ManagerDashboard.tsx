import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  ChefHat,
  ShoppingCart,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid } from "recharts";
import { api } from '@/services/api';
import { menuItemService } from '@/services/menuItemService';
import { ingredientService } from '@/services/ingredientService';
import toast from 'react-hot-toast';
import { startOfDay, endOfDay } from 'date-fns';

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    activeMenuItems: 0,
    lowStockAlerts: 0,
  });

  // Mock data for charts (will be replaced with real data when backend provides hourly/daily stats)
  const orderChartData = [
    { hour: "7AM", orders: 5 },
    { hour: "8AM", orders: 12 },
    { hour: "9AM", orders: 18 },
    { hour: "10AM", orders: 15 },
    { hour: "11AM", orders: 28 },
    { hour: "12PM", orders: 42 },
    { hour: "1PM", orders: 38 },
    { hour: "2PM", orders: 25 },
    { hour: "3PM", orders: 15 },
    { hour: "4PM", orders: 18 },
    { hour: "5PM", orders: 32 },
    { hour: "6PM", orders: 28 }
  ];

  const revenueChartData = [
    { day: "Mon", revenue: 8500000 },
    { day: "Tue", revenue: 9200000 },
    { day: "Wed", revenue: 11000000 },
    { day: "Thu", revenue: 10500000 },
    { day: "Fri", revenue: 13000000 },
    { day: "Sat", revenue: 15500000 },
    { day: "Sun", revenue: 14000000 }
  ];

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ordersResponse, menuItems, ingredients] = await Promise.all([
        api.get<ApiResponse<Order[]>>('/orders/current').catch(() => ({ data: { data: [] } })),
        menuItemService.getAll().catch(() => []),
        ingredientService.getAll().catch(() => []),
      ]);

      const orders = ordersResponse.data.data || [];
      
      // Filter orders for today
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startOfToday && orderDate <= endOfToday;
      });

      // Calculate today's revenue
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Count active menu items
      const activeMenuItems = menuItems.filter(item => item.isActive).length;

      // Count low stock items (items below minimum stock level)
      const lowStockItems = ingredients.filter(ing => 
        ing.minimumStock && ing.quantity < ing.minimumStock
      ).length;

      setStats({
        todayRevenue,
        todayOrders: todayOrders.length,
        activeMenuItems,
        lowStockAlerts: lowStockItems,
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

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 animate-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <Home className="h-8 w-8 text-gray-900" />
            <span>Manager Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Restaurant operations & analytics overview
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 card-grid">
        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/orders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Orders today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/reports')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{formatVND(stats.todayRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  From today's orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/menu-items')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.activeMenuItems}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  Active items
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/ingredients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.lowStockAlerts}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Need attention
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section - Match Admin Style */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Hour Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-gray-900" />
                <span>Orders by Hour</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Today
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={orderChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(31, 41, 55, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-white p-3 shadow-lg">
                            <p className="text-sm font-medium text-gray-900">{payload[0].payload.hour}</p>
                            <p className="text-lg font-bold text-gray-900">{payload[0].value} orders</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#1f2937" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly Revenue Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-900" />
                <span>Weekly Revenue</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Last 7 days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₫${(value/1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-white p-3 shadow-lg">
                            <p className="text-sm font-medium text-gray-900">{payload[0].payload.day}</p>
                            <p className="text-lg font-bold text-gray-900">{formatVND(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1f2937" 
                    strokeWidth={2}
                    dot={{ fill: '#1f2937', r: 4 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
