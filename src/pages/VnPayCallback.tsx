import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentService from '@/services/PaymentService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VnPayCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kiểm tra nếu đang ở backend callback URL, redirect về frontend
        if (window.location.hostname === 'localhost' && window.location.port === '8080') {
          // Đang ở backend, redirect về frontend với query params
          const queryString = window.location.search;
          window.location.href = `http://localhost:5173/vnpay-callback${queryString}`;
          return;
        }

        // Lấy tất cả query parameters từ VNPay
        const queryParams: any = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Kiểm tra nếu có vnp_ResponseCode = '00' (thành công)
        if (queryParams.vnp_ResponseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công! Bài đăng của bạn đang chờ admin duyệt.');
          
          // Lấy listingId từ sessionStorage để force update status
          const savedListingId = sessionStorage.getItem('pendingListingId');
          if (savedListingId) {
            try {
              const listingId = parseInt(savedListingId);
              console.log('🔄 Force updating listing status to PENDING_APPROVAL...');
              
              // Force update status về PENDING_APPROVAL
              await PaymentService.updateListingStatusAfterPayment(listingId, 'PENDING_APPROVAL');
              console.log('✅ Listing status force updated to PENDING_APPROVAL');
              
              // Clear sessionStorage sau khi update thành công
              sessionStorage.removeItem('pendingListingId');
            } catch (error) {
              console.error('❌ Failed to force update listing status:', error);
              // Vẫn clear sessionStorage để không bị stuck
              sessionStorage.removeItem('pendingListingId');
            }
          } else {
            console.log('⚠️ No listingId found in sessionStorage');
          }
          
          // Redirect về trang Waiting sau 2 giây
          setTimeout(() => {
            navigate('/waiting', { 
              state: { 
                message: 'Thanh toán thành công! Bài đăng của bạn đang chờ admin duyệt.',
                type: 'success'
              }
            });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc bị hủy');
        }
      } catch (error: any) {
        console.error('Lỗi xử lý callback:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-gray-500">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Bạn sẽ được chuyển về trang chờ duyệt trong vài giây...
            </p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default VnPayCallback;
