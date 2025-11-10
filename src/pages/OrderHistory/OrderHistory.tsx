import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useOrderHistory, useCreateFeedback, useOrderTracking, useOrderFeedback } from '@/hooks/useOrderCustomer';
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
      console.log('Comment:', feedback.comment);
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
                    <p>Comment: {feedback.comment || '(empty)'}</p>
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
                {feedback.comment && feedback.comment.trim() !== '' && (
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
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
                              order.orderStatusName === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              order.orderStatusName === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              order.orderStatusName === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatusName === 'READY' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatusName}
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
                          <button
                            onClick={() => setSelectedOrderId(order.orderId)}
                            className="mt-2 text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors font-medium"
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>

                  {/* Order Status Timeline */}
                  <div className="px-6 pb-4">
                    <OrderStatusTimeline status={order.orderStatusName} />
                  </div>

                  {/* Order Items */}
                  <div className="px-6 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Order Details</h4>
                      <span className="text-xs text-muted-foreground">
                        {order.dishes?.length || 0} dish{(order.dishes?.length || 0) !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    {order.dishes && order.dishes.length > 0 ? (
                      <div className="space-y-3">
                        {order.dishes.map((dish) => {
                          const dishTotal = dish.price * (dish.quantity || 1);
                          
                          return (
                            <div key={dish.id} className="rounded-lg border bg-muted/30 overflow-hidden">
                              {/* Dish Header */}
                              <div className="flex items-start gap-3 p-3 bg-background/50">
                                {dish.imageUrl && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                      src={dish.imageUrl}
                                      alt={dish.menuItemName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold leading-tight">{dish.menuItemName}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {currencyFormat(dish.price)} × {dish.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-bold text-primary shrink-0">
                                      {currencyFormat(dishTotal)}
                                    </p>
                                  </div>
                                  
                                  {dish.note && (
                                    <div className="mt-2 flex items-start gap-1.5 p-2 rounded-md bg-amber-50 border border-amber-200">
                                      <svg className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                      <p className="text-xs text-amber-800 leading-relaxed">{dish.note}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Customizations */}
                              {dish.selections && dish.selections.length > 0 && (
                                <div className="px-3 pb-3 pt-2 space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customizations</p>
                                  <div className="space-y-1.5">
                                    {/* Group selections by step */}
                                    {Object.entries(
                                      dish.selections.reduce((acc, sel) => {
                                        if (!acc[sel.stepName]) acc[sel.stepName] = [];
                                        acc[sel.stepName].push(sel);
                                        return acc;
                                      }, {} as Record<string, typeof dish.selections>)
                                    ).map(([stepName, selections]) => (
                                      <div key={stepName} className="text-xs">
                                        <p className="font-medium text-foreground mb-1">{stepName}:</p>
                                        <div className="flex flex-wrap gap-1.5 ml-2">
                                          {selections.map((sel) => (
                                            <span
                                              key={sel.id}
                                              className="inline-flex items-center gap-1 rounded-full bg-background border px-2.5 py-1"
                                            >
                                              <span className="font-medium">{sel.optionName}</span>
                                              <span className="text-muted-foreground">×{sel.quantity}</span>
                                              {sel.extraPrice > 0 && (
                                                <span className="text-green-600 font-semibold">
                                                  +{sel.extraPrice.toLocaleString()}₫
                                                </span>
                                              )}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No items in this order</p>
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
    </>
  );
};

export default OrderHistoryPage;
