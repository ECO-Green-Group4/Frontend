import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị fallback hoặc form yêu cầu đăng nhập
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn cần đăng nhập để tạo bài đăng mới
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Đăng nhập
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full border-green-500 text-green-500 hover:bg-green-50"
              >
                Đăng ký tài khoản
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Quay về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị children
  return <>{children}</>;
};

export default AuthGuard;
