// Layout mặc định cho trang home
import React from 'react';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumb />
          {children}
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center py-6 mt-auto">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 ECO App. Tất cả quyền được bảo lưu.</p>
          <p className="text-sm text-gray-400 mt-2">
            Cùng nhau bảo vệ môi trường cho thế hệ tương lai 🌍
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DefaultLayout;
