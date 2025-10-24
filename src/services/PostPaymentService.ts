import api from './axios';
import { showToast } from '@/utils/toast';

// Interface cho dữ liệu form đã lưu
interface PendingPostData {
  category: "EV" | "Battery";
  data: any;
  selectedPackageId: number;
}

// Interface cho gói dịch vụ
interface ServicePackage {
  packageId: number;
  name: string;
  listingLimit: number;
  listingFee: number;
  highlight: boolean;
  durationDays: number;
  commissionDiscount: number;
  status: string;
}

class PostPaymentService {
  // Lấy dữ liệu form đã lưu từ sessionStorage
  static getPendingPostData(): PendingPostData | null {
    try {
      const data = sessionStorage.getItem('pendingPostData');
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error parsing pending post data:', error);
      return null;
    }
  }

  // Xóa dữ liệu form đã lưu
  static clearPendingPostData(): void {
    sessionStorage.removeItem('pendingPostData');
  }

  // Tạo post sau khi thanh toán thành công
  static async createPostAfterPayment(): Promise<boolean> {
    const pendingData = this.getPendingPostData();
    
    if (!pendingData) {
      showToast('Không tìm thấy dữ liệu đăng tin', 'error');
      return false;
    }

    try {
      let response;
      
      if (pendingData.category === "Battery") {
        const payload = this.toBatteryPayload(pendingData.data);
        console.log("Creating Battery Post:", payload);
        response = await api.post("/seller/listings/battery", payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const payload = this.toVehiclePayload(pendingData.data);
        console.log("Creating Vehicle Post:", payload);
        response = await api.post("/seller/listings/vehicle", payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log("Post created successfully:", response.data);
      showToast("🎉 Đăng tin thành công!", "success");
      
      // Xóa dữ liệu đã lưu
      this.clearPendingPostData();
      
      return true;
    } catch (error: any) {
      console.error("Create post error:", error);
      const message = error?.response?.data?.message || error?.message || "Tạo bài đăng thất bại";
      showToast(`❌ ${message}`, "error");
      return false;
    }
  }

  // Chuyển đổi dữ liệu Battery form thành payload
  private static toBatteryPayload(data: any) {
    return {
      title: data.title,
      description: data.description,
      images: data.images,
      location: data.location,
      price: Number(data.price) || 0,
      brand: data.batteryBrand,
      voltage: Number(data.voltage) || 0,
      capacity: data.capacity,
      healthPercent: Number(data.healthPercent) || 0,
      chargeCycles: Number(data.chargeCycles) || 0,
      type: data.type,
      manufactureYear: Number(data.manufactureYear) || 0,
      origin: data.origin,
      packageId: data.packageId,
    };
  }

  // Chuyển đổi dữ liệu Vehicle form thành payload
  private static toVehiclePayload(data: any) {
    return {
      title: data.title,
      description: data.description,
      images: data.images,
      location: data.location,
      price: Number(data.price) || 0,
      brand: data.brand,
      model: data.model,
      year: Number(data.year) || 0,
      bodyType: data.bodyType,
      color: data.color,
      mileage: Number(data.mileage) || 0,
      inspection: data.inspection,
      origin: data.origin,
      numberOfSeats: Number(data.numberOfSeats) || 0,
      licensePlate: data.licensePlate,
      accessories: data.accessories,
      batteryCapacity: Number(data.batteryCapacity) || 0,
      condition: data.condition,
      packageId: data.packageId,
    };
  }
}

export default PostPaymentService;
