# ⚠️ BACKEND FIX REQUIRED - Vấn Đề Thanh Toán

## 🔴 Vấn Đề Hiện Tại

User mua **30 ngày Vip Diamond** (10,000 ₫/ngày) → **Tổng: 300,000 ₫**
Nhưng VNPay chỉ tính **10,000 ₫** (sai)

### Root Cause
Backend tạo listing package với amount = package.listingFee (cố định), không nhận `packageAmount` từ frontend.

## 🔍 Debug Steps

### 1. Check Console Log
Mở Console (F12) khi tạo post, tìm:
```
Total amount: 300000
Listing data with custom amount: { ..., packageAmount: 300000 }
Request data with packageAmount: { ..., packageAmount: 300000 }
```

Nếu thấy `packageAmount: 300000` → Frontend đúng, **Backend không dùng field này**.

### 2. Check Network Tab
Xem request POST `/seller/listings/vehicle` hoặc `/seller/listings/battery`:
```json
{
  "packageId": 1,
  "durationDays": 30,
  "packageAmount": 300000,  // ← Frontend gửi đúng
  // ...
}
```

## ✅ Backend Fix Required

### Option 1: Nhận `packageAmount` (Recommended)

**Backend Controller:**
```java
@PostMapping("/seller/listings/vehicle")
public ResponseEntity<?> createVehicleListing(@RequestBody VehicleListingRequest request) {
    // ...
    
    // Tạo listing package với amount đúng
    Long packageAmount = request.getPackageAmount() != null 
        ? request.getPackageAmount() 
        : package.getListingFee() * request.getDurationDays();
    
    ListingPackage listingPackage = new ListingPackage();
    listingPackage.setPackageId(request.getPackageId());
    listingPackage.setDurationDays(request.getDurationDays());
    listingPackage.setAmount(packageAmount); // ← Dùng amount đúng
    
    // ...
}
```

### Option 2: Tính Tự Động

```java
Long packageAmount = package.getListingFee() * request.getDurationDays();
listingPackage.setAmount(packageAmount);
```

## 🧪 Test Case

### Input:
- Package: Vip Diamond
- Price/day: 10,000 ₫
- Duration days: 30
- Expected amount: 300,000 ₫

### Backend Expected Behavior:
1. Receive `durationDays: 30`
2. Receive `packageAmount: 300000` (optional, from frontend)
3. Create listing package với amount = 300,000 ₫
4. VNPay nhận amount = 300,000 ₫

### Actual (Bug):
1. Receive `durationDays: 30`
2. Receive `packageAmount: 300000` (ignored)
3. Create listing package với amount = 10,000 ₫ ❌
4. VNPay nhận amount = 10,000 ₫ ❌

## 📋 Action Items for Backend Team

1. **Update DTO:** Thêm field `packageAmount` vào `VehicleListingRequest` và `BatteryListingRequest`
2. **Update Service:** Dùng `packageAmount` khi tạo listing package
3. **Add Validation:** Validate amount nếu có
4. **Update Test:** Test với durationDays > 1

## 💡 Quick Workaround (Temporary)

Nếu không thể fix ngay, có thể:
1. Tạm thời **không cho user mua > 1 ngày** trong admin panel
2. Hoặc tạo package riêng cho 30 ngày (300,000 ₫)

NHƯNG: Đây chỉ là workaround, cần fix backend ngay.

