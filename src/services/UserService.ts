import api from './axios';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  role: 'admin' | 'user' | 'staff';
  status: 'active' | 'true' | null;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  address: string;
  createdAt: string | null;
  currentMembershipId: number | null;
  membershipExpiry: string | null;
  availableCoupons: number | null;
}

export interface UserResponse {
  message: string;
  success: boolean;
  data: User[];
}

export const UserService = {
  // Lấy tất cả user
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<UserResponse>('/admin/users');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },



  // Thay đổi trạng thái user
  toggleUserStatus: async (userId: number, status: boolean): Promise<User> => {
    try {
      const response = await api.put<User>(`/admin/users/${userId}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // Thay đổi role của user
  changeUserRole: async (userId: number, newRole: 'admin' | 'user' | 'staff'): Promise<any> => {
    try {
      console.log(`Changing user ${userId} role to ${newRole}`);
      const response = await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      console.log('Role change response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  },

};