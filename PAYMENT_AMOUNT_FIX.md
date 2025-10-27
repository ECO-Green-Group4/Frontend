# Fix: Số Tiền Thanh Toán Không Đúng

## ❌ Vấn Đề

Khi mua 10 ngày với giá 2,000 ₫/ngày, tổng tiền hiển thị trên Payment page là **20,000 ₫** (đúng), nhưng khi chuyển sang VNPay chỉ tính **2,000 ₫** (sai - chỉ tính 1 ngày).

### Nguyên Nhân
Backend tạo listing package với giá cố định từ package gốc (price/day), không nhận amount tùy chỉnh từ frontend.

## ✅ Giải Pháp

### 1. Thêm `packageAmount` vào listingData
**File:** `src/pages/Payment.tsx`

```typescript
// Thêm durationDays và packageAmount vào listingData
const listingDataWithDays = {
  ...formData.data,
  durationDays: paymentInfo.days || 1,
  packageAmount: paymentInfo.amount // ← Tổng tiền đã tính (price/day * days)
};
```

### 2. Truyền `packageAmount` lên Backend
**File:** `src/services/PaymentService.ts`

```typescript
const requestData = {
  ...cleanData,
  packageId: packageId,
  // ... other fields ...
  packageAmount: cleanData.packageAmount // ← Thêm field này
};
```

## 🔄 Flow Hoàn Chỉnh

### Step 1: User chọn số ngày (CreatePost.tsx)
```
Package: Vip Silver (2,000 ₫/ngày)
Days: 10
Total: 20,000 ₫
```

### Step 2: Lưu vào paymentInfo
```typescript
const paymentInfo = {
  packageId: 1,
  amount: 20000, // ← Đúng
  days: 10
};
```

### Step 3: Tạo listing (Payment.tsx)
```typescript
const listingDataWithDays = {
  ...formData.data,
  durationDays: 10,
  packageAmount: 20000 // ← Truyền lên backend
};
```

### Step 4: Backend tạo listing package
Backend sẽ dùng `packageAmount: 20000` thay vì lấy giá cố định từ package.

### Step 5: VNPay nhận đúng amount
```
VNPay amount: 20,000 ₫ ✅
```

## 🧪 Test Case

### Input:
- Package: Vip Silver
- Price/day: 2,000 ₫
- Days: 10
- Expected total: 20,000 ₫

### Check Points:
1. ✅ Payment page hiển thị: 20,000 ₫
2. ✅ Listing data có: `packageAmount: 20000`
3. ✅ VNPay nhận: 20,000 ₫
4. ✅ Backend tạo package với amount: 20,000 ₫

## 📝 Backend Requirement

**Lưu ý:** Backend cần hỗ trợ nhận field `packageAmount` khi tạo listing để override giá cố định từ package.

Nếu backend không hỗ trợ field này, cần:
1. Backend cập nhật API để nhận `packageAmount`
2. Hoặc backend tính: `packageAmount = package.listingFee × durationDays`

## 🔍 Debug

Để debug, kiểm tra console log:
```javascript
// Payment.tsx
console.log('Total amount:', paymentInfo.amount);
console.log('Listing data with custom amount:', listingDataWithDays);

// PaymentService.ts
console.log('Request data with packageAmount:', requestData);
```

Nếu thấy `packageAmount` trong request data nhưng VNPay vẫn sai, vấn đề ở backend.

