// filepath: e:\kitchen_chicken\src\pages\admin\AdminDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { usePolling } from "@/hooks/usePolling";
import { useState, useCallback } from "react";

// Mock API function - Replace with real API
const fetchDashboardStats = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    revenue: Math.floor(Math.random() * 50000) + 40000,
    orders: Math.floor(Math.random() * 500) + 2000,
    avgOrderValue: Math.floor(Math.random() * 5000) + 10000,
    activeOrders: Math.floor(Math.random() * 100) + 500,
    revenueChange: '+20.1%',
    ordersChange: '+180.1%',
    avgOrderChange: '+19.0%',
    activeOrdersChange: '+201'
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 45231.89,
    orders: 2350,
    avgOrderValue: 12234,
    activeOrders: 573,
    revenueChange: '+20.1%',
    ordersChange: '+180.1%',
    avgOrderChange: '+19.0%',
    activeOrdersChange: '+201'
  });

  // Use polling to fetch data every 5 seconds
  const fetchStats = useCallback(async () => {
    const data = await fetchDashboardStats();
    setStats(data);
    return data;
  }, []);

  const { data, isLoading } = usePolling(fetchStats, {
    interval: 5000, // Update every 5 seconds
    enabled: true // Set to false to disable polling
  });

  const recentSales = [
    {
      id: 1,
      initials: "OM",
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      amount: "$1,999.00"
    },
    {
      id: 2,
      initials: "JL",
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      amount: "$39.00"
    },
    {
      id: 3,
      initials: "IN",
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      amount: "$299.00"
    },
    {
      id: 4,
      initials: "WK",
      name: "William Kim",
      email: "will@email.com",
      amount: "$99.00"
    },
    {
      id: 5,
      initials: "SD",
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      amount: "$39.00"
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <button className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/90">
          Download
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.revenue.toLocaleString() || stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueChange} from last month
              {isLoading && <span className="ml-2 text-blue-500">●</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data?.orders.toLocaleString() || stats.orders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersChange} from last month
              {isLoading && <span className="ml-2 text-blue-500">●</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data?.avgOrderValue.toLocaleString() || stats.avgOrderValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.avgOrderChange} from last month
              {isLoading && <span className="ml-2 text-blue-500">●</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data?.activeOrders || stats.activeOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOrdersChange} since last hour
              {isLoading && <span className="ml-2 text-blue-500">●</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be rendered here
              {isLoading && (
                <span className="ml-2 text-blue-500 animate-pulse">● Updating...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <p className="text-sm text-muted-foreground">
              You made {recentSales.length} sales this month.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-medium">{sale.initials}</span>
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">{sale.email}</p>
                  </div>
                  <div className="ml-auto font-medium">{sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
