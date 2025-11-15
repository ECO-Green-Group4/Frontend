# Luồng Chính: Bán Xe Điện

## 1. Tổng quan
Tài liệu này mô tả end-to-end journey của một người bán (seller) từ lúc chuẩn bị đăng tin xe điện cho tới khi đơn hàng được hoàn tất. Luồng kết nối nhiều màn hình và dịch vụ trong frontend, kết hợp các API chính của backend.

## 2. Vai trò & thành phần liên quan
- **Seller**: Đăng tin, thanh toán phí đăng bài, theo dõi hợp đồng.
- **Admin**: Duyệt bài đăng, gán nhân viên xử lý đơn.
- **Buyer**: Xem chi tiết xe và đặt mua.
- **Staff**: Xử lý đơn hàng, tạo và hoàn tất hợp đồng, thêm dịch vụ bổ sung.
- **Frontend modules**:
  - `CreatePost`, `VehicleForm`, `Payment`, `VnPayCallback`, `Waiting`
  - `DescriptionEV`, `PaymentService.createVehicleOrder`
  - `PostManagement`, `OrderManagement`
  - `StaffOrderManagement`, `ContractManagement`, `StaffContractsList`, `ContractAddon`
  - `ContractDetail`, `MyContract`, `History`

## 3. Điều kiện tiên quyết
- Seller đã có tài khoản và đăng nhập thành công (sử dụng `Login`, `AuthContext`, token lưu trong `localStorage`).
- Backend cung cấp các API: `/seller/packages`, `/seller/listings/...`, `/payments/...`, `/admin/...`, `/staff/...`, `/contract/...`, `/buyer/orders`.
- Đã cấu hình ImgBB và VNPay theo hướng dẫn trong `PostPaymentService` và `PaymentService`.

## 4. Screen Flow (Seller Journey)

| Step | Screen / Route | Key Actions | Outcome / Next Screen |
|------|----------------|-------------|------------------------|
| 0 | `/register` (`Register.tsx`) | Nhập thông tin cá nhân, gửi form tới `AuthService.register` | Hiển thị toast thành công → chuyển tới `/login` |
| 1 | `/login` (`Login.tsx`) | Nhập email/password, `AuthService.login`, cập nhật `AuthContext` | Nếu thất bại: hiển thị lỗi, vẫn ở `/login`; nếu thành công: redirect theo role (seller ⇒ `/`) |
| 2 | Trang chủ hoặc dashboard seller (`/` hoặc `/dashboard`) | Seller chọn hành động “Create Post” (button/menu) | Điều hướng tới `/create-post` |
| 3 | `/create-post` (`CreatePost.tsx`) | - Lấy danh sách gói (`/seller/packages`) <br> - Chọn category (EV/Battery) <br> - Chọn gói đăng tin và số ngày | Khi chọn category → hiển thị form tương ứng (`VehicleForm`/`BatteryForm`) |
| 4a | `VehicleForm` (trong `/create-post`) | Nhập thông tin xe, upload ảnh lên ImgBB (`uploadImgBBMultipleFile`) | Submit thành công → `CreatePost.handleFormSubmit` lưu `pendingPostData` |
| 4b | `BatteryForm` (trong `/create-post`) | Nhập thông tin pin, upload ảnh | Submit thành công → `CreatePost.handleFormSubmit` lưu `pendingPostData` |
| 5 | `/payment` (`Payment.tsx`) | Đọc `paymentInfo` & `pendingPostData`, gọi `PaymentService.createListingWithPackage`, lưu `pendingListingId`, gọi `createVnPayPayment` | Redirect sang trang VNPay (`paymentUrl`) |
| 6 | VNPay Hosted Page | Người bán thanh toán phí đăng tin | VNPay redirect lại frontend → `/vnpay-callback` |
| 7 | `/vnpay-callback` (`VnPayCallback.tsx`) | Xác thực callback với backend, cập nhật listing trạng thái `PENDING_APPROVAL`, xoá sessionStorage | Navigate tới `/waiting` với thông báo chờ duyệt |
| 8 | `/waiting` (`Waiting.tsx`) | Hiển thị thông báo “Bài đăng đang chờ admin duyệt” và nút quay về trang chủ | Seller trở lại trang chủ hoặc xem danh sách bài đăng |
| 9 | `/admin/posts` (Admin) | Admin duyệt bài đăng → chuyển trạng thái `ACTIVE` | Bài xuất hiện công khai (`MainScreen`, `/description-ev/:id`) |
| 10 | `/description-ev/:id` (`DescriptionEV.tsx`) | Buyer xem chi tiết, click “Mua ngay” → `PaymentService.createVehicleOrder` | Order mới được tạo; seller theo dõi ở các màn hình tiếp theo |
| 11 | `/staff/orders`, `/staff/contracts`, `/contract/:contractId`, `/my-contracts`, `/history` | Chuỗi màn hình xử lý đơn hàng, ký hợp đồng, thanh toán add-on, cập nhật lịch sử | Kết thúc khi contract được staff hoàn tất (`StaffContractsList` → `ContractService.completeContract`) |

