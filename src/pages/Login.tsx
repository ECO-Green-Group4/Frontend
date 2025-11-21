// Trang đăng nhập
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck';
import { isStaff } from '@/utils/staffCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import ecoLogo from '@/assets/logo/eco_green.png';

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config?: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Lấy redirect path từ state hoặc mặc định về trang chủ
  const from = location.state?.from?.pathname || '/';

  // Kiểm tra nếu có message từ reset password
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Xóa message sau 5 giây
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Google OAuth Client ID
  const GOOGLE_CLIENT_ID = '614758931877-ea5s7e905dsooe6qbdg0j9p8lcsfc4qk.apps.googleusercontent.com';

  // Xử lý response từ Google
  const handleGoogleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setErrors({ general: 'Không thể lấy thông tin từ Google' });
      return;
    }

    setLoading(true);
    try {
      const authResponse = await googleLogin(response.credential);
      
      // Debug: Log user info để kiểm tra role
      console.log('Google login response user:', authResponse.user);
      console.log('Role check - isAdmin:', isAdmin(authResponse.user), 'isStaff:', isStaff(authResponse.user));
      
      // Kiểm tra và redirect dựa trên role của user
      if (isAdmin(authResponse.user)) {
        // Admin - redirect đến admin dashboard
        console.log('Redirecting to admin dashboard');
        navigate('/admin', { replace: true });
      } else if (isStaff(authResponse.user)) {
        // Staff - redirect đến staff dashboard
        console.log('Redirecting to staff dashboard');
        navigate('/staff/orders', { replace: true });
      } else {
        // User thường - redirect về trang trước đó hoặc trang chủ
        console.log('Redirecting to home/user page');
        navigate(from === '/admin' || from === '/staff' ? '/' : from, { replace: true });
      }
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Đăng nhập với Google thất bại. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate, from]);

  // Khởi tạo Google Identity Services
  useEffect(() => {
    // Đợi Google script load xong
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          }
        );
      }
    };

    // Kiểm tra xem Google script đã load chưa
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Nếu chưa load, đợi event
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup sau 10 giây
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }

    return () => {
      // Cleanup
    };
  }, [handleGoogleCredentialResponse]);

  const validationRules = {
    email: [VALIDATION_RULES.EMAIL.REQUIRED],
    password: [VALIDATION_RULES.PASSWORD.REQUIRED]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      
      // Debug: Log user info để kiểm tra role
      console.log('Login response user:', response.user);
      console.log('Role check - isAdmin:', isAdmin(response.user), 'isStaff:', isStaff(response.user));
      
      // Kiểm tra và redirect dựa trên role của user
      if (isAdmin(response.user)) {
        // Admin - redirect đến admin dashboard
        console.log('Redirecting to admin dashboard');
        navigate('/admin', { replace: true });
      } else if (isStaff(response.user)) {
        // Staff - redirect đến staff dashboard
        console.log('Redirecting to staff dashboard');
        navigate('/staff/orders', { replace: true });
      } else {
        // User thường - redirect về trang trước đó hoặc trang chủ
        console.log('Redirecting to home/user page');
        navigate(from === '/admin' || from === '/staff' ? '/' : from, { replace: true });
      }
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Không cần function này nữa vì Google button tự xử lý

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center space-x-3">
        <img 
          src={ecoLogo} 
          alt="EcoGreen Logo" 
          className="w-10 h-10 object-contain"
        />
        <span className="text-4xl font-bold text-green-500">EcoGreen</span>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-green-500 mb-8">
            Log in
          </h1>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address, phone or username"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 text-base ${
                  errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-green-500 hover:text-green-600 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-12 text-base pr-10 ${
                    errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Sign in'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link 
              to="/register" 
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link 
          to="/terms" 
          className="text-sm text-green-500 hover:text-green-600"
        >
          Terms of Service and Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Login;