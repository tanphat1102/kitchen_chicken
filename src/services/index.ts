// Export all services
export { api } from "./api";
export { authService } from "./authService";
export { categoryService } from "./categoryService";
export { dailyMenuService } from "./dailyMenuService";
export { dashboardService } from "./dashboardService";
export { menuItemService } from "./menuItemService";
export { userService } from "./userService";

// Export store service (different pattern)
export {
  createStore,
  deleteStore,
  getAllStores,
  getStoreById,
  storeService,
  toggleStoreStatus,
  updateStore,
} from "./storeService";

// Export new services
export { dishService } from "./dishService";
export { ingredientService } from "./ingredientService";
export { managerDishService } from "./managerDishService";
export { nutrientService } from "./nutrientService";
export { orderCustomerService } from "./orderCustomerService";
export { orderEmployeeService } from "./orderEmployeeService";
export { orderPaymentService } from "./orderPaymentService";
export { paymentMethodService } from "./paymentMethodService";
export { promotionService } from "./promotionService";
export { stepService } from "./stepService";
export { transactionService } from "./transactionService";

// Export types
export type {
  DishStep as CustomerDishStep,
  Nutrient as CustomerNutrient,
  Dish,
  DishSummary,
  MenuItemShort,
} from "./dishService";
export type {
  CreateIngredientRequest,
  Ingredient,
  UpdateIngredientRequest,
} from "./ingredientService";
export type {
  CreateDishRequest as CreateManagerDishRequest,
  Nutrient as DishNutrient,
  DishStep,
  Dish as ManagerDish,
  UpdateDishRequest as UpdateManagerDishRequest,
} from "./managerDishService";
export type {
  CreateNutrientRequest,
  Nutrient,
  UpdateNutrientRequest,
} from "./nutrientService";
export type {
  CreateDishRequest,
  CreateFeedbackRequest,
  DishSelection,
  Order,
  OrderDish,
  DishStep as OrderDishStep,
  OrderDishWithSteps,
  OrderFeedback,
  OrderStatus,
  OrderTracking,
  SelectionItem,
  StepItem,
  StepSelection,
  UpdateDishRequest,
} from "./orderCustomerService";
export type {
  OrderConfirmRequest,
  OrderConfirmResponse,
} from "./orderPaymentService";
export type {
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from "./paymentMethodService";
export type {
  CreatePromotionRequest,
  DiscountType,
  Promotion,
  UpdatePromotionRequest,
} from "./promotionService";
export type { CreateStepRequest, Step, UpdateStepRequest } from "./stepService";
export type { CreateStoreDto, Store, UpdateStoreDto } from "./storeService";
export type { Transaction, TransactionStatus } from "./transactionService";
