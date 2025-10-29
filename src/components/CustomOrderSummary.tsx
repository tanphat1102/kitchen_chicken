import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface Option {
  id: number;
  name: string;
  price: number;
  cal?: number;
}

interface StepDef {
  id: number;
  name: string;
  code: string;
  options: Option[];
}

interface SelectionMap {
  [stepId: number]: { optionId: number; quantity: number }[];
}

interface CustomOrderSummaryProps {
  open: boolean;
  onClose: () => void;
  steps: StepDef[];
  selection: SelectionMap;
  currency: string;
  basePrice: number;
  onAddToCart: () => void;
}

const currencyFormat = (v: number, currency: string) =>
  new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: currency === 'USD' ? 'USD' : 'VND' 
  }).format(v);

export const CustomOrderSummary: React.FC<CustomOrderSummaryProps> = ({
  open,
  onClose,
  steps,
  selection,
  currency,
  basePrice,
  onAddToCart,
}) => {
  // Calculate totals
  const totalCalories = React.useMemo(() => {
    let total = 0;
    steps.forEach(step => {
      const picks = selection[step.id] || [];
      picks.forEach(pick => {
        const option = step.options.find(o => o.id === pick.optionId);
        if (option) {
          total += (option.cal || 0) * (pick.quantity || 1);
        }
      });
    });
    return total;
  }, [steps, selection]);

  const totalPrice = React.useMemo(() => {
    let total = basePrice;
    steps.forEach(step => {
      const picks = selection[step.id] || [];
      picks.forEach(pick => {
        const option = step.options.find(o => o.id === pick.optionId);
        if (option) {
          total += option.price * (pick.quantity || 1);
        }
      });
    });
    return total;
  }, [steps, selection, basePrice]);

  const itemizedPrice = React.useMemo(() => {
    let itemTotal = 0;
    steps.forEach(step => {
      const picks = selection[step.id] || [];
      picks.forEach(pick => {
        const option = step.options.find(o => o.id === pick.optionId);
        if (option) {
          itemTotal += option.price * (pick.quantity || 1);
        }
      });
    });
    return itemTotal;
  }, [steps, selection]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative bg-white">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-red-600 uppercase tracking-wide text-center">
              Confirmed Poke
            </h2>
          </div>

          {/* Items List */}
          <div className="px-8 py-6 space-y-3">
            {steps.map(step => {
              const picks = selection[step.id] || [];
              if (picks.length === 0) return null;

              return picks.map(pick => {
                const option = step.options.find(o => o.id === pick.optionId);
                if (!option) return null;

                const hasExtraCharge = option.price > 0;

                return (
                  <div
                    key={`${step.id}-${option.id}`}
                    className="flex items-center justify-between py-3 border-b border-gray-100"
                  >
                    {/* Item name and calories */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {option.name}
                        {hasExtraCharge && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {option.cal || 0} calo
                      </p>
                    </div>

                    {/* Extra charge if any */}
                    {hasExtraCharge && (
                      <div className="text-lg font-semibold text-gray-700 mx-6">
                        {currencyFormat(option.price * (pick.quantity || 1), currency)}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                      <button className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 transition">
                        −
                      </button>
                      <span className="font-semibold text-gray-800 min-w-[24px] text-center">
                        {pick.quantity || 1}
                      </span>
                      <button className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 transition">
                        +
                      </button>
                    </div>
                  </div>
                );
              });
            })}
          </div>

          {/* Totals */}
          <div className="px-8 py-6 border-t-2 border-gray-200 space-y-3">
            {/* Total Calories */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Total calo:
              </span>
              <span className="text-2xl font-bold text-gray-800">
                {totalCalories}
              </span>
            </div>

            {/* Price breakdown */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Price:</span>
              <span className="font-bold text-gray-800">
                {currencyFormat(basePrice, currency)}
              </span>
            </div>

            {/* Extra charges */}
            {itemizedPrice > 0 && (
              <div className="flex items-center justify-between text-lg pl-8">
                <span className="text-gray-600">+</span>
                <span className="font-semibold text-gray-700">
                  {currencyFormat(itemizedPrice, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="px-8 pb-8">
            <button
              onClick={() => {
                onAddToCart();
                onClose();
              }}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 uppercase tracking-wide"
            >
              Add to cart
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
