// Context cho authentication
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/AuthService';
import type { User, AuthContextType, AuthResponse, LayoutProps, RegisterData } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext phải được sử dụng trong AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra authentication:', error);
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await AuthService.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  // Đăng ký
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await AuthService.register(userData);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  // Đăng xuất
  const logout = (): void => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Cập nhật thông tin user
  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    const updatedUser = await AuthService.updateProfile(userData);
    setUser(updatedUser);
    return updatedUser;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register, 
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
