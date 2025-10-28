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

  // Lấy danh sách staff
  getStaffList: async (): Promise<User[]> => {
    try {
      const response = await api.get<UserResponse>('/admin/users');
      const users = response.data.data || [];

      // Chuẩn hoá xác định staff từ nhiều dạng backend có thể trả về
      const isStaff = (u: any) => {
        if (!u) return false;
        // role là chuỗi
        if (typeof u.role === 'string' && u.role.toLowerCase() === 'staff') return true;
        // roleId là số/chuỗi (ví dụ staff = 3)
        if (u.roleId && String(u.roleId) === '3') return true;
        // authorities/roles mảng
        const arrayRoles = u.roles || u.authorities || u.permissions;
        if (Array.isArray(arrayRoles)) {
          return arrayRoles.some((r: any) => String(r).toLowerCase().includes('staff'));
        }
        return false;
      };

      return users.filter(isStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  },

};