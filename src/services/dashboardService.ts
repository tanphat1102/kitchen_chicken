
import { BaseApiService } from './api';

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number; // Percentage change from last month
  totalOrders: number;
  ordersChange: number;
  averageOrderValue: number;
  avgValueChange: number;
  activeOrders: number;
  activeOrdersChange: number;
}

/**
 * Revenue data for chart
 */
export interface RevenueData {
  month: string;
  revenue: number;
}

/**
 * Recent sale item
 */
export interface RecentSale {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  initials: string;
  createdAt: Date;
}

/**
 * Revenue Trend Data (for line/area charts)
 */
export interface RevenueTrendData {
  date: string; // Format: "Oct 22" or full date
  revenue: number;
  transactions: number;
}

/**
 * Store Performance Data
 */
export interface StorePerformanceData {
  storeId: number;
  storeName: string;
  revenue: number;
  transactions: number;
  growth: number; // Percentage
}

/**
 * User Growth Data
 */
export interface UserGrowthData {
  month: string;
  newUsers: number;
  totalUsers: number;
}

/**
 * User Distribution by Role
 */
export interface UserDistribution {
  role: string;
  count: number;
  percentage: number;
}

/**
 * Dashboard Service
 */
class DashboardService extends BaseApiService {
  constructor() {
    super('/dashboard');
  }

  /**
   * Get dashboard statistics (deprecated - use individual endpoints)
   */
  async getStats(): Promise<DashboardStats> {
    // TODO: Replace with actual API call when backend is ready
    // For now, return mock data
    return {
      totalRevenue: 45231.89,
      revenueChange: 20.1,
      totalOrders: 2350,
      ordersChange: 180.1,
      averageOrderValue: 12234,
      avgValueChange: 19,
      activeOrders: 573,
      activeOrdersChange: 201,
    };
  }

  /**
   * Get revenue data for chart (deprecated - use getRevenueTrend)
   */
  async getRevenueData(): Promise<RevenueData[]> {
    // TODO: Replace with actual API call
    return [
      { month: 'Jan', revenue: 4500 },
      { month: 'Feb', revenue: 5200 },
      { month: 'Mar', revenue: 4800 },
      { month: 'Apr', revenue: 4300 },
      { month: 'May', revenue: 3700 },
      { month: 'Jun', revenue: 2500 },
      { month: 'Jul', revenue: 5400 },
      { month: 'Aug', revenue: 5800 },
      { month: 'Sep', revenue: 3200 },
      { month: 'Oct', revenue: 6200 },
      { month: 'Nov', revenue: 3800 },
      { month: 'Dec', revenue: 4500 },
    ];
  }

  /**
   * Get recent sales (deprecated - use transaction service)
   */
  async getRecentSales(): Promise<RecentSale[]> {
    // TODO: Replace with actual API call
    return [
      {
        id: '1',
        customerName: 'Olivia Martin',
        customerEmail: 'olivia.martin@email.com',
        amount: 1999.0,
        initials: 'OM',
        createdAt: new Date(),
      },
      {
        id: '2',
        customerName: 'Jackson Lee',
        customerEmail: 'jackson.lee@email.com',
        amount: 39.0,
        initials: 'JL',
        createdAt: new Date(),
      },
      {
        id: '3',
        customerName: 'Isabella Nguyen',
        customerEmail: 'isabella.nguyen@email.com',
        amount: 299.0,
        initials: 'IN',
        createdAt: new Date(),
      },
      {
        id: '4',
        customerName: 'William Kim',
        customerEmail: 'will@email.com',
        amount: 99.0,
        initials: 'WK',
        createdAt: new Date(),
      },
      {
        id: '5',
        customerName: 'Sofia Davis',
        customerEmail: 'sofia.davis@email.com',
        amount: 39.0,
        initials: 'SD',
        createdAt: new Date(),
      },
    ];
  }

