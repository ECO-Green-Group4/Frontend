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
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            // Debug logging
            console.log('CheckAuth userData:', userData);
            
            // Xử lý user data từ getCurrentUser API
            // API getCurrentUser trả về cấu trúc khác với login API
            console.log('Raw userData from getCurrentUser:', userData);
            
            // Kiểm tra nếu user là admin dựa trên email hoặc role
            const isAdmin = userData.email === 'admin@evmarket.com' || 
                           userData.role === 'admin' || 
                           userData.roleId === '2' ||
                           userData.roleName === 'admin';
            
            const processedUser: User = {
              ...userData,
              // Force admin role nếu là admin user
              role: isAdmin ? 'admin' : (userData.role?.toLowerCase() as 'user' | 'admin' | 'staff') || 'user',
              roleName: isAdmin ? 'admin' : (userData.role?.toLowerCase() as 'user' | 'admin' | 'staff') || 'user',
              roleId: isAdmin ? '2' : 
                     (userData.role === 'staff' || (userData.role as string) === 'STAFF') ? '3' : '1'
            };
            
            console.log('CheckAuth processed user:', processedUser);
            
            setUser(processedUser);
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
    try {
      const response = await AuthService.login(email, password);
      
      // Debug logging
      console.log('Login response:', response);
      
      // Kiểm tra response có tồn tại không
      if (!response) {
        console.error('Invalid response structure:', response);
        throw new Error('Response not found');
      }
      
      // Xử lý cấu trúc API response mới
      // API trả về: { message, role, token, id, sex, fullName }
      
      // Kiểm tra nếu user là admin dựa trên email hoặc role
      const isAdmin = email === 'admin@evmarket.com' || response.role === 'admin';
      
      const userData: User = {
        id: response.id?.toString() || '',
        name: response.fullName || '',
        email: email, // Sử dụng email từ input
        role: isAdmin ? 'admin' : (response.role?.toLowerCase() as 'user' | 'admin' | 'staff') || 'user',
        roleId: isAdmin ? '2' : 
                response.role === 'STAFF' ? '3' : '1', // Map role to roleId
        roleName: isAdmin ? 'admin' : (response.role?.toLowerCase() as 'user' | 'admin' | 'staff') || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Processed user:', userData);
      console.log('Token saved:', response.token ? 'Yes' : 'No');
      console.log('Is admin check:', isAdmin);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return {
        user: userData,
        token: response.token,
        refreshToken: response.refreshToken || undefined
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Đăng xuất
  const logout = (): void => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Đăng ký
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await AuthService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Cập nhật thông tin user
  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
