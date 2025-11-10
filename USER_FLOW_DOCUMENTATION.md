# 📋 Tài Liệu Giải Thích Chi Tiết Luồng Xử Lý Người Dùng (User Flow)

## Tổng Quan

Tài liệu này giải thích chi tiết luồng xử lý của người dùng qua 3 bước chính:
1. **Login (Đăng nhập)**
2. **Navigation to Main Screen (Điều hướng đến Màn hình Chính)**
3. **Create Post (Tạo Bài đăng)**

---

## 1. 🔐 LOGIN (Đăng nhập)

### 1.1. Luồng Xử Lý Tổng Quan

Khi người dùng nhấn nút "Sign in" trên trang Login, hệ thống thực hiện các bước sau:

```
User nhập email/password 
  → Validate form 
  → Gọi API login 
  → Lưu token vào localStorage 
  → Cập nhật AuthContext 
  → Redirect dựa trên role
```

### 1.2. Chi Tiết Từng Bước

#### **Bước 1: User Nhập Thông Tin và Submit Form**

**File:** `src/pages/Login.tsx`

```typescript
// Dòng 168-208: Hàm handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form
  const validation = validateForm(formData, validationRules);
  setErrors(validation.errors);
  
  if (!validation.isValid) {
    return; // Dừng nếu validation fail
  }
  
  setLoading(true);
  try {
    const response = await login(formData.email, formData.password);
    // ... redirect logic
  } catch (error) {
    // ... error handling
  }
};
```

**Chức năng:**
- Ngăn chặn submit form mặc định
- Validate form sử dụng `validateForm()` từ `@/utils/validateEmail`
- Kiểm tra email format và password required
- Nếu validation pass → gọi hàm `login()` từ `useAuth()`

#### **Bước 2: Gọi API Login**

**File:** `src/hooks/useAuth.ts` → `src/context/AuthContext.tsx` → `src/services/AuthService.ts`

**Luồng gọi:**
1. `Login.tsx` gọi `login()` từ `useAuth()` hook
2. `useAuth()` trỏ đến `AuthContext.login()`
3. `AuthContext.login()` gọi `AuthService.login()`

**File:** `src/services/AuthService.ts` (Dòng 9-104)

```typescript
async login(email: string, password: string): Promise<any> {
  // Gọi API POST /api/auth/login
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // Xử lý lỗi
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // ⭐ LƯU TOKEN VÀO LOCALSTORAGE
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
  }

  // Map role từ backend
  // Tạo user object
  // Return { user, token, refreshToken }
}
```

**API Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "id": "1",
  "fullName": "Nguyễn Văn A",
  "role": "USER",
  "roleId": "1"
}
```

#### **Bước 3: Lưu Token và Cập Nhật AuthContext**

**File:** `src/context/AuthContext.tsx` (Dòng 46-51)

```typescript
const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await AuthService.login(email, password);
  
  // ⭐ CẬP NHẬT STATE TRONG CONTEXT
  setUser(response.user);           // Lưu thông tin user
  setIsAuthenticated(true);          // Đánh dấu đã đăng nhập
  
  return response;
};
```

**Lưu trữ:**
- **Token:** `localStorage.setItem('token', data.token)`
- **Refresh Token:** `localStorage.setItem('refreshToken', data.refreshToken)`
- **User State:** Lưu trong React Context (`AuthContext`)

#### **Bước 4: Redirect Dựa Trên Role**

**File:** `src/pages/Login.tsx` (Dòng 187-200)

```typescript
// Kiểm tra và redirect dựa trên role của user
if (isAdmin(response.user)) {
  // Admin - redirect đến admin dashboard
  navigate('/admin', { replace: true });
} else if (isStaff(response.user)) {
  // Staff - redirect đến staff dashboard
  navigate('/staff/orders', { replace: true });
} else {
  // User thường - redirect về trang trước đó hoặc trang chủ
  navigate(from === '/admin' || from === '/staff' ? '/' : from, { replace: true });
}
```

**Role Mapping:**
- **Admin** (roleId = '2') → `/admin`
- **Staff** (roleId = '3') → `/staff/orders`
- **User** (roleId = '1') → `/` (trang chủ) hoặc trang trước đó

**Helper Functions:**
- `isAdmin()` từ `@/utils/adminCheck`
- `isStaff()` từ `@/utils/staffCheck`

---

## 2. 🏠 NAVIGATION TO MAIN SCREEN (Điều hướng đến Màn hình Chính)

### 2.1. Luồng Xử Lý Tổng Quan

Khi người dùng truy cập vào trang chủ (`/`) hoặc các route được bảo vệ, hệ thống kiểm tra authentication như sau:

```
App khởi động 
  → AuthContext kiểm tra token trong localStorage 
  → Nếu có token → Gọi API /auth/me để lấy user info 
  → Cập nhật isAuthenticated = true 
  → ProtectedRoute kiểm tra isAuthenticated 
  → Cho phép truy cập hoặc redirect
