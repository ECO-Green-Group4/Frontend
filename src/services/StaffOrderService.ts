import api from './axios';

export interface Buyer {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  status: string | null;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  address: string;
  createdAt: string | null;
  currentMembershipId: number | null;
  membershipExpiry: string | null;
  availableCoupons: number | null;
}

export interface Seller {
  userId: number;
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  status: string | null;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  address: string;
  createdAt: string | null;
  currentMembershipId: number | null;
  membershipExpiry: string | null;
  availableCoupons: number | null;
}

export interface StaffOrder {
  orderId: number;
  listingId: number;
  buyer: Buyer;
  seller: Seller;
}

export interface StaffOrdersResponse {
  message: string;
  success: boolean;
  data: StaffOrder[];
}

export const StaffOrderService = {
  // Lấy tất cả orders được assign cho staff
  getAllOrders: async (): Promise<StaffOrder[]> => {
    try {
      console.log('Fetching staff orders...');
      const response = await api.get<StaffOrdersResponse>('/staff/orders');
      console.log('Staff orders response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching staff orders:', error);
      throw error;
    }
  }
};

