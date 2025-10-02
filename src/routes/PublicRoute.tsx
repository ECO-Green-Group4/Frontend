// Component cho route công khai - redirect về home nếu đã đăng nhập
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect về trang chỉ định
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu chưa đăng nhập, hiển thị component
  return children;
};

export default PublicRoute;
