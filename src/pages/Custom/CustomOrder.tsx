import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { builderService } from '@/services/builderService';
import { storeService, type Store } from '@/services/storeService';
import useEmblaCarousel from 'embla-carousel-react';
import { CustomOrderSummary } from '@/components/CustomOrderSummary';

interface Option {
  id: number;
  name: string;
  price: number; //VND
  cal?: number;
  imageUrl?: string;
}

interface StepDef {
  id: number;
  name: string;
  code: 'CARB' | 'PROTEIN' | 'VEGETABLE' | 'SAUCE' | 'DAIRY' | 'FRUIT' | string;
  description?: string;
  min: number;
  max: number;
  options: Option[];
}

interface BuilderData {
  currency: 'VND' | 'USD' | string;
  basePrice: number;
  steps: StepDef[];
}

interface SelectionMap {
  [stepId: number]: { optionId: number; quantity: number }[];
}

const currencyFormat = (v: number, currency: string) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'USD' ? 'USD' : 'VND' }).format(v);

const CustomOrder: React.FC = () => {
  const [data, setData] = useState<BuilderData | null>(null);
  const [current, setCurrent] = useState(0);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Embla carousel with smooth animations
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    skipSnaps: false,
    duration: 25, // Smooth animation duration
    dragFree: false, // Snap to slides
  });

  // Track selected index for animations
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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

  // Fetch builder data when store selection changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedStoreId) return;
      try {
        setError(null);
        setData(null);
        setSelection({});
        setCurrent(0);
        const result = await builderService.getBuilderData({ storeId: selectedStoreId });
        if (mounted) setData(result as unknown as BuilderData);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load custom builder');
      }
    })();
    return () => { mounted = false; };
  }, [selectedStoreId]);

  const step = useMemo(() => (data ? data.steps[current] : undefined), [data, current]);

  const total = useMemo(() => {
    if (!data) return 0;
    let sum = data.basePrice;
    for (const s of data.steps) {
      const picks = selection[s.id] || [];
      for (const p of picks) {
        const opt = s.options.find((o) => o.id === p.optionId);
        if (opt) sum += opt.price * (p.quantity || 1);
      }
    }
    return sum;
  }, [data, selection]);

  const totalKcal = useMemo(() => {
    if (!data) return 0;
    let kcal = 0;
    for (const s of data.steps) {
      const picks = selection[s.id] || [];
      for (const p of picks) {
        const opt = s.options.find((o) => o.id === p.optionId);
        if (opt) kcal += (opt.cal || 0) * (p.quantity || 1);
      }
    }
    return kcal;
  }, [data, selection]);

  const toggleOption = (s: StepDef, opt: Option) => {
    setSelection((prev) => {
      const curr = prev[s.id] || [];
      const idx = curr.findIndex((x) => x.optionId === opt.id);
      const selectedCount = curr.length;
      const isSelected = idx >= 0;

      // Enforce min/max and single-select cases
      if (s.max === 1) {
        // Single-select: replace or remove
        if (isSelected) {
          return { ...prev, [s.id]: [] };
        } else {
          return { ...prev, [s.id]: [{ optionId: opt.id, quantity: 1 }] };
        }
      }

      // Multi-select
      if (!isSelected) {
        if (selectedCount >= s.max) return prev; 
        return { ...prev, [s.id]: [...curr, { optionId: opt.id, quantity: 1 }] };
      } else {
        const copy = curr.slice();
        copy.splice(idx, 1);
        return { ...prev, [s.id]: copy };
      }
    });
  };

  const inc = (s: StepDef, opt: Option) => {
    setSelection((prev) => {
      const curr = prev[s.id] || [];
      const idx = curr.findIndex((x) => x.optionId === opt.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + 1 };
      return { ...prev, [s.id]: copy };
    });
  };

  const dec = (s: StepDef, opt: Option) => {
    setSelection((prev) => {
      const curr = prev[s.id] || [];
      const idx = curr.findIndex((x) => x.optionId === opt.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      const nextQ = (copy[idx].quantity || 1) - 1;
      if (nextQ <= 0) copy.splice(idx, 1);
      else copy[idx] = { ...copy[idx], quantity: nextQ };
      return { ...prev, [s.id]: copy };
    });
  };

  const canNext = useMemo(() => {
    if (!step) return false;
    const picks = selection[step.id] || [];
    return picks.length >= step.min && picks.length <= step.max;
  }, [step, selection]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const next = () => {
    if (!data) return;
    if (current < data.steps.length - 1 && canNext) setCurrent((c) => c + 1);
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const handleDone = () => {
    if (!canNext) return;
    setShowSummary(true);
  };

  const placeOrder = () => {
    console.log('Custom order payload', {
      items: selection,
      total,
      currency: data?.currency || 'VND',
    });
    alert('Order placed (demo)');
    setShowSummary(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Build Your Perfect Bowl</h1>
            <p className="text-gray-600">Customize your meal step by step</p>
          </div>

          {/* Store selector */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select Store:</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={selectedStoreId ?? ''}
              onChange={(e) => setSelectedStoreId(Number(e.target.value) || null)}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-center">
              {error}
            </div>
          )}

          {!data ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">Loading your custom builder...</p>
            </div>
          ) : (
            <>
              {/* Current Step Display */}
              {step && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-red-600 mb-2 uppercase tracking-wide">
                      {step.name}:
                    </h2>
                    {step.description && (
                      <p className="text-gray-600 mb-4">{step.description}</p>
                    )}
                    
                    {/* Carousel Container */}
                    <div className="relative mt-8">
                      {/* Carousel Viewport */}
                      <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-6">
                          {step.options.map((opt, optIndex) => {
                            const picks = selection[step.id] || [];
                            const picked = picks.find((p) => p.optionId === opt.id);
                            const isSelected = !!picked;
                            
                            return (
                              <div
                                key={opt.id}
                                className="flex-[0_0_33.333%] min-w-0 px-2"
                              >
                                <div
                                  className="flex flex-col items-center cursor-pointer group transition-transform duration-300"
                                  onClick={() => toggleOption(step, opt)}
                                >
                                  {/* Bowl Circle - Single element approach */}
                                  <div className="relative mb-6">
                                    {/* Outer glow effect when selected */}
                                    {isSelected && (
                                      <div className="absolute -inset-4 rounded-full bg-red-400 opacity-20 blur-2xl animate-pulse" />
                                    )}
                                    
                                    {/* Main bowl container with perfect circle border */}
                                    <div className="relative w-56 h-56">
                                      {/* Red circle border (when selected) or gray (when not) */}
                                      <div
                                        className={`absolute inset-0 rounded-full transition-all duration-300 ${
                                          isSelected
                                            ? 'bg-red-600 shadow-2xl'
                                            : 'bg-gray-200 group-hover:bg-gray-300 group-hover:shadow-xl'
                                        }`}
                                      />
                                      
                                      {/* White inner circle */}
                                      <div className="absolute inset-2 rounded-full bg-white shadow-inner flex items-center justify-center">
                                        {/* Image container */}
                                        <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-50 shadow-md">
                                          <img
                                            src={opt.imageUrl || '/images/placeholder.svg'}
                                            alt={opt.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    {isSelected && (
                                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white rounded-full shadow-xl px-4 py-2 border-2 border-red-600 animate-fadeIn">
                                        <button
                                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 font-bold transition-all hover:scale-110 active:scale-95"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            dec(step, opt);
                                          }}
                                        >
                                          −
                                        </button>
                                        <span className="font-bold text-gray-800 min-w-[24px] text-center text-lg">
                                          {picked?.quantity || 1}
                                        </span>
                                        <button
                                          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 font-bold transition-all hover:scale-110 active:scale-95"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            inc(step, opt);
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Selection checkmark */}
                                    {isSelected && (
                                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg animate-scaleIn z-10">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Option Name */}
                                  <h3 className={`text-2xl font-bold mb-1 transition-colors duration-300 text-center ${
                                    isSelected ? 'text-red-600' : 'text-gray-800'
                                  }`}>
                                    {opt.name}
                                  </h3>
                                  
                                  {/* Calories */}
                                  <p className="text-base text-gray-500 font-medium">{opt.cal || 0} calories</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Carousel Navigation Arrows with enhanced styling */}
                      <button
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/3 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl border-2 border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all hover:scale-110 active:scale-95 z-10 group"
                      >
                        <svg className="w-7 h-7 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={scrollNext}
                        className="absolute right-4 top-1/3 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-2xl border-2 border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all hover:scale-110 active:scale-95 z-10 group"
                      >
                        <svg className="w-7 h-7 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Carousel dots indicator */}
                      <div className="flex justify-center gap-2 mt-8">
                        {step.options.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => emblaApi?.scrollTo(idx)}
                            className={`transition-all duration-300 rounded-full ${
                              idx === selectedIndex
                                ? 'w-8 h-3 bg-red-600'
                                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Calories Display */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-red-600 uppercase">Total calories:</h3>
                  </div>
                  <div className="text-4xl font-bold text-gray-800">
                    {totalKcal}
                  </div>
                </div>
              </div>

              {/* Navigation & Action Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  className="px-8 py-3 rounded-full border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={back}
                  disabled={current === 0}
                >
                  ← Back
                </button>

                <div className="flex items-center gap-2">
                  {data.steps.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`w-3 h-3 rounded-full transition ${
                        idx === current
                          ? 'bg-red-600 scale-125'
                          : idx < current
                          ? 'bg-red-400'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {current === data.steps.length - 1 ? (
                  <button
                    className="px-8 py-3 rounded-full bg-red-600 font-semibold text-white hover:bg-red-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDone}
                    disabled={!canNext}
                  >
                    Done
                  </button>
                ) : (
                  <button
                    className="px-8 py-3 rounded-full bg-red-600 font-semibold text-white hover:bg-red-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={next}
                    disabled={!canNext}
                  >
                    Next →
                  </button>
                )}
              </div>

              {/* Summary Footer */}
              <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Your Selection Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {data.steps.map((s) => {
                    const picks = selection[s.id] || [];
                    if (picks.length === 0) return null;
                    return (
                      <div key={s.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="font-semibold text-red-600 mb-2">{s.name}</div>
                        <ul className="space-y-1 text-gray-600">
                          {picks.map((p) => {
                            const o = s.options.find((x) => x.id === p.optionId);
                            if (!o) return null;
                            return (
                              <li key={p.optionId}>
                                {o.name} {p.quantity > 1 ? `×${p.quantity}` : ''}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-700">Total Price:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {currencyFormat(total, data.currency)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Summary Modal */}
      {data && (
        <CustomOrderSummary
          open={showSummary}
          onClose={() => setShowSummary(false)}
          steps={data.steps}
          selection={selection}
          currency={data.currency}
          basePrice={data.basePrice}
          onAddToCart={placeOrder}
        />
      )}
      
      <Footer />
    </>
  );
};

export default CustomOrder;
