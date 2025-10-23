import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/unauthorized' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra auth
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

  // Nếu chưa đăng nhập, redirect đến login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền theo roleId hoặc roleName
  // requiredRole có thể là: '2' (admin), '3' (staff), '1' (user)
  // hoặc: 'admin', 'staff', 'user'
  const hasPermission = 
    user.roleId === requiredRole || 
    user.roleName === requiredRole ||
    user.role === requiredRole ||
    // Thêm mapping cho trường hợp roleId string
    (requiredRole === '2' && (user.role === 'admin' || user.roleId === '2')) ||
    (requiredRole === '3' && (user.role === 'staff' || user.roleId === '3')) ||
    (requiredRole === '1' && (user.role === 'user' || user.roleId === '1'));

  // Nếu không có quyền, redirect đến fallback path
  if (!hasPermission) {
    console.warn(`User ${user.email} không có quyền truy cập. Required: ${requiredRole}, User role: ${user.roleId || user.roleName || user.role}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // Nếu có quyền, render children
  return <>{children}</>;
};

export default RoleRoute;
