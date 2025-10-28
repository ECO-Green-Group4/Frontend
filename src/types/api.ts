// API related types

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Order related types
export interface OrderUser {
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
  currentMembershipId: number;
  membershipExpiry: string;
  availableCoupons: number;
}

export interface Order {
  orderId: number;
  listingId: number;
  buyer: OrderUser;
  seller: OrderUser;
  assignedStaff?: OrderUser;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  notes?: string;
}

export interface OrderResponse {
  message: string;
  success: boolean;
  data: Order[];
}

export interface AssignStaffResponse {
  message: string;
  success: boolean;
  data: Order;
}