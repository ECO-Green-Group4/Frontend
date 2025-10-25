import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '@/services/PaymentService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  listingData?: any; // Dữ liệu listing
  packageId?: number; // ID của package (ví dụ: 3 cho Vip Silver)
  listingPackageId?: number; // ID của listing package đã tạo
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onSuccess?: (paymentUrl: string) => void;
  onError?: (error: string) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  listingData,
  packageId,
  listingPackageId,
  className = "w-full py-3 px-6 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
  children = "Thanh toán VNPay",
  disabled = false,
  onSuccess,
  onError
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || loading) return;
    
    setLoading(true);
    
    try {
      let finalListingPackageId = listingPackageId;
      
      // Nếu chưa có listingPackageId, tạo listing trước
      if (!finalListingPackageId && listingData && packageId) {
        const listingResponse = await PaymentService.createListingWithPackage(listingData, packageId);
        finalListingPackageId = listingResponse.listingPackageId;
      }
      
      if (!finalListingPackageId) {
        throw new Error('Không thể tạo listing package');
      }
      
      // Tạo payment VNPay
      const paymentResponse = await PaymentService.createVnPayPayment(finalListingPackageId);
      
      if (paymentResponse.success && paymentResponse.data.paymentUrl) {
        // Redirect đến trang thanh toán VNPay
        window.location.href = paymentResponse.data.paymentUrl;
        
        // Gọi callback success nếu có
        if (onSuccess) {
          onSuccess(paymentResponse.data.paymentUrl);
        }
      } else {
        throw new Error(paymentResponse.message || 'Không thể tạo payment');
      }
      
    } catch (error: any) {
      console.error('Lỗi thanh toán:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi thanh toán';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default PaymentButton;
