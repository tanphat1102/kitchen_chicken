import React, { useEffect, useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';

import TodayEmblaCarousel from '@/modules/Homepage/TodayEmblaCarousel';
import { type MenuItem } from '@/services/menuItemsService';
import dishService from '@/services/dishService';
import { type Store } from '@/services/storeService';
import { StoreSelector } from '@/modules/Homepage/storeSelector';

interface Props {
  stores: Store[];
  selectedStoreId: number | null;
  onSelect: (id: number | null) => void;
}

const TodayMenu = forwardRef<HTMLElement, Props>(function TodayMenu(
  { stores, selectedStoreId, onSelect },
  ref
) {
  const [todayLoading, setTodayLoading] = useState<boolean>(false);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [todayFullMenuItems, setTodayFullMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (!selectedStoreId) return;

    const fetchDishes = async () => {
      try {
        setTodayLoading(true);
        setTodayError(null);

        const { items } = await dishService.searchDishes({ size: 12, pageNumber: 1 });

        const mapped = (items || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          imageUrl: d.imageUrl || d.image || '',
          price: d.price,
          cal: d.cal,
        })) as MenuItem[];

        setTodayFullMenuItems(mapped);
      } catch (err: any) {
        setTodayError(err?.message || 'Failed to load dishes');
        setTodayFullMenuItems([]);
      } finally {
        setTodayLoading(false);
      }
    };

    fetchDishes();
  }, [selectedStoreId]);

  return (
    <section ref={ref} className="bg-white py-20 flex items-center justify-center">
      <div className="relative w-full max-w-[1300px]">

        <div className="flex justify-end px-4 md:px-0 mb-1">
          <Link
            to="/menu"
            className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            View more
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-16 px-4 md:px-0">
          <div className="flex items-center gap-4">
            <div className="w-2 h-16 bg-red-600"></div>
            <div>
              <h2 className="text-4xl font-bold text-red-600">Today Menu</h2>
              <p className="text-gray-500 mt-2">Discover our most loved, crafted for taste and health.</p>
            </div>
          </div>

          <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onSelect={onSelect} />
        </div>

        <div className="mx-12 relative">
          {todayLoading ? (
            <div className="text-center py-20">Loading menu...</div>
          ) : todayError ? (
            <div className="text-center py-20 text-red-500">Error: {todayError}</div>
          ) : todayFullMenuItems.length === 0 ? (
            <div className="text-center py-20 text-gray-600">No menu items available for this store today.</div>
          ) : (
            <TodayEmblaCarousel items={todayFullMenuItems} />
          )}
        </div>
      </div>
    </section>
  );
});

export default TodayMenu;
