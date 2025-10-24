// Store Service - API calls for store management
import { api } from './api';
import { ENV } from '@/config/env';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  openTime?: string;
  closeTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreDto {
  name: string;
  address: string;
  phone: string;
  email?: string;
  openTime?: string;
  closeTime?: string;
}

export interface UpdateStoreDto extends Partial<CreateStoreDto> {
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============= MOCK DATA =============
const mockStores: Store[] = [
  {
    id: "1",
    name: "Chicken Kitchen - District 1",
    address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
    phone: "+84 28 1234 5678",
    email: "district1@chickenkitchen.com",
    status: "ACTIVE",
    openTime: "08:00",
    closeTime: "22:00",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Chicken Kitchen - District 3",
    address: "456 Vo Van Tan, District 3, Ho Chi Minh City",
    phone: "+84 28 8765 4321",
    email: "district3@chickenkitchen.com",
    status: "ACTIVE",
    openTime: "08:00",
    closeTime: "22:00",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "3",
    name: "Chicken Kitchen - Binh Thanh",
    address: "789 Xo Viet Nghe Tinh, Binh Thanh, Ho Chi Minh City",
    phone: "+84 28 9999 8888",
    email: "binhthanh@chickenkitchen.com",
    status: "INACTIVE",
    openTime: "08:00",
    closeTime: "22:00",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
  },
];

let mockStoreData = [...mockStores]; // Mutable copy for CRUD operations

// ============= REAL API CALLS =============

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

const realApiGetAllStores = async (): Promise<Store[]> => {
  const response = await api.get<ApiResponse<any[]>>('/store');
  // Convert backend response to frontend format
  return response.data.data.map((store: any) => ({
    id: store.id.toString(),
    name: store.name,
    address: store.address,
    phone: store.phone,
    status: store.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: store.createAt,
  }));
};

const realApiGetStoreById = async (id: string): Promise<Store> => {
  const response = await api.get<ApiResponse<any>>(`/store/${id}`);
  const store = response.data.data;
  return {
    id: store.id.toString(),
    name: store.name,
    address: store.address,
    phone: store.phone,
    status: store.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: store.createAt,
  };
};

const realApiCreateStore = async (data: CreateStoreDto): Promise<Store> => {
  const response = await api.post<ApiResponse<any>>('/store', {
    name: data.name,
    address: data.address,
    phone: data.phone,
    createAt: new Date().toISOString(), // Backend requires timestamp
    isActive: true, // Default to active
  });
  const store = response.data.data;
  return {
    id: store.id.toString(),
    name: store.name,
    address: store.address,
    phone: store.phone,
    status: store.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: store.createAt,
  };
};

const realApiUpdateStore = async (id: string, data: UpdateStoreDto): Promise<Store> => {
  const response = await api.put<ApiResponse<any>>(`/store/${id}`, {
    name: data.name,
    address: data.address,
    phone: data.phone,
    isActive: data.status === 'ACTIVE', // Convert status to isActive
  });
  const store = response.data.data;
  return {
    id: store.id.toString(),
    name: store.name,
    address: store.address,
    phone: store.phone,
    status: store.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: store.createAt,
  };
};

const realApiToggleStoreStatus = async (id: string): Promise<Store> => {
  const response = await api.patch<ApiResponse<any>>(`/store/${id}`);
  const store = response.data.data;
  return {
    id: store.id.toString(),
    name: store.name,
    address: store.address,
    phone: store.phone,
    status: store.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: store.createAt,
  };
};

const realApiDeleteStore = async (id: string): Promise<void> => {
  await api.delete(`/store/${id}`);
};

// ============= MOCK API CALLS =============

const mockApiGetAllStores = async (): Promise<Store[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return [...mockStoreData];
};

const mockApiGetStoreById = async (id: string): Promise<Store> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const store = mockStoreData.find(s => s.id === id);
  if (!store) throw new Error('Store not found');
  return store;
};

const mockApiCreateStore = async (data: CreateStoreDto): Promise<Store> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStore: Store = {
    id: Date.now().toString(),
    ...data,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockStoreData.push(newStore);
  return newStore;
};

const mockApiUpdateStore = async (id: string, data: UpdateStoreDto): Promise<Store> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockStoreData.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Store not found');
  
  mockStoreData[index] = {
    ...mockStoreData[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return mockStoreData[index];
};

const mockApiToggleStoreStatus = async (id: string): Promise<Store> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockStoreData.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Store not found');
  
  mockStoreData[index].status = mockStoreData[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  mockStoreData[index].updatedAt = new Date().toISOString();
  return mockStoreData[index];
};

const mockApiDeleteStore = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockStoreData = mockStoreData.filter(s => s.id !== id);
};

// ============= EXPORTED FUNCTIONS (Auto-switch between Mock/Real) =============

export const getAllStores = async (): Promise<Store[]> => {
  return ENV.USE_MOCK_DATA ? mockApiGetAllStores() : realApiGetAllStores();
};

export const getStoreById = async (id: string): Promise<Store> => {
  return ENV.USE_MOCK_DATA ? mockApiGetStoreById(id) : realApiGetStoreById(id);
};

export const createStore = async (data: CreateStoreDto): Promise<Store> => {
  return ENV.USE_MOCK_DATA ? mockApiCreateStore(data) : realApiCreateStore(data);
};

export const updateStore = async (id: string, data: UpdateStoreDto): Promise<Store> => {
  return ENV.USE_MOCK_DATA ? mockApiUpdateStore(id, data) : realApiUpdateStore(id, data);
};

export const toggleStoreStatus = async (id: string): Promise<Store> => {
  return ENV.USE_MOCK_DATA ? mockApiToggleStoreStatus(id) : realApiToggleStoreStatus(id);
};

export const deleteStore = async (id: string): Promise<void> => {
  return ENV.USE_MOCK_DATA ? mockApiDeleteStore(id) : realApiDeleteStore(id);
};

// Service object for consistent API with other services
export const storeService = {
  getAll: getAllStores,
  getById: getStoreById,
  create: createStore,
  update: updateStore,
  toggleStatus: toggleStoreStatus,
  delete: deleteStore,
};
