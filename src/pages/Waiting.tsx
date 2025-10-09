import React from 'react';
import { useNavigate } from 'react-router-dom'; // Dùng để quay lại trang khác (nếu cần)

const Waiting: React.FC = () => {
  // Hook để điều hướng người dùng
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center border-t-8 border-green-400">
        
        {/* Icon Chờ (Ví dụ: đồng hồ cát hoặc spinner) */}
        <div className="mx-auto w-16 h-16 mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
          {/* Ví dụ: Icon đồng hồ cát (có thể thay bằng spinner nếu bạn muốn animation) */}
          <svg className="w-8 h-8 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
        Your request is being processed
        </h1>

        {/* Nội dung */}
        <p className="text-gray-600 mb-6">
        We are reviewing your post/member request. This process may take a few minutes.
        </p>
        <p className="text-sm text-gray-500 mb-8 font-medium">
        You will receive a notification as soon as the status is updated.
        </p>

        {/* Nút quay lại hoặc tiếp tục */}
        <button
          onClick={() => navigate('/main')} // Quay lại trang chính
          className="w-full py-3 px-4 rounded-full text-lg font-bold text-white bg-green-400 hover:bg-green-400 shadow-lg transition duration-150 transform hover:scale-[1.02]"
        >
          Back to Home Page
        </button>

      </div>
    </div>
  );
};

export default Waiting;