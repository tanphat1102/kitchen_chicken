import {
  orderCustomerService,
  type CreateCustomDishRequest,
  type CreateDishRequest,
  type CreateExistingDishRequest,
  type CreateFeedbackRequest,
  type CancelOrderRequest,
  type Order,
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
  orderTracking: (orderId: number) =>
    [...orderCustomerKeys.all, "tracking", orderId] as const,
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
    retry: false, // Don't retry on auth errors
    gcTime: 0, // Don't keep cache when disabled (formerly cacheTime)
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

/**
 * Track order progress by order id
 * Returns detailed order information including steps and customizations
 */
export function useOrderTracking(orderId: number, enabled = true) {
  return useQuery({
    queryKey: orderCustomerKeys.orderTracking(orderId),
    queryFn: () => orderCustomerService.getOrderTracking(orderId),
    enabled: enabled && orderId > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent for live tracking
  });
}

// ==================== Mutations ====================

/**
 * Add an existing menu item to current NEW order
 */
export function useAddExistingDishToOrder(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateExistingDishRequest) =>
      orderCustomerService.addExistingDishToOrder(request),
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
 * Add a custom dish to current NEW order
 */
export function useAddCustomDishToOrder(storeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCustomDishRequest) =>
      orderCustomerService.addCustomDishToOrder(request),
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
 * @deprecated Use useAddExistingDishToOrder or useAddCustomDishToOrder instead
 * Add a dish to current NEW order (legacy - auto-routes to correct endpoint)
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

    // Optimistic update - update UI immediately before API call
    onMutate: async ({ dishId, request }) => {
      console.log("=== Optimistic Update Start ===");

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: orderCustomerKeys.currentOrder(storeId),
      });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(
        orderCustomerKeys.currentOrder(storeId),
      );

      // Optimistically update to the new value
      if (previousOrder?.dishes) {
        const updatedOrder: Order = {
          ...previousOrder,
          dishes: previousOrder.dishes.map((dish: any) => {
            if (dish.dishId === dishId) {
              // Update the dish's steps with new quantities
              const updatedSteps = (dish as any).steps?.map((step: any) => ({
                ...step,
                items: step.items.map((item: any) => {
                  // Find if this item's quantity should be updated
                  const stepUpdate = request.selections?.find(
                    (s: any) => s.stepId === step.stepId,
                  );
                  const itemUpdate = stepUpdate?.items?.find(
                    (i: any) => i.menuItemId === item.menuItemId,
                  );

                  if (itemUpdate) {
                    return { ...item, quantity: itemUpdate.quantity };
                  }
                  return item;
                }),
              }));

              return {
                ...dish,
                steps: updatedSteps,
              };
            }
            return dish;
          }),
        };

        queryClient.setQueryData(
          orderCustomerKeys.currentOrder(storeId),
          updatedOrder,
        );

        console.log("Optimistic update applied");
      }

      console.log("==============================");

      // Return context with previous value
      return { previousOrder };
    },

    onSuccess: (data) => {
      console.log("=== Update Dish Success ===");

      // Refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({
        queryKey: orderCustomerKeys.currentOrder(storeId),
      });

      console.log("===========================");
    },

    onError: (error, variables, context) => {
      console.error("=== Update Dish Error ===");
      console.error("Error:", error);

      // Rollback to previous value on error
      if (context?.previousOrder) {
        queryClient.setQueryData(
          orderCustomerKeys.currentOrder(storeId),
          context.previousOrder,
        );
        console.log("Rolled back to previous state");
      }

      console.error("========================");
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

/**
 * Cancel an order (for customer)
 * Only orders that are not COMPLETED can be cancelled
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CancelOrderRequest) =>
      orderCustomerService.cancelOrder(request),
    onSuccess: () => {
      // Invalidate all order-related queries to refresh data
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

  const addExistingDish = useAddExistingDishToOrder(storeId);
  const addCustomDish = useAddCustomDishToOrder(storeId);
  const updateDish = useUpdateDish(storeId);
  const deleteDish = useDeleteDish(storeId);

  return {
    // Queries
    currentOrder,
    orderHistory,
    orderStatuses,

    // Mutations
    addExistingDish,
    addCustomDish,
    updateDish,
    deleteDish,

    // Convenience flags
    isLoading: currentOrder.isLoading,
    isError: currentOrder.isError,
    error: currentOrder.error,
  };
}
