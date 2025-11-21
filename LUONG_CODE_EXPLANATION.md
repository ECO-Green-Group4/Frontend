# Giải Thích Luồng Code: Seller Đăng Nhập → Tạo Đơn Hàng

## Tổng Quan Luồng

```
1. Seller Đăng Nhập → MainScreen
2. Create Post (Nhập dữ liệu) → Click "Create Post"
3. Trang Payment (VNPay) → Thanh toán
4. VnPayCallback → Xử lý kết quả thanh toán
5. Trang Waiting → Chờ admin duyệt
6. Admin Duyệt Bài → Post hiện lên MainScreen
7. Buyer Đăng Nhập → Xem bài post
8. Click "Buy Now" → Tạo Order
```

---

## 1. SELLER ĐĂNG NHẬP → MAINSCREEN

### File: `src/pages/Login.tsx`

**Luồng xử lý:**
1. User nhập email/password hoặc đăng nhập bằng Google
2. Gọi `login()` từ `useAuth()` hook (dòng 181)
3. `AuthContext` xử lý authentication (dòng 46-50 trong `AuthContext.tsx`)
4. Sau khi đăng nhập thành công, kiểm tra role:
   - **Admin** (roleId = '2') → redirect đến `/admin`
   - **Staff** (roleId = '3') → redirect đến `/staff/orders`
   - **User thường** (Seller/Buyer) → redirect về `/` (MainScreen)

**Code quan trọng:**
```188:200:src/pages/Login.tsx
      // Kiểm tra và redirect dựa trên role của user
      if (isAdmin(response.user)) {
        // Admin - redirect đến admin dashboard
        console.log('Redirecting to admin dashboard');
        navigate('/admin', { replace: true });
      } else if (isStaff(response.user)) {
        // Staff - redirect đến staff dashboard
        console.log('Redirecting to staff dashboard');
        navigate('/staff/orders', { replace: true });
      } else {
        // User thường - redirect về trang trước đó hoặc trang chủ
        console.log('Redirecting to home/user page');
        navigate(from === '/admin' || from === '/staff' ? '/' : from, { replace: true });
      }
```

---

## 2. MAINSCREEN - Hiển Thị Danh Sách Bài Đăng

### File: `src/pages/MainScreen.tsx`

**Luồng xử lý:**
1. Component mount → gọi `fetchPosts()` (dòng 174-188)
2. Gọi API `/buyer/listings` để lấy danh sách bài đăng (dòng 61)
3. **Lọc chỉ lấy bài có status = 'ACTIVE'** (dòng 74)
4. Hiển thị danh sách bài đăng đã được admin duyệt

**Code quan trọng:**
```57:150:src/pages/MainScreen.tsx
  const fetchPosts = async (): Promise<Post[]> => {
    try {
      // Gọi API buyer/listings - public API khôông cần authentication
      console.log("Fetching buyer listings...");
      const response = await api.get("/buyer/listings");
      
      console.log("✅ Buyer listings response:", response.data);
      
      // Extract data từ response
      // Response format: { message, success, data: [...] }
      const listings = response.data?.data || response.data || [];
      
      console.log("📋 Total listings:", listings.length);
      console.log("🔍 Filtering for ACTIVE status only");

      // Map dữ liệu từ API buyer/listings
      const mappedPosts: Post[] = listings
        .filter((item: any) => item.status === 'ACTIVE')
        .map((item: any) => {
          // ... mapping logic
        });

      console.log(`✅ Mapped ${mappedPosts.length} active listings`);
      return mappedPosts;
      
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      setError("Không thể tải danh sách bài đăng");
      return [];
    }
  };
```

**Lưu ý:** Chỉ bài đăng có status = 'ACTIVE' mới hiển thị trên MainScreen.

---

## 3. CREATE POST - Seller Tạo Bài Đăng

### File: `src/pages/CreatePost.tsx`

**Luồng xử lý:**
1. Seller chọn loại bài đăng (EV hoặc Battery) (dòng 38, 156-163)
2. Chọn gói đăng tin từ API `/seller/packages` (dòông 48-86)
3. Nhập số ngày muốn đăng (dòng 44, 198-228)
4. Điền form (VehicleForm hoặc BatteryForm)
5. Click "Create Post" → gọi `handleFormSubmit()` (dòng 93-143)

