import api from './axios';

export interface Package {
  id?: number;
  name: string;
  packageType: 'LISTING_VIP' | 'LISTING_PREMIUM' | 'LISTING_BASIC';
  listingLimit: number;
  listingFee: number;
  highlight: boolean;
  durationDays: number;
  commissionDiscount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageResponse {
  message: string;
  success: boolean;
  data: Package[];
}

export interface CreatePackageRequest {
  name: string;
  packageType: 'LISTING_VIP' | 'LISTING_PREMIUM' | 'LISTING_BASIC';
  listingLimit: number;
  listingFee: number;
  highlight: boolean;
  durationDays: number;
  commissionDiscount: number;
  status: string;
}

export interface CreatePackageResponse {
  message: string;
  success: boolean;
  data: Package;
}

export interface UpdatePackageResponse {
  message: string;
  success: boolean;
  data: string;
}

export interface DeletePackageResponse {
  message: string;
  success: boolean;
  data: string;
}

export const PackageService = {
  // Lấy tất cả packages
  getAllPackages: async (): Promise<Package[]> => {
    try {
      console.log('Fetching all packages...');
      const response = await api.get<PackageResponse>('/admin/packages');
      console.log('Packages response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  // Tạo package mới
  createPackage: async (packageData: CreatePackageRequest): Promise<Package> => {
    try {
      console.log('Creating package with data:', packageData);
      const response = await api.post<CreatePackageResponse>('/admin/packages', packageData);
      console.log('Create response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  },

  // Cập nhật package
  updatePackage: async (packageId: number, packageData: Partial<CreatePackageRequest>): Promise<UpdatePackageResponse> => {
    try {
      console.log('Updating package with ID:', packageId, 'Data:', packageData);
      const response = await api.put<UpdatePackageResponse>(`/admin/packages/${packageId}`, packageData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  },

  // Xóa package
  deletePackage: async (packageId: number): Promise<DeletePackageResponse> => {
    try {
      console.log('Deleting package with ID:', packageId);
      const response = await api.delete<DeletePackageResponse>(`/admin/packages/${packageId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }
};
