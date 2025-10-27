# Fix: Lỗi Đăng Ký - "Đã Tồn Tại"

## 🐛 Vấn Đề

Khi đăng ký, user gặp lỗi:
- "Tên đăng nhập đã tồn tại" (Username already exists)
- "Email đã tồn tại" (Email already exists)
- "Số CCCD/CMND đã tồn tại" (ID/CCCD number already exists)

**Ngay cả khi nhập lần đầu.**

### Root Cause

1. **Backend trả về response không phải JSON**:
   - Response có thể là text/plain
   - Frontend cố parse như JSON → SyntaxError

2. **Error handling không robust**:
   - Cố gắng parse JSON ngay → crash
   - Không có fallback để parse text

## ✅ Giải Pháp

### 1. Fix AuthService.ts - Error Parsing

**Before:**
```typescript
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Đăng ký thất bại');
}
```

**After:**
```typescript
if (!response.ok) {
  // Thử parse JSON, nếu fail thì lấy text
  let errorMessage = 'Đăng ký thất bại';
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    try {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    } catch (e2) {
      errorMessage = response.statusText || errorMessage;
    }
  }
  throw new Error(errorMessage);
}
```

### 2. Fix Register.tsx - Error Display

**Improvements:**
1. Reset errors khi submit
2. Extract error message tốt hơn
3. Hiển thị cả toast và error box
4. Clear errors khi user nhập lại

**Changes:**
```typescript
// Reset errors
setErrors({});

// Better error extraction
let errorMessage = 'Đăng ký thất bại';
if (error.message) {
  errorMessage = error.message;
} else if (typeof error === 'string') {
  errorMessage = error;
}

// Show toast + error box
showToast(errorMessage, 'error');
setErrors({ general: errorMessage });
```

### 3. Clear Error When User Types

```typescript
const handleChange = (e) => {
  // ... update formData
  
  // Xóa cả field error và general error
  if (errors[name] || errors.general) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      delete newErrors.general; // ← Xóa cả general error
      return newErrors;
    });
  }
};
```

## 🧪 Test Cases

### Test 1: Dữ liệu hợp lệ
**Input:** Tất cả fields hợp lệ, chưa tồn tại
**Expected:** 
- ✅ Đăng ký thành công
- ✅ Toast: "Đăng ký thành công!"
- ✅ Navigate to /login

### Test 2: Username đã tồn tại
**Input:** Username đã có trong DB
**Expected:**
- ❌ Error từ backend
- ✅ Toast: "Tên đăng nhập đã tồn tại"
- ✅ Error box: "Tên đăng nhập đã tồn tại"
- ✅ Clear error khi user nhập lại

### Test 3: Email đã tồn tại
**Input:** Email đã có trong DB
**Expected:**
- ❌ Error từ backend
- ✅ Toast: "Email đã tồn tại"
- ✅ Error box hiển thị message

### Test 4: Backend trả về text thay vì JSON
**Input:** Backend response là text
**Expected:**
- ✅ Parse text thay vì JSON
- ✅ Hiển thị error message

## 📋 Files Modified

1. **src/services/AuthService.ts**
   - Fix `register()` method error parsing
   - Fix `login()` method error parsing

2. **src/pages/Register.tsx**
   - Reset errors khi submit
   - Better error extraction
   - Show toast + error box
   - Clear errors khi user nhập

## 🚀 Testing

### Steps:
1. Mở trang register: `localhost:5173/register`
2. Điền form với dữ liệu mới
3. Click "Sign Up"
4. Check console log
5. Check toast notification
6. Check error box

### Expected Console:
```
Sending register data: { username, email, ... }
POST http://localhost:8080/api/auth/register 200 OK
Register successful: { ... }
```

### Expected UI:
- Error box đỏ (nếu có lỗi)
- Toast notification
- Form không submit nếu có validation error

## 🔍 Debug

### If still failing, check:
1. **Console log** - Xem error message
2. **Network tab** - Xem response từ backend
3. **Backend logs** - Xem lỗi ở backend

### Common Issues:

**Issue 1:** Backend return 400 but message unclear
- **Fix:** Check backend code, đảm bảo trả về JSON với `message` field

**Issue 2:** User thấy lỗi "đã tồn tại" dù chưa tồn tại
- **Possible cause:** Database có data cũ
- **Fix:** Clear database hoặc dùng data khác

**Issue 3:** Error không clear
- **Fix:** Frontend đã improve error handling

