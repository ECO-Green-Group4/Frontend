import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react'; // Thư viện icon

// Định nghĩa props, ví dụ nếu bạn muốn truyền tên thương hiệu vào
interface FooterProps {
  brandName?: string;
}

const Footer: React.FC<FooterProps> = ({ brandName = "ECO GREEN" }) => {
  return (
    // 'mt-auto' rất quan trọng, nó đẩy footer xuống cuối trang
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Phần trên: Logo, Nav, Socials */}
        <div className="flex flex-col items-center gap-8 mb-8">
          
          {/* 1. Tên thương hiệu */}
          <a href="/" className="text-white text-3xl font-bold">
            {brandName}
          </a>

          {/* 2. Các liên kết điều hướng */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="/" className="text-gray-200 hover:text-white transition-colors font-medium">
              Trang chủ
            </a>
            <a href="/mua-xe" className="text-gray-200 hover:text-white transition-colors font-medium">
              Mua Xe
            </a>
            <a href="/ve-chung-toi" className="text-gray-200 hover:text-white transition-colors font-medium">
              Về chúng tôi
            </a>
            <a href="/lien-he" className="text-gray-200 hover:text-white transition-colors font-medium">
              Liên hệ
            </a>
          </nav>

          {/* 3. Các icon mạng xã hội */}
          <div className="flex gap-5">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook size={22} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter size={22} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram size={22} />
            </a>
          </div>
        </div>

        {/* Phần dưới: Dòng bản quyền */}
        <div className="w-full border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ECO GREEN. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;