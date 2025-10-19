// filepath: e:\kitchen_chicken\src\pages\admin\AdminDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { usePolling } from "@/hooks/usePolling";
import { useState, useCallback } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Mock API function - Replace with real API
const fetchDashboardStats = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const revenue = Math.floor(Math.random() * 50000) + 40000;
  const orders = Math.floor(Math.random() * 500) + 2000;
  const avgOrderValue = revenue / orders; // Logic đúng: revenue / orders
  const activeOrders = Math.floor(Math.random() * 100) + 500;
  
  return {
    revenue,
    orders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100, // Round to 2 decimals
    activeOrders,
    revenueChange: '+20.1%',
    ordersChange: '+18.5%',
    avgOrderChange: '+2.3%',
    activeOrdersChange: '+12'
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 45724,
    orders: 2201,
    avgOrderValue: 20.77, // Logic: 45724 / 2201 = ~20.77
    activeOrders: 597,
    revenueChange: '+20.1%',
    ordersChange: '+18.5%',
    avgOrderChange: '+2.3%',
    activeOrdersChange: '+12'
  });

  // Mock chart data - Replace with real API
  const [chartData, setChartData] = useState([
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 }
  ]);

  // Use polling to fetch data every 5 minutes
  const fetchStats = useCallback(async () => {
    const data = await fetchDashboardStats();
    setStats(data);
    
    // Update chart data with random values (simulate real-time updates)
    setChartData(prevData => 
      prevData.map(item => ({
        ...item,
        revenue: Math.floor(Math.random() * 3000) + 3000
      }))
    );
    
    return data;
  }, []);

  const { data, isLoading } = usePolling(fetchStats, {
    interval: 300000, // Update every 5 minutes (instead of 5 seconds)
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 transition-colors shadow-sm flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-black hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <div className="rounded-full bg-black/5 p-2">
              <DollarSign className="h-4 w-4 text-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.revenue.toLocaleString() || stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-600 font-medium">{stats.revenueChange}</span> from last month
              {isLoading && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-400 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <div className="rounded-full bg-gray-400/10 p-2">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.orders.toLocaleString() || stats.orders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-600 font-medium">{stats.ordersChange}</span> from last month
              {isLoading && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-600 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Order Value</CardTitle>
            <div className="rounded-full bg-gray-600/10 p-2">
              <TrendingUp className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.avgOrderValue.toFixed(2) || stats.avgOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-600 font-medium">{stats.avgOrderChange}</span> from last month
              {isLoading && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
            <div className="rounded-full bg-gray-800/10 p-2">
              <Users className="h-4 w-4 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.activeOrders || stats.activeOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-600 font-medium">+{stats.activeOrdersChange}</span> since last hour
              {isLoading && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Revenue Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Monthly revenue performance</p>
              </div>
              {isLoading && (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pl-2 pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
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
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Month
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Revenue
                              </span>
                              <span className="font-bold text-lg">
                                ${payload[0].value?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#18181b"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Recent Sales</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              You made {recentSales.length} sales this month.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white font-medium text-sm shadow-sm">
                    {sale.initials}
                  </div>
                  <div className="ml-4 space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{sale.email}</p>
                  </div>
                  <div className="ml-auto font-semibold text-sm">{sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
