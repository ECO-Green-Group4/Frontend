# Hướng Dẫn Test Validation - Create Post

## ✅ Đã Sửa Lỗi Validation

### Vấn Đề Trước Đây:
- User có thể click "Create Post" mà không nhập dữ liệu gì
- Hệ thống vẫn chuyển đến trang Payment
- Không có validation cho các trường bắt buộc

### Giải Pháp Đã Áp Dụng:

#### 1. **Validation Trong Form Con (VehicleForm.tsx & BatteryForm.tsx)**
```typescript
// Kiểm tra các trường bắt buộc trước khi submit
if (!vehicleData.title || !vehicleData.title.trim()) {
  showToast("Vui lòng nhập tiêu đề xe", "error");
  return;
}

if (!vehicleData.description || !vehicleData.description.trim()) {
  showToast("Vui lòng nhập mô tả xe", "error");
  return;
}

if (!vehicleData.price || Number(vehicleData.price) <= 0) {
  showToast("Vui lòng nhập giá xe hợp lệ", "error");
  return;
}

// ... và nhiều validation khác
```

#### 2. **Validation Trong CreatePost.tsx**
```typescript
// Kiểm tra package đã chọn
if (!selectedPackageId) {
  showToast("Vui lòng chọn gói đăng tin", "error");
  return;
}

// Kiểm tra dữ liệu cơ bản
if (!data) {
  showToast("Dữ liệu không hợp lệ", "error");
  return;
}
```

## 🧪 Cách Test Validation

### Test Case 1: Không Chọn Package
1. Vào `/create-post`
2. Không chọn package nào
3. Điền form đầy đủ
4. Click "Create Post"
5. **Kết quả mong đợi**: Hiển thị toast "Vui lòng chọn gói đăng tin"

### Test Case 2: Không Nhập Tiêu Đề
1. Vào `/create-post`
2. Chọn package
3. Để trống tiêu đề, điền các trường khác
4. Click "Create Post"
5. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập tiêu đề xe/pin"

### Test Case 3: Không Nhập Mô Tả
1. Vào `/create-post`
2. Chọn package
3. Điền tiêu đề, để trống mô tả
4. Click "Create Post"
5. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập mô tả xe/pin"

### Test Case 4: Giá Không Hợp Lệ
1. Vào `/create-post`
2. Chọn package
3. Điền tiêu đề, mô tả
4. Nhập giá = 0 hoặc để trống
5. Click "Create Post"
6. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập giá xe/pin hợp lệ"

### Test Case 5: Không Nhập Địa Điểm
1. Vào `/create-post`
2. Chọn package
3. Điền tiêu đề, mô tả, giá
4. Để trống địa điểm
5. Click "Create Post"
6. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập địa điểm"

### Test Case 6: Không Chọn Ảnh
1. Vào `/create-post`
2. Chọn package
3. Điền đầy đủ thông tin
4. Không chọn ảnh nào
5. Click "Create Post"
6. **Kết quả mong đợi**: Hiển thị toast "Vui lòng chọn ít nhất một ảnh!"

### Test Case 7: Validation Theo Loại Sản Phẩm

#### Cho Xe Điện (EV):
1. Chọn loại "EV"
2. Điền đầy đủ thông tin cơ bản
3. Để trống "Thương hiệu xe"
4. Click "Create Post"
5. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập thương hiệu xe"

#### Cho Pin:
1. Chọn loại "Battery"
2. Điền đầy đủ thông tin cơ bản
3. Để trống "Thương hiệu pin"
4. Click "Create Post"
5. **Kết quả mong đợi**: Hiển thị toast "Vui lòng nhập thương hiệu pin"

### Test Case 8: Thành Công
1. Vào `/create-post`
2. Chọn package
3. Điền đầy đủ tất cả thông tin
4. Chọn ít nhất 1 ảnh
5. Click "Create Post"
6. **Kết quả mong đợi**: Chuyển đến trang Payment

## 🔍 Validation Rules Chi Tiết

### Trường Bắt Buộc Chung:
- ✅ Tiêu đề (title)
- ✅ Mô tả (description)
- ✅ Giá (price) > 0
- ✅ Địa điểm (location)
- ✅ Ít nhất 1 ảnh

### Trường Bắt Buộc Cho Xe Điện:
- ✅ Thương hiệu (brand)
- ✅ Model (model)
- ✅ Năm sản xuất (year) > 0

### Trường Bắt Buộc Cho Pin:
- ✅ Thương hiệu pin (batteryBrand)
- ✅ Dung lượng (capacity)
- ✅ Điện áp (voltage) > 0

## 🚀 Flow Hoạt Động Sau Khi Sửa

1. **User điền form** → Validation trong form con
2. **User click "Create Post"** → Kiểm tra validation
3. **Nếu có lỗi** → Hiển thị toast lỗi, không chuyển trang
4. **Nếu hợp lệ** → Chuyển đến Payment
5. **Thanh toán thành công** → Tạo post → Chuyển đến Waiting

## 📝 Lưu Ý

- Validation được thực hiện ở cả form con và trang cha
- Mỗi lỗi validation sẽ hiển thị toast message cụ thể
- User không thể chuyển đến Payment nếu thiếu dữ liệu
- Hệ thống sẽ dừng lại và yêu cầu user nhập đầy đủ thông tin
