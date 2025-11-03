# 🐛 Debug Hướng Dẫn: Lỗi Duyệt Bài Đăng

## ❌ Vấn đề hiện tại
Frontend bị lỗi **500** khi duyệt bài, nhưng Swagger hoạt động bình thường (200).

## 🔍 Các bước debug

### 1. Mở Console Browser (F12)
Khi bạn click vào "Xem chi tiết" hoặc "Duyệt", hãy xem console log:

#### ✅ Log thành công sẽ trông như này:
```
📋 Fetching all listings...
✅ Listings response: {success: true, data: [...]}
📊 Total listings: 4
🔍 First listing sample: {id: 1, title: "...", ...}

📋 Opening detail modal for listing: 2
✅ Using existing post data from list
```

#### ❌ Log lỗi sẽ trông như này:
```
❌ Error fetching listing: AxiosError {...}
Error response: {message: "...", ...}
Error status: 500
```

### 2. Kiểm tra API endpoints

#### API GET tất cả listings:
```
GET http://localhost:8080/api/admin/listings
Header: Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "message": "Success",
  "success": true,
  "data": [
    {
      "listingId": 2,
      "title": "...",
      "status": "PENDING_APPROVAL",
      "itemType": "battery",
      "user": {...},
      ...
    }
  ]
}
```

#### API PUT duyệt bài:
```
PUT http://localhost:8080/api/admin/listings/2/status?approved=true
Header: Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "message": "Listing đã được set ACTIVE",
  "success": true,
  "data": {...}
}
```

### 3. Kiểm tra Token
Mở Console và chạy:
```javascript
console.log('Token:', localStorage.getItem('token'));
```

Nếu không có token hoặc token hết hạn → **401/403**

### 4. Kiểm tra Backend Logs
Xem logs của Spring Boot backend khi request được gửi đến:
```
# Tìm lỗi như:
- NullPointerException
- DataIntegrityViolationException
- IllegalArgumentException
```

## 🔧 Các giải pháp thường gặp

### Lỗi 500: Internal Server Error
**Nguyên nhân:**
1. Backend chưa implement đầy đủ endpoint
2. Database constraint violation
3. Null pointer exception ở backend
4. Business logic lỗi

**Giải pháp:**
- Kiểm tra backend logs
- Đảm bảo listing có đủ dữ liệu required
- Test API trực tiếp bằng Swagger/Postman

### Lỗi 401/403: Unauthorized
**Nguyên nhân:**
- Token hết hạn
- Không có quyền admin
- Token không được gửi trong header

**Giải pháp:**
- Đăng nhập lại
- Kiểm tra role của user (phải là ADMIN)
- Clear localStorage và login lại

### Lỗi 404: Not Found
**Nguyên nhân:**
- ListingId không tồn tại
- Endpoint sai

**Giải pháp:**
- Kiểm tra listingId có đúng không
- Đảm bảo endpoint khớp với backend

### Lỗi "Network Error"
**Nguyên nhân:**
- Backend không chạy
- CORS policy
- Port sai

**Giải pháp:**
- Kiểm tra backend đang chạy: `http://localhost:8080`
- Kiểm tra CORS configuration
- Đảm bảo port khớp với backend

## 🎯 Test Steps

### Test 1: Kiểm tra API List
1. Mở trang `/admin/posts`
2. Xem console có log: `📋 Fetching all listings...`
3. Kiểm tra response có data không

### Test 2: Kiểm tra Modal
1. Click "Xem chi tiết"
2. Modal phải mở và hiển thị data
3. Kiểm tra console: `✅ Using existing post data from list`

### Test 3: Kiểm tra Duyệt
1. Trong modal, click "Duyệt bài đăng"
2. Xem console log:
   ```
   🔄 Updating listing status with ID: 2, New Status: ACTIVE
   📡 Request URL: /admin/listings/2/status?approved=true
   ✅ Update status response: {...}
   ```
3. Toast hiển thị: "Duyệt bài đăng thành công!"

## 📝 Thông tin API cần từ Backend

### Endpoint GET /admin/listings
- ✅ Đã có
- Trả về danh sách listings với đầy đủ thông tin

### Endpoint GET /admin/listings/{id}
- ⚠️ Có thể chưa có hoặc lỗi 500
- **Giải pháp tạm**: Sử dụng data từ list (đã implement)

### Endpoint PUT /admin/listings/{id}/status
- ✅ Đã có (theo Swagger)
- Query param: `approved=true/false`
- Cần kiểm tra xem có nhận đúng format không

## 🆘 Nếu vẫn lỗi

1. **Copy toàn bộ console log** và gửi cho team
2. **Check backend logs** tại thời điểm gửi request
3. **Test trực tiếp API bằng Swagger** để so sánh
4. **Kiểm tra Database** xem listing có status/data đầy đủ không

## 📞 Contact
- Frontend: Kiểm tra file `PostManagement.tsx`, `PostService.ts`
- Backend: Kiểm tra controller `/admin/listings/**`
- API Docs: Check Swagger tại `http://localhost:8080/swagger-ui.html`

