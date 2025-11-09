import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import dishService from '@/services/dishService';
import type { Dish, Nutrient } from '@/services/dishService';
import { useAddExistingDishToOrder } from '@/hooks/useOrderCustomer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const formatPrice = (price?: number) => {
  if (typeof price !== 'number') return '';
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  } catch {
    return `${price} đ`;
  }
};

function Badge({ children, color = 'orange' }: { children: React.ReactNode; color?: 'orange' | 'green' | 'blue' }) {
  const colors = {
    orange: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300',
    green: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
    blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl ${colors[color]} text-sm font-bold border shadow-sm`}>
      {children}
    </span>
  );
}

const MenuDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const [quantity, setQuantity] = useState(1);

  const addDishMutation = useAddExistingDishToOrder(storeId);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('Missing dish ID');
        const data = await dishService.getDishById(Number(id));
        if (mounted) setDish(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load dish');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [id]);

  const allNutrients = useMemo(() => {
    if (!dish?.nutrients) return [] as Nutrient[];
    return dish.nutrients;
  }, [dish]);

  const steps = dish?.steps ?? [];

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      window.dispatchEvent(new CustomEvent('auth:login-required'));
      return;
    }

    if (!dish?.id) {
      toast.error('Invalid dish');
      return;
    }

    addDishMutation.mutate(
      {
        storeId,
        dishId: dish.id,
        quantity,
      },
      {
        onSuccess: () => {
          toast.success(`Added ${dish.name} to cart! (x${quantity})`);
          // Optionally navigate to cart
          // navigate('/cart');
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Back button */}
          <div className="mb-6 animate-fadeIn mt-15">
            <Link 
              to="/menu" 
              className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 group"
            >
              <svg 
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Menu</span>
            </Link>
          </div>

          {loading && (
            <div className="text-center py-32 animate-fadeIn">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading dish details...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-32 bg-red-50 rounded-2xl border border-red-100 animate-fadeIn">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">Error: {error}</p>
            </div>
          )}

          {!loading && !error && dish && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Main content */}
              <section className="space-y-6">
                {/* Hero section */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-slideInLeft">
                  {/* Image */}
                  <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                    <img
                      src={dish.imageUrl || '/images/placeholder.png'}
                      alt={dish.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
                            {dish.name}
                          </h1>
                          <div className="flex items-center gap-4 flex-wrap">
                            {dish.cal && (
                              <Badge color="orange">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                {dish.cal} calories
                              </Badge>
                            )}
                            {dish.isCustom && (
                              <Badge color="blue">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Special Dish
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-800 text-sm font-semibold mb-1 opacity-90">Price</p>
                          <p className="text-3xl font-black text-red-800 drop-shadow-lg">{formatPrice(dish.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {dish.note && (
                    <div className="p-8">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">About This Dish</h2>
                          <p className="text-gray-600 leading-relaxed">{dish.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps section */}
                {steps.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-start gap-3 mb-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Build Your Dish</h2>
                    </div>
                    
                    <div className="space-y-6">
                      {steps.map((step, idx) => (
                        <div key={step.stepId} className="relative">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-3">{step.stepName}</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {step.items.map((item) => (
                                  <div 
                                    key={item.menuItemId} 
                                    className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 flex items-center gap-3"
                                  >
                                    {item.imageUrl && (
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                                      {item.cal && (
                                        <p className="text-xs text-gray-500">{item.cal} cal</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {idx < steps.length - 1 && (
                            <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 to-transparent"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Nutrition sidebar */}
              <aside className="space-y-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8 animate-slideInRight">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Nutrition Facts</h3>
                      <p className="text-sm text-gray-500 mt-1">Per serving</p>
                    </div>
                  </div>
                  
                  {allNutrients.length > 0 ? (
                    <div className="space-y-3">
                      {allNutrients.map((n) => (
                        <div 
                          key={n.id} 
                          className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-3 rounded-lg transition-colors duration-200"
                        >
                          <span className="font-semibold text-gray-700">{n.name}</span>
                          <span className="text-gray-900 font-bold">
                            {isFinite(n.quantity) ? n.quantity : '-'}
                            {n.baseUnit && <span className="text-sm text-gray-500 ml-1">{n.baseUnit}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No nutrition data available</p>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-orange-700">Note:</span> Nutritional information may vary slightly based on preparation and ingredients used.
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center font-bold text-lg transition-all"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-lg transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addDishMutation.isPending}
                    className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {addDishMutation.isPending ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-lg">Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.7s ease-out both;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.7s ease-out both;
        }
      `}</style>
    </>
  );
};

export default MenuDetailPage;