```

### 2.2. Chi Tiết Từng Bước

#### **Bước 1: App Khởi Động và AuthContext Kiểm Tra Authentication**

**File:** `src/context/AuthContext.tsx` (Dòng 22-43)

```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      // ⭐ KIỂM TRA TOKEN TRONG LOCALSTORAGE
      if (AuthService.isAuthenticated()) {
        // Gọi API để lấy thông tin user hiện tại
        const userData = await AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Lỗi kiểm tra authentication:', error);
      AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  checkAuth();
}, []);
```

**Chức năng:**
- Chạy khi component mount (app khởi động)
- Kiểm tra token trong localStorage qua `AuthService.isAuthenticated()`
- Nếu có token → gọi API `/auth/me` để lấy thông tin user
- Cập nhật state `user` và `isAuthenticated`

#### **Bước 2: Kiểm Tra Token và Gọi API /auth/me**

**File:** `src/services/AuthService.ts` (Dòng 318-347)

```typescript
// Kiểm tra đã đăng nhập
isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

// Lấy thông tin user hiện tại
async getCurrentUser(): Promise<User | null> {
  const token = this.getToken();
  if (!token) return null;

  // ⭐ GỌI API VỚI TOKEN TRONG HEADER
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      this.logout(); // Token không hợp lệ → logout
    }
    throw new Error('Không thể lấy thông tin user');
  }

  return await response.json();
}
```

**API Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "1",
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "role": "USER",
  "roleId": "1"
}
```

#### **Bước 3: ProtectedRoute Kiểm Tra Authentication**

**File:** `src/routes/ProtectedRoute.tsx`

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // ⭐ NẾU CHƯA ĐĂNG NHẬP → REDIRECT VỀ LOGIN
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập → hiển thị component
  return children;
};
```

**Chức năng:**
- Kiểm tra `loading` từ `AuthContext` → hiển thị spinner nếu đang load
- Kiểm tra `isAuthenticated`:
  - **false** → Redirect về `/login` và lưu `location` để quay lại sau khi login
  - **true** → Render `children` (component được bảo vệ)

#### **Bước 4: Truy Cập Main Screen**

**File:** `src/routes/AppRoutes.tsx` (Dòng 46)

```typescript
<Route path="/" element={<MainScreen />} />
```

**File:** `src/pages/MainScreen.tsx`

- Route `/` **KHÔNG** được bảo vệ bởi `ProtectedRoute` → **Public route**
- Người dùng có thể truy cập mà không cần đăng nhập
- Trang này hiển thị danh sách bài đăng công khai (status = 'ACTIVE')

**API được gọi:**
```typescript
// Dòng 57-150: fetchPosts()
const response = await api.get("/buyer/listings");
// API này là PUBLIC - không cần authentication
```

---

## 3. ✍️ CREATE POST (Tạo Bài đăng)

### 3.1. Luồng Xử Lý Tổng Quan

Khi người dùng nhập dữ liệu và nhấn 'Submit' trên trang Create Post:

```
User truy cập /create-post 
  → ProtectedRoute kiểm tra authentication 
  → User chọn category (EV/Battery) 
  → User chọn gói đăng tin 
  → User nhập form và submit 
  → Validate form 
  → Upload ảnh lên ImgBB 
  → Lưu dữ liệu vào sessionStorage 
  → Chuyển đến trang Payment 
  → Sau khi thanh toán thành công 
  → Gọi API tạo listing 
  → Cập nhật UI
```

### 3.2. Chi Tiết Từng Bước

#### **Bước 1: Truy Cập Trang Create Post**

**File:** `src/routes/AppRoutes.tsx` (Dòng 85-90)

```typescript
<Route path="/create-post" element={
  <ProtectedRoute>
    <CreatePost />
  </ProtectedRoute>
} />
```

- Route được bảo vệ bởi `ProtectedRoute`
- Nếu chưa đăng nhập → redirect về `/login`

**File:** `src/pages/CreatePost.tsx` (Dòng 30-35)

```typescript
// Redirect to login nếu chưa đăng nhập
useEffect(() => {
  if (!isAuthenticated) {
    showToast("Vui lòng đăng nhập để tạo bài đăng", "error");
    navigate("/login");
  }
}, [isAuthenticated, navigate]);
```

#### **Bước 2: User Chọn Category và Gói Đăng Tin**

**File:** `src/pages/CreatePost.tsx` (Dòng 38-44)

```typescript
const [category, setCategory] = useState<"EV" | "Battery">("EV");
const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
const [customDays, setCustomDays] = useState<number>(1);

