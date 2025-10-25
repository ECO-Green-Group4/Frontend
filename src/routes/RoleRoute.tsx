import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck'; // Import hàm isAdmin đã sửa

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: string; // ví dụ: "2" (admin), "3" (staff)
  fallbackPath?: string;
}

// Hàm helper an toàn để lấy các role, tránh "undefined"
const getSafeUserRoles = (user: User | null): string[] => {
  if (!user) return [];
  
  const roles: string[] = [];
  if (user.roleId) {
    roles.push(String(user.roleId));
  }
  if (user.role) {
    roles.push(user.role);
  }
  if (user.roleName) {
    roles.push(user.roleName);
  }
  return roles;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/unauthorized' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // LOGIC KIỂM TRA QUYỀN ĐƯỢC SỬA LẠI AN TOÀN
  let hasPermission = false;
  const safeRoles = getSafeUserRoles(user); // Lấy mảng role an toàn

  // Kiểm tra quyền Admin
  if (requiredRole === '2') {
    hasPermission = isAdmin(user); // Dùng hàm isAdmin đã sửa
  } 
  
  // Kiểm tra 'staff'
  else if (requiredRole === '3') {
    hasPermission = safeRoles.some(r => r.toLowerCase() === '3' || r.toLowerCase() === 'staff');
  }
  
  // Kiểm tra 'user'
  else if (requiredRole === '1') {
     hasPermission = safeRoles.some(r => r.toLowerCase() === '1' || r.toLowerCase() === 'user');
  }

  // Nếu không có quyền
  if (!hasPermission) {
    // DÒNG DEBUG QUAN TRỌNG:
    // Hãy mở F12 (Console) trên trình duyệt để xem object user của bạn thực sự là gì.
    // Bạn sẽ biết được API đang trả về tên thuộc tính là gì (ví dụ: 'roleName' hay 'role_id' hay 'authority'...)
    console.error("DEBUG: USER KHÔNG CÓ QUYỀN TRUY CẬP");
    console.error("Required Role:", requiredRole);
    console.error("Actual User Object:", user); 
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Nếu có quyền
  return <>{children}</>;
};

export default RoleRoute;