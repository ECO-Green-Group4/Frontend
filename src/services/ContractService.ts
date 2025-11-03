import api from './axios';

export interface ContractData {
  contractId: number;
  orderId: number;
  status: string;
  sellerSigned: boolean;
  buyerSigned: boolean;
  signedAt: string;
  createdAt: string;
}

export interface GenerateContractResponse {
  message: string;
  success: boolean;
  data: ContractData;
}

export interface GetContractByOrderResponse {
  message: string;
  success: boolean;
  data: ContractData | null;
}

export interface ContractOtpResponse {
  message: string;
  success: boolean;
  data: string;
}

export interface CompleteContractResponse {
  message: string;
  success: boolean;
  data: ContractData;
}

export const ContractService = {
  // Generate contract từ orderId
  generateContract: async (orderId: number): Promise<ContractData> => {
    try {
      console.log('Generating contract for orderId:', orderId);
      const response = await api.post<GenerateContractResponse>(
        `/contract/generate/${orderId}`
      );
      console.log('Generate contract response:', response.data);
      console.log('Response data structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        responseKeys: response.data ? Object.keys(response.data) : [],
        dataStructure: response.data?.data ? Object.keys(response.data.data) : []
      });
      
      // Check if data exists
      if (!response.data) {
        throw new Error('Response data is null');
      }
      
      // Handle error response - contract already exists
      if (response.data.success === false) {
        const errorMsg = response.data.message || 'Failed to generate contract';
        // Throw error with response structure for handling
        const error: any = new Error(errorMsg);
        error.response = { data: response.data };
        throw error;
      }
      
      // Handle different response structures
      // Try response.data.data first (standard API response), then response.data (direct data)
      const contractData = response.data.data || response.data;
      
      console.log('Extracted contract data:', contractData);
      
      if (!contractData) {
        console.error('Contract data is null/undefined');
        throw new Error('Contract data is null');
      }
      
      if (!contractData.contractId) {
        console.error('Invalid contract data - missing contractId:', contractData);
        throw new Error(`Contract data is invalid: missing contractId. Data received: ${JSON.stringify(contractData)}`);
      }
      
      return contractData as ContractData;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  },

  // Get contract by orderId
  getContractByOrderId: async (orderId: number): Promise<ContractData | null> => {
    try {
      const response = await api.get<GetContractByOrderResponse>(`/contract/order/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      // Xử lý lỗi một cách graceful - không log error khi order chưa có contract (404/500 là bình thường)
      if (error.response?.status === 404 || error.response?.status === 500) {
        // Order chưa có contract - đây là trường hợp bình thường, không cần log error
        return null;
      }
      // Chỉ log error cho các lỗi khác (401, 403, network error, etc.)
      console.error(`Error getting contract by orderId ${orderId}:`, error.response?.status || error.message);
      return null;
    }
  },

  // Lấy OTP cho contract (gửi OTP đến email)
  getContractOtp: async (contractId: number): Promise<string> => {
    try {
      console.log(`Requesting OTP for contractId: ${contractId}`);
      const response = await api.post<ContractOtpResponse>(
        `/contract/${contractId}/otp`
      );
      console.log('OTP response:', response.data);
      
      // API trả về { message, success, data: "string" }
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Không thể lấy OTP');
    } catch (error: any) {
      console.error('Error getting contract OTP:', error);
      
      let errorMessage = 'Gửi OTP thất bại. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Xác nhận hoàn tất contract bằng orderId (sau khi 2 bên đã ký)
  completeContractByOrderId: async (orderId: number): Promise<number> => {
    try {
      console.log(`Completing contract for orderId: ${orderId}`);
      const response = await api.put<CompleteContractResponse>(
        `/contract/order/${orderId}/complete`
      );
      console.log('Complete contract response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể hoàn tất contract');
      }
      
      // Chỉ trả về contractId từ response data
      if (response.data.data && response.data.data.contractId) {
        return response.data.data.contractId;
      }
      
      throw new Error('Response không chứa contractId');
    } catch (error: any) {
      console.error('Error completing contract:', error);
      
      let errorMessage = 'Hoàn tất contract thất bại. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
};