**Code quan trọng:**
```93:143:src/pages/CreatePost.tsx
  const handleFormSubmit = async (data: any) => {
    // Kiểm tra xem đã chọn package chưa
    if (!selectedPackageId) {
      showToast("Vui lòng chọn gói đăng tin", "error");
      return;
    }

    // Kiểm tra dữ liệu form cơ bản (validation chi tiết đã được xử lý trong form con)
    if (!data) {
      showToast("Dữ liệu không hợp lệ", "error");
      return;
    }

    // Tìm thông tin package đã chọn
    const selectedPackage = packages.find(pkg => pkg.packageId === selectedPackageId);
    if (!selectedPackage) {
      showToast("Gói đăng tin không hợp lệ", "error");
      return;
    }

    // Tính tổng tiền = giá/ngày * số ngày
    const totalAmount = selectedPackage.listingFee * customDays;

    // Chuẩn bị dữ liệu cho trang Payment
    const paymentInfo = {
      packageId: selectedPackage.packageId,
      packageName: selectedPackage.name,
      amount: totalAmount,
      days: customDays, // Thêm số ngày vào paymentInfo
      type: category === "Battery" ? "battery" : "vehicle" as "post" | "vehicle" | "battery" | "membership",
      description: `Đăng tin ${category === "Battery" ? "pin" : "xe điện"} - ${data.title} (${customDays} ngày)`
    };

    // Lưu dữ liệu form vào sessionStorage để sử dụng sau khi thanh toán
    const formData = {
      category,
      data: JSON.parse(JSON.stringify(data)), // Deep clone để đảm bảo serialize được
      selectedPackageId,
      customDays // Lưu số ngày để sử dụng khi tạo listing
    };
    
    console.log('Saving to sessionStorage:', formData);
    sessionStorage.setItem('pendingPostData', JSON.stringify(formData));

    // Chuyển đến trang Payment
    navigate("/payment", { 
      state: { 
        paymentInfo 
      } 
    });
  };
```

**Điểm quan trọng:**
- Dữ liệu form được lưu vào `sessionStorage` với key `pendingPostData`
- Chuyển đến trang Payment với thông tin `paymentInfo`

---

## 4. TRANG PAYMENT - Thanh Toán VNPay

### File: `src/pages/Payment.tsx`

**Luồng xử lý:**
1. Nhận `paymentInfo` từ state (dòng 25-34)
2. User click "Thanh toán VNPay" → gọi `handleVnPayPayment()` (dòng 37-224)
3. Lấy dữ liệu form từ `sessionStorage` (dòng 47-60)
4. **Tạo listing trước** với status `PENDING_APPROVAL` (dòng 103-107)
5. Lấy `listingPackageId` từ response (dòng 114-123)
6. Tạo payment VNPay với `listingPackageId` (dòng 133-135)
7. Redirect đến URL thanh toán VNPay (dòng 194-207)

**Code quan trọng:**
```37:143:src/pages/Payment.tsx
  const handleVnPayPayment = async () => {
    if (!paymentInfo) {
      showToast('Thông tin thanh toán không hợp lệ', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Lấy dữ liệu form từ sessionStorage
      const pendingPostData = sessionStorage.getItem('pendingPostData');
      console.log('Pending post data from sessionStorage:', pendingPostData);
      
      if (!pendingPostData) {
        throw new Error('Không tìm thấy dữ liệu bài đăng');
      }

      let formData;
      try {
        formData = JSON.parse(pendingPostData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Dữ liệu không thể đọc được - vui lòng tạo lại bài đăng');
      }
      
      // ... validation logic ...
      
      // Xác định itemType từ category
      const itemType = formData.category === 'EV' ? 'vehicle' : 'battery';
      
      // Thêm quantity vào listingData (quantity = số ngày)
      const listingDataWithDays = {
        ...formData.data,
        quantity: paymentInfo.days || 1, // Gửi quantity thay vì durationDays để backend tính toán
      };
      
      // Tạo listing với package
      const listingResponse = await PaymentService.createListingWithPackage(
        listingDataWithDays, 
        paymentInfo.packageId,
        itemType
      );

      // Tìm listingPackageId trong response
      const listingPackageId = (listingResponse as any).data?.listingPackageId || 
                              (listingResponse as any).data?.id || 
                              (listingResponse as any).data?.packageId ||
                              (listingResponse as any).listingPackageId;

      if (!listingPackageId) {
        throw new Error('Không tìm thấy listingPackageId trong response');
      }

      // Lưu listingId vào sessionStorage để VnPayCallback có thể update status
      const listingId = (listingResponse as any).data?.id || (listingResponse as any).data?.listingId;
      if (listingId) {
        sessionStorage.setItem('pendingListingId', listingId.toString());
        console.log('Saved listingId to sessionStorage:', listingId);
      }

      // Tạo payment VNPay
      const paymentResponse = await PaymentService.createVnPayPayment(
        listingPackageId
      );

      if (paymentResponse.success && paymentResponse.data.paymentUrl) {
        // Redirect đến trang thanh toán VNPay
        window.location.href = paymentResponse.data.paymentUrl;
      }
    } catch (error: any) {
      // ... error handling ...
    }
  };
```

