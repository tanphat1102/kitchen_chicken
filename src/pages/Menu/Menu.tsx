import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MenuFilterSidebar, { type FilterState } from '@/modules/Menu/MenuFilterSidebar';
import MenuItemCard, { type MenuItemDetail } from '@/modules/Menu/MenuItemCard';

import { dailyMenuService } from '@/services/dailyMenuService';
import { menuItemsService } from '@/services/menuItemsService';
import type { DailyMenuItem } from '@/services/dailyMenuService';
import type { Nutrient, MenuItem } from '@/services/menuItemsService';
import { Navbar } from '@/components/Navbar';


const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]; 
};

const extractCalories = (item: Partial<MenuItem> & { nutrients?: Nutrient[] } ): number => {
  if (typeof item.cal === 'number' && isFinite(item.cal)) return Math.round(item.cal);
  const nutrients = item.nutrients;
  if (!nutrients) return 0;
  const calorieNutrient = nutrients.find(n => {
    const nm = (n.name || '').toLowerCase();
    return nm === 'calories' || nm === 'kcal';
  });
  return calorieNutrient ? Math.round(calorieNutrient.quantity) : 0;
};

const MenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dailyMenuItems, setDailyMenuItems] = useState<MenuItemDetail[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemDetail[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1); // Track selected store
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const itemsPerPage = 12; 
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPageClamped = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (currentPageClamped - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    if (currentFilters === null) {
      return; 
    }

    const fetchMenuData = async () => {
      setLoading(true);
      setError(null);
      setDailyMenuItems([]);
      setFilteredItems([]);

  const storeId = currentFilters.selectedStore ? parseInt(currentFilters.selectedStore, 10) : undefined;
  const selectedDate = currentFilters.selectedDate || getTodayDateString();
      
      // Update state for order customer hook
      if (storeId) {
        setSelectedStoreId(storeId);
      }
      
      try {
        let todayMenu: DailyMenuItem | null = null;
        const todayStr = selectedDate;

        const allDailyMenus = await dailyMenuService.getAllDailyMenus();
        const summary = allDailyMenus.find((menu) => (menu.menuDate || '').startsWith(todayStr));

        if (!summary) {
          const storeMsg = storeId ? `for selected store` : ``;
          setError(`No menu found ${storeMsg} for date (${todayStr}).`);
          setLoading(false);
          return;
        }

        todayMenu = await dailyMenuService.getDailyMenuById(summary.id);

        if (!todayMenu) {
          setError(`No menu details found for date (${todayStr}).`);
          setLoading(false);
          return;
        }

        if (storeId) {
          const hasStore = Array.isArray(todayMenu.storeList)
            ? todayMenu.storeList.some((s) => s.storeId === storeId)
            : true;
          if (!hasStore) {
            setError(`No menu found for selected store for date (${todayStr}).`);
            setLoading(false);
            return;
          }
        }

        const itemIds = (todayMenu.itemList || []).map((item) => item.menuItemId);
        const detailPromises = itemIds.map(id => menuItemsService.getMenuItemById(id));
        const detailedResults = await Promise.allSettled(detailPromises);

        const todayDetailedItems: MenuItemDetail[] = [];
        detailedResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value && result.value.isActive) {
            const item = result.value;
            todayDetailedItems.push({
              ...item,
              calories: extractCalories(item),
            });
          } else if (result.status === 'rejected') {
             console.error(`Cannot load daily menu ID: ${itemIds[index]}`, result.reason);
          }
        });
        
        setDailyMenuItems(todayDetailedItems);

      } catch (err: any) {
        console.error('Error fetching or processing menu data:', err);
        setError(err.message || 'Error fetching or processing menu data');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();

  }, [currentFilters?.selectedStore, currentFilters?.selectedDate]); 


  const applyFiltersAndSort = useCallback((items: MenuItemDetail[], filters: FilterState | null): MenuItemDetail[] => {
    if (!filters) {
      return items;
    }
    let itemsToProcess = [...items];


    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\u0300-\u036f]/g, '');
    const q = searchQuery.trim();
    if (q) {
      const nq = normalize(q);
      itemsToProcess = itemsToProcess.filter((it) => {
        const name = normalize(it.name || '');
        const cat = normalize(it.categoryName || '');
        return name.includes(nq) || cat.includes(nq);
      });
    }
    if (filters.selectedCategory !== 'all') {
      itemsToProcess = itemsToProcess.filter(
        item => item.categoryId.toString() === filters.selectedCategory
      );
    }
    itemsToProcess = itemsToProcess.filter(
      item => (item.calories ?? 0) >= filters.minCalories && (item.calories ?? 0) <= filters.maxCalories
    );
    const [sortKey, sortOrder] = filters.sortBy.split('-');
    itemsToProcess.sort((a, b) => {
      let compareA: any;
      let compareB: any;
      if (sortKey === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else {
        compareA = (sortKey === 'price') ? a.price : a.calories;
        compareB = (sortKey === 'price') ? b.price : b.calories;
        if (isNaN(compareA)) compareA = 0;
        if (isNaN(compareB)) compareB = 0;
      }
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return itemsToProcess;
  }, [searchQuery]);


  useEffect(() => {
  if (!loading && currentFilters) { 
        const newFilteredItems = applyFiltersAndSort(dailyMenuItems, currentFilters);
        setFilteredItems(newFilteredItems);
    setCurrentPage(1);
    }
  }, [dailyMenuItems, currentFilters, loading, applyFiltersAndSort]);

  const handleFilterChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
  }, []); 

  return (
    <>
    {/* Navbar */}
    <Navbar/>

    <div className="flex flex-col md:flex-row min-h-screen bg-white mt-15">
      {/* Sidebar */}
      <MenuFilterSidebar onFilterChange={handleFilterChange} initialMaxCalories={2000} />

      {/* Main Content*/}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        
  {loading && <p className="text-center text-gray-500 mt-10">Loading menu...</p>}
        {error && <p className="text-center text-red-600 mt-10">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-8 mt-20">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} storeId={selectedStoreId} />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 mt-10">
                  {dailyMenuItems.length === 0 && !error ? 'No daily menu today.' : 'No matching menu items found.'}
                </p>
              )}
            </div>

            {/* Pagination */}
            {filteredItems.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <button
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                  disabled={currentPageClamped === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span className="font-bold text-lg text-emerald-700 px-2">
                  {currentPageClamped} / {totalPages}
                </span>
                <button
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                  disabled={currentPageClamped === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Trang sau"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </>
  );
};
export default MenuPage;