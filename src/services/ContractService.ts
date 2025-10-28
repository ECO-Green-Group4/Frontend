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

export const ContractService = {
  // Generate contract từ orderId
  generateContract: async (orderId: number): Promise<ContractData> => {
    try {
      console.log('Generating contract for orderId:', orderId);
      const response = await api.post<GenerateContractResponse>(
        `/contract/generate/${orderId}`
      );
      console.log('Generate contract response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  }
};