**Điểm quan trọng:**
- Listing được tạo **TRƯỚC** khi thanh toán với status `PENDING_APPROVAL`
- `listingId` được lưu vào `sessionStorage` để dùng sau
- Redirect đến VNPay để thanh toán

---

## 5. VNPAY CALLBACK - Xử Lý Kết Quả Thanh Toán

### File: `src/pages/VnPayCallback.tsx`

**Luồng xử lý:**
1. VNPay redirect về với query params (dòng 12-79)
2. Gọi `handleVnPayFrontendCallback()` để xác nhận giao dịch (dòng 30)
3. Nếu thanh toán thành công:
   - Force update listing status về `PENDING_APPROVAL` (dòng 36-53)
   - Clear `sessionStorage` (dòng 48)
   - Redirect về trang Waiting (dòng 59-66)

**Code quan trọng:**
```12:79:src/pages/VnPayCallback.tsx
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kiểm tra nếu đang ở backend callback URL, redirect về frontend
        if (window.location.hostname === 'localhost' && window.location.port === '8080') {
          // Đang ở backend, redirect về frontend với query params
          const queryString = window.location.search;
          window.location.href = `http://localhost:5173/vnpay-callback${queryString}`;
          return;
        }

        // Lấy tất cả query parameters từ VNPay
        const queryParams: any = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Gọi backend endpoint mới để xác nhận giao dịch, sau đó điều hướng về trang Waiting
        const backendResult = await PaymentService.handleVnPayFrontendCallback(queryParams);

        if (backendResult?.success || queryParams.vnp_ResponseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công! Bài đăng của bạn đang chờ admin duyệt.');
          
          // Lấy listingId từ sessionStorage để force update status
          const savedListingId = sessionStorage.getItem('pendingListingId');
          if (savedListingId) {
            try {
              const listingId = parseInt(savedListingId);
              console.log('🔄 Force updating listing status to PENDING_APPROVAL...');
              
              // Force update status về PENDING_APPROVAL
              await PaymentService.updateListingStatusAfterPayment(listingId, 'PENDING_APPROVAL');
              console.log('✅ Listing status force updated to PENDING_APPROVAL');
              
              // Clear sessionStorage sau khi update thành công
              sessionStorage.removeItem('pendingListingId');
            } catch (error) {
              console.error('❌ Failed to force update listing status:', error);
              // Vẫn clear sessionStorage để không bị stuck
              sessionStorage.removeItem('pendingListingId');
            }
          } else {
            console.log('⚠️ No listingId found in sessionStorage');
          }
          
          // Redirect về trang Waiting sau 2 giây
          setTimeout(() => {
            navigate('/waiting', { 
              state: { 
                message: 'Thanh toán thành công! Bài đăng của bạn đang chờ admin duyệt.',
                type: 'success'
              }
            });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc bị hủy');
        }
      } catch (error: any) {
        console.error('Lỗi xử lý callback:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);
```

**Điểm quan trọng:**
- Sau khi thanh toán thành công, listing status được update về `PENDING_APPROVAL`
- Redirect về trang Waiting để seller biết bài đang chờ duyệt

---

## 6. TRANG WAITING - Chờ Admin Duyệt

### File: `src/pages/Waiting.tsx`

**Luồng xử lý:**
1. Hiển thị thông báo "Your request is being processed" (dòng 14-50)
2. Seller có thể quay về trang chủ (dòng 40-45)

**Code quan trọng:**
```14:50:src/pages/Waiting.tsx
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center border-t-8 border-green-400">
        
        {/* Icon Chờ (Ví dụ: đồng hồ cát hoặc spinner) */}
        <div className="mx-auto w-16 h-16 mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
          {/* Ví dụ: Icon đồng hồ cát (có thể thay bằng spinner nếu bạn muốn animation) */}
          <svg className="w-8 h-8 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        Your request is being processed
        </h1>

        {/* Nội dung */}
        <p className="text-gray-600 mb-6">
          {customMessage || "We are reviewing your post/member request. This process may take a few minutes."}
        </p>
        <p className="text-sm text-gray-500 mb-8 font-medium">
          You will receive a notification as soon as the status is updated.
        </p>

        {/* Nút quay lại hoặc tiếp tục */}
        <button
          onClick={() => navigate('/')} // Quay lại trang chính
          className="w-full py-3 px-4 rounded-full text-lg font-bold text-white bg-green-400 hover:bg-green-400 shadow-lg transition duration-150 transform hover:scale-[1.02]"
        >
          Back to Home Page
        </button>

      </div>
    </div>
  );
```

---

## 7. ADMIN DUYỆT BÀI POST

### File: `src/components/PostManagement.tsx`

**Luồng xử lý:**
1. Admin vào `/admin/posts` → gọi `fetchPosts()` (dòng 56-77)
2. Lấy danh sách tất cả posts từ API `/admin/listings` (dòng 60)
3. Filter posts theo status `PENDING_APPROVAL` (dòng 84-94)
4. Admin click "Duyệt" → gọi `handleApproveListing()` (dòng 125-152)
5. Update status từ `PENDING_APPROVAL` → `ACTIVE` (dòng 134)
6. Refresh danh sách (dòng 146)

**Code quan trọng:**
```125:152:src/components/PostManagement.tsx
  // Handle approve listing - chuyển thành ACTIVE
  const handleApproveListing = async (postId: number, closeModal: boolean = false) => {
    try {
      console.log('✅ Approving listing with postId:', postId);
      
      if (!postId || postId === undefined) {
        showToast('Lỗi: Không tìm thấy ID của bài đăng', 'error');
        return;
      }
      
      const response = await PostService.updatePostStatus(postId, 'ACTIVE');
      console.log('✅ Approve response:', response);
      
      // Hiển thị message từ backend
      showToast(response.message || 'Duyệt bài đăng thành công!', 'success');
      
      if (closeModal) {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
      }
      
      // Refresh danh sách để cập nhật status mới
      await fetchPosts();
    } catch (error: any) {
      console.error('❌ Error approving listing:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
      showToast(`Lỗi duyệt bài: ${errorMessage}`, 'error');
    }
  };
```

**Điểm quan trọng:**
- Khi admin duyệt, status chuyển từ `PENDING_APPROVAL` → `ACTIVE`
- Bài post với status `ACTIVE` sẽ hiển thị trên MainScreen (xem lại phần 2)

---

## 8. BUYER ĐĂNG NHẬP → XEM BÀI POST

**Luồng:** Tương tự như Seller đăng nhập (phần 1), nhưng Buyer sẽ thấy danh sách bài đăng trên MainScreen (phần 2).

---

## 9. BUYER CLICK "BUY NOW" → TẠO ORDER

### File: `src/pages/DescriptionEV.tsx` (hoặc `DescriptionBattery.tsx`)

**Luồng xử lý:**
1. Buyer click vào bài post → navigate đến `/description-ev/:id` (dòng 280-287 trong MainScreen)
2. Component `DescriptionEV` fetch chi tiết bài post (dòng 49-150)
3. Buyer click nút "Mua ngay" → gọi `handleBuyNow()` (dòng 152-192)
4. Kiểm tra authentication (dòng 159-164)
5. Gọi `PaymentService.createVehicleOrder(listingId)` (dòng 173)
6. Tạo order thành công → hiển thị thông báo (dòng 176)

**Code quan trọng:**
```152:192:src/pages/DescriptionEV.tsx
  const handleBuyNow = async () => {
    if (!evDetails) {
      showToast("Không có thông tin xe", "error");
      return;
    }

    // Check authentication trước khi tạo order
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Vui lòng đăng nhập để mua xe", "error");
      navigate('/login');
      return;
    }

    try {
      // Lấy listingId từ evDetails
      const listingId = typeof evDetails.id === 'number' ? evDetails.id : parseInt(evDetails.id);
      
      console.log("Creating order for listingId:", listingId);
      
      // Gọi API tạo order
      const response = await PaymentService.createVehicleOrder(listingId);
      
      // Hiển thị thông báo thành công
      showToast("Tạo đơn hàng thành công!", "success");
      
      // Có thể chuyển đến trang đơn hàng hoặc trang thanh toán
      console.log("Order created successfully:", response);
      
    } catch (error: any) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể tạo đơn hàng";
      showToast(errorMessage, "error");
      
      // Nếu lỗi 401 Unauthorized, redirect về login
      if (error.response?.status === 401) {
        showToast("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", "error");
        navigate('/login');
      }
    }
  };
```

### Service: `src/services/PaymentService.ts`

**Code tạo order:**
```144:158:src/services/PaymentService.ts
  // Tạo order để mua xe (chỉ dùng listingId)
  async createVehicleOrder(listingId: number): Promise<any> {
    try {
      console.log('Creating vehicle order with listingId:', listingId);
      const response = await api.post('/buyer/orders', {
        listingId: listingId,
        basePrice: 0 // Không dùng basePrice theo yêu cầu
      });
      console.log('Order created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
```

**Điểm quan trọng:**
- API endpoint: `POST /buyer/orders`
- Payload: `{ listingId: number, basePrice: 0 }`
- Order được tạo thành công → Buyer có thể xem trong trang quản lý đơn hàng

---

## TÓM TẮT LUỒNG DỮ LIỆU

### Status Flow của Listing:
```
DRAFT → PENDING_APPROVAL (sau khi thanh toán) → ACTIVE (sau khi admin duyệt)
```

### SessionStorage Keys:
- `pendingPostData`: Lưu dữ liệu form khi tạo post (dùng trong Payment)
- `pendingListingId`: Lưu listingId sau khi tạo listing (dùng trong VnPayCallback)

### API Endpoints Quan Trọng:
1. `POST /seller/listings/vehicle` hoặc `/seller/listings/battery` - Tạo listing
2. `POST /payments/package/vnpay?listingPackageId={id}` - Tạo payment VNPay
3. `GET /payments/vnpay-frontend-callback` - Xử lý callback VNPay
4. `PUT /seller/listings/{id}/status` - Update status listing
5. `GET /admin/listings` - Admin lấy danh sách listings
6. `PUT /admin/listings/{id}/status` - Admin duyệt/từ chối listing
7. `GET /buyer/listings` - Buyer xem danh sách listings (chỉ ACTIVE)
8. `POST /buyer/orders` - Buyer tạo order

---

## CÁC FILE QUAN TRỌNG

1. **Authentication:**
   - `src/context/AuthContext.tsx` - Quản lý authentication state
   - `src/pages/Login.tsx` - Trang đăng nhập

2. **Post Creation:**
   - `src/pages/CreatePost.tsx` - Trang tạo post
   - `src/pages/VehicleForm.tsx` / `BatteryForm.tsx` - Form nhập liệu

3. **Payment:**
   - `src/pages/Payment.tsx` - Trang thanh toán
   - `src/pages/VnPayCallback.tsx` - Xử lý callback VNPay
   - `src/services/PaymentService.ts` - Service xử lý payment

4. **Admin:**
   - `src/components/PostManagement.tsx` - Admin duyệt bài post
   - `src/services/PostService.ts` - Service quản lý post

5. **Buyer:**
   - `src/pages/MainScreen.tsx` - Trang chủ hiển thị danh sách
   - `src/pages/DescriptionEV.tsx` / `DescriptionBattery.tsx` - Chi tiết sản phẩm
   - `src/services/OrderService.ts` - Service quản lý order

---

## LƯU Ý QUAN TRỌNG

1. **Status Management:**
   - Listing chỉ hiển thị trên MainScreen khi status = `ACTIVE`
   - Status flow: `DRAFT` → `PENDING_APPROVAL` → `ACTIVE`

2. **Payment Flow:**
   - Listing được tạo TRƯỚC khi thanh toán với status `PENDING_APPROVAL`
   - Sau khi thanh toán thành công, status vẫn là `PENDING_APPROVAL` (chờ admin duyệt)
   - Admin duyệt → status chuyển thành `ACTIVE` → hiển thị trên MainScreen

3. **Order Creation:**
   - Buyer chỉ có thể tạo order khi đã đăng nhập
   - Order được tạo với `listingId` và `basePrice: 0`

4. **SessionStorage:**
   - Dữ liệu được lưu tạm trong `sessionStorage` để truyền giữa các trang
   - Nên clear sau khi sử dụng xong để tránh dữ liệu cũ

---

## KẾT LUẬN

Luồng code từ seller đăng nhập đến buyer tạo order được thiết kế rõ ràng với các bước:
1. Authentication và authorization
2. Post creation với payment
3. Admin approval
4. Order creation

Mỗi bước đều có validation và error handling phù hợp. Status management đảm bảo chỉ bài đăng đã được duyệt mới hiển thị cho buyer.

