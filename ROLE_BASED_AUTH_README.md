# Role-Based Authentication System

## Tổng quan
Hệ thống xác thực dựa trên vai trò (Role-Based Authentication) cho phép kiểm soát quyền truy cập theo roleId và roleName.

## Cấu trúc Roles

### Role Mapping
- **roleId = '1'** → **roleName = 'user'** → **role = 'user'**
- **roleId = '2'** → **roleName = 'admin'** → **role = 'admin'**  
- **roleId = '3'** → **roleName = 'staff'** → **role = 'staff'**

### Quyền truy cập
- **User (roleId: '1')**: Truy cập các trang công khai và protected routes
- **Admin (roleId: '2')**: Truy cập tất cả routes, bao gồm admin dashboard
- **Staff (roleId: '3')**: Truy cập các trang staff (có thể mở rộng)

## Components

### 1. RoleRoute Component
```tsx
<RoleRoute requiredRole="2">
  <AdminDashboardPage />
</RoleRoute>
```

**Props:**
- `requiredRole`: RoleId hoặc roleName yêu cầu
- `fallbackPath`: Đường dẫn redirect khi không có quyền (mặc định: '/unauthorized')

### 2. User Type
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'staff';
  roleId?: string;
  roleName?: 'user' | 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
}
```

## Routes Structure

### Admin Routes (Chỉ dành cho Admin - roleId = '2')
```tsx
{/* Admin Routes - Chỉ dành cho Admin (roleId = '2') */}
<Route path="/admin" element={
  <RoleRoute requiredRole="2">
    <AdminDashboardPage />
  </RoleRoute>
} />

<Route path="/admin/users" element={
  <RoleRoute requiredRole="2">
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  </RoleRoute>
} />

<Route path="/admin/packages" element={
  <RoleRoute requiredRole="2">
    <AdminLayout>
      <PackageManagement />
    </AdminLayout>
  </RoleRoute>
} />
```

### Unauthorized Page
- Route: `/unauthorized`
- Hiển thị khi user không có quyền truy cập
- Có nút "Quay lại" và "Về trang chủ"

## Authentication Flow

### 1. Login Process
```typescript
const login = async (email: string, password: string) => {
  const response = await AuthService.login(email, password);
  
  // Auto-mapping roleId to roleName and role
  const processedUser = {
    ...response.user,
    roleName: response.user.roleId === '1' ? 'user' : 
             response.user.roleId === '2' ? 'admin' : 
             response.user.roleId === '3' ? 'staff' : response.user.role,
    role: response.user.roleId === '1' ? 'user' : 
          response.user.roleId === '2' ? 'admin' : 
          response.user.roleId === '3' ? 'staff' : response.user.role
  };
  
  return { ...response, user: processedUser };
};
```

### 2. Role Checking
```typescript
const hasPermission = 
  user.roleId === requiredRole || 
  user.roleName === requiredRole ||
  user.role === requiredRole;
```

## Usage Examples

### 1. Bảo vệ Admin Routes
```tsx
// Chỉ admin mới có thể truy cập
<Route path="/admin" element={
  <RoleRoute requiredRole="2">
    <AdminDashboardPage />
  </RoleRoute>
} />
```

### 2. Bảo vệ Staff Routes
```tsx
// Chỉ staff mới có thể truy cập
<Route path="/staff" element={
  <RoleRoute requiredRole="3">
    <StaffDashboard />
  </RoleRoute>
} />
```

### 3. Bảo vệ với Fallback Path
```tsx
// Redirect đến trang khác khi không có quyền
<Route path="/special" element={
  <RoleRoute requiredRole="2" fallbackPath="/dashboard">
    <SpecialPage />
  </RoleRoute>
} />
```

## Error Handling

### 1. Unauthorized Access
- User không có quyền → Redirect đến `/unauthorized`
- Hiển thị thông báo lỗi 403
- Có nút quay lại hoặc về trang chủ

### 2. Not Authenticated
- User chưa đăng nhập → Redirect đến `/login`
- Giữ lại URL gốc để redirect sau khi login

### 3. Loading State
- Hiển thị loading spinner khi đang kiểm tra quyền
- Tránh flash content không mong muốn

## API Integration

### Expected API Response
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "admin@example.com",
    "roleId": "2",
    "role": "admin"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Role Mapping Logic
```typescript
// Tự động map roleId thành roleName và role
const mapRole = (roleId: string) => {
  const roleMap = {
    '1': { roleName: 'user', role: 'user' },
    '2': { roleName: 'admin', role: 'admin' },
    '3': { roleName: 'staff', role: 'staff' }
  };
  return roleMap[roleId] || { roleName: 'user', role: 'user' };
};
```

## Security Features

1. **Multiple Role Checks**: Kiểm tra cả roleId, roleName và role
2. **Automatic Redirects**: Tự động redirect khi không có quyền
3. **Loading States**: Tránh flash content
4. **Error Boundaries**: Xử lý lỗi gracefully
5. **Token Validation**: Kiểm tra token trước khi check role

## Testing

### Test Cases
1. **Admin Access**: User với roleId='2' có thể truy cập admin routes
2. **User Access**: User với roleId='1' không thể truy cập admin routes
3. **Staff Access**: User với roleId='3' có thể truy cập staff routes
4. **Unauthenticated**: User chưa login redirect đến login page
5. **Invalid Role**: User với roleId không hợp lệ redirect đến unauthorized

### Manual Testing
1. Login với admin account (roleId='2')
2. Truy cập `/admin` → Should work
3. Login với user account (roleId='1')  
4. Truy cập `/admin` → Should redirect to `/unauthorized`
5. Logout và truy cập `/admin` → Should redirect to `/login`
