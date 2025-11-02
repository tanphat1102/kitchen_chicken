import api from "@/config/axios";
import type { Order } from "./orderCustomerService";

// ==================== Response Model ====================

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==================== Service ====================

const API_ENDPOINTS = {
  CONFIRMED_ORDERS: "/api/orders/employee/confirmed",
  CONFIRMED_ORDER_DETAIL: (orderId: number) =>
    `/api/orders/employee/confirmed/${orderId}`,
  ACCEPT_ORDER: (orderId: number) => `/api/orders/employee/accept/${orderId}`,
  MARK_READY: (orderId: number) => `/api/orders/employee/ready/${orderId}`,
  COMPLETE_ORDER: (orderId: number) =>
    `/api/orders/employee/complete/${orderId}`,
};

export const orderEmployeeService = {
  /**
   * Get list of CONFIRMED orders in employee's store
   * Employee only
   */
  async getConfirmedOrders(): Promise<Order[]> {
    const response = await api.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.CONFIRMED_ORDERS,
    );
    return response.data.data;
  },

  /**
   * Get CONFIRMED order detail by ID
   * Employee only
   */
  async getConfirmedOrderDetail(orderId: number): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(
      API_ENDPOINTS.CONFIRMED_ORDER_DETAIL(orderId),
    );
    return response.data.data;
  },

  /**
   * Accept a CONFIRMED order -> PROCESSING
   * Employee only
   */
  async acceptOrder(orderId: number): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      API_ENDPOINTS.ACCEPT_ORDER(orderId),
    );
    return response.data.data;
  },

  /**
   * Mark a PROCESSING order -> READY
   * Employee only
   */
  async markReady(orderId: number): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      API_ENDPOINTS.MARK_READY(orderId),
    );
    return response.data.data;
  },

  /**
   * Complete a READY order -> COMPLETED
   * Employee only
   */
  async completeOrder(orderId: number): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      API_ENDPOINTS.COMPLETE_ORDER(orderId),
    );
    return response.data.data;
  },
};

export default orderEmployeeService;
