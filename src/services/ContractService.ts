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
    } catch (error) {
      console.error('Error getting contract by orderId:', error);
      return null;
    }
  }
};

