import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, TrendingUp, DollarSign, ShoppingBag, Award, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';

/**
 * ⚠️ PENDING: Backend Report/Dashboard API Not Implemented
 * 
 * This component currently uses MOCK DATA for display purposes.
 * 
 * Required Backend APIs (Manager role):
 * - GET /api/reports/summary?startDate={date}&endDate={date}
 *   → Returns: { totalRevenue, totalOrders, averageOrderValue, topItem }
 * 
 * - GET /api/reports/revenue-trend?startDate={date}&endDate={date}
 *   → Returns: [{ date, revenue, orders }]
 * 
 * - GET /api/reports/store-performance?startDate={date}&endDate={date}
 *   → Returns: [{ storeId, storeName, revenue, orders }]
 * 
 * - GET /api/reports/popular-items?startDate={date}&endDate={date}&limit=5
 *   → Returns: [{ menuItemId, menuItemName, orderCount, revenue }]
 * 
 * - GET /api/reports/category-performance?startDate={date}&endDate={date}
 *   → Returns: [{ categoryId, categoryName, revenue, percentage }]
 * 
 * Once backend implements these endpoints, replace mock data with real API calls.
 */

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface StorePerformance {
  storeId: number;
  storeName: string;
  revenue: number;
  orders: number;
}

interface PopularItem {
  menuItemId: number;
  menuItemName: string;
  orderCount: number;
  revenue: number;
}

interface CategoryPerformance {
  categoryId: number;
  categoryName: string;
  revenue: number;
  percentage: number;
}

interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topItem: string;
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  // Data states
  const [summary, setSummary] = useState<ReportSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topItem: 'N/A',
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPerformance[]>([]);

  // Chart colors
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  // Fetch all report data
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // In production, these would be real API calls
      // For now, using mock data structure
      
      // Mock summary data
      setSummary({
        totalRevenue: 125500000,
        totalOrders: 1247,
        averageOrderValue: 100641,
        topItem: 'Gà Rán Giòn',
      });

      // Mock revenue trend data
      const mockRevenueData: RevenueData[] = [
        { date: '01/10', revenue: 4200000, orders: 42 },
        { date: '02/10', revenue: 3800000, orders: 38 },
        { date: '03/10', revenue: 5100000, orders: 51 },
        { date: '04/10', revenue: 4500000, orders: 45 },
        { date: '05/10', revenue: 6200000, orders: 62 },
        { date: '06/10', revenue: 7800000, orders: 78 },
        { date: '07/10', revenue: 8500000, orders: 85 },
      ];
      setRevenueData(mockRevenueData);

      // Mock store performance
      const mockStorePerformance: StorePerformance[] = [
        { storeId: 1, storeName: 'District 1', revenue: 45000000, orders: 450 },
        { storeId: 2, storeName: 'District 3', revenue: 38000000, orders: 380 },
        { storeId: 3, storeName: 'Thu Duc', revenue: 42500000, orders: 417 },
      ];
      setStorePerformance(mockStorePerformance);

      // Mock popular items
      const mockPopularItems: PopularItem[] = [
        { menuItemId: 1, menuItemName: 'Gà Rán Giòn', orderCount: 245, revenue: 24500000 },
        { menuItemId: 2, menuItemName: 'Cơm Gà Teriyaki', orderCount: 198, revenue: 19800000 },
        { menuItemId: 3, menuItemName: 'Burger Gà', orderCount: 167, revenue: 16700000 },
        { menuItemId: 4, menuItemName: 'Gà Sốt Phô Mai', orderCount: 145, revenue: 14500000 },
        { menuItemId: 5, menuItemName: 'Salad Gà', orderCount: 132, revenue: 13200000 },
      ];
      setPopularItems(mockPopularItems);

      // Mock category performance
      const mockCategoryData: CategoryPerformance[] = [
        { categoryId: 1, categoryName: 'Fried Chicken', revenue: 45000000, percentage: 35.8 },
        { categoryId: 2, categoryName: 'Rice Dishes', revenue: 32000000, percentage: 25.5 },
        { categoryId: 3, categoryName: 'Burgers', revenue: 22000000, percentage: 17.5 },
        { categoryId: 4, categoryName: 'Beverages', revenue: 15000000, percentage: 11.9 },
        { categoryId: 5, categoryName: 'Sides', revenue: 11500000, percentage: 9.2 },
      ];
      setCategoryData(mockCategoryData);

      toast.success('Reports loaded successfully');
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle date range change
  const handleDateRangeChange = (range: 'week' | 'month' | 'custom') => {
    setDateRange(range);
    const now = new Date();
    
    if (range === 'week') {
      setStartDate(format(startOfWeek(now), 'yyyy-MM-dd'));
      setEndDate(format(endOfWeek(now), 'yyyy-MM-dd'));
    } else if (range === 'month') {
      setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      // Create CSV content
      let csv = 'Revenue Report\n\n';
      csv += `Period: ${startDate} to ${endDate}\n\n`;
      csv += `Total Revenue,${summary.totalRevenue}\n`;
      csv += `Total Orders,${summary.totalOrders}\n`;
      csv += `Average Order Value,${summary.averageOrderValue}\n`;
      csv += `Top Item,${summary.topItem}\n\n`;
      
      csv += 'Store Performance\n';
      csv += 'Store Name,Revenue,Orders\n';
      storePerformance.forEach(store => {
        csv += `${store.storeName},${store.revenue},${store.orders}\n`;
      });
      
      csv += '\nTop Items\n';
      csv += 'Item Name,Order Count,Revenue\n';
      popularItems.forEach(item => {
        csv += `${item.menuItemName},${item.orderCount},${item.revenue}\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <FileText className="h-8 w-8 text-black" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Analyze business performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchReports}
            className="flex items-center gap-2 border-gray-900 text-gray-900 hover:bg-gray-800 hover:text-white transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5 items-end">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => handleDateRangeChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={dateRange !== 'custom'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={dateRange !== 'custom'}
              />
            </div>

            <Button 
              onClick={fetchReports}
              disabled={loading}
              className="col-span-2"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-900" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatVND(summary.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gray-900" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalOrders)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-900" />
              Avg. Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatVND(summary.averageOrderValue)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-900" />
              Top Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">{summary.topItem}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-900" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: any) => formatVND(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1f2937" 
                strokeWidth={2}
                name="Revenue (VND)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Store Performance & Category Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-gray-900" />
              Store Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="storeName" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: any) => formatVND(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#1f2937" name="Revenue (VND)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-gray-900" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="percentage"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.categoryName}: ${entry.percentage}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${formatVND(props.payload.revenue)})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            Top Menu Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularItems.map((item, index) => (
              <div 
                key={item.menuItemId} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <span className="font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{item.menuItemName}</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(item.orderCount)} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatVND(item.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
