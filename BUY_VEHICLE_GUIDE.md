# Hướng Dẫn: Tính Năng Mua Xe (Buy Vehicle)

## ✅ Đã Hoàn Thành

### 1. API Integration
- Tạo method `createVehicleOrder()` trong `PaymentService`
- Gọi API `POST /api/buyer/orders`
- Chỉ truyền `listingId`, `basePrice = 0` (không dùng)

### 2. UI Implementation
- Connect nút "Mua ngay" với `handleBuyNow()`
- Hiển thị toast notification khi thành công/thất bại
- Log response để debug

## 🎯 Flow

### User Journey:
1. User xem trang detail xe (`/description-ev/:id`)
2. User click "Mua ngay"
3. Frontend gọi API tạo order
4. Backend tạo OrderId trong bảng `orders`
5. Hiển thị thông báo thành công

### API Request:
```json
POST /api/buyer/orders
{
  "listingId": 54,
  "basePrice": 0
}
```

### Code Flow:
```typescript
// DescriptionEV.tsx
const handleBuyNow = async () => {
  const listingId = evDetails.id;
  const response = await PaymentService.createVehicleOrder(listingId);
  showToast("Tạo đơn hàng thành công!", "success");
};

// PaymentService.ts
async createVehicleOrder(listingId: number) {
  const response = await api.post('/buyer/orders', {
    listingId: listingId,
    basePrice: 0
  });
  return response.data;
}
```

## 📋 Files Modified

### 1. `src/services/PaymentService.ts`
**Added method:**
```typescript
async createVehicleOrder(listingId: number): Promise<any> {
  const response = await api.post('/buyer/orders', {
    listingId: listingId,
    basePrice: 0 // Không dùng basePrice
  });
  return response.data;
}
```

### 2. `src/pages/DescriptionEV.tsx`
**Changes:**
- Import `PaymentService` và `showToast`
- Implement `handleBuyNow()` function
- Connect button với `onClick={handleBuyNow}`

## 🧪 Test Case

### Test 1: Tạo order thành công
**Input:**
- Listing ID: 54
- Click "Mua ngay"

**Expected:**
- API call: `POST /api/buyer/orders` với `{ listingId: 54, basePrice: 0 }`
- Backend tạo order trong bảng `orders`
- Frontend hiển thị: "Tạo đơn hàng thành công!"
- Console log: "Order created successfully"

### Test 2: Lỗi tạo order
**Input:**
- Listing ID: invalid
- Click "Mua ngay"

**Expected:**
- API error
- Frontend hiển thị: Error message từ backend
- Toast màu đỏ

## 📝 Backend Requirements

Backend cần xử lý:
1. Nhận `listingId` từ request
2. Tạo order trong bảng `orders`
3. Set `basePrice = 0` (không tính giá)
4. Trả về `orderId` cho frontend

### Database Schema (orders table):
```sql
- order_id (auto generated)
- listing_id (from request)
- base_price (set to 0)
- order_date (current timestamp)
- status (set default)
- buyer_id (from current user)
- seller_id (from listing)
```

## 🔍 Debug

### Console Logs:
```javascript
// Frontend
"Creating order for listingId: 54"
"Order created successfully: { order_id, ... }"

// Network Tab
Request: POST /api/buyer/orders
Body: { "listingId": 54, "basePrice": 0 }
```

## 🚀 Next Steps (Optional)

1. Chuyển đến trang đơn hàng sau khi tạo thành công
2. Hiển thị danh sách đơn hàng của user
3. Tích hợp payment flow
4. Thêm confirmation dialog trước khi tạo order

