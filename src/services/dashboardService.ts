
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
    super('/dashboard'); // Adjust endpoint as needed
  }

  /**
   * Get dashboard statistics
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
   * Get revenue data for chart
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
   * Get recent sales
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

  /**
   * Get revenue trend data for charts (7 or 30 days)
   */
  async getRevenueTrend(days: number = 7): Promise<RevenueTrendData[]> {
    // TODO: Replace with actual API call
    // For now, generate mock data based on current date
    const data: RevenueTrendData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock data with some variation
      const baseRevenue = 50000 + Math.random() * 30000;
      const baseTx = 15 + Math.floor(Math.random() * 25);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(baseRevenue),
        transactions: baseTx,
      });
    }
    
    return data;
  }

  /**
   * Get store performance data
   */
  async getStorePerformance(): Promise<StorePerformanceData[]> {
    // TODO: Replace with actual API call
    // For now, return mock data
    return [
      { storeId: 1, storeName: 'District 1 Store', revenue: 185000, transactions: 245, growth: 12.5 },
      { storeId: 2, storeName: 'District 3 Store', revenue: 156000, transactions: 198, growth: 8.3 },
      { storeId: 3, storeName: 'Binh Thanh Store', revenue: 142000, transactions: 187, growth: 15.7 },
      { storeId: 4, storeName: 'Thu Duc Store', revenue: 128000, transactions: 165, growth: 5.2 },
      { storeId: 5, storeName: 'Tan Binh Store', revenue: 119000, transactions: 152, growth: -2.1 },
    ];
  }

  /**
   * Get user growth data (last 6 months)
   */
  async getUserGrowth(): Promise<UserGrowthData[]> {
    // TODO: Replace with actual API call
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    let totalUsers = 100;
    
    return months.map((month) => {
      const newUsers = Math.floor(Math.random() * 30) + 10;
      totalUsers += newUsers;
      return {
        month,
        newUsers,
        totalUsers,
      };
    });
  }

  /**
   * Get user distribution by role
   */
  async getUserDistribution(): Promise<UserDistribution[]> {
    // TODO: Replace with actual API call
    return [
      { role: 'Customers', count: 245, percentage: 68 },
      { role: 'Employees', count: 85, percentage: 24 },
      { role: 'Managers', count: 22, percentage: 6 },
      { role: 'Admins', count: 8, percentage: 2 },
    ];
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
