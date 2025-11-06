import api from '@/config/axios';

// ==================== Interfaces ====================

export interface Nutrient {
	id: number;
	name: string;
	quantity: number;
	baseUnit?: string;
}

export interface DishStep {
	stepId: number;
	stepName: string;
	items: Array<{
		menuItemId: number;
		name: string;
		imageUrl?: string;
		quantity?: number;
		price?: number;
		cal?: number;
	}>;
}

export interface Dish {
	id: number;
	name: string;
	description?: string;
	price: number;
	cal: number;
	isCustom: boolean;
	note?: string;
	imageUrl?: string;
	createdAt?: string;
	updatedAt?: string;
	steps?: DishStep[];
	nutrients?: Nutrient[];
}

export interface CreateDishRequest {
	name: string;
	description?: string;
	imageUrl?: string;
	price: number;
	cal?: number;
}

export interface UpdateDishRequest {
	name?: string;
	description?: string;
	imageUrl?: string;
	price?: number;
	cal?: number;
}

// ==================== Response Models ====================

interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

// ==================== API Endpoints ====================

const API_ENDPOINTS = {
	DISHES: '/api/dishes',
	DISH_BY_ID: (id: number) => `/api/dishes/${id}`,
	DISHES_COUNTS: '/api/dishes/counts',
};

// ==================== Manager Dish Service ====================

class ManagerDishService {
	private cache = new Map<number, { data: Dish; ts: number }>();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Get all dishes for stats (no pagination, returns all)
	 * Used in Manager Dashboard for statistics
	 */
	async getAllForStats(token?: string): Promise<Dish[]> {
		try {
			const { data: resp } = await api.get<any>(
				`${API_ENDPOINTS.DISHES}?size=1000&pageNumber=1`,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const raw = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			const arr: any[] = Array.isArray(raw) ? raw : [];

			return arr.map((d) => ({
				id: d?.id,
				name: d?.name,
				description: d?.description,
				price: d?.price,
				cal: d?.cal || 0,
				isCustom: !!d?.isCustom,
				note: d?.note,
				imageUrl: d?.imageUrl,
				createdAt: d?.createdAt,
				updatedAt: d?.updatedAt,
			}));
		} catch (error: any) {
			console.error('Error fetching dishes for stats:', error);
			throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to fetch dishes');
		}
	}

	/**
	 * Get total count of dishes
	 */
	async getCount(token?: string): Promise<number> {
		try {
			const { data: resp } = await api.get<any>(
				API_ENDPOINTS.DISHES_COUNTS,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			return payload?.total ?? 0;
		} catch (error: any) {
			console.error('Error fetching dish count:', error);
			return 0;
		}
	}

	/**
	 * Get dish by ID
	 */
	async getById(id: number, token?: string): Promise<Dish> {
		try {
			const cached = this.cache.get(id);
			if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
				return cached.data;
			}

			const { data: resp } = await api.get<any>(
				API_ENDPOINTS.DISH_BY_ID(id),
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;

			if (!payload) throw new Error(resp?.message || `Dish ${id} not found`);

			const dish: Dish = {
				id: payload.id,
				name: payload.name,
				description: payload.description,
				price: payload.price,
				cal: payload.cal || 0,
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
			throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to fetch dish');
		}
	}

	/**
	 * Create new dish (Manager only)
	 */
	async create(data: CreateDishRequest, token?: string): Promise<Dish> {
		try {
			const { data: resp } = await api.post<any>(
				API_ENDPOINTS.DISHES,
				data,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			this.clearCache();
			
			return {
				id: payload.id,
				name: payload.name,
				description: payload.description,
				price: payload.price,
				cal: payload.cal || 0,
				isCustom: !!payload.isCustom,
				note: payload.note,
				imageUrl: payload.imageUrl,
				createdAt: payload.createdAt,
				updatedAt: payload.updatedAt,
			};
		} catch (error: any) {
			console.error('Error creating dish:', error);
			throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to create dish');
		}
	}

	/**
	 * Update dish (Manager only)
	 */
	async update(id: number, data: UpdateDishRequest, token?: string): Promise<Dish> {
		try {
			const { data: resp } = await api.put<any>(
				API_ENDPOINTS.DISH_BY_ID(id),
				data,
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			const payload = resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp;
			this.clearCache();
			this.clearCacheById(id);
			
			return {
				id: payload.id,
				name: payload.name,
				description: payload.description,
				price: payload.price,
				cal: payload.cal || 0,
				isCustom: !!payload.isCustom,
				note: payload.note,
				imageUrl: payload.imageUrl,
				createdAt: payload.createdAt,
				updatedAt: payload.updatedAt,
			};
		} catch (error: any) {
			console.error('Error updating dish:', error);
			throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to update dish');
		}
	}

	/**
	 * Delete dish (Manager only)
	 */
	async delete(id: number, token?: string): Promise<void> {
		try {
			await api.delete<any>(
				API_ENDPOINTS.DISH_BY_ID(id),
				token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
			);

			this.clearCache();
			this.clearCacheById(id);
		} catch (error: any) {
			console.error('Error deleting dish:', error);
			throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to delete dish');
		}
	}

	clearCache(): void {
		this.cache.clear();
	}

	clearCacheById(id: number): void {
		this.cache.delete(id);
	}
}

export const managerDishService = new ManagerDishService();
export default managerDishService;
