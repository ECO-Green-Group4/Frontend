import api from './axios';

export interface StatisticsData {
  totalListings: number;
  activeListings: number;
  rejectedListings: number;
  totalUsers: number; // Fixed: camelCase to match API
  suspendedListings: number;
  inactiveUsers: number;
  activeUsers: number;
  pendingListings: number;
  totalOrders: number; // Fixed: camelCase to match API
  totalPayments: number;
}

export interface StatisticsResponse {
  message: string;
  success: boolean;
  data: StatisticsData;
}

export const AdminStatisticsService = {
  // Lấy thống kê hệ thống
  getStatistics: async (): Promise<StatisticsData> => {
    try {
      console.log('Fetching admin statistics...');
      const response = await api.get<StatisticsResponse>('/admin/statistics');
      console.log('Statistics response:', response.data);
      
      // Map API response to match our interface (handle both camelCase and lowercase)
      const data = response.data.data;
      return {
        totalListings: data.totalListings || 0,
        activeListings: data.activeListings || 0,
        rejectedListings: data.rejectedListings || 0,
        totalUsers: data.totalUsers || data.totalusers || 0,
        suspendedListings: data.suspendedListings || 0,
        inactiveUsers: data.inactiveUsers || 0,
        activeUsers: data.activeUsers || 0,
        pendingListings: data.pendingListings || 0,
        totalOrders: data.totalOrders || data.totalorders || 0,
        totalPayments: data.totalPayments || 0,
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
};

