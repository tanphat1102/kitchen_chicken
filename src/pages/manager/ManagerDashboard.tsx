import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Home className="h-8 w-8 text-purple-600" />
            <span>Manager Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Restaurant operations overview
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/manager/reports')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatVND(stats.todayRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {stats.todayOrders} orders today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/manager/orders')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.todayOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to view all orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/manager/menu-items')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeMenuItems}</div>
                <p className="text-xs text-muted-foreground mt-1">Available today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/manager/ingredients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{stats.lowStockAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">Items need restocking</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders by Hour Chart */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Orders by Hour</CardTitle>
            <p className="text-sm text-muted-foreground">Today's order distribution</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderChartData}>
                <XAxis 
                  dataKey="hour" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.hour}</p>
                          <p className="text-lg font-bold text-blue-600">{payload[0].value} orders</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Revenue Chart */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Weekly Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Last 7 days performance</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <XAxis 
                  dataKey="day" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.day}</p>
                          <p className="text-lg font-bold text-green-600">{formatVND(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common management tasks</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              onClick={() => navigate('/manager/daily-menu')}
              className="justify-start h-auto py-4 flex-col items-start gap-2"
              variant="outline"
            >
              <Calendar className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold">Daily Menu</div>
                <div className="text-xs text-muted-foreground">Set today's menu</div>
              </div>
            </Button>

            <Button 
              onClick={() => navigate('/manager/orders')}
              className="justify-start h-auto py-4 flex-col items-start gap-2"
              variant="outline"
            >
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">Orders</div>
                <div className="text-xs text-muted-foreground">View pending orders</div>
              </div>
            </Button>

            <Button 
              onClick={() => navigate('/manager/menu-items')}
              className="justify-start h-auto py-4 flex-col items-start gap-2"
              variant="outline"
            >
              <ChefHat className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-semibold">Menu Items</div>
                <div className="text-xs text-muted-foreground">Manage dishes</div>
              </div>
            </Button>

            <Button 
              onClick={() => navigate('/manager/ingredients')}
              className="justify-start h-auto py-4 flex-col items-start gap-2"
              variant="outline"
            >
              <Package className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <div className="font-semibold">Inventory</div>
                <div className="text-xs text-muted-foreground">Check stock</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