// Fetch danh sách gói đăng tin
useEffect(() => {
  const fetchPackages = async () => {
    const response = await api.get("/seller/packages");
    setPackages(response.data.data || response.data);
  };
  fetchPackages();
}, []);
```

**API Endpoint:** `GET /api/seller/packages`

**Response:**
```json
{
  "data": [
    {
      "packageId": 1,
      "name": "Gói Cơ Bản",
      "listingFee": 50000,
      "durationDays": 7,
      "highlight": false
    }
  ]
}
```

#### **Bước 3: User Nhập Form và Submit**

**File:** `src/pages/VehicleForm.tsx` (Dòng 83-166)

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // ⭐ VALIDATION
  if (packageId === null) {
    showToast("Vui lòng chọn một gói đăng tin!", "warning");
    return;
  }

  if (!vehicleData.title || !vehicleData.title.trim()) {
    showToast("Vui lòng nhập tiêu đề xe", "error");
    return;
  }

  // ... các validation khác

  if (images.length === 0) {
    showToast("Vui lòng chọn ít nhất một ảnh!", "warning");
    return;
  }

  setIsUploading(true);
  
  try {
    // ⭐ UPLOAD ẢNH LÊN IMGBB
    const uploadedUrls = await uploadImgBBMultipleFile(images);
    const validUrls = uploadedUrls.filter(url => url !== null) as string[];
    
    if (validUrls.length === 0) {
      throw new Error("Không thể upload ảnh nào lên server");
    }
    
    // ⭐ TỔNG HỢP DỮ LIỆU
    const finalData = {
      ...vehicleData,
      images: validUrls, // Array of image URLs
      packageId: packageId
    };
    
    // ⭐ GỬI DỮ LIỆU LÊN COMPONENT CHA
    await onSubmit(finalData);
    
  } catch (error) {
    console.error("Lỗi submit:", error);
  } finally {
    setIsUploading(false);
  }
};
```

**Upload Ảnh:**
- Sử dụng `uploadImgBBMultipleFile()` từ `@/services/imgBB`
- Upload nhiều ảnh lên ImgBB
- Nhận về array các URL ảnh

#### **Bước 4: Xử Lý Dữ Liệu và Chuyển Đến Payment**

**File:** `src/pages/CreatePost.tsx` (Dòng 93-143)

```typescript
const handleFormSubmit = async (data: any) => {
  // Kiểm tra đã chọn package
  if (!selectedPackageId) {
    showToast("Vui lòng chọn gói đăng tin", "error");
    return;
  }

  // Tìm thông tin package đã chọn
  const selectedPackage = packages.find(pkg => pkg.packageId === selectedPackageId);
  
  // ⭐ TÍNH TỔNG TIỀN
  const totalAmount = selectedPackage.listingFee * customDays;

  // ⭐ CHUẨN BỊ DỮ LIỆU CHO TRANG PAYMENT
  const paymentInfo = {
    packageId: selectedPackage.packageId,
    packageName: selectedPackage.name,
    amount: totalAmount,
    days: customDays,
    type: category === "Battery" ? "battery" : "vehicle",
    description: `Đăng tin ${category} - ${data.title} (${customDays} ngày)`
  };

  // ⭐ LƯU DỮ LIỆU FORM VÀO SESSIONSTORAGE
  const formData = {
    category,
    data: JSON.parse(JSON.stringify(data)), // Deep clone
    selectedPackageId,
    customDays
  };
  
  sessionStorage.setItem('pendingPostData', JSON.stringify(formData));

  // ⭐ CHUYỂN ĐẾN TRANG PAYMENT
  navigate("/payment", { 
    state: { 
      paymentInfo 
    } 
  });
};
```

**Lưu trữ:**
- Dữ liệu form được lưu vào `sessionStorage` với key `pendingPostData`
- Bao gồm: category, data (form data), selectedPackageId, customDays

#### **Bước 5: Sau Khi Thanh Toán Thành Công - Tạo Listing**

**File:** `src/services/PostPaymentService.ts` (Dòng 44-82)

```typescript
static async createPostAfterPayment(): Promise<boolean> {
  // ⭐ LẤY DỮ LIỆU TỪ SESSIONSTORAGE
  const pendingData = this.getPendingPostData();
  
  if (!pendingData) {
    showToast('Không tìm thấy dữ liệu đăng tin', 'error');
    return false;
  }

  try {
    let response;
    
    // ⭐ GỌI API TẠO LISTING DỰA TRÊN CATEGORY
    if (pendingData.category === "Battery") {
      const payload = this.toBatteryPayload(pendingData.data);
      response = await api.post("/seller/listings/battery", payload, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const payload = this.toVehiclePayload(pendingData.data);
      response = await api.post("/seller/listings/vehicle", payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Post created successfully:", response.data);
    showToast("🎉 Đăng tin thành công!", "success");
    
    // ⭐ XÓA DỮ LIỆU ĐÃ LƯU
    this.clearPendingPostData();
    
    return true;
  } catch (error: any) {
    console.error("Create post error:", error);
    showToast(`❌ ${error.message}`, "error");
    return false;
  }
}
```

