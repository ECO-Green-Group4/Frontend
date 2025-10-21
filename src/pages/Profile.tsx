import React, { useState, useEffect } from 'react';
import { 
  Mail, Calendar, User, Phone, MapPin, BadgeCheck, FileText, LogOut, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import api from '@/services/axios'; // Import instance axios 

// 1. Định nghĩa TypeScript interface khớp với Java DTO
interface UserInfo {
  userId: number;
  fullName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  status: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  identityCard: string | null;
  address: string | null;
  createdAt: string; // LocalDateTime sẽ được chuyển thành string (ISO format)
}

// Component nhỏ để hiển thị từng dòng thông tin cho gọn
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | null | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value || 'Chưa cập nhật'}</p>
    </div>
  </div>
);


const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch dữ liệu từ backend khi component được mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // API endpoint để lấy thông tin user hiện tại là 
        const response = await api.get('/auth/me'); //không cso controller để gọi và lấy 
        setUserInfo(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        setError("Không thể tải được thông tin cá nhân. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  // 3. Hiển thị trạng thái Loading hoặc Error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-600">Đang tải trang cá nhân...</p>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
             <p className="text-lg text-red-600">{error || 'Không tìm thấy thông tin người dùng.'}</p>
             <Button onClick={() => window.location.reload()} className="mt-4">Thử lại</Button>
        </div>
    );
  }
  
  // 4. Hiển thị giao diện chính sau khi có dữ liệu
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* === Card thông tin chính === */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
              <span className="text-5xl font-bold text-green-600">
                {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{userInfo.fullName}</h1>
              <p className="text-gray-500 mt-1">@{userInfo.username}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
                <Calendar size={14} />
                <span>Tham gia từ {new Date(userInfo.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <Button className="ml-auto bg-green-500 hover:bg-green-600 text-white mt-4 sm:mt-0">
              Chỉnh sửa
            </Button>
          </div>

          {/* === Card chi tiết thông tin === */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Thông tin chi tiết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InfoRow icon={<Mail size={20} />} label="Email" value={userInfo.email} />
              <InfoRow icon={<Phone size={20} />} label="Số điện thoại" value={userInfo.phone} />
              <InfoRow icon={<User size={20} />} label="Giới tính" value={userInfo.gender} />
              <InfoRow icon={<Calendar size={20} />} label="Ngày sinh" value={userInfo.dateOfBirth} />
              <InfoRow icon={<FileText size={20} />} label="Số CCCD" value={userInfo.identityCard} />
              <InfoRow icon={<BadgeCheck size={20} />} label="Trạng thái" value={userInfo.status} />
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin size={20} />} label="Địa chỉ" value={userInfo.address} />
              </div>
            </div>
           
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

