import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCurrentOrder, useUpdateDish, useDeleteDish } from '@/hooks/useOrderCustomer';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '@/routes/route.constants';
import { useAuth } from '@/contexts/AuthContext';

const currencyFormat = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const CartPage: React.FC = () => {
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const { currentUser } = useAuth();
  
  // Only fetch order if user is logged in
  const { data: order, isLoading, error } = useCurrentOrder(storeId, !!currentUser);
  const updateDish = useUpdateDish(storeId);
  const deleteDish = useDeleteDish(storeId);

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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your cart and place orders</p>
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
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    // Handle 401 specifically
    if ((error as any).response?.status === 401) {
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login Required</h2>
              <p className="text-gray-600 mb-6">Please login to view your cart</p>
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
    
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading cart: {error.message}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const dishes = order?.dishes || [];
  const isEmpty = dishes.length === 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Cart</h1>
            <p className="text-gray-600">
              {isEmpty ? 'Your cart is empty' : `${dishes.length} item${dishes.length > 1 ? 's' : ''} in cart`}
            </p>
          </div>

          {isEmpty ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <Link
                to={APP_ROUTES.MENU}
                className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="divide-y divide-gray-200">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={dish.imageUrl || 'https://via.placeholder.com/150'}
                            alt={dish.menuItemName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {dish.menuItemName}
                          </h3>
                          {dish.note && (
                            <p className="text-sm text-gray-500 mb-2">Note: {dish.note}</p>
                          )}
                          
                          {/* Selections */}
                          {dish.selections && dish.selections.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Customizations:</p>
                              <div className="flex flex-wrap gap-1">
                                {dish.selections.map((sel, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                  >
                                    {sel.optionName} {sel.quantity > 1 && `×${sel.quantity}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm font-semibold text-red-600">
                            {currencyFormat(dish.price)}
                            {dish.quantity > 1 && ` × ${dish.quantity}`}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        {/* TODO: Backend UpdateDishRequest doesn't support quantity field */}
                        {/* Need to delete and re-add dish to change quantity */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 opacity-50 cursor-not-allowed" title="Quantity update not supported. Please remove and re-add item.">
                            <button
                              disabled
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="font-semibold text-gray-800 min-w-[24px] text-center">
                              {dish.quantity}
                            </span>
                            <button
                              disabled
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${dish.menuItemName} from cart?`)) {
                                deleteDish.mutate(dish.id);
                              }
                            }}
                            disabled={deleteDish.isPending}
                            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                          >
                            {deleteDish.isPending ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{currencyFormat(order?.totalPrice || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-red-600">
                      {currencyFormat(order?.totalPrice || 0)}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
                  onClick={() => alert('Checkout feature coming soon!')}
                >
                  Proceed to Checkout
                </button>

                <Link
                  to={APP_ROUTES.MENU}
                  className="block text-center mt-4 text-red-600 hover:text-red-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
