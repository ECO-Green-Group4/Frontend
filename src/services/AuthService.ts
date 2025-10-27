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
      // Log response details
      console.error('Login API error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Thử parse JSON, nếu fail thì lấy text
      let errorMessage = 'Đăng nhập thất bại';
      try {
        const errorData = await response.json();
        console.error('Parsed error data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Nếu có validation errors chi tiết
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).flat();
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        }
      } catch (e) {
        try {
          const errorText = await response.text();
          console.error('Error text:', errorText);
          errorMessage = errorText || errorMessage;
        } catch (e2) {
          errorMessage = response.statusText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    //  Lưu token vào localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    }

    // Tạo user object từ response data
    const user: User = {
      id: data.id?.toString() || '',
      name: data.fullName || '',
      email: email,
      phone: data.phoneNumber || '',
      role: data.role || 'user',
      roleId: data.roleId?.toString() || '1',
      roleName: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      user,
      token: data.token,
      refreshToken: data.refreshToken
    };
  }

  //  Đăng ký
  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    // Log response details
    console.log('Register response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Log để debug
    console.log('Response status:', response.status);
    console.log('Response ok?', response.ok);

    // Parse response content một cách an toàn
    const contentType = response.headers.get('content-type');
    let data: any;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Nếu không phải JSON, thử parse như text
        const textResponse = await response.text();
        console.log('Response is not JSON, text content:', textResponse);
        
        // Nếu response không ok, throw error với text content
        if (!response.ok) {
          throw new Error(textResponse || 'Đăng ký thất bại');
        }
        
        // Nếu response ok nhưng không phải JSON, cố gắng parse JSON
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          // Trường hợp đặc biệt: Nếu backend trả về "Registration successful" và status 200
          if (textResponse.toLowerCase().includes('success') && response.ok) {
            console.log('Backend returned success message:', textResponse);
            // Tạo data object giả để frontend tiếp tục
            data = {
              message: 'Registration successful',
              success: true
            };
            console.log('Created success data object:', data);
          } else {
            // Nếu parse fail và không phải success message
            console.warn('Could not parse response as JSON or text, status:', response.status);
            throw new Error('Backend trả về dữ liệu không hợp lệ');
          }
        }
      }
    } catch (error: any) {
      console.error('Error parsing response:', error);
      throw error;
    }

    // Nếu response không ok, throw error với message từ data
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || response.statusText || 'Đăng ký thất bại';
      
      // Log error details
      console.error('Register failed:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      throw new Error(errorMessage);
    }

    // Lưu token sau khi đăng ký thành công (nếu có)
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    } else {
      console.log('No token in response, user will need to login after registration');
    }

    // Log success
    console.log('Registration completed successfully:', data);
    
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

