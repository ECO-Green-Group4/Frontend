import api from './axios';

export interface StatisticsData {
  totalListings: number;
  activeListings: number;
  rejectedListings: number;
  totalusers: number;
  suspendedListings: number;
  inactiveUsers: number;
  activeUsers: number;
  pendingListings: number;
  totalorders: number;
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
      return response.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
};

