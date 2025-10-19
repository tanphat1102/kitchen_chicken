
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
}

export const dashboardService = new DashboardService();
export default dashboardService;