  async getRevenueTrend(days: number = 7): Promise<RevenueTrendData[]> {
    try {
      // TEMPORARY: Direct URL for testing backend
      const response = await fetch(`https://chickenkitchen.milize-lena.space/api/dashboard/admin/revenue-trend?dayNumber=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Handle ResponseModel wrapper: { success, message, data }
      const rawData = response.data || response;
      
      if (!Array.isArray(rawData)) {
        console.warn('Revenue trend data is not an array:', rawData);
        return [];
      }
      
      // Backend returns raw transactions: { pickupTime, totalPrice }
      // Need to aggregate by date
      const aggregatedByDate = rawData.reduce((acc: any, item: any) => {
        // Extract date from pickupTime (ISO string)
        const dateStr = item.pickupTime.split('T')[0]; // "2025-11-10"
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            revenue: 0,
            transactions: 0
          };
        }
        
        acc[dateStr].revenue += item.totalPrice || 0;
        acc[dateStr].transactions += 1;
        
        return acc;
      }, {});
      
      // Convert object to array and sort by date
      return Object.values(aggregatedByDate)
        .sort((a: any, b: any) => a.date.localeCompare(b.date)) as RevenueTrendData[];
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get store performance data
   * Backend: GET /api/dashboard/admin/best-performance
   */
  async getStorePerformance(): Promise<StorePerformanceData[]> {
    try {
      // TEMPORARY: Direct URL for testing backend
      const response = await fetch('https://chickenkitchen.milize-lena.space/api/dashboard/admin/best-performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Handle ResponseModel wrapper
      const data = response.data || response;
      
      if (!Array.isArray(data)) {
        console.warn('Store performance data is not an array:', data);
        return [];
      }
      
      // Transform backend response to match frontend interface
      return data.map((item: any) => ({
        storeId: item.storeId || item.id,
        storeName: item.storeName || item.name,
        revenue: item.totalRevenue || item.revenue || 0,
        transactions: item.totalOrders || item.orderCount || 0,
        growth: item.growthRate || item.growth || 0,
      }));
    } catch (error) {
      console.error('Error fetching store performance:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get user growth data (last N days, typically 180 for 6 months)
   * Backend: GET /api/dashboard/admin/user-growth-trend?dayNumber={days}
   * Backend returns: { createdDate: string, totalUser: number }[]
   */
  async getUserGrowth(days: number = 180): Promise<UserGrowthData[]> {
    try {
      // TEMPORARY: Direct URL for testing backend
      const response = await fetch(`https://chickenkitchen.milize-lena.space/api/dashboard/admin/user-growth-trend?dayNumber=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Handle ResponseModel wrapper
      const data = response.data || response;
      
      if (!Array.isArray(data)) {
        console.warn('User growth data is not an array:', data);
        return [];
      }
      
      // Backend returns: { createdDate: "2025-11-09", totalUser: 36 }
      // Transform to match frontend interface
      return data.map((item: any, index: number, array: any[]) => {
        // Calculate newUsers as difference from previous day
        const prevTotalUsers = index > 0 ? (array[index - 1].totalUser || 0) : 0;
        const currentTotalUsers = item.totalUser || 0;
        const newUsers = currentTotalUsers - prevTotalUsers;
        
        return {
          month: item.createdDate || item.month || item.period,
          newUsers: Math.max(0, newUsers), // Ensure non-negative
          totalUsers: currentTotalUsers,
        };
      });
    } catch (error) {
      console.error('Error fetching user growth:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get user distribution by role (deprecated - calculate from user service)
   */
  async getUserDistribution(): Promise<UserDistribution[]> {
    // TODO: Replace with actual API call or calculate from user service
    return [
      { role: 'Customers', count: 245, percentage: 68 },
      { role: 'Employees', count: 85, percentage: 24 },
      { role: 'Managers', count: 22, percentage: 6 },
      { role: 'Admins', count: 8, percentage: 2 },
    ];
  }

  /**
   * Get summary report for manager (revenue, orders, avg order value)
   * Backend: GET /api/dashboard/manager/summary?startDate={date}&endDate={date}
   */
  async getManagerSummary(startDate: string, endDate: string): Promise<any> {
    try {
      // TEMPORARY: Direct URL for testing backend
      const response = await fetch(`https://chickenkitchen.milize-lena.space/api/dashboard/manager/summary?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Handle ResponseModel wrapper
      const data = response.data || response;
      
      return data;
    } catch (error) {
      console.error('Error fetching manager summary:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
      };
    }
  }

  /**
   * Get popular dishes for manager
   * Backend: GET /api/dashboard/manager/popular-items?startDate={date}&endDate={date}&limit={limit}
   */
  async getManagerPopularItems(startDate: string, endDate: string, limit: number = 5): Promise<any[]> {
    try {
      // TEMPORARY: Direct URL for testing backend
      const response = await fetch(`https://chickenkitchen.milize-lena.space/api/dashboard/manager/popular-items?startDate=${startDate}&endDate=${endDate}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Handle ResponseModel wrapper
      const data = response.data || response;
      
      if (!Array.isArray(data)) {
        console.warn('Popular items data is not an array:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching popular items:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
