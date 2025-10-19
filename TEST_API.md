# Test API Stores - Chicken Kitchen

## 1. Kiểm Tra Token

Mở Console trong Browser (F12) và chạy:

```javascript
// Lấy token hiện tại từ Firebase
const user = firebase.auth().currentUser;
if (user) {
  const token = await user.getIdToken();
  console.log('Firebase Token:', token);
}
```

Hoặc dùng token bạn đã có:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0MTExQGdtYWlsLmNvbSIsImlhdCI6MTczMDg5ODczMSwiZXhwIjoxNzMwOTAyMzMxfQ.cHmFOBSUCmwF9XMKVPAy7-QZr7YwY-Rr4yO3VDUWQmQ
```

---

## 2. Test GET Stores

### Swagger UI Test:
1. Vào: https://app.swaggerhub.com/apis-docs/KIETPT1102/ChickenKitchen/1.0.0
2. Tìm endpoint `GET /stores`
3. Click "Try it out" → "Execute"
4. **Copy toàn bộ Response** và gửi cho tôi

### Hoặc dùng curl:
```bash
curl -X GET "https://chickenkitchen.milize-lena.space/api/stores" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 3. Test POST Create Store

```bash
curl -X POST "https://chickenkitchen.milize-lena.space/api/stores" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Store",
    "address": "123 Test Street",
    "phone": "+84 28 1234 5678",
    "email": "test@chickenkitchen.com",
    "openTime": "08:00",
    "closeTime": "22:00"
  }'
```

**Gửi cho tôi:**
- ✅ Response nếu thành công
- ❌ Error message nếu thất bại
- 📝 Response format (JSON structure)

---

## 4. Thông Tin Cần Xác Nhận:

### A. Response Format của GET /stores:

Có phải dạng này không?
```json
[
  {
    "id": "1",
    "name": "Store Name",
    "address": "Full Address",
    "phone": "+84...",
    "email": "email@example.com",
    "status": "ACTIVE",
    "openTime": "08:00",
    "closeTime": "22:00",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

Hay là paginated?
```json
{
  "content": [...stores],
  "totalElements": 10,
  "totalPages": 2,
  "size": 5,
  "number": 0
}
```

### B. Field Names:
- Status values: `"ACTIVE"` / `"INACTIVE"` hay `"active"` / `"inactive"`?
- Time format: `"08:00"` hay `"08:00:00"`?
- Date format: ISO 8601 với timezone?

### C. Error Responses:
- 400 Bad Request format?
- 401 Unauthorized format?
- 404 Not Found format?

---

## 5. Checklist Trước Khi Integrate:

- [ ] Token còn hiệu lực
- [ ] GET /stores hoạt động
- [ ] Response format đã xác nhận
- [ ] POST /stores test thành công
- [ ] Field names match với interface
- [ ] Error handling đã test

---

## Khi nào bạn đã có thông tin trên, gửi cho tôi:

1. ✅ Sample response của GET /stores (ít nhất 1 store)
2. ✅ Sample response của POST /stores
3. ✅ Error response examples (nếu có)
4. ✅ Xác nhận field names và data types

Tôi sẽ update code để integrate với API thật ngay! 🚀
