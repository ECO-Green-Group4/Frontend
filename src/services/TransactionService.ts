import api from "./axios";
import { ApiResponse } from "@/types";

export interface TransactionUser {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  phone?: string | null;
  status?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  identityCard?: string | null;
  address?: string | null;
  createdAt?: string | null;
  availableCoupons?: number | null;
}

export interface TransactionPayment {
  paymentId: number;
  paymentStatus: string;
  paymentGateway: string;
  amount: number;
  paymentDate?: string | null;
  paymentType?: string | null;
}

export interface TransactionContract {
  contractId: number;
  contractStatus: string;
  sellerSigned?: string | null;
  buyerSigned?: string | null;
  signedAt?: string | null;
}

export interface Transaction {
  orderId: number;
  listingId: number;
  listingTitle: string;
  itemType: string;
  buyer: TransactionUser;
  seller: TransactionUser;
  orderStatus: string;
  orderDate: string;
  basePrice: number;
  commissionFee: number;
  totalAmount: number;
  payment?: TransactionPayment | null;
  contract?: TransactionContract | null;
  reviews?: any[];
}

export interface TransactionFilterParams {
  role?: "buyer" | "seller" | "all";
  status?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || "Request failed");
  }

  if (response.data === undefined || response.data === null) {
    throw new Error("No data returned from server");
  }

  return response.data;
};

export const TransactionService = {
  async getHistory(): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<Transaction[]>>(
      "/transactions/history"
    );
    return extractData(response.data);
  },

  async filterHistory(
    params: TransactionFilterParams = {}
  ): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<Transaction[]>>(
      "/transactions/history/filter",
      { params }
    );
    return extractData(response.data);
  },

  async getDetail(orderId: number): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(
      `/transactions/${orderId}/detail`
    );
    return extractData(response.data);
  },
};


