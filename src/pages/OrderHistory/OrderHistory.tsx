import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useOrderHistory, useCreateFeedback } from '@/hooks/useOrderCustomer';
import { useAuth } from '@/contexts/AuthContext';

const currencyFormat = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Order status timeline component - Shadcn style
const OrderStatusTimeline: React.FC<{ status: string }> = ({ status }) => {
  const statuses = [
    { key: 'NEW', label: 'Ordered' },
    { key: 'PROCESSING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const currentIndex = statuses.findIndex(s => s.key === status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-destructive">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  const progress = currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;

  return (
    <div className="py-6 space-y-4">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status labels */}
      <div className="flex justify-between">
        {statuses.map((s, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={s.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1.5">
                {isCompleted ? (
                  <div className={`h-2 w-2 rounded-full bg-primary ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Feedback form component - Shadcn style
const FeedbackForm: React.FC<{ orderId: number; onSuccess: () => void }> = ({ orderId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const createFeedback = useCreateFeedback(orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedback.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          onSuccess();
          setComment('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <label className="text-sm font-medium">Rate your experience</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`h-6 w-6 ${
                  star <= rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                } transition-colors`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={createFeedback.isPending}
        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {createFeedback.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const OrderHistoryPage: React.FC = () => {
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const { currentUser } = useAuth();
  
  const { data: orders = [], isLoading, error, refetch } = useOrderHistory(storeId, !!currentUser);

  const handleFeedbackSuccess = () => {
    refetch();
  };

  // Show login required if not logged in
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your order history</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('auth:login-required'))}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading orders: {error.message}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
            <p className="text-muted-foreground">
              {isEmpty ? 'No orders yet' : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {isEmpty ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-muted-foreground mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">Start ordering your favorite dishes!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="rounded-lg border bg-card shadow-sm">
                  {/* Order Header */}
                  <div className="flex flex-col space-y-1.5 p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt || '').toLocaleString('vi-VN')}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.storeName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{currencyFormat(order.totalPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Timeline */}
                  <div className="px-6 pb-4">
                    <OrderStatusTimeline status={order.orderStatusName} />
                  </div>

                  {/* Order Items */}
                  <div className="px-6 pb-4 space-y-3">
                    <h4 className="text-sm font-medium">Order Items</h4>
                    {order.dishes && order.dishes.length > 0 ? (
                      <div className="space-y-2">
                        {order.dishes.map((dish) => (
                          <div key={dish.id} className="flex justify-between items-start p-3 rounded-md border bg-muted/50">
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{dish.menuItemName}</p>
                              {dish.note && (
                                <p className="text-xs text-muted-foreground">{dish.note}</p>
                              )}
                              {dish.selections && dish.selections.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {dish.selections.map((sel) => (
                                    <span
                                      key={sel.id}
                                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                                    >
                                      {sel.optionName} ×{sel.quantity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <p className="text-xs text-muted-foreground">×{dish.quantity}</p>
                              <p className="text-sm font-semibold">
                                {currencyFormat(dish.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No items in this order</p>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="px-6 pb-6">
                    {order.feedback ? (
                      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Your Review</p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < order.feedback!.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {order.feedback.comment && (
                          <p className="text-sm text-muted-foreground">{order.feedback.comment}</p>
                        )}
                      </div>
                    ) : order.orderStatusName === 'COMPLETED' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Leave a review for this order</span>
                        </div>
                        <FeedbackForm orderId={order.orderId} onSuccess={handleFeedbackSuccess} />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        Complete this order to leave a review
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderHistoryPage;
