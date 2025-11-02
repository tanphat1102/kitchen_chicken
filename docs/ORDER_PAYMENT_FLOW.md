# Order & Payment Flow - Complete Documentation

## 🔄 Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        ORDER & PAYMENT FLOW                       │
└──────────────────────────────────────────────────────────────────┘

1. USER ADDS ITEMS TO CART
   ├─ Menu page: Click "Add to Cart"
   ├─ Custom order: Build custom bowl
   └─ API: POST /api/orders/current/dishes
      └─ Creates/updates NEW order with items

2. USER VIEWS CART
   ├─ Navigate to /cart
   ├─ API: GET /api/orders/current?storeId=X
   ├─ Shows: Order items, selections, total price
   └─ Can: Update note, delete items

3. USER SELECTS PAYMENT METHOD
   ├─ API: GET /api/transaction/payment-method
   ├─ Shows: Available payment methods (VNPay, COD, etc.)
   └─ User selects payment method

4. USER CLICKS "CHECKOUT"
   ├─ Validates: Payment method selected
   ├─ API: POST /api/orders/confirm
   │  └─ Request: { orderId, paymentMethodId, promotionId? }
   └─ Response: { paymentUrl, orderId, message }

5. REDIRECT TO VNPAY
   ├─ Frontend: window.location.href = paymentUrl
   ├─ User redirected to VNPay payment gateway
   └─ User completes payment on VNPay

6. VNPAY CALLBACK
   ├─ VNPay redirects to: /payment/callback?params...
   ├─ Frontend extracts URL params
   ├─ API: POST /api/orders/vnpay-callback
   │  └─ Request: { all VNPay params as JSON }
   └─ Response: { success, message, orderId }

7. PAYMENT RESULT
   ├─ Success: Show success message
   │  └─ Redirect to /orders/history after 3s
   ├─ Failed: Show error message
   │  └─ Option to retry or go back to cart
   └─ Backend updates order status automatically

8. ORDER HISTORY
   ├─ Navigate to /orders/history
   ├─ API: GET /api/orders/history?storeId=X
   └─ Shows: All completed/cancelled/processing orders
```

## 📋 API Endpoints

### 1. Add Item to Cart

```http
POST /api/orders/current/dishes
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": 1,
  "note": "No onions please",
  "selections": [
    {
      "stepId": 1,
      "items": [
        { "menuItemId": 10, "quantity": 1 }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 123,
    "dishes": [...],
    "totalPrice": 150000
  }
}
```

### 2. Get Current Order

```http
GET /api/orders/current?storeId=1
Authorization: Bearer {token}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 123,
    "storeId": 1,
    "storeName": "Store Central",
    "orderStatusName": "NEW",
    "totalPrice": 150000,
    "dishes": [...]
  }
}
```

### 3. Confirm Order (Checkout)

```http
POST /api/orders/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": 123,
  "paymentMethodId": 1,
  "promotionId": 5,  // Optional - 0 if not using promotion
  "channel": "WEB"   // REQUIRED - Platform identifier
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "orderId": 123,
    "message": "Order confirmed"
  }
}
```

### 4. VNPay Callback

```http
POST /api/orders/vnpay-callback
Content-Type: application/json

