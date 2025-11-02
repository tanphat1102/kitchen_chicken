import React from 'react';
import {
  useConfirmedOrders,
  useConfirmedOrderDetail,
  useAcceptOrder,
  useMarkReady,
  useCompleteOrder,
  useOrderManagement,
} from '@/hooks/useOrderEmployee';

// ==================== Example 1: Orders List for Employee ====================

export function EmployeeOrdersList() {
  const { data: orders = [], isLoading, error } = useConfirmedOrders();
  const acceptOrder = useAcceptOrder();

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Confirmed Orders ({orders.length})</h2>
      {orders.map((order) => (
        <div key={order.orderId} className="border p-4 mb-2">
          <div>Order #{order.orderId}</div>
          <div>Total: {order.totalPrice} VND</div>
          <div>Status: {order.orderStatusName}</div>
          <div>Items: {order.dishes.length}</div>
          
          {order.orderStatusName === 'CONFIRMED' && (
            <button
              onClick={() => acceptOrder.mutate(order.orderId)}
              disabled={acceptOrder.isPending}
            >
              {acceptOrder.isPending ? 'Accepting...' : 'Accept Order'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== Example 2: Order Detail with Actions ====================

export function EmployeeOrderDetail({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useConfirmedOrderDetail(orderId);
  const acceptOrder = useAcceptOrder();
  const markReady = useMarkReady();
  const completeOrder = useCompleteOrder();

  if (isLoading || !order) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2>Order #{order.orderId}</h2>
      <p>Status: {order.orderStatusName}</p>
      <p>Total: {order.totalPrice} VND</p>
      
      <div className="mt-4">
        <h3>Items:</h3>
        {order.dishes.map((dish) => (
          <div key={dish.id}>
            {dish.menuItemName} x {dish.quantity} - {dish.price} VND
            {dish.note && <p className="text-sm text-gray-600">Note: {dish.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-2">
        {order.orderStatusName === 'CONFIRMED' && (
          <button
            onClick={() => acceptOrder.mutate(order.orderId)}
            disabled={acceptOrder.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Accept Order
          </button>
        )}

        {order.orderStatusName === 'PROCESSING' && (
          <button
            onClick={() => markReady.mutate(order.orderId)}
            disabled={markReady.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Mark as Ready
          </button>
        )}

        {order.orderStatusName === 'READY' && (
          <button
            onClick={() => completeOrder.mutate(order.orderId)}
            disabled={completeOrder.isPending}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Complete Order
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== Example 3: Using Combined Hook ====================

export function OrderManagementDashboard() {
  const { data: orders = [] } = useConfirmedOrders();
  const { acceptOrder, markReady, completeOrder, isProcessing } = useOrderManagement();

  const handleAccept = (orderId: number) => {
    acceptOrder.mutate(orderId, {
      onSuccess: () => {
        alert('Order accepted successfully!');
      },
      onError: (error) => {
        alert(`Failed to accept order: ${error.message}`);
      },
    });
  };

  const handleMarkReady = (orderId: number) => {
    markReady.mutate(orderId, {
      onSuccess: () => {
        alert('Order marked as ready!');
      },
    });
  };

  const handleComplete = (orderId: number) => {
    completeOrder.mutate(orderId, {
      onSuccess: () => {
        alert('Order completed!');
      },
    });
  };

  return (
    <div className="p-6">
      <h1>Order Management</h1>
      {isProcessing && <div className="text-blue-600">Processing order...</div>}
      
      <div className="grid gap-4 mt-4">
        {orders.map((order) => (
          <div key={order.orderId} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-600">{order.orderStatusName}</p>
                <p className="text-lg font-semibold">{order.totalPrice} VND</p>
              </div>
              
              <div>
                {order.orderStatusName === 'CONFIRMED' && (
                  <button
                    onClick={() => handleAccept(order.orderId)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Accept
                  </button>
                )}
                
                {order.orderStatusName === 'PROCESSING' && (
                  <button
                    onClick={() => handleMarkReady(order.orderId)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Ready
                  </button>
                )}
                
                {order.orderStatusName === 'READY' && (
                  <button
                    onClick={() => handleComplete(order.orderId)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Example 4: Order Status Flow ====================

export function OrderStatusFlow({ orderId }: { orderId: number }) {
  const { data: order } = useConfirmedOrderDetail(orderId);
  const { acceptOrder, markReady, completeOrder } = useOrderManagement();

  if (!order) return null;

  const steps = [
    { status: 'CONFIRMED', label: 'Confirmed', action: () => acceptOrder.mutate(orderId) },
    { status: 'PROCESSING', label: 'Processing', action: () => markReady.mutate(orderId) },
    { status: 'READY', label: 'Ready', action: () => completeOrder.mutate(orderId) },
    { status: 'COMPLETED', label: 'Completed', action: null },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatusName);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.status} className="flex items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              index <= currentStepIndex ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}
          >
            {index + 1}
          </div>
          <div className="ml-2">
            <div className="font-semibold">{step.label}</div>
            {index === currentStepIndex && step.action && (
              <button
                onClick={step.action}
                className="text-sm text-blue-600 hover:underline"
              >
                Next →
              </button>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 h-1 bg-gray-300 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== Example 5: Real-time Order Monitor ====================

export function OrderMonitor() {
  // Auto-refresh every 30 seconds
  const { data: orders = [], isLoading, refetch } = useConfirmedOrders();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Live Orders ({orders.length})</h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="p-3 border-l-4 border-blue-500 bg-blue-50"
          >
            <div className="flex justify-between">
              <span className="font-bold">Order #{order.orderId}</span>
              <span className="text-sm text-gray-600">
                {new Date(order.createdAt || '').toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm">
              {order.dishes.length} items • {order.totalPrice} VND
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
