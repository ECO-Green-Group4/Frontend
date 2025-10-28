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
  
  // Normalize để so sánh case-insensitive
  const userRoleId = String(user.roleId || '').toLowerCase();
  const userRole = String(user.role || '').toLowerCase();
  const userRoleName = String(user.roleName || '').toLowerCase();
  const required = String(requiredRole || '').toLowerCase();
  
  const hasPermission = 
    userRoleId === required || 
    userRoleName === required ||
    userRole === required ||
    // Thêm mapping cho trường hợp roleId string
    (required === '2' && (userRole === 'admin' || userRoleId === '2')) ||
    (required === '3' && (userRole === 'staff' || userRoleId === '3')) ||
    (required === '1' && (userRole === 'user' || userRoleId === '1'));

  // Nếu không có quyền, redirect đến fallback path
  if (!hasPermission) {
    console.warn(`User ${user.email} không có quyền truy cập. Required: ${requiredRole}, User role: ${user.roleId || user.roleName || user.role}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // Nếu có quyền, render children
  return <>{children}</>;
};

export default RoleRoute;
