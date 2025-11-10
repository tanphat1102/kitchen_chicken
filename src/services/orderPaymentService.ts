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

// MoMo callback payload interface
export interface MoMoCallbackPayload {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number; // MoMo sends as number
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: string;
  message: string;
  payType: string;
  responseTime: number; // MoMo sends as timestamp number
  extraData: string;
  signature: string;
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
  MOMO_CALLBACK: "/api/payments/momo/callback",
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
   * Handle VNPay callback (web return URL + IPN)
   * This method is called from frontend to verify payment with backend
   * Backend will validate signature and update order status
   * @param params - VNPay callback parameters from URL
   */
  async vnpayCallback(params: Record<string, string>): Promise<any> {
    console.log(
      "📤 Sending VNPay callback to backend:",
      API_ENDPOINTS.VNPAY_CALLBACK,
    );
    const response = await api.post<ApiResponse<any>>(
      API_ENDPOINTS.VNPAY_CALLBACK,
      params,
    );
    console.log("✅ VNPay callback response:", response.data);
    return response.data.data;
  },

  /**
   * Handle MoMo callback (web return URL + IPN)
   * This method is called from frontend to verify payment with backend
   * Backend will:
   * 1. Validate signature using MoMo secret key
   * 2. Verify transaction with MoMo API
   * 3. Update order status to CONFIRMED/PAID
   * @param payload - MoMo callback payload with proper types (amount and responseTime as numbers)
   * @returns Response with order status and message
   */
  async momoCallback(payload: MoMoCallbackPayload): Promise<any> {
    console.log(
      "📤 Sending MoMo callback to backend:",
      API_ENDPOINTS.MOMO_CALLBACK,
    );
    console.log("📦 MoMo Payload:", {
      orderId: payload.orderId,
      resultCode: payload.resultCode,
      transId: payload.transId,
      amount: payload.amount,
      responseTime: payload.responseTime,
      signature: payload.signature,
    });

    const response = await api.post<ApiResponse<any>>(
      API_ENDPOINTS.MOMO_CALLBACK,
      payload,
    );

    console.log("✅ MoMo callback response:", response.data);
    return response.data.data;
  },
};

export default orderPaymentService;
