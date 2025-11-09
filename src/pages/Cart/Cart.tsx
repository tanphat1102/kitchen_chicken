import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PromotionSelector } from '@/components/PromotionSelector';
import { useCurrentOrder, useUpdateDish, useDeleteDish } from '@/hooks/useOrderCustomer';
import { useConfirmOrder } from '@/hooks/useOrderPayment';
import { useQuery } from '@tanstack/react-query';
import { paymentMethodService, promotionService } from '@/services';
import type { Order } from '@/services';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '@/routes/route.constants';
import { useAuth } from '@/contexts/AuthContext';

const currencyFormat = (value: number) => {
  const numValue = Number(value) || 0;
  if (isNaN(numValue)) return '0 ₫';
  return numValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const CartPage: React.FC = () => {
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null);
  const [selectedDishIds, setSelectedDishIds] = useState<Set<number>>(new Set());
  const { currentUser } = useAuth();
  
  // Only fetch order if user is logged in
  const { data: order, isLoading, error } = useCurrentOrder(storeId, !!currentUser);
  
  const updateDish = useUpdateDish(storeId);
  const deleteDish = useDeleteDish(storeId);
  const confirmOrder = useConfirmOrder();

  const dishes = order?.dishes || [];
  const isEmpty = !order || dishes.length === 0;

  // Auto-select all items when cart loads
  React.useEffect(() => {
    if (dishes.length > 0 && selectedDishIds.size === 0) {
      setSelectedDishIds(new Set(dishes.map(d => d.dishId)));
    }
  }, [dishes.length]); // Only run when dishes count changes

  // Calculate selected items total
  const selectedDishes = React.useMemo(() => {
    return dishes.filter(d => selectedDishIds.has(d.dishId));
  }, [dishes, selectedDishIds]);
  
  const selectedTotal = React.useMemo(() => {
    const total = selectedDishes.reduce((sum, dish) => {
      const price = Number(dish.price) || 0;
      const quantity = Number(dish.quantity) > 0 ? Number(dish.quantity) : 1;
      const itemTotal = price * quantity;
      const newSum = sum + itemTotal;
      return isNaN(newSum) ? sum : newSum;
    }, 0);
    
    return isNaN(total) ? 0 : total;
  }, [selectedDishes]);
  
  const allSelected = dishes.length > 0 && selectedDishIds.size === dishes.length;
  const someSelected = selectedDishIds.size > 0 && selectedDishIds.size < dishes.length;
  
  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentMethodService.getAll(),
    enabled: !!currentUser,
  });

  // Fetch selected promotion details
  const { data: selectedPromotion } = useQuery({
    queryKey: ['promotion', selectedPromotionId],
    queryFn: () => promotionService.getById(selectedPromotionId!),
    enabled: !!selectedPromotionId,
  });

  // Calculate discount amount
  const discountAmount = React.useMemo(() => {
    if (!selectedPromotion || !selectedTotal || isNaN(selectedTotal)) return 0;
    
    if (selectedPromotion.discountType === 'PERCENT') {
      const discount = (selectedTotal * selectedPromotion.discountValue) / 100;
      return isNaN(discount) ? 0 : discount;
    }
    const discount = Number(selectedPromotion.discountValue) || 0;
    return isNaN(discount) ? 0 : discount;
  }, [selectedPromotion, selectedTotal]);

  // Calculate final total
  const finalTotal = React.useMemo(() => {
    const total = selectedTotal - discountAmount;
    return isNaN(total) ? 0 : Math.max(0, total);
  }, [selectedTotal, discountAmount]);

  const handleCheckout = () => {
    if (!order) {
      alert('No order found. Please add items to cart first.');
      return;
    }

    if (!order.orderId) {
      alert('Order ID is missing. Please try refreshing the page.');
      return;
    }

    if (selectedDishIds.size === 0) {
      alert('Please select at least one item to checkout.');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const checkoutPayload = {
      orderId: order.orderId,
      paymentMethodId: selectedPaymentMethod,
      promotionId: selectedPromotionId || undefined,
      channel: 'WEB',
    };

    confirmOrder.mutate(checkoutPayload, {
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
        alert(`Checkout failed: ${errorMessage}`);
      },
    });
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDishIds(new Set(dishes.map(d => d.dishId)));
    } else {
      setSelectedDishIds(new Set());
    }
  };

  const handleToggleDish = (dishId: number) => {
    const newSelected = new Set(selectedDishIds);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      newSelected.add(dishId);
    }
    setSelectedDishIds(newSelected);
  };

  // Handle ingredient quantity change directly
  const handleIngredientQuantityChange = (dishId: number, stepId: number, optionId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const dish = dishes.find(d => d.dishId === dishId);
    if (!dish) return;
    
    // Handle both "selections" and "steps" data structures
    let allSelections: any[] = [];
    
    if (dish.selections && dish.selections.length > 0) {
      allSelections = dish.selections;
    } 
    else if ((dish as any).steps && (dish as any).steps.length > 0) {
      allSelections = (dish as any).steps.flatMap((step: any) => 
        (step.items || []).map((item: any) => ({
          stepId: step.stepId,
          stepName: step.stepName,
          optionId: item.menuItemId,
          optionName: item.menuItemName,
          quantity: item.quantity,
          extraPrice: item.extraPrice || 0,
        }))
      );
    } else {
      return;
    }
    
    // Create updated selections
    const updatedSelections = allSelections.map(sel => {
      if (sel.stepId === stepId && sel.optionId === optionId) {
        return { ...sel, quantity: newQuantity };
      }
      return sel;
    }).filter(sel => sel.quantity > 0);
    
    if (updatedSelections.length === 0) {
      alert('Cannot remove all ingredients. At least one ingredient is required.');
      return;
    }
    
    // Convert to API format
    const groupedByStep = updatedSelections.reduce((acc, sel) => {
      const existing = acc.find((s: any) => s.stepId === sel.stepId);
      if (existing) {
        existing.items.push({
          menuItemId: sel.optionId,
          quantity: sel.quantity,
        });
      } else {
        acc.push({
          stepId: sel.stepId,
          items: [{
            menuItemId: sel.optionId,
            quantity: sel.quantity,
          }],
        });
      }
      return acc;
    }, [] as any[]);
    
    // Update via API
    updateDish.mutate(
      {
        dishId,
        request: { selections: groupedByStep },
      },
      {
        onError: (error: any) => {
          alert(`Failed to update: ${error.response?.data?.message || error.message}`);
        },
      }
    );
  };

  // Show login required if not logged in - check FIRST before loading/error
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
            <p className="text-red-600">Error loading cart: {(error as any)?.message || 'Unknown error'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                {/* Select All Header */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Select All ({selectedDishIds.size}/{dishes.length})
                    </span>
                  </label>
                  <span className="text-sm text-gray-600">
                    Selected Total: <span className="font-semibold text-red-600">{currencyFormat(selectedTotal)}</span>
                  </span>
                </div>

                <div className="divide-y divide-gray-200">
                  {dishes.map((dish) => {
                    const isSelected = selectedDishIds.has(dish.dishId);
                    const dishQuantity = Number(dish.quantity) > 0 ? Number(dish.quantity) : 1;
                    
                    // Debug log for dish structure
                    console.log('Dish structure:', {
                      id: dish.dishId,
                      name: dish.menuItemName,
                      hasSelections: !!dish.selections,
                      selectionsLength: dish.selections?.length || 0,
                      selections: dish.selections,
                      hasSteps: !!(dish as any).steps,
                      stepsLength: (dish as any).steps?.length || 0,
                    });
                    
                    return (
                      <div 
                        key={dish.dishId} 
                        className={`p-6 transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-red-50 to-orange-50 shadow-sm' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleDish(dish.dishId)}
                              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer transition-transform hover:scale-110"
                            />
                          </div>

                          {/* Image */}
                          <div className="w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-md">
                            <img
                              src={dish.imageUrl || 'https://via.placeholder.com/150'}
                              alt={dish.menuItemName}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                                {dish.menuItemName}
                              </h3>
                              {/* Calories Badge */}
                              {dish.cal && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium mt-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                  </svg>
                                  {dish.cal} cal
                                </div>
                              )}
                              {dish.note && (
                                <div className="flex items-center gap-2 mt-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  <p className="text-sm text-gray-600 italic">{dish.note}</p>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-2xl font-bold text-red-600">
                                {currencyFormat(dish.price)}
                              </p>
                              {dishQuantity > 1 && (
                                <p className="text-xs text-gray-500 mt-1">× {dishQuantity} bowls</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Steps (alternative structure from backend) */}
                          {(dish as any).steps && (dish as any).steps.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Customizations</p>
                              <div className="space-y-4">
                                {(dish as any).steps.map((step: any, stepIdx: number) => (
                                  <div key={stepIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-white px-3 py-2 border-b border-gray-100">
                                      <p className="text-xs font-semibold text-gray-700">{step.stepName}</p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      {step.items?.map((item: any, itemIdx: number) => (
                                        <div
                                          key={itemIdx}
                                          className="flex items-center justify-between group hover:bg-gray-50 px-2 py-2 rounded-lg transition-colors"
                                        >
                                          <div className="flex-1 flex items-center gap-3">
                                            {/* Item Image */}
                                            {item.imageUrl && (
                                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                  src={item.imageUrl}
                                                  alt={item.menuItemName}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                  }}
                                                />
                                              </div>
                                            )}
                                            {!item.imageUrl && (
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                                            )}
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm text-gray-800 font-medium">{item.menuItemName}</span>
                                                {item.cal && (
                                                  <span className="text-xs text-orange-600 font-medium px-1.5 py-0.5 bg-orange-50 rounded">
                                                    {item.cal} cal
                                                  </span>
                                                )}
                                              </div>
                                              {item.extraPrice > 0 && (
                                                <span className="text-xs text-green-600 font-semibold">
                                                  +{item.extraPrice.toLocaleString('vi-VN')}₫
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleIngredientQuantityChange(dish.dishId, step.stepId, item.menuItemId, item.quantity - 1);
                                              }}
                                              className="w-7 h-7 rounded-full bg-white border-2 border-red-500 flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white active:scale-90 transition-all text-base font-bold shadow-sm"
                                              title="Decrease quantity"
                                            >
                                              −
                                            </button>
                                            <span className="font-bold text-gray-800 text-sm min-w-[28px] text-center">
                                              ×{item.quantity}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleIngredientQuantityChange(dish.dishId, step.stepId, item.menuItemId, item.quantity + 1);
                                              }}
                                              className="w-7 h-7 rounded-full bg-white border-2 border-green-500 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white active:scale-90 transition-all text-base font-bold shadow-sm"
                                              title="Increase quantity"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm font-semibold text-red-600">
                            {currencyFormat(dish.price)}
                            {dishQuantity > 1 && ` × ${dishQuantity}`}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-200">
                            <button
                              onClick={() => {
                                if (dishQuantity > 1) {
                                  alert('Quantity update coming soon. Please remove and re-add item with desired quantity.');
                                } else {
                                  if (confirm(`Remove ${dish.menuItemName} from cart?`)) {
                                    deleteDish.mutate(dish.dishId);
                                  }
                                }
                              }}
                              disabled={updateDish.isPending || deleteDish.isPending}
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-700 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-gray-200"
                              title="Decrease quantity"
                            >
                              <span className="text-lg font-bold">−</span>
                            </button>
                            <span className="font-bold text-gray-900 min-w-[32px] text-center text-lg">
                              {dishQuantity}
                            </span>
                            <button
                              onClick={() => {
                                alert('Quantity update coming soon. Please add the same item again to increase quantity.');
                              }}
                              disabled={updateDish.isPending || deleteDish.isPending}
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-700 hover:from-gray-100 hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 border border-gray-200"
                              title="Increase quantity"
                            >
                              <span className="text-lg font-bold">+</span>
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${dish.menuItemName} from cart?`)) {
                                deleteDish.mutate(dish.dishId);
                              }
                            }}
                            disabled={deleteDish.isPending}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors group"
                          >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deleteDish.isPending ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal ({selectedDishIds.size} items selected)</span>
                    <span className="font-semibold">{currencyFormat(selectedTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Promotion Discount</span>
                      <span className="font-semibold">-{currencyFormat(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-red-600">
                      {currencyFormat(finalTotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-sm text-green-600 text-right">
                      You save {currencyFormat(discountAmount)}!
                    </div>
                  )}
                  {selectedDishIds.size === 0 && (
                    <div className="text-sm text-amber-600 text-center bg-amber-50 p-2 rounded">
                      Please select items to checkout
                    </div>
                  )}
                </div>

                {/* Promotion Selector */}
                <PromotionSelector
                  selectedPromotionId={selectedPromotionId}
                  onSelectPromotion={setSelectedPromotionId}
                  orderTotal={selectedTotal}
                />

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      // Determine payment provider icon based on method name
                      const isVNPay = method.name.toLowerCase().includes('vnpay');
                      const isMoMo = method.name.toLowerCase().includes('momo');
                      
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-red-600 bg-red-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="mr-4 w-5 h-5 text-red-600 focus:ring-red-500"
                          />
                          
                          {/* Payment Icon */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                            isVNPay ? 'bg-blue-100' :
                            isMoMo ? 'bg-pink-100' :
                            'bg-gray-100'
                          }`}>
                            {isVNPay && (
                              <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h10v2H7V9zm0 4h7v2H7v-2z"/>
                              </svg>
                            )}
                            {isMoMo && (
                              <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                              </svg>
                            )}
                            {!isVNPay && !isMoMo && (
                              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Payment Details */}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                              {method.name}
                              {isMoMo }
                            </div>
                            {method.description && (
                              <div className="text-sm text-gray-500 mt-0.5">{method.description}</div>
                            )}
                          </div>
                          
                          {/* Selected Indicator */}
                          {selectedPaymentMethod === method.id && (
                            <div className="ml-2">
                              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={
                    !selectedPaymentMethod || 
                    confirmOrder.isPending || 
                    !order?.orderId || 
                    isLoading || 
                    selectedDishIds.size === 0
                  }
                >
                  {confirmOrder.isPending 
                    ? 'Processing...' 
                    : !order?.orderId 
                    ? 'Loading order...'
                    : selectedDishIds.size === 0
                    ? 'Select items to checkout'
                    : `Proceed to Checkout (${selectedDishIds.size} items)`}
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
      
      {/* Payment Processing Overlay */}
      {confirmOrder.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we redirect you to the payment gateway...</p>
            <p className="text-sm text-gray-500 mt-4">Do not close this window</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
