import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { stepService, type Step } from '@/services/stepService';
import { menuItemsService, type MenuItem } from '@/services/menuItemsService';
import { storeService, type Store } from '@/services/storeService';
import { useAddCustomDishToOrder } from '@/hooks/useOrderCustomer';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/routes/route.constants';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ShoppingCart, Flame } from 'lucide-react';

interface SelectionMap {
  [stepId: number]: { menuItemId: number; quantity: number }[];
}

const currencyFormat = (v: number, currency: string) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'USD' ? 'USD' : 'VND' }).format(v);

const CustomOrder: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([]);
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<number, MenuItem[]>>({});
  const [current, setCurrent] = useState(0);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  
  // Order customer mutation
  const addDish = useAddCustomDishToOrder(selectedStoreId || 0);
  
  // Pagination for items (4 columns x 3 rows = 12 items per page)
  const ITEMS_PER_PAGE = 12;
  const [itemsPage, setItemsPage] = useState(0);

  // Load store list and set default selection
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storeService.getAll();
        if (!mounted) return;
        setStores(all);
        if (all.length > 0) setSelectedStoreId(all[0].id);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load stores');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch steps and menu items
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedStoreId) return;
      try {
        setLoading(true);
        setError(null);
        setSelection({});
        setCurrent(0);
        
        // Fetch all steps
        const allSteps = await stepService.getAll();
        if (!mounted) return;
        
        // Sort steps by stepNumber
        const sortedSteps = allSteps.sort((a, b) => a.stepNumber - b.stepNumber);
        setSteps(sortedSteps);
        
        // Fetch menu items for each category
        const menuItemsMap: Record<number, MenuItem[]> = {};
        for (const step of sortedSteps) {
          try {
            const items = await menuItemsService.searchMenuItems({
              categoryId: step.categoryId,
              size: 100,
            });
            menuItemsMap[step.categoryId] = items.items.filter(item => item.isActive);
          } catch (err) {
            console.error(`Failed to fetch items for category ${step.categoryId}:`, err);
            menuItemsMap[step.categoryId] = [];
          }
        }
        
        if (mounted) {
          setMenuItemsByCategory(menuItemsMap);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load custom builder');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedStoreId]);

  const currentStep = useMemo(() => steps[current], [steps, current]);
  const currentStepMenuItems = useMemo(() => {
    if (!currentStep) return [];
    return menuItemsByCategory[currentStep.categoryId] || [];
  }, [currentStep, menuItemsByCategory]);

  // Reset page when step changes
  useEffect(() => { setItemsPage(0); }, [currentStep?.id]);

  const totalItemPages = useMemo(() => Math.ceil(currentStepMenuItems.length / ITEMS_PER_PAGE), [currentStepMenuItems.length]);
  const paginatedItems = useMemo(() => {
    const start = itemsPage * ITEMS_PER_PAGE;
    return currentStepMenuItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentStepMenuItems, itemsPage]);

  const total = useMemo(() => {
    let sum = 0;
    for (const stepId in selection) {
      const picks = selection[stepId] || [];
      for (const pick of picks) {
        // Find the menu item across all categories
        for (const categoryId in menuItemsByCategory) {
          const item = menuItemsByCategory[categoryId].find(m => m.id === pick.menuItemId);
          if (item) {
            sum += item.price * (pick.quantity || 1);
            break;
          }
        }
      }
    }
    return sum;
  }, [selection, menuItemsByCategory]);

  const totalKcal = useMemo(() => {
    let kcal = 0;
    for (const stepId in selection) {
      const picks = selection[stepId] || [];
      for (const pick of picks) {
        // Find the menu item across all categories
        for (const categoryId in menuItemsByCategory) {
          const item = menuItemsByCategory[categoryId].find(m => m.id === pick.menuItemId);
          if (item) {
            kcal += (item.cal || 0) * (pick.quantity || 1);
            break;
          }
        }
      }
    }
    return kcal;
  }, [selection, menuItemsByCategory]);

  const toggleOption = (item: MenuItem) => {
    if (!currentStep) return;
    
    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      const isSelected = idx >= 0;

      // For now, allow multiple selections
      if (isSelected) {
        const copy = curr.slice();
        copy.splice(idx, 1);
        return { ...prev, [currentStep.id]: copy };
      } else {
        return { ...prev, [currentStep.id]: [...curr, { menuItemId: item.id, quantity: 1 }] };
      }
    });
  };

  const inc = (item: MenuItem) => {
    if (!currentStep) return;
    
    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + 1 };
      return { ...prev, [currentStep.id]: copy };
    });
  };

  const dec = (item: MenuItem) => {
    if (!currentStep) return;
    
    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      const nextQ = (copy[idx].quantity || 1) - 1;
      if (nextQ <= 0) copy.splice(idx, 1);
      else copy[idx] = { ...copy[idx], quantity: nextQ };
      return { ...prev, [currentStep.id]: copy };
    });
  };

  const canNext = useMemo(() => {
    if (!currentStep) return false;
    
    // Allow skipping any step - user can choose not to select items
    return true;
  }, [currentStep, selection]);

  const prevItemsPage = () => setItemsPage(p => Math.max(0, p - 1));
  const nextItemsPage = () => setItemsPage(p => Math.min(totalItemPages - 1, p + 1));

  const next = () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const hasAnySelection = useMemo(() => {
    // Check if user has selected at least one item in any step
    return Object.values(selection).some(picks => picks.length > 0);
  }, [selection]);

  const handleDone = () => {
    if (!hasAnySelection) {
      toast.error('Vui lòng chọn ít nhất một món');
      return;
    }
    // Directly place order instead of showing summary modal
    placeOrder();
  };

  const placeOrder = () => {
    if (!selectedStoreId) return;

    const selections = Object.entries(selection)
      .filter(([_, picks]) => picks.length > 0) // Filter out empty selections
      .map(([stepId, picks]) => ({
        stepId: Number(stepId),
        items: picks.map((pick: { menuItemId: number; quantity: number }) => ({
          menuItemId: pick.menuItemId,
          quantity: pick.quantity || 1,
        })),
      }));

    // Add custom bowl to order
    addDish.mutate(
      {
        storeId: selectedStoreId,
        note: note.trim() || 'Custom bowl',
        selections,
        isCustom: true,
      },
      {
        onSuccess: () => {
          // Reset builder
          setSelection({});
          setCurrent(0);
          setNote('');
          // Show success toast
          toast.success('Custom bowl added to order!', {
            description: 'Your custom dish has been added successfully.',
            duration: 3000,
          });
          // Optionally navigate to menu or cart
          // navigate(APP_ROUTES.MENU);
        },
        onError: (error: any) => {
          console.error('Failed to add custom bowl:', error);
          
          // Handle 401 Unauthorized
          if (error.response?.status === 401) {
            toast.error('Authentication required', {
              description: 'Please login to add items to cart',
              duration: 4000,
            });
            // Optional: Trigger login modal
            window.dispatchEvent(new CustomEvent('auth:login-required'));
          } else {
            toast.error('Failed to add to order', {
              description: 'Please try again or contact support.',
              duration: 4000,
            });
          }
        },
      }
    );
  };

  return (
    <>
      <Navbar />
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-8 overflow-x-hidden">
        <div className="w-[95vw] lg:w-[80vw] mx-auto overflow-x-hidden">
          {/* Header - Compact */}
          <div className="text-center mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Build Your Perfect Bowl</h1>
            <p className="text-sm text-gray-600">Customize your meal step by step</p>
          </div>

          {/* Store selector - Compact */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <label className="text-xs lg:text-sm font-medium text-gray-700">Store:</label>
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              value={selectedStoreId ?? ''}
              onChange={(e) => setSelectedStoreId(Number(e.target.value) || null)}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-center text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
              <p className="mt-4 text-gray-600">Loading your custom builder...</p>
            </div>
          ) : (
            <>
              {/* Desktop Layout (Horizontal) - ưu tiên cho màn hình ngang */}
              <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-4 lg:items-start">
                {/* Left Side: Step Builder */}
                <div className="space-y-4 min-w-0">
                  {/* Progress Indicator - More Compact */}
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Step {current + 1} of {steps.length}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(((current + 1) / steps.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${((current + 1) / steps.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      {steps.map((s, idx) => (
                        <div key={s.id} className="flex flex-col items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                            idx === current 
                              ? 'bg-red-600 text-white scale-110 shadow-md' 
                              : idx < current 
                              ? 'bg-red-400 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {idx < current ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-0.5 font-medium truncate max-w-[100px] ${
                            idx === current ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {s.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Step Display */}
                  {currentStep && (
                    <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden w-full max-w-full">
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl lg:text-2xl font-bold text-red-600 uppercase tracking-wide">
                            {currentStep.name}
                          </h2>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{currentStep.description}</p>
                      </div>
                      
                      {/* Items Grid - 4 columns x 3 rows pagination */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                          {paginatedItems.map(item => {
                            const picks = selection[currentStep.id] || [];
                            const picked = picks.find(p => p.menuItemId === item.id);
                            const isSelected = !!picked;
                            return (
                              <div
                                key={item.id}
                                className={`flex bg-white border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer relative ${isSelected ? 'border-red-600 border-dashed' : 'border-gray-200 border-solid'}`}
                                onClick={() => toggleOption(item)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOption(item); } }}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                              >
                                <div className="w-20 h-20 rounded-full overflow-visible flex-shrink-0 bg-white shadow-sm mr-3 ring-1 ring-gray-200 relative">
                                  <img
                                    src={item.imageUrl || '/images/placeholder.svg'}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg'; }}
                                  />
                                  {/* Calories badge overlay on image - bottom left */}
                                  <div className="absolute bottom-0 left-0 bg-orange-500/95 backdrop-blur-sm text-white rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-lg z-10">
                                    <Flame className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">{item.cal || 0}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col justify-between flex-1 min-w-0">
                                  <div>
                                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-red-600' : 'text-gray-800'}`}>{item.name}</h3>
                                    <div className="text-xs mt-1">
                                      <span className="font-semibold text-red-600">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="flex items-center gap-2 pt-2">
                                      <button
                                        className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 font-bold transition active:scale-95"
                                        onClick={(e) => { e.stopPropagation(); dec(item); }}
                                      >
                                        −
                                      </button>
                                      <span className="font-bold text-gray-800 text-sm min-w-[24px] text-center">{picked?.quantity || 1}</span>
                                      <button
                                        className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 font-bold transition active:scale-95"
                                        onClick={(e) => { e.stopPropagation(); inc(item); }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                  {!isSelected && (
                                    <div className="pt-2 text-[11px] text-gray-400">Click to select</div>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {paginatedItems.length === 0 && (
                            <div className="col-span-full text-center py-10 text-sm text-gray-400">No items available</div>
                          )}
                        </div>
                        {totalItemPages > 1 && (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={prevItemsPage}
                              disabled={itemsPage === 0}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-medium bg-white hover:bg-red-50 disabled:opacity-40"
                            >
                              <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <div className="text-xs font-semibold">Page {itemsPage + 1} / {totalItemPages}</div>
                            <button
                              onClick={nextItemsPage}
                              disabled={itemsPage === totalItemPages - 1}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-medium bg-white hover:bg-red-50 disabled:opacity-40"
                            >
                              Next <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons - Desktop */}
                  <div className="hidden lg:flex items-center justify-between gap-3">
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      onClick={back}
                      disabled={current === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>

                    {current === steps.length - 1 ? (
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 font-semibold text-sm text-white hover:from-red-700 hover:to-red-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDone}
                        disabled={!hasAnySelection}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 font-semibold text-sm text-white hover:from-red-700 hover:to-red-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={next}
                        disabled={!canNext}
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Summary Panel - Sticky on desktop */}
                <div className="lg:sticky lg:top-20 mt-4 lg:mt-0">
                  <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-red-600" />
                      Your Selection
                    </h3>

                    {/* Summary Items */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto mb-3">
                      {steps.map((s) => {
                        const picks = selection[s.id] || [];
                        if (picks.length === 0) return null;
                        const stepMenuItems = menuItemsByCategory[s.categoryId] || [];
                        return (
                          <div key={s.id} className="border-b border-gray-100 pb-2.5">
                            <div className="font-semibold text-red-600 text-xs mb-1.5">{s.name}</div>
                            <ul className="space-y-1">
                              {picks.map((p) => {
                                const menuItem = stepMenuItems.find((x) => x.id === p.menuItemId);
                                if (!menuItem) return null;
                                return (
                                  <li key={p.menuItemId} className="flex items-center justify-between text-xs text-gray-700">
                                    <span className="flex-1 line-clamp-1">
                                      {menuItem.name}
                                      {p.quantity > 1 && (
                                        <span className="text-red-600 font-semibold ml-1">×{p.quantity}</span>
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                      {new Intl.NumberFormat('vi-VN').format(menuItem.price * p.quantity)}đ
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                      
                      {Object.keys(selection).length === 0 && (
                        <p className="text-gray-400 text-xs text-center py-6">
                          No items selected yet
                        </p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 pt-3 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between text-gray-700 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">Calories</span>
                        </span>
                        <span className="font-bold">{totalKcal}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-900 pt-1">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-xl font-bold text-red-600">
                          {currencyFormat(total, 'VND')}
                        </span>
                      </div>
                    </div>

                    {/* Note input - Below Summary */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <label className="text-sm font-semibold text-gray-900 mb-2 block">
                        Note
                      </label>
                      <textarea
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:border-dashed transition resize-none"
                        placeholder="Add special instructions or notes..."
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={500}
                      />
                      <span className="text-xs text-gray-500 mt-1 block text-right">{note.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Buttons - shown only on mobile */}
              <div className="lg:hidden flex items-center justify-between gap-3 mt-4">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={back}
                  disabled={current === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {current === steps.length - 1 ? (
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 font-semibold text-sm text-white hover:from-red-700 hover:to-red-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDone}
                    disabled={!hasAnySelection}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 font-semibold text-sm text-white hover:from-red-700 hover:to-red-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={next}
                    disabled={!canNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default CustomOrder;
