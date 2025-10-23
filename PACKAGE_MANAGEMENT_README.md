# Package Management System

## Tổng quan
Hệ thống quản lý packages (gói membership) cho admin panel, tích hợp với 2 API chính:
- `GET /api/admin/memberships` - Lấy danh sách packages
- `POST /api/admin/memberships` - Tạo package mới

## Tính năng chính

### 1. Hiển thị danh sách packages
- Hiển thị tất cả packages với thông tin chi tiết
- Search theo tên, loại package, trạng thái
- Filter packages
- Responsive design

### 2. Tạo package mới
- Form tạo package với đầy đủ các trường:
  - **Tên Package**: Tên gói membership
  - **Loại Package**: Basic, Premium, VIP
  - **Giới hạn Listing**: Số lượng listing tối đa
  - **Phí Listing**: Phí tính bằng VND
  - **Thời hạn**: Số ngày hiệu lực
  - **Giảm giá hoa hồng**: Phần trăm giảm giá
  - **Trạng thái**: Active/Inactive
  - **Highlight**: Có highlight package hay không

### 3. Chỉnh sửa package
- Form edit với dữ liệu đã có sẵn
- Cập nhật thông tin package
- Validation dữ liệu

### 4. Xóa package
- Xóa package với confirmation
- Xử lý lỗi và thông báo

## Cấu trúc file

```
src/
├── services/
│   └── PackageService.ts          # Service gọi API
├── components/
│   └── PackageManagement.tsx      # Component chính
├── routes/
│   └── AppRoutes.tsx              # Routing
└── utils/
    └── toast.ts                   # Toast notifications
```

## API Integration

### PackageService Methods:
- `getAllPackages()`: Lấy danh sách packages
- `createPackage(data)`: Tạo package mới
- `updatePackage(id, data)`: Cập nhật package
- `deletePackage(id)`: Xóa package

### Data Structure:
```typescript
interface Package {
  id?: number;
  name: string;
  packageType: 'LISTING_VIP' | 'LISTING_PREMIUM' | 'LISTING_BASIC';
  listingLimit: number;
  listingFee: number;
  highlight: boolean;
  durationDays: number;
  commissionDiscount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Cách sử dụng

1. **Truy cập trang**: `http://localhost:5173/admin/packages`
2. **Xem danh sách**: Packages hiển thị dưới dạng cards
3. **Tạo mới**: Click "Thêm Package" → Điền form → Click "Tạo Package"
4. **Chỉnh sửa**: Click icon Edit → Sửa thông tin → Click "Cập nhật Package"
5. **Xóa**: Click icon Trash → Confirm → Package sẽ bị xóa

## Error Handling

- **API Errors**: Hiển thị thông báo lỗi chi tiết
- **Validation**: Kiểm tra dữ liệu input
- **Loading States**: Hiển thị loading khi đang xử lý
- **Toast Notifications**: Thông báo thành công/lỗi

## Styling

- Sử dụng Tailwind CSS
- Responsive design
- Dark theme support
- Consistent với design system

## Dependencies

- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Radix UI (dialog components)
- React Toastify (notifications)
- Axios (API calls)

## Troubleshooting

### Lỗi thường gặp:

1. **API không hoạt động**: Kiểm tra backend server
2. **Dữ liệu không hiển thị**: Kiểm tra network và console
3. **Form validation**: Đảm bảo điền đầy đủ thông tin
4. **Permission errors**: Kiểm tra quyền admin

### Debug:
- Mở Developer Tools (F12)
- Kiểm tra Console tab
- Kiểm tra Network tab cho API calls
- Kiểm tra Application tab cho localStorage
