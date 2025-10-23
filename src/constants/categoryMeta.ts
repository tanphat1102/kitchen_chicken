export type CategoryMeta = {
  color: string; 
  icon: 'drumstick' | 'bowl' | 'leaf' | 'cup' | 'cake' | 'forkKnife' | 'flame';
};


export const CATEGORY_ID_META: Record<number, CategoryMeta> = {
  
};

export function getCategoryMetaByName(name?: string): CategoryMeta {
  const n = (name || '').toLowerCase();
  if (/(chicken)/.test(n)) return { color: '#ef4444', icon: 'drumstick' };
  if (/(noodle|pasta)/.test(n)) return { color: '#f59e0b', icon: 'bowl' };
  if (/(salad|vegetable|veggie)/.test(n)) return { color: '#10b981', icon: 'leaf' };
  if (/(soup)/.test(n)) return { color: '#6366f1', icon: 'bowl' };
  if (/(drink|beverage|juice)/.test(n)) return { color: '#06b6d4', icon: 'cup' };
  if (/(dessert|cake)/.test(n)) return { color: '#f43f5e', icon: 'cake' };
  if (/(rice)/.test(n)) return { color: '#84cc16', icon: 'bowl' };
  return { color: '#14b8a6', icon: 'forkKnife' };
}
