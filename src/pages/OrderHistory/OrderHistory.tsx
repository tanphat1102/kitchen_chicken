import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useOrderHistory, useCreateFeedback, useOrderTracking, useOrderFeedback, useCancelOrder } from '@/hooks/useOrderCustomer';
import { useAuth } from '@/contexts/AuthContext';

const currencyFormat = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Order status timeline component - Shadcn style
const OrderStatusTimeline: React.FC<{ status: string; progress?: number }> = ({ status, progress: apiProgress }) => {
  // Updated to match actual API status values
  const statuses = [
    { key: 'NEW', label: 'Ordered' },
    { key: 'CONFIRMED', label: 'Confirmed' },
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

  // Use API progress if available (from tracking), otherwise calculate from status position
  // Order list: Calculate based on status index (NEW=20%, CONFIRMED=40%, PROCESSING=60%, READY=80%, COMPLETED=100%)
  // Order modal: Uses actual progress from tracking API
  const progress = apiProgress !== undefined 
    ? apiProgress 
    : currentIndex >= 0 
      ? ((currentIndex + 1) / statuses.length) * 100 
      : 0;

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
  const [message, setMessage] = useState('');
  const createFeedback = useCreateFeedback(orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedback.mutate(
      { rating, message: message.trim() || undefined },
      {
        onSuccess: () => {
          onSuccess();
          setMessage('');
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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

// Order Feedback Section Component - Fetches feedback separately
const OrderFeedbackSection: React.FC<{ 
  orderId: number; 
  orderStatus: string;
  onFeedbackSuccess: () => void;
}> = ({ orderId, orderStatus, onFeedbackSuccess }) => {
  const { data: feedback, refetch } = useOrderFeedback(orderId, orderStatus === 'COMPLETED');

  const handleSuccess = () => {
    refetch();
    onFeedbackSuccess();
  };

  return (
    <div className="px-6 pb-6">
      {feedback ? (
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Your Review</p>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < feedback.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({feedback.rating}/5)</span>
          </div>
          {feedback.message && feedback.message.trim() !== '' && (
            <p className="text-sm text-muted-foreground">{feedback.message}</p>
          )}
          {feedback.createdAt && (
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : orderStatus === 'COMPLETED' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Leave a review for this order</span>
          </div>
          <FeedbackForm orderId={orderId} onSuccess={handleSuccess} />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          Complete this order to leave a review
        </div>
      )}
    </div>
  );
};

// Order Detail Tracking Component
const OrderDetailTracking: React.FC<{ orderId: number; onClose: () => void }> = ({ orderId, onClose }) => {
  const { data: tracking, isLoading, error, refetch } = useOrderTracking(orderId);
  const { data: feedback, refetch: refetchFeedback } = useOrderFeedback(orderId, tracking?.status === 'COMPLETED');

  const handleFeedbackSuccess = () => {
    refetch();
    refetchFeedback();
  };

  // Debug logging
  React.useEffect(() => {
    if (tracking) {
      console.log('=== Order Tracking Data ===');
      console.log('Full tracking:', tracking);
      console.log('Status:', tracking.status);
      console.log('Feedback from tracking:', tracking.feedback);
      console.log('Dishes:', tracking.dishes);
      console.log('==========================');
    }
    if (feedback) {
      console.log('=== Order Feedback Data (Separate API) ===');
      console.log('Feedback:', feedback);
      console.log('Rating:', feedback.rating);
      console.log('Comment:', feedback.message);
      console.log('==========================================');
    }
    if (error) {
      console.error('=== Order Tracking Error ===');
      console.error('Error:', error);
      console.error('===========================');
    }
  }, [tracking, feedback, error]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading order details</p>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <p className="text-muted-foreground">No order data available</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currencyFormat = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Order Details #{tracking.orderId || 'N/A'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                tracking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                tracking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                tracking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                tracking.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                tracking.status === 'READY' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tracking.status || 'Unknown'}
              </span>
              {tracking.progress !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {tracking.progress}% Complete
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Progress Bar */}
          {tracking.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Order Progress</span>
                <span className="text-muted-foreground">{tracking.progress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${tracking.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Dishes with Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            {tracking.dishes && tracking.dishes.length > 0 ? (
              tracking.dishes.map((dish, dishIndex) => {
                // Calculate total from steps
                const totalPrice = dish.price || 0;
                const totalCal = dish.cal || 0;
                
                return (
                  <div key={dish.dishId || dishIndex} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {dish.name || `Custom ${dish.isCustom ? 'Bowl' : 'Dish'}`}
                          </h4>
                          {dish.isCustom && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{currencyFormat(totalPrice)}</span>
                          <span>•</span>
                          <span>{totalCal} cal</span>
                        </div>
                        {dish.note && (
                          <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                            <p className="text-xs text-amber-800">{dish.note}</p>
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-lg text-primary ml-4">
                        {currencyFormat(totalPrice)}
                      </p>
                    </div>

                    {/* Steps Detail */}
                    {dish.steps && dish.steps.length > 0 && (
                      <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Build Details</p>
                        {dish.steps.map((step) => (
                          <div key={step.stepId} className="space-y-2">
                            <p className="text-sm font-medium text-foreground">{step.stepName}:</p>
                            <div className="flex flex-wrap gap-2 ml-3">
                              {step.items && step.items.length > 0 ? (
                                step.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 rounded-lg bg-background border p-2 min-w-[200px]"
                                  >
                                    {item.imageUrl && (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.menuItemName}
                                        className="w-10 h-10 rounded object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{item.menuItemName}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span>×{item.quantity}</span>
                                        <span>•</span>
                                        <span>{currencyFormat(item.price)}</span>
                                        {item.cal > 0 && (
                                          <>
                                            <span>•</span>
                                            <span>{item.cal} cal</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No items</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No items in this order</p>
            )}
          </div>

          {/* Feedback Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Feedback</h3>
            
            {/* Debug Panel - TEMPORARY */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-bold mb-1">Debug Info:</p>
                <p>Status: {tracking.status}</p>
                <p>Has Feedback (separate API): {feedback ? 'YES' : 'NO'}</p>
                <p>Has Feedback (in tracking): {tracking.feedback ? 'YES' : 'NO'}</p>
                {feedback && (
                  <>
                    <p>Rating: {feedback.rating}</p>
                    <p>Comment: {feedback.message || '(empty)'}</p>
                  </>
                )}
              </div>
            )}
            
            {feedback ? (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Your Review</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({feedback.rating}/5)</span>
                </div>
                {feedback.message && feedback.message.trim() !== '' && (
                  <p className="text-sm text-muted-foreground">{feedback.message}</p>
                )}
                {feedback.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : tracking.status === 'COMPLETED' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Leave a review for this order</span>
                </div>
                <FeedbackForm orderId={orderId} onSuccess={handleFeedbackSuccess} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-lg">
                Complete this order to leave a review
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderHistoryPage: React.FC = () => {
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const { currentUser } = useAuth();
  
  const { data: orders = [], isLoading, error, refetch } = useOrderHistory(storeId, !!currentUser);
  const cancelOrder = useCancelOrder();

  const handleFeedbackSuccess = () => {
    refetch();
  };

  const handleCancelOrder = () => {
    if (!cancelOrderId || !cancelReason.trim()) return;

    cancelOrder.mutate(
      { orderId: cancelOrderId, reason: cancelReason },
      {
        onSuccess: () => {
          setCancelOrderId(null);
          setCancelReason('');
          refetch();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to cancel order');
        },
      }
    );
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
              {orders.map((order) => {
                const totalItems = order.dishes?.reduce((sum, dish) => sum + (dish.quantity || 0), 0) || 0;
                
                return (
                  <div key={order.orderId} className="rounded-lg border bg-card shadow-sm">
                    {/* Order Header */}
                    <div className="flex flex-col space-y-1.5 p-6 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold leading-none tracking-tight">
                              Order #{order.orderId}
                            </h3>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'READY' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{new Date(order.createdAt || '').toLocaleString('vi-VN')}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{order.storeName}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-primary">{currencyFormat(order.totalPrice)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total</p>
                          <div className="mt-2 space-y-1">
                            <button
                              onClick={() => setSelectedOrderId(order.orderId)}
                              className="w-full text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors font-medium"
                            >
                              View Details
                            </button>
                            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => setCancelOrderId(order.orderId)}
                                className="w-full text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors font-medium"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Order Status Timeline */}
                  <div className="px-6 pb-4">
                    <OrderStatusTimeline status={order.status} />
                  </div>

                  

                  {/* Feedback Section - Use dedicated component */}
                  <OrderFeedbackSection 
                    orderId={order.orderId}
                    orderStatus={order.status}
                    onFeedbackSuccess={handleFeedbackSuccess}
                  />
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailTracking
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Cancel Order #{cancelOrderId}</h3>
              <button
                onClick={() => {
                  setCancelOrderId(null);
                  setCancelReason('');
                }}
                className="rounded-full p-1 hover:bg-muted transition-colors"
                disabled={cancelOrder.isPending}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for cancellation *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  disabled={cancelOrder.isPending}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCancelOrderId(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
                  disabled={cancelOrder.isPending}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim() || cancelOrder.isPending}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHistoryPage;
