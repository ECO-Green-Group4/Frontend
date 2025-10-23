import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SimpleAdminGuardProps {
  children: React.ReactNode;
}

const SimpleAdminGuard: React.FC<SimpleAdminGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Chỉ chạy khi đã load xong auth
    if (!loading && isAuthenticated && user) {
      const currentPath = location.pathname;
      
      // Kiểm tra admin bằng email
      const isAdminUser = user.email === 'admin@evmarket.com';
      
      if (isAdminUser) {
        // Nếu admin truy cập trang chủ, redirect đến admin dashboard
        if (currentPath === '/') {
          console.log('🏠 Admin truy cập trang chủ, redirect đến admin');
          navigate('/admin', { replace: true });
          return;
        }
        
      }
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};

export default SimpleAdminGuard;