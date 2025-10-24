# Hệ Thống Thanh Toán - Payment System

## Tổng Quan

Hệ thống thanh toán được thiết kế để xử lý tất cả các loại thanh toán trong ứng dụng EcoGreen, bao gồm:
- Thanh toán gói đăng tin (Create Post)
- Thanh toán gói thành viên (Membership)
- Mua xe điện (Vehicle Purchase)
- Mua pin (Battery Purchase)

## Cấu Trúc Files

### 1. Trang Thanh Toán Chính
- **`src/pages/Payment.tsx`**: Trang thanh toán chính với giao diện đẹp và các phương thức thanh toán
- **`src/routes/AppRoutes.tsx`**: Route `/payment` được bảo vệ bởi ProtectedRoute

### 2. Services & Utils
- **`src/services/PostPaymentService.ts`**: Service xử lý tạo post sau khi thanh toán thành công
- **`src/utils/paymentUtils.ts`**: Utility functions để tạo PaymentInfo và navigate đến trang thanh toán

### 3. Components
- **`src/components/PaymentButton.tsx`**: Component nút thanh toán có thể tái sử dụng

## Cách Sử Dụng

### 1. Thanh Toán Cho Đăng Tin (Create Post)

```typescript
// Trong CreatePost.tsx
const handleFormSubmit = async (data: any) => {
  // Kiểm tra package đã chọn
  if (!selectedPackageId) {
    showToast("Vui lòng chọn gói đăng tin", "error");
    return;
  }

  // Tạo PaymentInfo
  const paymentInfo = {
    packageId: selectedPackage.packageId,
    packageName: selectedPackage.name,
    amount: selectedPackage.listingFee,
    type: category === "Battery" ? "battery" : "vehicle",
    description: `Đăng tin ${category === "Battery" ? "pin" : "xe điện"} - ${data.title}`
  };

  // Lưu dữ liệu form vào sessionStorage
  const formData = { category, data, selectedPackageId };
  sessionStorage.setItem('pendingPostData', JSON.stringify(formData));

  // Chuyển đến trang Payment
  navigate("/payment", { state: { paymentInfo } });
};
```

### 2. Thanh Toán Cho Membership

```typescript
// Sử dụng PaymentButton component
<PaymentButton
  paymentInfo={createMembershipPaymentInfo(
    plan.id,
    plan.name,
    plan.priceValue,
    `Gói thành viên ${plan.name} - ${plan.price}/tháng`
  )}
  className="w-full py-3 rounded-full text-lg font-bold"
>
  Choose Plan
</PaymentButton>
```

### 3. Thanh Toán Cho Mua Xe/Pin

```typescript
// Sử dụng PaymentButton với utility functions
<PaymentButton
  paymentInfo={createVehiclePurchasePaymentInfo(
    vehicleId,
    vehicleName,
    vehiclePrice
  )}
  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg"
>
  Mua ngay
</PaymentButton>
```

## Flow Thanh Toán

### 1. Đăng Tin (Create Post)
1. User chọn package và điền form
2. Click "Create Post" → Chuyển đến `/payment`
3. User chọn phương thức thanh toán và thanh toán
4. Sau khi thanh toán thành công → Tự động tạo post
5. Chuyển đến `/waiting` với thông báo chờ admin duyệt

### 2. Membership/Vehicle/Battery Purchase
1. User click nút thanh toán
2. Chuyển đến `/payment` với thông tin thanh toán
3. User chọn phương thức thanh toán và thanh toán
4. Chuyển đến `/waiting` với thông báo chờ admin duyệt

## API Integration

### Placeholder cho Backend API

Trong `src/pages/Payment.tsx`, có placeholder cho API payment:

```typescript
// TODO: Thay thế bằng API payment thực tế từ backend
const paymentData = {
  packageId: paymentInfo.packageId,
  amount: paymentInfo.amount,
  paymentMethod: selectedPaymentMethod,
  type: paymentInfo.type,
  description: paymentInfo.description
};

// TODO: Gọi API payment thực tế
// const response = await api.post('/payment/process', paymentData);
```

### Cần Backend Cung Cấp

1. **API Payment Processing**
   - `POST /payment/process`: Xử lý thanh toán
   - `GET /payment/methods`: Lấy danh sách phương thức thanh toán
   - `POST /payment/verify`: Xác minh thanh toán

2. **API Post Creation After Payment**
   - `POST /seller/listings/vehicle`: Tạo bài đăng xe (đã có)
   - `POST /seller/listings/battery`: Tạo bài đăng pin (đã có)

## Phương Thức Thanh Toán

Trang Payment hỗ trợ các phương thức:
- **Banking**: Chuyển khoản ngân hàng
- **MoMo**: Ví điện tử MoMo
- **ZaloPay**: ZaloPay
- **VNPay**: VNPay

## Security & Validation

1. **Protected Routes**: Trang Payment được bảo vệ bởi ProtectedRoute
2. **Data Validation**: Kiểm tra PaymentInfo hợp lệ trước khi hiển thị
3. **Session Storage**: Lưu dữ liệu form tạm thời trong sessionStorage
4. **Error Handling**: Xử lý lỗi thanh toán và hiển thị thông báo phù hợp

## Customization

### Thêm Phương Thức Thanh Toán Mới

1. Thêm option vào `selectedPaymentMethod` state
2. Thêm UI cho phương thức mới trong Payment.tsx
3. Cập nhật logic xử lý trong `handlePayment`

### Thêm Loại Thanh Toán Mới

1. Cập nhật `PaymentInfo` interface
2. Thêm utility function trong `paymentUtils.ts`
3. Cập nhật logic xử lý trong Payment.tsx

## Testing

Để test hệ thống thanh toán:

1. **Test Create Post Flow**:
   - Vào `/create-post`
   - Chọn package và điền form
   - Click "Create Post"
   - Kiểm tra chuyển đến `/payment`
   - Test thanh toán và chuyển đến `/waiting`

2. **Test Membership Flow**:
   - Vào `/membership`
   - Click "Choose Plan"
   - Kiểm tra chuyển đến `/payment`
   - Test thanh toán

3. **Test Vehicle/Battery Purchase**:
   - Vào trang chi tiết xe/pin
   - Click "Mua ngay"
   - Kiểm tra chuyển đến `/payment`

## Troubleshooting

### Lỗi Thường Gặp

1. **"Thông tin thanh toán không hợp lệ"**
   - Kiểm tra PaymentInfo có đầy đủ không
   - Kiểm tra navigation state

2. **"Không tìm thấy dữ liệu đăng tin"**
   - Kiểm tra sessionStorage có dữ liệu không
   - Kiểm tra PostPaymentService

3. **Lỗi API**
   - Kiểm tra network connection
   - Kiểm tra API endpoints
   - Kiểm tra authentication

## Future Enhancements

1. **Payment Gateway Integration**
   - Tích hợp VNPay, MoMo, ZaloPay APIs
   - Webhook handling cho payment callbacks

2. **Payment History**
   - Trang lịch sử thanh toán
   - Invoice generation

3. **Refund System**
   - Xử lý hoàn tiền
   - Refund workflow

4. **Payment Analytics**
   - Dashboard thanh toán cho admin
   - Revenue tracking

5. **Mobile Payment**
   - QR code payment
   - Mobile wallet integration
