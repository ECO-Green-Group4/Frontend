// Service xử lý payment
import api from '@/services/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface PaymentResponse {
  message: string;
  success: boolean;
  data: {
    paymentId: number;
    paymentType: string;
    amount: number;
    currency: string;
    status: string;
    paymentUrl: string;
    paymentDate: string | null;
    expiryTime: string;
    gatewayTransactionId: string | null;
    contractId: number | null;
    contractAddonId: number | null;
    listingPackageId: number | null;
    deeplink: string | null;
    qrCodeUrl: string | null;
    gatewayResponse: {
      txnRef: string;
      paymentUrl: string;
    };
  };
}

export interface ListingResponse {
  message: string;
  success: boolean;
  data: {
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
    brand: string | null;
    model: string | null;
    year: number | null;
    batteryCapacity: string | null;
    mileage: number | null;
    condition: string | null;
    bodyType: string | null;
    color: string | null;
    inspection: string | null;
    numberOfSeats: number | null;
    licensePlate: string | null;
    accessories: string | null;
    origin: string;
  };
}

class PaymentService {
  // Tạo listing với package
  async createListingWithPackage(listingData: any, packageId: number, itemType: 'vehicle' | 'battery' = 'vehicle'): Promise<ListingResponse> {
    const endpoint = itemType === 'vehicle' ? '/seller/listings/vehicle' : '/seller/listings/battery';
    
    // Chuẩn bị dữ liệu gửi lên API - loại bỏ packageId cũ nếu có
    const { packageId: _, ...cleanData } = listingData;
    
    // Chuẩn hóa dữ liệu - convert string numbers to numbers và mapping fields
    const requestData = {
      ...cleanData,
      packageId: packageId,
      status: 'PENDING_APPROVAL', // Đảm bảo status là PENDING_APPROVAL
      listingStatus: 'PENDING_APPROVAL', // Thử với tên field khác
      postStatus: 'PENDING_APPROVAL', // Thử với tên field khác
      // Mapping fields từ frontend sang backend
      brand: cleanData.batteryBrand || cleanData.brand, // batteryBrand -> brand
      price: typeof cleanData.price === 'string' ? parseInt(cleanData.price) : cleanData.price,
      voltage: typeof cleanData.voltage === 'string' ? parseFloat(cleanData.voltage) : cleanData.voltage,
      healthPercent: typeof cleanData.healthPercent === 'string' ? parseInt(cleanData.healthPercent) : cleanData.healthPercent,
      chargeCycles: typeof cleanData.chargeCycles === 'string' ? parseInt(cleanData.chargeCycles) : cleanData.chargeCycles,
      manufactureYear: typeof cleanData.manufactureYear === 'string' ? parseInt(cleanData.manufactureYear) : cleanData.manufactureYear,
      // Chuẩn hóa capacity - thêm space nếu thiếu
      capacity: cleanData.capacity?.replace(/(\d+)([A-Z]+)/, '$1 $2') || cleanData.capacity,
      // Truyền quantity để backend tính expiredAt và packageAmount
      quantity: typeof cleanData.quantity === 'string' ? parseInt(cleanData.quantity) : (cleanData.quantity || 1)
    };
    
    // Log để debug
    console.log('Request data with quantity:', requestData);
    
    // Loại bỏ batteryBrand nếu đã map sang brand
    if (requestData.batteryBrand) {
      delete requestData.batteryBrand;
    }
    
    // Validation giá
    if (requestData.price > 10000000000) { // 10 tỷ VND
      console.warn('Price too high:', requestData.price);
    }
    
    console.log('Sending to API:', endpoint, requestData);
    console.log('Status being sent:', requestData.status);
    
    try {
      const response = await api.post(endpoint, requestData);
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      console.log('Status in response:', response.data?.data?.status);
      console.log('Listing ID:', response.data?.data?.id);
      console.log('========================');
      
      // Force update status về PENDING_APPROVAL ngay sau khi tạo listing
      const listingId = response.data?.data?.id;
      if (listingId) {
        console.log('🔄 Force updating listing status to PENDING_APPROVAL immediately...');
        try {
          await this.updateListingStatusAfterPayment(listingId, 'PENDING_APPROVAL');
          console.log('✅ Status force updated to PENDING_APPROVAL');
        } catch (updateError) {
          console.error('❌ Failed to force update status:', updateError);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API Error Details:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Data Details:', error.response?.data?.data);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  }

  // Tạo payment VNPay cho package
  async createVnPayPayment(listingPackageId: number): Promise<PaymentResponse> {
    const response = await api.post(`/payments/package/vnpay?listingPackageId=${listingPackageId}`);
    return response.data;
  }

  // Tạo order để mua xe (chỉ dùng listingId)
  async createVehicleOrder(listingId: number): Promise<any> {
    try {
      console.log('Creating vehicle order with listingId:', listingId);
      const response = await api.post('/buyer/orders', {
        listingId: listingId,
        basePrice: 0 // Không dùng basePrice theo yêu cầu
      });
      console.log('Order created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái payment
  async checkPaymentStatus(paymentId: number): Promise<any> {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  }

  // Cập nhật status của listing sau khi thanh toán thành công
  async updateListingStatusAfterPayment(listingId: number, status: 'PENDING_APPROVAL' | 'ACTIVE' = 'PENDING_APPROVAL'): Promise<any> {
    try {
      console.log('Updating listing status after payment:', listingId, 'to', status);
      
      const response = await api.put(`/seller/listings/${listingId}/status`, {
        status: status
      });
      
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating listing status:', error);
      throw error;
    }
  }

  // Xử lý callback từ VNPay
  async handleVnPayCallback(queryParams: any): Promise<any> {
    const response = await api.get('/payments/vnpay-callback', {
      params: queryParams
    });
    return response.data;
  }
}

export default new PaymentService();
