/**
 * ⚠️ PENDING - Waiting for Backend API
 * 
 * This component requires Manager Orders API endpoints that are not yet implemented:
 * - GET /api/orders/manager - List all orders
 * - GET /api/orders/manager/{id} - Get order detail
 * - PATCH /api/orders/manager/{id}/status - Update order status
 * 
 * Current API endpoints (/api/orders) are for MEMBER role only, causing 401 errors.
 * 
 * TODO: Update this component once backend implements ManagerOrderController
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ShoppingCart, Eye, Clock, CheckCircle, XCircle, AlertCircle, Store, User } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderDate: string;
  pickupTime?: string;
  totalAmount: number;
  status: OrderStatus;
  userId: number;
  userName?: string;
  storeId: number;
  storeName?: string;
  orderItems?: OrderItem[];
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stores, setStores] = useState<any[]>([]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Try current orders first, fallback to history if needed
      const response = await api.get<ApiResponse<Order[]>>('/orders/current');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Try history endpoint as fallback
      try {
        const response = await api.get<ApiResponse<Order[]>>('/orders/history');
        setOrders(response.data.data);
      } catch (historyError) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/store');
      setStores(response.data.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStores();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesStore = filterStore === 'all' || order.storeId.toString() === filterStore;
    return matchesSearch && matchesStatus && matchesStore;
  });

  // Stats
  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'NEW').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="h-3 w-3" />;
      case 'CONFIRMED':
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />;
      case 'PROCESSING':
        return <Clock className="h-3 w-3" />;
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status: newStatus });
      toast.success(`Order #${order.id} status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Handle view details
  const handleViewDetails = async (order: Order) => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${order.id}`);
      setSelectedOrder(response.data.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  // Get next status based on current status (BR-27)
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'NEW':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'PROCESSING';
      case 'PROCESSING':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
            <ShoppingCart className="h-8 w-8 text-black" />
            <span>Orders Dashboard</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage customer orders in real-time
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="border-gray-300 hover:bg-gray-100">
          Refresh Orders
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterStore !== 'all' 
                ? 'No orders found' 
                : 'No orders yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDateTime(order.orderDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{order.userName || `User #${order.userId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{order.storeName || `Store #${order.storeId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        {formatVND(order.totalAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {getNextStatus(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order, getNextStatus(order.status)!)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            → {getNextStatus(order.status)}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Order Details - #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-sm">{formatDateTime(selectedOrder.orderDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={`border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm">{selectedOrder.userName || `User #${selectedOrder.userId}`}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Store</p>
                  <p className="text-sm">{selectedOrder.storeName || `Store #${selectedOrder.storeId}`}</p>
                </div>
              </div>

              {selectedOrder.pickupTime && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
                  <p className="text-sm">{formatDateTime(selectedOrder.pickupTime)}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Order Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{item.menuItemName || `Item #${item.menuItemId}`}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-green-600">{formatVND(item.price * item.quantity)}</p>
                    </div>
                  )) || (
                    <p className="p-3 text-sm text-muted-foreground">No items information</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatVND(selectedOrder.totalAmount)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
