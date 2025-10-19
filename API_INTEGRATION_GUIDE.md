# 🔌 API Integration Guide - Chicken Kitchen Admin

## 📋 **Tóm Tắt**

Frontend đã được setup để **dễ dàng chuyển đổi** giữa:
- ✅ **Mock Data** (hiện tại) - để develop không cần backend
- ✅ **Real API** - khi backend sẵn sàng

---

## 🎯 **Cách Chuyển Đổi**

### **Hiện Tại: Đang Dùng Mock Data**

File `.env`:
```properties
VITE_USE_MOCK_DATA=true
```

### **Khi Muốn Dùng Real API:**

1. Đổi trong file `.env`:
```properties
VITE_USE_MOCK_DATA=false
```

2. Restart dev server:
```bash
npm run dev
```

**Xong! Tất cả API calls sẽ tự động chuyển sang backend thật.**

---

## 📁 **Cấu Trúc Code**

### **1. Environment Config (`src/config/env.ts`)**
```typescript
export const ENV = {
  API_BASE_URL: 'https://chickenkitchen.milize-lena.space/api',
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  // ... other configs
}
```

### **2. Service Layer (`src/services/storeService.ts`)**

Code tự động chọn giữa mock và real:

```typescript
export const getAllStores = async (): Promise<Store[]> => {
  return ENV.USE_MOCK_DATA 
    ? mockApiGetAllStores()    // 👈 Mock data
    : realApiGetAllStores();   // 👈 Real API call
};
```

### **3. Component (`src/pages/admin/Stores.tsx`)**

Component không cần biết đang dùng mock hay real:

```typescript
const fetchStores = async () => {
  const data = await getAllStores(); // ✅ Tự động chọn
  setStores(data);
};
```

---

## 🧪 **Testing Real API**

### **Bước 1: Kiểm Tra API Response**

Test bằng Swagger hoặc curl:
```bash
curl -X GET "https://chickenkitchen.milize-lena.space/api/stores" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### **Bước 2: Xác Nhận Response Format**

Đảm bảo response khớp với interface:

```typescript
interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  openTime?: string;
  closeTime?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### **Bước 3: Test Từng Endpoint**

✅ **GET /stores** - Lấy danh sách
✅ **POST /stores** - Tạo mới
✅ **PUT /stores/{id}** - Cập nhật
✅ **PATCH /stores/{id}/toggle-status** - Đổi trạng thái
✅ **DELETE /stores/{id}** - Xóa

---

## 🔧 **Nếu API Response Khác Format**

### **Trường hợp 1: Response có wrapper**

Nếu API trả về:
```json
{
  "data": [...stores],
  "message": "Success",
  "status": 200
}
```

Sửa trong `storeService.ts`:
```typescript
const realApiGetAllStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data.data; // 👈 Thêm .data
};
```

### **Trường hợp 2: Pagination**

Nếu API có pagination:
```json
{
  "content": [...stores],
  "totalElements": 10,
  "totalPages": 2
}
```

Sửa:
```typescript
const realApiGetAllStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data.content; // 👈 Lấy .content
};
```

### **Trường hợp 3: Field Names Khác**

Nếu API dùng `snake_case` thay vì `camelCase`:
```json
{
  "open_time": "08:00",
  "close_time": "22:00"
}
```

Tạo mapper function:
```typescript
const mapApiResponseToStore = (apiData: any): Store => ({
  id: apiData.id,
  name: apiData.name,
  address: apiData.address,
  phone: apiData.phone,
  email: apiData.email,
  status: apiData.status,
  openTime: apiData.open_time,    // 👈 Convert
  closeTime: apiData.close_time,  // 👈 Convert
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at,
});
```

---

## 🚨 **Error Handling**

Code đã có error handling:

```typescript
try {
  const data = await getAllStores();
  setStores(data);
} catch (error) {
  console.error("Error fetching stores:", error);
  alert("Failed to load stores. Please try again.");
}
```

**Backend cần trả về error format:**
```json
{
  "message": "Error description",
  "status": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 🔐 **Authentication Flow**

### **Hiện Tại:**

```
1. User login với Firebase
2. Get Firebase idToken
3. Send to backend /api/auth/login
4. Receive JWT accessToken
5. Store in axios interceptor
6. All API calls auto include: Authorization: Bearer {token}
```

### **Token trong api.ts:**

```typescript
instance.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

---

## ✅ **Checklist Trước Khi Switch to Real API**

- [ ] Backend API đã deploy và accessible
- [ ] Test GET /stores - có data trả về
- [ ] Response format khớp với interface
- [ ] Authentication working (token valid)
- [ ] Test tạo store mới (POST)
- [ ] Test update store (PUT)
- [ ] Test delete store (DELETE)
- [ ] Error responses có format đúng
- [ ] CORS đã config (nếu cần)

---

## 📞 **Khi Cần Hỗ Trợ**

Nếu gặp lỗi khi integrate với real API, cung cấp:

1. ✅ Console error logs
2. ✅ Network tab - request/response
3. ✅ API endpoint đang gọi
4. ✅ Sample response từ Swagger
5. ✅ Backend error logs (nếu có)

---

## 🎯 **Summary**

| Feature | Mock Data | Real API |
|---------|-----------|----------|
| **Switch method** | `.env` file | `.env` file |
| **Code changes** | ❌ None | ❌ None |
| **Restart needed** | ✅ Yes | ✅ Yes |
| **Authentication** | ❌ Not needed | ✅ Required |
| **Network calls** | ❌ Simulated | ✅ Real HTTP |
| **Data persistence** | ❌ In-memory | ✅ Database |

**Hiện tại đang dùng Mock Data để develop mà không cần backend!** 🚀
