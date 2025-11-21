import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, Globe } from 'lucide-react'; // Thư viện icon

// Định nghĩa props, ví dụ nếu bạn muốn truyền tên thương hiệu vào
interface FooterProps {
  brandName?: string;
}

const Footer: React.FC<FooterProps> = ({ brandName = "ECO GREEN" }) => {
  return (
    // 'mt-auto' rất quan trọng, nó đẩy footer xuống cuối trang
      <footer className="bg-green-100 text-gray-700 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Phần trên: Logo, Nav, Socials */}
        <div className="flex flex-col items-center gap-8 mb-8">
          
          {/* 1. Tên thương hiệu */}
          <a href="/" className="text-green-700 text-3xl font-bold">
            {brandName}
          </a>

          {/* 2. Các liên kết điều hướng */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Trang chủ
            </a>
            <a href="/mua-xe" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Mua Xe
            </a>
            <a href="/ve-chung-toi" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Về chúng tôi
            </a>
          </nav>

          {/* 3. Thông tin liên hệ */}
          <div className="w-full">
            <h3 className="text-green-700 text-lg font-semibold mb-4 text-center">Liên hệ</h3>
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-green-600" />
                <span>Email: </span>
                <a 
                  href="mailto:support@evtrade.com" 
                  className="text-green-600 hover:text-green-700 transition-colors hover:underline"
                >
                  support@evtrade.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-green-600" />
                <span>Phone: </span>
                <a 
                  href="tel:+84123456789" 
                  className="text-green-600 hover:text-green-700 transition-colors hover:underline"
                >
                  +84 123 456 789
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-green-600" />
                <span>Website: </span>
                <a 
                  href="https://evtrade.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors hover:underline"
                >
                  https://evtrade.com
                </a>
              </div>
            </div>
          </div>

          {/* 4. Các icon mạng xã hội */}
          <div className="flex gap-5">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <Facebook size={22} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Twitter"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <Twitter size={22} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <Instagram size={22} />
            </a>
          </div>
        </div>

        {/* Phần dưới: Dòng bản quyền */}
        <div className="w-full border-t border-green-300 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} ECO GREEN. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;