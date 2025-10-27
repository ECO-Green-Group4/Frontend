# Backend Requirement: Custom Package Amount

## Vấn Đề

Frontend truyền `packageAmount` để override giá cố định từ package, nhưng backend cần xử lý field này.

## Yêu Cầu Backend

### Option 1: Nhận `packageAmount` (Recommended)

Khi tạo listing, backend nhận field `packageAmount` và sử dụng nó thay vì giá cố định từ package:

```java
// ListingController.java
@PostMapping("/seller/listings/vehicle")
public ResponseEntity<?> createVehicleListing(@RequestBody VehicleListingRequest request) {
    // ...
    
    // Nếu có packageAmount, dùng nó; nếu không, lấy từ package
    Long amount = request.getPackageAmount() != null 
        ? request.getPackageAmount() 
        : package.getListingFee() * request.getDurationDays();
    
    // Tạo listing package với amount đúng
    // ...
}
```

### Option 2: Tính Tự Động Từ `durationDays`

Backend tự tính amount dựa trên durationDays và package.listingFee:

```java
// ListingController.java
@PostMapping("/seller/listings/vehicle")
public ResponseEntity<?> createVehicleListing(@RequestBody VehicleListingRequest request) {
    // ...
    
    Package package = packageService.findById(request.getPackageId());
    Long amount = package.getListingFee() * request.getDurationDays();
    
    // Tạo listing package với amount đúng
    // ...
}
```

## Request Format

### Frontend gửi:
```json
{
  "packageId": 1,
  "durationDays": 10,
  "packageAmount": 20000,
  // ... other fields
}
```

### Backend cần xử lý:
- `packageAmount` (optional): Tổng tiền đã tính sẵn từ frontend
- `durationDays`: Số ngày muốn mua (để backend validate)

## Validation

Backend nên validate:
```java
if (request.getDurationDays() > 0 && request.getPackageAmount() != null) {
    // Kiểm tra: packageAmount == package.listingFee * durationDays
    Long expectedAmount = package.getListingFee() * request.getDurationDays();
    if (!request.getPackageAmount().equals(expectedAmount)) {
        throw new ValidationException("Package amount mismatch");
    }
}
```

## Priority

**High**: Cần fix ngay vì ảnh hưởng đến thanh toán của user.

## Test Case

### Input:
- Package ID: 1
- listingFee: 2000
- durationDays: 10
- packageAmount: 20000

### Expected:
- Listing package created với amount = 20000
- VNPay nhận amount = 20000

### Actual:
- Listing package created với amount = 2000 (sai)
- VNPay nhận amount = 2000 (sai)

