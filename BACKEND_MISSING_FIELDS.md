# Backend Missing Fields - Frontend Feedback

Hey team! �

Mình vừa audit xong toàn bộ Admin & Manager services, phát hiện ra một số fields còn thiếu ở backend APIs. Gửi bạn list này để check xem có thể bổ sung không nhé!

---

## 🔴 1. INGREDIENT MODULE

### Hiện tại backend có:
```kotlin
data class CreateIngredientRequest(
    val name: String,
    val baseUnit: UnitType,
    val createAt: LocalDateTime,
    val imageUrl: String?,
    val isActive: Boolean,
    val storeIds: List<Long>,
    val batchNumber: String?,
    val quantity: BigDecimal
)
```

### Cần bổ sung thêm:
```kotlin
val description: String? = null,        // Mô tả nguyên liệu
val minimumStock: BigDecimal? = null,   // Ngưỡng cảnh báo hết hàng (cho low stock alerts)
val expiryDate: LocalDate? = null,      // Hạn sử dụng (cho FIFO tracking + food safety)
val supplierId: Long? = null            // Nhà cung cấp
```

**Tại sao cần:**
- `minimumStock`: Manager dashboard cần hiển thị low stock alerts (BR-36, BR-37)
- `expiryDate`: Bắt buộc để implement FIFO tracking (BR-38) và prevent expired ingredients (BR-39)
- `description`: Phân biệt các loại nguyên liệu tương tự (vd: "Gà hữu cơ" vs "Gà thường")
- `supplierId`: Audit trail cho inventory adjustments (BR-40)

### Response cũng cần có:
```kotlin
data class IngredientResponse(
    // ... existing fields
    val description: String?,
    val minimumStock: BigDecimal?,
    val expiryDate: LocalDate?,
    val supplierId: Long?,
    val supplierName: String?    // Join từ Supplier table
)
```

---

## 🟠 2. PROMOTION MODULE

### Hiện tại backend có:
```kotlin
data class CreatePromotionRequest(
    val discountType: DiscountType,
    val discountValue: BigDecimal,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean,
    val quantity: Int
)
```

### Cần bổ sung thêm:
```kotlin
val name: String,                 // Tên promotion (REQUIRED)
val description: String? = null   // Điều khoản áp dụng
```

**Tại sao cần:**
- `name`: Không có name thì không biết đâu là "Black Friday", đâu là "Summer Sale" 😅
- `description`: Manager cần ghi điều kiện áp dụng (vd: "Chỉ áp dụng buổi trưa", "Đơn từ 100k")

### Response cũng cần có:
```kotlin
data class PromotionResponse(
    // ... existing fields
    val name: String,
    val description: String?,
    val usedCount: Int = 0    // Số lần đã dùng (để tính stats)
)
```

---

## ✅ Summary

| Module | Fields cần thêm | Priority |
|--------|----------------|----------|
| **Ingredients** | `description`, `minimumStock`, `expiryDate`, `supplierId` | Critical (FIFO + food safety) |
| **Promotions** | `name`, `description` | High (UX + management) |

Các UpdateRequest tương ứng cũng cần có các fields này nhé!

---

Bạn check giúp mình xem có OK không? Nếu cần thêm context hay có thắc mắc gì thì ping mình nha! 🙏

Cảm ơn bạn nhiều! �
