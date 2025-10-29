import api from './axios';

export interface OrderUser {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Order {
  orderId: number;
  listingId?: number;
  buyer: OrderUser;
  seller: OrderUser;
  status: string;
  createdAt: string;
  totalAmount: number;
  assignedStaff?: OrderUser | null;
}

export interface OrderResponse {
  message: string;
  success: boolean;
  data: Order[];
}

export interface AssignStaffResponse {
  message: string;
  success: boolean;
  data?: any;
}

export const OrderService = {
  // Lấy tất cả orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      console.log('Fetching all orders...');
      const response = await api.get<OrderResponse>('/admin/orders');
      console.log('Orders response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Chỉ định staff cho order
  assignStaffToOrder: async (orderId: number, staffId: number): Promise<AssignStaffResponse> => {
    try {
      console.log('Assigning staff to order:', { orderId, staffId });
      const response = await api.put<AssignStaffResponse>(
        `/admin/orders/${orderId}/assign-staff?staffId=${staffId}`
      );
      console.log('Assign staff response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error assigning staff to order:', error);
      throw error;
    }
  }
};

