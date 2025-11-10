import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  ChefHat,
  ShoppingCart,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Award,
  Download,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid } from "recharts";
import { api } from '@/services/api';
import { menuItemService } from '@/services/menuItemService';
import { ingredientService } from '@/services/ingredientService';
import { dashboardService } from '@/services/dashboardService';
import { toast } from 'sonner';
import { startOfDay, endOfDay, format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasShownToast = useRef(false); // Prevent double toast in StrictMode
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Stats states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topItem: 'N/A',
    activeMenuItems: 0,
    lowStockAlerts: 0,
  });

  // Chart data states
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);

  // Fetch dashboard stats based on date range
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get date ranges based on selection
      const today = new Date();
      let startDate: string, endDate: string;
      let days = 7;

      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Please select both start and end dates');
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      } else if (dateRange === 'week') {
        startDate = format(startOfWeek(today), 'yyyy-MM-dd');
        endDate = format(endOfWeek(today), 'yyyy-MM-dd');
        days = 7;
      } else { // month
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        days = 30;
      }

      // Fetch all data in parallel
      const [summary, menuItems, ingredients, topItems, trendData] = await Promise.all([
        dashboardService.getManagerSummary(startDate, endDate).catch(() => ({
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        })),
        menuItemService.getAll().catch(() => []),
        ingredientService.getAll().catch(() => []),
        dashboardService.getManagerPopularItems(startDate, endDate, 10).catch(() => []),
        // ⚠️ NOTE: Using admin revenue-trend API (returns ALL stores until backend adds storeId filter)
        // TODO: Backend should create /manager/revenue-trend with storeId filter
        dashboardService.getRevenueTrend(days).catch(() => []),
      ]);

      // Get top item name from popular items
      const topItemName = topItems.length > 0 
        ? (topItems[0].menuItemName || topItems[0].dishName || 'N/A')
        : 'N/A';

      // Set stats from summary
      setStats({
        totalRevenue: summary.totalRevenue || 0,
        totalOrders: summary.totalOrders || 0,
        averageOrderValue: summary.averageOrderValue || 0,
        topItem: topItemName,
        activeMenuItems: menuItems.filter(item => item.isActive).length,
        lowStockAlerts: ingredients.filter(ing => 
          ing.minimumStock && ing.quantity < ing.minimumStock
        ).length,
      });

      // Set popular items for chart
      setPopularItems(topItems.map((item: any) => ({
        name: item.menuItemName || item.dishName || 'Unknown',
        count: item.orderCount || item.count || 0,
      })));

      // Set revenue trend from admin API
      // Transform data to match our format
      setRevenueTrend(trendData.map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        revenue: item.revenue || 0,
        orders: item.transactions || 0,
      })));

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Show permission denied toast if redirected from unauthorized access
  useEffect(() => {
    if (location.state?.accessDenied && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error('Không có quyền truy cập', {
        description: 'Bạn không có quyền truy cập vào trang quản trị viên',
        duration: 4000,
      });
      // Clear the state to prevent toast on refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    fetchStats();
  }, [dateRange]); // Refetch when date range changes

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const dateRangeText = dateRange === 'week' ? 'This Week' : 'This Month';
      let csv = `Manager Dashboard Report - ${dateRangeText}\n\n`;
      csv += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
      
      csv += 'Summary\n';
      csv += `Total Revenue,${stats.totalRevenue}\n`;
      csv += `Total Orders,${stats.totalOrders}\n`;
      csv += `Average Order Value,${stats.averageOrderValue}\n`;
      csv += `Top Item,${stats.topItem}\n`;
      csv += `Active Menu Items,${stats.activeMenuItems}\n`;
      csv += `Low Stock Alerts,${stats.lowStockAlerts}\n\n`;
      
      csv += 'Top 10 Popular Items\n';
      csv += 'Item Name,Order Count\n';
      popularItems.forEach(item => {
        csv += `${item.name},${item.count}\n`;
      });

      csv += '\nRevenue Trend\n';
      csv += 'Date,Revenue,Orders\n';
      revenueTrend.forEach(item => {
        csv += `${item.date},${item.revenue},${item.orders}\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manager-dashboard-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export report');
    }
  };

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
        <Button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 !bg-black hover:!bg-white hover:!text-black !text-white border border-black transition-colors"
          disabled={loading || popularItems.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Date Range Tabs */}
      <Card className="animate-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Select date range to view statistics</span>
            </div>
            <div className="flex items-center gap-4">
              <Tabs value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <TabsList className="grid w-[320px] grid-cols-3">
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <Button
                    onClick={fetchStats}
                    size="sm"
                    className="!bg-gray-900 hover:!bg-gray-700 !text-white"
                    disabled={loading || !customStartDate || !customEndDate}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Cards - 4 cards with dynamic data */}
      <div className="grid gap-4 md:grid-cols-4 card-grid">
        <Card 
          className="border-l-4 border-l-gray-900 bg-white animate-card"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{formatVND(stats.totalRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {dateRange === 'week' ? 'This week' : 'This month'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/orders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  {dateRange === 'week' ? 'This week' : 'This month'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all bg-white animate-card"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{formatVND(stats.averageOrderValue)}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Per order average
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all bg-white animate-card"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Item</CardTitle>
            <Award className="h-4 w-4 text-gray-900" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-900 truncate">{stats.topItem}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Best seller
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart - Using Admin API */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-900" />
                <span>Revenue Trend</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {dateRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : revenueTrend.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
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
                            <p className="text-sm font-medium text-gray-900">{payload[0].payload.date}</p>
                            <p className="text-lg font-bold text-gray-900">{formatVND(payload[0].value as number)}</p>
                            <p className="text-xs text-gray-600">{payload[0].payload.orders} orders</p>
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
            {!loading && revenueTrend.length > 0 && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                ⚠️ Note: Currently showing all stores data. Backend filter by manager's store pending.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Popular Items Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gray-900" />
                <span>Popular Items</span>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Top 10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Loading chart...
              </div>
            ) : popularItems.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={popularItems}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                            <p className="text-sm font-medium text-gray-900">{payload[0].payload.name}</p>
                            <p className="text-lg font-bold text-gray-900">{payload[0].value} orders</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1f2937" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operations Alerts - Always Today's Data */}
      <div className="grid gap-4 md:grid-cols-2 card-grid">
        <Card 
          className="border-l-4 border-l-gray-900 hover:shadow-md transition-all cursor-pointer bg-white animate-card"
          onClick={() => navigate('/manager/ingredients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Alerts</CardTitle>
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
                  Items need attention
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
            <CardTitle className="text-sm font-medium text-gray-600">Active Menu Items</CardTitle>
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
                  Currently active
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
