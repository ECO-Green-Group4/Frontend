// Context cho authentication
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/AuthService';
import type { User, AuthContextType, AuthResponse, LayoutProps, RegisterData, UpdateProfileCompleteData } from '@/types';

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

  // Đăng nhập với Google
  const googleLogin = async (idToken: string): Promise<AuthResponse> => {
    const response = await AuthService.loginWithGoogle(idToken);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  // Đăng ký với Google
  const googleRegister = async (idToken: string): Promise<AuthResponse> => {
    const response = await AuthService.registerWithGoogle(idToken);
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

  // Cập nhật profile với thông tin bổ sung (dành cho Google users)
  const updateProfileComplete = async (profileData: UpdateProfileCompleteData): Promise<string> => {
    const message = await AuthService.updateProfileComplete(profileData);
    // Refresh user data sau khi update
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data after update:', error);
    }
    return message;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    googleLogin,
    googleRegister,
    register, 
    logout,
    updateProfile,
    updateProfileComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
