import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { builderService } from '@/services/builderService';
import { storeService, type Store } from '@/services/storeService';

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

  const next = () => {
    if (!data) return;
    if (current < data.steps.length - 1 && canNext) setCurrent((c) => c + 1);
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const placeOrder = () => {
    console.log('Custom order payload', {
      items: selection,
      total,
      currency: data?.currency || 'VND',
    });
    alert('Order placed (demo)');
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 mt-15">
        <h1 className="text-2xl font-bold mb-2">Build Your Chicken Meal</h1>
        {/* Store selector */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">Store</label>
          <select
            className="border rounded-lg px-3 py-2 bg-white"
            value={selectedStoreId ?? ''}
            onChange={(e) => setSelectedStoreId(Number(e.target.value) || null)}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {data && (
          <div className="mb-4">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex items-start gap-2">
                {data.steps.map((s, idx) => {
                  const completed = idx < current;
                  const active = idx === current;
                  const picks = selection[s.id] || [];
                  const selectedOpt = picks.length
                    ? s.options.find((o) => o.id === picks[0].optionId)
                    : undefined;
                  const img = selectedOpt?.imageUrl || '/images/placeholder.svg';
                  return (
                    <div key={s.id} className="relative flex-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          completed ? 'bg-emerald-500' : active ? 'bg-emerald-400' : 'bg-gray-200'
                        }`}
                      />
                      <img
                        src={img}
                        alt={s.name}
                        className="absolute -top-3 left-0 w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
                        }}
                      />
                      <div className="text-[10px] text-gray-600 mt-4 truncate text-left">{s.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">{error}</div>
        )}
        {!data ? (
          <div>Loading builder…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps and options */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Step {current + 1} of {data.steps.length}</div>
                    <div className="text-xl font-semibold">{step?.name}</div>
                    {step?.description && <div className="text-sm text-gray-500">{step.description}</div>}
                    {step && (
                      <div className="text-xs text-gray-500 mt-1">Required: {step.min} • Max: {step.max}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{currencyFormat(total, data.currency)}</div>
                    <div className="text-xs text-gray-500">{totalKcal} kcal</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step?.options.map((opt) => {
                    const picks = selection[step.id] || [];
                    const picked = picks.find((p) => p.optionId === opt.id);
                    const isSelected = !!picked;
                    return (
                      <div
                        key={opt.id}
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleOption(step, opt)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                              <img
                                src={opt.imageUrl || '/images/placeholder.svg'}
                                alt={opt.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{opt.name}</div>
                              <div className="text-xs text-gray-600">{currencyFormat(opt.price, data.currency)} • {(opt.cal || 0)} kcal</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <button className="rounded-full w-7 h-7 border border-gray-300" onClick={(e) => { e.stopPropagation(); dec(step, opt); }}>−</button>
                              <div className="w-8 text-center">{picked?.quantity || 1}</div>
                              <button className="rounded-full w-7 h-7 border border-gray-300" onClick={(e) => { e.stopPropagation(); inc(step, opt); }}>＋</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button className="px-4 py-2 rounded-lg border" onClick={back} disabled={current === 0}>Back</button>
                  <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50" onClick={next} disabled={!canNext || current === data.steps.length - 1}>Next</button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="rounded-2xl border border-gray-200 p-4 sticky top-24">
                <div className="font-semibold mb-2">Your Selection</div>
                <div className="space-y-2 text-sm">
                  {data.steps.map((s) => {
                    const picks = selection[s.id] || [];
                    if (picks.length === 0) return null;
                    return (
                      <div key={s.id}>
                        <div className="font-medium text-gray-700">{s.name}</div>
                        <ul className="list-disc ml-5 text-gray-600">
                          {picks.map((p) => {
                            const o = s.options.find((x) => x.id === p.optionId);
                            if (!o) return null;
                            return (
                              <li key={p.optionId}>
                                {o.name} × {p.quantity || 1} — {currencyFormat(o.price * (p.quantity || 1), data.currency)}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-gray-600">Total</div>
                  <div className="text-right">
                    <div className="font-semibold">{currencyFormat(total, data.currency)}</div>
                    <div className="text-xs text-gray-500">{totalKcal} kcal</div>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 rounded-lg bg-red-600 text-white" onClick={placeOrder}>Place Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CustomOrder;
