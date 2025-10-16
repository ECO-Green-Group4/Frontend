// Trang dashboard - chỉ dành cho user đã đăng nhập
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Chào mừng {user?.name || user?.email} đến với ECO App!
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={handleLogout}>
              Đăng xuất
            </Button>
            {/* Temporary test link - remove when done testing */}
            <Link to="/staff-contract">
              <Button variant="default" className="bg-green-500 hover:bg-green-600">
                Test Staff Contract
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Hoạt động hôm nay
            </h3>
            <p className="text-3xl font-bold text-blue-500">12</p>
            <p className="text-sm text-gray-500">Tăng 20% so với hôm qua</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Điểm ECO
            </h3>
            <p className="text-3xl font-bold text-green-500">1,250</p>
            <p className="text-sm text-gray-500">+50 điểm tuần này</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Thành tích
            </h3>
            <p className="text-3xl font-bold text-purple-500">8</p>
            <p className="text-sm text-gray-500">Huy hiệu đã đạt được</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">🌱</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Tái chế 5kg giấy</p>
                <p className="text-sm text-gray-500">2 giờ trước</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">💧</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Tiết kiệm 20L nước</p>
                <p className="text-sm text-gray-500">5 giờ trước</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 font-bold">⚡</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Giảm 15% điện năng</p>
                <p className="text-sm text-gray-500">1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
