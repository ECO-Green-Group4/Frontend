import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import { showToast } from '@/utils/toast';
import PaymentService from '@/services/PaymentService';

// Interface cho thông tin thanh toán
interface PaymentInfo {
  packageId: number;
  packageName: string;
  amount: number;
  type: 'post' | 'vehicle' | 'battery' | 'membership';
  description: string;
}


const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

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

  // Xử lý thanh toán VNPay
  const handleVnPayPayment = async () => {
    if (!paymentInfo) {
      showToast('Thông tin thanh toán không hợp lệ', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Lấy dữ liệu form từ sessionStorage
      const pendingPostData = sessionStorage.getItem('pendingPostData');
      console.log('Pending post data from sessionStorage:', pendingPostData);
      
      if (!pendingPostData) {
        throw new Error('Không tìm thấy dữ liệu bài đăng');
      }

      let formData;
      try {
        formData = JSON.parse(pendingPostData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Dữ liệu không thể đọc được - vui lòng tạo lại bài đăng');
      }
      
      console.log('Parsed form data:', formData);
      console.log('Form data.data:', formData.data);
      console.log('Form data.data type:', typeof formData.data);
      
      // Kiểm tra dữ liệu có hợp lệ không
      if (!formData.data || !formData.category) {
        console.error('Invalid form data structure:', formData);
        throw new Error('Dữ liệu form không hợp lệ - thiếu thông tin cần thiết');
      }
      
      // Kiểm tra nếu data là object rỗng
      if (typeof formData.data === 'object' && Object.keys(formData.data).length === 0) {
        console.error('Data object is empty:', formData.data);
        throw new Error('Dữ liệu sản phẩm bị trống - vui lòng tạo lại bài đăng');
      }
      
      // Kiểm tra các trường bắt buộc trong data
      const requiredFields = ['title', 'description', 'price', 'location'];
      const missingFields = requiredFields.filter(field => !formData.data[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Thiếu thông tin: ${missingFields.join(', ')}`);
      }
      
      // Xác định itemType từ category
      const itemType = formData.category === 'EV' ? 'vehicle' : 'battery';
      console.log('Item type:', itemType);
      console.log('Package ID:', paymentInfo.packageId);
      
      // Tạo listing với package
      const listingResponse = await PaymentService.createListingWithPackage(
        formData.data, 
        paymentInfo.packageId,
        itemType
      );

      console.log('Listing created:', listingResponse);
      console.log('Listing response data:', (listingResponse as any).data);
      console.log('Looking for listingPackageId in:', Object.keys((listingResponse as any).data || {}));

      // Tìm listingPackageId trong response
      const listingPackageId = (listingResponse as any).data?.listingPackageId || 
                              (listingResponse as any).data?.id || 
                              (listingResponse as any).data?.packageId ||
                              (listingResponse as any).listingPackageId;

      console.log('Found listingPackageId:', listingPackageId);

      if (!listingPackageId) {
        throw new Error('Không tìm thấy listingPackageId trong response');
      }

      // Lưu listingId vào sessionStorage để VnPayCallback có thể update status
      const listingId = (listingResponse as any).data?.id || (listingResponse as any).data?.listingId;
      if (listingId) {
        sessionStorage.setItem('pendingListingId', listingId.toString());
        console.log('Saved listingId to sessionStorage:', listingId);
      }

      // Tạo payment VNPay
      const paymentResponse = await PaymentService.createVnPayPayment(
        listingPackageId
      );

      if (paymentResponse.success && paymentResponse.data.paymentUrl) {
        console.log('Payment URL received:', paymentResponse.data.paymentUrl);
        console.log('Payment expiry time:', paymentResponse.data.expiryTime);
        console.log('Current time:', new Date().toISOString());
        
        // Parse expiry time để kiểm tra
        const expiryTime = new Date(paymentResponse.data.expiryTime);
        const currentTime = new Date();
        const timeDiff = expiryTime.getTime() - currentTime.getTime();
        
        console.log('Time until expiry (minutes):', Math.round(timeDiff / (1000 * 60)));
        console.log('Expiry time (local):', expiryTime.toLocaleString('vi-VN'));
        console.log('Current time (local):', currentTime.toLocaleString('vi-VN'));
        
        if (timeDiff < 0) {
          console.warn('Payment URL already expired!');
          console.warn('This might be a timezone issue or system time problem');
          
          // Thử tạo payment mới với delay nhỏ
          console.log('Waiting 3 seconds then creating new payment...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const newPaymentResponse = await PaymentService.createVnPayPayment(listingPackageId);
          if (newPaymentResponse.success && newPaymentResponse.data.paymentUrl) {
            console.log('New payment URL:', newPaymentResponse.data.paymentUrl);
            console.log('New expiry time:', newPaymentResponse.data.expiryTime);
            
            // Kiểm tra lại thời gian
            const newExpiryTime = new Date(newPaymentResponse.data.expiryTime);
            const newTimeDiff = newExpiryTime.getTime() - new Date().getTime();
            console.log('New payment time until expiry (minutes):', Math.round(newTimeDiff / (1000 * 60)));
            
            if (newTimeDiff > 0) {
              window.location.href = newPaymentResponse.data.paymentUrl;
              return;
            } else {
              console.error('New payment also expired! Trying one more time...');
              // Thử lần cuối với delay dài hơn
              await new Promise(resolve => setTimeout(resolve, 5000));
              const finalPaymentResponse = await PaymentService.createVnPayPayment(listingPackageId);
              if (finalPaymentResponse.success && finalPaymentResponse.data.paymentUrl) {
                console.log('Final payment URL:', finalPaymentResponse.data.paymentUrl);
                window.location.href = finalPaymentResponse.data.paymentUrl;
                return;
              }
            }
          }
        }
        
        // Redirect đến trang thanh toán VNPay
        console.log('Redirecting to VNPay...');
        
        // Tạo payment mới ngay trước khi redirect để đảm bảo thời gian fresh
        console.log('Creating fresh payment before redirect...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const freshPaymentResponse = await PaymentService.createVnPayPayment(listingPackageId);
        if (freshPaymentResponse.success && freshPaymentResponse.data.paymentUrl) {
          console.log('Fresh payment URL before redirect:', freshPaymentResponse.data.paymentUrl);
          console.log('Fresh expiry time before redirect:', freshPaymentResponse.data.expiryTime);
          
          // Kiểm tra thời gian
          const freshExpiryTime = new Date(freshPaymentResponse.data.expiryTime);
          const freshTimeDiff = freshExpiryTime.getTime() - new Date().getTime();
          console.log('Fresh payment time until expiry (minutes):', Math.round(freshTimeDiff / (1000 * 60)));
          
          window.location.href = freshPaymentResponse.data.paymentUrl;
        } else {
          // Fallback về payment cũ
          window.location.href = paymentResponse.data.paymentUrl;
        }
      } else {
        throw new Error(paymentResponse.message || 'Không thể tạo payment');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error?.response?.data?.message || error?.message || 'Thanh toán thất bại';
      showToast(`❌ ${message}`, 'error');
      
      // Nếu lỗi do dữ liệu không hợp lệ, clear sessionStorage và cho phép quay lại
      if (message.includes('Dữ liệu form không hợp lệ') || message.includes('Thiếu thông tin')) {
        sessionStorage.removeItem('pendingPostData');
      }
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
              {/* VNPay - Mặc định được chọn */}
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">VNPay</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua VNPay - An toàn và tiện lợi</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút thanh toán VNPay */}
            <button
              onClick={handleVnPayPayment}
              disabled={isProcessing}
              className={`w-full mt-6 py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                isProcessing
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
                `Thanh toán VNPay - ${new Intl.NumberFormat("vi-VN", { 
                  style: "currency", 
                  currency: "VND" 
                }).format(paymentInfo.amount)}`
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
        <div className="text-center mt-8 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Quay lại
          </button>
          
          <button
            onClick={() => {
              sessionStorage.removeItem('pendingPostData');
              navigate('/create-post');
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Tạo lại bài đăng
          </button>
          
          <button
            onClick={async () => {
              // Test tạo payment mới với dữ liệu mock
              const mockListingPackageId = Math.floor(Math.random() * 1000) + 1;
              console.log('Testing with mock listingPackageId:', mockListingPackageId);
              
              try {
                const response = await PaymentService.createVnPayPayment(mockListingPackageId);
                console.log('Test payment response:', response);
                
                if (response.success && response.data.paymentUrl) {
                  console.log('Test payment URL:', response.data.paymentUrl);
                  console.log('Test expiry time:', response.data.expiryTime);
                  
                  // Kiểm tra thời gian ngay lập tức
                  const expiryTime = new Date(response.data.expiryTime);
                  const currentTime = new Date();
                  const timeDiff = expiryTime.getTime() - currentTime.getTime();
                  
                  console.log('Test - Time until expiry (minutes):', Math.round(timeDiff / (1000 * 60)));
                  
                  if (timeDiff > 0) {
                    window.location.href = response.data.paymentUrl;
                  } else {
                    console.error('Test payment also expired immediately!');
                    alert('Payment URL expired immediately - check system time!');
                  }
                }
              } catch (error) {
                console.error('Test payment error:', error);
              }
            }}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            Test Payment (Mock)
          </button>
          
          <button
            onClick={async () => {
              // Tạo payment fresh ngay lập tức với delay
              console.log('Creating fresh payment with delay...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const mockListingPackageId = Math.floor(Math.random() * 1000) + 1;
              console.log('Fresh payment with listingPackageId:', mockListingPackageId);
              
              try {
                const response = await PaymentService.createVnPayPayment(mockListingPackageId);
                console.log('Fresh payment response:', response);
                
                if (response.success && response.data.paymentUrl) {
                  console.log('Fresh payment URL:', response.data.paymentUrl);
                  console.log('Fresh expiry time:', response.data.expiryTime);
                  
                  // Redirect ngay lập tức
                  window.location.href = response.data.paymentUrl;
                }
              } catch (error) {
                console.error('Fresh payment error:', error);
              }
            }}
            className="text-orange-600 hover:text-orange-800 transition-colors"
          >
            Fresh Payment (Delay)
          </button>
          
          <button
            onClick={async () => {
              // Tạo payment với delay dài để tránh timezone issue
              console.log('Creating payment with long delay to avoid timezone issues...');
              await new Promise(resolve => setTimeout(resolve, 10000)); // 10 giây
              
              const mockListingPackageId = Math.floor(Math.random() * 1000) + 1;
              console.log('Long delay payment with listingPackageId:', mockListingPackageId);
              
              try {
                const response = await PaymentService.createVnPayPayment(mockListingPackageId);
                console.log('Long delay payment response:', response);
                
                if (response.success && response.data.paymentUrl) {
                  console.log('Long delay payment URL:', response.data.paymentUrl);
                  console.log('Long delay expiry time:', response.data.expiryTime);
                  
                  // Kiểm tra thời gian
                  const expiryTime = new Date(response.data.expiryTime);
                  const currentTime = new Date();
                  const timeDiff = expiryTime.getTime() - currentTime.getTime();
                  
                  console.log('Long delay - Time until expiry (minutes):', Math.round(timeDiff / (1000 * 60)));
                  
                  if (timeDiff > 0) {
                    window.location.href = response.data.paymentUrl;
                  } else {
                    console.error('Long delay payment also expired!');
                    alert('Payment still expired - this is a backend timezone issue!');
                  }
                }
              } catch (error) {
                console.error('Long delay payment error:', error);
              }
            }}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Long Delay Payment (10s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