## 4. Luồng chi tiết

### Bước 1: Chuẩn bị & truy cập trang tạo bài
1. Seller đăng nhập (`/login`). `AuthContext` kiểm tra token và role.
2. Seller chọn menu **Create Post** (`/create-post`). Route này được bảo vệ bởi `ProtectedRoute`, không cho phép truy cập nếu chưa login.

### Bước 2: Chọn gói & nhập thông tin xe (`CreatePost.tsx`, `VehicleForm.tsx`)
1. Trang tải danh sách gói đăng tin qua API `/seller/packages`.
2. Seller chọn category **EV** (mặc định) và chọn gói (gồm phí theo ngày, highlight, thời gian).
3. Seller nhập form xe điện:
   - Thông tin cơ bản: tiêu đề, mô tả, giá, vị trí.
   - Thông số kỹ thuật: hãng, mẫu xe, năm sản xuất, tình trạng, quãng đường, màu sắc, biển số, phụ kiện.
   - Hình ảnh: upload nhiều ảnh qua `uploadImgBBMultipleFile` ⇒ nhận URL từ ImgBB.
4. Form kiểm tra đầy đủ validation (tiêu đề, giá, ảnh, …) và hiển thị toast khi thiếu dữ liệu.

### Bước 3: Lưu dữ liệu & điều hướng đến thanh toán (`Payment.tsx`)
1. Khi submit, `CreatePost.handleFormSubmit`:
   - Tính tổng tiền = `listingFee * customDays`.
   - Lưu `pendingPostData` vào `sessionStorage` (bao gồm category, data form, package, số ngày).
   - Điều hướng tới `/payment` và truyền `paymentInfo` qua `navigate state`.
2. Ở trang Payment:
   - Kiểm tra `paymentInfo` và `pendingPostData`.
   - Gọi `PaymentService.createListingWithPackage` để dựng payload listing (thêm `quantity = customDays`) và gửi tới backend.
   - Backend trả về `listingPackageId` và `listingId`; frontend lưu `pendingListingId` vào `sessionStorage`.
   - Gọi `PaymentService.createVnPayPayment(listingPackageId)` để lấy `paymentUrl`, sau đó redirect VNPay.

### Bước 4: Xử lý callback VNPay & chuyển sang trạng thái chờ (`VnPayCallback.tsx`, `Waiting.tsx`)
1. VNPay redirect về `/vnpay-callback` kèm query params.
2. Component gọi `PaymentService.handleVnPayFrontendCallback` để xác thực với backend:
   - Nếu thành công: cập nhật listing sang `PENDING_APPROVAL`, xoá `pendingListingId`.
   - Điều hướng tới `/waiting` kèm thông báo “Bài đăng chờ admin duyệt”.
3. Seller nhìn thấy trang `Waiting` và quay lại trang chủ khi cần.

### Bước 5: Admin duyệt bài (`PostManagement.tsx`)
1. Admin truy cập `/admin/posts` (RoleRoute yêu cầu role 2).
2. Trong danh sách, bài đăng mới xuất hiện với trạng thái `PENDING_APPROVAL`.
3. Admin mở modal chi tiết, kiểm tra thông tin, nhấn **Duyệt** (`handleApproveListing`) ⇒ gọi `PostService.updatePostStatus` chuyển sang `ACTIVE`.
4. Listing đã duyệt sẽ hiển thị công khai trên `MainScreen` và trang detail.

### Bước 6: Buyer xem và đặt mua (`DescriptionEV.tsx`)
1. Buyer mở `/description-ev/:id`, xem thông tin xe, hình ảnh, người bán.
2. Khi bấm **Mua ngay**:
   - Kiểm tra đăng nhập; nếu chưa có token => chuyển `/login`.
   - Gọi `PaymentService.createVehicleOrder(listingId)` (API `POST /buyer/orders`).
   - Backend tạo order mới với trạng thái mặc định (`PENDING`), trả về thông tin order. Frontend hiển thị toast thành công.

