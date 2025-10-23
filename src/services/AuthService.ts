// Service xử lý authentication
import type { User, AuthResponse, RegisterData } from '@/types';
import api, { apiWithoutPrefix } from '@/services/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class AuthService {
  //  Đăng nhập
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  email, password  }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();

    //  Lưu token vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  }

  //  Đăng ký
  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng ký thất bại');
    }

    const data: AuthResponse = await response.json();

    //  Lưu token sau khi đăng ký
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  }

  //  Đăng xuất
  logout(): void {
    try {
      // Clear tokens and any cached user info
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // Remove Authorization headers from axios instances immediately
      // so subsequent requests in the same session won't send stale tokens
      if ((api as any).defaults?.headers?.common) {
        delete (api as any).defaults.headers.common['Authorization'];
      }
      if ((apiWithoutPrefix as any).defaults?.headers?.common) {
        delete (apiWithoutPrefix as any).defaults.headers.common['Authorization'];
      }
    } catch (_) {
      // no-op
    }
  }

  //  Kiểm tra đã đăng nhập
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  //  Lấy token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  //  Lấy refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  //  Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.logout();
      throw new Error('Không thể lấy thông tin user');
    }

    return await response.json();
  }

  //  Cập nhật thông tin user
  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('Chưa đăng nhập');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật thông tin');
    }

    return await response.json();
  }

  //  Refresh token
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      return null;
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      return data.token;
    }

    return null;
  }
}

export default new AuthService();
