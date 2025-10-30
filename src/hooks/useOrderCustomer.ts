import {
  orderCustomerService,
  type CreateDishRequest,
  type CreateFeedbackRequest,
  type UpdateDishRequest,
} from "@/services/orderCustomerService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== Query Keys ====================

export const orderCustomerKeys = {
  all: ["orderCustomer"] as const,
  currentOrder: (storeId: number) =>
    [...orderCustomerKeys.all, "current", storeId] as const,
  orderHistory: (storeId: number) =>
    [...orderCustomerKeys.all, "history", storeId] as const,
  orderStatuses: () => [...orderCustomerKeys.all, "statuses"] as const,
  feedback: (orderId: number) =>
    [...orderCustomerKeys.all, "feedback", orderId] as const,
};

// ==================== Queries ====================

/**
 * Get or create NEW order by store
 */
export function useCurrentOrder(storeId: number, enabled = true) {
  return useQuery({
    queryKey: orderCustomerKeys.currentOrder(storeId),
    queryFn: () => orderCustomerService.getCurrentOrder(storeId),
    enabled: enabled && storeId > 0,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * List user's orders (COMPLETED/CANCELLED/PROCESSING) by store
 */
export function useOrderHistory(storeId: number, enabled = true) {
  return useQuery({
    queryKey: orderCustomerKeys.orderHistory(storeId),
    queryFn: () => orderCustomerService.getOrderHistory(storeId),
    enabled: enabled && storeId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * List all order statuses
 */
export function useOrderStatuses() {
  return useQuery({
    queryKey: orderCustomerKeys.orderStatuses(),
    queryFn: () => orderCustomerService.getAllOrderStatuses(),
    staleTime: 1000 * 60 * 60, // 1 hour - statuses rarely change
  });
}

/**
 * Get feedback by order id
 */
export function useOrderFeedback(orderId: number, enabled = true) {
  return useQuery({
    queryKey: orderCustomerKeys.feedback(orderId),
    queryFn: () => orderCustomerService.getFeedbackByOrder(orderId),
    enabled: enabled && orderId > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ==================== Mutations ====================

/**
 * Add a dish to current NEW order
 */
export function useAddDishToCurrentOrder(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDishRequest) =>
      orderCustomerService.addDishToCurrentOrder(request),
    onSuccess: (data) => {
      // Update the current order cache with the new data
      queryClient.setQueryData(orderCustomerKeys.currentOrder(storeId), data);

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: orderCustomerKeys.currentOrder(storeId),
      });
    },
  });
}

/**
 * Update a dish's selections and note
 */
export function useUpdateDish(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dishId,
      request,
    }: {
      dishId: number;
      request: UpdateDishRequest;
    }) => orderCustomerService.updateDish(dishId, request),
    onSuccess: (data) => {
      // Update the current order cache
      queryClient.setQueryData(orderCustomerKeys.currentOrder(storeId), data);

      queryClient.invalidateQueries({
        queryKey: orderCustomerKeys.currentOrder(storeId),
      });
    },
  });
}

/**
 * Delete a dish from order
 */
export function useDeleteDish(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dishId: number) => orderCustomerService.deleteDish(dishId),
    onSuccess: (data) => {
      // Update the current order cache
      queryClient.setQueryData(orderCustomerKeys.currentOrder(storeId), data);

      queryClient.invalidateQueries({
        queryKey: orderCustomerKeys.currentOrder(storeId),
      });
    },
  });
}

/**
 * Create feedback for a COMPLETED order
 */
export function useCreateFeedback(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFeedbackRequest) =>
      orderCustomerService.createFeedback(orderId, request),
    onSuccess: (data) => {
      // Update the feedback cache
      queryClient.setQueryData(orderCustomerKeys.feedback(orderId), data);

      // Invalidate order history as it may include feedback info
      queryClient.invalidateQueries({
        queryKey: orderCustomerKeys.all,
      });
    },
  });
}

// ==================== Helper Hook for Complete Order Flow ====================

/**
 * Hook that provides all order-related queries and mutations for a specific store
 * Useful for order/cart pages
 */
export function useOrderFlow(storeId: number) {
  const currentOrder = useCurrentOrder(storeId);
  const orderHistory = useOrderHistory(storeId, false); // Don't auto-fetch history
  const orderStatuses = useOrderStatuses();

  const addDish = useAddDishToCurrentOrder(storeId);
  const updateDish = useUpdateDish(storeId);
  const deleteDish = useDeleteDish(storeId);

  return {
    // Queries
    currentOrder,
    orderHistory,
    orderStatuses,

    // Mutations
    addDish,
    updateDish,
    deleteDish,

    // Convenience flags
    isLoading: currentOrder.isLoading,
    isError: currentOrder.isError,
    error: currentOrder.error,
  };
}
