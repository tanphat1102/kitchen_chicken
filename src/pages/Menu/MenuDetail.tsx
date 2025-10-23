import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { menuItemsService } from '@/services/menuItemsService';
import type { MenuItem, Nutrient } from '@/services/menuItemsService';

const normalizeName = (name: string) => name.trim().toLowerCase();

function findByName(nutrients: Nutrient[] | undefined, key: string) {
  if (!nutrients) return undefined;
  const target = normalizeName(key);
  return nutrients.find((n) => normalizeName(n.name) === target);
}

function formatKCal(nutrients?: Nutrient[]): string | null {
  const cal = findByName(nutrients, 'Calories');
  if (cal && isFinite(cal.quantity)) return `${Math.round(cal.quantity)}kcal`;
  const kcal = findByName(nutrients, 'kcal');
  if (kcal && isFinite(kcal.quantity)) return `${Math.round(kcal.quantity)}kcal`;
  return null;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-red-800 text-xs font-semibold mr-2">
      {children}
    </span>
  );
}

const MenuDetailPage: React.FC = () => {
  const { id } = useParams();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('Missing menu id');
        const data = await menuItemsService.getMenuItemById(Number(id));
        if (mounted) setItem(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load menu item');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [id]);

  const kcalText = useMemo(() => formatKCal(item?.nutrients), [item]);

  const badges = useMemo(() => {
    const list: string[] = [];
    const protein = findByName(item?.nutrients, 'Protein');
    const fiber = findByName(item?.nutrients, 'Dietary Fiber') || findByName(item?.nutrients, 'Fiber');
    if (protein && protein.quantity >= 25) list.push('High Protein');
    if (fiber && fiber.quantity >= 5) list.push('Fiber Filled');
    return list;
  }, [item]);

  const allNutrients = useMemo(() => {
    if (!item?.nutrients) return [] as Nutrient[];
    return item.nutrients;
  }, [item]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white mt-15">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="mb-4">
            <Link to="/menu" className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-medium">
              <span className="text-lg">←</span>
              <span>Back to Menu</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <section className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-5">
            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && item && (
              <div>
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                  {/spicy|chili|bbq/i.test(item.name) && <span aria-hidden>🌶️</span>}
                  <span>{item.name}</span>
                </h1>
                <p className="mt-1 text-gray-600 text-lg font-semibold">
                  {item.categoryName} {kcalText ? `• ${kcalText}` : ''}
                </p>

                {/* Hero image */}
                <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <Badge key={b}>{b}</Badge>
                    ))}
                  </div>
                )}

                {/* Description placeholder */}
                <div className="mt-6 bg-[#f6f7f3] rounded-3xl p-5">
                  <h2 className="text-xl font-bold mb-2">About this dish</h2>
                  <p className="text-gray-700">
                    Detailed description is not provided by the API. You can enrich this section with chef notes, flavor profile, and serving suggestions.
                  </p>
                </div>

                {/* Ingredients placeholder */}
                <div className="mt-6 bg-[#f6f7f3] rounded-3xl p-5">
                  <h2 className="text-2xl font-extrabold mb-2">Ingredients</h2>
                  <p className="text-gray-700">Ingredients data is not available from the API.</p>
                </div>

              </div>
            )}
          </section>

          {/* Nutrition sidebar */}
          <aside className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-6 h-max">
            <h3 className="text-2xl font-extrabold mb-2">Nutrition Per Serving</h3>
            {kcalText && <p className="text-sm text-gray-600 mb-3">Per serving</p>}
            <ul className="divide-y">
              {allNutrients.length > 0 ? (
                allNutrients.map((n) => (
                  <li key={n.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{n.name}</span>
                    <span className="text-gray-900">
                      {isFinite(n.quantity) ? n.quantity : '-'}
                      {/calorie|kcal/i.test(n.name) ? 'kcal' : ''}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-gray-500">No nutrition data.</li>
              )}
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Nutritional info may vary slightly by time of delivery.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
};

export default MenuDetailPage;
