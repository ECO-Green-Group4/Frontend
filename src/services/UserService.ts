// Service xử lý user data
import AuthService from './AuthService';
import type { User, PaginatedResponse, PaginationParams } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  // Helper để tạo headers với token
  private getAuthHeaders(): Record<string, string> {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Lấy danh sách users
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);

      const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách users');
      }

      const data: PaginatedResponse<User> = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin user theo ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy thông tin user');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin user');
      }

      const updatedUser: User = await response.json();
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Xóa user
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa user');
      }
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm users
  async searchUsers(query: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);

      const response = await fetch(`${API_BASE_URL}/users/search?${queryParams.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tìm kiếm users');
      }

      const data: PaginatedResponse<User> = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
