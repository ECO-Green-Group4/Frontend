import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // Danh sách các route user thường (admin không được truy cập)
  const userOnlyRoutes = [
    '/profile',
    '/create-post',
    '/view-cart',
    '/electric-vehicle',
    '/battery',
    '/membership',
    '/favorited',
    '/history',
    '/waiting'
  ];

  useEffect(() => {
    // Chỉ chạy khi đã load xong auth
    if (!loading && isAuthenticated && isAdmin(user)) {
      const currentPath = location.pathname;
      
      // Nếu admin đang cố truy cập trang user thường
      if (userOnlyRoutes.includes(currentPath)) {
        console.log('🚫 Admin không được truy cập trang user:', currentPath);
        navigate('/admin', { replace: true });
        return;
      }
      
      // Nếu admin truy cập trang chủ, redirect đến admin dashboard
      if (currentPath === '/') {
        console.log('🏠 Admin truy cập trang chủ, redirect đến admin');
        navigate('/admin', { replace: true });
        return;
      }
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};

export default AdminGuard;
