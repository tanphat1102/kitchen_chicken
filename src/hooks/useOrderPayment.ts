import {
  orderPaymentService,
  type OrderConfirmRequest,
} from "@/services/orderPaymentService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to confirm order and get payment URL
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OrderConfirmRequest) =>
      orderPaymentService.confirmOrder(request),
    onSuccess: (data) => {
      console.log("=== Confirm Order Success ===");
      console.log("Response data:", data);

      // Invalidate current order query since it's now confirmed
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      queryClient.invalidateQueries({ queryKey: ["orderHistory"] });

      // If payment URL exists, redirect to payment gateway
      // Handle both cases: data.paymentUrl or data as string URL
      const paymentUrl = typeof data === "string" ? data : data.paymentUrl;

      if (paymentUrl) {
        console.log("Redirecting to VNPay:", paymentUrl);

        // Redirect directly to VNPay payment page
        window.location.href = paymentUrl;
      } else {
        console.log("No payment URL found, order confirmed without payment");
      }
    },
  });
}

/**
 * Combined hook for complete checkout flow
 * Usage in Cart page
 */
export function useCheckout() {
  const confirmOrder = useConfirmOrder();

  const handleCheckout = async (
    orderId: number,
    paymentMethodId: number,
    promotionId?: number,
    channel?: string,
  ) => {
    try {
      const response = await confirmOrder.mutateAsync({
        orderId,
        paymentMethodId,
        promotionId,
        channel,
      });

      return response;
    } catch (error: any) {
      console.error("Checkout failed:", error);
      throw error;
    }
  };

  return {
    handleCheckout,
    isPending: confirmOrder.isPending,
    isSuccess: confirmOrder.isSuccess,
    error: confirmOrder.error,
  };
}
