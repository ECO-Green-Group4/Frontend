import { NavigateFunction } from 'react-router-dom';

// Interface cho thông tin thanh toán
export interface PaymentInfo {
  packageId: number;
  packageName: string;
  amount: number;
  type: 'post' | 'vehicle' | 'battery';
  description: string;
}

// Utility function để chuyển đến trang Payment
export const navigateToPayment = (
  navigate: NavigateFunction,
  paymentInfo: PaymentInfo
) => {
  navigate("/payment", { 
    state: { 
      paymentInfo 
    } 
  });
};

// Utility function để tạo PaymentInfo cho đăng tin
export const createPostPaymentInfo = (
  packageId: number,
  packageName: string,
  amount: number,
  type: 'vehicle' | 'battery',
  title: string
): PaymentInfo => {
  return {
    packageId,
    packageName,
    amount,
    type,
    description: `Đăng tin ${type === "battery" ? "pin" : "xe điện"} - ${title}`
  };
};


// Utility function để tạo PaymentInfo cho mua xe
export const createVehiclePurchasePaymentInfo = (
  vehicleId: number,
  vehicleName: string,
  amount: number
): PaymentInfo => {
  return {
    packageId: vehicleId,
    packageName: vehicleName,
    amount,
    type: 'vehicle',
    description: `Mua xe điện - ${vehicleName}`
  };
};

// Utility function để tạo PaymentInfo cho mua pin
export const createBatteryPurchasePaymentInfo = (
  batteryId: number,
  batteryName: string,
  amount: number
): PaymentInfo => {
  return {
    packageId: batteryId,
    packageName: batteryName,
    amount,
    type: 'battery',
    description: `Mua pin - ${batteryName}`
  };
};
