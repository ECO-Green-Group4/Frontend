import api from './axios';
import { Order, OrderResponse, AssignStaffResponse } from '@/types/api';

export const OrderService = {
  // Lấy tất cả orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get<OrderResponse>('/admin/orders');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Chỉ định staff cho order
  assignStaffToOrder: async (orderId: number, staffId: number): Promise<Order> => {
    try {
      const response = await api.put<AssignStaffResponse>(
        `/admin/orders/${orderId}/assign-staff?staffId=${staffId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error assigning staff to order:', error);
      throw error;
    }
  }
};
