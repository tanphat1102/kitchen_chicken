import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PromotionSelector } from "@/components/PromotionSelector";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrentOrder,
  useDeleteDish,
  useUpdateDish,
} from "@/hooks/useOrderCustomer";
import { useConfirmOrder } from "@/hooks/useOrderPayment";
import { APP_ROUTES } from "@/routes/route.constants";
import { paymentMethodService, promotionService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const currencyFormat = (value: number) => {
  const numValue = Number(value) || 0;
  if (isNaN(numValue)) return "0 ₫";
  return numValue.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const CartPage: React.FC = () => {
  const [storeId] = useState(1); // TODO: Get from context or user selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null,
  );
  const [expandedCustomizations, setExpandedCustomizations] = useState<
    Set<number>
  >(new Set());
  const { currentUser } = useAuth();

  // Only fetch order if user is logged in
  const {
    data: order,
    isLoading,
    error,
  } = useCurrentOrder(storeId, !!currentUser);

  const updateDish = useUpdateDish(storeId);
  const deleteDish = useDeleteDish(storeId);
  const confirmOrder = useConfirmOrder();

  const dishes = order?.dishes || [];
  const isEmpty = !order || dishes.length === 0;

  // Calculate total from all items in cart
  const cartTotal = React.useMemo(() => {
    const total = dishes.reduce((sum, dish) => {
      const price = Number(dish.price) || 0;
      const quantity = Number(dish.quantity) > 0 ? Number(dish.quantity) : 1;
      const itemTotal = price * quantity;
      const newSum = sum + itemTotal;
      return isNaN(newSum) ? sum : newSum;
    }, 0);

    return isNaN(total) ? 0 : total;
  }, [dishes]);

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => paymentMethodService.getAll(),
    enabled: !!currentUser,
  });

  // Fetch selected promotion details
  const { data: selectedPromotion } = useQuery({
    queryKey: ["promotion", selectedPromotionId],
    queryFn: () => promotionService.getById(selectedPromotionId!),
    enabled: !!selectedPromotionId,
  });

  // Calculate discount amount
  const discountAmount = React.useMemo(() => {
    if (!selectedPromotion || !cartTotal || isNaN(cartTotal)) return 0;

    if (selectedPromotion.discountType === "PERCENT") {
      const discount = (cartTotal * selectedPromotion.discountValue) / 100;
      return isNaN(discount) ? 0 : discount;
    }
    const discount = Number(selectedPromotion.discountValue) || 0;
    return isNaN(discount) ? 0 : discount;
  }, [selectedPromotion, cartTotal]);

  // Calculate final total
  const finalTotal = React.useMemo(() => {
    const total = cartTotal - discountAmount;
    return isNaN(total) ? 0 : Math.max(0, total);
  }, [cartTotal, discountAmount]);

  const handleCheckout = () => {
    if (!order) {
      alert("No order found. Please add items to cart first.");
      return;
    }

    if (!order.orderId) {
      alert("Order ID is missing. Please try refreshing the page.");
      return;
    }

    if (dishes.length === 0) {
      alert("Please add at least one item to your cart.");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const checkoutPayload = {
      orderId: order.orderId,
      paymentMethodId: selectedPaymentMethod,
      promotionId: selectedPromotionId || undefined,
      channel: "WEB",
    };

    confirmOrder.mutate(checkoutPayload, {
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || error.message || "Please try again.";
        alert(`Checkout failed: ${errorMessage}`);
      },
    });
  };

  // Handle ingredient quantity change directly
  const handleIngredientQuantityChange = (
    dishId: number,
    stepId: number,
    optionId: number,
    newQuantity: number,
  ) => {
    if (newQuantity < 0) return;

    const dish = dishes.find((d) => d.dishId === dishId);
    if (!dish) return;

    // Handle both "selections" and "steps" data structures
    let allSelections: any[] = [];

    if (dish.selections && dish.selections.length > 0) {
      allSelections = dish.selections;
    } else if ((dish as any).steps && (dish as any).steps.length > 0) {
      allSelections = (dish as any).steps.flatMap((step: any) =>
        (step.items || []).map((item: any) => ({
          stepId: step.stepId,
          stepName: step.stepName,
          optionId: item.menuItemId,
          optionName: item.menuItemName,
          quantity: item.quantity,
          extraPrice: item.extraPrice || 0,
        })),
      );
    } else {
      return;
    }

    // Create updated selections
    const updatedSelections = allSelections
      .map((sel) => {
        if (sel.stepId === stepId && sel.optionId === optionId) {
          return { ...sel, quantity: newQuantity };
        }
        return sel;
      })
      .filter((sel) => sel.quantity > 0);

    if (updatedSelections.length === 0) {
      alert(
        "Cannot remove all ingredients. At least one ingredient is required.",
      );
      return;
    }

    // Convert to API format
    const groupedByStep = updatedSelections.reduce((acc, sel) => {
      const existing = acc.find((s: any) => s.stepId === sel.stepId);
      if (existing) {
        existing.items.push({
          menuItemId: sel.optionId,
          quantity: sel.quantity,
        });
      } else {
        acc.push({
          stepId: sel.stepId,
          items: [
            {
              menuItemId: sel.optionId,
              quantity: sel.quantity,
            },
          ],
        });
      }
      return acc;
    }, [] as any[]);

    // Update via API
    updateDish.mutate(
      {
        dishId,
        request: { selections: groupedByStep },
      },
      {
        onError: (error: any) => {
          alert(
            `Failed to update: ${error.response?.data?.message || error.message}`,
          );
        },
      },
    );
  };

  // Show login required if not logged in - check FIRST before loading/error
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-20">
          <div className="max-w-md text-center">
            <svg
              className="mx-auto mb-4 h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">
              Login Required
            </h2>
            <p className="mb-6 text-gray-600">
              Please login to view your cart and place orders
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("auth:login-required"))
              }
              className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    // Handle 401 specifically
    if ((error as any).response?.status === 401) {
      return (
        <>
          <Navbar />
          <div className="flex min-h-screen items-center justify-center bg-gray-50 py-20">
            <div className="max-w-md text-center">
              <svg
                className="mx-auto mb-4 h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                Login Required
              </h2>
              <p className="mb-6 text-gray-600">
                Please login to view your cart
              </p>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("auth:login-required"))
                }
                className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Login Now
              </button>
            </div>
          </div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-20">
          <div className="text-center">
            <p className="text-red-600">
              Error loading cart: {(error as any)?.message || "Unknown error"}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-gray-800">Your Cart</h1>
            <p className="text-gray-600">
              {isEmpty
                ? "Your cart is empty"
                : `${dishes.length} item${dishes.length > 1 ? "s" : ""} in cart`}
            </p>
          </div>

          {isEmpty ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
              <svg
                className="mx-auto mb-4 h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                Your cart is empty
              </h2>
              <p className="mb-6 text-gray-600">
                Add some delicious items to get started!
              </p>
              <Link
                to={APP_ROUTES.MENU}
                className="inline-block rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
                {/* Cart Header */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Your Cart ({dishes.length}{" "}
                      {dishes.length === 1 ? "item" : "items"})
                    </span>
                    <span className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-semibold text-red-600">
                        {currencyFormat(cartTotal)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {dishes.map((dish) => {
                    const dishQuantity =
                      Number(dish.quantity) > 0 ? Number(dish.quantity) : 1;

                    // Debug log for dish structure
                    console.log("Dish structure:", {
                      id: dish.dishId,
                      name: dish.menuItemName,
                      hasSelections: !!dish.selections,
                      selectionsLength: dish.selections?.length || 0,
                      selections: dish.selections,
                      hasSteps: !!(dish as any).steps,
                      stepsLength: (dish as any).steps?.length || 0,
                    });

                    return (
                      <div
                        key={dish.dishId}
                        className="p-6 transition-all duration-200 hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-4">
                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="mb-1 text-xl leading-tight font-bold text-gray-900">
                                  {dish.menuItemName}
                                </h3>
                                {/* Calories Badge */}
                                {dish.cal && (
                                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                    <svg
                                      className="h-3 w-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                    {dish.cal} cal
                                  </div>
                                )}
                                {dish.note && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <svg
                                      className="h-4 w-4 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-600 italic">
                                      {dish.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 text-right">
                                <p className="text-2xl font-bold text-red-600">
                                  {currencyFormat(dish.price)}
                                </p>
                                {dishQuantity > 1 && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    × {dishQuantity} bowls
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Steps */}
                            {(dish as any).steps &&
                              (dish as any).steps.length > 0 && (
                                <div className="mb-3">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newExpanded = new Set(
                                        expandedCustomizations,
                                      );
                                      if (newExpanded.has(dish.dishId)) {
                                        newExpanded.delete(dish.dishId);
                                      } else {
                                        newExpanded.add(dish.dishId);
                                      }
                                      setExpandedCustomizations(newExpanded);
                                    }}
                                    className="mb-3 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-3 transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.99]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                        <svg
                                          className="h-4 w-4 text-red-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                          />
                                        </svg>
                                      </div>
                                      <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900">
                                          Customizations
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {(dish as any).steps.reduce(
                                            (total: number, step: any) =>
                                              total + (step.items?.length || 0),
                                            0,
                                          )}{" "}
                                          ingredients selected
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500">
                                        {expandedCustomizations.has(dish.dishId)
                                          ? "Hide"
                                          : "Show"}
                                      </span>
                                      <div
                                        className={`rounded-full bg-gray-200 p-1 transition-all ${expandedCustomizations.has(dish.dishId) ? "rotate-180 bg-red-100" : ""}`}
                                      >
                                        <svg
                                          className={`h-4 w-4 transition-colors ${expandedCustomizations.has(dish.dishId) ? "text-red-600" : "text-gray-600"}`}
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </button>

                                  {expandedCustomizations.has(dish.dishId) && (
                                    <div className="space-y-4">
                                      {(dish as any).steps.map(
                                        (step: any, stepIdx: number) => (
                                          <div
                                            key={stepIdx}
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                                          >
                                            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-3 py-2">
                                              <p className="text-xs font-semibold text-gray-700">
                                                {step.stepName}
                                              </p>
                                            </div>
                                            <div className="space-y-2 p-3">
                                              {step.items?.map(
                                                (
                                                  item: any,
                                                  itemIdx: number,
                                                ) => (
                                                  <div
                                                    key={itemIdx}
                                                    className="group flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                                                  >
                                                    <div className="flex flex-1 items-center gap-3">
                                                      {/* Item Image */}
                                                      {item.imageUrl && (
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                          <img
                                                            src={item.imageUrl}
                                                            alt={
                                                              item.menuItemName
                                                            }
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                              (
                                                                e.target as HTMLImageElement
                                                              ).style.display =
                                                                "none";
                                                            }}
                                                          />
                                                        </div>
                                                      )}
                                                      {!item.imageUrl && (
                                                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></div>
                                                      )}
                                                      <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                          <span className="text-sm font-medium text-gray-800">
                                                            {item.menuItemName}
                                                          </span>
                                                          {item.cal && (
                                                            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-600">
                                                              {item.cal} cal
                                                            </span>
                                                          )}
                                                        </div>
                                                        {item.extraPrice >
                                                          0 && (
                                                          <span className="text-xs font-semibold text-green-600">
                                                            +
                                                            {item.extraPrice.toLocaleString(
                                                              "vi-VN",
                                                            )}
                                                            ₫
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Quantity controls - only show for custom dishes */}
                                                    {dish.isCustom ? (
                                                      <div className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-1.5">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleIngredientQuantityChange(
                                                              dish.dishId,
                                                              step.stepId,
                                                              item.menuItemId,
                                                              item.quantity - 1,
                                                            );
                                                          }}
                                                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-500 bg-white text-base font-bold text-red-600 shadow-sm transition-all hover:bg-red-500 hover:text-white active:scale-90"
                                                          title="Decrease quantity"
                                                        >
                                                          −
                                                        </button>
                                                        <span className="min-w-[28px] text-center text-sm font-bold text-gray-800">
                                                          ×{item.quantity}
                                                        </span>
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleIngredientQuantityChange(
                                                              dish.dishId,
                                                              step.stepId,
                                                              item.menuItemId,
                                                              item.quantity + 1,
                                                            );
                                                          }}
                                                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-500 bg-white text-base font-bold text-green-600 shadow-sm transition-all hover:bg-green-500 hover:text-white active:scale-90"
                                                          title="Increase quantity"
                                                        >
                                                          +
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                                                        <span className="text-sm font-bold text-gray-800">
                                                          ×{item.quantity}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                            <p className="text-sm font-semibold text-red-600">
                              {currencyFormat(dish.price)}
                              {dishQuantity > 1 && ` × ${dishQuantity}`}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="ml-4 flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-md">
                              <button
                                onClick={() => {
                                  if (dishQuantity > 1) {
                                    alert(
                                      "Quantity update coming soon. Please remove and re-add item with desired quantity.",
                                    );
                                  } else {
                                    if (
                                      confirm(
                                        `Remove ${dish.menuItemName} from cart?`,
                                      )
                                    ) {
                                      deleteDish.mutate(dish.dishId);
                                    }
                                  }
                                }}
                                disabled={
                                  updateDish.isPending || deleteDish.isPending
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 transition-all hover:from-gray-100 hover:to-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Decrease quantity"
                              >
                                <span className="text-lg font-bold">−</span>
                              </button>
                              <span className="min-w-[32px] text-center text-lg font-bold text-gray-900">
                                {dishQuantity}
                              </span>
                              <button
                                onClick={() => {
                                  alert(
                                    "Quantity update coming soon. Please add the same item again to increase quantity.",
                                  );
                                }}
                                disabled={
                                  updateDish.isPending || deleteDish.isPending
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 transition-all hover:from-gray-100 hover:to-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Increase quantity"
                              >
                                <span className="text-lg font-bold">+</span>
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Remove ${dish.menuItemName} from cart?`,
                                  )
                                ) {
                                  deleteDish.mutate(dish.dishId);
                                }
                              }}
                              disabled={deleteDish.isPending}
                              className="group flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                            >
                              <svg
                                className="h-4 w-4 transition-transform group-hover:scale-110"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {deleteDish.isPending ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                  Order Summary
                </h2>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>
                      Subtotal ({dishes.length}{" "}
                      {dishes.length === 1 ? "item" : "items"})
                    </span>
                    <span className="font-semibold">
                      {currencyFormat(cartTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Promotion Discount</span>
                      <span className="font-semibold">
                        -{currencyFormat(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-lg font-bold text-gray-800">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {currencyFormat(finalTotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-right text-sm text-green-600">
                      You save {currencyFormat(discountAmount)}!
                    </div>
                  )}
                </div>

                {/* Promotion Selector */}
                <PromotionSelector
                  selectedPromotionId={selectedPromotionId}
                  onSelectPromotion={setSelectedPromotionId}
                  orderTotal={cartTotal}
                />

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      // Determine payment provider icon based on method name
                      const isVNPay = method.name
                        .toLowerCase()
                        .includes("vnpay");
                      const isMoMo = method.name.toLowerCase().includes("momo");

                      return (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
                            selectedPaymentMethod === method.id
                              ? "border-red-600 bg-red-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="mr-4 h-5 w-5 text-red-600 focus:ring-red-500"
                          />

                          {/* Payment Icon */}
                          <div
                            className={`mr-3 flex h-12 w-12 items-center justify-center rounded-lg ${
                              isVNPay
                                ? "bg-blue-100"
                                : isMoMo
                                  ? "bg-pink-100"
                                  : "bg-gray-100"
                            }`}
                          >
                            {isVNPay && (
                              <svg
                                className="h-7 w-7 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h10v2H7V9zm0 4h7v2H7v-2z" />
                              </svg>
                            )}
                            {isMoMo && (
                              <svg
                                className="h-7 w-7 text-pink-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                              </svg>
                            )}
                            {!isVNPay && !isMoMo && (
                              <svg
                                className="h-7 w-7 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Payment Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                              {method.name}
                              {isMoMo}
                            </div>
                            {method.description && (
                              <div className="mt-0.5 text-sm text-gray-500">
                                {method.description}
                              </div>
                            )}
                          </div>

                          {/* Selected Indicator */}
                          {selectedPaymentMethod === method.id && (
                            <div className="ml-2">
                              <svg
                                className="h-6 w-6 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="w-full rounded-full bg-red-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleCheckout}
                  disabled={
                    !selectedPaymentMethod ||
                    confirmOrder.isPending ||
                    !order?.orderId ||
                    isLoading ||
                    dishes.length === 0
                  }
                >
                  {confirmOrder.isPending
                    ? "Processing..."
                    : !order?.orderId
                      ? "Loading order..."
                      : dishes.length === 0
                        ? "Add items to cart"
                        : `Proceed to Checkout (${dishes.length} ${dishes.length === 1 ? "item" : "items"})`}
                </button>

                <Link
                  to={APP_ROUTES.MENU}
                  className="mt-4 block text-center font-medium text-red-600 hover:text-red-700"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />

      {/* Payment Processing Overlay */}
      {confirmOrder.isPending && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center">
            <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-b-4 border-red-600"></div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              Processing Payment
            </h3>
            <p className="text-gray-600">
              Please wait while we redirect you to the payment gateway...
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Do not close this window
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
