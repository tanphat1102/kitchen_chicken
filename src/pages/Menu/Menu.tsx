import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import dishService, { type DishSummary } from '@/services/dishService';

const formatPrice = (price?: number) => {
  if (typeof price !== 'number') return '';
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  } catch {
    return `${price} đ`;
  }
};

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'cal-asc' | 'cal-desc';

export default function Menu() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dishes, setDishes] = useState<DishSummary[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const PAGE_SIZE = 12;
  const [total, setTotal] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { items, total: t } = await dishService.searchDishes({ size: PAGE_SIZE, pageNumber });
        if (!mounted) return;
        
        let sortedItems = [...(items || [])];
        switch (sortBy) {
          case 'name-asc':
            sortedItems.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            break;
          case 'name-desc':
            sortedItems.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
            break;
          case 'price-asc':
            sortedItems.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price-desc':
            sortedItems.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'cal-asc':
            sortedItems.sort((a, b) => (a.cal || 0) - (b.cal || 0));
            break;
          case 'cal-desc':
            sortedItems.sort((a, b) => (b.cal || 0) - (a.cal || 0));
            break;
        }
        
        setDishes(sortedItems);
        setTotal(typeof t === 'number' ? t : null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Unable to load menu');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [pageNumber, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight mt-10">
            Our Menu
            <span className="inline-block ml-3 text-orange-500"></span>
          </h1>
          <p className="text-gray-600 text-lg">Discover our delicious dishes</p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-700 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort by:
            </span>
            
            {/* Name sort */}
            <button
              onClick={() => setSortBy(sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium transform hover:scale-105 ${
                sortBy.startsWith('name')
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {sortBy === 'name-asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
              <span>Name</span>
            </button>

            {/* Price sort */}
            <button
              onClick={() => setSortBy(sortBy === 'price-asc' ? 'price-desc' : 'price-asc')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium transform hover:scale-105 ${
                sortBy.startsWith('price')
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {sortBy === 'price-asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              )}
              <span>Price</span>
            </button>

            {/* Calories sort */}
            <button
              onClick={() => setSortBy(sortBy === 'cal-asc' ? 'cal-desc' : 'cal-asc')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium transform hover:scale-105 ${
                sortBy.startsWith('cal')
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {sortBy === 'cal-asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              )}
              <span>Calories</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-32 bg-red-50 rounded-2xl border border-red-100">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">Error: {error}</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center text-gray-500 py-32 bg-gray-50 rounded-2xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-semibold">No dishes available.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-6">
              {dishes.map((d, idx) => (
                <Link
                  key={d.id}
                  to={`/menu/${d.id}`}
                  className="group bg-white rounded-2xl overflow-hidden flex flex-col relative shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 cursor-pointer"
                  style={{ 
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  {/* Full width image with overlay */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={d.imageUrl || '/images/placeholder.png'}
                      alt={d.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badge */}
                    {d.isCustom && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Special
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Dish name */}
                    <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] leading-snug group-hover:text-orange-600 transition-colors duration-300">
                      {d.name}
                    </h3>

                    {/* Info tags */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="px-3 py-1.5 bg-orange-50 rounded-lg text-xs font-semibold text-orange-700 flex items-center gap-1 border border-orange-100">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        {d.cal ?? '-'} cal
                      </span>
                      <span className="px-3 py-1.5 bg-green-50 rounded-lg text-xs font-bold text-green-700 border border-green-100">
                        {formatPrice(d.price)}
                      </span>
                    </div>
                  </div>

                  {/* View details icon */}
                  <div className="absolute bottom-4 right-4 w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:scale-110">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 font-semibold text-gray-700 hover:text-orange-600 transform hover:scale-105 disabled:hover:scale-100 shadow-sm"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
              >
                ← Previous
              </button>

              <div className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg">
                Page {pageNumber}
              </div>

              <button
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 font-semibold text-gray-700 hover:text-orange-600 transform hover:scale-105 disabled:hover:scale-100 shadow-sm"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={
                  (total !== null && pageNumber >= Math.max(1, Math.ceil(total / PAGE_SIZE))) ||
                  (total === null && dishes.length < PAGE_SIZE)
                }
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}