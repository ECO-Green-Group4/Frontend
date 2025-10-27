# 🔍 Hướng Dẫn Debug: Lỗi "Dữ liệu không hợp lệ"

## ❌ Vấn Đề Hiện Tại

User đăng ký nhưng gặp lỗi **"Dữ liệu không hợp lệ"** từ backend.

## 🛠️ Các Bước Debug

### 1. Mở Console (F12)

Khi đăng ký lại, bạn sẽ thấy các log chi tiết:

```
Sending register data: { username, email, ... }
Register data JSON: {
  "username": "kaitooo",
  "email": "kaitokid@gmail.com",
  ...
}

Register API error response: {
  status: 400,
  statusText: "Bad Request",
  headers: {...}
}

Parsed error data: {
  message: "...",
  errors: {...}
}
```

### 2. Check Network Tab

1. Mở **Network** tab (F12 → Network)
2. Tìm request `POST /api/auth/register`
3. Click vào request
4. Xem tab **Response** hoặc **Preview**
5. Copy toàn bộ response body

### 3. Các Lỗi Thường Gặp

#### Lỗi 1: Field không hợp lệ
```json
{
  "message": "Validation failed",
  "errors": {
    "username": "Tên đăng nhập phải có ít nhất 3 ký tự",
    "email": "Email không hợp lệ"
  }
}
```

**Fix:** Xem error messages và sửa field tương ứng

#### Lỗi 2: confirmPassword không được backend accept
```json
{
  "message": "Unknown property: confirmPassword"
}
```

**Fix:** Cần bỏ field `confirmPassword` khỏi payload

#### Lỗi 3: Format date không đúng
```json
{
  "message": "Invalid date format"
}
```

**Fix:** Backend có thể expect format khác (ví dụ: `YYYY-MM-DD`)

### 4. Cách Kiểm Tra Response Backend

**Option 1: Dùng Postman/Thunder Client**
```
POST http://localhost:8080/api/auth/register
Body:
{
  "username": "test123",
  "email": "test@example.com",
  "password": "Password123@",
  "fullName": "Test User",
  "phoneNumber": "0123456789",
  "identityCard": "123456789012",
  "dateOfBirth": "2000-01-01",
  "sex": "Nam",
  "address": "123 Test Street"
}
```

**Option 2: Check Backend Logs**
- Xem console của backend server
- Tìm validation errors

### 5. Các Trường Hợp Nghi Ngờ

#### Nghi ngờ 1: Backend không nhận `confirmPassword`
**Giải pháp:** Remove field này trước khi gửi:
```typescript
const { confirmPassword, ...dataToSend } = formData;
await AuthService.register(dataToSend);
```

#### Nghi ngờ 2: Format date sai
Backend có thể expect:
- `YYYY-MM-DD` ✅
- `DD/MM/YYYY` ❌
- ISO format

#### Nghi ngờ 3: Field name không khớp
Backend có thể expect:
- `phoneNumber` vs `phone`
- `fullName` vs `name`
- `identityCard` vs `idCard`

### 6. Test Với Dữ Liệu Mới

Nếu vẫn lỗi, thử:
1. **Đổi tất cả dữ liệu:** username, email, phone, CCCD
2. **Dùng email domain khác:** `test@example.com`
3. **Date format:** `2000-01-01` (không dùng `/`)

## 🎯 Kết Luận

Với logging mới, bạn sẽ thấy:
- ✅ Chi tiết error response từ backend
- ✅ Field nào bị lỗi validation
- ✅ Error message cụ thể

**Bước tiếp theo:**
1. Đăng ký lại
2. Check console log
3. Gửi thông tin error cho tôi để fix tiếp
