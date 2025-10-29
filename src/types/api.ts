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

// Order types
// Order related types
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
  data: Order;

}