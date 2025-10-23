// Trang 404 - Not Found
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Trang không tồn tại
          </h2>
          <p className="text-gray-500 mb-8">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button variant="primary" className="w-full">
              Về trang chủ
            </Button>
          </Link>
          
          <Link to="/admin">
            <Button variant="secondary" className="w-full">
              Đến Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>Hoặc bạn có thể:</p>
          <ul className="mt-2 space-y-1">
            <li>Kiểm tra lại URL</li>
            <li>Sử dụng menu điều hướng</li>
            <li>Liên hệ hỗ trợ nếu cần thiết</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
