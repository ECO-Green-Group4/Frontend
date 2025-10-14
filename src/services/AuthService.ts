// Service xử lý authentication
import type { User, AuthResponse, RegisterData } from '@/types';
import api from './axios';

class AuthService {
  // Đăng nhập
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data: AuthResponse = response.data;
      
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  // Đăng ký
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      const data: AuthResponse = response.data;
      
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  // Đăng xuất
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Kiểm tra đã đăng nhập
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Lấy refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Lấy thông tin user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await api.get('/auth/me');
      const user: User = response.data;
      return user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
      }
      throw new Error('Không thể lấy thông tin user');
    }
  }

  // Cập nhật thông tin user
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Chưa đăng nhập');

      const response = await api.put('/auth/profile', userData);
      const updatedUser: User = response.data;
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await api.post('/auth/refresh', { refreshToken });
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        return data.token;
      }

      return null;
    } catch (error) {
      this.logout();
      return null;
    }
  }
}

export default new AuthService();
