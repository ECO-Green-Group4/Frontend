# 🔍 Debug: Payment Amount Issue

## Cách Kiểm Tra

### 1. Mở Console (F12)

#### Khi tạo post (CreatePost.tsx):
```
✅ Expected:
Custom days: 30
Total amount: 300000
```

#### Khi submit form (Payment.tsx):
```
✅ Expected:
Custom days: 30
Total amount: 300000
Listing data with custom amount: { ..., packageAmount: 300000 }
```

#### Khi gửi API (PaymentService.ts):
```
✅ Expected:
Request data with packageAmount: { ..., packageAmount: 300000 }
Sending to API: /seller/listings/vehicle { ..., packageAmount: 300000 }
```

### 2. Check Network Tab

#### Request: POST `/seller/listings/vehicle`
```json
{
  "packageId": 1,
  "durationDays": 30,
  "packageAmount": 300000,  // ← Có field này
  // ... other fields
}
```

#### Response: 
```json
{
  "data": {
    "id": 123,
    "listingPackageId": 456,
    "packageAmount": 10000  // ← SAI! Phải là 300000
  }
}
```

## 🎯 Kết Luận

**Nếu thấy:**
- ✅ Console có `packageAmount: 300000`
- ✅ Network request có `packageAmount: 300000`
- ❌ Network response có `packageAmount: 10000`

**→ Backend không dùng packageAmount, cần fix backend**

## ✅ Solution

Backend cần:
1. Nhận field `packageAmount` từ request
2. Dùng `packageAmount` khi tạo listing package
3. Không dùng giá cố định từ package

## 📝 File Location

Frontend code đã đúng:
- ✅ `src/pages/Payment.tsx` - Line 98: `packageAmount: paymentInfo.amount`
- ✅ `src/services/PaymentService.ts` - Line 89: `packageAmount: cleanData.packageAmount`

Backend cần fix:
- 📍 Controller: `VehicleListingRequest`, `BatteryListingRequest`
- 📍 Service: Listing creation logic
- 📍 Entity: ListingPackage.amount

