// Component cho route công khai - redirect về home nếu đã đăng nhập
import { useAuth } from '../hooks/useAuth';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect dựa trên role
  if (isAuthenticated) {
    return <RoleBasedRedirect />;
  }

  // Nếu chưa đăng nhập, hiển thị component
  return children;
};

export default PublicRoute;
