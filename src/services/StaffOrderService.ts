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

export interface ListingDetailUser {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  status: string;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  address: string;
  createdAt: string;
  availableCoupons: number;
}

export interface StaffOrderListingDetail {
  listingId: number;
  user: ListingDetailUser;
  itemType: string;
  title: string;
  description: string;
  images: string[];
  location: string;
  price: number;
  status: string;
  createdAt: string;
  postType: string;
  listingPackageId: number;
  packageAmount: number;
  packageStatus: string;
  packageExpiredAt: string;
  // Vehicle fields
  brand?: string;
  model?: string;
  year?: number;
  batteryCapacity?: number;
  mileage?: number;
  condition?: string;
  bodyType?: string;
  color?: string;
  inspection?: string;
  origin?: string;
  numberOfSeats?: number;
  licensePlate?: string;
  accessories?: string;
  // Battery fields
  batteryBrand?: string;
  voltage?: number;
  type?: string;
  capacity?: string;
  healthPercent?: number;
  manufactureYear?: number;
  chargeCycles?: number;
}

export interface StaffOrderListingDetailResponse {
  message: string;
  success: boolean;
  data: StaffOrderListingDetail;
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
  },

  // Lấy chi tiết listing từ orderId (cho staff sau khi được admin chỉ định)
  getOrderListingDetail: async (orderId: number): Promise<StaffOrderListingDetail> => {
    try {
      console.log(`Fetching listing detail for orderId: ${orderId}`);
      const response = await api.get<StaffOrderListingDetailResponse>(
        `/staff/orders/${orderId}/listing`
      );
      console.log('Order listing detail response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order listing detail:', error);
      throw error;
    }
  }
};