### Bước 7: Admin/Staff xử lý đơn hàng
1. **Admin gán staff** tại `/admin/orders` (`OrderManagement.tsx`):
   - Xem list order, filter theo trạng thái.
   - Chọn đơn và chỉ định staff (`OrderService.assignStaffToOrder`).
2. **Staff nhận order** tại `/staff/orders` (`StaffOrderManagement.tsx`):
   - Xem thông tin buyer/seller, listing, trạng thái.
   - Mở dialog để xem chi tiết listing nếu cần.

### Bước 8: Tạo và quản lý hợp đồng
1. Staff mở `/staff/contracts` (`ContractManagement.tsx`):
   - Chọn order, nhấn **Tạo contract** ⇒ `ContractService.generateContract(orderId)` => backend sinh contract và chuyển tới `/staff/contract-addon`.
2. **Thêm dịch vụ add-on** (nếu có) tại `/staff/contract-addon`:
   - Nhập hoặc lấy `contractId` từ query.
  - Tải danh sách service khả dụng (`/addon/services`), chọn dịch vụ và người trả phí (buyer/seller).
  - Gửi request `/addon/contract-addon` để gắn dịch vụ vào contract, cập nhật danh sách và tổng phí.
3. Staff mở `/staff/contracts` hoặc `/staff/signed-contracts` để kiểm tra trạng thái ký kết và add-on.

### Bước 9: Buyer/Seller ký hợp đồng & thanh toán add-on
1. Cả hai bên truy cập `/contract/:contractId` (`ContractDetail.tsx`):
   - Nhận diện tự động là buyer hay seller (dựa vào user ID).
   - Gửi OTP (`ContractService.getContractOtp`) và nhập mã để ký (`POST /contract/sign`).
   - Nếu có add-on chưa thanh toán, bấm nút VNPay tương ứng (buyer/seller) để thanh toán (`/payments/contract/:id/addons/vnpay`).
2. Người bán có thể theo dõi hợp đồng của mình tại `/my-contracts` (`MyContract.tsx`) và xem chi tiết từng contract.

### Bước 10: Hoàn tất đơn & cập nhật lịch sử
1. Khi cả hai bên đã ký và add-on đã thanh toán, staff dùng trang `/staff/signed-contracts` (`StaffContractsList.tsx`) để đánh dấu **Hoàn thành hợp đồng** (`ContractService.completeContract`).
2. Các giao dịch và contract liên quan xuất hiện trong trang lịch sử `/history` và `/my-contracts`.

## 5. API & dữ liệu chính
- **Đăng tin**: `/seller/packages`, `/seller/listings/vehicle`, `/seller/listings/battery`
- **Thanh toán bài đăng**: `/payments/vnpay` (qua `PaymentService.createVnPayPayment`), `/payments/handle-vnpay`
- **Duyệt bài**: `/admin/listings/...`
- **Đơn hàng**: `/buyer/orders`, `/admin/orders`, `/staff/orders`
- **Hợp đồng**: `/contract/generate`, `/contract/contractDetails/{id}`, `/contract/sign`, `/contract/complete`
- **Add-on services**: `/addon/services`, `/addon/contract-addon`, `/addon/contract/{id}/addons`

## 6. Trạng thái quan trọng
- **Listing**: `PENDING_APPROVAL` → `ACTIVE` → (có thể `INACTIVE`, `REJECTED`)
- **Order**: `PENDING` → `PROCESSING`/`CONFIRMED` → `COMPLETED`/`CANCELLED`
- **Contract**: `DRAFT` → `PENDING` → `SIGNED` → `COMPLETED`
- **Add-on payment**: `PENDING` → `PAID`

## 7. Ghi chú
- Các trang `ViewCart`, `ElectricVehicle`, `Battery` hiện là placeholder, luồng bán xe không sử dụng.
- `pendingPostData` và `pendingListingId` lưu trong `sessionStorage` chỉ mang tính tạm thời; nên được xoá khi hoàn tất hoặc lỗi.
- Có thể mở rộng luồng bằng cách điều hướng seller/buyer đến trang quản lý đơn sau khi tạo order, hoặc gửi thông báo real-time.


