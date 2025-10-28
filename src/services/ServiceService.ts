import api from './axios';

export interface Service {
  serviceId?: number;
  id?: number;
  name: string;
  description: string;
  defaultFee?: number;
  fee: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse {
  message: string;
  success: boolean;
  data: Service[];
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  fee: number;
  status: string;
}

export interface CreateServiceResponse {
  message: string;
  success: boolean;
  data: Service;
}

export interface UpdateServiceResponse {
  message: string;
  success: boolean;
  data: string;
}

export interface DeleteServiceResponse {
  message: string;
  success: boolean;
  data: string;
}

export const ServiceService = {
  // Lấy tất cả services
  getAllServices: async (): Promise<Service[]> => {
    try {
      console.log('Fetching all services...');
      const response = await api.get<ServiceResponse>('/admin/addon/services');
      console.log('Services response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Tạo service mới
  createService: async (serviceData: CreateServiceRequest): Promise<Service> => {
    try {
      console.log('Creating service with data:', serviceData);
      const response = await api.post<CreateServiceResponse>('/admin/addon/services', serviceData);
      console.log('Create response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Cập nhật service
  updateService: async (serviceId: number, serviceData: Partial<CreateServiceRequest>): Promise<UpdateServiceResponse> => {
    try {
      console.log('Updating service with ID:', serviceId, 'Data:', serviceData);
      const response = await api.put<UpdateServiceResponse>(`/admin/addon/services/${serviceId}`, serviceData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Xóa service
  deleteService: async (serviceId: number): Promise<DeleteServiceResponse> => {
    try {
      console.log('Deleting service with ID:', serviceId);
      const response = await api.delete<DeleteServiceResponse>(`/admin/addon/services/${serviceId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
};

