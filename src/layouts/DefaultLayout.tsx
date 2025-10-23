// Layout mặc định cho trang home
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumb />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
