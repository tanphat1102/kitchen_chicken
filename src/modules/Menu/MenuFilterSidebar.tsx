import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storeService } from '@/services/storeService'; 
import { categoryService } from '@/services/categoryService'; 
import type { Store } from '@/services/storeService'; 
import type { Category } from '@/services/categoryService'; 


export interface FilterState {
  selectedStore: string;
  sortBy: string;
  selectedCategory: string;
  minCalories: number;
  maxCalories: number;
  selectedDate: string;
}

interface MenuFilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  initialMaxCalories?: number;
}

const MenuFilterSidebar: React.FC<MenuFilterSidebarProps> = ({
  onFilterChange,
  initialMaxCalories = 1500,
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingStores, setLoadingStores] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [errorStores, setErrorStores] = useState<string | null>(null);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [selectedStore, setSelectedStore] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minCalories, setMinCalories] = useState<number>(0);
  const [maxCalories, setMaxCalories] = useState<number>(initialMaxCalories);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const weekDays = useMemo(() => {
    const today = new Date(selectedDate);
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const mondayOffset = day === 0 ? -6 : 1 - day; // shift to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const days: { label: string; dateStr: string; dayNum: number }[] = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: labels[i],
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [selectedDate]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      setErrorStores(null);
      try {
        // Sử dụng storeService
        const fetchedStores = await storeService.getAllStores();
        setStores(fetchedStores || []);
      } catch (err: any) {
        console.error('Error fetching stores:', err);
  setErrorStores(err.message || 'Could not load store list.');
      } finally {
        setLoadingStores(false);
      }
    };

    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const fetchedCategories = await categoryService.getAllCategories();
        setCategories(fetchedCategories || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setErrorCategories(err.message || 'Could not load category list.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchStores();
    fetchCategories();
  }, []);

  const triggerFilterChange = useCallback(() => {
    onFilterChange({
      selectedStore,
      sortBy,
      selectedCategory,
      minCalories,
      maxCalories,
      selectedDate,
    });
  }, [selectedStore, sortBy, selectedCategory, minCalories, maxCalories, selectedDate, onFilterChange]);

  useEffect(() => {
    triggerFilterChange();
  }, [triggerFilterChange]);

  const handleStoreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStore(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const handleMinCaloriesChange = (value: number) => {
    setMinCalories(Math.max(0, Math.min(value, maxCalories)));
  };

  const handleMaxCaloriesChange = (value: number) => {
    setMaxCalories(Math.max(0, Math.max(value, minCalories)));
  };

  const onPickDay = (dateStr: string) => setSelectedDate(dateStr);

  // Dual range slider presentation helpers
  const sliderMin = 0;
  const sliderMax = initialMaxCalories;
  const sliderStep = 10;
  const leftPercent = Math.round(((minCalories - sliderMin) / (sliderMax - sliderMin)) * 100);
  const rightPercent = Math.round(((maxCalories - sliderMin) / (sliderMax - sliderMin)) * 100);

  return (
    <aside className="w-64 md:w-72 lg:w-80 p-5 border-r border-gray-200 bg-white/70 backdrop-blur space-y-6 flex-shrink-0">

      {/* Weekday picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pick a day</label>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const active = d.dateStr === selectedDate;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onPickDay(d.dateStr)}
                className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs border transition-all ${
                  active
                    ? 'bg-red-600 text-white border-red-600 shadow-md animate-pop'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5'
                }`}
                aria-pressed={active}
              >
                <span className="font-semibold">{d.label}</span>
                <span className="opacity-90">{d.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Store */}
      <div>
        <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-1">
          📍 Store
        </label>
        {loadingStores && <p className="text-sm text-gray-500">Loading...</p>}
        {errorStores && <p className="text-sm text-red-600">{errorStores}</p>}
        {!loadingStores && !errorStores && (
          <select
            id="store-select"
            name="store"
            value={selectedStore}
            onChange={handleStoreChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="">All stores (default)</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id.toString()}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">
          ⇅ Sort by
        </label>
        <select
          id="sort-select"
          name="sort"
          value={sortBy}
          onChange={handleSortChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="calories-asc">Calories (Low to High)</option>
          <option value="calories-desc">Calories (High to Low)</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        {loadingCategories && <p className="text-sm text-gray-500">Loading...</p>}
        {errorCategories && <p className="text-sm text-red-600">{errorCategories}</p>}
        {!loadingCategories && !errorCategories && (
          <select
            id="category-select"
            name="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Calories range slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calories range
        </label>
          <div className="relative h-10 flex items-center calories-range">
          {/* Track */}
          <div
            className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-200"
          />
          <div
            className="absolute h-1.5 rounded-full"
            style={{
              left: `${leftPercent}%`,
              right: `${100 - rightPercent}%`,
              backgroundColor: '#059669',
            }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={minCalories}
            onChange={(e) => handleMinCaloriesChange(Number(e.target.value))}
              className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
            aria-label="Minimum calories"
          />
          {/* Max thumb */}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={maxCalories}
            onChange={(e) => handleMaxCaloriesChange(Number(e.target.value))}
              className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
            aria-label="Maximum calories"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>{initialMaxCalories} kcal</span>
        </div>
      </div>
    </aside>
  );
};
export default MenuFilterSidebar;