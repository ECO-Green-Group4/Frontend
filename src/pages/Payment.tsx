import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import { showToast } from '@/utils/toast';
import api from '../services/axios';
import PostPaymentService from '../services/PostPaymentService';

// Interface cho thông tin thanh toán
interface PaymentInfo {
  packageId: number;
  packageName: string;
  amount: number;
  type: 'post' | 'vehicle' | 'battery' | 'membership';
  description: string;
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

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Lấy thông tin thanh toán từ state hoặc query params
  useEffect(() => {
    const state = location.state as { paymentInfo?: PaymentInfo };
    if (state?.paymentInfo) {
      setPaymentInfo(state.paymentInfo);
    } else {
      // Nếu không có thông tin, chuyển về trang chủ
      showToast('Thông tin thanh toán không hợp lệ', 'error');
      navigate('/');
    }
  }, [location.state, navigate]);

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showToast('Vui lòng chọn phương thức thanh toán', 'error');
      return;
    }

    if (!paymentInfo) {
      showToast('Thông tin thanh toán không hợp lệ', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Thay thế bằng API payment thực tế từ backend
      const paymentData = {
        packageId: paymentInfo.packageId,
        amount: paymentInfo.amount,
        paymentMethod: selectedPaymentMethod,
        type: paymentInfo.type,
        description: paymentInfo.description
      };

      console.log('Processing payment:', paymentData);

      // Simulate API call - thay thế bằng API thực tế
      await new Promise(resolve => setTimeout(resolve, 2000));

      //  Gọi API  payment chỗ này  
       const response = await api.post('/payment/package', paymentData);
      
      showToast('Thanh toán thành công!', 'success');
      
      // Nếu là thanh toán cho đăng tin, tạo post sau khi thanh toán thành công
      if (paymentInfo.type === 'vehicle' || paymentInfo.type === 'battery') {
        const postCreated = await PostPaymentService.createPostAfterPayment();
        if (postCreated) {
          // Chuyển đến trang waiting sau khi tạo post thành công
          navigate('/waiting', { 
            state: { 
              message: 'Thanh toán đã được xử lý và bài đăng đã được tạo. Vui lòng chờ admin duyệt.',
              type: paymentInfo.type 
            } 
          });
        } else {
          // Nếu tạo post thất bại, vẫn chuyển đến waiting nhưng với thông báo khác
          navigate('/waiting', { 
            state: { 
              message: 'Thanh toán thành công nhưng có lỗi khi tạo bài đăng. Vui lòng liên hệ admin.',
              type: paymentInfo.type 
            } 
          });
        }
      } else {
        // Các loại thanh toán khác (membership, etc.)
        navigate('/waiting', { 
          state: { 
            message: 'Thanh toán đã được xử lý. Vui lòng chờ admin duyệt.',
            type: paymentInfo.type 
          } 
        });
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error?.response?.data?.message || error?.message || 'Thanh toán thất bại';
      showToast(`❌ ${message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Hoàn tất giao dịch của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin đơn hàng */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Thông tin đơn hàng
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Gói dịch vụ:</span>
                <span className="font-semibold text-gray-900">{paymentInfo.packageName}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Loại:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {paymentInfo.type === 'post' ? 'Đăng tin' : 
                   paymentInfo.type === 'vehicle' ? 'Xe điện' :
                   paymentInfo.type === 'battery' ? 'Pin' : 'Thành viên'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Mô tả:</span>
                <span className="font-semibold text-gray-900">{paymentInfo.description}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 bg-green-50 rounded-lg px-4">
                <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("vi-VN", { 
                    style: "currency", 
                    currency: "VND" 
                  }).format(paymentInfo.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Phương thức thanh toán
            </h2>

            <div className="space-y-4">
              {/* Banking */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'banking' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPaymentMethod('banking')}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chuyển khoản ngân hàng</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua chuyển khoản</p>
                  </div>
                </div>
              </div>

              {/* Momo */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'momo' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPaymentMethod('momo')}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ví MoMo</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</p>
                  </div>
                </div>
              </div>

              {/* ZaloPay */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'zalopay' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPaymentMethod('zalopay')}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ZaloPay</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua ZaloPay</p>
                  </div>
                </div>
              </div>

              {/* VNPay */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'vnpay' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPaymentMethod('vnpay')}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">VNPay</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua VNPay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút thanh toán */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedPaymentMethod}
              className={`w-full mt-6 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                isProcessing || !selectedPaymentMethod
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Thanh toán ngay'
              )}
            </button>

            {/* Thông tin bảo mật */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Giao dịch được bảo mật và mã hóa
              </div>
            </div>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
