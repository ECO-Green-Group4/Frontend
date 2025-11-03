import api from './axios';

export interface FavoriteListing {
  id?: number;
  listingId: number;
  userId?: number;
  listing?: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
    images?: string[];
    description?: string;
    category?: "EV" | "Battery";
    location?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    numberOfSeats?: number;
    batteryCapacity?: string;
    createdAt?: string;
    user?: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
  };
  createdAt?: string;
}

export interface FavoriteResponse {
  message?: string;
  success?: boolean;
  data: FavoriteListing[];
}

export interface CheckFavoriteResponse {
  message?: string;
  success?: boolean;
  data: boolean;
}

export const FavoriteService = {
  // GET /api/favorites - Lấy danh sách tất cả favorites
  getFavorites: async (): Promise<FavoriteListing[]> => {
    try {
      console.log('Fetching favorites...');
      const response = await api.get<FavoriteResponse>('/favorites');
      console.log('Favorites response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // POST /api/favorites/{listingId} - Thêm vào favorites
  addFavorite: async (listingId: number | string): Promise<any> => {
    try {
      console.log('Adding favorite for listing ID:', listingId);
      const response = await api.post(`/favorites/${listingId}`);
      console.log('Add favorite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // DELETE /api/favorites/{listingId} - Xóa khỏi favorites
  removeFavorite: async (listingId: number | string): Promise<any> => {
    try {
      console.log('Removing favorite for listing ID:', listingId);
      const response = await api.delete(`/favorites/${listingId}`);
      console.log('Remove favorite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // GET /api/favorites/check/{listingId} - Kiểm tra listing có trong favorites không
  checkFavorite: async (listingId: number | string): Promise<boolean> => {
    try {
      console.log('Checking favorite for listing ID:', listingId);
      const response = await api.get<CheckFavoriteResponse>(`/favorites/check/${listingId}`);
      console.log('Check favorite response:', response.data);
      return response.data.data || false;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }
};

export default FavoriteService;

