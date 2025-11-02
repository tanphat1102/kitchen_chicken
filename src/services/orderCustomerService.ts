import api from "@/config/axios";

// ==================== Interfaces ====================

export interface OrderDish {
  id: number;
  dishId: number; // Backend returns this field
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  note?: string;
  price: number;
  imageUrl?: string;
  selections?: DishSelection[];
}

export interface DishSelection {
  id: number;
  stepId: number;
  stepName: string;
  optionId: number;
  optionName: string;
  quantity: number;
  extraPrice: number;
}

export interface Order {
  orderId: number;
  storeId: number;
  storeName: string;
  userId: number;
  orderStatusId: number;
  orderStatusName: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  dishes: OrderDish[];
  feedback?: OrderFeedback;
}

export interface OrderStatus {
  id: number;
  name: string;
  description?: string;
}

export interface OrderFeedback {
  id: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ==================== DTOs ====================

export interface SelectionItem {
  menuItemId: number;
  quantity: number;
}

export interface StepSelection {
  stepId: number;
  items: SelectionItem[];
}

export interface CreateDishRequest {
  storeId: number; // REQUIRED
  note?: string;
  selections: StepSelection[]; // REQUIRED
}

export interface UpdateDishRequest {
  note?: string;
  selections?: StepSelection[];
}

export interface CreateFeedbackRequest {
  rating: number; // 1-5
  comment?: string;
}

// ==================== Response Model ====================

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==================== Service ====================

const API_ENDPOINTS = {
  CURRENT_ORDER: "/api/orders/current",
  CURRENT_DISHES: "/api/orders/current/dishes",
  DISH: (dishId: number) => `/api/orders/dishes/${dishId}`,
  ORDER_HISTORY: "/api/orders/history",
  ORDER_STATUSES: "/api/orders/statuses",
  ORDER_FEEDBACK: (orderId: number) => `/api/orders/${orderId}/feedback`,
};

class OrderCustomerService {
  /**
   * Get or create NEW order by store
   * Clears items if not in today's daily menu
   */
  async getCurrentOrder(storeId: number): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(
      API_ENDPOINTS.CURRENT_ORDER,
      {
        params: { storeId },
      },
    );
    return response.data.data;
  }

  /**
   * Add a dish to current NEW order (auto-create if none)
   */
  async addDishToCurrentOrder(request: CreateDishRequest): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      API_ENDPOINTS.CURRENT_DISHES,
      request,
    );
    return response.data.data;
  }

  /**
   * Update a dish's selections and note
   */
  async updateDish(dishId: number, request: UpdateDishRequest): Promise<Order> {
    const response = await api.put<ApiResponse<Order>>(
      API_ENDPOINTS.DISH(dishId),
      request,
    );
    return response.data.data;
  }

  /**
   * Delete a dish from order
   */
  async deleteDish(dishId: number): Promise<Order> {
    const response = await api.delete<ApiResponse<Order>>(
      API_ENDPOINTS.DISH(dishId),
    );
    return response.data.data;
  }

  /**
   * List user's orders (COMPLETED/CANCELLED/PROCESSING) by store
   */
  async getOrderHistory(storeId: number): Promise<Order[]> {
    const response = await api.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.ORDER_HISTORY,
      {
        params: { storeId },
      },
    );
    return response.data.data;
  }

  /**
   * List all order statuses
   */
  async getAllOrderStatuses(): Promise<OrderStatus[]> {
    const response = await api.get<ApiResponse<OrderStatus[]>>(
      API_ENDPOINTS.ORDER_STATUSES,
    );
    return response.data.data;
  }

  /**
   * Get feedback by order id
   */
  async getFeedbackByOrder(orderId: number): Promise<OrderFeedback> {
    const response = await api.get<ApiResponse<OrderFeedback>>(
      API_ENDPOINTS.ORDER_FEEDBACK(orderId),
    );
    return response.data.data;
  }

  /**
   * Create feedback for a COMPLETED order (owner only)
   */
  async createFeedback(
    orderId: number,
    request: CreateFeedbackRequest,
  ): Promise<OrderFeedback> {
    const response = await api.post<ApiResponse<OrderFeedback>>(
      API_ENDPOINTS.ORDER_FEEDBACK(orderId),
      request,
    );
    return response.data.data;
  }
}

export const orderCustomerService = new OrderCustomerService();
