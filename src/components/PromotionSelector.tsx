import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promotionService, type Promotion } from '@/services/promotionService';

interface PromotionSelectorProps {
  selectedPromotionId: number | null;
  onSelectPromotion: (promotionId: number | null) => void;
  orderTotal: number;
}

const currencyFormat = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const PromotionSelector: React.FC<PromotionSelectorProps> = ({
  selectedPromotionId,
  onSelectPromotion,
  orderTotal,
}) => {
  const [showPromotions, setShowPromotions] = useState(true);

  // Fetch available promotions
  const { data: promotions = [], isLoading, error } = useQuery({
    queryKey: ['promotions', 'public'],
    queryFn: async () => {
      console.log('Fetching promotions...');
      try {
        const result = await promotionService.getAllPublic();
        console.log('Promotions fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching promotions:', err);
        throw err;
      }
    },
  });

  React.useEffect(() => {
    console.log('=== PromotionSelector Debug ===');
    console.log('Order Total:', orderTotal);
    console.log('Promotions Raw:', promotions);
    console.log('Promotions Length:', promotions?.length);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    console.log('Show Promotions:', showPromotions);
    
    if (promotions && promotions.length > 0) {
      console.log('First Promotion:', promotions[0]);
      console.log('First Promotion Keys:', Object.keys(promotions[0]));
    }
    
    console.log('==============================');
  }, [promotions, isLoading, error, orderTotal, showPromotions]);

  // Filter active and valid promotions
  const availablePromotions = promotions.filter((promo) => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    
    const isActive = promo.isActive;
    const isStarted = now >= startDate;
    const isNotExpired = now <= endDate;
    
    // Check quantity only if it exists
    const quantity = promo.quantity ?? promo.quantityLimit ?? 999999; // Default to unlimited if not specified
    const usedCount = promo.usedCount ?? 0;
    const hasQuantity = quantity === 999999 || (quantity - usedCount) > 0;
    
    console.log(`Promo ${promo.name}:`, {
      isActive,
      isStarted,
      isNotExpired,
      hasQuantity,
      quantity,
      usedCount,
      startDate: promo.startDate,
      endDate: promo.endDate,
      remaining: quantity - usedCount,
      now: now.toISOString()
    });
    
    return isActive && isStarted && isNotExpired && hasQuantity;
  });

  console.log('=== Filter Results ===');
  console.log('Total Promotions:', promotions.length);
  console.log('Available Promotions:', availablePromotions.length);
  console.log('Available Promotions:', availablePromotions);
  console.log('=====================');

  const selectedPromotion = availablePromotions.find(
    (p) => p.id === selectedPromotionId
  );

  const calculateDiscount = (promotion: Promotion): number => {
    if (promotion.discountType === 'PERCENT') {
      return (orderTotal * promotion.discountValue) / 100;
    }
    return promotion.discountValue;
  };

  const formatDiscountValue = (promotion: Promotion): string => {
    if (promotion.discountType === 'PERCENT') {
      return `-${promotion.discountValue}%`;
    }
    return `-${currencyFormat(promotion.discountValue)}`;
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Promotion Code
        </h3>
        <button
          type="button"
          onClick={() => setShowPromotions(!showPromotions)}
          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
        >
          {showPromotions ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View Available
            </>
          )}
        </button>
      </div>

      {/* Selected Promotion Display */}
      {selectedPromotion ? (
        <div className="p-3 bg-green-50 border-2 border-green-500 rounded-lg flex items-center justify-between">
          <div className="flex-1">
            <div className="font-semibold text-green-800">{selectedPromotion.name}</div>
            {selectedPromotion.code && (
              <div className="text-sm text-green-600">Code: {selectedPromotion.code}</div>
            )}
            <div className="text-sm text-green-600">
              Discount: {formatDiscountValue(selectedPromotion)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectPromotion(null)}
            className="ml-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-center text-gray-500">
          No promotion applied
        </div>
      )}

      {/* Promotions List */}
      {showPromotions && (
        <div className="mt-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="py-4 text-center text-gray-500">Loading promotions...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">
              Error loading promotions. Please try again later.
            </div>
          ) : availablePromotions.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              {promotions.length > 0
                ? 'No active promotions available at the moment'
                : 'No promotions available'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {availablePromotions.map((promo) => {
                const isSelected = promo.id === selectedPromotionId;
                const discount = calculateDiscount(promo);

                const quantity = promo.quantity ?? promo.quantityLimit ?? 999999;
                const usedCount = promo.usedCount ?? 0;
                const remainingQuantity = quantity - usedCount;
                const isUnlimited = quantity === 999999;

                return (
                  <div
                    key={promo.id}
                    className={`group flex h-full flex-col justify-between rounded-lg border-2 p-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-red-300'
                    }`}
                    onClick={() => onSelectPromotion(isSelected ? null : promo.id)}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">{promo.name}</div>
                      {promo.description && (
                        <div className="mt-1 text-sm text-gray-600 line-clamp-3">{promo.description}</div>
                      )}
                      {promo.code && (
                        <div className="mt-2 inline-block rounded bg-red-100 px-2 py-1 font-mono text-xs text-red-700">
                          {promo.code}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>
                          Valid until: {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                        </span>
                        {!isUnlimited && (
                          <span className="flex items-center gap-1">
                            • Remaining: {remainingQuantity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-xs font-medium text-gray-500">
                        Save {currencyFormat(discount)}
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {formatDiscountValue(promo)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
