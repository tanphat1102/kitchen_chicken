import api from '@/config/axios';

export interface Nutrient {
	id: number;
	name: string;
	quantity: number;
	baseUnit?: string;
}

export interface MenuItemShort {
	menuItemId: number;
	name: string;
	imageUrl?: string;
	quantity?: number;
	price?: number;
	cal?: number;
}

export interface DishStep {
	stepId: number;
	stepName: string;
	items: MenuItemShort[];
}

export interface DishSummary {
	id: number;
	name: string;
	price: number;
	cal?: number;
	isCustom: boolean;
	note?: string;
	imageUrl?: string;
}

export interface Dish extends DishSummary {
	createdAt?: string;
	updatedAt?: string;
	steps?: DishStep[];
	nutrients?: Nutrient[];
}

const ENDPOINT = '/api/dishes';

class DishService {
	private cache = new Map<number, { data: Dish; ts: number }>();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Get dish by id
	 */
	async getDishById(id: number, token?: string): Promise<Dish> {
		try {
			const cached = this.cache.get(id);
			if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
				return cached.data;
			}

			const { data: resp } = await api.get<any>(
				`${ENDPOINT}/${id}`,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;

			if (!payload) throw new Error(resp?.message || `Dish ${id} not found`);

			const dish: Dish = {
				id: payload.id,
				name: payload.name,
				price: payload.price,
				cal: payload.cal,
				isCustom: !!payload.isCustom,
				note: payload.note,
				imageUrl: payload.imageUrl,
				createdAt: payload.createdAt,
				updatedAt: payload.updatedAt,
				steps: Array.isArray(payload.steps) ? payload.steps : undefined,
				nutrients: Array.isArray(payload.nutrients) ? payload.nutrients : undefined,
			};

			this.cache.set(id, { data: dish, ts: Date.now() });
			return dish;
		} catch (error: any) {
			console.error(`Error fetching dish ${id}:`, error);
			const msg = error?.response?.data?.message ?? error?.message ?? 'Đã xảy ra lỗi khi lấy món ăn';
			throw new Error(msg);
		}
	}

	/**
	 * Get all dishes (paginated). If size/pageNumber omitted, backend defaults apply.
	 */
	async getAllDishes(size?: number, pageNumber?: number, token?: string): Promise<DishSummary[]> {
		try {
			const params: string[] = [];
			if (typeof size === 'number') params.push(`size=${encodeURIComponent(size)}`);
			if (typeof pageNumber === 'number') params.push(`pageNumber=${encodeURIComponent(pageNumber)}`);
			const query = params.length ? `?${params.join('&')}` : '';

			const { data: resp } = await api.get<any>(
				`${ENDPOINT}${query}`,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const raw = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			const arr: any[] = Array.isArray(raw) ? raw : [];

			return arr.map((d) => ({
				id: d?.id,
				name: d?.name,
				price: d?.price,
				cal: d?.cal,
				isCustom: !!d?.isCustom,
				note: d?.note,
				imageUrl: d?.imageUrl,
			}));
		} catch (error: any) {
			console.error('Error fetching dishes:', error);
			const msg = error?.response?.data?.message ?? error?.message ?? 'Đã xảy ra lỗi khi lấy danh sách món ăn';
			throw new Error(msg);
		}
	}

	/**
	 * Search dishes with optional filters (menuItemIds, keyword, minCal, maxCal, minPrice, maxPrice, size, pageNumber)
	 * Returns { items, total }
	 */
	async searchDishes(filters: Record<string, any> = {}, token?: string): Promise<{ items: DishSummary[]; total: number }> {
		try {
			const qp = new URLSearchParams();

			Object.keys(filters).forEach((k) => {
				const v = filters[k];
				if (v === undefined || v === null) return;
				if (Array.isArray(v)) {
					v.forEach((it) => qp.append(k, String(it)));
				} else {
					qp.set(k, String(v));
				}
			});

			const query = qp.toString() ? `?${qp.toString()}` : '';

			const { data: resp } = await api.get<any>(
				`${ENDPOINT}/search${query}`,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			const itemsRaw: any[] = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
			const total = typeof payload?.total === 'number' ? payload.total : 0;

			const items = itemsRaw.map((d) => ({
				id: d?.id,
				name: d?.name,
				price: d?.price,
				cal: d?.cal,
				isCustom: !!d?.isCustom,
				note: d?.note,
				imageUrl: d?.imageUrl,
			}));

			return { items, total };
		} catch (error: any) {
			console.error('Error searching dishes:', error);
			const msg = error?.response?.data?.message ?? error?.message ?? 'Đã xảy ra lỗi khi tìm kiếm món ăn';
			throw new Error(msg);
		}
	}

	/**
	 * Get my custom dishes (requires auth)
	 */
	async getMyCustomDishes(token?: string): Promise<DishSummary[] | null> {
		try {
			const { data: resp } = await api.get<any>(
				`${ENDPOINT}/custom/mine`,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const raw = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			if (raw === null) return null;
			const arr: any[] = Array.isArray(raw) ? raw : [];
			return arr.map((d) => ({
				id: d?.id,
				name: d?.name,
				price: d?.price,
				cal: d?.cal,
				isCustom: !!d?.isCustom,
				note: d?.note,
				imageUrl: d?.imageUrl,
			}));
		} catch (error: any) {
			console.error('Error fetching my custom dishes:', error);
			const msg = error?.response?.data?.message ?? error?.message ?? 'Đã xảy ra lỗi khi lấy món tùy chỉnh của bạn';
			throw new Error(msg);
		}
	}

	clearCache(): void {
		this.cache.clear();
	}

	clearCacheById(id: number): void {
		this.cache.delete(id);
	}
}

export const dishService = new DishService();
export default dishService;
