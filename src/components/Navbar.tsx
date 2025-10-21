// Component Navbar với navigation động
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from './Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClasses = (path) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-blue-100 text-blue-700";
    const inactiveClasses = "text-gray-600 hover:text-gray-800 hover:bg-gray-100";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-gray-800">ECO App</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClasses('/')}>
              Trang chủ
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={linkClasses('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/profile" className={linkClasses('/profile')}>
                  Hồ sơ
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    Xin chào, {user?.name || user?.email}
                  </span>
                  <Button 
                    variant="secondary" 
                    onClick={handleLogout}
                    className="text-sm py-1 px-3"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClasses('/login')}>
                  Đăng nhập
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="ml-2">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (có thể mở rộng sau) */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-gray-800">
            Trang chủ
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-gray-800">
                Dashboard
              </Link>
              <Link to="/profile" className="block px-3 py-2 text-gray-600 hover:text-gray-800">
                Hồ sơ
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-gray-600 hover:text-gray-800">
                Đăng nhập
              </Link>
              <Link to="/register" className="block px-3 py-2 text-gray-600 hover:text-gray-800">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
