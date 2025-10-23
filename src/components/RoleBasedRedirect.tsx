import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck';

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect dựa trên role của user
      if (isAdmin(user)) {
        // Admin - redirect đến admin dashboard
        navigate('/admin', { replace: true });
      } else {
        // User thường - redirect đến trang chủ
        navigate('/', { replace: true });
      }
    } else if (!loading && !isAuthenticated) {
      // Chưa đăng nhập - redirect đến trang chủ
      navigate('/', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Hiển thị loading khi đang kiểm tra
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
};

export default RoleBasedRedirect;
