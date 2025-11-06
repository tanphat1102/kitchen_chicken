import api from "@/config/axios";

// ==================== Interfaces ====================

export interface OrderConfirmRequest {
  orderId: number;
  paymentMethodId: number;
  promotionId?: number;
  channel?: string;
}

export interface OrderConfirmResponse {
  paymentUrl?: string;
  orderId?: number;
  message?: string;
}

// Can also be a string URL directly
export type OrderConfirmResult = OrderConfirmResponse | string;

// ==================== Response Model ====================

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ==================== Service ====================

const API_ENDPOINTS = {
  CONFIRM_ORDER: "/api/orders/confirm",
  VNPAY_CALLBACK: "/api/payments/vnpay/callback",
  VNPAY_CALLBACK_LEGACY: "/api/orders/vnpay-callback",
};

export const orderPaymentService = {
  /**
   * Confirm order and initiate payment
   * Returns payment URL for redirect
   */
  async confirmOrder(
    request: OrderConfirmRequest,
  ): Promise<OrderConfirmResult> {
    console.log("=== Confirm Order Request ===");
    console.log("Request:", request);

    const response = await api.post<ApiResponse<OrderConfirmResult>>(
      API_ENDPOINTS.CONFIRM_ORDER,
      request,
    );

    console.log("=== Confirm Order Response ===");
    console.log("Full Response:", response.data);
    console.log("Data:", response.data.data);
    console.log("Data Type:", typeof response.data.data);

    return response.data.data;
  },

  /**
   * Handle VNPay callback (for webhook)
   */
  async vnpayCallback(params: Record<string, string>): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      API_ENDPOINTS.VNPAY_CALLBACK,
      params,
    );
    return response.data.data;
  },
};

export default orderPaymentService;
