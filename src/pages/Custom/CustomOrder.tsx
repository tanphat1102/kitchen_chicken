import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  useAddCustomDishToOrder,
  useUpdateDish,
} from "@/hooks/useOrderCustomer";
import { APP_ROUTES } from "@/routes/route.constants";
import { menuItemsService, type MenuItem } from "@/services/menuItemsService";
import { stepService, type Step } from "@/services/stepService";
import { storeService, type Store } from "@/services/storeService";
import { ChevronLeft, ChevronRight, Flame, ShoppingCart } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SelectionMap {
  [stepId: number]: { menuItemId: number; quantity: number }[];
}

const currencyFormat = (v: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "VND",
  }).format(v);

const CustomOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [steps, setSteps] = useState<Step[]>([]);
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<
    Record<number, MenuItem[]>
  >({});
  const [current, setCurrent] = useState(0);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");

  // Check if we're in edit mode
  const editMode = location.state?.editMode;
  const editDishId = location.state?.dishId;
  const editDishData = location.state?.dishData;

  // Order customer mutations
  const addDish = useAddCustomDishToOrder(selectedStoreId || 0);
  const updateDish = useUpdateDish(selectedStoreId || 0);

  // Pagination for items (4 columns x 3 rows = 12 items per page)
  const ITEMS_PER_PAGE = 12;
  const [itemsPage, setItemsPage] = useState(0);

  // Load store list and set default selection
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storeService.getAll();
        if (!mounted) return;
        setStores(all);
        if (all.length > 0) setSelectedStoreId(all[0].id);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load stores");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch steps and menu items
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedStoreId) return;
      try {
        setLoading(true);
        setError(null);
        setSelection({});
        setCurrent(0);

        // Fetch all steps
        const allSteps = await stepService.getAll();
        if (!mounted) return;

        // Sort steps by stepNumber
        const sortedSteps = allSteps.sort(
          (a, b) => a.stepNumber - b.stepNumber,
        );
        setSteps(sortedSteps);

        // Fetch menu items for each category
        const menuItemsMap: Record<number, MenuItem[]> = {};
        for (const step of sortedSteps) {
          try {
            const items = await menuItemsService.searchMenuItems({
              categoryId: step.categoryId,
              size: 100,
            });
            menuItemsMap[step.categoryId] = items.items.filter(
              (item) => item.isActive,
            );
          } catch (err) {
            console.error(
              `Failed to fetch items for category ${step.categoryId}:`,
              err,
            );
            menuItemsMap[step.categoryId] = [];
          }
        }

        if (mounted) {
          setMenuItemsByCategory(menuItemsMap);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load custom builder");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedStoreId]);

  // Prefill data when in edit mode
  useEffect(() => {
    if (editMode && editDishData && steps.length > 0 && !loading) {
      try {
        // Convert dish.steps format to SelectionMap format
        const prefillSelection: SelectionMap = {};

        if (editDishData.steps && Array.isArray(editDishData.steps)) {
          editDishData.steps.forEach((step: any) => {
            if (step.stepId && step.items && Array.isArray(step.items)) {
              prefillSelection[step.stepId] = step.items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity || 1,
              }));
            }
          });
        }

        setSelection(prefillSelection);

        // Also prefill note if exists
        if (editDishData.note) {
          setNote(editDishData.note);
        }

        toast.success("Dish data loaded for editing");
      } catch (err) {
        console.error("Failed to prefill edit data:", err);
        toast.error("Failed to load dish data");
      }
    }
  }, [editMode, editDishData, steps, loading]);

  const currentStep = useMemo(() => steps[current], [steps, current]);
  const currentStepMenuItems = useMemo(() => {
    if (!currentStep) return [];
    return menuItemsByCategory[currentStep.categoryId] || [];
  }, [currentStep, menuItemsByCategory]);

  // Reset page when step changes
  useEffect(() => {
    setItemsPage(0);
  }, [currentStep?.id]);

  const totalItemPages = useMemo(
    () => Math.ceil(currentStepMenuItems.length / ITEMS_PER_PAGE),
    [currentStepMenuItems.length],
  );
  const paginatedItems = useMemo(() => {
    const start = itemsPage * ITEMS_PER_PAGE;
    return currentStepMenuItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentStepMenuItems, itemsPage]);

  const total = useMemo(() => {
    let sum = 0;
    for (const stepId in selection) {
      const picks = selection[stepId] || [];
      for (const pick of picks) {
        // Find the menu item across all categories
        for (const categoryId in menuItemsByCategory) {
          const item = menuItemsByCategory[categoryId].find(
            (m) => m.id === pick.menuItemId,
          );
          if (item) {
            sum += item.price * (pick.quantity || 1);
            break;
          }
        }
      }
    }
    return sum;
  }, [selection, menuItemsByCategory]);

  const totalKcal = useMemo(() => {
    let kcal = 0;
    for (const stepId in selection) {
      const picks = selection[stepId] || [];
      for (const pick of picks) {
        // Find the menu item across all categories
        for (const categoryId in menuItemsByCategory) {
          const item = menuItemsByCategory[categoryId].find(
            (m) => m.id === pick.menuItemId,
          );
          if (item) {
            kcal += (item.cal || 0) * (pick.quantity || 1);
            break;
          }
        }
      }
    }
    return kcal;
  }, [selection, menuItemsByCategory]);

  const toggleOption = (item: MenuItem) => {
    if (!currentStep) return;

    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      const isSelected = idx >= 0;

      // For now, allow multiple selections
      if (isSelected) {
        const copy = curr.slice();
        copy.splice(idx, 1);
        return { ...prev, [currentStep.id]: copy };
      } else {
        return {
          ...prev,
          [currentStep.id]: [...curr, { menuItemId: item.id, quantity: 1 }],
        };
      }
    });
  };

  const inc = (item: MenuItem) => {
    if (!currentStep) return;

    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 1) + 1 };
      return { ...prev, [currentStep.id]: copy };
    });
  };

  const dec = (item: MenuItem) => {
    if (!currentStep) return;

    setSelection((prev) => {
      const curr = prev[currentStep.id] || [];
      const idx = curr.findIndex((x) => x.menuItemId === item.id);
      if (idx === -1) return prev;
      const copy = curr.slice();
      const nextQ = (copy[idx].quantity || 1) - 1;
      if (nextQ <= 0) copy.splice(idx, 1);
      else copy[idx] = { ...copy[idx], quantity: nextQ };
      return { ...prev, [currentStep.id]: copy };
    });
  };

  const canNext = useMemo(() => {
    if (!currentStep) return false;

    // Allow skipping any step - user can choose not to select items
    return true;
  }, [currentStep, selection]);

  const prevItemsPage = () => setItemsPage((p) => Math.max(0, p - 1));
  const nextItemsPage = () =>
    setItemsPage((p) => Math.min(totalItemPages - 1, p + 1));

  const next = () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const hasAnySelection = useMemo(() => {
    // Check if user has selected at least one item in any step
    return Object.values(selection).some((picks) => picks.length > 0);
  }, [selection]);

  const handleDone = () => {
    if (!hasAnySelection) {
      toast.error("Vui lòng chọn ít nhất một món");
      return;
    }
    // Directly place order instead of showing summary modal
    placeOrder();
  };

  const placeOrder = () => {
    if (!selectedStoreId) return;

    const selections = Object.entries(selection)
      .filter(([_, picks]) => picks.length > 0) // Filter out empty selections
      .map(([stepId, picks]) => ({
        stepId: Number(stepId),
        items: picks.map((pick: { menuItemId: number; quantity: number }) => ({
          menuItemId: pick.menuItemId,
          quantity: pick.quantity || 1,
        })),
      }));

    // If in edit mode, update existing dish instead of adding new
    if (editMode && editDishId) {
      updateDish.mutate(
        {
          dishId: editDishId,
          request: {
            note: note.trim() || "Custom bowl",
            selections,
          },
        },
        {
          onSuccess: () => {
            toast.success("Custom dish updated!", {
              description: "Your changes have been saved successfully.",
              duration: 3000,
            });
            // Navigate back to cart
            navigate(APP_ROUTES.CART);
          },
          onError: (error: any) => {
            console.error("Failed to update custom dish:", error);

            if (error.response?.status === 401) {
              toast.error("Authentication required", {
                description: "Please login to update items in cart",
                duration: 4000,
              });
            } else {
              const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Failed to update dish";
              toast.error("Update failed", {
                description: errorMsg,
                duration: 4000,
              });
            }
          },
        },
      );
      return;
    }

    // Add new custom bowl to order
    addDish.mutate(
      {
        storeId: selectedStoreId,
        note: note.trim() || "Custom bowl",
        selections,
        isCustom: true,
      },
      {
        onSuccess: () => {
          // Reset builder
          setSelection({});
          setCurrent(0);
          setNote("");

          // Show add success toast
          toast.success("Custom bowl added to order!", {
            description: "Your custom dish has been added successfully.",
            duration: 3000,
          });
        },
        onError: (error: any) => {
          console.error("Failed to add custom bowl:", error);

          // Handle 401 Unauthorized
          if (error.response?.status === 401) {
            toast.error("Authentication required", {
              description: "Please login to add items to cart",
              duration: 4000,
            });
            // Optional: Trigger login modal
            window.dispatchEvent(new CustomEvent("auth:login-required"));
          } else {
            toast.error("Failed to add to order", {
              description: "Please try again or contact support.",
              duration: 4000,
            });
          }
        },
      },
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-8">
        <div className="mx-auto w-[95vw] overflow-x-hidden lg:w-[90vw]">
          {/* Header - Compact */}
          <div className="mb-4 text-center">
            <h1 className="mb-1 text-2xl font-bold text-gray-900 lg:text-3xl">
              {editMode ? "Edit Your Custom Dish" : "Build Your Perfect Bowl"}
            </h1>
            <p className="text-sm text-gray-600">
              {editMode
                ? "Update your customizations below"
                : "Customize your meal step by step"}
            </p>
            {editMode && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editing existing dish
              </div>
            )}
          </div>

          {/* Store selector - Compact */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <label className="text-xs font-medium text-gray-700 lg:text-sm">
              Store:
            </label>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm transition focus:border-transparent focus:ring-2 focus:ring-red-500"
              value={selectedStoreId ?? ""}
              onChange={(e) =>
                setSelectedStoreId(Number(e.target.value) || null)
              }
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-4 border-red-600"></div>
              <p className="mt-4 text-gray-600">
                Loading your custom builder...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Layout (Horizontal) - ưu tiên cho màn hình ngang */}
              <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-4">
                {/* Left Side: Step Builder */}
                <div className="min-w-0 space-y-4">
                  {/* Progress Indicator - More Compact */}
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        Step {current + 1} of {steps.length}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(((current + 1) / steps.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                        style={{
                          width: `${((current + 1) / steps.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      {steps.map((s, idx) => (
                        <div
                          key={s.id}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-300 ${
                              idx === current
                                ? "scale-110 bg-red-600 text-white shadow-md"
                                : idx < current
                                  ? "bg-red-400 text-white"
                                  : "bg-gray-300 text-gray-600"
                            }`}
                          >
                            {idx < current ? "✓" : idx + 1}
                          </div>
                          <span
                            className={`mt-0.5 max-w-[100px] truncate text-[10px] font-medium ${
                              idx === current ? "text-red-600" : "text-gray-500"
                            }`}
                          >
                            {s.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Step Display */}
                  {currentStep && (
                    <div className="w-full max-w-full overflow-hidden rounded-lg bg-white p-4 shadow-md">
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold tracking-wide text-red-600 uppercase lg:text-2xl">
                            {currentStep.name}
                          </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {currentStep.description}
                        </p>
                      </div>

                      {/* Items Grid - 4 columns x 3 rows pagination */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                          {paginatedItems.map((item) => {
                            const picks = selection[currentStep.id] || [];
                            const picked = picks.find(
                              (p) => p.menuItemId === item.id,
                            );
                            const isSelected = !!picked;
                            return (
                              <div
                                key={item.id}
                                className={`relative flex cursor-pointer rounded-lg border-2 bg-white p-3 shadow-sm transition hover:shadow-md ${isSelected ? "border-dashed border-red-600" : "border-solid border-gray-200"}`}
                                onClick={() => toggleOption(item)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    toggleOption(item);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                              >
                                <div className="relative mr-3 h-20 w-20 flex-shrink-0 overflow-visible rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                                  <img
                                    src={
                                      item.imageUrl || "/images/placeholder.svg"
                                    }
                                    alt={item.name}
                                    className="h-full w-full rounded-full object-cover"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).src = "/images/placeholder.svg";
                                    }}
                                  />
                                  {/* Calories badge overlay on image - bottom left */}
                                  <div className="absolute bottom-0 left-0 z-10 flex items-center gap-0.5 rounded-full bg-orange-500/95 px-1.5 py-0.5 text-white shadow-lg backdrop-blur-sm">
                                    <Flame className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">
                                      {item.cal || 0}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                  <div>
                                    <h3
                                      className={`text-sm font-semibold ${isSelected ? "text-red-600" : "text-gray-800"}`}
                                    >
                                      {item.name}
                                    </h3>
                                    <div className="mt-1 text-xs">
                                      <span className="font-semibold text-red-600">
                                        {new Intl.NumberFormat("vi-VN").format(
                                          item.price,
                                        )}
                                        đ
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="flex items-center gap-2 pt-2">
                                      <button
                                        className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dec(item);
                                        }}
                                      >
                                        −
                                      </button>
                                      <span className="min-w-[24px] text-center text-sm font-bold text-gray-800">
                                        {picked?.quantity || 1}
                                      </span>
                                      <button
                                        className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          inc(item);
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                  {!isSelected && (
                                    <div className="pt-2 text-[11px] text-gray-400">
                                      Click to select
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 shadow-md">
                                    <svg
                                      className="h-3.5 w-3.5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {paginatedItems.length === 0 && (
                            <div className="col-span-full py-10 text-center text-sm text-gray-400">
                              No items available
                            </div>
                          )}
                        </div>
                        {totalItemPages > 1 && (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={prevItemsPage}
                              disabled={itemsPage === 0}
                              className="flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-red-50 disabled:opacity-40"
                            >
                              <ChevronLeft className="h-4 w-4" /> Prev
                            </button>
                            <div className="text-xs font-semibold">
                              Page {itemsPage + 1} / {totalItemPages}
                            </div>
                            <button
                              onClick={nextItemsPage}
                              disabled={itemsPage === totalItemPages - 1}
                              className="flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-red-50 disabled:opacity-40"
                            >
                              Next <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons - Desktop */}
                  <div className="hidden items-center justify-between gap-3 lg:flex">
                    <button
                      className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={back}
                      disabled={current === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>

                    {current === steps.length - 1 ? (
                      <button
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleDone}
                        disabled={
                          !hasAnySelection ||
                          addDish.isPending ||
                          updateDish.isPending
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {addDish.isPending || updateDish.isPending
                          ? "Processing..."
                          : editMode
                            ? "Update Dish"
                            : "Add to Cart"}
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={next}
                        disabled={!canNext}
                      >
                        Next Step
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Summary Panel - Sticky on desktop */}
                <div className="mt-4 lg:sticky lg:top-20 lg:mt-0">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <ShoppingCart className="h-4 w-4 text-red-600" />
                      Your Selection
                    </h3>

                    {/* Summary Items */}
                    <div className="mb-3 max-h-[500px] space-y-3 overflow-y-auto">
                      {steps.map((s) => {
                        const picks = selection[s.id] || [];
                        if (picks.length === 0) return null;
                        const stepMenuItems =
                          menuItemsByCategory[s.categoryId] || [];
                        return (
                          <div
                            key={s.id}
                            className="border-b border-gray-100 pb-2.5"
                          >
                            <div className="mb-1.5 text-xs font-semibold text-red-600">
                              {s.name}
                            </div>
                            <ul className="space-y-1">
                              {picks.map((p) => {
                                const menuItem = stepMenuItems.find(
                                  (x) => x.id === p.menuItemId,
                                );
                                if (!menuItem) return null;
                                return (
                                  <li
                                    key={p.menuItemId}
                                    className="flex items-center justify-between text-xs text-gray-700"
                                  >
                                    <span className="line-clamp-1 flex-1">
                                      {menuItem.name}
                                      {p.quantity > 1 && (
                                        <span className="ml-1 font-semibold text-red-600">
                                          ×{p.quantity}
                                        </span>
                                      )}
                                    </span>
                                    <span className="ml-2 text-xs whitespace-nowrap text-gray-500">
                                      {new Intl.NumberFormat("vi-VN").format(
                                        menuItem.price * p.quantity,
                                      )}
                                      đ
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}

                      {Object.keys(selection).length === 0 && (
                        <p className="py-6 text-center text-xs text-gray-400">
                          No items selected yet
                        </p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 border-t-2 border-gray-200 pt-3">
                      <div className="flex items-center justify-between text-sm text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Calories</span>
                        </span>
                        <span className="font-bold">{totalKcal}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-gray-900">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-xl font-bold text-red-600">
                          {currencyFormat(total, "VND")}
                        </span>
                      </div>
                    </div>

                    {/* Note input - Below Summary */}
                    <div className="mt-4 border-t-2 border-gray-200 pt-4">
                      <label className="mb-2 block text-sm font-semibold text-gray-900">
                        Note
                      </label>
                      <textarea
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-dashed focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        placeholder="Add special instructions or notes..."
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={500}
                      />
                      <span className="mt-1 block text-right text-xs text-gray-500">
                        {note.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Buttons - shown only on mobile */}
              <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
                <button
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={back}
                  disabled={current === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                {current === steps.length - 1 ? (
                  <button
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleDone}
                    disabled={
                      !hasAnySelection ||
                      addDish.isPending ||
                      updateDish.isPending
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addDish.isPending || updateDish.isPending
                      ? "Processing..."
                      : editMode
                        ? "Update Dish"
                        : "Add to Cart"}
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={next}
                    disabled={!canNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CustomOrder;
