/**
 * Example usage of Order Customer Service with TanStack Query
 * 
 * This file demonstrates how to use the order customer hooks
 * in your React components.
 */

import React from 'react';
import {
  useCurrentOrder,
  useOrderHistory,
  useOrderStatuses,
  useAddDishToCurrentOrder,
  useUpdateDish,
  useDeleteDish,
  useCreateFeedback,
  useOrderFlow,
} from '@/hooks/useOrderCustomer';

// ==================== Example 1: Simple Current Order Display ====================

export function CurrentOrderExample() {
  const storeId = 1; // Get from context or props
  const { data: order, isLoading, error } = useCurrentOrder(storeId);

  if (isLoading) return <div>Loading order...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!order) return <div>No order found</div>;

  return (
    <div>
      <h2>Current Order #{order.id}</h2>
      <p>Store: {order.storeName}</p>
      <p>Status: {order.orderStatusName}</p>
      <p>Total: {order.totalPrice.toLocaleString('vi-VN')} VND</p>
      
      <h3>Dishes:</h3>
      <ul>
        {order.dishes.map((dish) => (
          <li key={dish.id}>
            {dish.menuItemName} x {dish.quantity} - {dish.price.toLocaleString('vi-VN')} VND
            {dish.note && <p>Note: {dish.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ==================== Example 2: Add Dish to Cart ====================

export function AddDishButton() {
  const storeId = 1;
  const addDish = useAddDishToCurrentOrder(storeId);

  const handleAddDish = () => {
    addDish.mutate(
      {
        storeId: storeId,
        note: 'No onions please',
        selections: [
          { 
            stepId: 1, 
            items: [
              { menuItemId: 10, quantity: 1 }
            ]
          },
          { 
            stepId: 2, 
            items: [
              { menuItemId: 20, quantity: 2 }
            ]
          },
        ],
      },
      {
        onSuccess: (order) => {
          console.log('Dish added successfully!', order);
          alert('Dish added to order!');
        },
        onError: (error) => {
          console.error('Failed to add dish:', error);
          alert('Failed to add dish');
        },
      }
    );
  };

  return (
    <button
      onClick={handleAddDish}
      disabled={addDish.isPending}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {addDish.isPending ? 'Adding...' : 'Add Dish'}
    </button>
  );
}

// ==================== Example 3: Update Dish Note ====================
// Note: Backend doesn't support updating quantity directly
// To change quantity, you need to delete and re-add the dish

export function DishItemWithUpdate({ dish, storeId }: { dish: any; storeId: number }) {
  const updateDish = useUpdateDish(storeId);

  const handleUpdateNote = () => {
    const newNote = prompt('Enter new note:', dish.note || '');
    if (newNote !== null) {
      updateDish.mutate({
        dishId: dish.id,
        request: {
          note: newNote,
          selections: dish.selections || [],
        },
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>Quantity: {dish.quantity} (fixed)</span>
      <button onClick={handleUpdateNote} disabled={updateDish.isPending}>
        {updateDish.isPending ? 'Updating...' : 'Edit Note'}
      </button>
      <span>{dish.menuItemName}</span>
    </div>
  );
}

// ==================== Example 4: Delete Dish ====================

export function DeleteDishButton({ dishId, storeId }: { dishId: number; storeId: number }) {
  const deleteDish = useDeleteDish(storeId);

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this dish?')) {
      deleteDish.mutate(dishId, {
        onSuccess: () => {
          alert('Dish removed from order');
        },
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteDish.isPending}
      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
    >
      {deleteDish.isPending ? 'Removing...' : 'Remove'}
    </button>
  );
}

// ==================== Example 5: Order History ====================

export function OrderHistoryPage() {
  const storeId = 1;
  const { data: orders, isLoading, error } = useOrderHistory(storeId);

  if (isLoading) return <div>Loading order history...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Order History</h2>
      {orders && orders.length === 0 && <p>No orders yet</p>}
      
      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="border p-4 rounded">
            <h3>Order #{order.id}</h3>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Status: {order.orderStatusName}</p>
            <p>Total: {order.totalPrice.toLocaleString('vi-VN')} VND</p>
            <p>Items: {order.dishes.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Example 6: Create Feedback ====================

export function FeedbackForm({ orderId }: { orderId: number }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  
  const createFeedback = useCreateFeedback(orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createFeedback.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          alert('Feedback submitted successfully!');
          setComment('');
        },
        onError: (error) => {
          alert('Failed to submit feedback: ' + error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Rating (1-5):</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} stars</option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded p-2"
          rows={4}
        />
      </div>
      
      <button
        type="submit"
        disabled={createFeedback.isPending}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {createFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}

// ==================== Example 7: Complete Order Flow (Recommended) ====================

export function OrderPage() {
  const storeId = 1;
  
  // Use the combined hook for all order operations
  const {
    currentOrder,
    orderHistory,
    orderStatuses,
    addDish,
    updateDish,
    deleteDish,
    isLoading,
    isError,
    error,
  } = useOrderFlow(storeId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const order = currentOrder.data;

  return (
    <div>
      <h1>Your Order</h1>
      
      {/* Order statuses dropdown */}
      <div>
        <label>Order Status:</label>
        <select>
          {orderStatuses.data?.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current order details */}
      {order && (
        <div>
          <h2>Order #{order.id}</h2>
          <p>Total: {order.totalPrice.toLocaleString('vi-VN')} VND</p>
          
          {order.dishes.map((dish) => (
            <div key={dish.id} className="flex items-center justify-between p-2 border-b">
              <div>
                <h3>{dish.menuItemName}</h3>
                <p>Quantity: {dish.quantity} (read-only)</p>
                {dish.note && <p className="text-sm text-gray-600">Note: {dish.note}</p>}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newNote = prompt('Update note:', dish.note || '');
                    if (newNote !== null) {
                      // Convert DishSelection[] to StepSelection[] format
                      const selections = dish.selections?.reduce((acc: any[], sel: any) => {
                        const existing = acc.find(s => s.stepId === sel.stepId);
                        if (existing) {
                          existing.items.push({ menuItemId: sel.optionId, quantity: sel.quantity });
                        } else {
                          acc.push({ 
                            stepId: sel.stepId, 
                            items: [{ menuItemId: sel.optionId, quantity: sel.quantity }] 
                          });
                        }
                        return acc;
                      }, []) || [];

                      updateDish.mutate({
                        dishId: dish.id,
                        request: { 
                          note: newNote,
                          selections: selections
                        },
                      });
                    }
                  }}
                >
                  Edit Note
                </button>
                <button onClick={() => deleteDish.mutate(dish.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new dish button */}
      <button
        onClick={() => addDish.mutate({
          storeId: storeId,
          note: '',
          selections: [],
        })}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Dish
      </button>
    </div>
  );
}