{
  "vnp_Amount": "15000000",
  "vnp_BankCode": "NCB",
  "vnp_CardType": "ATM",
  "vnp_OrderInfo": "Thanh toan don hang 123",
  "vnp_ResponseCode": "00",
  "vnp_TransactionNo": "13804390",
  "vnp_TxnRef": "123",
  ...
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Payment successful",
  "data": {
    "orderId": 123,
    "status": "CONFIRMED"
  }
}
```

### 5. Get Order History

```http
GET /api/orders/history?storeId=1
Authorization: Bearer {token}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": 123,
      "orderStatusName": "COMPLETED",
      "totalPrice": 150000,
      "createdAt": "2025-11-01T10:00:00",
      "dishes": [...],
      "feedback": {...}
    }
  ]
}
```

## 💻 Frontend Implementation

### Cart Page - Checkout Handler

```typescript
const handleCheckout = () => {
  if (!order?.id || !selectedPaymentMethod) return;

  confirmOrder.mutate(
    {
      orderId: order.id,
      paymentMethodId: selectedPaymentMethod,
      promotionId: 0, // 0 if not using promotion
      channel: "WEB", // Platform identifier
    },
    {
      onSuccess: (data) => {
        // Auto redirect handled by hook
        // window.location.href = data.paymentUrl
      },
      onError: (error) => {
        alert("Checkout failed. Please try again.");
      },
    },
  );
};
```

### useConfirmOrder Hook

```typescript
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OrderConfirmRequest) =>
      orderPaymentService.confirmOrder(request),
    onSuccess: (data) => {
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      queryClient.invalidateQueries({ queryKey: ["orderHistory"] });

      // Auto redirect to VNPay
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });
}
```

### Payment Callback Page

```typescript
useEffect(() => {
  const processPayment = async () => {
    // Extract URL params
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Call backend callback API
    const response = await orderPaymentService.vnpayCallback(params);

    // Show success and redirect
    setStatus("success");
    setTimeout(() => {
      navigate("/orders/history");
    }, 3000);
  };

  processPayment();
}, [searchParams]);
```

## 🎯 Order Status Flow

```
NEW → CONFIRMED → PROCESSING → READY → COMPLETED
              ↓
          CANCELLED
```

**Status Descriptions:**

- **NEW**: Cart items added, not yet checked out
- **CONFIRMED**: Payment successful, waiting for employee accept
- **PROCESSING**: Employee accepted, preparing order
- **READY**: Order ready for pickup/delivery
- **COMPLETED**: Order delivered to customer
- **CANCELLED**: Order cancelled by user or system

## 🔐 Security & Validation

### Frontend Validation

- ✅ Check user logged in
- ✅ Check order exists
- ✅ Check payment method selected
- ✅ Validate order has items

### Backend Validation

- ✅ JWT token authentication
- ✅ Order ownership check
- ✅ Order status validation
- ✅ Payment method active check
- ✅ VNPay signature verification

## ⚠️ Error Handling

### Common Errors

**401 Unauthorized**

```typescript
if (error.response?.status === 401) {
  // Clear invalid token
  localStorage.removeItem("accessToken");
  // Show login modal
  window.dispatchEvent(new CustomEvent("auth:login-required"));
}
```

**400 Bad Request**

```typescript
// Missing required field or validation error
alert("Invalid request. Please check your input.");
```

**Payment Failed**

```typescript
if (response.vnp_ResponseCode !== "00") {
  setStatus("error");
  setMessage("Payment failed. Please try again.");
}
```

## 📱 User Experience

### Loading States

- ✅ Cart page: Skeleton loading
- ✅ Checkout button: "Processing..." with spinner
- ✅ Payment callback: Processing indicator
- ✅ Redirect countdown: 3 seconds

### Success Flow

1. Show success checkmark ✓
2. Display success message
3. Show countdown timer
4. Auto redirect to order history

### Failure Flow

1. Show error icon ✗
2. Display error message
3. Provide action buttons:
   - Back to Cart
   - Back to Home

## 🧪 Testing Scenarios

### Happy Path

1. Add items to cart ✓
2. Select payment method ✓
3. Click checkout ✓
4. Complete VNPay payment ✓
5. Callback processed ✓
6. View order in history ✓

### Error Cases

- No items in cart → Show empty state
- Not logged in → Show login prompt
- No payment method → Show alert
- Payment failed → Show error + retry option
- Network error → Show error message

## 📝 Environment Variables

```env
VITE_API_BASE_URL=https://chickenkitchen.milize-lena.space
```

## 🚀 Production Checklist

- [ ] Configure VNPay production credentials
- [ ] Set correct return URL
- [ ] Enable SSL/HTTPS
- [ ] Add error logging (Sentry)
- [ ] Add analytics tracking
- [ ] Test all payment methods
- [ ] Test callback with real VNPay
- [ ] Add timeout handling
- [ ] Add payment retry mechanism
- [ ] Add email notifications

## 📖 Related Documentation

- Order Customer Service: `docs/ORDER_CUSTOMER_SERVICE.md`
- Authentication: `docs/AUTHENTICATION_401.md`
- API Integration: `API_INTEGRATION_SUMMARY.md`