**API Endpoints:**
- **Vehicle:** `POST /api/seller/listings/vehicle`
- **Battery:** `POST /api/seller/listings/battery`

**Request Payload (Vehicle):**
```json
{
  "title": "Tesla Model 3 2022",
  "description": "Xe điện mới, đẹp",
  "images": ["https://i.ibb.co/...", "https://i.ibb.co/..."],
  "location": "Hồ Chí Minh",
  "price": 50000000,
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2022,
  "bodyType": "Sedan",
  "color": "White",
  "mileage": 5000,
  "inspection": "Yes",
  "origin": "USA",
  "numberOfSeats": 5,
  "licensePlate": "51F-123.45",
  "accessories": "Charger included",
  "batteryCapacity": 50,
  "condition": "excellent",
  "packageId": 1,
  "status": "PENDING_APPROVAL"
}
```

**Response:**
```json
{
  "message": "Listing created successfully",
  "success": true,
  "data": {
    "id": 123,
    "title": "Tesla Model 3 2022",
    "status": "PENDING_APPROVAL",
    ...
  }
}
```

#### **Bước 6: Cập Nhật UI**

Sau khi tạo listing thành công:
- Hiển thị toast success: "🎉 Đăng tin thành công!"
- Xóa dữ liệu trong `sessionStorage`
- User có thể được redirect về trang chủ hoặc trang quản lý bài đăng

---

## 📊 Sơ Đồ Luồng Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                   1. LOGIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│ User Input → Validate → API /auth/login → Save Token →      │
│ Update Context → Redirect by Role                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             2. NAVIGATION TO MAIN SCREEN                     │
├─────────────────────────────────────────────────────────────┤
│ App Start → Check Token → API /auth/me → Update Context →   │
│ ProtectedRoute Check → Allow/Deny Access                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 3. CREATE POST FLOW                         │
├─────────────────────────────────────────────────────────────┤
│ Access /create-post → Auth Check → Select Package →         │
│ Fill Form → Validate → Upload Images → Save to Storage →    │
│ Navigate to Payment → After Payment → API Create Listing →  │
│ Update UI                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Các Component và Service Chính

### **Components:**
- `Login.tsx` - Trang đăng nhập
- `CreatePost.tsx` - Trang tạo bài đăng (container)
- `VehicleForm.tsx` - Form nhập thông tin xe điện
- `BatteryForm.tsx` - Form nhập thông tin pin
- `AuthGuard.tsx` - Component bảo vệ route
- `ProtectedRoute.tsx` - Route wrapper kiểm tra authentication

### **Services:**
- `AuthService.ts` - Xử lý authentication (login, logout, getCurrentUser)
- `PostPaymentService.ts` - Xử lý tạo post sau khi thanh toán
- `imgBB.tsx` - Upload ảnh lên ImgBB
- `axios.tsx` - Axios instance với interceptor tự động thêm token

### **Context/Hooks:**
- `AuthContext.tsx` - Context quản lý authentication state
- `useAuth.ts` - Hook truy cập AuthContext

### **Utils:**
- `validateEmail.ts` - Validation form
- `adminCheck.ts` - Kiểm tra role admin
- `staffCheck.ts` - Kiểm tra role staff
- `toast.ts` - Hiển thị thông báo

---

## 📝 Lưu Ý Quan Trọng

1. **Token Storage:**
   - Token được lưu trong `localStorage`
   - Tự động thêm vào header `Authorization: Bearer <token>` qua axios interceptor

2. **Authentication Check:**
   - Mỗi khi app khởi động, `AuthContext` tự động kiểm tra token
   - Nếu token hợp lệ → gọi API `/auth/me` để lấy user info

3. **Protected Routes:**
   - Routes được bảo vệ bởi `ProtectedRoute` sẽ kiểm tra `isAuthenticated`
   - Nếu chưa đăng nhập → redirect về `/login` với state `from` để quay lại sau

4. **Create Post Flow:**
   - Dữ liệu form được lưu vào `sessionStorage` trước khi thanh toán
   - Sau khi thanh toán thành công → mới gọi API tạo listing
   - Đảm bảo user đã thanh toán trước khi tạo bài đăng

5. **Error Handling:**
   - Tất cả API calls đều có try-catch
   - Hiển thị error message qua toast notifications
   - Log errors ra console để debug

---

## 🎯 Kết Luận

Luồng xử lý được thiết kế theo kiến trúc:
- **Separation of Concerns:** Logic tách biệt giữa components, services, và context
- **Security:** Token-based authentication với automatic token injection
- **User Experience:** Loading states, error handling, và clear feedback
- **Data Flow:** Unidirectional data flow từ form → storage → API → UI update

