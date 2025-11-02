import { orderEmployeeService } from "@/services/orderEmployeeService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Get list of CONFIRMED orders for employee's store
 */
export function useConfirmedOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ["confirmedOrders"],
    queryFn: () => orderEmployeeService.getConfirmedOrders(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for real-time updates
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

/**
 * Get CONFIRMED order detail
 */
export function useConfirmedOrderDetail(
  orderId: number,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["confirmedOrder", orderId],
    queryFn: () => orderEmployeeService.getConfirmedOrderDetail(orderId),
    enabled: enabled && !!orderId,
    staleTime: 30 * 1000,
  });
}

/**
 * Accept a CONFIRMED order -> PROCESSING
 */
export function useAcceptOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderEmployeeService.acceptOrder(orderId),
    onSuccess: () => {
      // Refresh confirmed orders list
      queryClient.invalidateQueries({ queryKey: ["confirmedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["confirmedOrder"] });
    },
  });
}

/**
 * Mark a PROCESSING order -> READY
 */
export function useMarkReady() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderEmployeeService.markReady(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["confirmedOrder"] });
    },
  });
}

/**
 * Complete a READY order -> COMPLETED
 */
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) =>
      orderEmployeeService.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["confirmedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["confirmedOrder"] });
    },
  });
}

/**
 * Combined hook for complete order management flow
 * Usage in employee dashboard
 */
export function useOrderManagement() {
  const acceptOrder = useAcceptOrder();
  const markReady = useMarkReady();
  const completeOrder = useCompleteOrder();

  return {
    acceptOrder,
    markReady,
    completeOrder,

    // Combined loading state
    isProcessing:
      acceptOrder.isPending || markReady.isPending || completeOrder.isPending,
  };
}
