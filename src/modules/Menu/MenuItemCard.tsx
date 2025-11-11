import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryMetaByName } from '@/constants/categoryMeta';
import type { MenuItem } from '@/services/menuItemsService';
import { useAddExistingDishToOrder } from '@/hooks/useOrderCustomer';

interface MenuItemDetail extends MenuItem {
  calories: number;
}

interface MenuItemCardProps {
  item: MenuItemDetail;
  storeId?: number;
}

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);


const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ForkKnifeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M5 2a1 1 0 0 0-1 1v6a2 2 0 1 0 2 0V9a1 1 0 0 0 2 0V3a1 1 0 1 0-2 0v3H6V3a1 1 0 0 0-1-1zm10 0a1 1 0 0 0-1 1v7a3 3 0 1 0 6 0V3a1 1 0 1 0-2 0v3h-2V3a1 1 0 0 0-1-1z" />
  </svg>
);

const DrumstickIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M14 3c3 0 7 3 7 7 0 3-2 5-4 6-1 1-2 1-3 1-1 0-2 0-3-1l-1 1a3 3 0 0 1-3 3h-1l-2-2v-1a3 3 0 0 1 3-3l1-1c-1-1-1-2-1-3 0-2 1-3 2-4 1-2 3-3 5-3z" />
  </svg>
);

const BowlIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M4 10a8 8 0 1 0 16 0H4zm0 0c0-2 2-4 4-4h8a4 4 0 0 1 4 4H4z" />
  </svg>
);

const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20 3S9 4 6 7s-3 7 0 10 7 3 10 0 4-14 4-14zM6 7s6 4 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M4 5h12v6a6 6 0 0 1-12 0V5zm12 1h2a3 3 0 1 1 0 6h-2" />
  </svg>
);

const CakeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2l1 3-1 1-1-1 1-3zM4 9h16v5H4V9zm0 7h16v4H4v-4z" />
  </svg>
);

const FlameIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 3s-2 2-2 5 3 4 3 7-2 4-4 4-5-2-5-6 4-7 8-10z" />
  </svg>
);

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCategoryMeta(name?: string) {
  const metaByName = getCategoryMetaByName(name);
  const iconMap = {
    drumstick: DrumstickIcon,
    bowl: BowlIcon,
    leaf: LeafIcon,
    cup: CupIcon,
    cake: CakeIcon,
    forkKnife: ForkKnifeIcon,
    flame: FlameIcon,
  } as const;
  return { color: metaByName.color, Icon: iconMap[metaByName.icon] };
}

const formatVND = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, storeId = 1 }) => {
  const { color, Icon } = useMemo(() => getCategoryMeta(item.categoryName), [item.categoryName]);
  const addDish = useAddExistingDishToOrder(storeId);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);

  const description = useMemo(() => {
    // if (item.description) return item.description; //API chưa có
    return '';
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();
    
    addDish.mutate(
      {
        storeId: storeId,
        dishId: item.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          // Optional: Show toast notification
          console.log('Added to cart:', item.name);
          
          // Trigger flying animation
          if (addButtonRef.current && item.imageUrl) {
            window.dispatchEvent(new CustomEvent('dish:added-to-cart', {
              detail: {
                imageUrl: item.imageUrl,
                element: addButtonRef.current
              }
            }));
          }
        },
        onError: (error: any) => {
          console.error('Failed to add to cart:', error);
          
          // Handle 401 Unauthorized
          if (error.response?.status === 401) {
            alert('Please login to add items to cart');
            // Optional: Open login modal
            window.dispatchEvent(new CustomEvent('auth:login-required'));
          } else {
            alert('Failed to add to cart. Please try again.');
          }
        },
      }
    );
  };

  return (
    <div className="group relative animate-fade-up" role="listitem" aria-label={item.name}>
      <Link to={`/menu/${item.id}`} className="block focus:outline-none focus:ring-2 focus:ring-red-500 rounded-3xl">
      <div className="relative rounded-3xl bg-white/90 backdrop-blur p-5 pt-16 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute top-4 right-4 flex items-center gap-1 text-yellow-500 text-sm font-semibold">
          <span className="text-gray-700">5.0</span>
          <StarIcon className="w-4 h-4" />
        </div>

        {/* Image */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative w-28 h-28 rounded-full ring-8 ring-white shadow-xl overflow-hidden">
            <img
              src={item.imageUrl || 'https://via.placeholder.com/150'}
              alt={item.name}
              className="h-full w-full object-cover animate-float group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">
          <h4 className="text-base sm:text-lg font-bold text-gray-800 truncate mb-1" title={item.name}>
            {item.name}
          </h4>

          <div className="relative z-10 -mt-1 mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
               style={{ backgroundColor: hexToRgba(color, 0.12), color }}>
            <Icon className="w-3.5 h-3.5" />
            <span className="max-w-[160px] truncate">{item.categoryName || 'Others'}</span>
          </div>

          {description && (
            <p className="text-[13px] text-gray-500 leading-snug line-clamp-2 min-h-[2.5rem]">{description}</p>
          )}

          {/* kcal */}
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-600">
            <FlameIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>{isFinite(item.calories) ? `${item.calories} kcal` : '—'}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-gray-900 font-extrabold text-lg sm:text-xl">{formatVND(item.price)}</p>
            <button
              ref={addButtonRef}
              type="button"
              onClick={handleAddToCart}
              disabled={addDish.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold shadow-md transition-all hover:bg-red-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add to cart"
            >
              {addDish.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
  </div>
  </Link>
    </div>
  );
};

export default MenuItemCard;
export type { MenuItemDetail };